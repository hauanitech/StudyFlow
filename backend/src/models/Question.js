import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 10000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    voteScore: {
      type: Number,
      default: 0,
    },
    answerCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'deleted'],
      default: 'open',
    },
    closedReason: {
      type: String,
      enum: ['duplicate', 'off-topic', 'unclear', 'resolved', null],
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ voteScore: -1, createdAt: -1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ status: 1 });

// Text index for search
questionSchema.index(
  { title: 'text', body: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, body: 1 } }
);

// Static methods
questionSchema.statics.search = async function (query, options = {}) {
  const { page = 1, limit = 20, tag, sortBy = 'newest' } = options;
  const skip = (page - 1) * limit;

  const filter = { status: { $ne: 'deleted' } };

  if (query) {
    filter.$text = { $search: query };
  }

  if (tag) {
    filter.tags = tag;
  }

  let sort;
  switch (sortBy) {
    case 'votes':
      sort = { voteScore: -1, createdAt: -1 };
      break;
    case 'unanswered':
      filter.answerCount = 0;
      sort = { createdAt: -1 };
      break;
    case 'active':
      sort = { updatedAt: -1 };
      break;
    case 'newest':
    default:
      sort = { createdAt: -1 };
  }

  const [questions, total] = await Promise.all([
    this.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username')
      .lean(),
    this.countDocuments(filter),
  ]);

  return {
    questions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

questionSchema.statics.incrementView = async function (questionId) {
  return this.findByIdAndUpdate(
    questionId,
    { $inc: { viewCount: 1 } },
    { new: true }
  );
};

questionSchema.statics.updateAnswerCount = async function (questionId, delta) {
  return this.findByIdAndUpdate(
    questionId,
    { $inc: { answerCount: delta } },
    { new: true }
  );
};

questionSchema.statics.updateVoteScore = async function (questionId, delta) {
  return this.findByIdAndUpdate(
    questionId,
    { $inc: { voteScore: delta } },
    { new: true }
  );
};

questionSchema.statics.getPopularTags = async function (limit = 20) {
  return this.aggregate([
    { $match: { status: { $ne: 'deleted' } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { tag: '$_id', count: 1, _id: 0 } },
  ]);
};

const Question = mongoose.model('Question', questionSchema);

export default Question;
