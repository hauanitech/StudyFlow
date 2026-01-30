/**
 * Friends Service
 * Handles friend requests and friendships
 */

import mongoose from 'mongoose';
import FriendRequest from '../models/FriendRequest.js';
import Friendship from '../models/Friendship.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Check if two users are friends
 */
export async function isFriend(userId1, userId2) {
  return Friendship.areFriends(userId1, userId2);
}

/**
 * Get friend IDs for a user
 */
export async function getFriendIds(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  const friendships = await Friendship.find({
    $or: [
      { userA: userObjectId },
      { userB: userObjectId }
    ]
  });

  return friendships.map(f => 
    f.userA.toString() === userId.toString() ? f.userB : f.userA
  );
}

/**
 * Send friend request
 */
export async function sendFriendRequest(fromUserId, toUserId, message = '') {
  // Can't friend yourself
  if (fromUserId.toString() === toUserId.toString()) {
    throw new AppError(400, 'Cannot send friend request to yourself');
  }

  // Check if already friends
  const alreadyFriends = await Friendship.areFriends(fromUserId, toUserId);
  if (alreadyFriends) {
    throw new AppError(400, 'Already friends with this user');
  }

  // Check if request already exists (in either direction)
  const existingRequest = await FriendRequest.findOne({
    $or: [
      { fromUserId, toUserId, status: 'pending' },
      { fromUserId: toUserId, toUserId: fromUserId, status: 'pending' }
    ]
  });

  if (existingRequest) {
    // If the other user already sent us a request, auto-accept it
    if (existingRequest.fromUserId.toString() === toUserId.toString()) {
      return acceptFriendRequest(existingRequest._id, fromUserId);
    }
    throw new AppError(400, 'Friend request already sent');
  }

  // Check if target user exists
  const targetUser = await User.findById(toUserId);
  if (!targetUser) {
    throw new AppError(404, 'User not found');
  }

  const request = await FriendRequest.create({
    fromUserId,
    toUserId,
    message,
  });

  return request;
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(requestId, userId) {
  const request = await FriendRequest.findById(requestId);
  
  if (!request) {
    throw new AppError(404, 'Friend request not found');
  }

  if (request.toUserId.toString() !== userId.toString()) {
    throw new AppError(403, 'Not authorized to accept this request');
  }

  if (request.status !== 'pending') {
    throw new AppError(400, 'Request is no longer pending');
  }

  // Create friendship
  const friendship = await Friendship.createFriendship(
    request.fromUserId,
    request.toUserId,
    request._id
  );

  // Update request status
  request.status = 'accepted';
  await request.save();

  return { request, friendship };
}

/**
 * Decline friend request
 */
export async function declineFriendRequest(requestId, userId) {
  const request = await FriendRequest.findById(requestId);
  
  if (!request) {
    throw new AppError(404, 'Friend request not found');
  }

  if (request.toUserId.toString() !== userId.toString()) {
    throw new AppError(403, 'Not authorized to decline this request');
  }

  if (request.status !== 'pending') {
    throw new AppError(400, 'Request is no longer pending');
  }

  request.status = 'declined';
  await request.save();

  return request;
}

/**
 * Cancel sent friend request
 */
export async function cancelFriendRequest(requestId, userId) {
  const request = await FriendRequest.findById(requestId);
  
  if (!request) {
    throw new AppError(404, 'Friend request not found');
  }

  if (request.fromUserId.toString() !== userId.toString()) {
    throw new AppError(403, 'Not authorized to cancel this request');
  }

  if (request.status !== 'pending') {
    throw new AppError(400, 'Request is no longer pending');
  }

  await FriendRequest.deleteOne({ _id: requestId });
  return { cancelled: true };
}

/**
 * Remove friendship
 */
export async function removeFriend(userId, friendId) {
  const areFriends = await Friendship.areFriends(userId, friendId);
  
  if (!areFriends) {
    throw new AppError(400, 'Not friends with this user');
  }

  await Friendship.removeFriendship(userId, friendId);
  return { removed: true };
}

/**
 * Get pending friend requests for a user
 */
export async function getPendingRequests(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Received requests
  const received = await FriendRequest.find({
    toUserId: userObjectId,
    status: 'pending'
  }).populate({
    path: 'fromUserId',
    select: 'username',
  }).sort({ createdAt: -1 });

  // Sent requests
  const sent = await FriendRequest.find({
    fromUserId: userObjectId,
    status: 'pending'
  }).populate({
    path: 'toUserId',
    select: 'username',
  }).sort({ createdAt: -1 });

  // Get profiles for received requests
  const receivedWithProfiles = await Promise.all(
    received.map(async (req) => {
      const profile = await Profile.findOne({ userId: req.fromUserId._id })
        .select('displayName avatarUrl')
        .lean();
      return {
        id: req._id,
        from: {
          id: req.fromUserId._id,
          username: req.fromUserId.username,
          displayName: profile?.displayName,
          avatarUrl: profile?.avatarUrl,
        },
        message: req.message,
        createdAt: req.createdAt,
      };
    })
  );

  // Get profiles for sent requests
  const sentWithProfiles = await Promise.all(
    sent.map(async (req) => {
      const profile = await Profile.findOne({ userId: req.toUserId._id })
        .select('displayName avatarUrl')
        .lean();
      return {
        id: req._id,
        to: {
          id: req.toUserId._id,
          username: req.toUserId.username,
          displayName: profile?.displayName,
          avatarUrl: profile?.avatarUrl,
        },
        message: req.message,
        createdAt: req.createdAt,
      };
    })
  );

  return { 
    received: receivedWithProfiles, 
    sent: sentWithProfiles 
  };
}

/**
 * Get friends list for a user
 */
export async function getFriends(userId) {
  const friendIds = await getFriendIds(userId);
  
  if (friendIds.length === 0) {
    return [];
  }

  const friends = await User.find({ _id: { $in: friendIds } })
    .select('username')
    .lean();

  // Get profiles for friends
  const friendsWithProfiles = await Promise.all(
    friends.map(async (friend) => {
      const profile = await Profile.findOne({ userId: friend._id })
        .select('displayName avatarUrl bio')
        .lean();
      return {
        id: friend._id,
        username: friend.username,
        displayName: profile?.displayName,
        avatarUrl: profile?.avatarUrl,
        bio: profile?.bio,
      };
    })
  );

  return friendsWithProfiles;
}

/**
 * Search users to add as friends
 */
export async function searchUsers(query, currentUserId, limit = 10) {
  const users = await User.find({
    _id: { $ne: currentUserId },
    username: { $regex: query, $options: 'i' }
  })
    .select('username')
    .limit(limit)
    .lean();

  // Get profiles and friendship status
  const results = await Promise.all(
    users.map(async (user) => {
      const profile = await Profile.findOne({ userId: user._id })
        .select('displayName avatarUrl visibility')
        .lean();

      // Skip private profiles
      if (profile?.visibility === 'private') {
        return null;
      }

      const areFriends = await Friendship.areFriends(currentUserId, user._id);
      
      const pendingRequest = await FriendRequest.findOne({
        $or: [
          { fromUserId: currentUserId, toUserId: user._id, status: 'pending' },
          { fromUserId: user._id, toUserId: currentUserId, status: 'pending' }
        ]
      });

      return {
        id: user._id,
        username: user.username,
        displayName: profile?.displayName,
        avatarUrl: profile?.avatarUrl,
        isFriend: areFriends,
        hasPendingRequest: !!pendingRequest,
        pendingRequestDirection: pendingRequest 
          ? (pendingRequest.fromUserId.toString() === currentUserId.toString() ? 'sent' : 'received')
          : null,
      };
    })
  );

  return results.filter(Boolean);
}

export default {
  isFriend,
  getFriendIds,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getPendingRequests,
  getFriends,
  searchUsers,
};
