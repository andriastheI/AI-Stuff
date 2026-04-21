# Claude Code — Course Environment Setup Guide

---

This guide walks you through every tool you need before the first lab session. Follow each section in order. If you get stuck, check the Troubleshooting block at the end of each section before asking for help.

> **Estimated time:** 45–90 minutes depending on your machine and internet speed.

---

## Section 1: Create a Free Claude Account

Claude Code works with a claude.ai account. You do not need to enter a credit card.

### Steps

1. Open a web browser and go to [https://claude.ai](https://claude.ai).

2. Click **Sign up**.

3. Enter your email address and create a password, or sign up with Google or Apple. Either option works fine.

4. Check your email for a verification link from Anthropic. Click it to confirm your address.

5. Once redirected back to claude.ai, you should see the Claude chat interface. This means your account is active.

6. You can optionally fill in your name and preferences — these steps are not required.

### What the Free Tier Includes

- Access to Claude through the web interface and Claude Code CLI.
- A daily usage limit. If you hit it, you will see a message saying you have reached your limit. It resets every 24 hours.
- No credit card is required at any point.

> **Note for students:** The free tier is sufficient for this course. If you find yourself hitting the daily limit frequently, let the instructor know — do not purchase a paid plan without checking with the course team first.

### Verify Your Account Is Active

Log in at [https://claude.ai](https://claude.ai) and confirm you can send a message in the chat interface. If Claude responds, your account is working.

---

> **Troubleshooting — Section 1**
>
> **"I never received the verification email."**
> Check your spam or junk folder. If it is not there after 5 minutes, return to claude.ai and click "Resend verification email."
>
> **"The site says my email is already registered."**
> Use the "Forgot password" link to reset access to your existing account.
>
> **"I accidentally started a paid plan signup."**
> Stop and close the tab. Navigate back to [https://claude.ai/login](https://claude.ai/login). The free plan does not require any payment information.

---

## Section 2: Install Claude Code CLI

The Claude Code CLI (Command Line Interface) lets you run Claude directly from your terminal. The terminal is a text-based window where you type commands to control your computer. You will use it throughout this course.

### Opening Your Terminal

**Mac:** Press `Command + Space`, type "Terminal", and press Enter.

**Windows:** Press the Windows key, type "PowerShell", right-click **Windows PowerShell**, and select **Run as administrator**.

---

### Mac Installation

#### Step 1 — Install Homebrew (if you do not have it)

Homebrew is a package manager for Mac. It makes installing developer tools much easier. To check if you already have it, type this in Terminal and press Enter:

```bash
brew --version
```

If you see a version number, skip to Step 2. If you see "command not found", install Homebrew now:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

This command downloads and runs the Homebrew installer. It will ask for your Mac login password. Type it and press Enter — you will not see the characters appear, that is normal. Follow any on-screen prompts.

After it finishes, run this to confirm Homebrew is installed:

```bash
brew --version
```

You should see output like `Homebrew 4.x.x`.

#### Step 2 — Install Claude Code

```bash
brew install claude-code
```

Homebrew will download and install Claude Code. Wait for it to finish.

#### Step 3 — Verify the Install

```bash
claude --version
```

You should see a version number printed, such as `claude 1.x.x`.

---

### Windows Installation

#### Step 1 — Install Node.js

Claude Code on Windows requires Node.js. Go to [https://nodejs.org](https://nodejs.org) in your browser.

1. Click the **LTS** (Long Term Support) button to download the installer. LTS is the stable, recommended version.
2. Open the downloaded `.msi` file.
3. Click through the installer using all default options. Make sure **"Add to PATH"** is checked — it is checked by default.
4. Click **Install** and wait for it to finish.
5. Click **Finish**.

Verify Node.js installed correctly by opening a **new** PowerShell window and running:

```powershell
node --version
```

You should see something like `v20.x.x`.

#### Step 2 — Install Claude Code via npm

npm is the Node Package Manager that was installed alongside Node.js. Run:

```powershell
npm install -g @anthropic-ai/claude-code
```

The `-g` flag means "install globally" so the `claude` command is available everywhere on your system.

#### Step 3 — Verify the Install

```powershell
claude --version
```

You should see a version number printed.

---

### Authenticating Claude Code (Both Platforms)

The first time you run a `claude` command that requires your account, Claude Code will ask you to log in.

1. In your terminal, run:

    ```bash
    claude
    ```

    ```powershell
    claude
    ```

2. Claude Code will open your browser and take you to claude.ai to authorize the connection. Log in with the account you created in Section 1.

3. Click **Authorize** (or **Allow**) when prompted.

4. Return to your terminal. You should see a confirmation message that you are logged in.

You only need to do this once. Claude Code saves your login credentials securely on your machine.

---

> **Troubleshooting — Section 2**
>
> **"command not found: claude" after installing.**
> Close your terminal completely and open a brand-new window. The system needs to re-read its PATH (the list of places it looks for commands) after installation. On Mac, if the problem persists after reopening, run `brew doctor` and follow any suggestions. On Windows, make sure you ran the installer as administrator.
>
> **Mac: "brew: command not found" after installing Homebrew.**
> The Homebrew installer prints a "Next steps" section at the end with two `eval` commands to run. Copy and run those commands exactly, then close and reopen your terminal.
>
> **Windows: "npm is not recognized as a command."**
> Node.js did not add itself to your PATH correctly. Uninstall Node.js from Settings > Apps, redownload the LTS installer from nodejs.org, and re-run it — make sure the "Add to PATH" checkbox is selected during setup. Then open a new PowerShell window.

---

## Section 3: GitHub Setup

GitHub is where you will store and submit your project code. Git is the underlying tool that tracks changes to your files.

### Create a GitHub Account

1. Go to [https://github.com](https://github.com).
2. Click **Sign up**.
3. Enter your email, create a password, and choose a username. Use something professional — this account will be visible on your resume.
4. Complete the verification puzzle and click **Create account**.
5. Check your email and click the verification link GitHub sends you.

If you already have a GitHub account, skip this step.

---

### Install Git

#### Mac — Install Git via Xcode Command Line Tools

Mac comes with a way to install Git built in. Run this in Terminal:

```bash
xcode-select --install
```

A dialog box will pop up on your screen asking if you want to install the Command Line Developer Tools. Click **Install**. This may take several minutes.

When it finishes, verify Git is available:

```bash
git --version
```

You should see something like `git version 2.x.x`.

#### Windows — Install Git for Windows

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win). The download should start automatically.
2. Open the downloaded installer.
3. Click through all the steps using the **default options**. Do not change anything unless you know what you are doing.
4. Finish the installation.
5. Open a **new** PowerShell window and verify:

```powershell
git --version
```

You should see something like `git version 2.x.x.windows.x`.

---

### Configure Your Git Identity

Git needs to know your name and email so it can label your work correctly. Run these two commands, replacing the placeholders with your actual name and email. Use the same email address you used to sign up for GitHub.

```bash
git config --global user.name "Your Full Name"
git config --global user.email "you@example.com"
```

```powershell
git config --global user.name "Your Full Name"
git config --global user.email "you@example.com"
```

These commands set your identity once for all projects on your machine. To confirm they saved, run:

```bash
git config --global user.name
git config --global user.email
```

```powershell
git config --global user.name
git config --global user.email
```

Your name and email should print back.

---

### Create Your Project Repository on GitHub

A repository (repo) is a folder that Git tracks. You need to create one on GitHub for your course project.

1. Log in to [https://github.com](https://github.com).
2. Click the **+** icon in the top-right corner of the page.
3. Select **New repository** from the dropdown.
4. In the **Repository name** field, type exactly: `ai-fullstack-project`
5. Set visibility to **Public** (required for course submission) unless your instructor says otherwise.
6. Check the box labeled **Add a README file**. This gives your repo an initial file so you can clone it right away.
7. Leave all other settings at their defaults.
8. Click **Create repository**.

GitHub will take you to your new empty repository page.

---

### Clone Your Repository to Your Computer

"Cloning" means downloading a copy of the repository to your local machine so you can work on it.

1. On your GitHub repository page, click the green **Code** button.
2. Make sure **HTTPS** is selected (not SSH).
3. Copy the URL shown. It will look like: `https://github.com/YOUR-USERNAME/ai-fullstack-project.git`

4. In your terminal, navigate to the folder where you keep your school work. For example:

    ```bash
    cd ~/Documents
    ```

    ```powershell
    cd ~\Documents
    ```

    `cd` stands for "change directory." The `~` symbol is a shortcut for your home folder.

5. Clone the repository:

    ```bash
    git clone https://github.com/YOUR-USERNAME/ai-fullstack-project.git
    ```

    ```powershell
    git clone https://github.com/YOUR-USERNAME/ai-fullstack-project.git
    ```

    Replace `YOUR-USERNAME` with your actual GitHub username.

6. A new folder named `ai-fullstack-project` now exists inside your Documents folder. You can open it in Finder (Mac) or File Explorer (Windows), or navigate into it in your terminal:

    ```bash
    cd ai-fullstack-project
    ```

    ```powershell
    cd ai-fullstack-project
    ```

---

> **Troubleshooting — Section 3**
>
> **"git clone" asks for a username and password, but my password doesn't work.**
> GitHub no longer accepts your account password for command-line operations. You need to use a Personal Access Token. Go to GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token. Give it `repo` scope, copy the token, and use it as your password when prompted.
>
> **Mac: `xcode-select --install` says "command line tools are already installed."**
> That is fine — Git is already available. Run `git --version` to confirm.
>
> **"Repository not found" when cloning.**
> Double-check that the URL is spelled exactly right, including your username. The URL is case-sensitive.

---

## Section 4: Clone the Course Repository

The course repository contains the prompt files, skill definitions, and helper scripts you will use all semester. You need a separate local copy of this repo.

### Steps

1. In your terminal, navigate to your Documents folder (or wherever you store school work):

    ```bash
    cd ~/Documents
    ```

    ```powershell
    cd ~\Documents
    ```

2. Clone the course repository:

    ```bash
    git clone https://github.com/INSTRUCTOR_REPO/course-ai-agents.git
    ```

    ```powershell
    git clone https://github.com/INSTRUCTOR_REPO/course-ai-agents.git
    ```

    > **Note:** Replace `INSTRUCTOR_REPO` with the actual GitHub username or organization name provided by your instructor. Your instructor will post this link on the course page.

3. Navigate into the newly cloned folder:

    ```bash
    cd course-ai-agents
    ```

    ```powershell
    cd course-ai-agents
    ```

4. List the contents of the folder to verify the expected directories are there:

    ```bash
    ls
    ```

    ```powershell
    dir
    ```

    `ls` (Mac) and `dir` (Windows) both list the files and folders inside your current directory.

5. You should see at least these three directories in the output:

    ```
    prompts/
    skills/
    scripts/
    ```

6. Specifically verify the `prompts/` directory exists:

    ```bash
    ls prompts/
    ```

    ```powershell
    dir prompts\
    ```

    If you see files listed inside `prompts/`, you are in good shape.

---

> **Troubleshooting — Section 4**
>
> **"prompts/ directory is missing or empty."**
> The clone may have failed partway through, or the instructor repo may have been updated. Delete the `course-ai-agents` folder and re-run the `git clone` command from Step 2.
>
> **"Permission denied" when cloning.**
> The instructor repo may be private. Make sure you have been added as a collaborator. Contact your instructor and provide your GitHub username.
>
> **"fatal: destination path 'course-ai-agents' already exists."**
> You already have a folder with that name. Either delete it and clone again, or navigate into the existing folder and run `git pull` to get the latest version.

---

## Section 5: Install JDK 21 (Required for All Students)

The Kotlin backend runs on the Java Virtual Machine. JDK 21 is required for all students regardless of backend choice.

### Mac

Check if JDK 21+ is already installed:

```bash
java -version
```

If you see `openjdk version "21.x.x"` or higher, skip to the verify step.

If not installed, install with Homebrew:

```bash
brew install openjdk@21
```

After installing, add it to your PATH. Run this command, then close and reopen your terminal:

```bash
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@21"' >> ~/.zshrc
source ~/.zshrc
```

### Windows

1. Go to [https://adoptium.net](https://adoptium.net)
2. Click **Latest LTS** — select **Temurin 21**
3. Download the `.msi` installer for Windows x64
4. Run the installer using all default options — make sure **"Add to PATH"** and **"Set JAVA_HOME"** are checked
5. Click **Install** and finish

### Verify JDK

```bash
java -version
```

```powershell
java -version
```

Expected: `openjdk version "21.x.x"` or higher. The exact vendor (Temurin, OpenJDK, etc.) does not matter.

---

> **Troubleshooting — JDK**
>
> **"java: command not found" after installing on Mac.**
> You need to reload your shell config. Run `source ~/.zshrc` then try again. If still missing, confirm the export line was added: `cat ~/.zshrc | grep openjdk`
>
> **Windows: "java is not recognized" after installing.**
> The installer did not add Java to PATH. Go to System Properties → Environment Variables → add `C:\Program Files\Eclipse Adoptium\jdk-21.x.x\bin` to the Path variable, then open a new PowerShell window.
>
> **"wrong java version" — need exactly 21.**
> Run `java -version` to check. Any 21.x.x or higher is fine.

---

## Section 7: Install Node.js (Required for All Students)

Node.js powers the React frontend and the extract helper script.

### Node.js v18 or Higher

Node.js powers the frontend and several course scripts.

#### Mac

Check if Node.js is already installed:

```bash
node --version
```

If you see `v18.x.x` or higher, you are done — skip to the verification step.

If Node.js is not installed, or your version is below 18, install it with Homebrew:

```bash
brew install node
```

Alternatively, download the LTS installer from [https://nodejs.org](https://nodejs.org).

#### Windows

If you installed Node.js in Section 2 as part of the Claude Code setup, verify the version:

```powershell
node --version
```

If the version is below 18, go to [https://nodejs.org](https://nodejs.org), download the LTS installer, and run it. The new version will replace the old one.

#### Verify Node.js and npm

Run both of these commands:

```bash
node --version
npm --version
```

```powershell
node --version
npm --version
```

Expected output:
- `node --version`: `v18.x.x` or higher (v20.x.x or v22.x.x is fine)
- `npm --version`: `9.x.x` or higher

---

### Python 3.10 or Higher (Required for extract_files.py)

Python is required by all students to run the `extract_files.py` helper script.

#### Mac

Check if Python 3 is already installed:

```bash
python3 --version
```

If you see `Python 3.10.x` or higher, you are done.

If it is not installed or below 3.10, install it:

```bash
brew install python3
```

#### Windows

1. Go to [https://www.python.org/downloads/](https://www.python.org/downloads/).
2. Click **Download Python 3.x.x** (the latest 3.x release).
3. Open the installer.
4. **Important:** On the first screen, check the box that says **"Add Python to PATH"** before clicking Install Now. This step is easy to miss and causes problems if skipped.
5. Click **Install Now** and wait for it to finish.

#### Verify Python

```bash
python3 --version
```

```powershell
python --version
```

Expected output: `Python 3.10.x` or higher.

> **Windows note:** On Windows, the command is `python` (not `python3`). On Mac, always use `python3` to avoid accidentally calling an older Python 2 installation.

---

> **Troubleshooting — Section 5**
>
> **"node --version shows v16 or lower."**
> v16 is end-of-life and will cause issues. On Mac, run `brew upgrade node`. On Windows, download and reinstall the LTS version from nodejs.org.
>
> **Mac: "python3: command not found" even after installing.**
> Run `brew link python3` to make sure Homebrew connected the installation properly. Then open a new terminal window.
>
> **Windows: "python is not recognized" after installing.**
> You likely missed the "Add Python to PATH" checkbox during install. Go to Settings > Apps, uninstall Python, and run the installer again — this time check that box on the first screen.

---

## Section 9: Install the /build-app Skill

Skills extend what Claude Code can do. The `/build-app` skill is the primary tool you will use to generate your project.

### Steps

1. Make sure you are inside the `course-ai-agents` folder you cloned in Section 4. Check your current location with:

    ```bash
    pwd
    ```

    ```powershell
    pwd
    ```

    `pwd` stands for "print working directory." It shows the full path of the folder you are currently in. You should see something ending in `course-ai-agents`.

    If you are not there, navigate to it:

    ```bash
    cd ~/Documents/course-ai-agents
    ```

    ```powershell
    cd ~\Documents\course-ai-agents
    ```

2. Install the skill by running:

    ```bash
    claude skill install skills/build-app.md
    ```

    ```powershell
    claude skill install skills/build-app.md
    ```

    Claude Code will read the skill file and register it.

3. Verify the skill installed correctly. Start Claude Code:

    ```bash
    claude
    ```

    ```powershell
    claude
    ```

4. Inside the Claude Code prompt, type:

    ```
    /build-app
    ```

    Press Enter. You should see help text describing what the `/build-app` skill does and how to use it. If you see that text, the skill is installed correctly.

5. Type `/exit` or press `Ctrl + C` to leave the Claude Code prompt and return to your regular terminal.

---

> **Troubleshooting — Section 6**
>
> **"No such file or directory: skills/build-app.md"**
> You are not running the command from inside the `course-ai-agents` folder. Run `pwd` to check where you are, then use `cd` to navigate to the correct folder before trying again.
>
> **"/build-app is not recognized as a skill" or nothing happens.**
> The install command may have encountered an error. Re-run `claude skill install skills/build-app.md` and look for any error messages in the output. If the `skills/` directory is empty, go back to Section 4 and re-clone the course repo.
>
> **"claude: command not found" when trying to run Claude Code.**
> Return to Section 2 and repeat the verification step. Close and reopen your terminal, then try `claude --version` again.

---

## Section 8: Final Verification Checklist

Before your first lab session, confirm every item below is working on your machine. Run each command and check that the output matches what is described.

If any item fails, go back to the corresponding section and follow the troubleshooting steps.

---

- [ ] **1. Claude account is active**

    Log in at [https://claude.ai](https://claude.ai) and send a test message. Claude should respond.

---

- [ ] **2. Claude Code CLI is installed**

    ```bash
    claude --version
    ```

    ```powershell
    claude --version
    ```

    Expected: A version number such as `claude 1.x.x`. "command not found" means Claude Code is not installed — return to Section 2.

---

- [ ] **3. Claude Code is authenticated**

    ```bash
    claude
    ```

    ```powershell
    claude
    ```

    Expected: You see the Claude Code prompt and can type a message. If it asks you to log in, follow the browser-based authentication flow from Section 2. Press `Ctrl + C` to exit when done.

---

- [ ] **4. Git is installed**

    ```bash
    git --version
    ```

    ```powershell
    git --version
    ```

    Expected: `git version 2.x.x` or higher. "command not found" means Git is not installed — return to Section 3.

---

- [ ] **5. Git identity is configured**

    ```bash
    git config --global user.name
    git config --global user.email
    ```

    ```powershell
    git config --global user.name
    git config --global user.email
    ```

    Expected: Your name prints on the first line, your email on the second. If both lines are blank, return to Section 3 and run the `git config` commands.

---

- [ ] **6. JDK 21+ is installed**

    ```bash
    java -version
    ```

    ```powershell
    java -version
    ```

    Expected: `openjdk version "21.x.x"` or higher. If missing, return to Section 5.

---

- [ ] **7. Node.js v18+ and npm are installed**

    ```bash
    node --version
    npm --version
    ```

    ```powershell
    node --version
    npm --version
    ```

    Expected: `node` shows `v18.x.x` or higher; `npm` shows `9.x.x` or higher. If Node.js is missing or below v18, return to Section 5.

---

- [ ] **8. Python 3.10+ is installed**

    ```bash
    python3 --version
    ```

    ```powershell
    python --version
    ```

    Expected: `Python 3.10.x` or higher. If missing or below 3.10, return to Section 5.

---

- [ ] **9. Course repo is cloned and /build-app skill is installed**

    ```bash
    ls ~/Documents/course-ai-agents/skills/
    ```

    ```powershell
    dir ~\Documents\course-ai-agents\skills\
    ```

    Expected: You see `build-app.md` listed in the output.

    Then confirm the skill is active inside Claude Code:

    ```bash
    claude
    ```

    ```powershell
    claude
    ```

    Type `/build-app` at the Claude Code prompt. Expected: Help text appears. Press `Ctrl + C` to exit.

---

Once all eight checkboxes are ticked, you are fully set up. Bring your laptop to the first lab session with this setup complete.

If you are still stuck after working through the troubleshooting steps, post in the course discussion board with:
1. The exact command you ran.
2. The exact error message you received.
3. Your operating system and version (e.g., macOS 14.4, Windows 11).

---

*End of Setup Guide*
