import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import PomodoroPage from './pages/PomodoroPage';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import ChatsPage from './pages/ChatsPage';
import StudyAdvicePage from './pages/StudyAdvicePage';
import AboutPage from './pages/AboutPage';
import QAPage from './pages/QAPage';
import AskQuestionPage from './pages/AskQuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ModerationPage from './pages/ModerationPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import RequireAuth from './components/auth/RequireAuth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'pomodoro', element: <PomodoroPage /> },
      { path: 'advice', element: <StudyAdvicePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'auth', element: <AuthPage /> },
      {
        path: 'journal',
        element: (
          <RequireAuth>
            <JournalPage />
          </RequireAuth>
        ),
      },
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: 'friends',
        element: (
          <RequireAuth>
            <FriendsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'chats',
        element: (
          <RequireAuth>
            <ChatsPage />
          </RequireAuth>
        ),
      },
      // Q&A routes - list and detail are public, ask requires auth
      { path: 'qa', element: <QAPage /> },
      { path: 'qa/:questionId', element: <QuestionDetailPage /> },
      {
        path: 'qa/ask',
        element: (
          <RequireAuth>
            <AskQuestionPage />
          </RequireAuth>
        ),
      },
      {
        path: 'moderation',
        element: (
          <RequireAuth>
            <ModerationPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
