# FinTrack

A full-stack personal and group finance manager built with the MERN stack.

## Features

- **Subscriptions** — Track recurring payments, billing cycles, renewal dates, and categories. Get monthly/yearly spend summaries.
- **Bill Splitter** — Create groups, add expenses with multiple payers, split between members, and auto-calculate who owes whom.
- **Settlements** — One-click UPI payment links and mark-as-settled tracking.
- **Email Reminders** — Automated renewal reminder emails via cron job.
- **Auth** — JWT-based register/login with protected routes.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Email | Nodemailer, node-cron |

## Project Structure

```
Fintrack/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── groups/GroupDetail.jsx
│       │   └── layout/Navbar.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Groups.jsx
│       │   ├── Subscriptions.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── context/AuthContext.jsx
│       └── utils/api.js
└── server/          # Express backend
    ├── controllers/
    ├── models/
    ├── routes/
    └── utils/
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/AkashShettyy/Fintrack.git
   cd Fintrack
   ```

2. **Server**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
   ```bash
   npm run dev
   ```

3. **Client**
   ```bash
   cd client
   npm install
   npm run dev
   ```

App runs at `http://localhost:5173`, API at `http://localhost:8000`.

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |

### Subscriptions
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/subscriptions` | Get all + summary |
| POST | `/api/subscriptions` | Add subscription |
| PUT | `/api/subscriptions/:id` | Update |
| DELETE | `/api/subscriptions/:id` | Delete |

### Groups
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get group detail |
| DELETE | `/api/groups/:id` | Delete group |
| POST | `/api/groups/:id/expenses` | Add expense |
| DELETE | `/api/groups/:id/expenses/:eid` | Delete expense |
| GET | `/api/groups/:id/settlements` | Get settlements |
| PUT | `/api/groups/:id/settlements/settle` | Mark settled |
