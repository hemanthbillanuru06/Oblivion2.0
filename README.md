# Oblivion — Full-Stack Educational Resources & Course Marketplace

Oblivion is an enterprise-grade, modern, responsive full-stack **Educational Resources and Course Marketplace** built with React 19, TypeScript, Vite, Tailwind CSS v4, Node.js, Express 5, and MongoDB.

Students can discover courses, enroll in free courses or purchase paid programs via secure checkout, access downloadable educational resources, track verifiable lesson progress in real time, and earn cryptographically verifiable completion certificates. Instructors can manage their course studios, publish curriculum modules and lessons, configure quizzes, and inspect student progress. Platform Administrators have full governance over users, roles, course moderation, and security audit logs.

---

## 🌟 Key Architecture & Highlights

- **Student Learning Experience:**
  - Dedicated fullscreen Learning Player with collapsible curriculum sidebar.
  - Video and interactive text lesson viewers.
  - **Persistent Progress Calculation:** Progress is calculated directly on the server from genuine `LessonProgress` database records (completed required lessons / total required lessons). Progress persists across logout, login, and refreshes.
  - Interactive quiz assessment engine: scores calculated strictly on the backend to prevent score tampering.
  - Personal lesson note-taking.
  - Auto-issuance of unique, permanent completion certificates upon 100% course fulfillment.
  - Public credential verification portal (`/certificates/verify/:certificateId`).

- **Instructor Studio:**
  - Dedicated instructor dashboard with total courses, enrollments, completion ratios, and gross revenue metrics.
  - Course creator and curriculum manager (modules, lessons, video URLs, markdown content).
  - Student roster tracking individual student progress percentages and last active timestamps.

- **Executive Administrator Console:**
  - Real database metrics (no fabricated numbers).
  - User and role governance: promote users to instructor/admin or suspend/reactivate accounts.
  - Course publishing moderation workflow.
  - Security audit logs tracking privileged events.

- **Educational Resources Library:**
  - Searchable, categorized repository of PDF notes, slide decks, starter code templates, cheat sheets, and exercises.
  - Permission-controlled file access with server-side download tracking.

- **Security & RBAC:**
  - JWT stateless authentication with bcrypt password hashing.
  - Server-side role-based authorization guards on all protected endpoints.
  - Centralized error handling and Mongoose schema validation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), React Router 7, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js (v22), Express 5, TypeScript, Mongoose 8, JWT, BcryptJS, Multer, Morgan |
| **Database** | MongoDB (v7/v8 running as a local service or MongoDB Atlas) |
| **Tooling** | Concurrently, tsx (TypeScript runtime execute) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 2. Installation
From the project root:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Environment Configuration
The server `.env` file is located at `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/oblivion_marketplace
JWT_SECRET=oblivion_super_secure_jwt_secret_key_2026_dev
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PAYMENT_PROVIDER=mock
PAYMENT_PROVIDER_KEY_ID=mock_test_key_id
PAYMENT_PROVIDER_KEY_SECRET=mock_test_key_secret
```

### 4. Seed Development Database
Populate the database with demo accounts, 8 courses across multiple disciplines, modules, lessons, quizzes, 10 educational resources, and realistic student progress records:

```bash
npm run seed
```

### 5. Start the Application
Run both the frontend and backend servers concurrently with a single command:

