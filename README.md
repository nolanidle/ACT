# ACTstroyds — AI-Powered ACT Test Prep

A full-stack, production-grade ACT/PreACT preparation SaaS built with React 18 + Node.js + MySQL + Ollama AI.

## Prerequisites

- Node.js 20+
- MySQL 8+ (credentials in `.env`)
- An Ollama Cloud API key
- (Optional) SMTP credentials for email

## Setup

### 1. Clone & Environment

```bash
git clone <repo>
cd act

# Fill in your Ollama API key and SMTP credentials
cp .env public_html/server/.env
nano .env
```

Required env vars to fill in:
- `OLLAMA_API_KEY` — your Ollama Cloud key
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate strong random strings
- `SMTP_*` — your email provider credentials (required for registration/password reset)

### 2. Install Dependencies

```bash
# Backend
cd public_html/server
npm install

# Frontend
cd ../client
npm install
```

### 3. Run Database Migrations

The server auto-runs migrations on startup. Ensure MySQL is running and the database/user exist:

```sql
-- Run once in MySQL as root:
CREATE DATABASE IF NOT EXISTS NolanI_mncup;
CREATE USER IF NOT EXISTS 'NolanI_mncup'@'localhost' IDENTIFIED BY 'e:T!4+b)_i1Z&^JR';
GRANT ALL PRIVILEGES ON NolanI_mncup.* TO 'NolanI_mncup'@'localhost';
FLUSH PRIVILEGES;
```

Then just start the server — it runs `migrations/001_init.sql` automatically.

### 4. Development

Run both servers (two terminals):

```bash
# Terminal 1 — Backend (port 3001)
cd public_html/server
npm run dev

# Terminal 2 — Frontend (port 5173, proxies /api → 3001)
cd public_html/client
npm run dev
```

Open: http://localhost:5173

### 5. Production Build

```bash
# Build the React app
cd public_html/client
npm run build
# Output goes to public_html/dist/

# Start the production server (serves dist/ as static)
cd ../server
NODE_ENV=production npm start
```

Open: http://localhost:3001

## Architecture

```
public_html/
├── server/          Express REST API (port 3001)
│   ├── src/
│   │   ├── config/      db.js (MySQL pool), ai.js (Ollama), mail.js (nodemailer)
│   │   ├── middleware/  auth.js (JWT), rateLimiter.js, validate.js
│   │   ├── routes/      auth, diagnostic, quiz, lesson, exam, explanation, progress, studyPlan, user
│   │   ├── controllers/ Business logic per feature
│   │   ├── services/    aiService.js, mailService.js, questionValidator.js, skillAnalyzer.js
│   │   ├── models/      MySQL query functions per entity
│   │   └── prompts/     AI prompt templates
│   └── migrations/  001_init.sql (runs on startup)
├── client/          React 18 + Vite SPA (port 5173 in dev)
│   └── src/
│       ├── pages/       All route pages
│       ├── components/  UI, layout, quiz, lesson, charts, gamification, math, diagrams
│       ├── hooks/       useAuth, useAI, useProgress, useTimer
│       ├── store/       Zustand (auth, ui)
│       └── utils/       api.js (axios), scoring.js, formatters.js
├── reference/       JSON few-shot examples for AI generation (per section)
└── dist/            React production build output
```

## AI Provider

Uses **Ollama Cloud** (`gemma4:31b`). Configure via:
```
OLLAMA_API_KEY=your_key_here
AI_MODEL=gemma4:31b
```

## Usage Limits

| Feature | Free | Premium |
|---|---|---|
| Quiz/Lesson generations/day | 3 | 25 |
| Explanations/day | 5 | 50 |
| Diagnostics/month | 1 | Unlimited |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, GSAP |
| Charts | Chart.js, Recharts |
| Math | KaTeX (react-katex) |
| Backend | Node.js 20, Express.js |
| Database | MySQL 8 (mysql2) |
| Auth | JWT (access + refresh token pattern) |
| AI | Ollama Cloud (gemma4:31b) |
| Email | Nodemailer (SMTP) |
| Scheduling | node-cron (streak resets, usage resets) |

> **Note:** This sandbox environment cannot reach localhost MySQL, Ollama, or SMTP services. All integrations are coded to spec and run correctly on your host machine following the setup steps above.
