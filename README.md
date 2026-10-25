# 🚀 Project Review Portal — Backend API

An enterprise-grade, role-based RESTful API built for managing project submissions, student evaluations, mentor code reviews, and administrative audit logging.

Built with **Node.js**, **Express**, **TypeScript**, **Prisma 7 (PostgreSQL)**, and **Redis**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture & Folder Structure](#-system-architecture--folder-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Variables](#-environment-variables)
- [Database Management (Prisma 7)](#-database-management-prisma-7)
- [Available Scripts](#-available-scripts)
- [API Reference](#-api-reference)
  - [Health Check](#health-check)
  - [Authentication Endpoints (`/api/v1/auth`)](#authentication-endpoints-apiv1auth)
  - [User Management Endpoints (`/api/v1/users`)](#user-management-endpoints-apiv1users)
  - [Submission & Review Endpoints (`/api/v1/submissions`)](#submission--review-endpoints-apiv1submissions)
  - [Audit Log Endpoints (`/api/v1/audit-logs`)](#audit-log-endpoints-apiv1audit-logs)
- [Error Handling & Response Format](#-error-handling--response-format)
- [Security & Rate Limiting](#-security--rate-limiting)
- [Deployment (Vercel)](#-deployment-vercel)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

The **Project Review Portal Server** is the core backend engine powering the Project Review platform. It coordinates interactions between three primary user roles:

1. **Students**: Submit project repositories, live URLs, technology stack details, and monitor evaluation progress.
2. **Mentors**: Review submissions, provide detailed feedback comments, and approve or reject submissions.
3. **Admins**: Manage user roles, inspect platform metrics and statistical distributions, and view comprehensive, tamper-evident audit logs.

---

## ✨ Key Features

- **Robust Authentication & OTP Verification**:
  - Secure email registration with 6-digit OTP stored in Redis with automatic TTL expiration.
  - Styled HTML transactional emails powered by **EJS** and **Nodemailer**.
  - Password recovery flow with time-limited OTP validation.
- **Dual-Token JWT Security Architecture**:
  - Short-lived Access Tokens and long-lived Refresh Tokens delivered securely via **HTTP-only, SameSite Cookies**.
  - Refresh token rotation endpoint for seamless session renewal.
- **Role-Based Access Control (RBAC)**:
  - Strict middleware guards (`authenticate` and `authorize`) enforcing permissions for `STUDENT`, `MENTOR`, and `ADMIN`.
- **Project Submission Lifecycle**:
  - Duplicate repository prevention and duplicate project name protection per student.
  - Server-side filtering by submission status (`PENDING`, `APPROVED`, `REJECTED`) and project type (`WEB`, `MOBILE`, `OTHER`).
  - Full-text search across project names, student names, and student emails.
  - Dynamic aggregation statistics (total submissions, approval rate, status counts, breakdown by project type).
  - Rate limiting on submission creation to prevent spam (5 submissions / 15 minutes per IP).
- **Automated Database Seeding**:
  - Automatically seeds default Mentor and Admin credentials on server initialization if not already present.
- **Audit Logging System**:
  - Automatic event logging for critical activities (registrations, logins, password changes, submission reviews, deletions, role updates).
  - Searchable and filterable by user, action type, and date range.
- **Modern Prisma 7 Multi-File Schema**:
  - Modular schema layout separated into `user.prisma`, `submission.prisma`, `auditLog.prisma`, and `enums.prisma`.
  - Native PostgreSQL connection pooling via `@prisma/adapter-pg`.

---

## 🛠 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | [Node.js](https://nodejs.org/) (ES Modules) | Server-side JavaScript runtime |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (v5) | Strongly typed programming language |
| **Framework** | [Express.js](https://expressjs.com/) (v4) | Fast, unopinionated web framework |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational SQL database |
| **ORM** | [Prisma 7](https://www.prisma.io/) | Next-generation Node.js & TypeScript ORM with multi-file schema support |
| **Caching / Store**| [Redis](https://redis.io/) (v6 client) | In-memory key-value store for OTPs & session expiration |
| **Validation** | [Zod](https://zod.dev/) | TypeScript-first schema declaration and validation |
| **Security** | [Bcrypt](https://github.com/kelektiv/node.bcrypt.js), [JSONWebToken](https://github.com/auth0/node-jsonwebtoken) | Password hashing and JWT token management |
| **Email Service**| [Nodemailer](https://nodemailer.com/) + [EJS](https://ejs.co/) | Transactional email delivery with HTML templates |
| **Build Tool** | [tsup](https://tsup.egoist.dev/) | Zero-config TypeScript bundler powered by esbuild |
| **Dev Tooling** | [tsx](https://github.com/privatenumber/tsx) | Ultra-fast TypeScript execute and watch tool |

---

## 📂 System Architecture & Folder Structure

```text
project-review-portal-server/
├── prisma/
│   ├── migrations/            # Migration history files
│   └── schema/                # Modular Prisma 7 schemas
│       ├── schema.prisma      # Base client generator & datasource config
│       ├── enums.prisma       # Global enums (Role, AuditAction, ProjectType, etc.)
│       ├── user.prisma        # User model definition
│       ├── submission.prisma  # Submission model definition
│       └── auditLog.prisma    # AuditLog model definition
├── src/
│   ├── app.ts                 # Express app initialization, CORS, global middlewares
│   ├── server.ts              # Server bootstrap, DB & Redis connections, initial seeds
│   └── app/
│       ├── config/            # Environment variable loader and parser (env.ts)
│       ├── errors/            # Custom AppError and centralized globalErrorHandler
│       ├── libs/              # Third-party client singletons (prisma, redis, nodemailer)
│       ├── middleware/        # authenticate, authorize, validateRequest, rateLimiter, notFound
│       ├── utils/             # asyncHandler, auditLogger, email.utils, jwt.utils, seed, sendResponse, setCookies
│       └── v1/
│           ├── routes/        # Centralized v1 routing registry
│           └── modules/       # Feature modules (Controller-Service-Route-Validation architecture)
│               ├── auth/      # Authentication, registration, OTP, password reset
│               ├── user/      # User profiles, password change, admin user operations
│               ├── submission/# Submission CRUD, mentor reviews, metric statistics
│               ├── auditLog/  # Audit log querying and filtering
│               └── templates/ # EJS email templates (registration OTP, welcome, reset password)
├── prisma7.config.ts          # Prisma 7 configuration file
├── tsup.config.ts             # Production build bundle configuration
├── vercel.json                # Vercel deployment serverless routing configuration
├── tsconfig.json              # TypeScript compiler settings
├── package.json               # Dependencies and scripts
└── .env.example               # Example environment variable template
```

---

## ⚙️ Prerequisites

Before running this server, ensure you have the following installed and running:

- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm** or **pnpm** or **yarn**
- **PostgreSQL Database**: Accessible PostgreSQL instance (Local or hosted via Supabase, Neon, Railway, AWS RDS, etc.)
- **Redis Server**: Accessible Redis instance (Local or hosted via Upstash, Redis Cloud, etc.)
- **SMTP Server**: Valid credentials for sending transactional emails (e.g., Gmail App Password, Resend, SendGrid)

---

## 🚀 Getting Started & Installation

### 1. Clone the repository and navigate to server directory

```bash
git clone <repository-url>
cd project-review-portal/project-review-portal-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy `.env.example` to create your `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your actual configuration values (see the [Environment Variables](#-environment-variables) section below).

### 4. Run database migrations & generate Prisma client

Generate the Prisma client and apply database migrations using the Prisma 7 configuration:

```bash
# Generate the client
npx prisma generate --config prisma7.config.ts

# Apply database migrations
npx prisma migrate dev --config prisma7.config.ts
```

### 5. Start the development server

```bash
npm run dev
```

The server will start at `http://localhost:5000` (or the port defined in your `.env`).

On startup, the server automatically:
- Connects to PostgreSQL via Prisma
- Connects to the Redis cache client
- Seeds the initial Admin and Mentor accounts (if specified in `.env`)

---

## 🔐 Environment Variables

Create a `.env` file in the root of `project-review-portal-server/` with the following variables:

```env
# Application Environment
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/review_portal?schema=public"
CLIENT_URL="http://localhost:3000"

# JWT Configuration
JWT_ACCESS_SECRET="your_super_secret_access_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Security
BCRYPT_SALT_ROUNDS=12

# Automated Seed Credentials (Created on boot if not existing)
TESTER_ADMIN_NAME="Portal Administrator"
TESTER_ADMIN_EMAIL="admin@reviewportal.com"
TESTER_ADMIN_PASSWORD="AdminSecurePassword123!"

TESTER_MENTOR_NAME="Senior Mentor"
TESTER_MENTOR_EMAIL="mentor@reviewportal.com"
TESTER_MENTOR_PASSWORD="MentorSecurePassword123!"

# Redis Configuration (For OTP caching)
REDIS_USER="default"
REDIS_PASSWORD="your_redis_password"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379

# SMTP Email Configuration
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-email-app-password"
EMAIL_SENDER="no-reply@reviewportal.com"
```

---

## 🗄 Database Management (Prisma 7)

Because this project utilizes Prisma 7 with multi-file schemas and a custom config file (`prisma7.config.ts`), pass the `--config` flag to Prisma CLI commands:

| Command | Description |
| :--- | :--- |
| `npx prisma generate --config prisma7.config.ts` | Generates the Prisma client inside `generated/prisma` |
| `npx prisma migrate dev --config prisma7.config.ts` | Runs pending migrations and prompts for new migration names |
| `npx prisma migrate deploy --config prisma7.config.ts` | Applies existing migrations in staging/production |
| `npx prisma studio --config prisma7.config.ts` | Launches Prisma Studio GUI at `http://localhost:5555` |
| `npx prisma db push --config prisma7.config.ts` | Pushes the schema state directly to database without creating migration files |

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the server in development mode with hot-reloading using `tsx watch` |
| `npm run build` | Bundles and minifies TypeScript code to `dist/server.js` using `tsup` |
| `npm start` | Runs the compiled production code from `dist/server.js` |
| `npm run lint` | Checks the codebase for linting issues using ESLint |
| `npm run lint:fix` | Automatically fixes fixable ESLint errors |
| `npm run prettier` | Checks code formatting against Prettier rules |
| `npm run prettier:fix`| Formats all code files with Prettier |

---

## 📡 API Reference

Base API URL: `http://localhost:5000/api/v1`

### Health Check

- **Endpoint**: `GET /`
- **Access**: Public
- **Response**:
```json
{
  "success": true,
  "message": "Project Review Portal Server is running successfully.",
  "version": "1.0.0"
}
```

---

### Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register new student account and dispatch OTP email |
| `POST` | `/verify-email` | Public | Verify 6-digit OTP code, activate account, and set auth cookies |
| `POST` | `/resend-otp` | Public | Resend email verification OTP |
| `POST` | `/login` | Public | Authenticate user with email and password |
| `POST` | `/refresh-token` | Public | Rotate and renew access token via cookie or body |
| `POST` | `/logout` | Authenticated | Clear authentication cookies |
| `POST` | `/forgot-password` | Public | Send password reset OTP email |
| `POST` | `/reset-password` | Public | Reset account password using verified OTP |

#### Example: Register User
`POST /api/v1/auth/register`
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

#### Example: Verify Email
`POST /api/v1/auth/verify-email`
```json
{
  "email": "jane@example.com",
  "otp": "481920"
}
```

---

### User Management Endpoints (`/api/v1/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/me` | Authenticated | Retrieve authenticated user profile |
| `PATCH` | `/me` | Authenticated | Update user profile (`name`, `avatarUrl`, `gender`) |
| `PATCH` | `/me/change-password` | Authenticated | Change user password (validates current password) |
| `GET` | `/` | `ADMIN` | List all registered users (supports `search`, `role`, pagination) |
| `GET` | `/:id` | `ADMIN` | Retrieve user details by ID |
| `PATCH` | `/:id/role` | `ADMIN` | Update user role (`STUDENT`, `MENTOR`, `ADMIN`) |
| `DELETE`| `/:id` | `ADMIN` | Delete user account |

---

### Submission & Review Endpoints (`/api/v1/submissions`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | `STUDENT` | Submit a project for review (Rate limited: 5 / 15m) |
| `GET` | `/my` | `STUDENT` | List authenticated student's submissions (supports pagination & status filter) |
| `GET` | `/my/:id` | `STUDENT` | Get details of student's own submission |
| `DELETE`| `/my/:id` | `STUDENT` | Delete own submission (allowed only while status is `PENDING`) |
| `GET` | `/stats` | `MENTOR`, `ADMIN` | Get submission statistics (totals, approved, rejected, rates, types) |
| `GET` | `/` | `MENTOR`, `ADMIN` | List all submissions (supports `search`, `status`, `projectType`, pagination) |
| `GET` | `/:id` | `MENTOR`, `ADMIN` | Retrieve full details of a specific submission |
| `PATCH` | `/:id/review` | `MENTOR`, `ADMIN` | Review a submission (`APPROVED` or `REJECTED` with comments) |

#### Example: Create Submission
`POST /api/v1/submissions`
```json
{
  "projectName": "E-Commerce Dashboard",
  "projectType": "WEB",
  "repoUrl": "https://github.com/janedoe/ecommerce-dashboard",
  "liveLink": "https://ecommerce-dashboard-demo.vercel.app",
  "description": "Full-stack dashboard with real-time analytics and inventory management.",
  "repoStack": "Fullstack",
  "projectImage": "https://images.example.com/project-preview.png"
}
```

#### Example: Review Submission
`PATCH /api/v1/submissions/:id/review`
```json
{
  "reviewStatus": "APPROVED",
  "reviewComments": "Excellent architectural separation and clean documentation. Approved!"
}
```

---

### Audit Log Endpoints (`/api/v1/audit-logs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `ADMIN` | Fetch audit logs with filtering (`action`, `userId`, `targetId`, `from`, `to`, `page`, `limit`) |
| `GET` | `/users/:userId` | `ADMIN` | Fetch audit logs specific to a given user |

---

## 🛡 Error Handling & Response Format

All responses follow a consistent, predictable JSON structure.

### Successful Response Format
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  },
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errorDetails": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 🔒 Security & Rate Limiting

- **HTTP-Only Cookies**: JWT tokens (`accessToken` and `refreshToken`) are stored in secure, `httpOnly`, `sameSite` cookies to protect against Cross-Site Scripting (XSS).
- **CORS Protection**: Restricted to authorized origins defined in `CLIENT_URL`.
- **Zod Request Validation**: Validates all incoming query parameters and request bodies prior to controller execution.
- **Submission Spam Protection**: Rate limited to a maximum of 5 submission creations per 15 minutes per IP address using `express-rate-limit`.
- **Audit Trails**: Security-relevant actions such as login attempts, password changes, and role modifications are permanently tracked.

---

## ☁️ Deployment (Vercel)

This backend is configured for deployment on **Vercel** as a serverless Node.js application:

1. **Build Step**:
   The code is bundled into `dist/server.js` using `npm run build` (`tsup`).
2. **Vercel Configuration**:
   The `vercel.json` file configures all routes to proxy through the bundled `dist/server.js`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/server.js"
       }
     ]
   }
   ```
3. **Environment Setup**:
   Configure all required environment variables in the **Vercel Dashboard → Project Settings → Environment Variables**.
4. **Deploy Command**:
   ```bash
   vercel --prod
   ```

---

## 📄 License

This project is licensed under the **ISC License**.
