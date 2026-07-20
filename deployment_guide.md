# EmployIQ Production Deployment Guide

This guide will walk you through deploying your 3-tier architecture (Frontend, Backend, AI Microservice) across Vercel, Railway, and Supabase using your single GitHub repository.

> [!IMPORTANT]
> **Prerequisite:** Before starting, ensure your entire `EmployIQ_AI` folder is pushed to a single repository on GitHub. All 3 platforms (Vercel and Railway) will connect to this exact same repository.

---

## 1. Supabase (PostgreSQL Database)

First, we need to spin up the database so our backend has somewhere to connect.

1. Go to [Supabase](https://supabase.com/) and click **New Project**.
2. Give it a name (e.g., `employiq-db`) and generate a secure database password. Save this password somewhere safe!
3. Once the project finishes provisioning (takes a few minutes), go to **Project Settings** (the gear icon on the left).
4. Click on **Database** under the Configuration section.
5. Scroll down to **Connection string** and select the **URI** tab.
6. Copy the URI. It will look like this:
   `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
7. Replace `[YOUR-PASSWORD]` with the password you generated in step 2. This is your **DATABASE_URL**. Keep it handy.

---

## 2. Railway (AI Service, Backend API, and Redis)

We will use Railway to host the AI Service, the Node.js Backend, and the Redis cache. We'll put them all in one "Railway Project" so they can easily talk to each other.

### Step 2.1: Spin up Redis
1. Go to [Railway](https://railway.app/) and click **New Project**.
2. Select **Provision PostgreSQL, Redis, etc.** and choose **Redis**.
3. Once deployed, click on the Redis block, go to the **Connect** tab, and copy the **Redis Connection URL** (starts with `redis://`). This is your **REDIS_URL**.

### Step 2.2: Deploy the Python AI Service
1. In the exact same Railway project, click **New** in the top right corner.
2. Select **GitHub Repo** and connect your `EmployIQ_AI` repository.
3. Once the block appears, click on it and go to the **Settings** tab.
4. Scroll down to **Root Directory** and type `/ai-service`. Hit the checkmark to save.
   > [!TIP]
   > Because you added the `ai-service/railway.toml` file, Railway instantly knows how to build the Python environment.
5. Go to the **Networking** tab and click **Generate Domain** (e.g., `employiq-ai.up.railway.app`). 
6. Copy this URL. This is your **AI_SERVICE_URL**.

### Step 2.3: Deploy the Node.js Backend API
1. In the same Railway project, click **New** again, select **GitHub Repo**, and choose the `EmployIQ_AI` repository again.
2. Click on this new block, go to **Settings**, scroll to **Root Directory**, and type `/backend`. Hit the checkmark.
3. Go to the **Variables** tab for this backend block. Click **New Variable** and add the following:
   - `PORT`: `5000`
   - `DATABASE_URL`: *(Paste the Supabase URI from Step 1)*
   - `REDIS_URL`: *(Paste the Redis URL from Step 2.1)*
   - `AI_SERVICE_URL`: `https://[YOUR_AI_RAILWAY_DOMAIN]/api/v1/ai` *(From Step 2.2)*
   - `JWT_SECRET`: `super-secret-key-for-prod-1234!`
   - `JWT_REFRESH_SECRET`: `another-super-secret-key-prod-5678!`
   - `SMTP_USER` / `SMTP_PASS` / `SMTP_HOST`: *(If you have an email provider like SendGrid, add them here. Otherwise, leave blank for Ethereal dev mode).*
4. Go to the **Networking** tab and click **Generate Domain** (e.g., `employiq-api.up.railway.app`).
5. Wait for the backend to deploy. Once it says "Success", you can test it by going to `https://[YOUR_BACKEND_RAILWAY_DOMAIN]/api-docs` to see Swagger!
6. Copy this backend URL. This is your **VITE_API_URL**.

---

## 3. Vercel (Frontend React App)

Finally, we will deploy the React application.

1. Go to [Vercel](https://vercel.com/) and click **Add New... -> Project**.
2. Find your `EmployIQ_AI` repository and click **Import**.
3. In the "Configure Project" screen, look for **Root Directory**. Click Edit, select the `frontend` folder, and save.
4. Under **Framework Preset**, ensure it says **Vite**. (Vercel usually detects this automatically).
5. Open the **Environment Variables** dropdown and add:
   - Name: `VITE_API_URL`
   - Value: `https://[YOUR_BACKEND_RAILWAY_DOMAIN]/api/v1` *(Paste the URL from Step 2.3)*
6. Click **Deploy**.

> [!NOTE]
> Because we included the `frontend/vercel.json` file, Vercel will automatically handle all the React Router links, ensuring that if a user refreshes the page on `/dashboard/profile`, they won't get a 404 error.

---

## 4. Final Database Seeding (Crucial Step)

Your backend is running, but the Supabase database is completely empty. We need to run your Prisma migrations and seed script to create the tables and default users.

1. Open a terminal on your **local computer**.
2. Navigate to your backend folder: `cd backend`
3. Temporarily set your local `.env` file's `DATABASE_URL` to your production Supabase URL.
4. Run the following commands:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
5. *(Optional)* Change your local `.env` back to your local Postgres database if you plan on continuing local development.

### 🎉 You're Done!
Go to your Vercel URL. You should see the EmployIQ login page. You can log in using `admin@employiq.ai` and `password123` (from the seed script) to test the live production system!
