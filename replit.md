# Study Buddy - AI-Powered College Command Center

## Overview

Study Buddy is an all-in-one web application designed to help college students organize their academic lives. The platform combines AI-powered chat assistance, schedule management, task tracking, and calendar features into a unified experience. Think Notion + Linear meets a college-specific AI assistant.

**Core Purpose:** Help students manage their chaotic academic schedules, get personalized study recommendations, track assignments, and receive AI-powered assistance tailored to their university, major, and courses.

**Design Philosophy:** Clean, minimal, dark mode by default. The interface prioritizes the AI chat as the primary feature, with supporting tools for schedule and task management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript, built using Vite
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack React Query for server state and caching
- **UI Components:** shadcn/ui component library built on Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming (dark mode default)
- **Path Aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript with ESM modules
- **API Pattern:** RESTful endpoints under `/api/` prefix
- **Build System:** Custom esbuild script bundling server dependencies for faster cold starts

### Data Storage
- **Database:** PostgreSQL with Drizzle ORM
- **Schema Location:** `shared/schema.ts` for shared types between client and server
- **Migrations:** Drizzle Kit with `db:push` command for schema synchronization
- **Session Storage:** PostgreSQL-backed sessions via connect-pg-simple

### Authentication
- **Provider:** Replit Auth via OpenID Connect (OIDC)
- **Session Management:** Express sessions stored in PostgreSQL
- **User Flow:** OAuth redirect flow with automatic user upsert on login
- **Protected Routes:** `isAuthenticated` middleware guards API endpoints

### AI Integration
- **Provider:** OpenAI API via Replit AI Integrations
- **Environment Variables:** `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Features:** Chat completions for study assistance, contextual recommendations based on user profile
- **Streaming:** Server-Sent Events (SSE) for real-time AI responses

### Key Application Features
1. **AI Chat Assistant:** Primary feature with streaming responses, shareable answers, and course-aware context
2. **Schedule Management:** Course upload via text parsing, weekly schedule view
3. **Task Tracking:** To-do items with priorities, due dates, and course associations
4. **Calendar View:** Monthly view integrating tasks and courses
5. **User Onboarding:** Multi-step flow collecting university, major, and year

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components and views
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── replit_integrations/  # Auth, chat, audio, image modules
├── shared/           # Shared types and schema
│   ├── schema.ts     # Drizzle schema definitions
│   └── models/       # Auth and chat models
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL:** Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM:** Type-safe database queries and schema management

### Authentication
- **Replit Auth:** OIDC-based authentication requiring `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET`

### AI Services
- **OpenAI API:** Chat completions, text-to-speech, speech-to-text, and image generation
- **Configuration:** Via Replit AI Integrations environment variables

### Third-Party Libraries
- **UI:** Radix UI primitives, Lucide icons, class-variance-authority
- **Data:** date-fns for date manipulation, zod for validation
- **Audio:** Custom AudioWorklet for voice streaming playback

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session encryption key
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL
- `REPL_ID` - Replit environment identifier
- `ISSUER_URL` - OIDC issuer (defaults to Replit)