```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

Alternatively, you can run them separately in different terminals:
- `npm run dev:server`
- `npm run dev:client`

---

## 👥 Demo Accounts (Development & Evaluation)

| Role | Email | Password | Features to Test |
|---|---|---|---|
| **Student (100% Completed)** | `emma.watson@student.edu` | `Password@123` | Enrolled in React 19 mastery (100% complete) + earned certificate `CERT-DEMO-2026-EMMA99`. Also enrolled in Deep Learning (50% progress). |
| **Student (In Progress)** | `liam.chen@student.edu` | `Password@123` | Enrolled in React 19 mastery (25% progress) and Data Science (0% progress). Test resuming learning. |
| **Instructor** | `alex.dev@oblivion.edu` | `Password@123` | Access Instructor Studio (`/instructor/dashboard`), create courses, view enrolled students roster, track revenue. |
| **Instructor** | `sarah.dr@oblivion.edu` | `Password@123` | AI & Data Science faculty account. |
| **Administrator** | `admin@oblivion.edu` | `Admin@123456` | Access Admin Console (`/admin/dashboard`), suspend/reactivate users, change roles, moderate courses, view audit logs. |

*Tip: The login page at `http://localhost:5173/login` includes convenient one-click demo buttons for Student, Instructor, and Admin to instantly populate credentials.*

---

## 🧪 Automated Testing

Oblivion includes a comprehensive backend automated test suite verifying:
- Server health & public metrics
- Course catalog & keyword search filtering
- Resources library endpoint
- Authentication for all three roles
- **Security & RBAC**: Confirms students are strictly rejected (HTTP 403) from accessing instructor and admin routes
- Public certificate verification authenticity
- Student enrollments & database progress persistence

To run the automated tests:

```bash
npm test
```

---

## 📜 Public Certificate Verification

Oblivion generates tamper-proof certificates with permanent identifiers. Anyone can verify a student's credential without signing in:

- **Verification URL:** `http://localhost:5173/certificates/verify`
- **Direct Demo Certificate:** `http://localhost:5173/certificates/verify/CERT-DEMO-2026-EMMA99`

---

## 🔌 API Reference Overview

### Public & Authentication
- `POST /api/auth/register` — Register a student or instructor
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get authenticated user details & bookmarks
- `PUT /api/auth/profile` — Update name, headline, avatar, bio
- `POST /api/auth/apply-instructor` — Submit instructor application
- `GET /api/stats` — Real platform metrics for homepage

### Courses & Marketplace
- `GET /api/courses` — Search, filter by category/price/difficulty/rating, and sort
- `GET /api/courses/:slugOrId` — Course details, curriculum, and reviews
- `POST /api/courses` — Create draft/published course (Instructor/Admin)
- `PUT /api/courses/:id` — Update course details
- `POST /api/courses/:id/modules` — Add curriculum module
- `POST /api/courses/:id/modules/:modId/lessons` — Add lesson

### Learning & Progress
- `GET /api/progress/player/:courseId` — Learning player state with access guard
- `POST /api/progress/complete/:courseId/:lessonId` — Mark lesson completed & recalculate DB progress
- `POST /api/progress/incomplete/:courseId/:lessonId` — Unmark lesson & recalculate DB progress
- `POST /api/progress/access/:courseId/:lessonId` — Update last accessed lesson

### Assessments & Quizzes
- `GET /api/assessments/courses/:courseId/quizzes` — Course quizzes (answers omitted for students)
- `POST /api/assessments/quizzes/:id/submit` — Submit answers, graded securely on server

### Certificates & Payments
- `POST /api/certificates/claim/:courseId` — Issue certificate upon 100% completion
- `GET /api/certificates/verify/:certificateId` — Public verification endpoint
- `POST /api/payments/order` — Create payment order
- `POST /api/payments/verify` — Server-side payment verification & course enrollment

### Instructor & Admin Studio
- `GET /api/instructor/dashboard` — Instructor metrics, completion rate, revenue
- `GET /api/instructor/students` — Student progress roster
- `GET /api/admin/dashboard` — Platform overview & recent logs
- `GET /api/admin/users` — List and filter platform users
- `PUT /api/admin/users/:id/status` — Suspend or reactivate user
- `PUT /api/admin/users/:id/role` — Update user role
- `GET /api/admin/audit-logs` — Administrative audit trail

---

## 🚢 Production Build

To build optimized production bundles for both frontend and backend:

```bash
npm run build
```

The compiled frontend is output to `client/dist/`, and compiled backend is output to `server/dist/`.
