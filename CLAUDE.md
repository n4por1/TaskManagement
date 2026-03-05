# CLAUDE.md — TaskManagement

This file provides guidance for AI assistants (Claude and others) working in this repository. It describes project purpose, structure, conventions, and development workflows.

---

## Project Overview

**TaskManagement** is a project for managing tasks, to-dos, and work items. The repository is in its initial setup phase — no source code has been committed yet.

> When source code is added, update this file to reflect the actual stack, structure, and conventions used.

---

## Repository Status

| Item | Status |
|---|---|
| Source code | Not yet added |
| Dependencies | Not yet configured |
| Tests | Not yet configured |
| CI/CD | Not yet configured |
| Database / migrations | Not yet configured |

---

## Git Configuration

- **Remote:** `http://local_proxy@127.0.0.1:49981/git/n4por1/TaskManagement`
- **Default working branch:** `claude/add-claude-documentation-hKsTD`
- **Commit signing:** SSH signing enabled (`/home/claude/.ssh/commit_signing_key.pub`)
- **Git user:** Claude <noreply@anthropic.com>

### Branch Naming Conventions

| Prefix | Purpose |
|---|---|
| `claude/` | AI-assisted feature or task branches |
| `feature/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Maintenance, deps, tooling |
| `docs/` | Documentation-only changes |

### Commit Message Format

Use conventional commits:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`

**Examples:**
```
feat(tasks): add task creation endpoint
fix(auth): handle expired token edge case
docs: update CLAUDE.md with project structure
```

---

## Development Workflow

### General Steps

1. **Branch** — create or switch to the appropriate feature branch
2. **Develop** — make focused, incremental changes
3. **Test** — run the test suite before committing (once configured)
4. **Commit** — use conventional commit messages
5. **Push** — push to origin with `-u` flag on first push:
   ```bash
   git push -u origin <branch-name>
   ```
6. **PR** — open a pull request against the main branch

### Push Instructions for AI Assistants

- Always push to the branch specified in the task context (starts with `claude/`)
- Use `git push -u origin <branch-name>`
- If push fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- Never push to `main` or `master` directly

---

## Code Conventions (Placeholders)

> These sections should be updated when the tech stack is decided.

### Language & Runtime

_To be determined. Common choices for a Task Management app:_
- **Node.js / TypeScript** — REST or GraphQL API
- **Python / FastAPI or Django** — REST API
- **Go** — high-performance API
- **React / Vue / Next.js** — frontend

### Formatting & Linting

- Follow the formatter configured for the chosen language (Prettier, Black, gofmt, etc.)
- Linting errors must be resolved before committing
- Run the linter before opening PRs

### Naming Conventions

| Element | Convention |
|---|---|
| Files | `kebab-case` (JS/TS) or `snake_case` (Python/Go) |
| Variables | `camelCase` (JS/TS) or `snake_case` (Python/Go) |
| Constants | `UPPER_SNAKE_CASE` |
| Classes / Types | `PascalCase` |
| Database tables | `snake_case`, plural (e.g., `task_items`) |

### Directory Structure (Anticipated)

```
TaskManagement/
├── CLAUDE.md               # This file
├── README.md               # Human-facing documentation
├── .gitignore
├── src/                    # Application source code
│   ├── api/                # API routes / controllers
│   ├── models/             # Data models / entities
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, logging, validation
│   └── utils/              # Shared utilities
├── tests/                  # Test files (mirror src/ structure)
├── migrations/             # Database migrations
├── config/                 # Environment-specific config
├── scripts/                # Dev / deployment helper scripts
└── docs/                   # Extended documentation
```

---

## Testing

> Update this section once tests are configured.

- **Framework:** TBD (Jest, Pytest, Go test, etc.)
- **Coverage target:** Aim for ≥80% on business logic
- **Test types:**
  - Unit tests for services and utilities
  - Integration tests for API endpoints
  - E2E tests for critical user flows

**Run tests (example, update when configured):**
```bash
# Node.js
npm test

# Python
pytest

# Go
go test ./...
```

---

## Environment Variables

> Populate this section when environment configuration is established.

Create a `.env` file (never commit it) based on `.env.example`:

```bash
# Example variables for a Task Management app
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/taskmanagement
JWT_SECRET=your_secret_here
```

---

## Database

> Update when a database and ORM/query library are chosen.

- **Engine:** TBD (PostgreSQL, MySQL, SQLite, MongoDB, etc.)
- **Migrations:** Run migrations before starting the app
- **Seeding:** Use seed scripts for local development data

---

## CI/CD

> Update when CI/CD pipelines are configured.

Planned pipeline stages:
1. Lint
2. Type-check (if TypeScript)
3. Unit tests
4. Integration tests
5. Build
6. Deploy (staging / production)

---

## Key Files to Know

| File | Purpose |
|---|---|
| `CLAUDE.md` | AI assistant guidance (this file) |
| `README.md` | Human-facing project documentation |
| `.gitignore` | Files excluded from version control |
| `.env.example` | Template for environment variables |

---

## AI Assistant Guidelines

- **Read before editing:** Always read existing files before making modifications.
- **Minimal changes:** Only change what is directly required by the task.
- **No over-engineering:** Avoid adding abstractions, helpers, or features not explicitly requested.
- **Security:** Never commit secrets, tokens, or credentials. Never introduce SQL injection, XSS, or other OWASP vulnerabilities.
- **Conventional commits:** Always use the commit format described above.
- **Update this file:** If you make significant structural changes to the codebase, update the relevant sections of CLAUDE.md to reflect the current state.
- **Branch discipline:** Always develop on the branch specified in the task. Never push to `main` without explicit permission.

---

*Last updated: 2026-03-05 — Initial creation (empty repository setup)*
