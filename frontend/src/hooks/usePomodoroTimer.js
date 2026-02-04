import { useState, useEffect, useCallback, useRef } from 'react';
import { usePomodoroAudio } from './usePomodoroAudio';
import { DEFAULT_SOUND_SETTINGS } from '../config/audioConfig';

const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

const PHASE_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  // Audio settings
  ...DEFAULT_SOUND_SETTINGS,
};

export function usePomodoroTimer(initialSettings = {}, isAuthenticated = false) {
  const settings = { ...DEFAULT_SETTINGS, ...initialSettings };
  
  const [state, setState] = useState(TIMER_STATES.IDLE);
  const [phase, setPhase] = useState(PHASE_TYPES.WORK);
  const [timeRemaining, setTimeRemaining] = useState(settings.workDuration * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentSettings, setCurrentSettings] = useState(settings);
  
  const intervalRef = useRef(null);
  const { playSoundForPhase, previewSound, cleanup } = usePomodoroAudio();

  // Get phase duration in seconds
  const getPhaseDuration = useCallback((phaseType) => {
    switch (phaseType) {
      case PHASE_TYPES.WORK:
        return currentSettings.workDuration * 60;
      case PHASE_TYPES.SHORT_BREAK:
        return currentSettings.shortBreakDuration * 60;
      case PHASE_TYPES.LONG_BREAK:
        return currentSettings.longBreakDuration * 60;
      default:
        return currentSettings.workDuration * 60;
    }
  }, [currentSettings]);

  // Get next phase
  const getNextPhase = useCallback(() => {
    if (phase === PHASE_TYPES.WORK) {
      const nextSessionCount = completedSessions + 1;
      if (nextSessionCount % currentSettings.sessionsBeforeLongBreak === 0) {
        return PHASE_TYPES.LONG_BREAK;
      }
      return PHASE_TYPES.SHORT_BREAK;
    }
    return PHASE_TYPES.WORK;
  }, [phase, completedSessions, currentSettings.sessionsBeforeLongBreak]);

  // Play completion sound for the current phase
  const playSound = useCallback(() => {
    if (currentSettings.soundEnabled) {
      playSoundForPhase(phase, currentSettings, isAuthenticated);
    }
  }, [currentSettings, phase, playSoundForPhase, isAuthenticated]);

  // Preview a sound (for settings UI)
  const previewSoundById = useCallback((soundId) => {
    previewSound(soundId, currentSettings.volume, isAuthenticated);
  }, [currentSettings.volume, previewSound, isAuthenticated]);

  // Handle phase completion
  const handlePhaseComplete = useCallback(() => {
    playSound();
    setState(TIMER_STATES.COMPLETED);

    if (phase === PHASE_TYPES.WORK) {
      setCompletedSessions((prev) => prev + 1);
    }

    const nextPhase = getNextPhase();
    const shouldAutoStart = 
      (nextPhase === PHASE_TYPES.WORK && currentSettings.autoStartWork) ||
      (nextPhase !== PHASE_TYPES.WORK && currentSettings.autoStartBreaks);

    // Transition to next phase
    setTimeout(() => {
      setPhase(nextPhase);
      setTimeRemaining(getPhaseDuration(nextPhase));
      setState(shouldAutoStart ? TIMER_STATES.RUNNING : TIMER_STATES.IDLE);
    }, 1000);
  }, [phase, getNextPhase, getPhaseDuration, playSound, currentSettings]);

  // Timer tick
  useEffect(() => {
    if (state === TIMER_STATES.RUNNING) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, handlePhaseComplete]);

  // Start timer
  const start = useCallback(() => {
    setState(TIMER_STATES.RUNNING);
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setState(TIMER_STATES.PAUSED);
  }, []);

  // Resume timer
  const resume = useCallback(() => {
    setState(TIMER_STATES.RUNNING);
  }, []);

  // Reset current phase
  const reset = useCallback(() => {
    setState(TIMER_STATES.IDLE);
    setTimeRemaining(getPhaseDuration(phase));
  }, [phase, getPhaseDuration]);

  // Reset entire timer
  const resetAll = useCallback(() => {
    setState(TIMER_STATES.IDLE);
    setPhase(PHASE_TYPES.WORK);
    setTimeRemaining(getPhaseDuration(PHASE_TYPES.WORK));
    setCompletedSessions(0);
  }, [getPhaseDuration]);

  // Skip to next phase
  const skip = useCallback(() => {
    const nextPhase = getNextPhase();
    if (phase === PHASE_TYPES.WORK) {
      setCompletedSessions((prev) => prev + 1);
    }
    setPhase(nextPhase);
    setTimeRemaining(getPhaseDuration(nextPhase));
    setState(TIMER_STATES.IDLE);
  }, [phase, getNextPhase, getPhaseDuration]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setCurrentSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // If timer is idle, update time remaining to match new duration
      if (state === TIMER_STATES.IDLE) {
        const newDuration = 
          phase === PHASE_TYPES.WORK ? updated.workDuration :
          phase === PHASE_TYPES.SHORT_BREAK ? updated.shortBreakDuration :
          updated.longBreakDuration;
        setTimeRemaining(newDuration * 60);
      }
      return updated;
    });
  }, [state, phase]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progress = ((getPhaseDuration(phase) - timeRemaining) / getPhaseDuration(phase)) * 100;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    state,
    phase,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    completedSessions,
    progress,
    settings: currentSettings,
    
    // Computed
    isRunning: state === TIMER_STATES.RUNNING,
    isPaused: state === TIMER_STATES.PAUSED,
    isIdle: state === TIMER_STATES.IDLE,
    isCompleted: state === TIMER_STATES.COMPLETED,
    isWorkPhase: phase === PHASE_TYPES.WORK,
    isBreakPhase: phase !== PHASE_TYPES.WORK,
    
    // Actions
    start,
    pause,
    resume,
    reset,
    resetAll,
    skip,
    updateSettings,
    previewSound: previewSoundById,
    
    // Constants
    TIMER_STATES,
    PHASE_TYPES,
  };
}

export default usePomodoroTimer;
