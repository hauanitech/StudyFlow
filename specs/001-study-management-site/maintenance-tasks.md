# Maintenance Tasks: Production Bugs & Optimization

**Branch**: `001-study-management-site`  
**Created**: 2026-01-30  
**Type**: Bug fixes, security hardening, performance optimization  
**Context**: Post-deployment audit findings from production environment

## Format: `- [ ] M### [P?] Description with file path`

- **M###**: Maintenance task ID (M001, M002, etc.)
- **[P]**: Parallelizable (can be done independently)
- **File path**: Exact location for changes

---

## Phase 1: Critical Security Fixes 🔥

**Priority**: URGENT - Fix before next deployment  
**Impact**: Security vulnerabilities, data exposure

- [ ] M001 Remove CSRF token debug logging from `backend/src/middleware/csrf.js` lines 50-56
- [ ] M002 Verify VITE_API_URL environment variable is set on Vercel deployment
- [ ] M003 Verify CORS_ORIGIN environment variable is set on Render deployment
- [ ] M004 Add rate limiting middleware for report creation endpoint in `backend/src/api/routes/reports.js` line 49
- [ ] M005 [P] Add spam prevention check (max 5 reports per user per hour) in `backend/src/services/moderationService.js`

**Validation**: Deploy to staging, verify no tokens in logs, test report spam protection

---

## Phase 2: Debug Code Cleanup 🧹

**Priority**: HIGH - Reduce log pollution  
**Impact**: Performance, log clarity, security

### Backend Debug Removal

- [ ] M006 [P] Create conditional logger utility in `backend/src/utils/logger.js`
- [ ] M007 Replace Socket.IO console.logs in `backend/src/realtime/socket.js` lines 39, 47, 52, 85
- [ ] M008 [P] Replace console.log in `backend/src/index.js` lines 13, 20, 24-25, 28
- [ ] M009 [P] Replace console.log/warn in `backend/src/db/mongoose.js` lines 8, 23, 27, 33, 43
- [ ] M010 Replace console.error in `backend/src/api/routes/qna.js` (15 instances - lines 79, 92, 107, 125, 150, 168, 193, 219, 238, 263, 289, 307, 332, 350, 367)
- [ ] M011 [P] Replace console.error in `backend/src/api/routes/reports.js` (9 instances - lines 60, 90, 102, 118, 132, 159, 186)

### Frontend Debug Removal

- [ ] M012 [P] Replace console.error in `frontend/src/services/socketClient.js` lines 28, 32, 36
- [ ] M013 [P] Replace console.error in `frontend/src/pages/StudyAdvicePage.jsx` line 173
- [ ] M014 [P] Replace console.error in `frontend/src/pages/QuestionDetailPage.jsx` lines 42, 67, 102, 113, 123, 160
- [ ] M015 [P] Replace console.error in `frontend/src/pages/QAPage.jsx` line 44
- [ ] M016 [P] Replace console.error in `frontend/src/pages/ModerationPage.jsx` lines 41, 61, 75
- [ ] M017 [P] Replace console.error in `frontend/src/pages/JournalPage.jsx` line 53
- [ ] M018 [P] Replace console.error in `frontend/src/components/qna/QuestionCard.jsx` line 19
- [ ] M019 [P] Replace console.error in `frontend/src/components/qna/AnswerList.jsx` line 30
- [ ] M020 [P] Replace console.error in `frontend/src/components/journal/JournalEditor.jsx` line 99
- [ ] M021 [P] Replace console.error in `frontend/src/components/friends/UserSearch.jsx` line 30
- [ ] M022 Keep console.error in `frontend/src/components/errors/ErrorBoundary.jsx` line 18 (legitimate error boundary)

**Validation**: Build production bundle, verify minimal console output

---

## Phase 3: Error Handling Consistency ⚠️

**Priority**: HIGH - Improve UX  
**Impact**: Consistent error messages, better debugging

- [ ] M023 Create AppError class extensions in `backend/src/middleware/errorHandler.js` for common errors (NotFoundError, ValidationError, UnauthorizedError)
- [ ] M024 Refactor error handling in `backend/src/api/routes/reports.js` to use AppError and next(error) pattern
- [ ] M025 [P] Refactor error handling in `backend/src/api/routes/qna.js` to use AppError and next(error) pattern
- [ ] M026 [P] Add error response type standardization test in `backend/tests/integration/error-handling.test.js`
- [ ] M027 Update frontend error display to handle standardized error format in `frontend/src/services/apiClient.js`

