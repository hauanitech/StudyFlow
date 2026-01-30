# Phase 0 Research: Sleek Study Management Website

**Branch**: `001-study-management-site`  
**Date**: 2026-01-29

## Decisions

### Decision 1: ODM choice
- **Decision**: Use Mongoose.
- **Rationale**: Fast schema definition, built-in validation hooks, indexing declarations, and widely-used patterns for Mongo-backed apps.
- **Alternatives considered**:
  - Native MongoDB driver (more control, less structure)
  - Typegoose (adds typing convenience but adds another abstraction)

### Decision 2: Auth strategy
- **Decision**: JWT access token + refresh token stored in `httpOnly` cookies; CSRF protection for state-changing requests.
- **Rationale**: Works well for SPA + API; avoids localStorage token leakage; supports refresh without forcing frequent logins.
- **Alternatives considered**:
  - Session cookies (simple, but requires server-side session storage strategy)
  - OAuth only (out of scope for MVP)

### Decision 3: Real-time chat transport
- **Decision**: Socket.IO for realtime message delivery + REST endpoints for history.
- **Rationale**: Handles reconnection and fallback transports; easy to integrate with Express.
- **Alternatives considered**:
  - Native WebSocket (lower-level; more DIY work)

### Decision 4: Frontend styling system
- **Decision**: Tailwind CSS.
- **Rationale**: Enables a “sleek” look quickly with consistent spacing/typography and responsive utilities.
- **Alternatives considered**:
  - CSS Modules (fine, but slower to build a cohesive design system)
  - MUI/Chakra (fast, but more opinionated visuals)

### Decision 5: Frontend routing and state
- **Decision**: React Router for navigation; keep state minimal with component state + a lightweight store (Zustand) if needed.
- **Rationale**: Simple MVP needs; avoids over-architecting.
- **Alternatives considered**:
  - Redux Toolkit (great for large apps, but more boilerplate)

### Decision 6: Validation and sanitization
- **Decision**: Validate request bodies with Zod on the backend; sanitize user-generated text (basic HTML stripping) before storing/displaying.
- **Rationale**: Keeps contracts explicit; reduces injection risks; consistent error reporting.
- **Alternatives considered**:
  - express-validator (works, but tends to be more verbose)

### Decision 7: Test runner
- **Decision**: Use Vitest for frontend; Jest for backend + Supertest.
- **Rationale**: Frontend tooling is straightforward with Vitest/Vite; Jest/Supertest is a common, stable combo for Express API tests.
- **Alternatives considered**:
  - Use Vitest for both (possible, but less common for Express test stacks)

## Open Questions (resolved by best-guess)

- **Moderation role**: Include a basic `moderator` role with ability to mark reports as reviewed and remove Q&A content.
- **Account deletion handling**: Anonymize authored Q&A content (retain community value) and delete private content (journals, direct identifiers) within 30 days.
