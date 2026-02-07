# A Quiet Space - Setup & Deployment Guide

## Overview
A privacy-first, anonymous mental health support platform built with Firebase and vanilla JavaScript. Designed to provide a safe space for expression without therapy, diagnosis, or social pressure.

## Prerequisites
- Firebase account (free tier)
- GitHub account (for GitHub Pages hosting)
- Basic familiarity with Firebase Console
- Text editor

## Part 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "quiet-space")
4. Disable Google Analytics (we don't track users)
5. Click "Create project"

### 1.2 Enable Anonymous Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Anonymous**
3. Toggle **Enable**
4. Click **Save**

### 1.3 Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add our own rules)
4. Select a location (choose closest to your target users)
5. Click **Enable**

### 1.4 Configure Firestore Security Rules

1. In Firestore Database, go to **Rules** tab
2. Copy the contents of `firestore.rules` file
3. Paste into the rules editor
4. Click **Publish**

### 1.5 Create Firestore Indexes

1. In Firestore Database, go to **Indexes** tab
2. Click on **Composite** tab
3. You'll need to create the index when you first run queries
4. Alternatively, use Firebase CLI:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 1.6 Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app (nickname: "quiet-space-web")
5. Copy the `firebaseConfig` object
6. Paste into `config.js`, replacing the placeholder values

Your `config.js` should look like:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "quiet-space-xxxxx.firebaseapp.com",
    projectId: "quiet-space-xxxxx",
    storageBucket: "quiet-space-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## Part 2: Local Testing

### 2.1 Test Locally

Due to Firebase requiring HTTPS, you'll need a local server:

**Option 1: Python**
```bash
# Python 3
python -m http.server 8000

# Then visit: http://localhost:8000
```

**Option 2: Node.js**
```bash
# Install http-server globally
npm install -g http-server

# Run
http-server

# Then visit: http://localhost:8080
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` > "Open with Live Server"

### 2.2 Test Functionality

1. **Anonymous Auth**: Should auto-login on load
2. **State Selection**: Choose an emotional state
3. **Write Fragment**: Submit a test message
4. **Read Fragments**: Verify it appears in the read section
5. **Safety Filter**: Try submitting content with numbers + "pills" (should block)

## Part 3: GitHub Pages Deployment

### 3.1 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **New repository**
3. Name it: `quiet-space` (or your preferred name)
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README
6. Click **Create repository**

### 3.2 Push Code to GitHub

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quiet-space.git
git push -u origin main
```

### 3.3 Enable GitHub Pages

1. In your GitHub repository, go to **Settings**
2. Scroll to **Pages** section (left sidebar)
3. Under "Source", select **Deploy from a branch**
4. Select branch: **main** and folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes for deployment

Your site will be available at:
```
https://YOUR_USERNAME.github.io/quiet-space/
```

### 3.4 Add Domain to Firebase (Optional)

1. In Firebase Console, go to **Authentication** > **Settings**
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Add: `YOUR_USERNAME.github.io`
5. Click **Add**

## Part 4: Firestore Free Tier Limits

The Firebase free (Spark) plan includes:

**Firestore:**
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

**Authentication:**
- Unlimited anonymous users

**Hosting:**
- 10 GB storage
- 360 MB/day transfer

**Estimated Capacity:**
This supports approximately:
- ~2,000 fragment submissions per day
- ~25,000 fragment reads per day
- Sufficient for small-to-medium community

**Monitoring:**
Check usage: Firebase Console > **Usage and billing**

## Part 5: Optional Enhancements

### 5.1 Custom Domain (Optional)

1. Purchase domain (e.g., from Namecheap, Google Domains)
2. In GitHub repository **Settings** > **Pages**
3. Enter custom domain
4. Update DNS records:
   - Add CNAME record pointing to `YOUR_USERNAME.github.io`
5. Enable **Enforce HTTPS**

### 5.2 Content Moderation (Future)

For automated moderation, create a Cloud Function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.moderateFragment = functions.firestore
    .document('fragments/{fragmentId}')
    .onCreate(async (snap, context) => {
        const fragment = snap.data();
        
        // Add your moderation logic
        // Use external API like Perspective API or custom rules
        
        if (/* fragment is harmful */) {
            await snap.ref.update({ flagged: true });
        }
    });
```

Deploy:
```bash
firebase deploy --only functions
```

### 5.3 Backup Strategy

**Automated Firestore Exports:**
1. Firebase Console > **Firestore Database** > **Import/Export**
2. Set up scheduled exports to Cloud Storage
3. Free tier includes 5 GB Cloud Storage

**Manual Backup:**
Use Firebase CLI:
```bash
firebase firestore:export gs://YOUR_BUCKET/backups
```

## Part 6: Maintenance

### Monitor Daily
- Check Firebase Console for errors
- Monitor Firestore usage
- Review flagged content manually

### Weekly
- Review fragment submissions for patterns
- Check for spam or abuse
- Update mirror messages if needed

### Monthly
- Review usage metrics
- Consider scaling needs
- Update safety filters based on patterns

## Part 7: Troubleshooting

**Problem: "Permission denied" when submitting**
- Check Firestore rules are deployed
- Verify anonymous auth is enabled
- Check browser console for specific errors

**Problem: Fragments not appearing**
- Check Firestore indexes are created
- Verify `flagged: false` in query
- Check browser console for errors

**Problem: "Unable to connect"**
- Verify Firebase config is correct
- Check if Firebase services are enabled
- Ensure HTTPS is used (required by Firebase)

**Problem: Exceeded free tier**
- Monitor usage in Firebase Console
- Implement rate limiting in security rules
- Consider upgrading to Blaze (pay-as-you-go)

## Part 8: Privacy & Legal

### Privacy Considerations
- No IP logging (Firebase Auth handles this)
- No personal data collected
- No cookies beyond Firebase session
- No third-party analytics

### Recommended: Add Privacy Policy Page
Create `privacy.html` with:
- What data is collected (only fragment text)
- How it's used (display to others)
- Data retention policy
- User rights
- Contact information

### Recommended: Add Terms of Service
Create `terms.html` with:
- Acceptable use policy
- Prohibited content
- Disclaimer of liability
- Age requirements (13+ for Firebase)

## Part 9: Cost Optimization

### Stay Within Free Tier
1. Implement client-side caching
2. Limit fragment loads per session
3. Use compound queries efficiently
4. Set reasonable pagination limits

### If Exceeding Free Tier
1. Upgrade to Blaze plan (pay-as-you-go)
2. Set budget alerts
3. Implement stricter rate limits
4. Consider alternative hosting (self-hosted)

## Support

For issues with:
- **Firebase**: [Firebase Support](https://firebase.google.com/support)
- **GitHub Pages**: [GitHub Docs](https://docs.github.com/en/pages)
- **This Project**: Create issues in your GitHub repository

## Ethical Reminders

This platform is designed to **support**, not replace professional help:
- Never provide medical advice
- Always include crisis resources
- Monitor for harmful content
- Respect user anonymity
- Prioritize safety over engagement

---

**Remember**: The goal is to create a quiet, safe space. Resist the urge to add features that increase engagement at the cost of the core mission.
