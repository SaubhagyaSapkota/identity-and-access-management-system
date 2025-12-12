# Identity & Access Management

- A production ready authentication and authorization backend build with Node.js, TypeScript, and JWT.
- Includes RBAC, PBAC, session management, and secure developer-friendly APIs.
- Implemented Redis for managing ephemeral data like user sessions and authentication tokens.

## Features

### Authentication

- User Registration & Login
- Email Verification (JWT-based)
- Logout & Logout-All-Sessions
- Forget/Reset Password
- Resend Verification Email
- Secure password hashing (bcrypt)
- Request validation (Zod)

### Authorization

- Role-Based Access Control
  1. Build-in roles: user, admin.
  2. Role hierarchy & restricted endpoints.
- Permission-Based Access Control
  1. Fine-grained permissions
  2. Per-route & per-resource authorization middleware.

### Session Management

- JWT Access Token & Refresh Token Rotation
- Device-based sessions stored in PostgreSQL
- Redis-backed session caching for high performance
- "Logout from all device" support
- Automatic session cleanup on expiry

### Redis Integration

- Session Caching
- Session Tracking
- Token Mapping
- Token Blacklisting

### Post Management (CURD)

- Users can create posts about bugs, errors and issues they face during development.
- Proper file handling where users can upload images (any format) and PDF.
- Description for why such issues occured and what they did to solve it.
- Role and Permission based access control for post opeartions.

## Project Architecture

- Route -> validator -> Controller -> Service -> Repository pattern
- Clean separation of concerns
- Testable & Production scalable
- Layred architecture with clear responsibilities:

1.  Routes: Defines endpoints and middleware chain
2.  Validators: Request validation using Zod schemas
3.  Contollers: HTTP request/response handling
4.  Services: Business logic and orchestration
5.  Repositories: Database operations and queries
6.  Redis Service: Caching and session managemant layer

## Tech Stack

- Backend: Node.js, TypeScript
- Framework: Express.js
- Auth: JWT, Refresh Tokens
- Caching: Redis (Session management, token blacklisting)
- Validation: Zod (Runtime type checking)
- Database: PostgreSQL
- Security: Bcrypt
- Utilities: Send-grid (for email)
