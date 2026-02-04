import { useRef, useCallback } from 'react';
import { AVAILABLE_SOUNDS, getSoundById } from '../config/audioConfig';

/**
 * Custom hook for playing Pomodoro timer sounds
 * Handles both Web Audio API generated sounds and audio file playback
 */
export function usePomodoroAudio() {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Get or create AudioContext (for generated sounds)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play the default generated beep sound
  const playGeneratedBeep = useCallback((volume = 0.5, frequency = 800) => {
    try {
      const audioContext = getAudioContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(volume * 0.6, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (error) {
      console.warn('Failed to play generated sound:', error);
    }
  }, [getAudioContext]);

  // Play an audio file
  const playAudioFile = useCallback((path, volume = 0.5) => {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        const audio = new Audio(path);
        audio.volume = Math.max(0, Math.min(1, volume));
        audioRef.current = audio;
        
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Failed to load audio file'));
        
        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  // Main function to play a sound based on its configuration
  const playSound = useCallback((soundId, volume = 0.5, isAuthenticated = false) => {
    const sound = getSoundById(soundId, isAuthenticated);
    
    if (!sound || sound.type === 'none') {
      return Promise.resolve();
    }
    
    if (sound.type === 'generated') {
      playGeneratedBeep(volume);
      return Promise.resolve();
    }
    
    if (sound.type === 'file' && sound.path) {
      return playAudioFile(sound.path, volume).catch((error) => {
        console.warn(`Failed to play ${sound.name}, falling back to default:`, error);
        // Fallback to generated beep if file fails
        playGeneratedBeep(volume);
      });
    }
    
    return Promise.resolve();
  }, [playGeneratedBeep, playAudioFile]);

  // Play sound for a specific phase
  const playSoundForPhase = useCallback((phase, soundSettings, isAuthenticated) => {
    const { volume = 0.5 } = soundSettings;
    
    let soundId;
    switch (phase) {
      case 'work':
        soundId = soundSettings.workEndSound || 'default';
        break;
      case 'shortBreak':
        soundId = soundSettings.shortBreakEndSound || 'default';
        break;
      case 'longBreak':
        soundId = soundSettings.longBreakEndSound || 'default';
        break;
      default:
        soundId = 'default';
    }
    
    return playSound(soundId, volume, isAuthenticated);
  }, [playSound]);

  // Preview a sound (for settings UI)
  const previewSound = useCallback((soundId, volume = 0.5, isAuthenticated = false) => {
    return playSound(soundId, volume, isAuthenticated);
  }, [playSound]);

  // Stop any currently playing audio
  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopSound();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopSound]);

  return {
    playSound,
    playSoundForPhase,
    previewSound,
    stopSound,
    cleanup,
  };
}

export default usePomodoroAudio;
