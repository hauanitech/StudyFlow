import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
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
    voteScore: {
      type: Number,
      default: 0,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ question: 1, voteScore: -1 });

// Static methods
answerSchema.statics.getAnswersForQuestion = async function (
  questionId,
  options = {}
) {
  const { sortBy = 'votes', page, limit = 50 } = options;

  let sort;
  switch (sortBy) {
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'votes':
    default:
      // Accepted answer first, then by votes
      sort = { isAccepted: -1, voteScore: -1, createdAt: -1 };
  }

  const query = { question: questionId, status: 'active' };
  
  // If pagination requested
  if (page && limit) {
    const skip = (page - 1) * limit;
    const [answers, total] = await Promise.all([
      this.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username')
        .lean(),
      this.countDocuments(query),
    ]);
    
    return {
      answers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  
  // No pagination
  return this.find(query)
    .sort(sort)
    .populate('author', 'username')
    .lean();
};

answerSchema.statics.updateVoteScore = async function (answerId, delta) {
  return this.findByIdAndUpdate(
    answerId,
    { $inc: { voteScore: delta } },
    { new: true }
  );
};

answerSchema.statics.setAccepted = async function (answerId, isAccepted) {
  return this.findByIdAndUpdate(answerId, { isAccepted }, { new: true });
};

answerSchema.statics.countByAuthor = async function (authorId) {
  return this.countDocuments({ author: authorId, status: 'active' });
};

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
