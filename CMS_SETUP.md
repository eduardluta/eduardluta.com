# Decap CMS Setup Guide

Simple CMS for managing blog posts on eduardluta.com.

## What This Does

- **Admin Interface**: Write blog posts at `/admin` with a nice markdown editor
- **Your Design Stays**: Blog frontend (blog.html) looks exactly the same
- **Simple Workflow**: Write in CMS → Save → Build → Push to GitHub

## How It Works

```
Write post in /admin
    ↓
Saved to _posts/my-post.md
    ↓
Run: npm run build
    ↓
Generates: blog-posts.js
    ↓
blog.html loads it automatically
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up GitHub OAuth

The CMS needs authentication to save posts to GitHub.

**A. Create GitHub OAuth App**

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `Eduard Luta CMS`
   - **Homepage URL**: `https://eduardluta.com`
   - **Authorization callback URL**: `https://your-vercel-url.vercel.app/api/callback` (you'll get this after step B)
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

**B. Deploy OAuth Server to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add OAUTH_CLIENT_ID
# Paste your GitHub Client ID

vercel env add OAUTH_CLIENT_SECRET
# Paste your GitHub Client Secret

# Redeploy with env vars
vercel --prod
```

Copy your Vercel URL (e.g., `https://your-project.vercel.app`)

**C. Update GitHub OAuth App**

1. Go back to https://github.com/settings/developers
2. Edit your OAuth App
3. Update **Authorization callback URL** to: `https://your-vercel-url.vercel.app/api/callback`

**D. Update CMS Configuration**

Edit `admin/config.yml` line 5:

```yaml
base_url: https://your-vercel-url.vercel.app
```

### 3. Commit and Push

```bash
git add admin/config.yml
git commit -m "Configure CMS OAuth"
git push
```

### 4. Start Writing!

1. Visit `https://eduardluta.com/admin`
2. Click "Login with GitHub"
3. Authorize the app
4. Start creating posts!

## Daily Workflow

### Writing a New Post

1. Go to `/admin`
2. Click "Blog Posts" → "New Blog Post"
3. Fill in:
   - **Title**: Your post title
   - **Date**: Publication date
   - **Slug**: URL-friendly name (e.g., `my-new-post`)
   - **Body**: Your content in markdown
4. Click "Save"
5. The CMS commits the markdown file to `_posts/`

### Publishing to Your Site

After saving posts in the CMS:

```bash
# Pull latest posts from GitHub
git pull

# Generate blog-posts.js
npm run build

# Commit and push
git add blog-posts.js
git commit -m "Update blog posts"
git push
```

Your blog.html will automatically load the new posts!

### Local Development (Optional)

Watch for changes and auto-rebuild:

```bash
npm run watch
```

This watches `_posts/` and rebuilds `blog-posts.js` whenever you save.

## File Structure

```
eduardluta.com/
├── admin/
│   ├── index.html       # CMS interface
│   └── config.yml       # CMS configuration
├── _posts/              # Blog posts (markdown)
│   └── 2025-01-14-welcome-to-the-blog.md
├── images/uploads/      # Uploaded media
├── api/                 # OAuth serverless functions
│   ├── auth.js
│   └── callback.js
├── blog.html            # Your blog page (unchanged)
├── blog-posts.js        # Auto-generated (gitignored)
├── build-posts.js       # Build script
└── package.json         # Node dependencies
```

## How Blog Posts Work

**Before (manual HTML):**
```javascript
const posts = [
  { slug: "my-post", title: "My Post", content: "<p>...</p>" }
];
```

**After (CMS + markdown):**
1. Write in CMS: `_posts/2025-01-14-my-post.md`
2. Run: `npm run build`
3. Generates: `blog-posts.js` (same format as before)
4. `blog.html` loads it exactly the same way

**Your visitors see zero difference!**

## Troubleshooting

### Can't log in to /admin

- Check Vercel deployment is running
- Verify environment variables: `vercel env ls`
- Check OAuth app callback URL matches Vercel URL
- Look at browser console for errors

### Posts not showing on blog.html

- Did you run `npm run build` after pulling new posts?
- Check `blog-posts.js` exists and has your posts
- Look at browser console for JavaScript errors
- Make sure `blog.html` loads `<script src="blog-posts.js"></script>`

### Build script errors

```bash
# Make sure dependencies are installed
npm install

# Check for syntax errors in markdown files
# Front matter must be valid YAML between ---
```

### Images not uploading in CMS

- Check `images/uploads/` folder exists and is writable
- Verify `media_folder` in `admin/config.yml` is correct
- Check GitHub permissions (OAuth scope includes repo write)

## Advanced: Automating Builds

Currently you run `npm run build` manually. To automate:

**Option A: GitHub Actions**

Create `.github/workflows/build-blog.yml`:

```yaml
name: Build Blog Posts

on:
  push:
    paths:
      - '_posts/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Auto-build blog posts"
          file_pattern: blog-posts.js
```

**Option B: Netlify/Vercel Site Build**

Deploy your site to Netlify/Vercel with build command: `npm run build`

## Alternative: No Build Step

If you don't want any build process, you can:

1. Load markdown directly in browser
2. Use a markdown parser like `marked.js`
3. Fetch `_posts/*.md` files via fetch API
4. Parse and render on the fly

Trade-off: Slightly slower page load, but simpler workflow.

## Resources

- [Decap CMS Docs](https://decapcms.org/docs/)
- [Marked.js (markdown parser)](https://marked.js.org/)
- [Vercel Docs](https://vercel.com/docs)

---

**Questions?** Check the browser console first, then review OAuth setup.
