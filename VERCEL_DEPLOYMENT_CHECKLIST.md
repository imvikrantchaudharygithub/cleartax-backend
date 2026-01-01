# Vercel Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Build Verification
- [x] TypeScript compiles without errors (`npm run build`)
- [x] All linter errors resolved
- [x] `dist/` folder contains compiled JavaScript files
- [x] Entry point exports app correctly for Vercel

### 2. Configuration Files
- [x] `vercel.json` configured correctly
- [x] `package.json` has correct build and start scripts
- [x] `tsconfig.json` outputs to `dist/` folder

### 3. Code Changes for Vercel
- [x] `index.ts` exports app as default export
- [x] Database connection handled via middleware (lazy connection for serverless)
- [x] Server only starts in non-Vercel environments
- [x] Health check endpoint includes database status

## 🔐 Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### **Required (Must Have)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters-long
NODE_ENV=production
```

### **Optional (Recommended)**
```
FRONTEND_URL=https://your-frontend-domain.com
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
```

### **Optional (Feature-Specific)**
```
# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service (for sending emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### **Alternative MongoDB Configuration**
If not using `MONGODB_URI`, you can use:
```
MONGODB_USERNAME=your-username
MONGODB_PASSWORD=your-password
MONGODB_DATABASE=cleartax
MONGODB_CLUSTER=cluster.mongodb.net
```

## 🚀 Deployment Steps

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Add all environment variables
7. Click "Deploy"

### Option 3: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import from Git or upload project
4. Configure build settings
5. Add environment variables
6. Deploy

## 🔍 Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-app.vercel.app/health
```
Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### 2. API Endpoints Test
```bash
# Test API routes
curl https://your-app.vercel.app/api/services/categories
```

### 3. Check Vercel Logs
- Go to Vercel Dashboard → Your Project → Deployments → Click on deployment → Logs
- Verify no errors in function logs
- Check database connection messages

## ⚠️ Common Issues & Solutions

### Issue: Database Connection Timeout
**Solution:** 
- Ensure MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0 for all IPs)
- Check `MONGODB_URI` is correct
- Verify network access in MongoDB Atlas dashboard

### Issue: Function Timeout
**Solution:**
- Increase `maxDuration` in `vercel.json` (currently 30 seconds)
- Optimize slow database queries
- Consider using MongoDB connection pooling

### Issue: CORS Errors
**Solution:**
- Set `FRONTEND_URL` environment variable to your frontend domain
- Update CORS origin in `index.ts` if needed

### Issue: Environment Variables Not Loading
**Solution:**
- Ensure all variables are set in Vercel Dashboard
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Issue: Build Fails
**Solution:**
- Check build logs in Vercel Dashboard
- Ensure `npm run build` works locally
- Verify all dependencies are in `package.json` (not just `devDependencies`)

## 📝 Notes

- **Serverless Functions:** Vercel uses serverless functions, so database connections are lazy-loaded on first request
- **Cold Starts:** First request after inactivity may be slower (cold start)
- **Function Duration:** Default is 10 seconds, increased to 30 seconds in config
- **Database Connections:** MongoDB connection is reused across requests in the same function instance
- **File Uploads:** Ensure Cloudinary credentials are set for file upload functionality
- **Email Service:** Ensure email credentials are set if using email features

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [Vercel Function Configuration](https://vercel.com/docs/concepts/functions/serverless-functions)

