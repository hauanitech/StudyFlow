<!--
SYNC IMPACT REPORT - v2.0.0 (2026-02-01)

VERSION CHANGE: 1.0.0 → 2.0.0
BUMP RATIONALE: MAJOR - Complete rewrite from generic web app template to StudyFlow-specific 
constitution with project-specific technology stack, security requirements, and governance model.

MODIFIED PRINCIPLES:
- I. Separation of Concerns → Enhanced with React/Express specifics
- II. API-First Design → Enhanced with JWT authentication specifics
- III. Database Integrity → MongoDB-specific validation and schema design
- IV. Security → Enhanced with CSRF, rate limiting, Socket.IO security
- V. Testing → Enhanced with React Testing Library, contract testing

ADDED SECTIONS:
- VI. Real-time Communication (Socket.IO principles)
- VII. User Experience & Accessibility (frontend-specific)
- Technology Stack (React, Express, MongoDB, Socket.IO specifics)

REMOVED SECTIONS: None (all generic principles enhanced)

TEMPLATES STATUS:
- ✅ plan-template.md: Constitution Check section aligns with new principles
- ✅ spec-template.md: User Stories format compatible with new testing requirements
- ✅ tasks-template.md: Task organization supports new security & testing principles
- ✅ No command files exist yet in .specify/templates/commands/

FOLLOW-UP TODOS: None - all placeholders resolved

NEXT ACTIONS:
- Consider adding .specify/templates/commands/ directory with command workflows
- Monitor for new security requirements as features are implemented
-->

# StudyFlow Constitution

## Core Principles

### I. Separation of Concerns
- Backend (Express.js) handles business logic, authentication, and API endpoints
- Frontend (React) manages presentation, user interactions, and client-side state
- Database (MongoDB) manages data persistence with Mongoose schemas
- Real-time layer (Socket.IO) handles bidirectional event-driven communication
- Clear separation between frontend and backend with API-only communication
- Services layer isolates business logic from route handlers
- Middleware handles cross-cutting concerns (auth, validation, logging, rate limiting)

**Rationale**: Modular architecture enables independent testing, parallel development, and easier 
maintenance. Each layer has a single responsibility, reducing coupling and improving code quality.

### II. API-First Design
- RESTful API endpoints with consistent resource-based naming (e.g., `/api/users`, `/api/journals`)
- JSON request/response format for all API communication
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500) and standardized error responses
- OpenAPI/Swagger documentation for all public endpoints
- JWT-based authentication using httpOnly cookies (no localStorage tokens)
- Authentication middleware (`requireAuth`) protects all sensitive endpoints
- API versioning strategy for backward compatibility (when breaking changes are necessary)

**Rationale**: API-first design ensures frontend and backend can evolve independently, enables 
third-party integrations, and provides clear contracts for testing and documentation.

### III. Database Integrity
- MongoDB with Mongoose for schema enforcement and validation
- Data validation at both application level (Mongoose schemas) and API level (express-validator)
- Referential integrity enforced through Mongoose virtuals and middleware
- Database indexes on frequently queried fields (userId, createdAt, etc.)
- No direct database queries in route handlers - all queries through service layer
- Soft deletes for user data to support account recovery and audit trails
- Regular automated backups and point-in-time recovery capability

**Rationale**: Multi-layer validation prevents invalid data from entering the system. Service-layer 
abstraction allows for consistent error handling and makes business logic testable without database.

### IV. Security
- Input validation and sanitization for all user inputs (using express-validator and DOMPurify)
- JWT authentication required for all protected endpoints
- CSRF protection for state-changing operations using CSRF tokens
- Rate limiting on authentication endpoints and resource-intensive operations
- Environment variables for all sensitive configuration (secrets, API keys, database URIs)
- NoSQL injection prevention through Mongoose parameterized queries
- Content Security Policy (CSP) headers to prevent XSS attacks
- CORS configuration restricts requests to trusted origins only
- Password hashing using bcrypt with appropriate salt rounds (minimum 10)
- Session management with secure, httpOnly, sameSite cookies
- Security headers (helmet.js) applied to all responses
- Regular dependency audits (`npm audit`) and timely security patches

**Rationale**: Defense-in-depth approach with multiple security layers ensures that a single 
vulnerability doesn't compromise the entire system. Security must be built-in, not bolted-on.

### V. Testing
- Unit tests for business logic (services layer) isolated from database and HTTP
- Integration tests for API endpoints with test database
- Contract tests for API responses matching OpenAPI specifications
- React component tests using React Testing Library
- End-to-end tests for critical user journeys (authentication, journaling, chat)
- Test coverage minimum of 80% for services and routes
- Continuous integration (CI) runs all tests on every pull request
- Test data factories/fixtures for consistent test setup
- Mocking strategy: mock external services, use real database for integration tests

**Rationale**: Comprehensive testing catches regressions early, documents expected behavior, and 
enables confident refactoring. Testing at multiple levels ensures both units and integrations work.

### VI. Real-time Communication
- Socket.IO for bidirectional event-driven communication (chat, notifications)
- JWT authentication required for WebSocket connections
- Room-based access control for chat channels (users must be members)
- Event validation and sanitization for all incoming socket messages
- Graceful degradation when WebSocket connection fails (polling fallback)
- Rate limiting on socket events to prevent abuse
- Connection state management and automatic reconnection on client side

**Rationale**: Real-time features require special security and performance considerations. Clear 
patterns for socket event handling prevent security vulnerabilities and performance issues.

