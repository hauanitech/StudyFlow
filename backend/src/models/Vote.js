import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel',
    },
    targetModel: {
      type: String,
      enum: ['Question', 'Answer'],
      required: true,
    },
    value: {
      type: Number,
      enum: [-1, 1],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one vote per user per target
voteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
voteSchema.index({ targetType: 1, targetId: 1 });

// Static methods
voteSchema.statics.findUserVote = async function (userId, targetType, targetId) {
  return this.findOne({ user: userId, targetType, targetId });
};

voteSchema.statics.castVote = async function (
  userId,
  targetType,
  targetId,
  value
) {
  const targetModel = targetType === 'question' ? 'Question' : 'Answer';
  const existingVote = await this.findOne({
    user: userId,
    targetType,
    targetId,
  });

  let scoreDelta = 0;

  if (existingVote) {
    if (existingVote.value === value) {
      // Same vote - remove it (toggle off)
      await existingVote.deleteOne();
      scoreDelta = -value;
      return { action: 'removed', scoreDelta };
    } else {
      // Different vote - change it
      existingVote.value = value;
      await existingVote.save();
      scoreDelta = value * 2; // From -1 to +1 = +2, or +1 to -1 = -2
      return { action: 'changed', scoreDelta };
    }
  } else {
    // New vote
    await this.create({
      user: userId,
      targetType,
      targetId,
      targetModel,
      value,
    });
    scoreDelta = value;
    return { action: 'created', scoreDelta };
  }
};

voteSchema.statics.getUserVotesForTargets = async function (
  userId,
  targetType,
  targetIds
) {
  const votes = await this.find({
    user: userId,
    targetType,
    targetId: { $in: targetIds },
  }).lean();

  const voteMap = {};
  for (const vote of votes) {
    voteMap[vote.targetId.toString()] = vote.value;
  }
  return voteMap;
};

voteSchema.statics.deleteVotesForTarget = async function (targetType, targetId) {
  return this.deleteMany({ targetType, targetId });
};

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
