# Decap CMS Setup Guide

This website now includes Decap CMS (formerly Netlify CMS) for easy content management. Follow these steps to get it up and running.

## What's Included

- **Admin Interface**: Access at `/admin` to manage content
- **Collections**:
  - **Pages**: Edit homepage HTML directly
  - **Blog Posts**: Full-featured blog posts in `_posts/`
  - **Thoughts**: Shorter notes in `_thoughts/`
- **Media Management**: Upload images to `images/uploads/`
- **Jekyll Integration**: GitHub Pages automatically builds your site

## Quick Start

### 1. Enable GitHub Pages

1. Go to your repository settings on GitHub
2. Navigate to **Pages**
3. Set source to your main/master branch
4. Save and wait for deployment

### 2. Set Up GitHub OAuth (Required for Admin Access)

The admin interface needs GitHub authentication. You have two options:

#### Option A: Deploy OAuth Server to Vercel (Recommended)

1. **Create a GitHub OAuth App**:
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in:
     - **Application name**: `Eduard Luta CMS`
     - **Homepage URL**: `https://eduardluta.com`
     - **Authorization callback URL**: `https://your-project.vercel.app/api/callback`
   - Click "Register application"
   - Copy the **Client ID** and generate a **Client Secret**

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # From your project directory
   vercel

   # Follow the prompts, then set environment variables:
   vercel env add OAUTH_CLIENT_ID
   # Paste your GitHub Client ID

   vercel env add OAUTH_CLIENT_SECRET
   # Paste your GitHub Client Secret

   # Redeploy with environment variables
   vercel --prod
   ```

3. **Update CMS Configuration**:
   - Edit `admin/config.yml`
   - Change these lines:
     ```yaml
     base_url: https://your-project.vercel.app
     auth_endpoint: /api/auth
     ```
   - Replace `your-project.vercel.app` with your actual Vercel URL

#### Option B: Use Netlify Identity (Alternative)

If you prefer not to set up your own OAuth server:

1. Deploy your site to Netlify (in addition to GitHub Pages)
2. Enable Netlify Identity in your Netlify dashboard
3. Update `admin/config.yml`:
   ```yaml
   backend:
     name: git-gateway
     branch: main
   ```

### 3. Access the Admin Interface

Once OAuth is configured:

1. Visit `https://eduardluta.com/admin`
2. Click "Login with GitHub"
3. Authorize the application
4. Start editing!

## Using the CMS

### Creating a Blog Post

1. Go to `/admin`
2. Click **Blog Posts** → **New Blog Post**
3. Fill in:
   - Title
   - Publish Date
   - Content (use markdown)
   - Tags (optional)
   - Featured Image (optional)
4. Click **Publish**
5. Your post will be committed to GitHub
6. GitHub Pages will automatically rebuild your site

### Creating a Thought

1. Go to `/admin`
2. Click **Thoughts** → **New Thought**
3. Fill in title, date, and content
4. Click **Publish**

### Editing the Homepage

1. Go to `/admin`
2. Click **Pages** → **Homepage**
3. Edit the HTML directly
4. Click **Publish**

### Uploading Images

1. While editing any content, click the image icon
2. Upload or select an image
3. Images are saved to `images/uploads/`
4. The CMS will insert the correct image path

## File Structure

```
eduardluta.com/
├── admin/
│   ├── index.html          # CMS admin interface
│   └── config.yml          # CMS configuration
├── _posts/                 # Blog posts (markdown)
├── _thoughts/              # Thoughts (markdown)
├── _layouts/               # Jekyll templates
│   ├── default.html
│   ├── post.html
│   └── thought.html
├── images/uploads/         # Media files
├── api/                    # OAuth serverless functions
│   ├── auth.js
│   └── callback.js
├── _config.yml             # Jekyll configuration
└── index.html              # Homepage
```

## Local Development

To test Jekyll locally:

```bash
# Install dependencies
bundle install

# Run local server
bundle exec jekyll serve

# Visit http://localhost:4000
```

Note: The CMS admin won't work locally unless you configure it for local development.

## Troubleshooting

### Can't log in to /admin

- Check that your OAuth server is running (Vercel deployment)
- Verify environment variables are set correctly
- Check the callback URL matches your OAuth app settings
- Look at browser console for errors

### Posts not showing up

- Check that files are in `_posts/` or `_thoughts/`
- Verify front matter is correct (YAML between `---`)
- Check GitHub Pages build status
- May take a few minutes for GitHub Pages to rebuild

### Images not loading

- Verify images are in `images/uploads/`
- Check image paths start with `/images/uploads/`
- GitHub Pages may take a moment to publish new images

## Advanced Configuration

### Customizing Collections

Edit `admin/config.yml` to add fields, change folders, or modify the editor:

```yaml
collections:
  - name: "posts"
    label: "Blog Posts"
    folder: "_posts"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      # Add more fields here
```

### Changing the Branch

By default, CMS commits to `main`. To change:

```yaml
backend:
  branch: your-branch-name
```

### Editorial Workflow

Enable draft/review workflow:

```yaml
publish_mode: editorial_workflow
```

This creates PRs for each post instead of committing directly.

## Resources

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vercel Documentation](https://vercel.com/docs)

## Support

If you encounter issues:

1. Check the [Decap CMS GitHub Issues](https://github.com/decaporg/decap-cms/issues)
2. Review the browser console for errors
3. Verify your OAuth setup
4. Check GitHub Pages build logs

---

**Note**: Remember to keep your OAuth Client Secret secure. Never commit it to your repository. Always use environment variables for sensitive data.
