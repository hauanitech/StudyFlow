# Backend - Study Management API

Express.js REST API with MongoDB persistence.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Structure

```
src/
├── api/          # Route handlers
├── auth/         # JWT utilities
├── config/       # Environment config
├── db/           # Database connection
├── middleware/   # Express middleware
├── models/       # Mongoose schemas
├── realtime/     # Socket.IO handlers
├── services/     # Business logic
└── index.js      # Entry point
```
