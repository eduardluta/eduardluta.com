# Decap CMS Setup - Simple & Automated

Write blog posts at `/admin` - everything else happens automatically.

## How It Works

```
1. Write post in /admin → Click Save
2. GitHub Actions automatically builds blog-posts.js
3. Your blog updates automatically
4. Done ✓
```

**You never run commands.** Everything is automated.

---

## One-Time Setup (30 minutes)

### Step 1: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `Eduard Luta CMS`
   - **Homepage URL**: `https://eduardluta.com`
   - **Authorization callback URL**: `https://TEMPORARY.vercel.app/api/callback`
4. Click **"Register application"**
5. **Save the Client ID**
6. Click **"Generate a new client secret"** and **save it**

Leave this page open - we'll update the callback URL in Step 3.

---

### Step 2: Deploy OAuth Server to Vercel

Install Vercel CLI:
```bash
npm install -g vercel
```

From your project directory:
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes (press Enter)
- **Which scope?** → Choose your account
- **Link to existing project?** → No
- **Project name?** → Press Enter (use default)
- **Directory?** → Press Enter (use `.`)
- **Override settings?** → No

Vercel will show:
```
✅ Deployed: https://your-project-abc123.vercel.app
```

**Copy this URL.**

Add environment variables:
```bash
vercel env add OAUTH_CLIENT_ID
# Paste your GitHub Client ID, choose "all environments"

vercel env add OAUTH_CLIENT_SECRET
# Paste your GitHub Client Secret, choose "all environments"

# Redeploy with environment variables
vercel --prod
```

---

### Step 3: Update OAuth Callback URL

1. Go back to: https://github.com/settings/developers
2. Click your **"Eduard Luta CMS"** app
3. Change **Authorization callback URL** to:
   ```
   https://your-project-abc123.vercel.app/api/callback
   ```
4. Click **"Update application"**

---

### Step 4: Update CMS Config

Edit `admin/config.yml` line 5:

**Change:**
```yaml
base_url: https://eduardluta.com
```

**To:**
```yaml
base_url: https://your-project-abc123.vercel.app
```

Commit and push:
```bash
git add admin/config.yml
git commit -m "Configure CMS OAuth"
git push
```

---

### Step 5: Enable GitHub Actions

In your GitHub repository:

1. Go to **Settings** → **Actions** → **General**
2. Under **"Workflow permissions"**, select:
   - ✅ **"Read and write permissions"**
3. Click **"Save"**

This allows GitHub Actions to auto-commit built files.

---

## Using the CMS

### Write a Post

1. Go to **https://eduardluta.com/admin**
2. Click **"Login with GitHub"**
3. Click **"Blog Posts"** → **"New Blog Post"**
4. Fill in:
   - **Title**: Your post title
   - **Date**: Publication date
   - **Slug**: URL name (e.g., `my-new-post`)
   - **Body**: Write in markdown
5. Click **"Publish"**

**That's it.** GitHub Actions automatically:
- Builds `blog-posts.js`
- Commits it to your repo
- Your blog updates in ~1 minute

### Check Build Status

Go to your repo → **Actions** tab to see build progress.

---

## Troubleshooting

### Can't log in to /admin

- Check `admin/config.yml` has correct Vercel URL
- Verify GitHub OAuth callback URL matches
- Check browser console for errors

### Posts not appearing

- Go to GitHub → **Actions** tab
- Check if "Build Blog Posts" workflow ran
- Click on the workflow to see logs
- If it failed, check error messages

### GitHub Actions not running

- Check **Settings** → **Actions** → **General**
- Ensure "Read and write permissions" is enabled
- Make sure you pushed changes to `_posts/`

---

## File Structure

```
eduardluta.com/
├── admin/              # CMS interface
├── _posts/             # Blog posts (markdown)
├── api/                # OAuth functions (Vercel)
├── .github/workflows/  # Auto-build automation
├── blog.html           # Your blog (unchanged)
└── blog-posts.js       # Auto-generated (DO NOT EDIT)
```

---

## What Happens Behind the Scenes

```
You save post in /admin
    ↓
CMS commits to _posts/my-post.md
    ↓
GitHub Actions detects change
    ↓
Runs: npm install && npm run build
    ↓
Generates blog-posts.js
    ↓
Commits it back to repo
    ↓
Blog auto-updates
```

**You just write. Everything else is automatic.**

---

## Daily Workflow

1. Go to `/admin`
2. Write post
3. Click Publish
4. Wait ~1 minute
5. Blog is updated ✓

**No terminal. No commands. Just write.**
