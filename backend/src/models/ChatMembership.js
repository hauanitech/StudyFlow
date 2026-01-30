import mongoose from 'mongoose';

const chatMembershipSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  },
  // For tracking unread messages
  lastReadMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  // Mute notifications
  isMuted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate memberships
chatMembershipSchema.index({ chatId: 1, userId: 1 }, { unique: true });

// Static method to check if user is member of chat
chatMembershipSchema.statics.isMember = async function(chatId, userId) {
  const membership = await this.findOne({ chatId, userId });
  return !!membership;
};

// Static method to get member's role
chatMembershipSchema.statics.getMemberRole = async function(chatId, userId) {
  const membership = await this.findOne({ chatId, userId });
  return membership?.role;
};

// Static method to add member
chatMembershipSchema.statics.addMember = async function(chatId, userId, role = 'member') {
  return this.findOneAndUpdate(
    { chatId, userId },
    { $setOnInsert: { chatId, userId, role, joinedAt: new Date() } },
    { upsert: true, new: true }
  );
};

// Static method to remove member
chatMembershipSchema.statics.removeMember = async function(chatId, userId) {
  return this.deleteOne({ chatId, userId });
};

// Static method to update last read
chatMembershipSchema.statics.updateLastRead = async function(chatId, userId, messageId = null) {
  const update = { lastReadAt: new Date() };
  if (messageId) {
    update.lastReadMessageId = messageId;
  }
  return this.findOneAndUpdate({ chatId, userId }, update);
};

const ChatMembership = mongoose.model('ChatMembership', chatMembershipSchema);

export default ChatMembership;
