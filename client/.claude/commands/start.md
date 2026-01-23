---
description: Resume a coding session - shows git status, recent commits, and codebase health
allowed-tools: Bash, Read, Glob
---

You are resuming a coding session for Study Buddy. Do the following:

## 1. SESSION CONTEXT

Run these commands to understand the current state:
- `git log --oneline -5` - Last 5 commits
- `git branch --show-current` - Current branch
- `git status --short` - Uncommitted changes

## 2. QUICK SUMMARY

Give me a 3-4 sentence summary of:
- What we worked on last session (based on commits)
- What the last commit/change was
- Any incomplete work or TODOs left behind

## 3. CODEBASE HEALTH CHECK

Run `npm run build` and note any errors or warnings.

## 4. READY TO GO

End with: "Ready to code. What are we building today?"

Format the response cleanly. Don't dump raw terminal output - summarize it for me.
