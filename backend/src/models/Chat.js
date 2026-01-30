import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
  },
  name: {
    type: String,
    maxLength: 100,
    // Required for group chats
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // For direct chats, store both user IDs for quick lookup
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  lastMessage: {
    content: String,
    senderId: mongoose.Schema.Types.ObjectId,
    sentAt: Date,
  },
}, {
  timestamps: true,
});

// Index for finding user's chats
chatSchema.index({ participants: 1, lastMessageAt: -1 });

// Index for finding direct chat between two users
chatSchema.index({ type: 1, participants: 1 });

// Static method to find or create direct chat between two users
chatSchema.statics.findOrCreateDirectChat = async function(userId1, userId2) {
  // Sort user IDs to ensure consistent lookup
  const participants = [userId1, userId2].sort((a, b) => 
    a.toString().localeCompare(b.toString())
  );

  let chat = await this.findOne({
    type: 'direct',
    participants: { $all: participants, $size: 2 }
  });

  if (!chat) {
    chat = await this.create({
      type: 'direct',
      creatorId: userId1,
      participants,
    });
  }

  return chat;
};

// Static method to get user's chats
chatSchema.statics.getUserChats = async function(userId) {
  return this.find({
    participants: userId
  })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'username')
    .lean();
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
