# Money Marathon - Separated Frontend & Backend

This repository contains the completely separated frontend and backend projects for the Money Marathon compound betting tracker application.

## Project Structure

```
├── backend/           # Node.js Express API (Deploy to Render)
│   ├── src/
│   ├── package.json
│   ├── render.yaml    # Render deployment config
│   └── README.md
│
├── frontend/          # React App (Deploy to Vercel)  
│   ├── src/
│   ├── package.json
│   ├── vercel.json    # Vercel deployment config
│   └── README.md
│
└── README.md          # This file
```

## Quick Start

### Backend (API Server)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:push
npm run dev
```

### Frontend (React App)
```bash
cd frontend
npm install  
cp .env.example .env
# Edit .env with your backend API URL
npm run dev
```

## Deployment

### Backend to Render
1. Push your code to GitHub
2. Connect repository to Render
3. Use the `backend/render.yaml` configuration
4. Set environment variables in Render dashboard

### Frontend to Vercel
1. Connect repository to Vercel
2. Set build settings:
   - Framework: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set environment variables

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your-secret-key
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-api.onrender.com
```

## Features

- **Full Authentication**: Registration, login, session management
- **Plan Management**: Create, view, edit, delete betting plans
- **Day Tracking**: Interactive win/loss tracking with compound calculations
- **Statistics**: Real-time plan statistics and progress tracking
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Data Persistence**: PostgreSQL database with proper relationships

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM
- **Database**: PostgreSQL with session storage
- **Authentication**: Passport.js with bcrypt
- **Validation**: Zod schemas shared between frontend and backend concepts
- **State Management**: TanStack Query for server state

## API Documentation

See `backend/README.md` for detailed API endpoint documentation.

## License

MIT License