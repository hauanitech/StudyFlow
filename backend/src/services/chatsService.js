/**
 * Chats Service
 * Handles chat creation, membership, and message management
 */

import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import ChatMembership from '../models/ChatMembership.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Friendship from '../models/Friendship.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Get or create a direct chat between two users
 */
export async function getOrCreateDirectChat(userId, otherUserId) {
  // Verify the other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    throw new AppError(404, 'User not found');
  }

  // Verify they are friends
  const areFriends = await Friendship.areFriends(userId, otherUserId);
  if (!areFriends) {
    throw new AppError(403, 'You can only chat with friends');
  }

  // Find or create the chat
  const chat = await Chat.findOrCreateDirectChat(userId, otherUserId);

  // Ensure memberships exist
  await Promise.all([
    ChatMembership.addMember(chat._id, userId, 'member'),
    ChatMembership.addMember(chat._id, otherUserId, 'member'),
  ]);

  return chat;
}

/**
 * Create a group chat
 */
export async function createGroupChat(creatorId, name, memberIds) {
  if (!name || name.trim().length === 0) {
    throw new AppError(400, 'Group name is required');
  }

  if (!memberIds || memberIds.length === 0) {
    throw new AppError(400, 'At least one member is required');
  }

  // Verify all members are friends with creator
  for (const memberId of memberIds) {
    if (memberId.toString() === creatorId.toString()) continue;
    
    const areFriends = await Friendship.areFriends(creatorId, memberId);
    if (!areFriends) {
      throw new AppError(403, 'You can only add friends to group chats');
    }
  }

  // Create the chat
  const allParticipants = [creatorId, ...memberIds.filter(id => id.toString() !== creatorId.toString())];
  
  const chat = await Chat.create({
    type: 'group',
    name: name.trim(),
    creatorId,
    participants: allParticipants,
  });

  // Create memberships
  await Promise.all([
    ChatMembership.addMember(chat._id, creatorId, 'owner'),
    ...memberIds.filter(id => id.toString() !== creatorId.toString())
      .map(memberId => ChatMembership.addMember(chat._id, memberId, 'member')),
  ]);

  // Create system message
  await Message.createSystemMessage(chat._id, 'created', creatorId);

  return chat;
}

/**
 * Get user's chats with metadata
 */
export async function getUserChats(userId) {
  const chats = await Chat.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .lean();

  // Get memberships for unread tracking
  const memberships = await ChatMembership.find({
    chatId: { $in: chats.map(c => c._id) },
    userId,
  }).lean();

  const membershipMap = new Map(memberships.map(m => [m.chatId.toString(), m]));

  // Enrich chat data
  const enrichedChats = await Promise.all(chats.map(async (chat) => {
    const membership = membershipMap.get(chat._id.toString());
    
    // Get participant info
    const participantIds = chat.participants.filter(p => p.toString() !== userId.toString());
    const participants = await User.find({ _id: { $in: participantIds } })
      .select('username')
      .lean();

    // Get profiles for participants
    const profiles = await Profile.find({ userId: { $in: participantIds } })
      .select('userId displayName avatarUrl')
      .lean();

    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const enrichedParticipants = participants.map(p => ({
      id: p._id,
      username: p.username,
      displayName: profileMap.get(p._id.toString())?.displayName,
      avatarUrl: profileMap.get(p._id.toString())?.avatarUrl,
    }));

    // Count unread messages
    let unreadCount = 0;
    if (membership?.lastReadAt) {
      unreadCount = await Message.countDocuments({
        chatId: chat._id,
        createdAt: { $gt: membership.lastReadAt },
        senderId: { $ne: userId },
        isDeleted: false,
      });
    }

    return {
      id: chat._id,
      type: chat.type,
      name: chat.type === 'group' ? chat.name : null,
      participants: enrichedParticipants,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      unreadCount,
      isMuted: membership?.isMuted || false,
    };
  }));

  return enrichedChats;
}

/**
 * Get chat by ID with membership check
 */