### VII. User Experience & Accessibility
- Responsive design supporting mobile, tablet, and desktop viewports
- Loading states for all asynchronous operations
- Error messages that are user-friendly and actionable (no technical jargon)
- Form validation with immediate feedback (client-side) and server-side verification
- Keyboard navigation support for all interactive elements
- ARIA labels and semantic HTML for screen reader compatibility
- Focus management for modal dialogs and dynamic content
- Performance budget: First Contentful Paint < 2s, Time to Interactive < 3.5s

**Rationale**: Accessibility is a right, not a feature. Good UX reduces support burden and 
increases user satisfaction. Performance directly impacts user retention and engagement.

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js (RESTful API server)
- **Database**: MongoDB (document database) with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing
- **Real-time**: Socket.IO for WebSocket communication
- **Validation**: express-validator for request validation
- **Security**: helmet (security headers), cors, csrf (CSRF protection)
- **Logging**: Winston or similar structured logging framework
- **Environment**: dotenv for environment variable management
- **API Documentation**: Swagger/OpenAPI specification

### Frontend
- **Framework**: React 18+ (functional components with hooks)
- **Routing**: React Router v6+ for client-side navigation
- **Styling**: Tailwind CSS for utility-first styling
- **HTTP Client**: Axios or Fetch API for API communication
- **State Management**: React Context API + hooks for global state (Zustand for complex state)
- **Real-time**: Socket.IO client for WebSocket communication
- **Build Tool**: Vite for fast development and optimized production builds
- **Testing**: Vitest + React Testing Library

### Development
- **Version Control**: Git with feature branch workflow
- **Package Manager**: npm (lock file must be committed)
- **Code Quality**: ESLint (JavaScript/React rules) + Prettier (formatting)
- **Pre-commit Hooks**: Husky + lint-staged for automated quality checks
- **Environment**: Separate `.env` files for development, staging, production
- **Deployment**: Vercel (frontend), Render/Railway (backend), MongoDB Atlas (database)

## Development Standards

### Code Organization

**Backend Structure**:
```
backend/src/
├── api/           # API routes and OpenAPI spec
├── auth/          # JWT utilities and authentication logic
├── config/        # Environment configuration and validation
├── db/            # Database connection setup
├── middleware/    # Express middleware (auth, validation, logging, rate limiting)
├── models/        # Mongoose schemas and models
├── realtime/      # Socket.IO server and event handlers
├── services/      # Business logic isolated from routes
└── utils/         # Helper functions (logger, sanitization)
```

**Frontend Structure**:
```
frontend/src/
├── components/    # Reusable React components organized by feature
├── hooks/         # Custom React hooks
├── pages/         # Page-level components matching routes
├── services/      # API client modules
├── state/         # Context providers and stores
├── styles/        # Global CSS and Tailwind configuration
└── utils/         # Helper functions
```

**Naming Conventions**:
- Files: kebab-case for utility files, PascalCase for React components
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE
- React components: PascalCase (matching filename)
- API routes: lowercase with hyphens (e.g., `/api/journal-entries`)

### Database Management
- Mongoose schemas define all model structures with validation rules
- Schema changes versioned in code (no separate migration files for MongoDB)
- Database initialization scripts for development seed data
- No direct database access in route handlers - use service layer
- Indexes created programmatically in schema definitions
- Production database access restricted to deployment automation and emergency procedures

### Error Handling
- Centralized error handling middleware in `backend/src/middleware/errorHandler.js`
- Structured error responses: `{ error: { message, code, details } }`
- HTTP status codes reflect actual error type (400 client, 500 server)
- Validation errors include field-specific messages
- Errors logged with correlation IDs for debugging
- Never expose stack traces or sensitive data in production error responses
- Frontend displays user-friendly error messages with recovery suggestions

### API Security Checklist
- [ ] Route protected with `requireAuth` middleware (if authentication required)
- [ ] Input validated with `validate` middleware + express-validator rules
- [ ] User authorization checked (user can only access their own resources)
- [ ] Rate limiting applied (if resource-intensive or authentication endpoint)
- [ ] CSRF token validated (for state-changing operations from browser)
- [ ] Output sanitized (especially user-generated content)
- [ ] Logging includes user ID and action for audit trail

## Governance

### Change Management
- All code changes submitted via pull requests (no direct commits to `main`)
- Pull requests require passing CI checks (linting, tests, build)
- Code reviews required for all backend changes (security implications)
- Frontend changes can be merged after automated checks for low-risk updates
- Breaking API changes require version bump and backward compatibility plan

### Testing Requirements
- New features MUST include tests demonstrating acceptance criteria
- Bug fixes MUST include regression test preventing recurrence
- API endpoints MUST have contract tests verifying OpenAPI spec compliance
- Services MUST have unit tests with minimum 80% coverage
- CI pipeline MUST pass before merge

### Security & Compliance
- Security vulnerabilities addressed within 48 hours of discovery
- Dependencies updated monthly (security patches applied immediately)
- `npm audit` run before every deployment (no high/critical vulnerabilities)
- User data handling complies with privacy best practices (encryption at rest/transit)
- Account deletion MUST permanently remove all user data within 30 days

### Documentation
- OpenAPI specification kept in sync with API implementation
- README files maintained for both frontend and backend
- Feature specifications in `/specs/[###-feature-name]/spec.md` before implementation
- Inline comments for complex business logic only (code should be self-documenting)
- Architecture Decision Records (ADRs) for significant technical decisions

### Version Control
- Semantic versioning for releases (MAJOR.MINOR.PATCH)
- Feature branches named `###-feature-name` matching spec directory
- Commit messages follow Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)
- Main branch always deployable (protected branch with status checks)

**Constitution Version**: 2.0.0  
**Ratification Date**: 2026-01-29  
**Last Amended**: 2026-02-01
