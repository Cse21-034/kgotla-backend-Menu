# Money Marathon Frontend

React frontend application for the Money Marathon compound betting tracker.

## Features

- **Modern React**: React 18 with TypeScript and Vite
- **UI Framework**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing
- **Responsive Design**: Mobile-first responsive design

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)
- `VITE_APP_NAME` - Application name

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication forms
│   ├── dashboard/     # Dashboard components
│   ├── layout/        # Layout components
│   ├── plans/         # Plan-related components
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Page components
└── types/             # TypeScript type definitions
```

## Key Components

- **Dashboard**: Plan overview and statistics
- **Plan Table**: Interactive day-by-day plan tracking
- **Authentication**: Login/register forms with validation
- **Plan Creation**: Form for creating new betting plans

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `VITE_API_URL`: Your backend API URL
3. Deploy!

The included `vercel.json` handles SPA routing and CORS headers.

## API Integration

The frontend communicates with the backend API using:
- Session-based authentication
- RESTful API calls with proper error handling
- Optimistic updates for better UX
- Query invalidation for data consistency

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Properties**: CSS variables for theming
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Built-in dark mode support (class-based)