export async function getChat(chatId, userId) {
  const chat = await Chat.findById(chatId).lean();
  
  if (!chat) {
    throw new AppError(404, 'Chat not found');
  }

  const isMember = await ChatMembership.isMember(chatId, userId);
  if (!isMember) {
    throw new AppError(403, 'You are not a member of this chat');
  }

  return chat;
}

/**
 * Get chat messages
 */
export async function getChatMessages(chatId, userId, options = {}) {
  // Verify membership
  const isMember = await ChatMembership.isMember(chatId, userId);
  if (!isMember) {
    throw new AppError(403, 'You are not a member of this chat');
  }

  const messages = await Message.getMessages(chatId, options);

  // Mark as read
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    await ChatMembership.updateLastRead(chatId, userId, lastMessage._id);
  }

  return messages.map(m => ({
    id: m._id,
    chatId: m.chatId,
    sender: m.senderDeleted ? { username: '[Deleted User]' } : {
      id: m.senderId?._id,
      username: m.senderId?.username,
    },
    content: m.content,
    type: m.type,
    systemAction: m.systemAction,
    isEdited: m.isEdited,
    createdAt: m.createdAt,
  }));
}

/**
 * Send a message
 */
export async function sendMessage(chatId, userId, content) {
  // Verify membership
  const isMember = await ChatMembership.isMember(chatId, userId);
  if (!isMember) {
    throw new AppError(403, 'You are not a member of this chat');
  }

  if (!content || content.trim().length === 0) {
    throw new AppError(400, 'Message content is required');
  }

  const message = await Message.create({
    chatId,
    senderId: userId,
    content: content.trim(),
    type: 'text',
  });

  // Update chat's last message
  await Chat.findByIdAndUpdate(chatId, {
    lastMessageAt: message.createdAt,
    lastMessage: {
      content: message.content.substring(0, 100),
      senderId: userId,
      sentAt: message.createdAt,
    },
  });

  // Populate sender info
  const sender = await User.findById(userId).select('username').lean();

  return {
    id: message._id,
    chatId: message.chatId,
    sender: {
      id: userId,
      username: sender?.username,
    },
    content: message.content,
    type: message.type,
    createdAt: message.createdAt,
  };
}

/**
 * Leave a group chat
 */
export async function leaveChat(chatId, userId) {
  const chat = await Chat.findById(chatId);
  
  if (!chat) {
    throw new AppError(404, 'Chat not found');
  }

  if (chat.type !== 'group') {
    throw new AppError(400, 'Cannot leave a direct chat');
  }

  const membership = await ChatMembership.findOne({ chatId, userId });
  if (!membership) {
    throw new AppError(403, 'You are not a member of this chat');
  }

  // Remove from participants array
  await Chat.findByIdAndUpdate(chatId, {
    $pull: { participants: userId }
  });

  // Remove membership
  await ChatMembership.removeMember(chatId, userId);

  // Create system message
  await Message.createSystemMessage(chatId, 'left', userId);

  return { success: true };
}

/**
 * Add member to group chat
 */
export async function addMemberToChat(chatId, userId, newMemberId) {
  const chat = await Chat.findById(chatId);
  
  if (!chat) {
    throw new AppError(404, 'Chat not found');
  }

  if (chat.type !== 'group') {
    throw new AppError(400, 'Cannot add members to a direct chat');
  }

  // Check if requester is member
  const requesterMembership = await ChatMembership.findOne({ chatId, userId });
  if (!requesterMembership) {
    throw new AppError(403, 'You are not a member of this chat');
  }

  // Check if new member is friend with requester
  const areFriends = await Friendship.areFriends(userId, newMemberId);
  if (!areFriends) {
    throw new AppError(403, 'You can only add friends to group chats');
  }

  // Add to participants
  await Chat.findByIdAndUpdate(chatId, {
    $addToSet: { participants: newMemberId }
  });

  // Add membership
  await ChatMembership.addMember(chatId, newMemberId, 'member');

  // Create system message
  await Message.createSystemMessage(chatId, 'joined', newMemberId);

  return { success: true };
}

export default {
  getOrCreateDirectChat,
  createGroupChat,
  getUserChats,
  getChat,
  getChatMessages,
  sendMessage,
  leaveChat,
  addMemberToChat,
};
