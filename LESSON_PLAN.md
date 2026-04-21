# LESSON_PLAN.md

## Multi-Agent AI Development with Claude Code

---

## Overview

Students select one of twelve project ideas and use a four-agent Claude Code pipeline to generate a complete full-stack application. Each agent writes output to a local file; the next agent reads that file as context. A helper script (`extract_files.py`) materializes those files into real source directories. By the end of Session 2, students have a running React + Kotlin/Ktor app backed by SQLite, reviewed by an AI agent, and stored in a GitHub repository.

**Tech Stack:** React + Vite (frontend) | Kotlin + Ktor + Exposed (backend) | SQLite (database)

**File Chain:** `design.md` → `frontend_output.md` → `backend_output.md` → `REVIEW.md`

---

## Prerequisites for Students

- Node.js 18+ and npm installed (for the React frontend)
- JDK 21+ installed (`java -version` shows 21 or higher)
- Python 3.10+ installed (for `extract_files.py`)
- Claude Code CLI installed and authenticated (`claude --version` returns a version string)
- Git installed and configured with a GitHub account
- A terminal emulator (macOS Terminal, iTerm2, Windows Terminal, or WSL2)

---

---

# CLASS 1 — Introduction to Agents and the Design Phase

**Total Duration:** 60 minutes

**Session Learning Objectives:**

By the end of Class 1 students will be able to:

1. Explain what an AI agent is and how it differs from a single prompt
2. Run the design agent from the terminal and save output to `design.md`
3. Read and interpret all three sections of `design.md` (API Spec, DB Schema, Component Tree)

---

## Class 1 Schedule

---

### Block 1 — Welcome + Setup Check

**[0:00–0:08] | 8 minutes | Activity Type: Student Exercise + Discussion**

**Learning Objective:** Confirm every student has a working Claude Code environment before the lesson begins.

**What the Instructor Does:**
- Displays a slide with four verification commands and instructs students to run all four in sequence
- Circulates the room watching for red error output; flags students who need help immediately
- Calls on two or three students to read their version outputs aloud so the room hears what success looks like
- Announces that any student who is blocked should raise a hand and a TA (or a neighbor who finished early) will assist while the lecture continues

**What Students Do:**
- Open a terminal and run each verification command in order:

```bash
node --version        # expect v18.x or higher
java -version         # expect 21.x or higher
python3 --version     # expect 3.10 or higher
claude --version      # expect a Claude Code version string
git --version         # expect git version 2.x
```

- Report their output to the instructor verbally when called on
- Help a neighbor if their own environment is confirmed working
- Create and navigate to a project folder that will hold all session work:

```bash
mkdir ~/cs-agents && cd ~/cs-agents
```

**Facilitation Tips:**
Students on Windows most often fail the `claude --version` check because they installed Claude Code inside WSL2 but are running a native PowerShell terminal; direct them to open their WSL2 terminal specifically. Students who installed Node via system package managers on Ubuntu may have Node 14 or 16; have them use `nvm install 18 && nvm use 18` as a quick fix. Reserve no more than two minutes of whole-class time for blockers — move on and let helpers work in parallel.

**Transition:** Now that everyone has a working environment, let's zoom out and understand exactly what Claude Code is and why agents are a fundamentally different paradigm than single prompts.

---

### Block 2 — What Is Claude Code + What Is an Agent?

**[0:08–0:18] | 10 minutes | Activity Type: Lecture**

**Learning Objective:** Articulate the distinction between a one-shot prompt and an agentic loop that plans, acts, observes, and iterates.

**What the Instructor Does:**
- Presents the "single prompt vs. agent" comparison using a two-column diagram on the board or slide:
  - Left column: user types a prompt → model returns text → done
  - Right column: user gives a goal → agent breaks it into steps → agent calls tools (read file, write file, run command) → agent observes results → agent loops until the goal is met
- Explains the three properties that make something an agent: (1) it has access to tools, (2) it can act over multiple steps without a human in the loop, and (3) it persists state between steps (via files, databases, or memory)
- Draws the analogy to a software contractor: a single prompt is like asking a contractor one question; an agent is like handing a contractor a spec document and saying "build it and tell me when it is done"
- Introduces Claude Code specifically: it is Anthropic's CLI-native agent that runs in a terminal, can read and write files in the local filesystem, execute shell commands, and chain skills

