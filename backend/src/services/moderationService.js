import Report from '../models/Report.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';

export async function createReport(reporterId, data) {
  const { targetType, targetId, reason, description } = data;

  // Verify target exists
  let targetExists = false;

  switch (targetType) {
    case 'question':
      targetExists = await Question.exists({ _id: targetId });
      break;
    case 'answer':
      targetExists = await Answer.exists({ _id: targetId });
      break;
    case 'user':
      targetExists = await User.exists({ _id: targetId });
      break;
    default:
      throw new Error('Invalid target type');
  }

  if (!targetExists) {
    throw new Error('Target not found');
  }

  // Check if user already has a pending report for this target
  const hasExisting = await Report.hasUserReported(
    reporterId,
    targetType,
    targetId
  );
  if (hasExisting) {
    throw new Error('You have already reported this content');
  }

  // Spam prevention: Check recent report count (last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentReportCount = await Report.countDocuments({
    reporter: reporterId,
    createdAt: { $gte: oneHourAgo },
  });
  
  if (recentReportCount >= 5) {
    throw new Error('You have submitted too many reports. Please try again later.');
  }

  const report = await Report.create({
    reporter: reporterId,
    targetType,
    targetId,
    reason,
    description,
  });

  return report;
}

export async function getPendingReports(options = {}) {
  return Report.getPendingReports(options);
}

export async function getReportCounts() {
  return Report.getReportCounts();
}

export async function getReportById(reportId) {
  const report = await Report.findById(reportId)
    .populate('reporter', 'username')
    .populate('reviewedBy', 'username')
    .lean();

  if (!report) {
    return null;
  }

  // Fetch target content
  let targetContent = null;

  switch (report.targetType) {
    case 'question':
      targetContent = await Question.findById(report.targetId)
        .populate('author', 'username')
        .lean();
      break;
    case 'answer':
      targetContent = await Answer.findById(report.targetId)
        .populate('author', 'username')
        .populate('question', 'title')
        .lean();
      break;
    case 'user':
      targetContent = await User.findById(report.targetId)
        .select('username email createdAt')
        .lean();
      break;
  }

  return {
    ...report,
    targetContent,
  };
}

export async function resolveReport(reportId, moderatorId, resolution, notes) {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error('Report not found');
  }

  if (report.status !== 'pending') {
    throw new Error('Report has already been processed');
  }

  // Apply resolution action
  switch (resolution) {
    case 'content_removed':
      await removeReportedContent(report);
      break;
    case 'warning_issued':
      // In a real app, this would send a warning notification
      break;
    case 'user_banned':
      await banUser(report.targetType === 'user' ? report.targetId : null);
      break;
  }

  return Report.resolveReport(reportId, moderatorId, resolution, notes);
}

export async function dismissReport(reportId, moderatorId, notes) {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error('Report not found');
  }

  if (report.status !== 'pending') {
    throw new Error('Report has already been processed');
  }

  return Report.dismissReport(reportId, moderatorId, notes);
}

async function removeReportedContent(report) {
  switch (report.targetType) {
    case 'question':
      await Question.findByIdAndUpdate(report.targetId, { status: 'deleted' });
      // Also delete answers
      await Answer.updateMany(
        { question: report.targetId },
        { status: 'deleted' }
      );
      break;
    case 'answer':
      const answer = await Answer.findByIdAndUpdate(report.targetId, {
        status: 'deleted',
      });
      if (answer) {
        await Question.updateAnswerCount(answer.question, -1);
      }
      break;
  }
}

async function banUser(userId) {
  if (userId) {
    await User.findByIdAndUpdate(userId, { status: 'banned' });
  }
}

export async function getReportHistory(options = {}) {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) {
    filter.status = status;
  } else {
    filter.status = { $in: ['resolved', 'dismissed'] };
  }

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ reviewedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'username')
      .populate('reviewedBy', 'username')
      .lean(),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
