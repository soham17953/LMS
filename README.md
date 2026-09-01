# 🎓 Learning Management System (LMS)

A modern, full-stack Learning Management System built to streamline educational workflows for students, teachers, and administrators. 

## ✨ Features

- **Role-Based Access Control**: Secure, separate portals tailored for Students, Teachers, and Admins.
- **Authentication**: Seamless and secure login using [Clerk](https://clerk.com/).
- **Database**: Robust data management powered by [Supabase](https://supabase.com/).
- **Interactive Dashboards**: View attendance, assignments, and announcements at a glance.
- **Lecture & Material Management**: Teachers can upload and organize course materials; students can access them anytime.
- **Responsive Design**: Beautiful, mobile-friendly UI built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v7

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk Express Middleware

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need accounts for [Clerk](https://clerk.com/) and [Supabase](https://supabase.com/) to retrieve your API keys.

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/LMS.git
   cd LMS
   ```

2. **Install dependencies**
   Install both frontend and backend dependencies. (The root `package.json` relies on concurrently to run both, but you should install in both directories):
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and a `.env` file in the `server` directory. Refer to the `.env.example` files (or the variables listed below) to fill in your keys:
   
   **Root `.env`**:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Leave VITE_API_URL commented out for local development to use Vite's proxy
   # VITE_API_URL=http://localhost:5000 
   ```

   **Server `server/.env`**:
   ```env
   NODE_ENV=development
   PORT=5000
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   FRONTEND_URL=http://localhost:5173
   ```

4. **Run the application**
   From the root directory, start both the frontend and backend servers concurrently:
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:5173`
   - Backend runs on `http://localhost:5000`
   - The Vite proxy automatically routes `/api` requests to the backend locally to prevent CORS issues.

## 🌍 Deployment

This project is configured for easy deployment across popular hosting platforms:
- **Frontend**: Optimized for [Vercel](https://vercel.com).
- **Backend**: Optimized for [Render](https://render.com) using the included `render.yaml` configuration.

*Note: For production, ensure you update the `FRONTEND_URL` in your Render environment variables to match your live Vercel domain, and `VITE_API_URL` in your Vercel environment variables to match your live Render domain.*

## 📁 Project Structure

```text
LMS/
├── server/                 # Node.js Express backend
│   ├── controllers/        # Route logic and database interactions
│   ├── routes/             # API endpoint definitions
│   ├── middlewares/        # Custom Express middlewares
│   └── app.js              # Express app setup and CORS config
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page layouts for different roles
│   ├── lib/                # API services and utilities (AuthService)
│   └── App.jsx             # Main application routing
├── vercel.json             # Vercel deployment configuration
├── vite.config.js          # Vite configuration and API proxy
└── package.json            # Root dependencies and scripts
```
