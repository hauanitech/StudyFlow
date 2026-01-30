import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  message: {
    type: String,
    maxLength: 200,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate requests
friendRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Index for finding requests by user
friendRequestSchema.index({ toUserId: 1, status: 1 });

// Static method to check if a request exists
friendRequestSchema.statics.exists = async function(fromUserId, toUserId) {
  const request = await this.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId }
    ],
    status: 'pending'
  });
  return !!request;
};

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;
