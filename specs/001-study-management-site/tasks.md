# Tasks: Sleek Study Management Website

**Input**: Design documents from `/specs/001-study-management-site/`

## Format: `- [ ] T### [P?] [US#?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: User story label (required for user story tasks only)

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Create a clean React + Express + MongoDB workspace with consistent tooling.

- [x] T001 Create repo structure folders `backend/` and `frontend/` with placeholder `backend/README.md` and `frontend/README.md`
- [x] T002 Initialize backend Node project and scripts in `backend/package.json`
- [x] T003 [P] Initialize frontend React (Vite) project and scripts in `frontend/package.json`
- [x] T004 [P] Add lint/format config in `.editorconfig`, `.prettierrc`, `.prettierignore`, `.eslintrc.cjs`
- [x] T005 [P] Configure Tailwind CSS in `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/src/styles/index.css`
- [x] T006 [P] Configure React Router entry in `frontend/src/router.jsx` and mount in `frontend/src/main.jsx`
- [x] T007 Add environment templates in `backend/.env.example` and `frontend/.env.example`
- [x] T008 Configure backend CORS to support cookie auth in `backend/src/middleware/cors.js`
- [x] T009 Configure frontend API base URL + credentials default in `frontend/src/services/apiClient.js`
- [x] T010 Add dev scripts for backend (watch mode) in `backend/package.json` and server entry `backend/src/index.js`
- [x] T011 Add dev proxy (or documented CORS flow) in `frontend/vite.config.js`
- [x] T012 Document local run steps in `README.md` (root) aligned with `specs/001-study-management-site/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [x] T013 Create Express app bootstrap in `backend/src/app.js` (middleware, routes, error handling)
- [x] T014 [P] Implement env/config loader in `backend/src/config/env.js`
- [x] T015 [P] Implement MongoDB connection via Mongoose in `backend/src/db/mongoose.js`
- [x] T016 [P] Implement request logging middleware in `backend/src/middleware/requestLogger.js`
- [x] T017 Implement global error handler in `backend/src/middleware/errorHandler.js`
- [x] T018 [P] Implement Zod validation middleware helper in `backend/src/middleware/validate.js`
- [x] T019 [P] Implement JWT helpers (sign/verify access + refresh) in `backend/src/auth/jwt.js`
- [x] T020 Implement auth guard middleware in `backend/src/middleware/requireAuth.js`
- [x] T021 Implement CSRF protection middleware in `backend/src/middleware/csrf.js`
- [x] T022 [P] Create `User` Mongoose model in `backend/src/models/User.js`
- [x] T023 [P] Create `Profile` Mongoose model in `backend/src/models/Profile.js`
- [x] T024 Implement auth routes (`/auth/signup`, `/auth/login`, `/auth/logout`) in `backend/src/api/routes/auth.js`
- [x] T025 Implement current-user routes (`/users/me` GET/PATCH) in `backend/src/api/routes/users.js`
- [x] T026 Wire API routes into app in `backend/src/api/index.js` and mount from `backend/src/app.js`
- [x] T027 Serve OpenAPI contract for developer reference in `backend/src/api/openapi.js` (reads `specs/001-study-management-site/contracts/openapi.yaml`)
- [x] T028 Create Socket.IO server bootstrap in `backend/src/realtime/socket.js`
- [x] T029 [P] Create shared page shell layout in `frontend/src/components/layout/AppLayout.jsx`
- [x] T030 [P] Create responsive navbar component in `frontend/src/components/layout/Navbar.jsx`
- [x] T031 [P] Create route guard component in `frontend/src/components/auth/RequireAuth.jsx`
- [x] T032 [P] Implement auth state store/context in `frontend/src/state/authStore.js`
- [x] T033 Create global UI primitives (buttons/inputs) in `frontend/src/components/ui/`
- [x] T034 Create stub pages for navbar routes in `frontend/src/pages/LandingPage.jsx`, `frontend/src/pages/PomodoroPage.jsx`, `frontend/src/pages/JournalPage.jsx`, `frontend/src/pages/ProfilePage.jsx`, `frontend/src/pages/FriendsPage.jsx`, `frontend/src/pages/ChatsPage.jsx`, `frontend/src/pages/StudyAdvicePage.jsx`, `frontend/src/pages/AboutPage.jsx`, `frontend/src/pages/QAPage.jsx`
- [x] T035 Wire routes into router in `frontend/src/router.jsx` (all navbar pages + 404)

**Checkpoint**: Foundation ready — user stories can now be implemented.

---

## Phase 3: User Story 1 - Discover the Site + Start a Pomodoro (Priority: P1) 🎯 MVP ✅

**Goal**: A standout landing page + a fully working Pomodoro timer usable without an account.

**Independent Test**: Open landing page → navigate to Pomodoro → start/pause/resume/reset → observe phase transitions.

- [x] T036 [P] [US1] Implement landing hero + CTA section in `frontend/src/pages/LandingPage.jsx`
- [x] T037 [P] [US1] Implement reusable marketing section components in `frontend/src/components/landing/`
- [x] T038 [P] [US1] Implement Pomodoro timer hook/state machine in `frontend/src/hooks/usePomodoroTimer.js`
- [x] T039 [P] [US1] Build Pomodoro timer UI component in `frontend/src/components/pomodoro/PomodoroTimer.jsx`
- [x] T040 [P] [US1] Build Pomodoro settings (durations with bounds) in `frontend/src/components/pomodoro/PomodoroSettings.jsx`
- [x] T041 [US1] Integrate Pomodoro page layout + controls in `frontend/src/pages/PomodoroPage.jsx`
- [x] T042 [US1] Add navigation-away behavior (confirm/persist/stop) in `frontend/src/pages/PomodoroPage.jsx`
- [x] T043 [US1] Add completion cues (visual + optional sound) in `frontend/src/components/pomodoro/PomodoroTimer.jsx`

---

## Phase 4: User Story 2 - Sign In + Journal Daily (Priority: P2)

**Goal**: Users can sign up, sign in, and create/edit private journal entries per date.

**Independent Test**: Sign up → login → create today’s entry → refresh → confirm persistence → verify entries are private.

- [x] T044 [US2] Update API contract to include password reset endpoints in `specs/001-study-management-site/contracts/openapi.yaml`
- [x] T045 [P] [US2] Create `JournalEntry` model in `backend/src/models/JournalEntry.js`
- [x] T046 [P] [US2] Implement journals service in `backend/src/services/journalsService.js`
- [x] T047 [US2] Implement journal routes (`/journals`, `/journals/{date}`) in `backend/src/api/routes/journals.js`
- [x] T048 [US2] Wire journal routes in `backend/src/api/index.js`
- [x] T049 [P] [US2] Implement frontend auth page (login/signup) in `frontend/src/pages/AuthPage.jsx`
- [x] T050 [P] [US2] Implement auth API calls in `frontend/src/services/authApi.js`
- [x] T051 [P] [US2] Implement journaling API calls in `frontend/src/services/journalsApi.js`
- [x] T052 [P] [US2] Build journal editor component in `frontend/src/components/journal/JournalEditor.jsx`
- [x] T053 [US2] Implement Daily Journaling page in `frontend/src/pages/JournalPage.jsx`

---

## Phase 5: User Story 3 - Manage Profile (Priority: P3)

**Goal**: Users can view/update profile and control visibility; provide self-service account deletion.

**Independent Test**: Login → open Profile → update display name/visibility → refresh → changes persist; delete account removes private data.

- [x] T054 [P] [US3] Update API contract to add public profile endpoint in `specs/001-study-management-site/contracts/openapi.yaml`
- [x] T055 [P] [US3] Implement profile service in `backend/src/services/profileService.js`
- [x] T056 [US3] Extend users routes for public profile lookup in `backend/src/api/routes/users.js`
- [x] T057 [P] [US3] Implement account deletion service (delete/anonymize rules) in `backend/src/services/accountDeletionService.js`
- [x] T058 [US3] Add account deletion endpoint in `backend/src/api/routes/users.js`
- [x] T059 [P] [US3] Build profile form components in `frontend/src/components/profile/ProfileForm.jsx`
- [x] T060 [P] [US3] Implement profile API calls in `frontend/src/services/profileApi.js`
- [x] T061 [US3] Implement Profile page UI + save flow in `frontend/src/pages/ProfilePage.jsx`
- [x] T062 [US3] Add delete-account UI flow (confirmations) in `frontend/src/pages/ProfilePage.jsx`

---

## Phase 6: User Story 4 - Add/Remove Friends (Priority: P4)

**Goal**: Users can send/accept/decline friend requests and manage friend list.

**Independent Test**: User A sends request to User B → B accepts → both see each other as friends → remove friend.

- [x] T063 [P] [US4] Create `FriendRequest` model in `backend/src/models/FriendRequest.js`
- [x] T064 [P] [US4] Create `Friendship` model in `backend/src/models/Friendship.js`
- [x] T065 [P] [US4] Implement friends service (requests + friendships) in `backend/src/services/friendsService.js`
- [x] T066 [US4] Implement friends routes in `backend/src/api/routes/friends.js`
- [x] T067 [US4] Wire friends routes in `backend/src/api/index.js`
- [x] T068 [P] [US4] Implement friends API client in `frontend/src/services/friendsApi.js`
- [x] T069 [P] [US4] Build friend request UI components in `frontend/src/components/friends/`
- [x] T070 [US4] Implement Friends page UI (list + requests) in `frontend/src/pages/FriendsPage.jsx`

---

## Phase 7: User Story 5 - Chat with Friends (1:1 and Group) (Priority: P5)

**Goal**: Users can create direct and group chats with friends and exchange messages; members-only access.

**Independent Test**: Two users create a direct chat and exchange messages; create group chat and verify all members receive messages.

- [x] T071 [P] [US5] Create `Chat` model in `backend/src/models/Chat.js`
- [x] T072 [P] [US5] Create `ChatMembership` model in `backend/src/models/ChatMembership.js`
- [x] T073 [P] [US5] Create `Message` model in `backend/src/models/Message.js`
- [x] T074 [P] [US5] Implement chats service (membership checks, history) in `backend/src/services/chatsService.js`
- [x] T075 [US5] Implement chats routes (`/chats`, `/chats/{id}`, `/messages`, `/leave`) in `backend/src/api/routes/chats.js`
- [x] T076 [US5] Wire chats routes in `backend/src/api/index.js`
- [x] T077 [US5] Implement Socket.IO events (join chat, new message) in `backend/src/realtime/socket.js`
- [x] T078 [P] [US5] Implement chats API client in `frontend/src/services/chatsApi.js`
- [x] T079 [P] [US5] Implement Socket.IO client wrapper in `frontend/src/services/socketClient.js`
- [x] T080 [P] [US5] Build chat UI components (sidebar, message list, composer) in `frontend/src/components/chats/`
- [x] T081 [US5] Implement Chats page UI (list, create direct/group, leave group) in `frontend/src/pages/ChatsPage.jsx`

---

## Phase 8: User Story 6 - Get Study Advice (Priority: P6)

**Goal**: Users can browse study strategies by category/topic in a scannable format.

**Independent Test**: Open Study Advice → filter by category → read an item with steps.

- [x] T082 [P] [US6] Create seed advice content in `backend/src/data/studyAdvice.json`
- [x] T083 [P] [US6] Implement advice service in `backend/src/services/adviceService.js`
- [x] T084 [US6] Implement advice routes (`/advice`) in `backend/src/api/routes/advice.js`
- [x] T085 [US6] Wire advice routes in `backend/src/api/index.js`
- [x] T086 [P] [US6] Implement advice API client in `frontend/src/services/adviceApi.js`
- [x] T087 [US6] Implement Study Advice page UI (filter + detail view) in `frontend/src/pages/StudyAdvicePage.jsx`

---

## Phase 9: User Story 7 - Ask and Answer Questions (Q&A) (Priority: P7)

**Goal**: Users can post questions, answer, vote, search, and report abusive content; moderators can review reports.

**Independent Test**: User posts question → another answers → vote works once per user → search finds question → report creates a moderation item.

- [x] T088 [P] [US7] Create `Question` model in `backend/src/models/Question.js`
- [x] T089 [P] [US7] Create `Answer` model in `backend/src/models/Answer.js`
- [x] T090 [P] [US7] Create `Vote` model in `backend/src/models/Vote.js`
- [x] T091 [P] [US7] Create `Report` model in `backend/src/models/Report.js`
- [x] T092 [P] [US7] Implement Q&A service in `backend/src/services/qnaService.js`
- [x] T093 [P] [US7] Implement moderation service in `backend/src/services/moderationService.js`
- [x] T094 [US7] Implement Q&A routes in `backend/src/api/routes/qna.js`
- [x] T095 [US7] Implement report routes in `backend/src/api/routes/reports.js`
- [x] T096 [P] [US7] Update API contract for moderation endpoints in `specs/001-study-management-site/contracts/openapi.yaml`
- [x] T097 [US7] Wire Q&A routes in `backend/src/api/index.js`
- [x] T098 [P] [US7] Implement Q&A API client in `frontend/src/services/qnaApi.js`
- [x] T099 [P] [US7] Build Q&A UI components (feed, question form, answer list) in `frontend/src/components/qna/`
- [x] T100 [US7] Implement Q&A page UI (browse + search + create + detail) in `frontend/src/pages/QAPage.jsx`
- [x] T101 [P] [US7] Build moderation UI components in `frontend/src/components/moderation/`
- [x] T102 [US7] Implement Moderator view (reports queue) in `frontend/src/pages/ModerationPage.jsx`

---

## Phase 10: User Story 8 - Learn About the Product (About Page) (Priority: P8)

**Goal**: Provide a clear About page explaining mission and how to get started.

**Independent Test**: Navigate to About from navbar and confirm content is readable and matches product intent.

- [x] T103 [US8] Write About page content and layout in `frontend/src/pages/AboutPage.jsx`

---

## Phase 11: Polish & Cross-Cutting Concerns ✅

**Purpose**: Hardening, UX consistency, and operational readiness across all stories.

- [x] T104 [P] Add loading + error states for API-driven pages in `frontend/src/components/ui/LoadingState.jsx` and `frontend/src/components/ui/ErrorState.jsx`
- [x] T105 [P] Add frontend error boundary in `frontend/src/components/errors/ErrorBoundary.jsx`
- [x] T106 Harden input sanitization for user-generated content in `backend/src/utils/sanitize.js`
- [x] T107 Add basic rate limiting on auth and posting endpoints in `backend/src/middleware/rateLimit.js`
- [x] T108 Ensure mobile/tablet responsiveness for all pages in `frontend/src/styles/index.css` and relevant page components under `frontend/src/pages/`
- [x] T109 Add accessibility pass (focus styles, aria labels) in `frontend/src/components/layout/Navbar.jsx` and `frontend/src/components/ui/`
- [x] T110 Validate quickstart flow and update docs in `specs/001-study-management-site/quickstart.md`

---

## 🎉 PROJECT COMPLETE

All 110 tasks across 11 phases have been implemented:

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Project Setup | T001-T009 | ✅ Complete |
| Phase 2: Foundational Backend | T010-T035 | ✅ Complete |
| Phase 3: US1 Landing + Pomodoro | T036-T044 | ✅ Complete |
| Phase 4: US2 Auth + Journal | T045-T056 | ✅ Complete |
| Phase 5: US3 Profile | T057-T062 | ✅ Complete |
| Phase 6: US4 Friends | T063-T070 | ✅ Complete |
| Phase 7: US5 Chats | T071-T081 | ✅ Complete |
| Phase 8: US6 Study Advice | T082-T087 | ✅ Complete |
| Phase 9: US7 Q&A System | T088-T102 | ✅ Complete |
| Phase 10: US8 About Page | T103 | ✅ Complete |
| Phase 11: Polish | T104-T110 | ✅ Complete |

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → blocks everything else
- **Phase 2 (Foundational)** → blocks all user stories
- **Phases 3–10 (User Stories)** → can proceed after Phase 2, ideally in priority order
- **Phase 11 (Polish)** → after desired user stories are complete

### User Story Dependencies (recommended)

- **US1 (Pomodoro + Landing)**: depends on Phase 2 only
- **US2 (Auth + Journal)**: depends on Phase 2 only
- **US3 (Profile)**: depends on US2 (requires auth)
- **US4 (Friends)**: depends on US2 (requires auth) and benefits from US3 (profile data)
- **US5 (Chats)**: depends on US4 (friends are the starting point for chats)
- **US6 (Study Advice)**: depends on Phase 2 only
- **US7 (Q&A)**: depends on US2 (auth) and Phase 2
- **US8 (About)**: depends on Phase 2 only

### Dependency Graph (user stories)

US1
US2 → US3 → US4 → US5
US6
US7
US8

---

## Parallel Execution Examples (per User Story)

### US1

- Run in parallel:
  - T036 (Landing hero) + T038 (Pomodoro timer hook) + T040 (Pomodoro settings)

### US2

- Run in parallel:
  - T045 (Journal model) + T049 (Auth page) + T051 (Journals API client)

### US3

- Run in parallel:
  - T057 (Account deletion service) + T059 (Profile form UI) + T060 (Profile API)

### US4

- Run in parallel:
  - T063 (FriendRequest model) + T064 (Friendship model) + T069 (Friends UI components)

### US5

- Run in parallel:
  - T071–T073 (Chat-related models) + T078 (Chats API client) + T080 (Chat UI components)

### US6

- Run in parallel:
  - T082 (Seed content) + T086 (Advice API client)

### US7

- Run in parallel:
  - T088–T091 (Q&A models) + T098 (Q&A API client) + T099 (Q&A UI components)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1)
4. Validate US1 independently (landing + Pomodoro)

### Incremental Delivery

- Add US2 next for persistence + daily habit value
- Add US3 + US4 to unlock social identity and friends
- Add US5 to unlock real-time accountability
- Add US6/US7/US8 as content/community layers
