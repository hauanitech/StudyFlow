import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Flag for when sender deletes account
  senderDeleted: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
    required: true,
    maxLength: 5000,
  },
  type: {
    type: String,
    enum: ['text', 'system'],
    default: 'text',
  },
  // For system messages (user joined, left, etc.)
  systemAction: {
    type: String,
    enum: ['joined', 'left', 'created', 'renamed'],
  },
  // Edit history
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

// Index for fetching chat messages with pagination
messageSchema.index({ chatId: 1, createdAt: -1 });

// Index for searching messages
messageSchema.index({ chatId: 1, content: 'text' });

// Virtual for display name when sender deleted
messageSchema.virtual('senderDisplayName').get(function() {
  if (this.senderDeleted) {
    return '[Deleted User]';
  }
  return undefined;
});

// Static method to get messages with pagination
messageSchema.statics.getMessages = async function(chatId, options = {}) {
  const { limit = 50, before, after } = options;
  
  const query = { chatId, isDeleted: false };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  } else if (after) {
    query.createdAt = { $gt: new Date(after) };
  }

  const messages = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('senderId', 'username')
    .lean();

  // Return in chronological order
  return messages.reverse();
};

// Static method to create a system message
messageSchema.statics.createSystemMessage = async function(chatId, action, userId = null) {
  const actionTexts = {
    joined: 'joined the chat',
    left: 'left the chat',
    created: 'created the chat',
    renamed: 'renamed the chat',
  };

  return this.create({
    chatId,
    senderId: userId,
    content: actionTexts[action] || action,
    type: 'system',
    systemAction: action,
  });
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
