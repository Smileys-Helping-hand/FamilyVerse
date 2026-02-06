# Firebase Configuration Not Found - Quick Fix

## ⚠️ Error: `auth/configuration-not-found`

This error means your Firebase project configuration is invalid. Here's how to fix it:

## 🚀 Option 1: Create a New Firebase Project (Recommended)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `FamilyVerse` (or your preferred name)
4. Accept terms and click **"Continue"**
5. Disable Google Analytics (optional for development)
6. Click **"Create project"**

### Step 2: Register Web App
1. In your new project, click the **Web icon** (`</>`)
2. Register app name: `FamilyVerse Web`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**
5. **Copy the configuration object** - it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

### Step 3: Update Configuration
1. Open `src/firebase/config.ts` in your project
2. Replace the entire content with:

```typescript
// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Save the file

### Step 4: Enable Authentication
1. In Firebase Console, go to **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Click **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

### Step 5: Enable Firestore
1. Go to **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to you)
5. Click **"Enable"**

### Step 6: Enable Storage
1. Go to **"Build"** → **"Storage"**
2. Click **"Get started"**
3. Start in **"Test mode"**
4. Click **"Next"** → **"Done"**

### Step 7: Test Your App
1. Save all changes
2. Your dev server will auto-reload
3. Try signing up with a test account

---

## 🔧 Option 2: Fix Existing Configuration

If the project exists but configuration is wrong:

### Verify Your Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Find project: `studio-9932200602-d49c4`
3. If project doesn't exist or you don't have access, create a new one (Option 1)

### Get Correct Configuration
1. In your Firebase project, click the **gear icon** ⚙️ → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. If no web app exists:
   - Click the **Web icon** (`</>`) to add one
   - Register the app
4. Copy the `firebaseConfig` object

### Update Your Code
Replace the config in `src/firebase/config.ts` with the correct values from Firebase Console.

---

## 🧪 Quick Test Configuration (Development Only)

If you want to test immediately, you can create a new Firebase project for testing:

1. **Create a test project** named `familyverse-test`
2. **Enable Email/Password auth**
3. **Enable Firestore in test mode**
4. **Copy the config** and update `config.ts`

**Test Firestore Rules** (for development only):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // WARNING: Open to all for testing only!
      allow read, write: if true;
    }
  }
}
```

⚠️ **NEVER use these rules in production!**

---

## ✅ Verification Steps

After updating configuration:

1. ✅ Check Firebase Console shows your project
2. ✅ Web app is registered in Project Settings
3. ✅ Authentication → Email/Password is enabled
4. ✅ Firestore Database is created
5. ✅ Storage is enabled
6. ✅ config.ts has correct values
7. ✅ Browser is refreshed
8. ✅ Try signup again

---

## 🎯 Expected Behavior After Fix

- ✅ Signup form loads without errors
- ✅ Entering email/password submits successfully
- ✅ User is created in Firebase Authentication
- ✅ Toast shows "Account created!"
- ✅ Redirects to /welcome page

---

## 💡 Alternative: Use Firebase Emulator (Advanced)

For local development without internet:

```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start
```

Update config to use emulator:
```typescript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

// In your initialization
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}
```

---

## 🆘 Still Not Working?

Share the error message you see in the toast notification after trying to sign up. The improved error handling will tell us exactly what's wrong!

Common issues:
- Wrong API key
- Project doesn't exist
- Authentication not enabled
- Wrong authDomain
- CORS issues (check authorized domains in Firebase Console)
