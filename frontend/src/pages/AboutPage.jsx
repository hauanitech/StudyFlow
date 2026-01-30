import { Link } from 'react-router-dom';

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

const features = [
  {
    icon: FeatureIcons.timer,
    title: 'Pomodoro Timer',
    description:
      'Stay focused with our customizable Pomodoro timer. Work in focused intervals, take breaks, and track your productivity.',
    link: '/pomodoro',
  },
  {
    icon: FeatureIcons.journal,
    title: 'Study Journal',
    description:
      'Document your learning journey. Reflect on what you studied, track your progress, and identify areas for improvement.',
    link: '/journal',
  },
  {
    icon: FeatureIcons.friends,
    title: 'Study Buddies',
    description:
      'Connect with friends who share your academic goals. Support each other, share resources, and stay motivated together.',
    link: '/friends',
  },
  {
    icon: FeatureIcons.chat,
    title: 'Real-time Chat',
    description:
      'Chat with your study buddies in real-time. Form study groups, discuss problems, and collaborate on projects.',
    link: '/chats',
  },
  {
    icon: FeatureIcons.advice,
    title: 'Study Advice',
    description:
      'Access a curated library of study tips and techniques. Learn about Pomodoro, active recall, spaced repetition, and more.',
    link: '/advice',
  },
  {
    icon: FeatureIcons.qna,
    title: 'Q&A Community',
    description:
      'Ask questions, share knowledge, and learn from others. Vote on helpful answers and build your reputation.',
    link: '/qa',
  },
];

const faqs = [
  {
    question: 'Is StudyFlow free to use?',
    answer:
      'Yes! StudyFlow is completely free. We believe everyone should have access to effective study tools.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'Some features like the Pomodoro timer and Study Advice are available without an account. For personalized features like journaling, friends, and chat, you\'ll need to sign up.',
  },
  {
    question: 'How does the Pomodoro technique work?',
    answer:
      'The Pomodoro technique involves working in focused 25-minute intervals, followed by 5-minute breaks. After 4 pomodoros, take a longer 15-30 minute break. This helps maintain focus and prevent burnout.',
  },
  {
    question: 'Can I study with friends?',
    answer:
      'Absolutely! Add friends to your network, create group chats, and support each other in your study journey. You can see when friends are online and coordinate study sessions.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Create a free account, set up your profile, and start exploring! Try the Pomodoro timer for your next study session, or browse our study advice for proven learning techniques.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          About <span className="text-gradient">StudyFlow</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Your all-in-one study companion designed to help you study smarter,
          stay focused, and achieve your academic goals.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/auth" className="btn-primary text-lg px-8 py-3">
            Get Started Free
          </Link>
          <Link to="/pomodoro" className="btn-secondary text-lg px-8 py-3">
            Try Pomodoro Timer
          </Link>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="card glass border-primary-600/20">
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Our Mission
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            We believe that effective studying shouldn't require expensive tools or
            complicated systems. StudyFlow brings together proven study techniques,
            social learning, and a supportive community—all in one simple,
            accessible platform.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mt-4">
            Whether you're a high school student, college undergrad, or lifelong
            learner, StudyFlow adapts to your needs and helps you build better
            study habits.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Everything You Need to Study Better
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="card hover:border-primary-600/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-lg bg-primary-600/10 flex items-center justify-center mb-4 group-hover:bg-primary-600/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary-400 mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Sign Up</h3>
            <p className="text-gray-400">
              Create your free account in seconds. No credit card required.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary-400 mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Start Studying</h3>
            <p className="text-gray-400">
              Use the Pomodoro timer, journal your progress, and learn new
              techniques.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600/20 border border-primary-500/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary-400 mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Connect & Grow</h3>
            <p className="text-gray-400">
              Find study buddies, join the community, and achieve your goals
              together.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="card group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-white">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="text-gray-400 mt-4">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto text-center">
        <div className="glass rounded-2xl p-12 border border-primary-600/30">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of students who are studying smarter with StudyFlow.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/auth"
              className="btn-primary px-8 py-3"
            >
              Create Free Account
            </Link>
            <Link
              to="/advice"
              className="btn-outline px-8 py-3"
            >
              Browse Study Tips
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-3xl mx-auto mt-16 text-center text-gray-500 text-sm">
        <p>
          Made with care for students everywhere.
          <br />
          Have feedback?{' '}
          <Link to="/qa" className="text-primary-400 hover:text-primary-300">
            Ask in our Q&A community
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
