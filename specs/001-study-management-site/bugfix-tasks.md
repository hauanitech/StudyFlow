# Bugfix Tasks: Post-Analysis Corrections

**Branch**: `001-study-management-site`  
**Created**: 2026-02-03  
**Source**: `/speckit.analyze` output (2026-02-01)
**Status**: 1/5 tasks completed

## Format: `- [ ] B### [P?] Description with file path`

- **B###**: Bugfix task ID
- **[P]**: Parallelizable (can be done independently)

---

## Phase 1: Critical Bug Fixes 🔥

**Priority**: HIGH - Fix immediately  
**Impact**: User experience, functionality broken

### B001 - Navbar Q&A Link Auth Mismatch

**Issue**: Q&A link in navbar requires authentication (`auth: true`) but the Q&A page is PUBLIC in router.jsx (no `RequireAuth` wrapper). Users not logged in cannot see the Q&A link even though they can access `/qa` directly.

**Root Cause**: Inconsistency between Navbar.jsx (line 70) and router.jsx (line 58)

**Fix**:
- [x] B001 Change Q&A link from `auth: true` to `auth: false` in `frontend/src/components/layout/Navbar.jsx` line 70

**Expected State After Fix**:
```jsx
// Navbar.jsx line 70
{ to: '/qa', label: 'Q&A', icon: Icons.qna },  // No auth property = public
```

**Verification**: 
1. Open site without logging in
2. Verify "Q&A" link appears in navbar
3. Click Q&A link → should navigate to Q&A page
4. Verify question list is visible

---

## Phase 2: Documentation Cleanup 📝

**Priority**: MEDIUM - Improve maintainability  
**Impact**: Spec clarity, reduce confusion

### B002-B003 - spec.md Duplicate Content

**Issue**: spec.md has duplicated sections:
- User Stories 4-8 appear twice (lines ~60-130 AND lines ~268-340)
- Functional Requirements listed twice with different numbering
- Edge Cases section duplicated

**Root Cause**: Copy-paste error during spec creation

**Fix**:
- [ ] B002 [P] Remove duplicate User Stories section from `specs/001-study-management-site/spec.md` (lines 268-340)
- [ ] B003 [P] Remove duplicate Functional Requirements section from `specs/001-study-management-site/spec.md` (lines 319-366)

**Verification**: spec.md has single source of truth for each section

---

## Phase 3: Constitution Compliance ⚖️

**Priority**: LOW - Track as tech debt  
**Impact**: Code quality, maintainability

### B004-B005 - Testing Infrastructure

**Issue**: Constitution v2.0.0 mandates 80% test coverage for services and routes, but no tests exist.

**Decision**: Documented as tech debt in plan.md. Tests deferred for post-MVP.

**Tracking Tasks**:
- [ ] B004 Create test infrastructure setup task in backlog for `backend/tests/` (Jest + Supertest)
- [ ] B005 Create test infrastructure setup task in backlog for `frontend/src/test/` (Vitest + RTL)

---

## Dependencies

```
B001 (standalone) - can be done immediately
B002-B003 (standalone) - can be done in parallel
B004-B005 (standalone) - backlog items, no immediate action
```

## Parallel Execution

All tasks in Phase 1 and Phase 2 can be executed in parallel:
- B001: Navbar fix
- B002 + B003: Spec cleanup (different sections)

## Summary

| Phase | Tasks | Priority | Status |
|-------|-------|----------|--------|
| Phase 1: Critical Bugs | B001 | HIGH | ✅ Complete |
| Phase 2: Doc Cleanup | B002-B003 | MEDIUM | Not started |
| Phase 3: Tech Debt | B004-B005 | LOW | Backlog |

**Total**: 5 tasks (1 critical ✅, 2 medium, 2 low priority)