**What Students Do:**
- Take structured notes using a provided two-column template (or their own notebook): "Single Prompt" vs. "Agent"
- Identify one task from their everyday coding workflow that would benefit from being agentified (they will reference this in the exit ticket)
- Ask clarifying questions; typical good questions to anticipate: "Is this the same as ChatGPT with plugins?" and "Does the agent run on my machine or on Anthropic's servers?"
- Jot down the three agent properties (tools, multi-step, persistent state) as they will appear on the exit ticket

**Facilitation Tips:**
The most common conceptual stumble is conflating "chain of thought" (which is the model thinking step by step inside a single response) with "agentic loop" (which involves real tool calls and real side effects). Use a concrete example: "When the design agent writes `design.md` to your disk, that file is actually created — you can open it in VS Code right now. Chain of thought never leaves the model's context window." Students who have used LangChain or AutoGPT may have strong (sometimes incorrect) preconceptions; validate their experience and then clarify where Claude Code differs (local-first, file-based, no hidden orchestration framework required).

**Transition:** Now that you understand what an agent is, let's see the specific four-agent pipeline you'll use for your project and understand how each agent hands off work to the next.

---

### Block 3 — The Four-Agent Pipeline and File Chain Diagram

**[0:18–0:23] | 5 minutes | Activity Type: Lecture**

**Learning Objective:** Describe the role of each of the four agents and explain how local files act as the handoff mechanism between them.

**What the Instructor Does:**
- Projects or draws the file chain diagram:

```
[design-agent]
      |
      v
  design.md  ─────────────────────────────────────────┐
      |                                                |
      v                                                |
[frontend-agent]                                       |
      |                                                |
      v                                                |
frontend_output.md → extract_files.py → frontend/     |
                                                       |
  design.md ─────────────────────────────────────────>|
      |                                                |
      v                                                v
[backend-agent]                              [review-agent]
      |                                                ^
      v                                                |
backend_output.md → extract_files.py → backend/       |
      |______________________________________________|
                                                       |
                                                       v
                                                  REVIEW.md
```

- Narrates each agent's responsibility in one sentence:
  - **design-agent**: takes the project idea; outputs API spec, DB schema, and component tree
  - **frontend-agent**: reads `design.md`; outputs all React + Vite source files
  - **backend-agent**: reads `design.md`; outputs all Kotlin + Ktor source files
  - **review-agent**: reads all three prior files; outputs a structured code review with issues and verdict
- Explains why files are the handoff: inspectable, version-controllable, resumable, recoverable

**What Students Do:**
- Copy the diagram into their notes with labels
- Annotate each arrow with the file name that flows across it
- Identify which agents they run in Class 1 (design only) vs. Class 2 (frontend, backend, review, skill)

**Facilitation Tips:**
Students sometimes ask why the review agent needs `design.md` in addition to the two output files. Emphasize that the review agent checks conformance — it verifies that the frontend and backend actually implement what the design specified. Without `design.md` the review agent has no ground truth. A second common question is whether agents can run in parallel; the frontend and backend agents are technically independent (both only depend on `design.md`), but the course runs them sequentially to keep complexity manageable.

**Transition:** Before we see the design agent in action, take five minutes to pick your project — everything from here on is personalized to your choice.

---

### Block 4 — Project Selection

**[0:23–0:28] | 5 minutes | Activity Type: Student Exercise**

**Learning Objective:** Commit to one project idea so that all subsequent agent runs produce personally meaningful output.

**What the Instructor Does:**
- Displays the twelve project ideas grouped by category:

  | Category | Projects |
  |---|---|
  | Productivity | Study Session Tracker, Personal Budget Manager, Habit Tracker |
  | Developer Tools | Code Snippet Manager, Bug Tracker, API Request Tester |
  | Campus / Social | Study Group Finder, Campus Event Board, Peer Tutoring Board |
  | Fun / Creative | Movie/Book Wishlist, Recipe Box, Trivia Game Builder |

- Instructs students to record their choice in a `PROJECT.txt` file
- Reminds students that no two adjacent students should pick the same project
- Notes the rule: pick from the list; custom ideas are a post-course extension

**What Students Do:**
- Select one project and write it to a file:

```bash
echo "Habit Tracker" > ~/cs-agents/PROJECT.txt
```

- Tell their neighbor their choice and confirm they chose something different
- Note a few features they personally want — these can be included in the design agent prompt

**Facilitation Tips:**
Some students will be indecisive; give a firm "pick in the next 60 seconds or I pick for you" to prevent stalling. Students who try to merge two ideas ("a habit tracker that is also a budget manager") should be redirected firmly — the agents work best with a single scoped idea. Students interested in a custom project should be told that the `/build-app` skill they build in Class 2 works on any idea after the course.

