# Troubleshooting Infinite Reload Issue

## What I Fixed:

1. **Removed infinite redirect loop** in `DashboardLayout.jsx`
2. **Added error handling** to show what's going wrong instead of reloading
3. **Added debug console logs** to track the flow
4. **Better error messages** when API calls fail

## How to Debug:

### Step 1: Check Browser Console
1. Open your deployed site on Vercel
2. Press F12 to open Developer Tools
3. Go to the **Console** tab
4. Try to log in and access the dashboard
5. Look for these messages:
   - "Fetching user profile..."
   - "Profile received: ..."
   - Any error messages in red

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Try to access the dashboard
3. Look for a request to `/api/profiles/me`
4. Check:
   - Is the request going to your Render URL?
   - What's the response status? (200 = success, 404 = not found, 500 = server error)
   - What's the response body?

### Step 3: Verify Environment Variables

**In Vercel:**
- Go to Settings → Environment Variables
- Verify `VITE_API_URL` is set to your Render backend URL
- Example: `https://your-backend.onrender.com`
- **Important:** NO trailing slash!

**In Render:**
- Go to Environment tab
- Verify `FRONTEND_URL` is set to your Vercel URL
- Example: `https://your-app.vercel.app`
- **Important:** NO trailing slash!

### Step 4: Test Backend Directly

Open these URLs in your browser:

1. **Health Check:**
   ```
   https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Test with Clerk Token:**
   - Log in to your app
   - Open Console and run:
   ```javascript
   // Get your Clerk token
   window.Clerk.session.getToken().then(token => console.log(token))
   ```
   - Copy the token
   - Use a tool like Postman or curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" https://your-backend.onrender.com/api/profiles/me
   ```

## Common Issues:

### Issue 1: CORS Error
**Symptom:** Console shows "CORS policy" error

**Fix:**
- Check `FRONTEND_URL` in Render matches your Vercel URL exactly
- Redeploy Render after changing environment variables

### Issue 2: 404 on API Calls
**Symptom:** Network tab shows 404 for `/api/profiles/me`

**Fix:**
- Check `VITE_API_URL` in Vercel is correct
- Make sure it points to your Render backend
- Redeploy Vercel after changing environment variables

### Issue 3: Render Backend Sleeping
**Symptom:** First request takes 30-60 seconds, then works

**Fix:**
- This is normal for Render free tier
- Backend spins down after 15 minutes of inactivity
- Consider upgrading to paid plan for production

### Issue 4: Clerk Authentication Issues
**Symptom:** Can't get token or token is invalid

**Fix:**
- Check `CLERK_SECRET_KEY` in Render backend
- Check `VITE_CLERK_PUBLISHABLE_KEY` in Vercel frontend
- Make sure both are from the same Clerk application

### Issue 5: Environment Variables Not Applied
**Symptom:** Changes don't take effect

**Fix:**
- After changing environment variables, you MUST redeploy
- In Vercel: Push to GitHub or manually redeploy
- In Render: Automatically redeploys when you save env vars

## Quick Checklist:

- [ ] `VITE_API_URL` set in Vercel (no trailing slash)
- [ ] `FRONTEND_URL` set in Render (no trailing slash)
- [ ] Both services redeployed after env var changes
- [ ] Backend health check returns 200 OK
- [ ] No CORS errors in browser console
- [ ] Clerk keys match between frontend and backend
- [ ] Latest code pushed to GitHub

## Still Not Working?

Share the following information:
1. Console logs from browser (F12 → Console)
2. Network tab screenshot showing the failed request
3. Your Render backend URL
4. Your Vercel frontend URL
5. Any error messages from Render logs
