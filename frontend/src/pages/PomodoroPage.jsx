import { useState, useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import usePomodoroTimer from '../hooks/usePomodoroTimer';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import PomodoroSettings from '../components/pomodoro/PomodoroSettings';
import { Button } from '../components/ui';

export default function PomodoroPage() {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  
  const timer = usePomodoroTimer();
  const { isRunning, isPaused, resetAll, updateSettings, settings } = timer;

  // Block navigation when timer is running
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (isRunning || isPaused) && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle navigation blocking
  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmLeave = window.confirm(
        'Timer is still running! Are you sure you want to leave? Your progress will be lost.'
      );
      if (confirmLeave) {
        resetAll();
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, resetAll]);

  // Warn on page unload (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isRunning || isPaused) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, isPaused]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Pomodoro Timer</h1>
            <p className="text-gray-400">
              Stay focused with the Pomodoro Technique
            </p>
          </div>

          {/* Timer Card */}
          <div className="card p-8 mb-6">
            {showSettings ? (
              <PomodoroSettings
                settings={settings}
                onUpdate={updateSettings}
                onClose={() => setShowSettings(false)}
              />
            ) : (
              <PomodoroTimer {...timer} />
            )}
          </div>

          {/* Settings toggle */}
          {!showSettings && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowSettings(true)}
                disabled={isRunning}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Timer Settings
              </Button>
            </div>
          )}

          {/* How it works */}
          <div className="mt-12 card p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">How the Pomodoro Technique Works</h2>
            <ol className="space-y-3 text-gray-400">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-900/30 text-red-400 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <span><strong className="text-white">Focus</strong> for 25 minutes on a single task</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <span><strong className="text-white">Short break</strong> for 5 minutes to rest your mind</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <span>After 4 pomodoros, take a <strong className="text-white">long break</strong> (15-30 min)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-900/30 text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                <span><strong className="text-white">Repeat</strong> and build your focus muscle!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
