# Quickstart: Sleek Study Management Website

**Branch**: `001-study-management-site`

## Prerequisites

- Node.js 20+ (LTS recommended)
- MongoDB 6.0+ (local or MongoDB Atlas)
- npm 10+ or pnpm 8+

## Project Structure

```
├── frontend/               # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Base components (Button, Input, Card)
│   │   │   ├── layout/     # Layout components (Navbar, AppLayout)
│   │   │   ├── qna/        # Q&A components
│   │   │   ├── moderation/ # Moderation components
│   │   │   └── errors/     # Error boundary components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client modules
│   │   ├── state/          # Zustand stores
│   │   ├── hooks/          # Custom React hooks
│   │   └── styles/         # Global CSS
│   └── package.json
│
├── backend/                # Express REST API
│   ├── src/
│   │   ├── api/            # Route handlers
│   │   │   └── routes/     # Individual route modules
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── package.json
│
└── specs/                  # Project specifications
```

## Environment Variables

### Backend (`backend/.env`)

```env
# Required
MONGODB_URI=mongodb://localhost:27017/study_app
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
CORS_ORIGIN=http://localhost:5173

# Optional
PORT=3000
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

## Installation & Running

### 1. Start MongoDB

**Local MongoDB:**
```bash
mongod --dbpath /path/to/data
```

**Or use MongoDB Atlas** - Create a free cluster and get your connection string.

### 2. Start Backend API

```bash
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run dev
```

Backend runs at `http://localhost:3000`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Features Checklist

### Authentication
- [ ] Sign up with email/username/password
- [ ] Login/logout with JWT (httpOnly cookies)
- [ ] Protected routes redirect to auth page

### Pomodoro Timer
- [ ] Start/pause/resume timer
- [ ] Work/break cycle progression
- [ ] Session completion tracking
- [ ] Settings (work/break duration)

### Journal
- [ ] Create journal entries with mood
- [ ] View entries by date range
- [ ] Edit/delete entries
- [ ] Mood analytics over time

### Social Features
- [ ] User profile with bio
- [ ] Send/accept friend requests
- [ ] View friends list
- [ ] Real-time chat (Socket.IO)
- [ ] Group chats with multiple members

### Q&A System
- [ ] Ask questions with tags
- [ ] Post answers
- [ ] Vote on questions/answers
- [ ] Accept best answer
- [ ] Search and filter questions

### Study Advice
- [ ] Browse advice articles by category
- [ ] Search advice content
- [ ] View article details

### Moderation (Admin)
- [ ] Report inappropriate content
- [ ] Review pending reports
- [ ] Resolve/dismiss reports

## Smoke Tests

1. **Landing Page** - Loads with hero section, CTA buttons work
2. **Navigation** - All navbar links navigate correctly
3. **Auth Flow** - Sign up → Login → Logout cycle
4. **Pomodoro** - Timer starts, pauses, resumes, completes cycle
5. **Journal** - Create entry → Refresh → Entry persists
6. **Profile** - Edit bio → Save → Refresh → Bio persists
7. **Friends** - Send request → Accept (as other user) → Friends list updates
8. **Chat** - Create chat → Send message → Real-time delivery
9. **Q&A** - Ask question → Post answer → Vote → Accept answer
10. **Responsive** - Test all pages at mobile/tablet/desktop widths

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get own profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/:userId` - Get user's public profile

### Journal
- `GET /api/journal` - List entries (with filters)
- `POST /api/journal` - Create entry
- `GET /api/journal/:id` - Get entry
- `PUT /api/journal/:id` - Update entry
- `DELETE /api/journal/:id` - Delete entry
- `GET /api/journal/analytics/mood` - Mood analytics

### Friends
- `GET /api/friends` - List friends
- `GET /api/friends/requests` - List friend requests
- `POST /api/friends/request` - Send request
- `POST /api/friends/request/:requestId/respond` - Accept/reject
- `DELETE /api/friends/:friendId` - Remove friend

### Chats
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:chatId` - Get chat details
- `GET /api/chats/:chatId/messages` - Get messages
- `POST /api/chats/:chatId/messages` - Send message

### Q&A
- `GET /api/qna/questions` - List questions
- `POST /api/qna/questions` - Create question
- `GET /api/qna/questions/:id` - Get question
- `PUT /api/qna/questions/:id` - Update question
- `DELETE /api/qna/questions/:id` - Delete question
- `POST /api/qna/questions/:id/vote` - Vote on question
- `GET /api/qna/questions/:id/answers` - Get answers
- `POST /api/qna/questions/:id/answers` - Post answer
- `POST /api/qna/answers/:id/vote` - Vote on answer
- `POST /api/qna/answers/:id/accept` - Accept answer

### Reports (Moderation)
- `POST /api/reports` - Create report
- `GET /api/reports/pending` - List pending (moderator)
- `POST /api/reports/:id/resolve` - Resolve report
- `POST /api/reports/:id/dismiss` - Dismiss report

## Tech Stack

- **Frontend**: React 18, React Router 6, Vite, Tailwind CSS 3.4, Zustand, Socket.IO Client
- **Backend**: Node.js, Express 4, MongoDB, Mongoose 8, Socket.IO 4, JWT (httpOnly cookies)
- **Validation**: Zod (backend request validation)
- **Real-time**: Socket.IO for chat messaging

## Accessibility

The app includes comprehensive accessibility features:
- Skip-to-content links
- ARIA labels and roles
- Focus-visible styles for keyboard navigation
- Touch-friendly tap targets (min 44px)
- Screen reader support (sr-only classes)
- Reduced motion support

## Troubleshooting

**MongoDB connection fails:**
- Ensure MongoDB is running
- Check MONGODB_URI format
- Verify network access (Atlas whitelist IP)

**CORS errors:**
- Verify CORS_ORIGIN matches frontend URL
- Include credentials in fetch requests

**Auth issues:**
- Check JWT secrets are set
- Verify cookies are being sent (credentials: 'include')
- Clear browser cookies and retry

**Socket.IO not connecting:**
- Ensure backend is running
- Check CORS settings in socket config
- Verify client URL matches server
