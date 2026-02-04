import { useState } from 'react';
import { Button, Input, Card } from '../ui';
import AudioSelector from './AudioSelector';
import { SOUND_PHASES, DEFAULT_SOUND_SETTINGS } from '../../config/audioConfig';

const MIN_DURATION = 1;
const MAX_WORK_DURATION = 120;
const MAX_BREAK_DURATION = 60;

export default function PomodoroSettings({ 
  settings, 
  onUpdate, 
  onClose, 
  onPreviewSound,
  isAuthenticated = false 
}) {
  const [formData, setFormData] = useState({
    workDuration: settings.workDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
    autoStartBreaks: settings.autoStartBreaks,
    autoStartWork: settings.autoStartWork,
    soundEnabled: settings.soundEnabled,
    // Audio settings
    workEndSound: settings.workEndSound || DEFAULT_SOUND_SETTINGS.workEndSound,
    shortBreakEndSound: settings.shortBreakEndSound || DEFAULT_SOUND_SETTINGS.shortBreakEndSound,
    longBreakEndSound: settings.longBreakEndSound || DEFAULT_SOUND_SETTINGS.longBreakEndSound,
    volume: settings.volume ?? DEFAULT_SOUND_SETTINGS.volume,
  });
  
  const [expandedPhase, setExpandedPhase] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field, value, min, max) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      handleChange(field, Math.max(min, Math.min(max, num)));
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    onClose?.();
  };

  const handleReset = () => {
    const defaults = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartWork: false,
      soundEnabled: true,
      ...DEFAULT_SOUND_SETTINGS,
    };
    setFormData(defaults);
  };
  
  const handleSoundSelect = (phaseKey, soundId) => {
    handleChange(phaseKey, soundId);
  };

  const togglePhaseExpanded = (phase) => {
    setExpandedPhase(expandedPhase === phase ? null : phase);
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Timer Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close settings"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Duration settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Durations (minutes)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Focus</label>
              <input
                type="number"
                min={MIN_DURATION}
                max={MAX_WORK_DURATION}
                value={formData.workDuration}
                onChange={(e) => handleNumberChange('workDuration', e.target.value, MIN_DURATION, MAX_WORK_DURATION)}
                className="input text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Short Break</label>
              <input
                type="number"
                min={MIN_DURATION}
                max={MAX_BREAK_DURATION}
                value={formData.shortBreakDuration}
                onChange={(e) => handleNumberChange('shortBreakDuration', e.target.value, MIN_DURATION, MAX_BREAK_DURATION)}
                className="input text-center"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Long Break</label>
              <input
                type="number"
                min={MIN_DURATION}
                max={MAX_BREAK_DURATION}
                value={formData.longBreakDuration}
                onChange={(e) => handleNumberChange('longBreakDuration', e.target.value, MIN_DURATION, MAX_BREAK_DURATION)}
                className="input text-center"
              />
            </div>
          </div>
        </div>

        {/* Sessions before long break */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Pomodoros before long break
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={formData.sessionsBeforeLongBreak}
            onChange={(e) => handleNumberChange('sessionsBeforeLongBreak', e.target.value, 1, 10)}
            className="input w-24"
          />
        </div>

        {/* Auto-start options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Auto-start</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoStartBreaks}
              onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
              className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Automatically start breaks</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoStartWork}
              onChange={(e) => handleChange('autoStartWork', e.target.checked)}
              className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Automatically start focus after break</span>
          </label>
        </div>

        {/* Sound */}
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Play sound when timer completes</span>
          </label>
          
          {/* Volume slider */}
          {formData.soundEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Volume</label>
                <span className="text-xs text-gray-500">{Math.round(formData.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.volume}
                onChange={(e) => handleChange('volume', parseFloat(e.target.value))}
                className="w-full h-2 bg-surface-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          )}
          
          {/* Phase-specific sounds */}
          {formData.soundEnabled && (
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Notification Sounds
              </h3>
              
              {Object.entries(SOUND_PHASES).map(([phaseId, phaseConfig]) => (
                <div key={phaseId} className="border border-surface-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => togglePhaseExpanded(phaseId)}
                    className="w-full flex items-center justify-between p-3 bg-surface-700/50 hover:bg-surface-700 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-300">{phaseConfig.label}</p>
                      <p className="text-xs text-gray-500">{phaseConfig.description}</p>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedPhase === phaseId ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedPhase === phaseId && (
                    <div className="p-3 bg-surface-800/50">
                      <AudioSelector
                        selectedSoundId={formData[phaseConfig.key]}
                        onSelect={(soundId) => handleSoundSelect(phaseConfig.key, soundId)}
                        onPreview={onPreviewSound}
                        isAuthenticated={isAuthenticated}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <Button onClick={handleSave} className="flex-1">
          Save Settings
        </Button>
        <Button variant="secondary" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </Card>
  );
}
