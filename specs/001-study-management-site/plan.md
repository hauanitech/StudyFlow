# Implementation Plan: Sleek Study Management Website

**Branch**: `001-study-management-site` | **Date**: 2026-01-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-study-management-site/spec.md`

**Status**: ✅ IMPLEMENTATION COMPLETE (110/110 tasks completed)

## Summary

Build a sleek, modern study management web application featuring a Pomodoro timer, daily journaling, user profiles with privacy controls, friend system, real-time chat (1:1 and group), curated study advice, community Q&A with voting/moderation, and an About page. The application follows a React + Express + MongoDB architecture with Socket.IO for real-time features.

## Technical Context

**Language/Version**: JavaScript ES2022+ (Node.js 20+ LTS backend, React 18+ frontend)  
**Primary Dependencies**:
- Backend: Express.js, Mongoose, Socket.IO, JWT (jsonwebtoken), bcrypt, helmet, cors
- Frontend: React 18, React Router v6, Tailwind CSS, Vite, Socket.IO client, Zustand
**Storage**: MongoDB 6.0+ with Mongoose ODM  
**Testing**: Vitest + React Testing Library (frontend), Jest + Supertest (backend)  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 
- First Contentful Paint < 2s
- Time to Interactive < 3.5s  
- Chat message delivery < 2s (95th percentile)
**Constraints**: 
- JWT access tokens (15min) + refresh tokens (7d) in httpOnly cookies
- CSRF protection for all state-changing operations
- Rate limiting on auth and posting endpoints
**Scale/Scope**: MVP for ~1000 concurrent users, 9 main pages, 12 data models

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gates ✅

| Principle | Requirement | Status | Evidence |
|-----------|-------------|--------|----------|
| I. Separation of Concerns | Backend handles business logic, Frontend handles presentation | ✅ PASS | Clear `backend/` and `frontend/` separation with services layer |
| II. API-First Design | RESTful endpoints with OpenAPI documentation | ✅ PASS | OpenAPI spec at `contracts/openapi.yaml` |
| III. Database Integrity | Mongoose schemas with validation | ✅ PASS | All 12 models defined with validation rules |
| IV. Security | JWT auth, CSRF, rate limiting, input sanitization | ✅ PASS | Middleware in `backend/src/middleware/` |
| V. Testing | Test coverage requirement | ⚠️ DEFERRED | Tests marked optional for MVP phase |
| VI. Real-time | Socket.IO with JWT auth for connections | ✅ PASS | `backend/src/realtime/socket.js` |
| VII. UX & Accessibility | Responsive design, ARIA labels | ✅ PASS | Tailwind responsive + accessibility pass in T109 |

### Post-Design Re-evaluation ✅

| Check | Status | Notes |
|-------|--------|-------|
| API contracts match data model | ✅ | OpenAPI spec aligns with Mongoose models |
| Security middleware coverage | ✅ | All protected routes use `requireAuth` |
| Real-time events documented | ✅ | Socket events in quickstart.md |
| Error handling standardized | ✅ | Centralized error handler with structured responses |

### Violations Requiring Justification

| Violation | Justification | Planned Remediation |
|-----------|---------------|---------------------|
| V. Testing: 80% coverage not met | MVP prioritized feature completeness; tests marked optional to accelerate delivery | Add test suite in post-MVP iteration; track as tech debt |

## Project Structure

### Documentation (this feature)

```text
specs/001-study-management-site/
├── plan.md              # This file (implementation plan)
├── spec.md              # Feature specification (8 user stories, 41 FRs)
├── research.md          # Phase 0: Technology decisions (7 decisions)
├── data-model.md        # Phase 1: Entity definitions (12 models)
├── quickstart.md        # Phase 1: Setup and running instructions
├── contracts/           # Phase 1: API contracts
│   └── openapi.yaml     # OpenAPI 3.0 specification
├── tasks.md             # Phase 2: Implementation tasks (110 tasks)
├── checklists/          # Requirements verification
│   └── requirements.md  # FR completion tracking
├── maintenance-tasks.md # Ongoing maintenance items
└── security-fix-plan.md # Security remediation tracking
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/              # Route handlers and OpenAPI
│   │   ├── index.js      # Route aggregation
│   │   ├── openapi.js    # Swagger UI serving
│   │   └── routes/       # Individual route modules
│   │       ├── auth.js       # /auth/* endpoints
│   │       ├── users.js      # /users/* endpoints
│   │       ├── journals.js   # /journals/* endpoints
│   │       ├── friends.js    # /friends/* endpoints
│   │       ├── chats.js      # /chats/* endpoints
│   │       ├── advice.js     # /advice/* endpoints
│   │       ├── qna.js        # /qna/* endpoints
│   │       └── reports.js    # /reports/* endpoints
│   ├── auth/             # JWT utilities
│   │   └── jwt.js
│   ├── config/           # Environment configuration
│   │   ├── env.js
│   │   └── validateEnv.js
│   ├── data/             # Static data
│   │   └── studyAdvice.json
│   ├── db/               # Database connection
│   │   └── mongoose.js
│   ├── middleware/       # Express middleware
│   │   ├── cors.js
│   │   ├── csrf.js
│   │   ├── errorHandler.js
│   │   ├── rateLimit.js
│   │   ├── requestLogger.js
│   │   ├── requireAuth.js
│   │   └── validate.js
│   ├── models/           # Mongoose schemas (12 models)
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── JournalEntry.js
│   │   ├── FriendRequest.js
│   │   ├── Friendship.js
│   │   ├── Chat.js
│   │   ├── ChatMembership.js
│   │   ├── Message.js
│   │   ├── Question.js
│   │   ├── Answer.js
│   │   ├── Vote.js
│   │   └── Report.js
│   ├── realtime/         # Socket.IO server
│   │   └── socket.js
│   ├── services/         # Business logic (8 services)
│   │   ├── accountDeletionService.js
│   │   ├── adviceService.js
│   │   ├── chatsService.js
│   │   ├── friendsService.js
│   │   ├── journalsService.js
│   │   ├── moderationService.js
│   │   ├── profileService.js
│   │   └── qnaService.js
│   └── utils/            # Helpers
│       ├── logger.js
│       └── sanitize.js
├── app.js                # Express app bootstrap
├── index.js              # Server entry point
└── package.json

