# 🚀 QUICK START GUIDE - Baseball Survey App

**Your custom domain:** erikgulbrandsen.com

---

## Step 1: Firebase Setup (5 minutes) ⚙️

### Visit: https://console.firebase.google.com

1. **Create Project**
   - Click "Create a project"
   - Name: `baseball-survey`
   - Accept terms → Create

2. **Enable Firestore**
   - Left sidebar → Firestore Database
   - Click "Create Database"
   - Select: **Production mode**
   - Region: **us-central1**
   - Enable

3. **Enable Authentication**
   - Left sidebar → Authentication
   - Click "Get Started"
   - Email/Password → Enable → Save

4. **Get Firebase Config** ⭐ IMPORTANT
   - Click ⚙️ (settings icon) → Project Settings
   - Scroll to "Your apps" section
   - Find **Web** app (or create one)
   - Copy this config:
   ```
   {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   }
   ```

---

## Step 2: Get the Code 📁

All project files are included in the outputs folder:

```
Files you'll need:
- package.json
- tsconfig.json
- next.config.js
- .gitignore
- .env.local.example
- lib-firebase.ts → save as lib/firebase.ts
- layout.tsx → save as app/layout.tsx
- page-survey.tsx → save as app/page.tsx
- admin-page.tsx → save as app/admin/page.tsx
- README.md
- DEPLOYMENT_GUIDE.md
```

---

## Step 3: Local Setup (5 minutes) 💻

### In terminal/command prompt:

```bash
# Create project folder
mkdir baseball-survey
cd baseball-survey

# Initialize Node project
npm init -y

# Install dependencies
npm install next react react-dom firebase typescript @types/node @types/react @types/react-dom

# Create folder structure
mkdir -p app/admin lib

# Copy files into correct locations:
# - lib-firebase.ts → lib/firebase.ts
# - layout.tsx → app/layout.tsx  
# - page-survey.tsx → app/page.tsx
# - admin-page.tsx → app/admin/page.tsx
# - Copy: tsconfig.json, next.config.js, .gitignore, package.json
```

### Create `.env.local` file:

Copy from `.env.local.example` and fill in your Firebase values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=paste_your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=paste_your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=paste_your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=paste_your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=paste_your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=paste_your_app_id
```

### Test locally:

```bash
npm run dev
```

Visit: http://localhost:3000

✅ Survey form should load and work

---

## Step 4: Deploy to Vercel (5 minutes) 🌐

### Option A: If you don't have GitHub yet

1. Go to https://github.com/signup
2. Create account (free)
3. Create new repository: `baseball-survey` (private is fine)
4. In your local folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/baseball-survey.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub (same account from above)
3. Click "Add New..." → "Project"
4. Import: `baseball-survey` repository
5. **Environment Variables** - Add your 6 Firebase values:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID
6. Click "Deploy"

✅ Vercel will give you a preview URL like `baseball-survey.vercel.app`

---

## Step 5: Connect Your Domain (5 minutes) 🌍

### In Vercel:

1. Go to your project
2. Click **Settings** → **Domains**
3. Add domain: `erikgulbrandsen.com`
4. Also add: `www.erikgulbrandsen.com`
5. Vercel shows you DNS records to add

### At your domain registrar (GoDaddy, Namecheap, etc.):

1. Go to DNS settings
2. Add the records Vercel provided
3. Usually: 4 records (A record for root, CNAME for www)
4. Save changes

**Wait 24-48 hours** for DNS to propagate

Test: Visit `erikgulbrandsen.com` - should show your survey app! ✅

---

## Step 6: Set Up Admin Account (2 minutes) 🔐

1. Visit `erikgulbrandsen.com/admin`
2. Click "Don't have an account? Sign Up"
3. Enter your email and strong password
4. Click "Sign Up"
5. You're now logged in!

---

## Test the App 🧪

### As an athlete:
1. Visit `erikgulbrandsen.com`
2. Enter a test name
3. Select some times
4. Mark unavailable times
5. Rank preferences
6. Rate importance
7. Review and submit

### As admin:
1. Visit `erikgulbrandsen.com/admin`
2. Login with your email/password
3. View the response in "Individual Responses"
4. See scoring in "Aggregated Results"
5. Download CSV

---

## Troubleshooting Checklist ✓

- [ ] Firebase config copied correctly (all 6 values)
- [ ] `.env.local` file created in root folder
- [ ] All Firebase services enabled (Firestore, Auth)
- [ ] `npm run dev` works locally
- [ ] Can submit survey locally
- [ ] Code pushed to GitHub
- [ ] Environment variables added to Vercel
- [ ] Vercel deployment shows "Ready"
- [ ] DNS records added at domain registrar
- [ ] Waited 24+ hours for DNS (or check propagation at whatsmydns.net)
- [ ] Can login to admin dashboard

---

## Next Steps 🎯

After everything works:

1. **Share survey link** - Send athletes to `erikgulbrandsen.com`
2. **Create more surveys** - Use admin dashboard
3. **Add pages** - Build CV/research pages in `/app` folder
4. **Backup data** - Firebase auto-saves, but can manually export

---

## File Checklist 📋

Make sure you have these files in correct locations:

```
baseball-survey/
├── app/
│   ├── page.tsx ......................... Survey form
│   ├── layout.tsx ....................... Root layout
│   ├── admin/
│   │   └── page.tsx ..................... Admin dashboard
│   └── page.module.css .................. Styles
├── lib/
│   └── firebase.ts ...................... Firebase config
├── .env.local ........................... Firebase values (SECRET!)
├── .gitignore ........................... Don't commit these files
├── next.config.js ....................... Next.js config
├── tsconfig.json ........................ TypeScript config
├── package.json ......................... Dependencies
└── README.md ............................ Documentation
```

---

## Quick Links 🔗

- **Survey App**: erikgulbrandsen.com
- **Admin Dashboard**: erikgulbrandsen.com/admin
- **Firebase Console**: https://console.firebase.google.com
- **Vercel Dashboard**: https://vercel.com
- **GitHub**: https://github.com

---

## Still Stuck? 🤔

1. **Check browser console**: F12 → Console tab (look for red errors)
2. **Check Firebase console**: Make sure database/auth are enabled
3. **Check .env.local**: All 6 values present and correct?
4. **Check Vercel logs**: In Vercel project → Deployments → build logs
5. **Restart dev server**: Stop `npm run dev`, run again
6. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete)

---

## You've Got This! 🎉

You now have a professional survey platform that:
- ✅ Looks professional (not like Google Forms)
- ✅ Works on mobile
- ✅ Stores data securely
- ✅ Gives you admin analytics
- ✅ Is ready for scaling

Happy surveying! ⚾

---

**Questions?** Refer to README.md for more detailed info.
