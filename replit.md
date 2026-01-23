# Study Buddy - AI-Powered College Command Center

## Overview

Study Buddy is an AI-powered college command center that helps students organize their academic lives. It combines schedule management, assignment tracking, study spot discovery, and AI assistance into one clean, dark-mode interface.

**Design Philosophy:** Clean, minimal, dark mode. Think Notion + Linear. Never generic. Never boring.

## User Preferences

- Dark mode always
- Gold as primary accent color (#c9a227)
- Direct, human language - no AI buzzwords
- Mobile-first responsive design

## Design System - MANDATORY

### Color Palette

```css
/* Backgrounds */
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
--bg-elevated: #252525;

/* Text */
--text-primary: #f5f5f5;
--text-secondary: #a0a0a0;
--text-muted: #666666;

/* Accents */
--accent-gold: #c9a227;      /* Primary accent */
--accent-teal: #2dd4bf;      /* Secondary accent */
--accent-coral: #f472b6;     /* Tertiary accent */

/* Semantic */
--success: #22c55e;
--warning: #eab308;
--error: #ef4444;

/* Borders */
--border-subtle: rgba(255, 255, 255, 0.08);
--border-visible: rgba(255, 255, 255, 0.15);
```

### Banned Design Elements (AI Slop)

- Purple/violet gradients
- Glassmorphism/frosted glass effects
- Generic blue (#007bff)
- Rounded everything (border-radius: 9999px)
- Rainbow gradients
- Gratuitous blur effects

### Animation Guidelines

- Standard easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Fast duration: 150ms
- Normal duration: 250ms
- Slow duration: 400ms
- Always respect `prefers-reduced-motion`

### Spacing Scale

Use only: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

## Writing Style

### Banned Phrases (Delete on Sight)

- "Dive into..."
- "Unleash the power of..."
- "Elevate your..."
- "Seamlessly integrate..."
- "Cutting-edge..."
- "Revolutionary..."
- "Game-changing..."
- "Harness the potential..."
- "Leverage..."

### Good Writing

- **Direct** - Say what you mean
- **Specific** - Use concrete details
- **Human** - Write like you talk
- **Brief** - Cut unnecessary words

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS with custom CSS variables
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared folder

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Design**: RESTful endpoints under `/api/` prefix
- **Authentication**: Replit Auth with OpenID Connect
- **AI Integration**: OpenAI via Replit AI Integrations

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `db:push` command
- **Session Storage**: PostgreSQL via connect-pg-simple

### Key Data Models
- **User Profiles**: University, major, year, onboarding status
- **Courses**: Schedule with days, times, professors, locations
- **Tasks**: Assignments with priorities, due dates, course links
- **Study Chats**: AI conversation history
- **Shared Answers**: Shareable AI responses with unique IDs

## Security Rules - NON-NEGOTIABLE

### API Keys & Secrets
- NEVER hardcode API keys
- ALWAYS use Replit Secrets
- ALWAYS validate environment variables exist on startup

### Input Validation
- Trust nothing from the user
- Validate and sanitize all inputs
- Use parameterized queries always

### Session Security
- httpOnly: true
- secure: true
- sameSite: 'strict'

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key via Replit
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: OpenAI base URL via Replit

## File Structure

```
client/src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
server/
├── routes.ts       # API route handlers
├── storage.ts      # Database operations
├── db.ts           # Database connection
shared/
├── schema.ts       # Database schema and types
```

## Recent Changes

- Initial project setup with full stack implementation
- Dark mode design system with gold accent
- AI chat with streaming responses
- Schedule management with AI parsing
- Task tracking with calendar integration
