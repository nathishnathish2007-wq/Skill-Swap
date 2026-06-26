# SkillSwap

SkillSwap is a peer-to-peer skill exchange platform where users trade knowledge instead of money. The app includes registration, skill profiling, smart recommendations, match requests, real-time chat, scheduling, reviews, badges, and a leaderboard.

## Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, Socket.IO client, FullCalendar
- Backend: Node.js, Express, Socket.IO, JWT auth, bcrypt, Mongoose
- Database: MongoDB in production, in-memory demo mode for instant local runs

## Quick Start

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000  
Health check: http://localhost:5000/health

PowerShell on some Windows machines blocks `npm.ps1`. If that happens, run commands with `npm.cmd` instead:

```powershell
npm.cmd install
npm.cmd run dev
```

On Windows you can also double-click `start-local.bat`. It opens the API and web app in separate command windows, then opens http://localhost:5173.

## Demo Accounts

The local `.env` uses `DATA_MODE=memory`, so demo data is created automatically when the API starts.

| Email | Password |
| --- | --- |
| arjun@demo.com | password123 |
| priya@demo.com | password123 |
| rahul@demo.com | password123 |

## MongoDB Mode

To use MongoDB, update `.env`:

```env
DATA_MODE=mongo
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=replace_this_with_a_long_random_secret
```

Then seed demo data:

```bash
npm run seed
```

## Deployment

The local preview is temporary. For a permanent public link, the simplest path is one full-stack Render deployment. See `DEPLOYMENT_GUIDE.md`.

Full-stack Render deployment:

- Build command: `npm install && npm run build`
- Start command: `npm run start --workspace server`
- Health check: `/health`
- Environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, `DATA_MODE=mongo`, `SEED_DEMO_DATA=true`

This serves the frontend, backend API, and Socket.IO from one Render URL.

Optional split deployment:

Backend deployment works well on Render:

- Use the included `render.yaml`, or set:
- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, `DATA_MODE=mongo`
- Health check: `/health`

Frontend deployment works well on Vercel:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_API_URL=https://your-api.onrender.com/api`, `VITE_SOCKET_URL=https://your-api.onrender.com`

After Vercel gives you a URL, add it to Render's `CLIENT_URL`. After Render gives you an API URL, add it to Vercel as `VITE_API_URL` and `VITE_SOCKET_URL`, then redeploy the frontend.

## API Highlights

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/browse`
- `GET /api/matches/recommendations`
- `POST /api/matches`
- `GET /api/chat/:matchId/messages`
- `POST /api/chat/:matchId/message`
- `POST /api/sessions`
- `PUT /api/sessions/:sessionId/complete`
- `POST /api/reviews`
- `GET /api/leaderboard`

## Project Structure

```text
skillswap/
  client/
    src/components/
    src/context/
    src/pages/
    src/utils/
  server/
    config/
    data/
    middleware/
    models/
    routes/
    socket/
    utils/
```
