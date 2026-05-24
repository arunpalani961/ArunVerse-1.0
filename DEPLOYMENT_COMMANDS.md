# ArunVerse 1.0 - Complete Setup & Deployment Commands

## Local Development

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Backend (Port 3001)
```bash
cd backend
npm start
# Server running on http://localhost:3001
```

### 3. Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
# Open http://localhost:5173 in browser
```

### 4. Admin Access (Local)
- URL: http://localhost:5173/admin/login
- Password: `admin123`

---

## Production Deployment to arunverse.com

### Phase 1: GitHub Setup

```bash
cd /path/to/ArunVerse-1.0

# Initialize git
git init
git add .
git commit -m "Initial commit: ArunVerse 1.0"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/arunverse-1.0.git
git branch -M main
git push -u origin main
```

### Phase 2: Deploy Backend to Railway

```bash
# Option 1: Via Web Interface (Recommended)
# 1. Go to https://railway.app
# 2. Login with GitHub
# 3. Create New Project → Deploy from GitHub
# 4. Select arunverse-1.0 repo
# 5. Set root/service directory to backend
# 6. Add Environment Variables:
#    - JWT_SECRET = [generate-random-string]
#    - ADMIN_PASSWORD = [your-secure-password]
#    - CORS_ORIGIN = https://arunverse.com,https://www.arunverse.com

# Option 2: Via Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

### Phase 3: Deploy Frontend to Vercel

```bash
# Option 1: Via Web Interface (Easiest)
# 1. Go to https://vercel.com
# 2. Login with GitHub
# 3. Create New Project → Import arunverse-1.0
# 4. Root Directory: frontend
# 5. Environment Variable:
#    - VITE_API_URL = https://api.arunverse.com/api
# 6. Click Deploy

# Option 2: Via Vercel CLI
npm install -g vercel
cd frontend
vercel --prod
```

### Phase 4: Setup Custom Domain (arunverse.com)

#### Step A: Buy/Register Domain
```
Options:
1. Namecheap.com → $8.98/year
2. GoDaddy.com → $9.99/year
3. Google Domains → $12/year
4. Freenom.com → FREE (.tk, .ml, .ga)
```

#### Step B: Point Domain to Vercel (Frontend)
```
In your domain registrar:
1. Go to DNS/Nameserver settings
2. Change nameservers to:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com
3. Save (takes 24-48 hours)
```

#### Step C: Point API Subdomain to Railway
```
In your domain registrar (DNS records):
1. Add CNAME record:
   - Hostname: api
   - Value: [Railway custom-domain target]
   - TTL: 3600
2. Save
```

---

## Environment Variables Reference

### Backend (.env or Railway Variables)
```
PORT=3001 (Railway sets automatically)
JWT_SECRET=your-super-secret-jwt-key-here-change-this
ADMIN_PASSWORD=your-secure-admin-password-here
CORS_ORIGIN=https://arunverse.com,https://www.arunverse.com
```

### Frontend (.env.production or Vercel)
```
VITE_API_URL=https://api.arunverse.com/api
```

---

## Testing Commands

### Test Backend API
```bash
# Get all products
curl https://api.arunverse.com/api/products

# Get specific product
curl https://api.arunverse.com/api/products/1

# Login as admin
curl -X POST https://api.arunverse.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'

# Get analytics
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.arunverse.com/api/admin/analytics
```

### Test Frontend
```bash
# Open in browser
https://arunverse.com

# Test admin panel
https://arunverse.com/admin/login

# Check API connection
Open browser console → test product clicks
```

---

## Post-Deployment Tasks

### 1. Verify Everything Works
```bash
# Test Frontend
- [ ] Homepage loads
- [ ] Products display
- [ ] Search works
- [ ] Categories filter
- [ ] Admin login works
- [ ] Can add/edit/delete products
- [ ] Click tracking works

# Test Backend
- [ ] API responds to requests
- [ ] CORS headers present
- [ ] Auth tokens work
- [ ] Admin routes protected
```

### 2. Monitor & Debug
```bash
# View Railway logs
railway logs

# View Vercel logs
vercel logs

# Check domain propagation
whatsmydns.net (search: arunverse.com)
```

### 3. Setup Backups (Optional)
```bash
# Export products regularly
curl https://api.arunverse.com/api/products > products-backup.json

# Or setup automated backups in Railway
```

---

## Update Code After Deployment

```bash
# Make changes locally
# Test thoroughly
git add .
git commit -m "Description of changes"
git push origin main

# Automatic deployment:
# ✅ Vercel redeploys frontend automatically
# ✅ Railway redeploys backend automatically
# (No manual deployment needed!)
```

---

## Rollback to Previous Version

```bash
# If something breaks:
git log --oneline
git revert [commit-hash]
git push origin main

# Services redeploy automatically
```

---

## Performance Tips

```bash
# Frontend optimization
cd frontend
npm run build  # Check bundle size

# Backend optimization
# Monitor Railway CPU/Memory usage
# Consider adding caching
# Add database instead of in-memory storage
```

---

## Useful Links

- Railway Docs: https://railway.app/docs
- Vercel Docs: https://vercel.com/docs
- Domain Setup: Contact domain registrar support
- DNS Check: https://whatsmydns.net
- Free SSL: Vercel & Railway provide automatically

---

## Quick Links

- **Frontend URL:** https://arunverse.com
- **Admin URL:** https://arunverse.com/admin/login
- **API URL:** https://api.arunverse.com/api
- **Railway Dashboard:** https://railway.app
- **Vercel Dashboard:** https://vercel.com

---

**Estimated Time to Deploy:** 30-45 minutes
**Downtime:** None (zero downtime deployment)
**DNS Propagation:** 24-48 hours
