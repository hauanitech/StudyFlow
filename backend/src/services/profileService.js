/**
 * Profile Service
 * Handles profile fetching and updates
 */

import Profile from '../models/Profile.js';
import User from '../models/User.js';

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(userId) {
  const profile = await Profile.findOne({ userId }).lean();
  if (!profile) {
    return null;
  }
  return profile;
}

/**
 * Get public profile by username (only visible fields)
 */
export async function getPublicProfile(username) {
  const user = await User.findOne({ username }).select('_id username').lean();
  if (!user) {
    return null;
  }

  const profile = await Profile.findOne({ userId: user._id }).lean();
  if (!profile) {
    return null;
  }

  // Check visibility
  if (profile.visibility === 'private') {
    return null;
  }

  // Return only public fields
  return {
    userId: user._id,
    username: user.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    visibility: profile.visibility,
    stats: profile.visibility === 'public' ? profile.stats : undefined,
    createdAt: profile.createdAt,
  };
}

/**
 * Update profile
 */
export async function updateProfile(userId, updates) {
  const allowedFields = ['displayName', 'bio', 'avatarUrl', 'visibility', 'preferences'];
  
  const sanitizedUpdates = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  }

  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: sanitizedUpdates },
    { new: true, runValidators: true }
  );

  return profile;
}

/**
 * Update profile stats (internal use)
 */
export async function updateProfileStats(userId, statsUpdate) {
  const updateOps = {};
  
  if (statsUpdate.pomodoroCompleted) {
    updateOps['stats.pomodorosCompleted'] = statsUpdate.pomodoroCompleted;
  }
  if (statsUpdate.journalEntries) {
    updateOps['stats.journalEntries'] = statsUpdate.journalEntries;
  }
  if (statsUpdate.questionsAsked) {
    updateOps['stats.questionsAsked'] = statsUpdate.questionsAsked;
  }
  if (statsUpdate.answersGiven) {
    updateOps['stats.answersGiven'] = statsUpdate.answersGiven;
  }

  if (Object.keys(updateOps).length === 0) {
    return null;
  }

  return Profile.findOneAndUpdate(
    { userId },
    { $set: updateOps },
    { new: true }
  );
}

/**
 * Increment profile stat
 */
export async function incrementProfileStat(userId, statName, amount = 1) {
  const validStats = ['pomodorosCompleted', 'journalEntries', 'questionsAsked', 'answersGiven'];
  
  if (!validStats.includes(statName)) {
    throw new Error(`Invalid stat name: ${statName}`);
  }

  return Profile.findOneAndUpdate(
    { userId },
    { $inc: { [`stats.${statName}`]: amount } },
    { new: true }
  );
}

export default {
  getProfileByUserId,
  getPublicProfile,
  updateProfile,
  updateProfileStats,
  incrementProfileStat,
};
