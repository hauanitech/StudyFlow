import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['question', 'answer', 'user', 'chat_message'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'hate_speech',
        'inappropriate',
        'misinformation',
        'copyright',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      type: String,
      enum: ['warning_issued', 'content_removed', 'user_banned', 'no_action', null],
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ reviewedBy: 1, reviewedAt: -1 });

// Prevent duplicate reports from same user for same target
reportSchema.index(
  { reporter: 1, targetType: 1, targetId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);

// Static methods
reportSchema.statics.getPendingReports = async function (options = {}) {
  const { page = 1, limit = 20, targetType } = options;
  const skip = (page - 1) * limit;

  const filter = { status: 'pending' };
  if (targetType) {
    filter.targetType = targetType;
  }

  const [reports, total] = await Promise.all([
    this.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'username')
      .lean(),
    this.countDocuments(filter),
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
};

reportSchema.statics.getReportCounts = async function () {
  const counts = await this.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: '$targetType', count: { $sum: 1 } } },
  ]);

  const result = {
    total: 0,
    byType: {},
  };

  for (const item of counts) {
    result.byType[item._id] = item.count;
    result.total += item.count;
  }

  return result;
};

reportSchema.statics.resolveReport = async function (
  reportId,
  moderatorId,
  resolution,
  notes
) {
  return this.findByIdAndUpdate(
    reportId,
    {
      status: 'resolved',
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
      resolution,
      resolutionNotes: notes,
    },
    { new: true }
  );
};

reportSchema.statics.dismissReport = async function (reportId, moderatorId, notes) {
  return this.findByIdAndUpdate(
    reportId,
    {
      status: 'dismissed',
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
      resolution: 'no_action',
      resolutionNotes: notes,
    },
    { new: true }
  );
};

reportSchema.statics.hasUserReported = async function (
  userId,
  targetType,
  targetId
) {
  const report = await this.findOne({
    reporter: userId,
    targetType,
    targetId,
    status: 'pending',
  });
  return !!report;
};

const Report = mongoose.model('Report', reportSchema);

export default Report;
