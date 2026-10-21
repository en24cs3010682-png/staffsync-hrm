# StaffSync - Modern Human Resource Management Solution

A MERN Stack (MongoDB, Express.js, React.js, Node.js) web application that digitizes core HR functions
with three roles: **HR**, **Manager** and **Employee**. Authentication uses **JWT**, UI uses **Bootstrap**.

## Run locally

After starting the backend and frontend (see Setup below), open the app at:

**http://localhost:5173**

(This link works only on your own computer while the app is running.)

## Features by role

| Feature | HR | Manager | Employee |
|---|---|---|---|
| Login / change password / profile | Yes | Yes | Yes |
| Add / edit / delete employees | Yes | - | - |
| View employee list | All | Own team | - |
| Mark attendance (check in / out) | Yes | Yes | Yes |
| View attendance of others | All | Team | - |
| Apply for leave | Yes | Yes | Yes |
| Approve / reject leave | All | Team | - |
| Post announcements / news | Yes | - | - |
| View announcements | Yes | Yes | Yes |
| Create training programs | Yes | Team only | - |
| View training programs | All | Created by them | Assigned to them |

## Project structure

```
staffsync/
  backend/
    server.js            entry point
    seed.js              demo data
    config/db.js         MongoDB connection
    middleware/auth.js   JWT protect + role authorize
    models/              User, Leave, Attendance, Announcement, Training
    routes/              auth, employees, leaves, attendance, announcements, trainings, dashboard
    utils/wrap.js        async error wrapper + date helper
  frontend/
    index.html, vite.config.js
    src/
      api.js             axios instance (adds JWT token)
      context/AuthContext.jsx
      components/        Navbar, ProtectedRoute
      pages/             Login, Dashboard, Employees, Attendance, Leaves,
                         Announcements, Training, Profile
```

## Setup

Requirements: Node.js 18+ and MongoDB running locally (or a MongoDB Atlas URI).

### 1. Backend
```bash
cd backend
npm install
# edit .env if needed (MONGO_URI, JWT_SECRET)
npm run seed      # creates demo users + announcement
npm run dev       # API on http://localhost:5000
```

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev       # App on http://localhost:5173
```
The Vite dev server proxies `/api` to `http://localhost:5000`.

## Demo logins (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| HR | hr@staffsync.com | hr1234 |
| Manager | manager@staffsync.com | manager1234 |
| Employee | employee@staffsync.com | emp1234 |

## REST API summary

All routes except login need header `Authorization: Bearer <token>`.

- `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/change-password`
- `GET/POST /api/employees`, `PUT/DELETE /api/employees/:id` (HR; manager can GET team)
- `POST /api/leaves`, `GET /api/leaves/mine`, `GET /api/leaves`, `PUT /api/leaves/:id/status`
- `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/mine`, `GET /api/attendance?date=`
- `GET/POST /api/announcements`, `DELETE /api/announcements/:id`
- `GET/POST /api/trainings`, `DELETE /api/trainings/:id`
- `GET /api/dashboard`

## Business rules

- Passwords are hashed with bcrypt; JWT expires in 7 days.
- Leave days are counted inclusive of from/to date. Approving a non-Unpaid leave deducts from the employee's balance (default 12 days).
- A manager can review only their own team's leave; nobody can review their own leave. Manager's own leave goes to HR.
- Check-out before 4 hours of work marks the day as "Half Day".
