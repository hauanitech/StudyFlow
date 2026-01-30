import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

// SVG Icons for features
const FeatureIcons = {
  timer: (
    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  journal: (
    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  friends: (
    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  chat: (
    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  advice: (
    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  qna: (
    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-galaxy-900 via-primary-700/20 to-galaxy-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-600/20 via-transparent to-transparent"></div>
        
        {/* Stars effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars-sm"></div>
          <div className="stars-md"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-300 text-sm mb-8">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Level up your study game</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Study Smarter, <span className="text-gradient">Not Harder</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10">
              Your all-in-one study companion with Pomodoro timer, journaling, 
              and a supportive community to help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pomodoro">
                <Button size="lg" variant="outline" className="border-primary-500/50 text-white hover:bg-primary-600/20 hover:border-primary-400">
                  Try Pomodoro Free
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-glow">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-galaxy-900 via-surface-900 to-galaxy-900"></div>
        <div className="relative container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Everything You Need to <span className="text-gradient">Focus & Grow</span>
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Powerful tools designed to help you build better study habits and reach your academic goals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={FeatureIcons.timer}
              title="Pomodoro Timer"
              description="Stay focused with customizable work and break intervals. Track your sessions and build consistency."
            />
            <FeatureCard
              icon={FeatureIcons.journal}
              title="Daily Journaling"
              description="Reflect on your learning journey with private daily entries. Build self-awareness and track progress."
            />
            <FeatureCard
              icon={FeatureIcons.friends}
              title="Study Buddies"
              description="Connect with friends, share goals, and hold each other accountable on your learning path."
            />
            <FeatureCard
              icon={FeatureIcons.chat}
              title="Real-time Chat"
              description="Message friends directly or create study groups for collaborative learning sessions."
            />
            <FeatureCard
              icon={FeatureIcons.advice}
              title="Study Advice"
              description="Browse curated study strategies and techniques from experts and experienced learners."
            />
            <FeatureCard
              icon={FeatureIcons.qna}
              title="Q&A Community"
              description="Ask questions, share knowledge, and learn from a community of motivated students."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary-700/20 via-galaxy-900 to-galaxy-900"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="glass rounded-2xl p-12 max-w-3xl mx-auto border border-surface-700/50">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform Your Study Habits?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of students achieving their goals with StudyFlow.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-glow">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass rounded-xl p-6 border border-surface-700/50 hover:border-primary-500/30 transition-all duration-300 group">
      <div className="w-14 h-14 rounded-lg bg-primary-600/10 flex items-center justify-center mb-4 group-hover:bg-primary-600/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
