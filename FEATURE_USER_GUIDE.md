# FamilyVerse Feature User Guide

Complete guide showing how to use every feature that was just implemented.

---

## 📚 Table of Contents

1. [Event Comments System](#event-comments)
2. [App Integrations](#app-integrations)
3. [Attendee Management](#attendee-management)
4. [Claude Authentication](#claude-auth)
5. [Email Invitations](#email-invitations)
6. [API Reference](#api-reference)

---

## 🗨️ Event Comments

### For Users - Posting Comments

**How to post a comment on an event:**

1. Go to any event detail page
2. Scroll to "Event Discussion" section
3. Click the comment box and type your message
4. Choose: "Post as registered user" (recommended) or "Post anonymously"
5. Click "Post Comment"

**What happens next:**
- ✅ If you're logged in: Comment appears immediately (auto-approved)
- ⏳ If anonymous: Comment waits for event creator approval (shows "Pending")

### For Event Creators - Managing Comments

**Moderating anonymous comments:**

1. Go to your event detail page
2. Look for comments with "Pending approval" badge
3. Click the green "✓ Approve" button to make public
4. Click the red trash icon "🗑️" to delete

**Interacting with comments:**

- Like a comment: Click the ❤️ heart icon (shows total likes)
- Reply to a comment: Click "Reply" button
- Delete your own comment: Click the trash icon

### Comment Features

```
┌─────────────────────────────────────┐
│  John Doe       [Auto-Approved ✓]   │
│  2 hours ago                        │
│                                     │
│  This is a great event! Looking     │
│  forward to it.                     │
│                                     │
│  ❤️ 5 likes  💬 Reply  🗑️ Delete   │
└─────────────────────────────────────┘

Anonymous User  [Pending Approval]
1 hour ago

Can we add vegetarian food?

✓ Approve  💬 Reply  🗑️ Delete
```

---

## 🔗 App Integrations

### For Users - Connecting Apps

**Steps to connect an external app:**

1. Go to **Settings → Connected Apps** (`/settings/connections`)
2. Click **"Add Integration"** button
3. Select app type from dropdown:
   - 🔗 **LifeStack** - Family updates & connections
   - 🌐 **Nexus OS** - Unified family management
   - ⚙️ **Custom API** - Any custom API

4. Fill in the form:
   - **App Name**: Give it a display name (e.g., "My LifeStack Account")
   - **API Key**: Paste your API key (never shown in logs)
   - **Configuration** (optional): Add JSON config

5. Click **"Add Integration"**

### Managing Your Integrations

**Your Connected Apps Dashboard shows:**

```
┌────────────────────────────────────────┐
│ App Name:  LifeStack                  │
│ Status:    🟢 ACTIVE                  │
│ App ID:    LIFESTACK                  │
│ Last Used: 2 hours ago                │
│ Expires:   June 15, 2026              │
│                                       │
│ [Test Connection]  [❌ Revoke]        │
└────────────────────────────────────────┘
```

**Test Connection:**
- Tests if your API credentials are still valid
- Updates "Last Used" timestamp
- Shows any connection errors

**Revoke:**
- Disconnects the app immediately
- You can reconnect later
- Access is removed from that service

### What Gets Stored?

✅ **Encrypted**:
- API keys
- Access tokens
- Credentials

❌ **Never Stored**:
- Passwords
- Plaintext logs
- Unencrypted secrets

---

## 👥 Attendee Management

### For Event Creators - Viewing Attendee Details

**Access attendee information:**

1. Open your event detail page
2. Look for **"Attendees"** panel (usually top-right)
3. See breakdown:
   - 🟢 **Going**: Confirmed attendees
   - 🟡 **Maybe**: Undecided attendees
   - 🔵 **Pending**: Haven't responded
   - 🔴 **Can't Make**: Not attending

### Attendee Details Panel

```
Attendees (24)

┌──────────────┬──────────┬──────────┬─────────┐
│ 15 Going     │ 5 Maybe  │ 3 Pend   │ 1 Cant  │
└──────────────┴──────────┴──────────┴─────────┘

Plus Ones: 8 additional guests
Dietary Restrictions: 6 attendees
Transport Needed: 3 attendees

[Filter: ALL] [GOING] [MAYBE] [PENDING] [CANT MAKE] [📥 Export]

┌─────────────────────────────────────────┐
│ Sarah Smith                             │
│ 🍽️  Gluten-free, vegetarian            │
│ 🚗 Transport needed                    │
│ +2 guests                              │
│                    [GOING]              │
└─────────────────────────────────────────┘
```

### Export Attendees

**Download attendee list as CSV:**

1. Click **"📥 Export"** button
2. File downloads: `event-{id}-attendees.csv`
3. Open in Excel/Sheets
4. Contains: Names, RSVP status, dietary info, transport needs, special requests

**CSV columns:**
- Name
- RSVP Status
- Plus Ones
- Dietary Notes
- Needs Transport
- Special Needs

---

## 🔐 Claude Authentication

### Cross-Device Login Setup

**Enable on first login:**

1. Log in to FamilyVerse
2. Go to **Settings → Auth Devices**
3. Click **"Link Claude Auth"**
4. Confirm your identity
5. Get a device code

**On another device:**

1. Visit FamilyVerse
2. Select "Login with Claude Auth"
3. Enter device code
4. ✅ Authenticated across devices

### Manage Your Devices

**View all logged-in devices:**

1. Go to **Settings → Auth Devices**
2. See all devices:
   - Device name/type (iPhone, MacBook, etc.)
   - When last active
   - When connected

**Remote logout:**

1. Find device in list
2. Click **"🚪 Logout"** button
3. Device is logged out immediately
4. Can sign back in with password

**Logout everywhere:**

1. Click **"Logout All Devices"**
2. All active sessions end
3. Must re-authenticate on all devices

---

## 📧 Email Invitations

### Sending Event Invitations

**Via FamilyVerse:**

1. Create event
2. Click "Send Invitations"
3. Enter guest emails
4. Optional: Custom message
5. Click "Send"

**Guests receive:**

```
╔════════════════════════════════════════╗
║                                        ║
║   You're Invited!                      ║
║   Sarah Smith invited you to an event  ║
║                                        ║
╠════════════════════════════════════════╣
║                                        ║
║   Family Dinner Party                  ║
║                                        ║
║   📅 Sunday, June 15, 2026 at 7:00 PM │
║                                        ║
║   Join us for a special family         │
║   gathering at our home.               │
║                                        ║
║  [Respond to Invitation]               │
║                                        ║
╚════════════════════════════════════════╝
```

### Guest Experience

**Guest clicks invitation link:**

1. Opens magic link (no login required)
2. Sees event details
3. Can select: "Going" / "Maybe" / "Can't Make"
4. Optional: Add dietary preferences, special needs
5. Can leave comments

**Guest gets reminder:**

If they haven't responded in 2 days:

```
Friendly Reminder!

We haven't heard from you yet about 
Family Dinner Party on Sun, Jun 15 at 7:00 PM

Please let us know if you can make it!

[Respond Now]
```

---

## 🔌 API Reference

### Authentication

All API calls require Firebase auth cookies:
```
Cookie: firebase-auth-uid=user123
Cookie: firebase-auth-email=user@example.com
```

### Comments API

#### Create Comment
```bash
curl -X POST http://localhost:3000/api/events/{eventId}/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great event!",
    "isAnonymous": false
  }'
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": "uuid",
    "eventId": "uuid",
    "userName": "John Doe",
    "content": "Great event!",
    "isAnonymous": false,
    "isApproved": true,
    "likesCount": 0,
    "createdAt": "2026-05-28T10:00:00Z"
  }
}
```

#### Get Comments
```bash
curl http://localhost:3000/api/events/{eventId}/comments?limit=50
```

#### Like Comment
```bash
curl -X POST http://localhost:3000/api/events/{eventId}/comments/{commentId}/like
```

#### Approve Comment (Creator Only)
```bash
curl -X POST http://localhost:3000/api/events/{eventId}/comments/{commentId}/approve
```

#### Delete Comment
```bash
curl -X DELETE http://localhost:3000/api/events/{eventId}/comments/{commentId}
```

---

### Integrations API

#### List Integrations
```bash
curl http://localhost:3000/api/integrations
```

**Response:**
```json
{
  "success": true,
  "integrations": [
    {
      "id": "uuid",
      "userId": "user123",
      "appId": "LIFESTACK",
      "appName": "My LifeStack",
      "status": "ACTIVE",
      "lastUsedAt": "2026-05-28T10:00:00Z",
      "createdAt": "2026-05-20T00:00:00Z"
    }
  ]
}
```

#### Create Integration
```bash
curl -X POST http://localhost:3000/api/integrations \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "LIFESTACK",
    "appName": "My LifeStack Account",
    "credentials": "sk_live_xxx",
    "metadata": {
      "webhook_url": "https://example.com/webhook"
    }
  }'
```

#### Test Integration
```bash
curl -X POST http://localhost:3000/api/integrations/{id}/test
```

#### Revoke Integration
```bash
curl -X DELETE http://localhost:3000/api/integrations/{id}
```

---

### Claude Auth API

#### Link Claude Auth
```bash
curl -X POST http://localhost:3000/api/auth/claude/link \
  -H "Content-Type: application/json" \
  -d '{
    "claudeAuthId": "claude_user_123"
  }'
```

#### Get Active Sessions
```bash
curl http://localhost:3000/api/auth/claude/sessions
```

#### Logout Device
```bash
curl -X POST http://localhost:3000/api/auth/claude/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "logout-device",
    "sessionId": "session_uuid"
  }'
```

#### Logout All
```bash
curl -X POST http://localhost:3000/api/auth/claude/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "logout-all"
  }'
```

---

## 🎨 UI Component Usage

### In Your React Components

#### EventCommentCard
```tsx
import { EventCommentCard } from '@/components/events/EventCommentCard';

<EventCommentCard
  comment={comment}
  onLike={(id) => likeComment(id)}
  onDelete={(id) => deleteComment(id)}
  onApprove={(id) => approveComment(id)}
  isCreator={userId === eventCreatorId}
  currentUserId={userId}
/>
```

#### CommentForm
```tsx
import { CommentForm } from '@/components/events/CommentForm';

<CommentForm
  eventId={eventId}
  onCommentSubmitted={() => reloadComments()}
  isAuthenticated={!!userId}
/>
```

#### AttendeeDetailsPanel
```tsx
import { AttendeeDetailsPanel } from '@/components/events/AttendeeDetailsPanel';

<AttendeeDetailsPanel
  eventId={eventId}
  attendees={attendees}
/>
```

#### AppIntegrationCard
```tsx
import { AppIntegrationCard } from '@/components/integrations/AppIntegrationCard';

<AppIntegrationCard
  integration={integration}
  onRevoke={(id) => revokeIntegration(id)}
  onTest={(id) => testIntegration(id)}
/>
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Email (Resend)
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@familyverse.app

# Encryption
ENCRYPTION_KEY=your-secret-key-min-32-chars

# Database (already configured)
DATABASE_URL=postgresql://...
```

### Feature Flags

All features are enabled by default. No flags needed.

---

## 🆘 Troubleshooting

### Comments Not Showing

**Problem**: Posted a comment but it doesn't appear

**Solutions**:
- ✅ If anonymous: Wait for event creator to approve
- ✅ Refresh the page (Ctrl+R)
- ✅ Check browser console for errors
- ✅ Ensure you're logged in for auto-approval

### Integration Test Fails

**Problem**: "Test failed" error

**Solutions**:
- ✅ Verify API key is correct
- ✅ Check if API key has expired
- ✅ Ensure server can reach external API
- ✅ Check browser console for error details

### Email Not Received

**Problem**: Guests didn't receive invitation

**Solutions**:
- ✅ Verify `RESEND_API_KEY` is set
- ✅ Check email address is correct
- ✅ Check spam folder
- ✅ Use test email first (resend provides test emails)

### Comments Disappear After Logout

**Problem**: Comments from other users gone after logout

**Solutions**:
- ✅ This shouldn't happen (check console for errors)
- ✅ Try hard refresh (Ctrl+Shift+R)
- ✅ Clear browser cache
- ✅ Report as bug with screenshot

---

## 📱 Mobile Responsiveness

All components are mobile-optimized:

✅ Comments work on touch devices
✅ Attendee panel is responsive
✅ Integration cards stack on mobile
✅ Settings page is mobile-friendly
✅ Email invitations render on all devices

---

## 🔒 Security & Privacy

### What's Encrypted?
- API keys for integrations
- Session tokens
- All stored credentials

### What's Never Logged?
- API credentials
- User passwords
- Private comments
- Dietary information (unless explicitly shared)

### What's Deleted When?
- Revoked integrations: Immediately deactivated
- Logged out sessions: Immediately terminated
- Deleted comments: Immediately removed
- Expired auth: Auto-cleaned after expiration

---

## 💡 Pro Tips

1. **Comment Management**: Sort by "Going" to see attendees you need responses from
2. **Multiple Integrations**: Connect multiple accounts for same app (personal + work)
3. **Quick Export**: Export attendees 1 day before event for final headcount
4. **Test Integrations**: Use test endpoint before sending real data
5. **Email Customization**: Modify email templates in `src/lib/email.ts`

---

**Last Updated**: May 28, 2026
**Status**: ✅ Complete & Tested
