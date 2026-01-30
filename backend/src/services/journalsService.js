import JournalEntry from '../models/JournalEntry.js';

/**
 * Get all journal entries for a user
 * @param {string} userId
 * @param {Object} options - Pagination and filtering options
 */
export async function getEntries(userId, options = {}) {
  const { limit = 30, skip = 0, startDate, endDate } = options;
  
  const query = { userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  const entries = await JournalEntry.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await JournalEntry.countDocuments(query);
  
  return { entries, total };
}

/**
 * Get a single journal entry by date
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD format
 */
export async function getEntryByDate(userId, date) {
  return JournalEntry.findOne({ userId, date });
}

/**
 * Create or update a journal entry for a specific date
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD format
 * @param {Object} data - Entry data (content, mood, tags)
 */
export async function upsertEntry(userId, date, data) {
  const entry = await JournalEntry.findOneAndUpdate(
    { userId, date },
    {
      $set: {
        content: data.content,
        mood: data.mood,
        tags: data.tags,
      },
    },
    { 
      new: true, 
      upsert: true,
      runValidators: true,
    }
  );
  
  // Recalculate word count
  if (entry.content) {
    entry.wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;
    await entry.save();
  }
  
  return entry;
}

/**
 * Delete a journal entry
 * @param {string} userId
 * @param {string} date - YYYY-MM-DD format
 */
export async function deleteEntry(userId, date) {
  const result = await JournalEntry.findOneAndDelete({ userId, date });
  return !!result;
}

/**
 * Get journal statistics for a user
 * @param {string} userId
 */
export async function getStats(userId) {
  const [stats] = await JournalEntry.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalWords: { $sum: '$wordCount' },
        firstEntry: { $min: '$date' },
        lastEntry: { $max: '$date' },
      },
    },
  ]);
  
  // Get streak (consecutive days)
  const recentEntries = await JournalEntry.find({ userId })
    .sort({ date: -1 })
    .limit(100)
    .select('date');
    
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = today;
  
  for (const entry of recentEntries) {
    if (entry.date === checkDate) {
      streak++;
      // Move to previous day
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (entry.date < checkDate) {
      break;
    }
  }
  
  return {
    totalEntries: stats?.totalEntries || 0,
    totalWords: stats?.totalWords || 0,
    firstEntry: stats?.firstEntry || null,
    lastEntry: stats?.lastEntry || null,
    currentStreak: streak,
  };
}

// Need mongoose for ObjectId in aggregation
import mongoose from 'mongoose';

export default {
  getEntries,
  getEntryByDate,
  upsertEntry,
  deleteEntry,
  getStats,
};