**Transition:** You have your project — now let's watch the design agent turn that idea into a full technical specification.

---

### Block 5 — Live Demo: Running the Design Agent

**[0:28–0:38] | 10 minutes | Activity Type: Live Demo**

**Learning Objective:** Observe the complete sequence of commands to invoke the design agent and verify that `design.md` is created with the correct structure.

**What the Instructor Does:**
- Opens a terminal in a clean demo directory:

```bash
mkdir ~/cs-agents/demo-project && cd ~/cs-agents/demo-project
```

- Opens Claude Code in the demo directory:

```bash
mkdir ~/cs-agents/demo-project && cd ~/cs-agents/demo-project
claude
```

- Sends this prompt inside the Claude Code session:

```
Read prompts/01_design_agent.md, replace {PROJECT_IDEA} with "Recipe Box",
then act on those instructions and save your complete output to design.md.
```

- After completion, verifies all three sections:

```bash
grep "^## API Spec\|^## DB Schema\|^## Component Tree" design.md
```

- Opens `design.md` in VS Code and walks through each section

**What Students Do:**
- Watch the demo and follow along in notes
- Note that the prompt tells Claude exactly what file to read, what to substitute, and where to save — this is the pattern they will repeat for every agent
- Write down one question about the output to ask during the exercise debrief

**Facilitation Tips:**
Always run `claude --version` in the demo terminal before class to confirm authentication. The prompt-based approach means students type naturally inside Claude Code rather than constructing shell commands — lower syntax friction, same result. If the output is long, pause at each H2 section header and ask a student to read it aloud before continuing. Reassure students that the design is a starting point, not a contract — the review agent will catch any issues.

**Transition:** You have seen how it works — now run the design agent on your own project.

---

### Block 6 — Student Exercise 1: Run the Design Agent

**[0:38–0:48] | 10 minutes | Activity Type: Student Exercise**

**Learning Objective:** Successfully execute the design agent and produce a well-structured `design.md` for your chosen project.

**What the Instructor Does:**
- Posts the steps on the projector:

```bash
# 1. Create project folder and open Claude Code
mkdir ~/cs-agents/my-project && cd ~/cs-agents/my-project
claude
```

```
# 2. Inside Claude Code — paste this prompt (substitute your project name)
Read prompts/01_design_agent.md, replace {PROJECT_IDEA} with "Habit Tracker",
then act on those instructions and save your complete output to design.md.
```

```bash
# 3. After Claude finishes — verify from terminal (! prefix runs in shell)
! grep "^## API Spec\|^## DB Schema\|^## Component Tree" design.md
```

- Circulates and checks students are in their project folder, not the demo folder
- Watches for blank or error-only `design.md` (auth issue)

**What Students Do:**
- Create their project directory and open Claude Code in it
- Paste the prompt with their own project name substituted
- Run the verify command — it must print exactly three lines

**Facilitation Tips:**
If a student's `design.md` is missing one of the three sections, re-run with the same prompt — the model is non-deterministic and a second run almost always completes. Students who finish early should read through their `design.md` and mark any endpoint or table they do not understand — the next block provides the interpretive framework.

**Transition:** Now that you have your own `design.md`, let's build a shared vocabulary for reading it.

---

### Block 7 — Reading and Interpreting design.md

**[0:48–0:53] | 5 minutes | Activity Type: Discussion**

**Learning Objective:** Map each section of `design.md` to its role in the full-stack architecture.

**What the Instructor Does:**
- Cold-calls three students with targeted questions:
  1. "What does the API Spec tell the backend developer?"
  2. "What does the DB Schema tell the backend developer?"
  3. "What does the Component Tree tell the frontend developer?"
- Draws the explicit connection: "The frontend agent reads the Component Tree. The backend agent reads the API Spec and DB Schema. This is why the design document must be thorough — it is the single source of truth for both agents."
- Points out one nuance: if the API Spec path is `/api/habits` but a component calls `/habits`, that mismatch will appear in REVIEW.md as a warning

**What Students Do:**
- Open their `design.md` and find one endpoint, one table, and one component
- Share with a neighbor: "My app has endpoint [X], table [Y], component [Z]"
- Flag any inconsistency they notice (these are good review agent catches)

**Facilitation Tips:**
Students sometimes conflate the DB Schema with an ORM model class — clarify that `design.md` is specification only; the actual SQLite code is generated by the backend agent in Class 2. Students unfamiliar with REST: "request body = what the client sends up, response = what the server sends back" is enough to unblock them.

