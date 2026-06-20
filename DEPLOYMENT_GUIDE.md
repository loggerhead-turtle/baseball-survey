# Baseball Practice Survey App - Deployment Guide

## Overview
This is a professional survey application built with:
- **Frontend**: Next.js + React + TypeScript
- **Backend**: Firebase (Firestore database, Authentication)
- **Hosting**: Vercel (with custom domain erikgulbrandsen.com)

---

## Phase 1: Firebase Setup (5-10 minutes)

### Step 1: Create a Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a new project"
3. Name it: `baseball-survey`
4. Accept the terms and click "Create project"
5. Wait for it to complete

### Step 2: Enable Firestore Database
1. In Firebase console, go to **Firestore Database** (left sidebar)
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select region: **us-central1** (or closest to you)
5. Click **Enable**

### Step 3: Enable Authentication
1. Go to **Authentication** (left sidebar)
2. Click **Get Started**
3. Click **Email/Password** provider
4. Enable it and click **Save**

### Step 4: Get Your Firebase Config
1. In Firebase console, click the settings icon ⚙️ (top left)
2. Go to **Project Settings**
3. Scroll to **Your apps** section
4. Click **Web** icon (if no apps exist)
5. Register app as: `baseball-survey`
6. Copy the Firebase config object
7. **Save this for Step 3 below**

Example config looks like:
```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "baseball-survey-xxxx.firebaseapp.com",
  projectId: "baseball-survey-xxxx",
  storageBucket: "baseball-survey-xxxx.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...",
}
```

---

## Phase 2: Project Setup (10-15 minutes)

### Step 1: Get the Code
Download the complete project files from this folder.

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- `next` - React framework
- `react` & `react-dom` - UI library
- `firebase` - Backend services
- `typescript` - Type safety

### Step 3: Create Environment File
Create a file named `.env.local` in the root directory:

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID_HERE
```

Replace each value from Step 1 of Phase 1.

### Step 4: Test Locally
```bash
npm run dev
```

Visit http://localhost:3000 in your browser.

---

## Phase 3: Deploy to Vercel (5 minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended) or email
3. Click "Import Project"

### Step 2: Import from GitHub
1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/baseball-survey.git
   git push -u origin main
   ```
2. In Vercel, click "Import Project"
3. Select "Import Git Repository"
4. Enter: `https://github.com/YOUR_USERNAME/baseball-survey.git`
5. Click "Import"

### Step 3: Add Environment Variables
1. Vercel will show the import dialog
2. Click "Environment Variables"
3. Add all 6 variables from Phase 2 Step 3
4. Click "Deploy"

**Vercel will deploy automatically and give you a .vercel.app URL**

---

## Phase 4: Connect Custom Domain (5 minutes)

### Step 1: In Vercel
1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add domain: `erikgulbrandsen.com`
4. Add: `www.erikgulbrandsen.com`

### Step 2: Update DNS at Your Domain Registrar
Vercel will show you DNS records to add. For most registrars:

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Add the records Vercel provides:
   - Usually an `A` record pointing to Vercel's IP
   - Or a `CNAME` record pointing to Vercel's domain
4. Wait 24-48 hours for DNS to propagate

### Step 3: Verify
- Visit `erikgulbrandsen.com` - should show your survey app
- Visit `www.erikgulbrandsen.com` - should also work

---

## Phase 5: Set Up Admin Dashboard (2 minutes)

### Step 1: Create Admin User
1. Open your Vercel-deployed app
2. Go to `/admin` page
3. Click "Create Admin Account"
4. Enter your email and password
5. Verify in Firebase console → Authentication

### Step 2: Access Admin Dashboard
- URL: `erikgulbrandsen.com/admin`
- Login with the email/password from Step 1
- You can now:
  - Create new surveys
  - View individual responses
  - View aggregate results
  - Download data as CSV

---

## How It Works

### For Athletes (Survey Respondents)
1. Visit `erikgulbrandsen.com`
2. Fill out survey (name, preferences, availability)
3. Submit responses
4. Responses saved to Firebase in real-time

### For You (Admin)
1. Visit `erikgulbrandsen.com/admin`
2. Login with your admin account
3. **View Responses** - See individual athlete submissions
4. **Results Dashboard** - See aggregated rankings by day
5. **Importance Profiles** - See custom importance ratings
6. **Download** - Export all data as CSV

---

## Troubleshooting

### "Cannot connect to Firebase"
- Check `.env.local` has correct config values
- Ensure Firestore database is enabled in Firebase

### "Domain not working"
- DNS changes take 24-48 hours
- Check Vercel domain settings show ✓ status

### "Admin login not working"
- Verify Email/Password auth is enabled in Firebase
- Check user was created in Firebase Authentication

### Need to change Firebase config?
- Update `.env.local`
- Push to GitHub
- Vercel auto-redeploys

---

## File Structure
```
baseball-survey-app/
├── app/
│   ├── page.tsx          # Survey form
│   ├── admin/page.tsx    # Admin dashboard
│   ├── api/              # API routes
│   └── layout.tsx        # App layout
├── lib/
│   └── firebase.ts       # Firebase config
├── components/           # Reusable components
├── .env.local           # Your Firebase config (SECRET - don't commit)
├── next.config.js       # Next.js config
└── package.json         # Dependencies
```

---

## Support

For issues with:
- **Vercel**: https://vercel.com/docs
- **Firebase**: https://firebase.google.com/docs
- **Next.js**: https://nextjs.org/docs

---

## Next Steps

After deploying, you can:
1. **Share survey link** - Send athletes to `erikgulbrandsen.com`
2. **Create new surveys** - Use admin dashboard
3. **Add CV/Research pages** - Build more pages in `/app` directory
4. **Customize branding** - Change colors in CSS/tailwind config

Enjoy!
