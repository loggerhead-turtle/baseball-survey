# Baseball Practice Schedule Survey App

A professional, full-stack survey application for gathering team practice preferences. Built with Next.js, React, Firebase, and deployed on Vercel.

**Live Demo:** erikgulbrandsen.com

---

## Features

### For Athletes 🏟️
- Clean, intuitive survey interface
- Select available times for each day (Mon-Fri)
- Rank preferences with drag-and-drop
- Mark unavailable times
- Rate importance of each preference (1-10 scale)
- Review before submitting
- Mobile-responsive design

### For Coaches/Admins 👨‍💼
- Secure admin dashboard with email/password login
- View individual athlete responses
- See aggregated scoring by day/time
- View custom importance ratings per athlete
- Download all responses as CSV
- Delete responses if needed
- Real-time data updates

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 + React 18 + TypeScript |
| Backend | Firebase (Firestore + Authentication) |
| Hosting | Vercel |
| Domain | erikgulbrandsen.com |

---

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ (download from nodejs.org)
- GitHub account
- Firebase account (free)
- Vercel account (free)

### Step 1: Firebase Setup
1. Go to https://console.firebase.google.com
2. Create new project named `baseball-survey`
3. Enable **Firestore Database** (production mode)
4. Enable **Authentication** → **Email/Password**
5. Get your config from **Project Settings** → **Web App**
6. Copy the 6 config values

### Step 2: Clone & Setup Project
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/baseball-survey.git
cd baseball-survey

# Install dependencies
npm install

# Create .env.local and add your Firebase config
# (See .env.local.example for template)
```

### Step 3: Run Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### Step 4: Deploy to Vercel
1. Push code to GitHub
2. Import repository into Vercel
3. Add environment variables from Step 1
4. Vercel auto-deploys

### Step 5: Connect Custom Domain
1. In Vercel project settings → Domains
2. Add `erikgulbrandsen.com`
3. Follow DNS setup instructions at your registrar
4. Wait 24-48 hours for propagation

---

## Project Structure

```
baseball-survey/
├── app/
│   ├── page.tsx                 # Survey form (athletes)
│   ├── admin/page.tsx           # Admin dashboard
│   ├── layout.tsx               # Root layout
│   └── page.module.css          # Styles
├── lib/
│   └── firebase.ts              # Firebase config & initialization
├── .env.local                   # Your Firebase config (SECRET!)
├── .env.local.example           # Template for .env.local
├── .gitignore                   # Files to exclude from git
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## How It Works

### For Athletes
1. Visit `erikgulbrandsen.com`
2. Enter name
3. For each day (Mon-Fri):
   - Click to select available times
   - Mark unavailable times
   - Drag times to rank them
   - Rate importance (1-10)
4. Review submissions
5. Submit survey

**Data Stored In:**
- Name
- Selected times per day (ranked)
- Unavailable times per day
- Importance rating (1-10) per time

### For Admins
1. Visit `erikgulbrandsen.com/admin`
2. Login with email/password (create account on first visit)
3. **Individual Responses tab:**
   - See each athlete's submissions
   - View their picks, unavailable times, importance ratings
   - Delete responses if needed
4. **Aggregated Results tab:**
   - See total score for each time slot per day
   - Scoring: 1st pick = 5pts, 2nd = 3pts, 3rd+ = 1pt
   - Identifies best practice times
5. **Download CSV** - Export all data for analysis

---

## Scoring System

### Standard Scoring (Results Tab)
- **1st Pick**: 5 points
- **2nd Pick**: 3 points
- **3rd+ Pick**: 1 point

### Example
If 3 athletes have:
- Athlete 1: Monday 5pm (1st pick)
- Athlete 2: Monday 5pm (2nd pick)
- Athlete 3: Monday 7am (1st pick)

Results show:
- **Monday 5pm: 8 points** (5 + 3)
- **Monday 7am: 5 points** (5)

### Importance Ratings
- Separate from scoring
- Each athlete rates importance of their picks 1-10
- Visible in admin dashboard per athlete
- Can be used for deeper analysis

---

## Environment Variables

Create `.env.local` in project root:

```
NEXT_PUBLIC_FIREBASE_API_KEY=ABC123...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=12345...
NEXT_PUBLIC_FIREBASE_APP_ID=1:12345:web:abc123...
```

⚠️ **IMPORTANT:** Never commit `.env.local` to GitHub (already in `.gitignore`)

---

## Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore Database enabled
- [ ] Authentication (Email/Password) enabled
- [ ] Firebase config saved in `.env.local`
- [ ] Code pushed to GitHub
- [ ] Vercel project created and imported
- [ ] Environment variables added to Vercel
- [ ] Domain configured in Vercel
- [ ] DNS records added at domain registrar
- [ ] Testing survey submission
- [ ] Admin dashboard login works

---

## Troubleshooting

### "Firebase config is not defined"
- Check `.env.local` has all 6 values
- Restart dev server: `npm run dev`

### "Firestore: Cannot create new database"
- Go to Firebase Console → Firestore Database
- Click "Create Database" if not exists
- Select "production mode"

### "Authentication failed"
- Verify Email/Password auth enabled in Firebase
- Check email/password are correct
- User must exist in Firebase Authentication

### "Domain not working"
- DNS changes take 24-48 hours
- Verify DNS records in domain registrar
- Check Vercel domain status shows ✅

### "Survey not saving"
- Check browser console for errors
- Verify Firestore is enabled
- Check Firebase rules allow writes

---

## Firebase Firestore Rules

Your current setup uses Firebase defaults (production mode = restricted).

To allow surveys to be created, update Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to create survey responses
    match /surveys/{document=**} {
      allow create;
      allow read: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

---

## Extending the App

### Add New Survey Questions
Edit `app/page.tsx` - update `times` array and form structure

### Customize Scoring
Edit `admin-page.tsx` - update `calculateResults()` function

### Add More Pages
Create new files in `app/` directory (e.g., `app/about/page.tsx`)

### Change Design
Modify inline CSS in `page.tsx` and `admin-page.tsx`

---

## Security Notes

- 🔐 **Passwords**: Stored securely by Firebase Authentication
- 🔐 **API Keys**: Public keys are safe (marked as NEXT_PUBLIC_)
- 🔐 **Data**: All survey data private in Firestore
- 🔐 **Admin**: Protected by email/password authentication
- ✅ **Backups**: Firebase handles automatic backups
- ✅ **HTTPS**: Vercel provides automatic SSL/TLS

---

## Support & Help

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Common Issues
See **Troubleshooting** section above

### Stuck?
1. Check browser console for errors (F12)
2. Check Firebase console for database issues
3. Verify `.env.local` has correct values
4. Restart dev server

---

## License

This project is open source and available under the MIT License.

---

## Support the Creator

Built with ❤️ for team collaboration and scheduling.

Good luck with practice scheduling! ⚾

---

## Changelog

### v1.0.0 (Initial Release)
- ✅ Complete survey form with day-by-day preferences
- ✅ Drag-and-drop ranking
- ✅ Importance rating system
- ✅ Secure admin dashboard
- ✅ Individual response viewing
- ✅ Aggregated scoring results
- ✅ CSV export
- ✅ Firebase integration
- ✅ Vercel deployment ready
- ✅ Mobile responsive design
