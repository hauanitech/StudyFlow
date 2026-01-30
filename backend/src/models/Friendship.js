import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  // Always store userA < userB (by string comparison) to ensure uniqueness
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Track how the friendship was formed
  originRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FriendRequest',
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate friendships
friendshipSchema.index({ userA: 1, userB: 1 }, { unique: true });

// Pre-save middleware to ensure userA < userB ordering
friendshipSchema.pre('save', function(next) {
  if (this.userA.toString() > this.userB.toString()) {
    [this.userA, this.userB] = [this.userB, this.userA];
  }
  next();
});

// Static method to create a friendship with proper ordering
friendshipSchema.statics.createFriendship = async function(userId1, userId2, requestId = null) {
  const [userA, userB] = userId1.toString() < userId2.toString() 
    ? [userId1, userId2] 
    : [userId2, userId1];
  
  return this.create({
    userA,
    userB,
    originRequestId: requestId,
  });
};

// Static method to check if two users are friends
friendshipSchema.statics.areFriends = async function(userId1, userId2) {
  const [userA, userB] = userId1.toString() < userId2.toString() 
    ? [userId1, userId2] 
    : [userId2, userId1];
  
  const friendship = await this.findOne({ userA, userB });
  return !!friendship;
};

// Static method to remove friendship
friendshipSchema.statics.removeFriendship = async function(userId1, userId2) {
  const [userA, userB] = userId1.toString() < userId2.toString() 
    ? [userId1, userId2] 
    : [userId2, userId1];
  
  return this.deleteOne({ userA, userB });
};

const Friendship = mongoose.model('Friendship', friendshipSchema);

export default Friendship;
