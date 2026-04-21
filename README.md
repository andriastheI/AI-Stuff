# Multi-Agent Full-Stack App Generator
### Course Materials — AI-Assisted Software Engineering

A two-session course students build a complete full-stack web application using four collaborating Claude Code agents.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Kotlin + Ktor + Exposed |
| Database | SQLite (file-based, zero config) |
| Build | Gradle with Kotlin DSL |
| Runtime | JDK 21+ |

Everything runs locally — no cloud accounts, no billing, no deployment required.

---

## The Four-Agent Pipeline

```
[Your Idea]
    │
    ▼
01_design_agent   ──► design.md
                       (API spec + DB schema + component tree)
    │
    ├──────────────────────────────────────────┐
    ▼                                          ▼
02_frontend_agent                      03_backend_agent
──► frontend_output.md                 ──► backend_output.md
──► extract → frontend/                ──► extract → backend/
    (React + Vite)                         (Kotlin + Ktor)
    │                                          │
    └──────────────┬───────────────────────────┘
                   ▼
           04_review_agent
           ──► REVIEW.md
```

---

## Repository Contents

```
course-ai-agents/
├── prompts/
│   ├── 01_design_agent.md      # Architect — writes design.md
│   ├── 02_frontend_agent.md    # React dev — writes frontend_output.md
│   ├── 03_backend_agent.md     # Kotlin/Ktor dev — writes backend_output.md
│   └── 04_review_agent.md      # Reviewer — writes REVIEW.md
├── scripts/
│   └── extract_files.py        # Splits output .md files into real source dirs
├── skills/
│   └── build-app.md            # /build-app skill — chains all four agents
├── LESSON_PLAN.md              # Instructor guide with timed blocks
├── SETUP.md                    # Student environment setup (Mac + Windows)
└── README.md                   # This file
```

---

## Quick Start (Students)

**Step 1 — Set up your environment**
Follow [SETUP.md](./SETUP.md). You need: JDK 21+, Node.js 18+, Claude Code CLI, Git.

**Step 2 — Clone this repo and install the skill**
```bash
git clone https://github.com/badinvestor/ai-fullstack-project.git
cd ai-fullstack-project
claude skill install skills/build-app.md
```

**Step 3 — Pick a project idea**

| Category | Ideas |
|---|---|
| Productivity | Study Session Tracker · Personal Budget Manager · Habit Tracker |
| Developer Tools | Code Snippet Manager · Bug Tracker · API Request Tester |
| Campus / Social | Study Group Finder · Campus Event Board · Peer Tutoring Board |
| Fun / Creative | Movie/Book Wishlist · Recipe Box · Trivia Game Builder |

**Step 4 — Run the pipeline (manual — recommended for learning)**

Open Claude Code in your project folder, then send each prompt below in sequence.
Each agent saves its output to a file before the next one starts.

```bash
claude   # opens an interactive Claude Code session
```

**Agent 01 — Design** *(paste this as your first message)*
```
Read prompts/01_design_agent.md, replace {PROJECT_IDEA} with "Habit Tracker",
then act on those instructions and save your complete output to design.md.
```

**Agent 02 — Frontend** *(after design.md is saved)*
```
Read prompts/02_frontend_agent.md for your instructions and read design.md
as your context. Follow the instructions and save your complete output to
frontend_output.md. Then run: python3 scripts/extract_files.py frontend_output.md
```

**Agent 03 — Kotlin Backend** *(after design.md is saved)*
```
Read prompts/03_backend_agent.md for your instructions and read design.md
as your context. Follow the instructions and save your complete output to
backend_output.md. Then run: python3 scripts/extract_files.py backend_output.md
```

**Agent 04 — Review** *(after all three output files exist)*
```
Read prompts/04_review_agent.md for your instructions. Use design.md,
frontend_output.md, and backend_output.md as your context. Follow the
instructions and save your complete output to REVIEW.md.
```

Or automate everything with the skill: `/build-app "Habit Tracker"`

**Step 5 — Run your app locally**
```bash
# Terminal 1 — Kotlin backend (first run ~1-2 min to download deps)
cd backend
./gradlew run          # Mac/Linux
gradlew.bat run        # Windows
# → API at http://localhost:3001

# Terminal 2 — React frontend
cd frontend
npm install && npm run dev
# → App at http://localhost:5173
```

---

## Output Files Reference

| File | Created by | Read by |
|---|---|---|
| `design.md` | Agent 01 | Agents 02, 03, 04 |
| `frontend_output.md` | Agent 02 | Agent 04, extract script |
| `backend_output.md` | Agent 03 | Agent 04, extract script |
| `REVIEW.md` | Agent 04 | You |
| `RUNBOOK.md` | `/build-app` skill | You |

---

## Kotlin Backend Structure

```
backend/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/wrapper/gradle-wrapper.properties
└── src/main/kotlin/com/app/
    ├── Application.kt          # Ktor server, CORS, routing
    ├── DatabaseFactory.kt      # SQLite init, seed data
    ├── models/<Resource>.kt    # Exposed Table + @Serializable data classes
    └── routes/<Resource>Routes.kt  # Ktor route handlers
```

---

## Prerequisites

- Free [claude.ai](https://claude.ai) account
- Claude Code CLI
- JDK 21+ — see SETUP.md Section 2
- Node.js 18+
- Python 3.10+ (for extract_files.py)
- Git

See [SETUP.md](./SETUP.md) for full installation instructions.
