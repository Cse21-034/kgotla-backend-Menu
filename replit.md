# Money Marathon - Compound Betting Tracker

## Overview

Money Marathon is a full-stack web application designed to visualize and track compound betting plans. The application allows users to create betting strategies with daily entries, track wins/losses, and calculate compound growth over time. Users can create multiple plans with different starting wagers, odds, and durations while monitoring their progress through an intuitive dashboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Framework**: Tailwind CSS for styling with Radix UI components for accessible, pre-built components
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Routing**: Wouter for lightweight client-side routing
- **Project Structure**: Feature-based organization with shared components and utilities

### Backend Architecture
- **Framework**: Node.js with Express.js following MVC pattern with SOLID principles
- **Language**: TypeScript for type safety across the entire stack
- **Architecture Pattern**: 
  - Controllers handle HTTP requests/responses (thin layer)
  - Services contain business logic with dependency injection
  - Repository pattern for database abstraction
  - Entities as pure TypeScript types
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Passport.js with local strategy and Express sessions

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Structure**:
  - Users table with basic authentication fields
  - Plans table for betting strategies with status tracking
  - DayEntries table for individual betting days with results
- **Relationships**: Proper foreign key relationships with cascade deletes
- **Data Types**: Decimal precision for monetary values, enums for status fields

### Authentication & Session Management
- **Strategy**: Passport.js local strategy with bcrypt password hashing
- **Session Storage**: Express-session with PostgreSQL session store
- **Authorization**: Route-level authentication middleware
- **Security**: Password hashing, session-based authentication, CORS protection

### API Design
- **Pattern**: RESTful API design with proper HTTP methods and status codes
- **Validation**: Zod schemas shared between frontend and backend
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Endpoints**: CRUD operations for plans, day entries, and authentication

### Development & Build Tools
- **Build Tool**: Vite for fast development server and optimized production builds
- **Type Checking**: TypeScript configuration for strict type checking
- **Code Quality**: ESLint and Prettier for code formatting and linting
- **Development**: Hot module replacement and development error overlays

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: CLI tools for database migrations and schema management

### Authentication & Security
- **passport**: Authentication middleware for Node.js
- **passport-local**: Local username/password authentication strategy
- **bcrypt**: Password hashing library
- **express-session**: Session middleware for Express
- **connect-pg-simple**: PostgreSQL session store

### Frontend UI & State Management
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/**: Complete set of accessible UI components
- **react-hook-form**: Performance-focused forms library
- **@hookform/resolvers**: Form validation resolvers
- **wouter**: Minimalist routing library

### Validation & Type Safety
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Zod integration for Drizzle schemas

### Styling & Design
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Utility for constructing className strings
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution environment
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling