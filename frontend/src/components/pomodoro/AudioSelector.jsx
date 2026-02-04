import { useState } from 'react';
import { getAvailableSounds, AVAILABLE_SOUNDS } from '../../config/audioConfig';

/**
 * Audio selector component for choosing notification sounds
 * Shows premium sounds with lock icon for unauthenticated users
 */
export default function AudioSelector({
  selectedSoundId,
  onSelect,
  onPreview,
  isAuthenticated,
  disabled = false,
  label = 'Sound',
}) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const availableSounds = getAvailableSounds(isAuthenticated);
  const allSounds = Object.values(AVAILABLE_SOUNDS);

  const handlePreview = async (soundId, e) => {
    e.stopPropagation();
    if (isPreviewPlaying || disabled) return;
    
    setIsPreviewPlaying(true);
    try {
      await onPreview?.(soundId);
    } finally {
      setTimeout(() => setIsPreviewPlaying(false), 600);
    }
  };

  const handleSelect = (soundId) => {
    if (disabled) return;
    
    const sound = AVAILABLE_SOUNDS[soundId];
    if (sound.requiresAuth && !isAuthenticated) {
      return; // Prevent selection of locked sounds
    }
    
    onSelect(soundId);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="grid gap-2">
        {allSounds.map((sound) => {
          const isLocked = sound.requiresAuth && !isAuthenticated;
          const isSelected = selectedSoundId === sound.id;
          
          return (
            <div
              key={sound.id}
              onClick={() => handleSelect(sound.id)}
              className={`
                relative flex items-center justify-between p-3 rounded-lg border cursor-pointer
                transition-all duration-150
                ${isSelected 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-surface-600 bg-surface-700/50 hover:border-surface-500'
                }
                ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                ${disabled ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Sound icon */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isSelected ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-600 text-gray-400'}
                `}>
                  {sound.type === 'none' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </div>
                
                {/* Sound info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {sound.name}
                    </span>
                    {isLocked && (
                      <span className="flex items-center gap-1 text-xs text-yellow-500">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Sign in
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{sound.description}</p>
                </div>
              </div>
              
              {/* Preview button */}
              {sound.type !== 'none' && !isLocked && (
                <button
                  onClick={(e) => handlePreview(sound.id, e)}
                  disabled={isPreviewPlaying || disabled}
                  className={`
                    p-2 rounded-full transition-colors
                    ${isPreviewPlaying 
                      ? 'bg-primary-500/20 text-primary-400' 
                      : 'hover:bg-surface-600 text-gray-400 hover:text-white'
                    }
                  `}
                  title="Preview sound"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500" />
              )}
            </div>
          );
        })}
      </div>
      
      {!isAuthenticated && (
        <p className="text-xs text-gray-500 mt-2">
          <svg className="w-3 h-3 inline mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Sign in to unlock all sounds
        </p>
      )}
    </div>
  );
}
