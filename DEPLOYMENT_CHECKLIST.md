# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] Environment variables prepared (API URL, Admin password, JWT secret)
- [ ] Domain name purchased or free domain registered (arunverse.com or similar)

---

## ✅ Step 1: Deploy Backend (Render)

- [ ] Create Render account at render.com
- [ ] Connect GitHub repository
- [ ] Create a Web Service or Blueprint from `render.yaml`
- [ ] Confirm root directory is `backend`
- [ ] Render auto-deploys backend
- [ ] Get Render API URL (e.g., https://arunverse-backend.onrender.com)
- [ ] Set environment variables in Render:
  - [ ] `JWT_SECRET` = your secret key
  - [ ] `ADMIN_PASSWORD` = your admin password
  - [ ] `DATABASE_URL` = your Supabase/Neon Postgres connection string
  - [ ] `CORS_ORIGIN` = https://arunverse.com,https://www.arunverse.com,https://*.vercel.app
- [ ] Test backend: curl https://your-render-url/api/products

---

## ✅ Step 2: Deploy Frontend (Vercel)

- [ ] Create Vercel account at vercel.com
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Add environment variable in Vercel:
  - [ ] `VITE_API_URL` = your Render API URL with `/api` at the end
- [ ] Vercel auto-deploys
- [ ] Get Vercel URL (e.g., https://arunverse.vercel.app)

---

## ✅ Step 3: Setup Custom Domain

### For Vercel (Frontend - arunverse.com)
- [ ] In Vercel dashboard → Domains
- [ ] Add your domain: arunverse.com
- [ ] Note the nameserver records provided
- [ ] Update domain registrar's nameservers

### For Render (Backend API - api.arunverse.com)
- [ ] In Render dashboard → Settings → Custom Domains
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
- [ ] Set DATABASE_URL so added products persist
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
3. Check Render logs for errors
4. Ensure CORS is enabled in backend

### If domain doesn't resolve:
1. Verify nameserver changes (24-48 hour wait)
2. Check DNS records are correct
3. Use whatsmydns.net to verify propagation
4. Flush browser DNS cache

### If admin login fails:
1. Check ADMIN_PASSWORD environment variable in Render
2. Verify JWT_SECRET is set
3. Clear browser localStorage
4. Check Render logs

---

## 📝 Notes

- **Render URL Example:** https://arunverse-backend.onrender.com/api
- **Vercel URL Example:** https://arunverse.vercel.app
- **Final URLs:**
  - Frontend: https://arunverse.com
  - Admin: https://arunverse.com/admin/login
  - API: https://api.arunverse.com/api

---

## 💡 Cost Estimate

- **Vercel:** FREE (unlimited for hobby projects)
- **Render:** Free web service - sufficient for demos and small projects, but sleeps when idle
- **Domain:** $10-15/year OR FREE (.tk, .ml, .ga)
- **TOTAL:** ~$120/year for domain (optional free tier available)

---

**Status:** Ready for deployment! 🚀
