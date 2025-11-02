# Local Development Setup Guide

This guide will help you set up the eduardluta.com project on your local machine and connect it with GitHub and Claude.

## Prerequisites

### 1. Install Git
Git is required to clone and manage the repository.

**macOS:**
```bash
# Check if Git is already installed
git --version

# If not installed, install via Homebrew
brew install git

# Or download from https://git-scm.com/download/mac
```

**Windows:**
```bash
# Download and install from https://git-scm.com/download/win
# The installer includes Git Bash, which is recommended
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install git
```

### 2. Install a Code Editor
Choose one of these popular editors:
- **VS Code**: https://code.visualstudio.com/ (Recommended)
- **Sublime Text**: https://www.sublimetext.com/
- **Atom**: https://atom.io/
- **Any text editor** of your choice

### 3. Install a Local Web Server
Since this is a static website, you need a simple HTTP server to run it locally.

**Option A: Python (Usually pre-installed on macOS/Linux)**
```bash
# Check if Python is installed
python3 --version
# or
python --version
```

**Option B: Node.js and http-server**
```bash
# Install Node.js from https://nodejs.org/

# Then install http-server globally
npm install -g http-server
```

**Option C: VS Code Live Server Extension**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

## Step-by-Step Setup

### Step 1: Configure Git
Set up your Git identity (required for commits):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Set Up GitHub Authentication

You have two options for authenticating with GitHub:

#### Option A: SSH Keys (Recommended)

**Generate an SSH key:**
```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Press Enter to accept the default file location
# Optionally set a passphrase (or press Enter for no passphrase)

# Start the ssh-agent
eval "$(ssh-agent -s)"

# Add your SSH key to the ssh-agent
ssh-add ~/.ssh/id_ed25519
```

**Add SSH key to GitHub:**
```bash
# Copy your public key (macOS)
pbcopy < ~/.ssh/id_ed25519.pub

# Or display it to copy manually
cat ~/.ssh/id_ed25519.pub
```

1. Go to GitHub.com → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste your public key and give it a title
4. Click "Add SSH key"

**Test your connection:**
```bash
ssh -T git@github.com
# You should see: "Hi username! You've successfully authenticated..."
```

#### Option B: Personal Access Token (HTTPS)

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name and select scopes (at minimum: `repo`)
4. Click "Generate token"
5. **Copy the token immediately** (you won't see it again!)
6. Use this token as your password when prompted during git operations

### Step 3: Clone the Repository

Choose the method based on your authentication setup:

**Using SSH (if you set up SSH keys):**
```bash
# Navigate to where you want the project
cd ~/Documents/projects  # or any directory you prefer

# Clone the repository
git clone git@github.com:yourusername/eduardluta.com.git

# Navigate into the project
cd eduardluta.com
```

**Using HTTPS (if using Personal Access Token):**
```bash
# Navigate to where you want the project
cd ~/Documents/projects  # or any directory you prefer

# Clone the repository
git clone https://github.com/yourusername/eduardluta.com.git

# Navigate into the project
cd eduardluta.com

# When prompted for password, use your Personal Access Token
```

### Step 4: Verify the Setup

```bash
# Check the git status
git status

# View the repository information
git remote -v

# List all branches
git branch -a
```

### Step 5: Run the Website Locally

Choose one of these methods:

#### Method 1: Python HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Then open your browser to: http://localhost:8000
```

#### Method 2: Node.js http-server
```bash
http-server -p 8000

# Then open your browser to: http://localhost:8000
```

#### Method 3: VS Code Live Server
1. Open the project folder in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Your browser will open automatically

#### Method 4: Direct File Opening (Not Recommended)
- Simply double-click `index.html`
- This works but may have limitations with certain JavaScript features

## Working with the Project

### Making Changes

1. **Create a new branch for your changes:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your edits** in your code editor

3. **View changes locally** by refreshing your browser

4. **Stage your changes:**
   ```bash
   git add .
   # or for specific files
   git add index.html common.css
   ```

5. **Commit your changes:**
   ```bash
   git commit -m "Description of your changes"
   ```

6. **Push to GitHub:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

### Staying Updated

```bash
# Fetch latest changes from GitHub
git fetch origin

# Pull changes into your current branch
git pull origin main

# Or pull from a specific branch
git pull origin branch-name
```

## Connecting with Claude

### Option 1: Claude Code CLI (Recommended for Development)

**Install Claude Code:**

1. Visit: https://docs.anthropic.com/en/docs/claude-code
2. Follow the installation instructions for your operating system

**Authenticate:**
```bash
# Run the authentication command
claude auth

# Follow the prompts to connect your Anthropic account
```

**Use Claude in your project:**
```bash
# Navigate to your project
cd ~/Documents/projects/eduardluta.com

# Start Claude Code
claude

# You can now ask Claude to help with:
# - Making code changes
# - Fixing bugs
# - Adding new features
# - Explaining code
# - And more!
```

### Option 2: Claude.ai Web Interface

1. Visit https://claude.ai
2. Create an account or sign in
3. Upload files or paste code snippets to get help
4. Copy the responses back to your local files

### Option 3: Claude API (For Advanced Users)

If you want to integrate Claude programmatically:
1. Get an API key from https://console.anthropic.com/
2. Install the Anthropic SDK for your preferred language
3. Use the API in your development workflow

## GitHub Integration with Claude

When working on issues or pull requests with Claude:

1. **Create a feature branch** (as shown above)
2. **Make changes with Claude's help** via Claude Code CLI
3. **Commit and push** your changes
4. **Create a Pull Request on GitHub:**
   - Go to your repository on GitHub
   - Click "Pull requests" → "New pull request"
   - Select your feature branch
   - Add a description and create the PR

## Troubleshooting

### Git Authentication Issues

**SSH connection timeout:**
```bash
# Test SSH connection
ssh -T git@github.com

# If it fails, check your SSH key is added to GitHub
```

**HTTPS authentication fails:**
- Make sure you're using a Personal Access Token, not your GitHub password
- Tokens need the `repo` scope at minimum

### Local Server Issues

**Port already in use:**
```bash
# Try a different port
python3 -m http.server 8080
# or
http-server -p 8080
```

**Permission denied:**
```bash
# Use a port above 1024, or run with sudo (not recommended)
python3 -m http.server 8000
```

### File Permission Issues

**macOS/Linux:**
```bash
# Make files readable/writable
chmod 644 *.html *.css *.js
```

## Project Structure

```
eduardluta.com/
├── index.html              # Homepage
├── about.html              # About page
├── blog.html               # Blog listing
├── blog-post.html          # Blog post template
├── principles.html         # Principles page
├── worth-the-time.html     # Worth the Time calculator
├── 404.html                # Error page
├── common.css              # Shared styles
├── nav.css                 # Navigation styles
├── nav.js                  # Navigation JavaScript
├── footer.js               # Footer component
├── css/                    # Additional stylesheets
├── blog/                   # Blog post content
├── CNAME                   # Domain configuration
├── _redirects              # Netlify redirects
├── README.md               # Project overview
├── TECHNICAL_IMPROVEMENTS.md  # Technical documentation
└── LOCAL_SETUP.md          # This file
```

## Next Steps

1. ✅ Install Git
2. ✅ Configure Git with your name and email
3. ✅ Set up GitHub authentication (SSH or Token)
4. ✅ Clone the repository
5. ✅ Install a local web server
6. ✅ Run the site locally
7. ✅ Install Claude Code CLI (optional but recommended)
8. 🎉 Start developing!

## Additional Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Claude Documentation**: https://docs.anthropic.com/
- **Claude Code**: https://docs.anthropic.com/en/docs/claude-code
- **VS Code**: https://code.visualstudio.com/docs
- **Markdown Guide**: https://www.markdownguide.org/

## Support

If you run into issues:
1. Check the Troubleshooting section above
2. Search GitHub Issues for similar problems
3. Ask Claude for help via Claude Code CLI
4. Create a new GitHub Issue with details about your problem

---

Happy coding! 🚀
