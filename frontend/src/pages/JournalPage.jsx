import { useState, useEffect, useCallback } from 'react';
import { JournalEditor } from '../components/journal';
import { Card, Button } from '../components/ui';
import journalsApi from '../services/journalsApi';

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [entry, setEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load entry for selected date
  const loadEntry = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await journalsApi.getEntry(date);
      setEntry(response.entry);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recent entries and stats
  const loadSidebar = useCallback(async () => {
    try {
      const [entriesRes, statsRes] = await Promise.all([
        journalsApi.getEntries({ limit: 10 }),
        journalsApi.getStats(),
      ]);
      setEntries(entriesRes.entries);
      setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load sidebar:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadEntry(selectedDate);
    loadSidebar();
  }, []);

  // Load entry when date changes
  useEffect(() => {
    loadEntry(selectedDate);
  }, [selectedDate, loadEntry]);

  // Save entry
  const handleSave = async (data) => {
    try {
      setSaving(true);
      const response = await journalsApi.saveEntry(selectedDate, data);
      setEntry(response.entry);
      // Refresh sidebar
      loadSidebar();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Navigate dates
  const goToPrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    if (newDate <= getTodayDate()) {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(getTodayDate());
  };

  const isToday = selectedDate === getTodayDate();
  const isFuture = selectedDate > getTodayDate();

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main editor */}
          <div className="flex-1">
            {/* Date navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPrevDay}
                className="p-2 rounded-lg bg-surface-800 border border-surface-700 hover:bg-surface-700 text-gray-300"
                aria-label="Previous day"
              >
                ←
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">{formatDate(selectedDate)}</h1>
                {!isToday && (
                  <button
                    onClick={goToToday}
                    className="text-sm text-primary-400 hover:underline mt-1"
                  >
                    Go to today
                  </button>
                )}
              </div>
              
              <button
                onClick={goToNextDay}
                disabled={isToday || isFuture}
                className="p-2 rounded-lg bg-surface-800 border border-surface-700 hover:bg-surface-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next day"
              >
                →
              </button>
            </div>

            {/* Editor card */}
            <Card>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400">{error}</p>
                  <Button onClick={() => loadEntry(selectedDate)} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : (
                <JournalEditor
                  entry={entry}
                  onSave={handleSave}
                  saving={saving}
                  autoSave={true}
                />
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Stats */}
            {stats && (
              <Card className="mb-6">
                <h2 className="font-semibold mb-4 text-white">Your Stats</h2>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-400">
                      {stats.totalEntries}
                    </div>
                    <div className="text-xs text-gray-500">Entries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-400">
                      {stats.currentStreak}
                    </div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-2xl font-bold text-primary-400">
                      {stats.totalWords.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Total Words</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Recent entries */}
            <Card>
              <h2 className="font-semibold mb-4">📓 Recent Entries</h2>
              {entries.length === 0 ? (
                <p className="text-gray-500 text-sm">No entries yet. Start writing!</p>
              ) : (
                <div className="space-y-2">
                  {entries.map((e) => (
                    <button
                      key={e.date}
                      onClick={() => setSelectedDate(e.date)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        e.date === selectedDate
                          ? 'bg-primary-900/30 border border-primary-700'
                          : 'hover:bg-surface-700'
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {e.mood && (
                          <span className="ml-2">
                            {e.mood === 'great' && '😄'}
                            {e.mood === 'good' && '🙂'}
                            {e.mood === 'okay' && '😐'}
                            {e.mood === 'bad' && '😔'}
                            {e.mood === 'terrible' && '😢'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {e.content?.substring(0, 50) || 'Empty entry'}
                        {e.content?.length > 50 && '...'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