**Validation**: Test all error scenarios, verify consistent JSON structure

---

## Phase 4: API Design Improvements 🔧

**Priority**: MEDIUM - Better REST practices  
**Impact**: Developer experience, caching, consistency

### Route Consistency

- [ ] M028 Change `POST /questions/:id/close` to `PATCH /questions/:id` with `{closed: true, reason: "..."}` in `backend/src/api/routes/qna.js` line 174
- [ ] M029 Change `POST /answers/:id/accept` to `PATCH /answers/:id` with `{accepted: true}` in `backend/src/api/routes/qna.js` line 339
- [ ] M030 Change `DELETE /questions/:id/accepted-answer` to `PATCH /questions/:id` with `{acceptedAnswer: null}` in `backend/src/api/routes/qna.js` line 356
- [ ] M031 [P] Update frontend qnaApi.js to match new endpoints
- [ ] M032 [P] Update OpenAPI contract in `specs/001-study-management-site/contracts/openapi.yaml`

### Pagination Implementation

- [ ] M033 Add pagination params to GET /questions endpoint in `backend/src/api/routes/qna.js` line 60
- [ ] M034 [P] Add pagination params to GET /questions/:questionId/answers endpoint in `backend/src/api/routes/qna.js` line 228
- [ ] M035 [P] Add pagination to qnaService.getQuestions in `backend/src/services/qnaService.js`
- [ ] M036 [P] Add pagination to qnaService.getAnswers in `backend/src/services/qnaService.js`
- [ ] M037 Update frontend to handle pagination in `frontend/src/pages/QAPage.jsx`
- [ ] M038 [P] Update frontend to handle pagination in `frontend/src/pages/QuestionDetailPage.jsx`

**Validation**: Test with 100+ questions, verify page limits work

---

## Phase 5: Environment Configuration 🔐

**Priority**: MEDIUM - Prevent production fallback issues  
**Impact**: Production stability

- [ ] M039 Remove localhost fallback from `frontend/src/services/apiClient.js` line 1, fail fast if VITE_API_URL missing
- [ ] M040 [P] Remove localhost fallback from `backend/src/config/env.js` line 26, fail fast if CORS_ORIGIN missing
- [ ] M041 [P] Add environment validation script in `backend/src/config/validateEnv.js` that runs before server start
- [ ] M042 [P] Create `.env.production.template` for both frontend and backend
- [ ] M043 Update deployment docs in `README.md` with required environment variables

**Validation**: Test startup with missing env vars, should fail with clear message

---

## Phase 6: Data Integrity Checks 🛡️

**Priority**: MEDIUM - Prevent duplicate data  
**Impact**: Data consistency

- [ ] M044 Add unique compound index on FriendRequest model `(requester, recipient)` in `backend/src/models/FriendRequest.js`
- [ ] M045 [P] Add unique compound index on Friendship model `(user1, user2)` in `backend/src/models/Friendship.js`
- [ ] M046 [P] Add duplicate request check in friendsService.sendRequest in `backend/src/services/friendsService.js`
- [ ] M047 [P] Add self-friending prevention in friendsService.sendRequest in `backend/src/services/friendsService.js`
- [ ] M048 Add database migration script for existing data cleanup in `backend/migrations/001-remove-duplicate-friendships.js`

**Validation**: Try to send duplicate friend requests, should fail gracefully

---

## Phase 7: Socket.IO Security Hardening 🔒

**Priority**: MEDIUM - Prevent socket forgery  
**Impact**: Real-time security

- [ ] M049 Add chatId ownership validation before emitting in `backend/src/realtime/socket.js` send_message handler
- [ ] M050 [P] Add CSRF-like challenge token for socket events in `backend/src/realtime/socket.js`
- [ ] M051 [P] Add rate limiting for socket message events (max 10 messages per 10 seconds) in `backend/src/realtime/socket.js`
- [ ] M052 Add socket event validation middleware in `backend/src/realtime/socketMiddleware.js`
- [ ] M053 [P] Add socket security tests in `backend/tests/integration/socket-security.test.js`

**Validation**: Test socket message sending without proper membership, should fail

---

## Phase 8: Performance Optimizations 🚀

**Priority**: LOW - Future scaling  
**Impact**: Database performance

