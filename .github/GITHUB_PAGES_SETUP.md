# Setting up GitHub Pages Auto-Deployment

This guide will help you configure automatic deployment to GitHub Pages for every commit.

## What's Been Set Up

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Automatically builds and deploys on every push to `main` branch
   - Can also be manually triggered from GitHub Actions tab
   - Uses official GitHub Pages deployment actions
   - Includes proper permissions and concurrency controls

2. **Project Configuration**:
   - `vite.config.ts`: Already configured with `base: '/compliance-dashboard/'`
   - `package.json`: Includes deployment scripts

## Steps to Enable Auto-Deployment

### 1. Push the Workflow File to GitHub

First, commit and push the new workflow file:

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "Add GitHub Actions workflow for auto-deployment"
git push origin main
```

### 2. Configure GitHub Pages in Repository Settings

1. Go to your repository: `https://github.com/Pranavk-official/compliance-dashboard`
2. Click on **Settings** tab
3. In the left sidebar, click **Pages**
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**
   - That's it! No need to select a branch when using GitHub Actions

### 3. Verify Deployment

After pushing the workflow file:

1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Click on it to see the progress
4. Once completed (green checkmark), your site will be live at:
   `https://pranavk-official.github.io/compliance-dashboard/`

## How It Works

### Automatic Deployment
Every time you push to the `main` branch:
1. GitHub Actions triggers the workflow
2. Workflow checks out your code
3. Installs dependencies (`npm ci`)
4. Builds the project (`npm run build`)
5. Uploads the `dist` folder to GitHub Pages
6. Deploys to your live site

### Manual Deployment
You can also deploy manually in two ways:

**Option 1: Using GitHub Actions UI**
1. Go to **Actions** tab
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select branch and run

**Option 2: Using npm script (local)**
```bash
npm run deploy
```

This uses `gh-pages` package to push the `dist` folder to the `gh-pages` branch (legacy method).

## Troubleshooting

### Workflow Fails with Permission Error
- Ensure the workflow has proper permissions
- Go to Settings > Actions > General > Workflow permissions
- Select "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

### Site Not Loading / 404 Error
- Verify the `base` path in `vite.config.ts` matches your repository name
- Current setting: `base: '/compliance-dashboard/'`
- Should match: `https://pranavk-official.github.io/compliance-dashboard/`

### Changes Not Reflecting
- Check if the workflow completed successfully in Actions tab
- GitHub Pages may take a few minutes to update
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Workflow File Breakdown

```yaml
# Triggers
on:
  push:
    branches: [main]  # Runs on every push to main
  workflow_dispatch:   # Allows manual trigger

# Permissions
permissions:
  contents: read      # Read repository contents
  pages: write        # Deploy to Pages
  id-token: write     # OIDC token for deployment

# Jobs
jobs:
  build:              # Build the application
    - Checkout code
    - Setup Node.js
    - Install dependencies
    - Build project
    - Upload dist folder
  
  deploy:             # Deploy to GitHub Pages
    - Deploy artifact from build job
```

## Best Practices

1. **Test Locally**: Always test with `npm run build` and `npm run preview` before pushing
2. **Semantic Commits**: Use clear commit messages for easier debugging
3. **Monitor Actions**: Check the Actions tab after pushing to ensure successful deployment
4. **Branch Protection**: Consider protecting the `main` branch to prevent accidental deployments

## Additional Notes

- The workflow uses `npm ci` instead of `npm install` for faster, more reliable builds
- Concurrency settings prevent multiple simultaneous deployments
- The build artifact is automatically cached between runs for faster deployments
- Node.js version 20 is used for consistency
