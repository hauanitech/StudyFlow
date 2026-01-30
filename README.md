# StudyFlow - Study Management Website

A sleek, modern study and time management site with Pomodoro timer, journaling, social features, and community Q&A.

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## Project Structure

```
├── backend/          # Express.js API
│   └── src/
│       ├── api/      # Route handlers
│       ├── auth/     # JWT utilities
│       ├── config/   # Environment config
│       ├── db/       # Database connection
│       ├── middleware/
│       ├── models/   # Mongoose schemas
│       ├── realtime/ # Socket.IO
│       └── services/ # Business logic
│
├── frontend/         # React SPA
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── state/
│       └── styles/
│
└── specs/            # Design documents
```

## Features

- 🍅 **Pomodoro Timer** - Configurable work/break sessions
- 📓 **Daily Journaling** - Private daily entries
- 👤 **Profile Management** - Privacy controls
- 👥 **Friends System** - Connect with study buddies
- 💬 **Chat** - Direct and group messaging
- 📚 **Study Advice** - Curated strategies
- ❓ **Q&A Community** - Ask and answer questions

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Express.js, MongoDB, Mongoose
- **Auth**: JWT (httpOnly cookies)
- **Realtime**: Socket.IO