**Transition:** You have your design document — see you in Class 2 where you bring it to life with three more agents.

---

### Block 8 — Class 1 Wrap-Up + Preview of Class 2

**[0:53–1:00] | 7 minutes | Activity Type: Discussion**

**Learning Objective:** Consolidate Class 1 concepts and set expectations for Class 2.

**What the Instructor Does:**
- Collects Class 1 exit tickets
- Previews Class 2: "Next session you run three more agents in sequence — frontend, backend, and review — then install the `/build-app` skill that chains all four automatically."
- Confirms every student has `design.md` before they leave:

```bash
cat ~/cs-agents/my-project/design.md | head -5
```

**What Students Do:**
- Answer exit ticket questions
- Note their project directory path for Class 2
- Re-read `design.md` before Class 2 and mark 2–3 components or endpoints to look for in generated code
- Optionally commit to GitHub:

```bash
cd ~/cs-agents/my-project
git init && git add design.md && git commit -m "Add design.md from Class 1"
```

**Facilitation Tips:**
Do not let class end without confirming every student has a valid `design.md`. Students who failed to generate it must resolve this before Class 2 — direct them to office hours or the troubleshooting reference card.

---

---

# CLASS 2 — Chaining Agents, Extracting Files, and Shipping the App

**Total Duration:** 60 minutes

**Session Learning Objectives:**

By the end of Class 2 students will be able to:

1. Chain three agents in sequence using local files as handoff points
2. Extract agent output files into real source directories using `extract_files.py`
3. Run a full-stack app locally (two terminal tabs, `localhost:5173` + `localhost:3001`)
4. Build and invoke a custom Claude Code skill

---

## Class 2 Schedule

---

### Block 1 — Recap Quiz + Setup Check

**[0:00–0:05] | 5 minutes | Activity Type: Student Exercise + Discussion**

**Learning Objective:** Confirm Class 1 retention and verify all students have `design.md`.

**What the Instructor Does:**
- Projects three rapid-fire recap questions:
  1. "What are the three properties that distinguish an agent from a single prompt?" (tools, multi-step, persistent state)
  2. "What file does the design agent save its output to?" (`design.md`)
  3. "What are the three sections of `design.md`?" (API Spec, DB Schema, Component Tree)
- Instructs students to verify their working directory:

```bash
cd ~/cs-agents/my-project && ls -lh
```

- Identifies any student without `design.md` and helps them re-run immediately

**What Students Do:**
- Answer recap questions
- Run the directory check and confirm `design.md` is present
- Re-run design agent if missing (takes under 2 minutes)

**Facilitation Tips:**
Keep strictly under five minutes. Students with environment issues from Class 1 should be handled in parallel by a TA. If more than two or three students are missing `design.md`, pause for a full two-minute group re-run. The rest of Class 2 entirely depends on a valid `design.md`.

**Transition:** Everyone has their design document — let me show the big picture before we start running agents.

---

### Block 2 — Agent Chaining Concept + File Chain Diagram Revisited

**[0:05–0:10] | 5 minutes | Activity Type: Lecture**

**Learning Objective:** Explain why file-based handoff is a reliable chaining mechanism and describe failure recovery.

**What the Instructor Does:**
- Redraws the file chain diagram with "reads" and "writes" labels on every arrow
- Explains the failure model: "If the frontend agent crashes, `frontend_output.md` may be incomplete — just re-run it. `design.md` is untouched. This is why files beat a single giant context."
- Previews `extract_files.py`: "Agent output files are markdown with fenced code blocks. The script reads the `// FILE:` comment at the top of each block and writes it to the correct path. You just run the script."

**What Students Do:**
- Update their diagram with reads/writes labels
- Write down the failure recovery rule: re-run the failing agent; upstream files are safe
- Identify the first agent today (frontend) and confirm its input (`design.md`) and output (`frontend_output.md`)

**Facilitation Tips:**
Students with Make or shell pipeline experience will immediately grasp file-based chaining — use that analogy. Avoid going deep into `extract_files.py` internals here; the live demo makes it self-evident. The most common confusion is thinking the extractor is part of Claude Code — clarify it is a plain Python script in the course repo.

**Transition:** Let's watch the complete frontend agent sequence before you run it yourselves.

---

### Block 3 — Live Demo: Frontend Agent → frontend_output.md → extract → frontend/

**[0:10–0:20] | 10 minutes | Activity Type: Live Demo**

