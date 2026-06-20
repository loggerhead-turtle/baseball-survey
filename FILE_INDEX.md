# 📦 Baseball Survey App - Complete File Package

## What You're Getting

A complete, production-ready survey application with:
- ✅ Professional survey form for athletes
- ✅ Secure admin dashboard with analytics
- ✅ Firebase backend (real-time database)
- ✅ Vercel hosting (fast CDN)
- ✅ Custom domain support (erikgulbrandsen.com)
- ✅ Mobile responsive design
- ✅ CSV export functionality

---

## 📋 File Listing & Where They Go

### Configuration Files (Root Directory)

| File | Purpose | Where to Put |
|------|---------|-------------|
| `package.json` | Lists all dependencies | Root folder |
| `tsconfig.json` | TypeScript configuration | Root folder |
| `next.config.js` | Next.js build settings | Root folder |
| `.gitignore` | Files to not commit to Git | Root folder |
| `.env.local.example` | Template for secrets | Root folder |

### Source Code Files

| File | Purpose | Folder Path |
|------|---------|------------|
| `lib-firebase.ts` | Firebase initialization | `lib/firebase.ts` |
| `layout.tsx` | App root layout | `app/layout.tsx` |
| `page-survey.tsx` | Survey form (athletes) | `app/page.tsx` |
| `admin-page.tsx` | Admin dashboard | `app/admin/page.tsx` |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation |
| `QUICK_START.md` | Fast setup guide (start here!) |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment steps |
| `FILE_INDEX.md` | This file |

---

## 🚀 Getting Started (Choose One Path)

### Path A: I Want to Deploy NOW (Recommended)

1. **Read:** `QUICK_START.md` (5 minute read)
2. **Setup Firebase:** Follow Phase 1 in `QUICK_START.md`
3. **Copy files** to correct locations (see table above)
4. **Create `.env.local`** with your Firebase config
5. **Test locally:** `npm run dev`
6. **Deploy to Vercel:** Follow Phase 4 in `QUICK_START.md`
7. **Connect domain:** Follow Phase 5 in `QUICK_START.md`

**Total time:** ~30 minutes (mostly waiting for DNS)

### Path B: I Want to Understand Everything First

1. **Read:** `README.md` (comprehensive overview)
2. **Review:** `DEPLOYMENT_GUIDE.md` (step-by-step details)
3. **Understand project structure** (see folder structure below)
4. **Then follow Path A**

**Total time:** ~2 hours

### Path C: I Want to Customize It

1. Follow Path A first (get it working)
2. Read code in `app/page.tsx` and `app/admin/page.tsx`
3. Modify as needed (times, colors, questions, etc.)
4. `npm run dev` to test changes
5. Git push to redeploy

---

## 📁 Folder Structure (After Setup)

After following setup, your folder should look like:

```
baseball-survey/
│
├── app/
│   ├── admin/
│   │   └── page.tsx                 ← Admin dashboard
│   ├── page.tsx                     ← Survey form
│   ├── layout.tsx                   ← Root layout
│   └── page.module.css              ← Styles
│
├── lib/
│   └── firebase.ts                  ← Firebase config
│
├── node_modules/                    ← Dependencies (auto-created)
│   └── (thousands of files)
│
├── .next/                           ← Build output (auto-created)
│   └── (build files)
│
├── .env.local                       ← Your Firebase secrets ⚠️ DON'T COMMIT
├── .gitignore                       ← Tells Git what to ignore
├── next.config.js                   ← Next.js config
├── tsconfig.json                    ← TypeScript config
├── package.json                     ← Dependencies list
├── package-lock.json                ← Lock file (auto-created)
│
└── README.md                        ← Documentation
```

---

## 🔑 Critical Files

### Must Create Before Starting
- **`.env.local`** - Contains your Firebase config (sensitive!)

### Must Not Commit to GitHub
- `.env.local` (contains API keys)
- `node_modules/` (too large)
- `.next/` (build artifacts)

(These are already in `.gitignore`)

### Configure These
- `app/page.tsx` - Change times, colors, questions
- `app/admin/page.tsx` - Customize admin features
- `lib/firebase.ts` - Usually don't touch this

---

## 📝 Step-by-Step File Setup

### 1. Create Project Folder
```bash
mkdir baseball-survey
cd baseball-survey
```

### 2. Copy Root Files
Copy these files to your `baseball-survey/` folder:
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `.gitignore`
- `.env.local.example`
- `README.md`
- `QUICK_START.md`

### 3. Create Subfolders
```bash
mkdir -p app/admin lib
```

### 4. Copy App Files
- `layout.tsx` → `app/layout.tsx`
- `page-survey.tsx` → `app/page.tsx`
- `admin-page.tsx` → `app/admin/page.tsx`

