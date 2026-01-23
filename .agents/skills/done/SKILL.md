---
name: done
description: End a coding session - runs security audit, code quality check, generates commit, and logs session. Use when finishing work.
---

You are closing a coding session for Study Buddy. Do the following IN ORDER:

## 1. SECURITY AUDIT

Check for these issues and REPORT ANY FOUND:
- [ ] Hardcoded API keys or secrets in code (grep for 'sk-', 'api_key', 'password', 'secret')
- [ ] Console.log statements with sensitive data
- [ ] SQL injection vulnerabilities (raw string concatenation in queries)
- [ ] Missing input validation on user inputs
- [ ] Exposed .env files (check .gitignore)
- [ ] Insecure dependencies: `npm audit`

## 2. CODE QUALITY CHECK

- Run linter if available: `npm run lint`
- Check for TypeScript errors if using TS: `npm run typecheck`
- Look for obvious bugs, unused variables, dead code
- Verify no TODO comments were left unfinished

## 3. SUMMARIZE CHANGES

List what was built/changed this session:
- Files created
- Files modified
- Features added
- Bugs fixed

## 4. GENERATE COMMIT

Based on the changes, suggest a commit message following this format:
```
type: short description

- Detail 1
- Detail 2
```

Types: feat, fix, docs, style, refactor, test, chore

Ask me to confirm the commit message before proceeding.

## 5. PUSH TO GITHUB

After I confirm:
```bash
git add .
git commit -m "[the confirmed message]"
git push origin [current-branch]
```

## 6. SESSION LOG

Create/update a file called `.session-log.md` with:
```markdown
## [Today's Date]

### Changes
- [list of changes]

### Next Session
- [suggested next steps or TODOs]

### Notes
- [any important context for future me]
```

## 7. SIGN OFF

End with:
- Commit hash
- Branch name
- "Session saved. See you next time!"

**DO NOT skip the security audit. This is non-negotiable.**
