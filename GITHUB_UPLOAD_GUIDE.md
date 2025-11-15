# 🚀 GitHub Upload Guide

Follow these steps to upload your Plaibook Call Center Analytics Dashboard to GitHub.

## Step 1: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `plaibook-call-center-dashboard`
3. **Description**: `Call Center Analytics Dashboard for Example Pest Control - React, Express, TypeScript & Gemini 2.5`
4. **Visibility**: Choose Public or Private
5. **⚠️ IMPORTANT**: Do NOT check any of these boxes:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

## Step 2: Initialize Git (if not already done)

If git is not initialized in your project:

```bash
git init
```

## Step 3: Add All Files

```bash
git add .
```

This will add all files except those in `.gitignore` (node_modules, .env, etc.)

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Complete Plaibook Call Center Analytics Dashboard

- Full-stack dashboard with React frontend and Express backend
- Nate's View with 4 answer cards
- Global filters (Agent, Sentiment, Call Type)
- Drill-down panels for all charts
- Missed opportunity pattern mining (6 patterns)
- Rep coaching suggestions
- Revenue impact analysis with adjustable assumptions
- Two separate pipelines (Sales + Inspection funnels)
- LLM-powered transcript analysis (Gemini 2.5)
- Precomputed metrics with caching
- 12 comprehensive screenshots
- Complete documentation"
```

## Step 5: Rename Branch to Main

```bash
git branch -M main
```

## Step 6: Add Remote Repository

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/plaibook-call-center-dashboard.git
```

**Example:**
```bash
git remote add origin https://github.com/rithishmurugan/plaibook-call-center-dashboard.git
```

## Step 7: Push to GitHub

```bash
git push -u origin main
```

You'll be prompted for your GitHub credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your password)
  - Get one at: https://github.com/settings/tokens
  - Select scope: `repo` (full control of private repositories)

## Step 8: Verify Upload

1. Go to your repository on GitHub
2. Check that all files are present
3. Verify screenshots are visible in the README
4. Test that the README displays correctly

## 📋 Quick Command Summary

```bash
# 1. Initialize (if needed)
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Initial commit: Complete Plaibook Call Center Analytics Dashboard"

# 4. Rename branch
git branch -M main

# 5. Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/plaibook-call-center-dashboard.git

# 6. Push
git push -u origin main
```

## 🔒 Security Notes

- ✅ `.env` files are excluded via `.gitignore`
- ✅ `node_modules` are excluded (too large)
- ✅ API keys are not committed
- ✅ Only source code and documentation are uploaded

## 📝 What Gets Uploaded

✅ **Included:**
- All source code (TypeScript, React components)
- Configuration files (package.json, tsconfig.json, etc.)
- README.md with screenshots
- Screenshots folder (12 images)
- Demo call metadata files (JSON only, not audio)

❌ **Excluded (via .gitignore):**
- `node_modules/` (dependencies)
- `.env` files (API keys)
- `*.opus` audio files (too large)
- Build outputs (`dist/`)
- Editor files (`.vscode/`, `.idea/`)

## 🎯 After Upload

Once uploaded, you can share the repository link:

```
https://github.com/YOUR_USERNAME/plaibook-call-center-dashboard
```

**Include in your submission:**
- Repository URL
- Brief note about the project
- Highlight key features implemented

## 🆘 Troubleshooting

**Issue: "remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/plaibook-call-center-dashboard.git
```

**Issue: Authentication failed**
- Use Personal Access Token instead of password
- Create token: https://github.com/settings/tokens
- Select `repo` scope

**Issue: Large file warnings**
- Audio files (`.opus`) are excluded via `.gitignore`
- If needed, use Git LFS for large files

---

**Good luck with your submission! 🎉**

