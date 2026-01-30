import { useState } from 'react';
import { Button, Input, Card } from '../ui';

const MIN_DURATION = 1;
const MAX_WORK_DURATION = 120;
const MAX_BREAK_DURATION = 60;

export default function PomodoroSettings({ settings, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    workDuration: settings.workDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
    autoStartBreaks: settings.autoStartBreaks,
    autoStartWork: settings.autoStartWork,
    soundEnabled: settings.soundEnabled,
  });

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
    };
    setFormData(defaults);
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
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              className="w-4 h-4 rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Play sound when timer completes</span>
          </label>
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
