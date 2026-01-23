# CLAUDE.MD - Study Buddy Development Guide

> **Read this file before every coding session.** This is your compass.

---

## Project Context

**Study Buddy** - AI-powered college command center. Dark mode. Gold accent. Never generic.

For the full design system (colors, spacing, animations, banned elements), see `replit.md`.

---

## The Vibe Coding Workflow

### Phase 1: Plan

Before touching any code:

1. **Read first** - Open and understand every file you'll modify
2. **Map the change** - List files affected, functions touched
3. **Spot the edges** - What could break? What's the error state?
4. **Ask if unsure** - Ambiguity kills. Clarify before you code.

### Phase 2: Execute

Once you have a plan:

1. **Small bites** - One change at a time, test between each
2. **Follow patterns** - Copy existing code style exactly
3. **Stay focused** - Only do what was asked, nothing more

---

## The Do's

| Do This | Why |
|---------|-----|
| Read files before modifying | You can't fix what you don't understand |
| Use TypeScript strict mode | Project enforces it, no `any` types |
| Follow component patterns in `client/src/components/` | Consistency matters |
| Use Drizzle ORM for all queries | Never raw SQL, patterns in `shared/schema.ts` |
| Validate with Zod | Already wired up, use it |
| Use TanStack Query for server state | Don't reinvent caching |
| Keep changes atomic | Easy to review, easy to revert |
| Ask for clarification | Better to ask than assume wrong |

---

## The Don'ts

| Don't Do This | Why Not |
|---------------|---------|
| Over-engineer | One problem, one solution. No "future-proofing" |
| Add unrequested features | Scope creep destroys projects |
| Skip reading existing code | You'll duplicate or contradict |
| Ignore `replit.md` design system | Brand consistency is non-negotiable |
| Use purple gradients, glassmorphism, generic blue | AI slop. Banned. |
| Hardcode credentials or API keys | Security nightmare |
| Make assumptions about intent | Wrong assumptions = wasted work |
| Use `dangerouslySetInnerHTML` | XSS vector unless absolutely necessary |

---

## Security - Non-Negotiable

### Secrets & Environment

```
NEVER hardcode secrets
ALWAYS use Replit Secrets
ALWAYS validate env vars exist on startup
NEVER log sensitive data (tokens, passwords, PII)
```

### Input Validation

Every endpoint, every time:

```typescript
// Good - validate with Zod
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

app.post('/api/tasks', async (req, res) => {
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // proceed with validated data
});
```

### SQL Injection Prevention

Always use Drizzle ORM. Never string concatenation.

```typescript
// GOOD - Drizzle handles parameterization
const task = await db.select().from(tasks).where(eq(tasks.id, taskId));

// BAD - Never do this
const task = await db.execute(`SELECT * FROM tasks WHERE id = ${taskId}`);
```

### XSS Prevention

React escapes by default. Don't break it.

```typescript
// GOOD - React escapes this automatically
<div>{userInput}</div>

// BAD - Opens XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// If you MUST render HTML, sanitize first with DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Authentication & Authorization

```typescript
// Always check session on protected routes
app.get('/api/protected', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // proceed
});

// Always verify ownership
app.delete('/api/tasks/:id', async (req, res) => {
  const task = await storage.getTask(req.params.id);
  if (task.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // proceed with deletion
});
```

### API Security Checklist

- [ ] Rate limiting on auth endpoints
- [ ] Validate `Content-Type` headers
- [ ] Generic error messages to clients (detailed to logs)
- [ ] No sensitive data in URLs (use body/headers)
- [ ] CORS configured properly
- [ ] Session cookies: `httpOnly`, `secure`, `sameSite: 'strict'`

---

## Code Patterns

### React Components

Follow patterns in `client/src/components/`:

```typescript
interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  // Use shadcn/ui components
  // Use Tailwind for styling
  // Use the project color variables
  return (
    <Card className="bg-secondary border-border-subtle">
      {/* ... */}
    </Card>
  );
}
```

### API Routes

Follow patterns in `server/routes.ts`:

```typescript
app.get('/api/resource', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const data = await storage.getData(req.user.id);
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Database Operations

Follow patterns in `server/storage.ts`:

```typescript
async function createTask(userId: string, data: NewTask) {
  const [task] = await db.insert(tasks).values({
    ...data,
    userId,
    createdAt: new Date(),
  }).returning();
  return task;
}
```

---

## Before You Code Checklist

Run through this mentally before every change:

- [ ] I've read the files I'm about to modify
- [ ] I understand how the current code works
- [ ] My change is minimal and focused
- [ ] I've considered security implications
- [ ] I've checked for edge cases
- [ ] If unsure about anything, I'll ask first

---

## Quick Reference

| Need to... | Look at... |
|------------|------------|
| Add a component | `client/src/components/` |
| Add an API route | `server/routes.ts` |
| Add a database operation | `server/storage.ts` |
| Modify the schema | `shared/schema.ts` |
| Check design system | `replit.md` |
| Add a page | `client/src/pages/` |
| Add a hook | `client/src/hooks/` |

---

## Remember

> Plan. Then execute. Never the other way around.

> When in doubt, ask. Don't assume.

> Security is not optional. Ever.
