# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] Environment variables prepared (API URL, Admin password, JWT secret)
- [ ] Domain name purchased or free domain registered (arunverse.com or similar)

---

## ✅ Step 1: Deploy Backend (Railway)

- [ ] Create Railway account at railway.app
- [ ] Connect GitHub repository
- [ ] Set Railway root/service directory to `backend`
- [ ] Railway auto-deploys backend
- [ ] Get Railway API URL (e.g., https://arunverse-api.railway.app)
- [ ] Set environment variables in Railway:
  - [ ] `JWT_SECRET` = your secret key
  - [ ] `ADMIN_PASSWORD` = your admin password
  - [ ] `CORS_ORIGIN` = https://arunverse.com,https://www.arunverse.com
- [ ] Test backend: curl https://your-railway-url/api/products

---

## ✅ Step 2: Deploy Frontend (Vercel)

- [ ] Create Vercel account at vercel.com
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Add environment variable in Vercel:
  - [ ] `VITE_API_URL` = your Railway API URL
- [ ] Vercel auto-deploys
- [ ] Get Vercel URL (e.g., https://arunverse.vercel.app)

---

## ✅ Step 3: Setup Custom Domain

### For Vercel (Frontend - arunverse.com)
- [ ] In Vercel dashboard → Domains
- [ ] Add your domain: arunverse.com
- [ ] Note the nameserver records provided
- [ ] Update domain registrar's nameservers

### For Railway (Backend API - api.arunverse.com)
- [ ] In Railway dashboard → Settings → Custom Domain
- [ ] Add: api.arunverse.com
- [ ] Add CNAME records in domain registrar

---

## ✅ Step 4: Verify DNS Propagation

- [ ] Wait 24-48 hours for DNS to update
- [ ] Check with whatsmydns.net
- [ ] Test accessing arunverse.com in browser
- [ ] Verify API calls work from frontend

---

## ✅ Step 5: Test Everything

- [ ] Homepage loads
- [ ] Products display correctly
- [ ] Search works
- [ ] Categories filter
- [ ] Click tracking works (check analytics)
- [ ] Admin login works (password: your-admin-password)
- [ ] Can add products in admin panel
- [ ] Can edit products
- [ ] Can delete products

---

## 🔐 Security Checklist

- [ ] Changed admin password from "admin123"
- [ ] Generated and set strong JWT_SECRET
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS_ORIGIN configured for your frontend domain
- [ ] Environment variables are set (not in code)
- [ ] .env files added to .gitignore

---

## 📊 Performance Optimization (Optional)

- [ ] Enable caching headers on Vercel
- [ ] Setup CDN for images
- [ ] Enable Gzip compression
- [ ] Optimize bundle size

---

## 🆘 Troubleshooting

### If products don't load:
1. Check browser console for errors
2. Verify VITE_API_URL in Vercel is correct
3. Check Railway logs for errors
4. Ensure CORS is enabled in backend

### If domain doesn't resolve:
1. Verify nameserver changes (24-48 hour wait)
2. Check DNS records are correct
3. Use whatsmydns.net to verify propagation
4. Flush browser DNS cache

### If admin login fails:
1. Check ADMIN_PASSWORD environment variable in Railway
2. Verify JWT_SECRET is set
3. Clear browser localStorage
4. Check Railway logs

---

## 📝 Notes

- **Railway URL Example:** https://arunverse-api-prod.railway.app/api
- **Vercel URL Example:** https://arunverse.vercel.app
- **Final URLs:**
  - Frontend: https://arunverse.com
  - Admin: https://arunverse.com/admin/login
  - API: https://api.arunverse.com/api

---

## 💡 Cost Estimate

- **Vercel:** FREE (unlimited for hobby projects)
- **Railway:** FREE tier ($5/month credit) - sufficient for small projects
- **Domain:** $10-15/year OR FREE (.tk, .ml, .ga)
- **TOTAL:** ~$120/year for domain (optional free tier available)

---

**Status:** Ready for deployment! 🚀
