/**
 * Audio configuration for the Pomodoro timer
 * Contains all available sound options for different timer phases
 */

// Available sounds with their display names and file paths
export const AVAILABLE_SOUNDS = {
  // Simple beep sounds (generated via Web Audio API)
  default: {
    id: 'default',
    name: 'Default Beep',
    description: 'Simple notification beep',
    type: 'generated', // Uses Web Audio API
    requiresAuth: false,
  },
  
  // Premium sounds (require authentication)
  chime: {
    id: 'chime',
    name: 'Gentle Chime',
    description: 'Soft, calming chime sound',
    type: 'file',
    path: '/sounds/chime.mp3',
    requiresAuth: true,
  },
  bell: {
    id: 'bell',
    name: 'Bell',
    description: 'Classic bell notification',
    type: 'file',
    path: '/sounds/bell.mp3',
    requiresAuth: true,
  },
  gong: {
    id: 'gong',
    name: 'Meditation Gong',
    description: 'Deep, resonant gong for mindfulness',
    type: 'file',
    path: '/sounds/gong.mp3',
    requiresAuth: true,
  },
  birds: {
    id: 'birds',
    name: 'Bird Chirp',
    description: 'Pleasant bird sounds',
    type: 'file',
    path: '/sounds/birds.mp3',
    requiresAuth: true,
  },
  piano: {
    id: 'piano',
    name: 'Piano Note',
    description: 'Elegant piano chord',
    type: 'file',
    path: '/sounds/piano.mp3',
    requiresAuth: true,
  },
  digital: {
    id: 'digital',
    name: 'Digital Alarm',
    description: 'Modern digital notification',
    type: 'file',
    path: '/sounds/digital.mp3',
    requiresAuth: true,
  },
  
  // No sound option
  none: {
    id: 'none',
    name: 'No Sound',
    description: 'Silent - no notification sound',
    type: 'none',
    requiresAuth: false,
  },
};

// Default sound settings for each phase
export const DEFAULT_SOUND_SETTINGS = {
  workEndSound: 'default',
  shortBreakEndSound: 'default',
  longBreakEndSound: 'default',
  volume: 0.5,
};

// Phase types for audio configuration
export const SOUND_PHASES = {
  work: {
    key: 'workEndSound',
    label: 'Focus Session End',
    description: 'Sound when focus time completes',
  },
  shortBreak: {
    key: 'shortBreakEndSound',
    label: 'Short Break End',
    description: 'Sound when short break completes',
  },
  longBreak: {
    key: 'longBreakEndSound',
    label: 'Long Break End',
    description: 'Sound when long break completes',
  },
};

// Get sounds available to a user based on authentication status
export function getAvailableSounds(isAuthenticated) {
  return Object.values(AVAILABLE_SOUNDS).filter(
    (sound) => !sound.requiresAuth || isAuthenticated
  );
}

// Check if a specific sound is available to user
export function isSoundAvailable(soundId, isAuthenticated) {
  const sound = AVAILABLE_SOUNDS[soundId];
  if (!sound) return false;
  return !sound.requiresAuth || isAuthenticated;
}

// Get sound by ID with fallback to default
export function getSoundById(soundId, isAuthenticated) {
  const sound = AVAILABLE_SOUNDS[soundId];
  if (!sound || (sound.requiresAuth && !isAuthenticated)) {
    return AVAILABLE_SOUNDS.default;
  }
  return sound;
}
