# ArunVerse 1.0 - Deployment Guide to arunverse.com

## Overview
This guide will help you deploy ArunVerse 1.0 to the live web with:
- **Frontend:** arunverse.com (via Vercel)
- **Backend API:** api.arunverse.com (via Railway)
- **Custom Domain:** arunverse.com

---

## Prerequisites
1. GitHub account (for code hosting)
2. Vercel account (free)
3. Railway account (free tier)
4. Domain name: arunverse.com (purchase separately or use free alternatives)

---

## Step 1: Push Code to GitHub

### 1a. Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `arunverse-1.0`
4. Click "Create repository"

### 1b. Push Your Code
```bash
cd /Users/arunshwetha/Downloads/ArunVerse-1.0

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: ArunVerse 1.0"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/arunverse-1.0.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway (api.arunverse.com)

### 2a. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Create New Project"
4. Select "Deploy from GitHub repo"
5. Authorize Railway to access your GitHub

### 2b. Configure Railway
1. Select your `arunverse-1.0` repository
2. Set the root directory/service directory to `backend`
3. Click "Deploy Now"
4. Railway automatically detects it's a Node.js app
5. Wait for deployment to complete

### 2c. Get Backend URL
1. In Railway dashboard, click your project
2. Go to "Settings" → "Generate Domain"
3. Copy your Railway URL (looks like: `https://arunverse-api-prod.railway.app`)
4. **Save this URL** - you'll need it later

### 2d. Set Environment Variables in Railway
1. In Railway project, click "Variables"
2. Add these variables:
   - **Key:** `JWT_SECRET` → **Value:** a strong random secret
   - **Key:** `ADMIN_PASSWORD` → **Value:** a secure admin password
   - **Key:** `CORS_ORIGIN` → **Value:** `https://arunverse.com,https://www.arunverse.com`
3. Click "Save"

### 2e. Add Custom Domain (Optional but recommended)
1. In Railway, go to "Settings" → "Custom Domain"
2. Enter: `api.arunverse.com`
3. Railway will show you DNS records to add to your domain registrar
4. Add those exact Railway DNS records in your domain's DNS settings

---

## Step 3: Deploy Frontend to Vercel (arunverse.com)

### 3a. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. You'll be prompted to install Vercel GitHub app

### 3b. Import Project
1. Click "New Project"
2. Select your `arunverse-1.0` repository
3. For "Root Directory" → select `frontend`
4. Click "Continue"

### 3c. Add Environment Variables
1. In Vercel deployment settings, click "Environment Variables"
2. Add variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://api.arunverse.com/api` (or your Railway URL if using custom domain)
3. Click "Add"
4. Click "Deploy"

### 3d. Wait for Deployment
- Vercel will build and deploy automatically
- You'll get a `vercel.app` URL like: `https://arunverse-1-0.vercel.app`

### 3e. Add Custom Domain
1. In Vercel project settings, go to "Domains"
2. Click "Add Domain"
3. Enter: `arunverse.com`
4. Vercel will show nameserver records
5. Update your domain registrar's nameservers (see Step 4 below)

---

## Step 4: Setup Domain arunverse.com

### Option A: Buy Domain from Namecheap / GoDaddy / Google Domains
1. Purchase `arunverse.com` from your favorite registrar
2. For Vercel: Update nameservers to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. For Railway API: Add CNAME record:
   - **Name:** `api`
   - **Value:** the Railway custom-domain target shown in Railway

### Option B: Use Free Domain (Freenom.com)
1. Go to [freenom.com](https://freenom.com)
2. Search for `.tk`, `.ml`, or `.ga` extensions (free)
3. Register `arunverse.tk` (free alternative)
4. Point to Vercel nameservers

---

## Step 5: Update Frontend Config

After deployment, update `frontend/src/api/config.js` to use your production domain:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '');
```

This reads from `.env.production` or Vercel environment variables. Production will fail fast if `VITE_API_URL` is missing.

---

## Step 6: Test Live Website

1. Visit `https://arunverse.com` (wait 24-48 hours for DNS propagation)
2. Check if products load
3. Test admin login at `https://arunverse.com/admin/login`
4. Test product clicks and analytics

---

## Current Setup Summary

| Component | Service | URL | Status |
|-----------|---------|-----|--------|
| Frontend | Vercel | arunverse.com | Ready |
| Backend API | Railway | api.arunverse.com | Ready |
| Database | In-Memory (Backend) | - | Testing only |
| Admin Password | Environment Variable | - | Change in production |

---

## Important Security Notes

⚠️ **Before Production:**
1. Change `ADMIN_PASSWORD` in Railway environment variables
2. Change `JWT_SECRET` to a strong random string
3. Set `CORS_ORIGIN` to your frontend domain(s)
4. Add database (PostgreSQL) instead of in-memory storage
5. Enable HTTPS (Vercel & Railway do this automatically)

---

## Troubleshooting

### Products Not Loading
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly in Vercel
- Check Railway backend is running (check logs)

### Admin Login Not Working
- Verify `ADMIN_PASSWORD` environment variable in Railway
- Check JWT token is being saved to localStorage
- Clear browser cache and try again

### Domain Not Resolving
- DNS changes take 24-48 hours to propagate
- Use [whatsmydns.net](https://whatsmydns.net) to check propagation
- Verify nameserver records are correct

---

## Next Steps (Optional Improvements)

1. **Add Database:** Replace in-memory products with PostgreSQL
2. **Add Image Upload:** Implement AWS S3 or Cloudinary
3. **Setup Monitoring:** Use Sentry for error tracking
4. **Add Email:** Implement Resend for admin notifications
5. **Analytics:** Add Google Analytics to track visitor behavior

---

## Support

For issues with:
- **Vercel:** Docs at [vercel.com/docs](https://vercel.com/docs)
- **Railway:** Docs at [railway.app/docs](https://railway.app/docs)
- **Domain Setup:** Ask your domain registrar support