**Learning Objective:** Observe the full frontend agent workflow from command to inspectable React source files.

**What the Instructor Does:**
- Opens Claude Code in the demo project (already open from Class 1, or re-open):

```bash
cd ~/cs-agents/demo-project
claude
```

- Sends this prompt inside the Claude Code session:

```
Read prompts/02_frontend_agent.md for your instructions and read design.md
as your context. Follow the instructions and save your complete output to
frontend_output.md. Then run: python3 scripts/extract_files.py frontend_output.md
```

- While agent runs, explains the pattern: "The prompt tells Claude which instruction file to read and which context file to use. Claude reads both, generates all the React source, saves the output, and runs the extractor — one prompt does all three steps."
- After completion, shows the extracted files:

```bash
! find frontend/ -type f | sort
```

- Opens one component in VS Code

**What Students Do:**
- Note the prompt pattern: instruction file + context file + output file + extract command
- Note that `// FILE:` comments in the raw output are what the extractor uses to know where to write each file
- Write down one question about the generated components to ask during the exercise debrief

**Facilitation Tips:**
The prompt-based approach works on all platforms — no shell substitution syntax to debug. Emphasize that `design.md` is the context, not another prompt — Claude reads it to understand what the frontend must implement. A very short `frontend_output.md` (under 50 lines) means `design.md` was malformed; have students re-run the design agent first.

**Transition:** Run the same sequence on your own project.

---

### Block 4 — Student Exercise 2: Run the Frontend Agent

**[0:20–0:28] | 8 minutes | Activity Type: Student Exercise**

**Learning Objective:** Execute the frontend agent and extract React source files into `frontend/` for your project.

**What the Instructor Does:**
- Posts the steps on the projector:

```bash
# 1. Make sure you're in your project folder with Claude Code open
cd ~/cs-agents/my-project
claude
```

```
# 2. Inside Claude Code — paste this prompt
Read prompts/02_frontend_agent.md for your instructions and read design.md
as your context. Follow the instructions and save your complete output to
frontend_output.md. Then run: python3 scripts/extract_files.py frontend_output.md
```

```bash
# 3. Verify from within Claude Code (or terminal)
! find frontend/ -type f | sort
```

- After Claude finishes, confirms `frontend/src/` directory exists before students continue

**What Students Do:**
- Open Claude Code in their project folder (same session from design agent is fine)
- Paste the prompt — Claude reads both files and runs the extractor automatically
- Verify `frontend/src/` exists; keep `frontend_output.md` on disk — agent 04 reads it

**Facilitation Tips:**
Students can stay in the same Claude Code session for all four agents — no need to re-open. A very short `frontend_output.md` (under 50 lines) means `design.md` was malformed; have them re-run the design agent first.

**Transition:** Your frontend is ready — repeat the same pattern for the backend.

---

### Block 5 — Live Demo: Backend Agent → backend_output.md → extract → backend/

**[0:28–0:36] | 8 minutes | Activity Type: Live Demo**

**Learning Objective:** Observe the backend agent workflow producing a `backend/` directory with server source files.

**What the Instructor Does:**
- Continues in the same Claude Code session (or re-opens in demo-project):

```
# Inside Claude Code — paste this prompt
Read prompts/03_backend_agent.md for your instructions and read design.md
as your context. Follow the instructions and save your complete output to
backend_output.md. Then run: python3 scripts/extract_files.py backend_output.md
```

- After Claude finishes, shows the extracted Kotlin files:

```bash
! find backend/ -name "*.kt" | sort
```

- Opens a route file and shows that endpoint paths match `design.md`'s API Spec

**What Students Do:**
- Notice this is the exact same prompt pattern as agent 02 — only the instruction file and output file names change
- Note that the Kotlin backend lives in `backend/src/main/kotlin/` — standard Gradle project layout

**Facilitation Tips:**
The most common backend agent issue is generating routes with a different base path than the frontend calls; the review agent catches this. Keep the demo tight — 8 minutes goes fast.

**Transition:** Run the backend agent on your own project.

---

### Block 6 — Student Exercise 3: Run the Backend Agent

**[0:36–0:44] | 8 minutes | Activity Type: Student Exercise**

**Learning Objective:** Execute the backend agent and extract server source files into `backend/` for your project.

**What the Instructor Does:**
- Posts the steps on the projector:

```
# Inside Claude Code — paste this prompt (same session is fine)
Read prompts/03_backend_agent.md for your instructions and read design.md
as your context. Follow the instructions and save your complete output to
backend_output.md. Then run: python3 scripts/extract_files.py backend_output.md
```