- [ ] M054 Add database indexes on frequently queried fields in `backend/src/models/Question.js` (createdAt, tags, author)
- [ ] M055 [P] Add database indexes on Chat.members in `backend/src/models/Chat.js`
- [ ] M056 [P] Add database indexes on Message.chatId and Message.createdAt in `backend/src/models/Message.js`
- [ ] M057 [P] Implement query result caching for study advice in `backend/src/services/adviceService.js`
- [ ] M058 Add connection pooling optimization in `backend/src/db/mongoose.js`

**Validation**: Run load tests, measure query performance before/after

---

## Phase 9: Testing Infrastructure 🧪

**Priority**: LOW - Long-term maintainability  
**Impact**: Regression prevention

### Backend Tests

- [ ] M059 Setup Jest test environment in `backend/package.json` and `backend/jest.config.js`
- [ ] M060 [P] Create test database setup/teardown utilities in `backend/tests/setup.js`
- [ ] M061 [P] Add auth flow tests in `backend/tests/integration/auth.test.js`
- [ ] M062 [P] Add chat tests in `backend/tests/integration/chats.test.js`
- [ ] M063 [P] Add Q&A tests in `backend/tests/integration/qna.test.js`
- [ ] M064 [P] Add friends tests in `backend/tests/integration/friends.test.js`

### Frontend Tests

- [ ] M065 Setup Vitest in `frontend/package.json` and `frontend/vitest.config.js`
- [ ] M066 [P] Add component tests for critical flows in `frontend/src/components/__tests__/`
- [ ] M067 [P] Add E2E tests with Playwright in `frontend/e2e/auth.spec.js`

**Validation**: All tests pass, CI integration successful

---

## Phase 10: Documentation & Monitoring 📊

**Priority**: LOW - Operational excellence  
**Impact**: Debugging, maintenance

- [ ] M068 Add structured logging with correlation IDs in `backend/src/middleware/requestLogger.js`
- [ ] M069 [P] Create API documentation from OpenAPI spec using Swagger UI
- [ ] M070 [P] Add health check endpoint improvements in `backend/src/api/index.js` (DB status, uptime, version)
- [ ] M071 [P] Create deployment runbook in `docs/deployment.md`
- [ ] M072 Create incident response guide in `docs/incidents.md`

---

## Summary & Execution Strategy

### Critical Path (Do First - Week 1)

1. **Phase 1**: Security fixes (M001-M005) - 1 day
2. **Phase 2**: Debug cleanup (M006-M022) - 2 days  
3. **Phase 3**: Error consistency (M023-M027) - 1 day
4. **Phase 5**: Env config (M039-M043) - 1 day

**Total**: 5 days to production-ready state

### Incremental Improvements (Week 2-3)

5. **Phase 4**: API improvements (M028-M038) - 3 days
6. **Phase 6**: Data integrity (M044-M048) - 2 days
7. **Phase 7**: Socket security (M049-M053) - 2 days

**Total**: 7 days to hardened state

### Future Work (Month 2)

8. **Phase 8**: Performance (M054-M058) - 3 days
9. **Phase 9**: Testing (M059-M067) - 5 days
10. **Phase 10**: Documentation (M068-M072) - 2 days

**Total**: 10 days to fully optimized state

### Parallel Execution Opportunities

**Day 1** (Can work in parallel):
- M001 (CSRF logging)
- M004 (Rate limiting)
- M005 (Spam prevention)
- M006 (Logger utility)

**Day 2-3** (Frontend/Backend split):
- Backend team: M007-M011 (Backend debug cleanup)
- Frontend team: M012-M021 (Frontend debug cleanup)

**Week 2** (API team):
- M028-M032 (Route refactoring - one developer)
- M033-M038 (Pagination - another developer)

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|---------|------------|
| Breaking changes in API refactor | Medium | High | Deploy to staging first, versioned API |
| Database migration fails | Low | Critical | Test on backup, rollback plan ready |
| Performance degradation | Low | Medium | Load testing before production |
| Cookie issues resurface | Low | High | Monitor auth errors after each deploy |

### Success Metrics

After completion:
- ✅ Zero CSRF tokens in production logs
- ✅ Error response structure 100% consistent
- ✅ No duplicate friend requests possible
- ✅ All endpoints paginated (default 20 items)
- ✅ 80%+ test coverage on critical paths
- ✅ Load time < 2s for 1000+ questions

---

## Notes

- All tasks marked [P] can be parallelized
- Test each phase in staging before production
- Commit after each task for easy rollback
- Update this file as tasks are completed