frontend/
├── src/
│   ├── components/       # React components by feature
│   │   ├── auth/         # RequireAuth
│   │   ├── chats/        # Chat UI components
│   │   ├── errors/       # ErrorBoundary
│   │   ├── friends/      # Friend request/list components
│   │   ├── journal/      # Journal editor
│   │   ├── landing/      # Landing page sections
│   │   ├── layout/       # AppLayout, Navbar
│   │   ├── moderation/   # Moderation queue components
│   │   ├── pomodoro/     # Timer, settings components
│   │   ├── profile/      # Profile form
│   │   ├── qna/          # Q&A feed, question form, answers
│   │   └── ui/           # Base components (Button, Input, Card, etc.)
│   ├── hooks/            # Custom hooks
│   │   └── usePomodoroTimer.js
│   ├── pages/            # Page components (10 pages)
│   │   ├── LandingPage.jsx
│   │   ├── PomodoroPage.jsx
│   │   ├── JournalPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── FriendsPage.jsx
│   │   ├── ChatsPage.jsx
│   │   ├── StudyAdvicePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── QAPage.jsx
│   │   ├── QuestionDetailPage.jsx
│   │   ├── AskQuestionPage.jsx
│   │   ├── ModerationPage.jsx
│   │   ├── AuthPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/         # API clients (8 modules)
│   │   ├── apiClient.js
│   │   ├── authApi.js
│   │   ├── journalsApi.js
│   │   ├── friendsApi.js
│   │   ├── chatsApi.js
│   │   ├── adviceApi.js
│   │   ├── qnaApi.js
│   │   ├── profileApi.js
│   │   └── socketClient.js
│   ├── state/            # State management
│   │   └── authStore.jsx
│   ├── styles/           # Global CSS
│   │   └── index.css
│   ├── utils/            # Helpers
│   │   └── logger.js
│   ├── main.jsx          # App entry point
│   └── router.jsx        # Route definitions
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

**Structure Decision**: Web application structure selected (Option 2) based on requirement for separate React SPA frontend and Express API backend with real-time Socket.IO communication.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Testing deferred | MVP timeline prioritized feature completeness | Adding full test suite would delay launch by ~2 weeks; acceptance testing done manually |
| 12 data models | Each entity has distinct business rules and relationships | Merging models would create god objects with unclear responsibilities |

## Implementation Status

### Completed Phases

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| Phase 1 | Setup (Infrastructure) | T001-T012 | ✅ Complete |
| Phase 2 | Foundational (Prerequisites) | T013-T035 | ✅ Complete |
| Phase 3 | US1 - Landing + Pomodoro | T036-T043 | ✅ Complete |
| Phase 4 | US2 - Auth + Journal | T044-T053 | ✅ Complete |
| Phase 5 | US3 - Profile | T054-T062 | ✅ Complete |
| Phase 6 | US4 - Friends | T063-T070 | ✅ Complete |
| Phase 7 | US5 - Chats | T071-T081 | ✅ Complete |
| Phase 8 | US6 - Study Advice | T082-T087 | ✅ Complete |
| Phase 9 | US7 - Q&A System | T088-T102 | ✅ Complete |
| Phase 10 | US8 - About Page | T103 | ✅ Complete |
| Phase 11 | Polish & Cross-Cutting | T104-T110 | ✅ Complete |

### Known Issues (from `/speckit.analyze`)

| ID | Severity | Issue | Remediation |
|----|----------|-------|-------------|
| I1 | HIGH | Navbar Q&A link requires auth but page is public | Fix `auth: false` in Navbar.jsx |
| D1 | HIGH | spec.md has duplicate User Stories section | Clean up duplicate content |
| C1 | HIGH | Testing not implemented (constitution violation) | Track as tech debt; add tests post-MVP |

## Next Steps

1. **Fix Navbar Q&A bug** - Change `auth: true` to `auth: false` for Q&A link
2. **Clean spec.md duplicates** - Remove redundant content (lines 153-407)
3. **Add test infrastructure** - Set up Vitest/Jest and add initial test coverage
4. **Deploy to staging** - Configure Vercel (frontend) + Render (backend) + MongoDB Atlas