```bash
# Verify from within Claude Code
! find backend/ -name "*.kt" | sort
! grep "3001" backend/src/main/kotlin/com/app/Application.kt
```

**What Students Do:**
- Paste the prompt — same pattern as agent 02, just different file names
- Keep `backend_output.md` on disk — agent 04 reads it

**Facilitation Tips:**
If the grep for `3001` returns nothing, ask Claude to open `Application.kt` and fix the port. On first run, `./gradlew run` downloads Gradle dependencies which can take 1–2 minutes; warn students ahead of time.

**Transition:** Frontend and backend are ready — let's start both servers and see the app in a browser.

---

### Block 7 — Running the Full Stack Locally

**[0:44–0:49] | 5 minutes | Activity Type: Live Demo**

**Learning Objective:** Start both dev servers and verify the app runs in a browser.

**What the Instructor Does:**
- Opens two terminal tabs on the projector:

```bash
# Tab 1 — Backend (Kotlin + Ktor)
cd ~/cs-agents/demo-project/backend
./gradlew run          # Mac/Linux
gradlew.bat run        # Windows
# Expected: "Application started. Listening on port 3001"
# First run downloads Gradle dependencies (~1-2 min)

# Tab 2 — Frontend (React + Vite)
cd ~/cs-agents/demo-project/frontend
npm install
npm run dev
# Expected: "VITE ready on http://localhost:5173"
```

- Opens browser to `http://localhost:5173` and demonstrates one full interaction
- States: "Real code, generated by two AI agents, running in a real browser with a real SQLite database on your laptop. No cloud, no subscription, no deployment."

**What Students Do:**
- Open two terminal tabs and run the same commands in their project directories
- Navigate to `http://localhost:5173` and test one create + read interaction
- Note any browser console errors for the review agent

**Facilitation Tips:**
Most common failure: CORS error because the frontend is calling a URL that doesn't match the backend CORS config. Check that `origin` in CORS middleware is exactly `http://localhost:5173` with no trailing slash. Second most common: `npm install` fails because `package.json` was not extracted — re-run `extract_files.py`.

**Transition:** The app is running — now have an AI review it.

---

### Block 8 — The Review Agent + REVIEW.md Walkthrough

**[0:49–0:54] | 5 minutes | Activity Type: Live Demo + Discussion**

**Learning Objective:** Run the review agent and interpret REVIEW.md as a structured quality check.

**What the Instructor Does:**
- Continues in the same Claude Code session:

```
# Inside Claude Code — paste this prompt
Read prompts/04_review_agent.md for your instructions. Use design.md,
frontend_output.md, and backend_output.md as your context. Follow the
instructions and save your complete output to REVIEW.md.
```

```bash
# Show section headers after Claude finishes
! grep "^## " REVIEW.md
```

- Points out the verdict and explains GREEN / YELLOW / RED in a professional context
- Highlights one or two issues the agent found

**What Students Do:**
- Paste the same prompt in their Claude Code session — all four files are already in their project folder
- Read their REVIEW.md and identify their verdict
- Note one Critical or Warning issue to discuss with a neighbor

**Facilitation Tips:**
Students who get a RED verdict may feel disappointed — remind them RED means one or two fixable mismatches, not a failed project. The review agent occasionally flags false positives; the key lesson is the value of automated review, not the accuracy of any single finding. Don't debug REVIEW.md findings during class — that's a post-class exercise.

**Transition:** The review agent is the last manual step — the `/build-app` skill chains all four automatically.

---

### Block 9 — Building and Installing the /build-app Skill

**[0:54–0:59] | 5 minutes | Activity Type: Live Demo + Student Exercise**

**Learning Objective:** Install the `/build-app` skill and invoke it to chain all four agents in one command.

**What the Instructor Does:**
- Explains a skill in one sentence: "A markdown file that defines a slash command — it contains the steps Claude Code executes when you type `/build-app`."
- Installs the skill from the course repo:

```bash
claude skill install ~/Documents/course-ai-agents/skills/build-app.md

# Verify
claude
# then type: /build-app
# expect: skill help text appears
```

- Invokes it on a fresh directory to demonstrate automatic chaining:

```bash
mkdir ~/cs-agents/skill-demo && cd ~/cs-agents/skill-demo
/build-app "Bug Tracker"
```

**What Students Do:**
- Install the skill and verify it appears
- Optionally invoke `/build-app` with their own project name in a new directory and watch all four agents run automatically

