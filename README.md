# EmployIQ – AI-Driven Adaptive Student Portfolio & Predictive Employability Intelligence Platform

![Architecture](https://img.shields.io/badge/Architecture-Microservices-6366f1) ![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-06b6d4) ![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20Prisma-10b981) ![AI](https://img.shields.io/badge/AI-FastAPI%20%2B%20XGBoost-f59e0b) ![License](https://img.shields.io/badge/License-MIT-8b5cf6)

## Overview

EmployIQ is a production-grade, enterprise-level platform that combines:
- **Student Portfolio Compilation** — academic records, projects, certifications, coding profiles
- **AI-Powered Employability Scoring** — XGBoost model predicting placement tier (Tier 1 / Tier 2 / Mass / Needs Upskilling)
- **Semantic Skill Gap Analysis** — SentenceTransformers + FAISS vector similarity
- **ATS Resume Builder** — Multiple templates with PDF generation
- **Multi-Tenant Role Dashboards** — Student, Faculty, Recruiter, Placement Officer, Admin
- **Real-Time Analytics** — Recharts-powered department-level placement insights

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Zustand, TanStack Query |
| Backend | Node.js, Express.js, TypeScript, Prisma ORM, JWT + Refresh Tokens, Passport.js, Zod, BullMQ |
| AI Service | Python FastAPI, SentenceTransformers, XGBoost, scikit-learn, FAISS, Pandas |
| Database | PostgreSQL 16 (Prisma migrations) |
| Cache/Queue | Redis 7 |
| Storage | Supabase Storage / Local Multer |

## Project Structure

```
EmployIQ_AI/
├── backend/           # Express TypeScript API
│   ├── src/
│   │   ├── config/    # env, db, logger
│   │   ├── controllers/  # auth, student, recruiter, analytics
│   │   ├── middleware/   # JWT, RBAC, validation, error handler
│   │   ├── routes/       # v1 REST API routes
│   │   └── app.ts / server.ts
│   └── prisma/        # Schema, migrations, seed
├── frontend/          # Vite React SPA
│   └── src/
│       ├── components/   # Layout, UI components
│       ├── pages/        # Login, Register, 5x Dashboards
│       ├── store/        # Zustand auth store
│       ├── services/     # Axios API client
│       └── App.tsx       # React Router
├── ai-service/        # Python FastAPI microservice
│   └── app/
│       ├── main.py       # FastAPI app
│       └── services/     # parser, predictor, similarity
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.10+
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (optional)

### 1. Clone & Environment Setup

```bash
git clone <repository-url>
cd EmployIQ_AI
cp .env.example .env
# Edit .env with your database URL, JWT secrets, etc.
```

### 2. Start Infrastructure (Docker)

```bash
docker-compose up -d postgres redis
```

### 3. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
# Server runs on http://localhost:5000
# Swagger docs at http://localhost:5000/api-docs
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 5. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# API at http://localhost:8000/docs
```

## Default Test Accounts

All accounts use password: `password123`

| Role | Email |
|---|---|
| Student | student@employiq.ai |
| Faculty | faculty@employiq.ai |
| Recruiter | recruiter@employiq.ai |
| Placement Officer | officer@employiq.ai |
| Admin | admin@employiq.ai |

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login with JWT | Public |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | Public |
| GET | `/api/v1/auth/me` | Get current user | Bearer |
| GET | `/api/v1/students/profile` | Get student portfolio | Student |
| PUT | `/api/v1/students/profile` | Update profile | Student |
| POST | `/api/v1/students/projects` | Add project | Student |
| POST | `/api/v1/students/skills` | Add/update skill | Student |
| GET | `/api/v1/recruiters/candidates` | Search candidates | Recruiter |
| POST | `/api/v1/recruiters/jobs` | Create job posting | Recruiter |
| GET | `/api/v1/analytics/placement` | Placement statistics | Officer/Admin |
| GET | `/api/v1/analytics/system` | System metrics | Admin |

## Deployment

Deploying the stack is incredibly easy since we have bundled the necessary configuration files (`vercel.json` and `railway.toml`).

### 1. Database & Cache
We recommend using **Supabase** for the PostgreSQL Database and **Upstash** (or Railway) for Serverless Redis. Set the `DATABASE_URL` and `REDIS_URL` secrets in your backend accordingly.

### 2. Backend API (Railway / Render)
1. Link your GitHub repo to Railway.
2. Railway will automatically detect the `backend/railway.toml` file (Nixpacks).
3. Set the Root Directory to `/backend` in the service settings.
4. Add all environment variables from `.env.example`.

### 3. AI Microservice (Railway / Render)
1. Create a second service in Railway linking to the same repo.
2. Set the Root Directory to `/ai-service`.
3. Railway will use the `ai-service/railway.toml` to build via Docker and expose Uvicorn.

### 4. Frontend (Vercel)
1. Import the project in Vercel.
2. Set the Root Directory to `frontend`.
3. Vercel will automatically detect Vite and use `vercel.json` to handle React Router fallbacks.
4. Add the `VITE_API_URL` environment variable pointing to your deployed backend.
