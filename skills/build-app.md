---
name: build-app
description: >
  Orchestrates the full four-agent pipeline to generate a complete
  full-stack app (React + Vite frontend, Kotlin + Ktor backend, SQLite),
  creates a GitHub repo, pushes the code, and has the review agent open
  a fix PR that the student must approve.
args:
  - name: project_idea
    description: One-line description of the app to build (e.g. "a habit tracker")
    required: true
---

<!-- ============================================================
     SKILL FILE: skills/build-app.md
     ---------------------------------------------------------------
     FILE CHAIN:
       [your idea] → 01_design_agent  → design.md
       design.md   → 02_frontend_agent → frontend_output.md → frontend/
       design.md   → 03_backend_agent  → backend_output.md  → backend/
       GitHub repo created, code pushed to main
       design.md + frontend_output.md + backend_output.md
                   → 04_review_agent  → REVIEW.md
                                      → fix/review-agent branch + PR
       All of the above → RUNBOOK.md

     HOW TO INSTALL:
       claude skill install skills/build-app.md

     HOW TO INVOKE:
       /build-app "habit tracker"
       /build-app "recipe box"

     PREREQUISITES:
       - gh CLI installed and authenticated: gh auth status
       - JDK 21+, Node.js 18+, Git configured
============================================================ -->

## Step 1 — Design Agent
Read prompts/01_design_agent.md, substitute {PROJECT_IDEA} with "{{project_idea}}",
then act on those instructions and save the complete output to design.md.

Verify before continuing — design.md must contain all three sections:
```bash
grep "^## API Spec\|^## DB Schema\|^## Component Tree" design.md
```

---

## Step 2 — Frontend Agent
Read prompts/02_frontend_agent.md for instructions and read design.md as context.
Follow the instructions exactly and save the complete output to frontend_output.md.
Then extract the files:

```bash
python3 scripts/extract_files.py frontend_output.md
echo "✓ frontend_output.md saved, frontend/ extracted"
```

```powershell
# Windows
python scripts\extract_files.py frontend_output.md
```

---

## Step 3 — Backend Agent (Kotlin + Ktor)
Read prompts/03_backend_agent.md for instructions and read design.md as context.
Follow the instructions exactly — including the intentional bug requirement —
and save the complete output to backend_output.md. Then extract the files:

```bash
python3 scripts/extract_files.py backend_output.md
echo "✓ backend_output.md saved, backend/ extracted"
```

```powershell
# Windows
python scripts\extract_files.py backend_output.md
```

---

## Step 4 — Create GitHub Repository and Push Code
Derive a URL-safe repo name from the project idea, initialise git, and push to a new
public GitHub repo. The review agent (Step 5) will create a `fix/review-agent` branch
and open a PR against main.

```bash
# Mac / Linux
SLUG=$(echo "{{project_idea}}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

git init
git add design.md frontend_output.md backend_output.md frontend/ backend/ scripts/ prompts/ RUNBOOK.md 2>/dev/null || true
git commit -m "feat: multi-agent generated app — {{project_idea}}"

gh repo create "$SLUG" --public --source=. --remote=origin --push
REPO_URL=$(gh repo view "$SLUG" --json url --jq .url)
echo "✓ GitHub repo: $REPO_URL"
```

```powershell
# Windows PowerShell
$slug = "{{project_idea}}".ToLower() -replace '[^a-z0-9]','-' -replace '-+','-' -replace '^-|-$',''
git init
git add design.md frontend_output.md backend_output.md frontend\ backend\ scripts\ prompts\
git commit -m "feat: multi-agent generated app — {{project_idea}}"
gh repo create $slug --public --source=. --remote=origin --push
Write-Host "✓ GitHub repo created"
```

---

## Step 5 — Review Agent
Read prompts/04_review_agent.md for instructions.
Use design.md, frontend_output.md, and backend_output.md as context.
Follow the instructions — including the GitHub Actions section at the bottom —
and save the review to REVIEW.md, create the fix branch, and open the PR.

```bash
echo "✓ REVIEW.md saved"
echo "✓ fix/review-agent PR opened — student must approve before merging"
```

---

## Step 6 — Write RUNBOOK.md

```markdown
# RUNBOOK — {{project_idea}}
Backend: Kotlin + Ktor + Exposed + SQLite

## Prerequisites
- [ ] JDK 21+: `java -version`
- [ ] Node.js 18+: `node --version`
- [ ] gh CLI authenticated: `gh auth status`
- [ ] All output files present: design.md, frontend_output.md, backend_output.md, REVIEW.md

## Before Running — Merge the Review PR
The review agent opened a `fix/review-agent` Pull Request on your GitHub repo.
Read the PR comments, review the diff, and merge it before running the app locally.

## Step 1 — Pull the latest code (after merging the review PR)
git pull origin main

## Step 2 — Start the Backend (Kotlin/Ktor)
cd backend
./gradlew run          (Mac/Linux)
gradlew.bat run        (Windows)
→ API running at http://localhost:3001
  First run downloads Gradle dependencies (~1-2 min)

## Step 3 — Start the Frontend (React/Vite)
Open a second terminal tab:
cd frontend
npm install
npm run dev
→ App running at http://localhost:5173

## Step 4 — Open in Browser
http://localhost:5173

## Resetting the Database
rm backend/data/app.db    (Mac/Linux)
del backend\data\app.db   (Windows)
Restart the backend — tables and seed data are recreated automatically.
```

---

## Step 7 — Summary

```bash
echo ""
echo "========================================="
echo " /build-app complete — {{project_idea}}"
echo "========================================="
echo " design.md          $(wc -l < design.md) lines"
echo " frontend_output.md $(wc -l < frontend_output.md) lines"
echo " backend_output.md  $(wc -l < backend_output.md) lines"
echo " REVIEW.md          $(wc -l < REVIEW.md) lines"
echo " RUNBOOK.md         written"
echo ""
echo " Backend stack: Kotlin + Ktor + Exposed + SQLite"
echo ""
echo " GitHub:"
echo "   main branch  — generated app code"
echo "   fix/review-agent PR — review fixes (student must approve + merge)"
echo ""
echo " Next: review and merge the PR, then follow RUNBOOK.md"
echo "========================================="
```
