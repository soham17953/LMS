# Render Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Render account (sign up at https://render.com)
- Your Vercel frontend URL

## Deployment Steps

### 1. Push Your Code to GitHub
Make sure your latest code is pushed to GitHub, including the server folder.

### 2. Create a New Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - Name: `your-app-backend` (or any name you prefer)
   - Region: Choose closest to your users
   - Branch: `main` (or your default branch)
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

   **Instance Type:**
   - Select "Free" (or paid plan for better performance)

### 3. Add Environment Variables

In the "Environment" section, add these variables:

```
NODE_ENV=production
PORT=5000
CLERK_SECRET_KEY=sk_test_XyxECL5kI2CNksIT4sQksChcVl8H2Rwrgafoj52mh9
SUPABASE_URL=https://zkcemgqtaegrvtpfqiuq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprY2VtZ3F0YWVncnZ0cGZxaXVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUzNDMyNiwiZXhwIjoyMDkyMTEwMzI2fQ.Z25lklGilyHQk3Lqv3hHLxP3W0sTbUlO2ustk1W55r0
CLERK_PUBLISHABLE_KEY=pk_test_bWF0dXJlLW9wb3NzdW0tMzQuY2xlcmsuYWNjb3VudHMuZGV2JA
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Important:** Replace `https://your-vercel-app.vercel.app` with your actual Vercel frontend URL.

### 4. Deploy

Click "Create Web Service" and Render will:
- Clone your repository
- Install dependencies
- Start your server
- Provide you with a URL like: `https://your-app-backend.onrender.com`

### 5. Update Your Frontend

Update your Vercel frontend environment variables to point to your new Render backend URL:

```
VITE_API_URL=https://your-app-backend.onrender.com
```

Then redeploy your frontend on Vercel.

### 6. Test Your Deployment

Visit: `https://your-app-backend.onrender.com/health`

You should see:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Important Notes

### Free Tier Limitations
- Render's free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to a paid plan for production apps

### CORS Configuration
The backend is configured to accept requests from your frontend URL specified in `FRONTEND_URL` environment variable.

### Environment Variables Security
- Never commit `.env` files to GitHub
- Use Render's environment variable dashboard to manage secrets
- Rotate keys regularly for production apps

### Monitoring
- Check logs in Render dashboard under "Logs" tab
- Set up health check monitoring
- Enable email notifications for deployment failures

## Troubleshooting

### Build Fails
- Check that `server` is set as the root directory
- Verify `package.json` has all required dependencies
- Check build logs for specific errors

### Server Won't Start
- Verify all environment variables are set correctly
- Check that PORT is set to 5000 or use `process.env.PORT`
- Review application logs in Render dashboard

### CORS Errors
- Ensure `FRONTEND_URL` matches your Vercel domain exactly
- Include protocol (https://)
- Don't include trailing slash

### Database Connection Issues
- Verify Supabase credentials are correct
- Check that Supabase project is active
- Ensure service role key has proper permissions

## Updating Your Deployment

Render automatically redeploys when you push to your connected branch:

1. Make changes locally
2. Commit and push to GitHub
3. Render detects changes and redeploys automatically

You can also manually trigger deployments from the Render dashboard.

## Custom Domain (Optional)

To use a custom domain:
1. Go to your service settings on Render
2. Click "Custom Domain"
3. Follow instructions to add DNS records
4. Update `FRONTEND_URL` if needed
