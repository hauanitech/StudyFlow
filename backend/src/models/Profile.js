import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    studyGoals: {
      type: String,
      trim: true,
      maxlength: [200, 'Study goals cannot exceed 200 characters'],
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    pomodoroPreferences: {
      workDuration: {
        type: Number,
        min: 1,
        max: 120,
        default: 25,
      },
      shortBreakDuration: {
        type: Number,
        min: 1,
        max: 30,
        default: 5,
      },
      longBreakDuration: {
        type: Number,
        min: 1,
        max: 60,
        default: 15,
      },
      sessionsBeforeLongBreak: {
        type: Number,
        min: 1,
        max: 10,
        default: 4,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Note: userId already has an index via unique: true
profileSchema.index({ visibility: 1 });

// Transform output
profileSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
