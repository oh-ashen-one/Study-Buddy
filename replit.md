# Study Buddy - AI-Powered College Command Center

## Overview

Study Buddy is an all-in-one web application designed to help college students organize their academic lives. It combines AI-powered chat assistance, schedule management, task tracking, and calendar views into a single cohesive platform. The application features a dark-mode-first design with a clean, modern interface built using React and shadcn/ui components.

The core value proposition is providing college students with personalized AI assistance that understands their university, major, year, and course schedule to deliver relevant study recommendations and academic support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark mode by default)
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared folder

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Design**: RESTful endpoints under `/api/` prefix
- **Authentication**: Replit Auth with OpenID Connect, session-based with PostgreSQL session store
- **AI Integration**: OpenAI API via Replit AI Integrations for chat, image generation, and audio processing

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for shared type definitions
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization
- **Session Storage**: PostgreSQL via connect-pg-simple

### Key Data Models
- **User Profiles**: Stores university, major, year, and onboarding status
- **Courses**: Schedule information with days, times, professors, locations
- **Tasks**: To-do items with priorities, due dates, and course associations
- **Study Chats**: AI conversation history with message threading
- **Shared Answers**: Shareable AI responses with unique IDs

### Application Flow
1. Users authenticate via Replit Auth
2. New users complete onboarding (university, major, year selection)
3. Main dashboard provides sidebar navigation between Chat, Schedule, Tasks, and Calendar views
4. AI chat has context about user's academic profile and courses for personalized responses

## External Dependencies

### Third-Party Services
- **OpenAI API**: Powers the AI chat assistant, accessed through Replit AI Integrations environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- **Replit Auth**: OAuth/OIDC authentication provider using Replit's built-in identity service
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable

### Key NPM Packages
- **drizzle-orm/drizzle-kit**: Database ORM and migration tooling
- **openai**: Official OpenAI SDK for AI features
- **passport/openid-client**: Authentication middleware for Replit Auth
- **express-session/connect-pg-simple**: Session management with PostgreSQL backing
- **@tanstack/react-query**: Data fetching and caching
- **@radix-ui/***: Accessible UI primitives for shadcn/ui components
- **date-fns**: Date manipulation utilities

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key via Replit
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: OpenAI base URL via Replit
- `ISSUER_URL`: Replit OIDC issuer (defaults to https://replit.com/oidc)
- `REPL_ID`: Replit environment identifier