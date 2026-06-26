# SkillSwap Permanent Deployment Guide

This project can be deployed as one full-stack app on Render. That gives you one permanent URL for the frontend, backend API, and real-time chat.

## What You Need

- A GitHub account
- A Render account: https://render.com
- A MongoDB Atlas account: https://www.mongodb.com/cloud/atlas

## Step 1: Create MongoDB Atlas Database

1. Open MongoDB Atlas.
2. Create a free cluster.
3. Create a database user.
4. Go to Network Access and allow access from anywhere: `0.0.0.0/0`.
5. Copy the connection string.
6. Replace `<password>` and set the database name to `skillswap`.

Example:

```text
mongodb+srv://skillswap_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority
```

## Step 2: Push This Project To GitHub

From the `skillswap` folder:

```powershell
git init
git add .
git commit -m "Deploy SkillSwap full-stack app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skillswap.git
git push -u origin main
```

If Git is not installed, install GitHub Desktop and publish the `skillswap` folder as a new repository.

## Step 3: Deploy Full-Stack App On Render

1. Open Render.
2. Click `New +`.
3. Choose `Blueprint`.
4. Connect your GitHub repository.
5. Render will detect `render.yaml`.
6. Add environment values when asked:

```text
MONGODB_URI=your MongoDB Atlas connection string
CLIENT_URL=https://your-render-app-name.onrender.com
```

`JWT_SECRET` is generated automatically by `render.yaml`.

7. Click deploy.
8. Wait for build and start to finish.

Your permanent app link will look like:

```text
https://skillswap-api.onrender.com
```

That one URL serves:

- Frontend app: `https://skillswap-api.onrender.com`
- Backend health check: `https://skillswap-api.onrender.com/health`
- API: `https://skillswap-api.onrender.com/api`
- Socket.IO chat: same Render URL

## Step 4: Update CLIENT_URL After First Deploy

After Render gives the real URL:

1. Open the Render service.
2. Go to `Environment`.
3. Set:

```text
CLIENT_URL=https://YOUR_REAL_RENDER_URL.onrender.com
```

4. Redeploy the service.

## Step 5: Test The Live App

Use these demo accounts if `SEED_DEMO_DATA=true`:

```text
arjun@demo.com / password123
priya@demo.com / password123
rahul@demo.com / password123
```

Test:

1. Open the Render URL.
2. Log in.
3. Browse users.
4. Find matches.
5. Open chat.
6. Schedule a session.
7. Mark it complete.
8. Submit a review.

## Optional: Deploy Frontend Separately On Vercel

Use this only if you want a separate frontend URL.

Vercel settings:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

Vercel environment variables:

```text
VITE_API_URL=https://YOUR_RENDER_URL.onrender.com/api
VITE_SOCKET_URL=https://YOUR_RENDER_URL.onrender.com
```

Render environment variable:

```text
CLIENT_URL=https://YOUR_VERCEL_URL.vercel.app
```

For most student/demo projects, the single Render deployment is simpler.
