# Vercel Frontend Deployment Guide

## Connect Frontend to Render Backend

Now that your backend is deployed on Render and your frontend code is updated, you need to configure Vercel to use your Render backend URL.

## Steps:

### 1. Get Your Render Backend URL

Your Render backend URL should look like:
```
https://your-app-backend.onrender.com
```

You can find this in your Render dashboard.

### 2. Add Environment Variable to Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:

   **Key:** `VITE_API_URL`
   
   **Value:** `https://your-app-backend.onrender.com` (replace with your actual Render URL)
   
   **Environments:** Select all (Production, Preview, Development)

5. Click **Save**

### 3. Keep Existing Environment Variables

Make sure these are also set in Vercel:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bWF0dXJlLW9wb3NzdW0tMzQuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_SUPABASE_URL=https://zkcemgqtaegrvtpfqiuq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2VtZ3F0YWVncnZ0cGZxaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzQzMjYsImV4cCI6MjA5MjExMDMyNn0.-oK30d5OumeVcgGrEDiLkrsVb2lfvBnzr7AzClBWzw8
```

### 4. Redeploy Your Frontend

After adding the environment variable, you need to redeploy:

**Option A: Automatic (Recommended)**
- Push your updated code to GitHub
- Vercel will automatically redeploy

**Option B: Manual**
- Go to your Vercel project dashboard
- Click **Deployments**
- Click the three dots (...) on the latest deployment
- Click **Redeploy**

### 5. Update Render Backend Environment Variable

Don't forget to add your Vercel frontend URL to Render:

1. Go to your Render service dashboard
2. Go to **Environment** tab
3. Add/Update:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
4. Save changes (Render will automatically redeploy)

### 6. Test Your Deployment

1. Visit your Vercel frontend URL
2. Try logging in
3. Check browser console for any errors
4. Test API calls (create lecture, view attendance, etc.)

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Make sure it includes `https://` and no trailing slash
- Check that both services have redeployed after environment variable changes

### API Calls Failing
- Check that `VITE_API_URL` in Vercel is set correctly
- Verify your Render backend is running (visit `/health` endpoint)
- Check Render logs for errors

### 404 Errors on API Routes
- Ensure your Render backend is deployed from the `server` folder
- Verify the start command is `npm start`
- Check that all routes are properly mounted in `server/app.js`

### Environment Variables Not Working
- After adding/changing environment variables, you MUST redeploy
- Environment variables are only loaded during build time for Vite
- Clear browser cache and try again

## Architecture Overview

```
User Browser
    ↓
Vercel Frontend (React + Vite)
    ↓ (API calls via VITE_API_URL)
Render Backend (Express + Node.js)
    ↓
Supabase Database
```

## Important Notes

- **Development:** Uses Vite proxy (`/api` → `http://localhost:5000`)
- **Production:** Uses `VITE_API_URL` environment variable
- **CORS:** Backend configured to accept requests from `FRONTEND_URL`
- **Authentication:** Clerk handles auth, backend validates tokens

## Next Steps

Once everything is working:
1. Set up custom domains (optional)
2. Enable monitoring and logging
3. Set up CI/CD pipelines
4. Consider upgrading Render to paid plan for better performance
5. Implement rate limiting and security headers
