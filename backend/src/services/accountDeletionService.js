/**
 * Account Deletion Service
 * Handles user account deletion with proper data cleanup/anonymization
 */

import User from '../models/User.js';
import Profile from '../models/Profile.js';
import JournalEntry from '../models/JournalEntry.js';
import mongoose from 'mongoose';

/**
 * Delete user account and all associated data
 * 
 * Rules:
 * - User record: deleted
 * - Profile: deleted
 * - Journal entries: deleted (private data)
 * - Friend requests: deleted
 * - Friendships: deleted
 * - Chat messages: anonymized (replace userId with 'deleted-user')
 * - Q&A questions/answers: anonymized (keep content, remove user link)
 */
export async function deleteAccount(userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Delete user record
    const user = await User.findByIdAndDelete(userObjectId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Delete profile
    await Profile.deleteOne({ userId: userObjectId }).session(session);

    // 3. Delete journal entries (private data)
    await JournalEntry.deleteMany({ userId: userObjectId }).session(session);

    // 4. Delete friend requests (both sent and received)
    // These models may not exist yet, so we use optional collection checks
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('friendrequests')) {
      await db.collection('friendrequests').deleteMany({
        $or: [
          { fromUserId: userObjectId },
          { toUserId: userObjectId }
        ]
      }, { session });
    }

    // 5. Delete friendships
    if (collectionNames.includes('friendships')) {
      await db.collection('friendships').deleteMany({
        $or: [
          { userA: userObjectId },
          { userB: userObjectId }
        ]
      }, { session });
    }

    // 6. Anonymize chat messages (keep messages, remove user reference)
    if (collectionNames.includes('messages')) {
      await db.collection('messages').updateMany(
        { senderId: userObjectId },
        { 
          $set: { 
            senderId: null,
            senderDeleted: true 
          } 
        },
        { session }
      );
    }

    // 7. Anonymize Q&A content
    if (collectionNames.includes('questions')) {
      await db.collection('questions').updateMany(
        { authorId: userObjectId },
        { 
          $set: { 
            authorId: null,
            authorDeleted: true 
          } 
        },
        { session }
      );
    }

    if (collectionNames.includes('answers')) {
      await db.collection('answers').updateMany(
        { authorId: userObjectId },
        { 
          $set: { 
            authorId: null,
            authorDeleted: true 
          } 
        },
        { session }
      );
    }

    await session.commitTransaction();
    
    return { 
      success: true, 
      deletedUsername: user.username,
      message: 'Account and associated data deleted successfully' 
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get deletion preview - shows what will be deleted/anonymized
 */
export async function getDeletionPreview(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  const journalCount = await JournalEntry.countDocuments({ userId: userObjectId });
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  let friendRequestCount = 0;
  let friendshipCount = 0;
  let messageCount = 0;
  let questionCount = 0;
  let answerCount = 0;

  if (collectionNames.includes('friendrequests')) {
    friendRequestCount = await db.collection('friendrequests').countDocuments({
      $or: [{ fromUserId: userObjectId }, { toUserId: userObjectId }]
    });
  }

  if (collectionNames.includes('friendships')) {
    friendshipCount = await db.collection('friendships').countDocuments({
      $or: [{ userA: userObjectId }, { userB: userObjectId }]
    });
  }

  if (collectionNames.includes('messages')) {
    messageCount = await db.collection('messages').countDocuments({ senderId: userObjectId });
  }

  if (collectionNames.includes('questions')) {
    questionCount = await db.collection('questions').countDocuments({ authorId: userObjectId });
  }

  if (collectionNames.includes('answers')) {
    answerCount = await db.collection('answers').countDocuments({ authorId: userObjectId });
  }

  return {
    willBeDeleted: {
      profile: true,
      journalEntries: journalCount,
      friendRequests: friendRequestCount,
      friendships: friendshipCount,
    },
    willBeAnonymized: {
      chatMessages: messageCount,
      questions: questionCount,
      answers: answerCount,
    },
    warning: 'This action cannot be undone. All your private data will be permanently deleted.',
  };
}

export default {
  deleteAccount,
  getDeletionPreview,
};