**Facilitation Tips:**
On Windows non-WSL, the skill install path may need backslashes. The `/build-app` invocation takes 2–4 minutes to complete all four agents — students should start it and let it run during the GitHub push block. Remind them the individual output files (`design.md`, etc.) are still saved at each step — if any agent fails, they can re-run just that step.

**Transition:** Skill installed — commit everything to GitHub.

---

### Block 10 — Push to GitHub + Final Demo

**[0:59–1:00] | 1 minute (students complete after class)**

**Learning Objective:** Commit all generated files and push to a public GitHub repository.

**What the Instructor Does:**
- Gives the commands quickly:

```bash
cd ~/cs-agents/my-project
git init
git add design.md frontend_output.md backend_output.md REVIEW.md frontend/ backend/
git commit -m "Initial full-stack app generated by Claude Code agents"
gh repo create my-project --public --source=. --push
```

- Collects GitHub repo URLs via the course LMS
- Congratulates the class

**What Students Do:**
- Start the push commands (complete as homework if needed)
- Submit GitHub URL to LMS
- Complete Class 2 exit ticket

**Facilitation Tips:**
Students who haven't run `gh auth login` will get a 401. Fallback: create repo on github.com, copy the HTTPS URL, then `git remote add origin <url> && git push -u origin main`. Don't let this block run over — the push is homework, not an in-class requirement.

---

---

# Instructor Reference Sections

---

## Pre-Class Checklist

### Before Class 1

1. Run `claude --version` on the demo machine — re-authenticate if needed with `claude auth login`
2. Confirm `node --version` shows v18 or higher; use `nvm install 18 && nvm use 18` if not
3. Confirm `java -version` shows 21 or higher; install with `brew install openjdk@21` if not
4. Confirm `python3 --version` shows 3.10 or higher
5. Verify `extract_files.py` runs without error: `python3 extract_files.py --help`
6. Pre-generate a `design.md` for "Recipe Box" and save as a backup in case the live demo agent run fails
7. Set terminal font size to 18pt minimum; confirm readability from the back of the room
8. Post the course repo URL and SETUP.md link to students via LMS before class
9. Save all demo commands to a `demo_commands.txt` backup file you can copy-paste from if the terminal session crashes

### Before Class 2

1. Confirm the demo project's `design.md` from Class 1 is intact — restore from backup if modified
2. Pre-run the frontend agent offline and save `frontend_output.md` to a backup location
3. Pre-run the backend agent offline and save `backend_output.md` to a backup location
4. Test `extract_files.py` on both backup files and confirm `frontend/` and `backend/` directories are created correctly
5. Pre-install the `/build-app` skill and verify it appears with `ls ~/.claude/skills/`
6. Run `npm install` in `frontend/` and `./gradlew run` in `backend/` and confirm both start without errors
7. Confirm the app loads at `http://localhost:5173` with no CORS errors in the browser console
8. Confirm `gh auth status` shows an authenticated GitHub account for the push demo

---

## Parking Lot

**Q1: "Can I use a framework other than React + Vite for the frontend?"**
Not for this project — the agent prompts are calibrated for React + Vite. After completing the course, you can modify the frontend agent prompt to target Vue, Svelte, or any other framework.

**Q2: "Does the agent remember my previous runs?"**
No. Each `claude -p` invocation starts a fresh context. Re-running an agent gives a different but equally valid output — this is how you recover from a bad result without losing upstream files.

**Q3: "Can the frontend and backend agents run in parallel?"**
Yes — both only read `design.md` and write to different files. Open two terminal tabs and run simultaneously. Just confirm both extract commands finish before running the review agent.

**Q4: "What if my generated app has a bug — does Claude Code fix it automatically?"**
Not automatically. The review agent identifies it in `REVIEW.md`. You then either fix it manually in the source file, or re-run the agent with "Additionally, fix the following issue: [description from REVIEW.md]" appended to the prompt.

**Q5: "Is this the same as GitHub Copilot or Cursor?"**
They overlap but solve different problems. Copilot and Cursor assist with code completion inside an editor. Claude Code is a terminal-native agent that reads and writes files, executes commands, and chains multi-step workflows autonomously. All three can coexist.

**Q6: "My design.md has an endpoint the frontend never calls — is that a problem?"**
It depends. A frontend ignoring an endpoint it should call is a Warning in REVIEW.md. A frontend calling an endpoint that doesn't exist in the design is Critical. The review agent flags both. A YELLOW verdict (warnings only) is acceptable for the course submission.

