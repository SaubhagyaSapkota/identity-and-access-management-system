# Identity & Access Management
- A production ready authentication and authorization backend build with Node.js, TypeScript, and JWT.
- Includes RBAC, PBAC, session management, and secure developer-friendly APIs.

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
 - Device-based sessions stored
 - "Logout from all device" support

### Post Management (CURD)
- Users can create posts about bugs, errors and issues they face during development. 
- Proper file handling where users can upload images (any format) and PDF.
- Description for why such issues occured and what they did to solve it.

## Project Architecture
- Route -> validator -> Controller -> Service -> Repository pattern
- Clean separation of concerns
- Testable & Production scalable

## Tech Stack
- Backend: Node.js, TypeScript
- Framework: Express.js
- Auth: JWT, Refresh Tokens
- Validation: Zod
- Database: PostgreSQL
- Security: Bcrypt
- Utilities: Send-grid (for email)