### 5. Copy Library Files
- `lib-firebase.ts` → `lib/firebase.ts`

### 6. Create .env.local
Copy `.env.local.example` to `.env.local` and fill in Firebase values

### 7. Install Dependencies
```bash
npm install
```

### 8. Test
```bash
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Checklist Before Deploying

- [ ] All files in correct folders (use table above)
- [ ] `.env.local` created with Firebase config
- [ ] `npm install` completed
- [ ] `npm run dev` works and shows survey form
- [ ] Can submit survey locally
- [ ] Firebase Firestore database created
- [ ] Firebase Authentication enabled
- [ ] GitHub account created
- [ ] Code pushed to GitHub repo
- [ ] Vercel account created
- [ ] Environment variables added to Vercel
- [ ] Domain configured in Vercel DNS
- [ ] Admin account created at `/admin`

---

## 🔐 Security Best Practices

### File Permissions
- ✅ `.env.local` - NEVER commit (already in .gitignore)
- ✅ `api/` routes - Protected by auth in code
- ✅ Firebase rules - Keep restrictive

### Secrets Management
- 🔑 API_KEY - Safe to expose (Firebase rule)
- 🔑 Auth tokens - Handled by Firebase
- 🔑 Password - Never stored locally
- 🔑 Admin access - Email/password protected

### Never Share
- Firebase config API key ❌ (it's ok, it's public)
- Admin email/password ✅ (keep secret)
- `.env.local` file ✅ (keep secret)

---

## 📞 File Reference

### Need to change...

**Survey times?**
- Edit: `app/page.tsx`
- Search for: `const times = [`
- Modify: `['7:00 AM', '10:00 AM', ...]`

**Colors/styling?**
- Edit: `app/page.tsx` or `app/admin/page.tsx`
- Search for: `background:` or `color:`
- Modify hex values

**Scoring system?**
- Edit: `app/admin/page.tsx`
- Search for: `calculateResults()`
- Change: `pick.rank === 1 ? 5 : 3`

**Add new survey types?**
- Build in: `app/page.tsx`
- Create separate form component

**Admin features?**
- Edit: `app/admin/page.tsx`
- Add new functions and UI

---

## 🐛 If Something Breaks

### Survey won't load
1. Check: `npm run dev` running?
2. Check: Browser cache (Ctrl+Shift+Delete)
3. Check: Console for errors (F12)
4. Check: `.env.local` has Firebase config

### Admin won't login
1. Check: Firebase Authentication enabled?
2. Check: User account created?
3. Check: Email/password correct?
4. Check: Browser console errors

### Data not saving
1. Check: Firestore Database enabled?
2. Check: Console shows errors?
3. Check: Firebase rules allow writes?
4. Check: Network tab for API errors (F12)

### Deployed site not working
1. Check: Vercel deployment status
2. Check: Environment variables added?
3. Check: DNS propagated? (whatsmydns.net)
4. Check: `npm run build` works locally?

---

## 📚 Documentation Files Order

Read in this order:

1. **QUICK_START.md** ← Start here! (5 min)
2. **README.md** ← Comprehensive guide (15 min)
3. **DEPLOYMENT_GUIDE.md** ← Detailed steps (10 min)
4. **FILE_INDEX.md** ← This file (5 min)

---

## 🎯 Common Tasks

### Deploy latest changes
```bash
git add .
git commit -m "Updated survey"
git push origin main
# Vercel auto-deploys
```

### Reset Firebase data
1. Go to Firebase Console
2. Firestore Database → Collections
3. Select 'surveys' → Delete collection
4. Confirm

### Change admin password
1. Go to Firebase Console
2. Authentication → Users
3. Click user → three dots → Reset password
4. User gets email to reset

### Export all responses
1. Visit: `erikgulbrandsen.com/admin`
2. Click: "Download CSV"
3. Opens in Excel/Sheets

---

## 💡 Pro Tips

- **Version Control**: Make commits often with clear messages
- **Testing**: Always test locally before pushing
- **Backups**: Firebase auto-backs up (check console)
- **Monitoring**: Check Vercel analytics for traffic
- **Scaling**: Firebase free tier handles 1000+ responses
- **Updates**: Keep npm packages updated monthly

---

## 🚀 You're All Set!

You have everything needed to:
1. ✅ Run survey locally
2. ✅ Deploy to production
3. ✅ Manage responses
4. ✅ View analytics
5. ✅ Extend features

**Next Step:** Open `QUICK_START.md` and get started!

---

**Questions?** Check README.md for detailed answers.
**Still stuck?** Look at browser console (F12) for error messages.

Good luck! 🎉
