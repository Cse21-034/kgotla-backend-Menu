# Money Marathon Backend API

Express.js backend API for the Money Marathon compound betting tracker application.

## Features

- **Authentication**: Passport.js with local strategy and session-based authentication
- **Database**: PostgreSQL with Drizzle ORM
- **API Endpoints**: RESTful API for plans, day entries, and user management
- **Validation**: Zod schema validation
- **Security**: CORS, bcrypt password hashing, secure sessions

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**:
   ```bash
   npm run db:push
   ```

4. **Development**:
   ```bash
   npm run dev
   ```

5. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for sessions
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `CORS_ORIGIN` - Frontend URL for CORS

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Plans
- `GET /api/plans` - Get user's plans
- `POST /api/plans` - Create new plan
- `GET /api/plans/:id` - Get plan details
- `DELETE /api/plans/:id` - Delete plan

### Day Entries
- `PATCH /api/plans/:id/days/:day` - Update day result
- `POST /api/plans/:id/restart` - Restart plan from day

## Deployment to Render

1. Connect your GitHub repository to Render
2. Use the included `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy!

## Database Schema

- **Users**: Authentication and user data
- **Plans**: Betting plan configurations
- **Day Entries**: Individual day tracking with compound calculations