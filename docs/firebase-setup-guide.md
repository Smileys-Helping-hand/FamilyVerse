# Firebase Authentication Setup Guide

## ⚠️ Common Signup Error: 400 Bad Request

If you're seeing this error:
```
identitytoolkit.googleapis.com/v1/accounts:signUp?key=... Failed to load resource: the server responded with a status of 400
```

This typically means **Email/Password authentication is not enabled in your Firebase console**.

## 🔧 How to Fix

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-9932200602-d49c4`

### Step 2: Enable Email/Password Authentication
1. In the left sidebar, click **"Authentication"**
2. Click the **"Sign-in method"** tab
3. Find **"Email/Password"** in the providers list
4. Click on it to open settings
5. Toggle **"Enable"** to ON
6. Click **"Save"**

### Step 3: (Optional) Configure Settings
1. **Password policy**: Set minimum requirements
2. **Email enumeration protection**: Enable for security
3. **Authorized domains**: Add your deployment domain

### Step 4: Set up Firestore Rules
1. Go to **"Firestore Database"** in the sidebar
2. Click the **"Rules"** tab
3. Update rules to allow authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Families collection
    match /families/{familyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Family members collection
    match /familyMembers/{memberId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Parental controls collections
    match /parentalControls/{controlId} {
      allow read, write: if request.auth != null;
    }
    
    match /childProfiles/{childId} {
      allow read, write: if request.auth != null;
    }
    
    match /contentPolicies/{policyId} {
      allow read, write: if request.auth != null;
    }
    
    match /screenTimeRules/{ruleId} {
      allow read, write: if request.auth != null;
    }
    
    match /activityReports/{reportId} {
      allow read, write: if request.auth != null;
    }
    
    // Activity logs
    match /activityLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

### Step 5: Enable Firestore Database (if not already)
1. Go to **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your preferred location
5. Click **"Enable"**

### Step 6: Enable Firebase Storage (for profile photos)
1. Go to **"Storage"** in the sidebar
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Select a location
5. Click **"Done"**

## 🧪 Testing the Fix

1. **Refresh your browser** to clear any cached errors
2. Try signing up with a new account:
   - Email: test@example.com
   - Password: test123 (minimum 6 characters)
   - Name: Test User

3. If successful, you should see:
   - ✅ "Account created!" toast message
   - Redirect to `/welcome` page

4. Check Firebase Console → Authentication → Users
   - Your test user should appear in the list

## 🔍 Troubleshooting

### Still Getting 400 Error?

1. **Check Browser Console** for detailed error:
   ```javascript
   console.log('Full error:', error.code, error.message);
   ```

2. **Common Error Codes**:
   - `auth/operation-not-allowed` → Email/password not enabled
   - `auth/email-already-in-use` → User already exists
   - `auth/invalid-email` → Email format is invalid
   - `auth/weak-password` → Password too short (< 6 chars)

3. **Verify Firebase Config**:
   - Check `src/firebase/config.ts`
   - Ensure API key matches Firebase Console

4. **Check Network Tab**:
   - Look for the actual error response
   - It will show the specific reason for rejection

### API Key Issues?

If the API key is incorrect or restricted:

1. Go to Firebase Console → Project Settings
2. Copy the correct **Web API Key**
3. Update `src/firebase/config.ts`:
   ```typescript
   export const firebaseConfig = {
     apiKey: "YOUR_CORRECT_API_KEY_HERE",
     // ... rest of config
   };
   ```

### Testing with Development Mode

For testing, you can use these Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 2, 1);
    }
  }
}
```
⚠️ **WARNING**: These rules allow anyone to read/write. Only use for development!

## ✅ Verification Checklist

- [ ] Email/Password authentication enabled in Firebase Console
- [ ] Firestore database created and rules configured
- [ ] Storage enabled (for profile photos)
- [ ] Firebase config in code matches console
- [ ] Browser refreshed after changes
- [ ] Test signup with new email works
- [ ] User appears in Authentication → Users tab

## 🚀 Next Steps After Setup

1. **Create a family** on the welcome page
2. **Add family members** to your tree
3. **Set up parental controls** for children
4. **Explore the dashboard** features

## 💡 Pro Tips

- Use **test accounts** during development (test1@example.com, test2@example.com, etc.)
- Enable **Email link authentication** for passwordless login
- Set up **Multi-factor authentication** for production
- Configure **custom email templates** for better branding
- Monitor **Authentication usage** in Firebase Console

## 📞 Still Having Issues?

The improved error handling will now show specific error messages in the toast notifications. Check:

1. Browser DevTools Console for detailed logs
2. Firebase Console → Authentication → Settings for any restrictions
3. Network tab for the actual API response

Your signup should now work perfectly! 🎉
