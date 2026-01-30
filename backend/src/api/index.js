import { Router } from 'express';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import journalsRoutes from './routes/journals.js';
import friendsRoutes from './routes/friends.js';
import chatsRoutes from './routes/chats.js';
import adviceRoutes from './routes/advice.js';
import qnaRoutes from './routes/qna.js';
import reportsRoutes from './routes/reports.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/journals', journalsRoutes);
router.use('/friends', friendsRoutes);
router.use('/chats', chatsRoutes);
router.use('/advice', adviceRoutes);
router.use('/qna', qnaRoutes);
router.use('/reports', reportsRoutes);

export default router;