---

## Troubleshooting Reference Card

### macOS

**`claude: command not found` after installing**
```bash
# Add to ~/.zshrc:
export PATH="$HOME/.local/bin:$PATH"
source ~/.zshrc
```

**`extract_files.py: No such file or directory`**
```bash
# Run with explicit path:
python3 ~/Documents/course-ai-agents/scripts/extract_files.py frontend_output.md
```

**`java: command not found` or wrong Java version**
```bash
# Install JDK 21 via Homebrew (no sudo required):
brew install openjdk@21
# Add to ~/.zshrc:
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
source ~/.zshrc
java -version   # should show 21.x
```

**Port 3001 already in use**
```bash
lsof -ti:3001 | xargs kill -9
cd backend && ./gradlew run
```

### Windows

**`'claude' is not recognized`**
```powershell
# Find install location:
where.exe claude
# Add its directory to PATH via System Properties > Environment Variables
```

**`$(...)` syntax error in PowerShell**
```powershell
# Use Get-Content variable pattern instead:
$p = Get-Content prompts\02_frontend_agent.md -Raw
$c = Get-Content design.md -Raw
claude -p $p --context $c | Out-File -Encoding utf8 frontend_output.md
# Or switch to WSL2 for all agent commands
```

**`npm install` fails — ENOTFOUND registry.npmjs.org**
```powershell
npm config set registry https://registry.npmmirror.com
npm install
npm config set registry https://registry.npmjs.org
```

---

## Exit Ticket Questions

### Class 1

1. **Conceptual:** In your own words, what is the difference between a single-prompt AI interaction and an agentic loop? Give one concrete example from today's class.

2. **Technical:** What command did you run to generate your `design.md`? What are the three section headers the file must contain?

3. **Reflective:** Find one endpoint in your `design.md` API Spec and one component in the Component Tree that calls it. Explain the relationship in one sentence.

### Class 2

1. **Technical:** Describe the three-step sequence to go from `design.md` to a running `frontend/` directory. Write the exact commands for steps 2 and 3 from memory.

2. **Conceptual:** Why do both the frontend and backend agents read `design.md` as their primary input? What keeps the two stacks compatible even though the agents never communicate directly?

3. **Skill and Synthesis:** What is a Claude Code skill and where does the skill file live? What is the key advantage of `/build-app` over running each agent command manually?

---

## Extension Challenges

### Class 1 Extension

**Prompt Engineering Iteration:**
After your design agent finishes, find one underdeveloped section in `design.md` (a table with no constraints, a component with no props, an endpoint with no response shape). Re-run the design agent with one additional sentence explicitly requesting more detail in that section. Compare the two versions and write a three-sentence analysis of how the additional instruction changed the output.

### Class 2 Extension

**Custom Skill with Review Feedback Loop:**
Modify `build-app.md` to add a Step 8 that checks whether the review agent gave a RED verdict. If RED, the skill re-runs the backend agent with "Fix the following critical issues: [contents of REVIEW.md]" appended. Test it on a fresh project and document in `SKILL_NOTES.md` what changed between the original and revised backend output. This previews the feedback loop pattern used in production multi-agent systems.

---

## Post-Course Resources

1. **[Claude Code Documentation](https://docs.anthropic.com/claude-code)** — Official CLI reference for all flags, skill syntax, and authentication; start here when going beyond this course.

2. **[Anthropic Cookbook on GitHub](https://github.com/anthropics/anthropic-cookbook)** — Curated Python and TypeScript examples for building agents with the Anthropic API directly, including multi-agent patterns and tool use.

3. **[LangGraph Conceptual Docs](https://langchain-ai.github.io/langgraph/concepts/)** — Framework-level explanation of agent graphs and multi-agent coordination; provides deeper theoretical grounding for the file-chain pattern used in this course.

4. **[React + Vite Official Docs](https://vitejs.dev/guide/)** — Authoritative guide to Vite's dev server, build config, and plugin ecosystem; essential for customizing the frontend scaffold the agent generates.

5. **[Ktor Documentation](https://ktor.io/docs/welcome.html)** — Official guide to Ktor server features, routing, plugins, and deployment; the fastest path to customizing what the Kotlin backend agent produces.

6. **[The Pragmatic Engineer Newsletter](https://newsletter.pragmaticengineer.com)** — Practitioner-focused coverage of how working engineers are integrating AI agents into real development workflows; gives industry context for the skills learned in this course.

---

*End of LESSON_PLAN.md*
