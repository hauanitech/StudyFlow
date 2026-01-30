import { useEffect } from 'react';

const phaseColors = {
  work: {
    bg: 'bg-gradient-to-r from-primary-600 to-primary-500',
    text: 'text-primary-400',
    ring: 'ring-primary-500',
    progress: 'bg-primary-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  shortBreak: {
    bg: 'bg-gradient-to-r from-green-600 to-green-500',
    text: 'text-green-400',
    ring: 'ring-green-500',
    progress: 'bg-green-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  longBreak: {
    bg: 'bg-gradient-to-r from-accent-600 to-accent-500',
    text: 'text-accent-400',
    ring: 'ring-accent-500',
    progress: 'bg-accent-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
};

const phaseLabels = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export default function PomodoroTimer({
  formattedTime,
  phase,
  progress,
  isRunning,
  isPaused,
  isIdle,
  isCompleted,
  completedSessions,
  start,
  pause,
  resume,
  reset,
  skip,
}) {
  const colors = phaseColors[phase];
  const label = phaseLabels[phase];

  // Update document title with timer
  useEffect(() => {
    const prefix = isRunning ? '▶' : isPaused ? '||' : '';
    document.title = `${prefix} ${formattedTime} - ${label} | StudyFlow`;
    
    return () => {
      document.title = 'StudyFlow - Manage Your Study Time';
    };
  }, [formattedTime, label, isRunning, isPaused]);

  return (
    <div className="text-center">
      {/* Phase indicator */}
      <div className="mb-6">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg} text-white font-medium shadow-glow`}>
          {colors.icon}
          {label}
        </span>
      </div>

      {/* Timer display */}
      <div className="relative inline-flex items-center justify-center mb-8">
        {/* Progress ring */}
        <svg className="w-64 h-64 transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={colors.text}
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl md:text-7xl font-mono font-bold ${colors.text}`}>
            {formattedTime}
          </span>
          {isCompleted && (
            <span className="text-lg text-gray-400 mt-2 animate-pulse">
              Phase complete!
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {isIdle && (
          <button
            onClick={start}
            className={`px-8 py-3 rounded-lg text-white font-medium text-lg transition-all hover:scale-105 shadow-glow ${colors.bg}`}
          >
            Start
          </button>
        )}

        {isRunning && (
          <button
            onClick={pause}
            className="px-8 py-3 rounded-lg bg-gray-600 text-white font-medium text-lg transition-all hover:bg-gray-700"
          >
            Pause
          </button>
        )}

        {isPaused && (
          <>
            <button
              onClick={resume}
              className={`px-8 py-3 rounded-lg text-white font-medium text-lg transition-all hover:scale-105 ${colors.bg}`}
            >
              Resume
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-lg bg-surface-700 text-gray-200 font-medium transition-all hover:bg-surface-600"
            >
              Reset
            </button>
          </>
        )}

        {(isRunning || isPaused) && (
          <button
            onClick={skip}
            className="px-6 py-3 rounded-lg bg-surface-700 text-gray-300 font-medium transition-all hover:bg-surface-600"
            title="Skip to next phase"
          >
            Skip →
          </button>
        )}
      </div>

      {/* Session counter */}
      <div className="text-gray-400">
        <span className="font-medium">{completedSessions}</span> pomodoro{completedSessions !== 1 ? 's' : ''} completed today
      </div>
    </div>
  );
}
