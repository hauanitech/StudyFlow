import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format for easy querying
      required: true,
    },
    content: {
      type: String,
      maxlength: [10000, 'Journal entry cannot exceed 10000 characters'],
      default: '',
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'bad', 'terrible', null],
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 30,
    }],
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one entry per user per date
journalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
journalEntrySchema.index({ userId: 1, createdAt: -1 });

// Calculate word count before save
journalEntrySchema.pre('save', function (next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).filter(Boolean).length;
  } else {
    this.wordCount = 0;
  }
  next();
});

// Transform output
journalEntrySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

export default JournalEntry;
