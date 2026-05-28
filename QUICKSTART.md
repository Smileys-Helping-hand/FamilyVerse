# FamilyVerse Implementation - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create/update `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@familyverse.app
ENCRYPTION_KEY=your-strong-encryption-key-here-min-32-chars
```

**Get Resend Key**: https://resend.com → API Keys

### Step 3: Run Database Migrations
```bash
npm run db:generate  # Creates migration files
npm run db:push      # Applies to your Neon database
```

---

## 🎨 Integration (Copy-Paste Ready)

### Add to Event Detail Page
**File**: `src/app/events/[id]/page.tsx`

```tsx
// Add these imports at top
import { CommentForm } from '@/components/events/CommentForm';
import { EventCommentCard } from '@/components/events/EventCommentCard';
import { AttendeeDetailsPanel } from '@/components/events/AttendeeDetailsPanel';
import { getEventComments } from '@/lib/db/event-comments';

// In your component function, add:
const { comments } = await getEventComments(eventId);

// Add this JSX where you want comments to appear:
<div className="space-y-8 mt-8">
  {/* Attendees Panel */}
  <AttendeeDetailsPanel eventId={eventId} attendees={attendees} />

  {/* Comments Section */}
  <div className="border-t pt-8">
    <h2 className="text-2xl font-bold mb-6">Event Discussion</h2>
    <CommentForm eventId={eventId} />
    
    <div className="mt-6 space-y-4">
      {comments.map((comment) => (
        <EventCommentCard
          key={comment.id}
          comment={comment}
          isCreator={creatorId === userId}
          currentUserId={userId}
        />
      ))}
    </div>
  </div>
</div>
```

### Add Settings Link
**File**: `src/components/layout/Header.tsx` or your nav menu

```tsx
<Link href="/settings/connections" className="block px-4 py-2 text-sm text-gray-700">
  🔗 Connected Apps
</Link>
```

---

## 🧪 Test It Out

### Test 1: App Integrations
1. Go to `http://localhost:3000/settings/connections`
2. Click "Add Integration"
3. Select "LifeStack" or "Nexus OS"
4. Enter fake API key: `test_key_123`
5. Click "Add Integration"
6. ✅ Should see integration card with status

### Test 2: Event Comments
1. Go to any event detail page
2. Scroll to comments section
3. Write a test comment as logged-in user
4. ✅ Should appear immediately (auto-approved)
5. Click like button
6. ✅ Like count should increment

### Test 3: Anonymous Comments
1. Open comments section in incognito/private mode
2. Post a comment as anonymous
3. ✅ Comment appears with "Pending approval" badge
4. As event creator, click "Approve"
5. ✅ Comment becomes public

### Test 4: Attendee Details
1. On event page, see attendee panel
2. Click different RSVP filters
3. Export CSV button
4. ✅ Downloads attendee list

---

## 📧 Test Email

### Using Resend (Production-Ready)
```tsx
import { sendEventInvitation } from '@/lib/email';

await sendEventInvitation(
  'someone@example.com',
  'John Doe',
  'Family Dinner',
  new Date('2026-06-15 7:00 PM'),
  'Join us for a special family gathering!',
  'https://yourapp.com/rsvp/token123',
  'Sarah Smith'
);
```

---

## 🔧 Troubleshooting

### "Encryption key not found"
**Fix**: Add `ENCRYPTION_KEY` to `.env.local`

### "Resend API key invalid"
**Fix**: Verify key starts with `re_` and is in `.env.local`

### "Migration failed"
**Fix**: Check Neon connection string, run `npm run db:push` again

### Comments not showing
**Fix**: Reload page, check browser console for errors, verify `isApproved` status

### API endpoints return 401
**Fix**: Ensure cookies from Firebase auth are being sent, check user ID in logs

---

## 📚 Documentation

Full documentation in: `IMPLEMENTATION_SUMMARY.md`

---

## 🚀 Deployment Checklist

- [ ] Environment variables set on production
- [ ] Database migrations applied
- [ ] Components integrated into event pages
- [ ] Navigation link added
- [ ] Email templates tested with real recipients
- [ ] Comments tested (public & anonymous)
- [ ] Integrations tested (create, test, revoke)
- [ ] Attendee export tested
- [ ] Mobile responsiveness verified
- [ ] Security review completed

---

## 💡 Quick Features Reference

### Comments API
```bash
# Create comment
curl -X POST http://localhost:3000/api/events/{eventId}/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"Great event!","isAnonymous":false}'

# Like comment
curl -X POST http://localhost:3000/api/events/{eventId}/comments/{commentId}/like

# Get comments
curl http://localhost:3000/api/events/{eventId}/comments?limit=50
```

### Integration API
```bash
# Create integration
curl -X POST http://localhost:3000/api/integrations \
  -H "Content-Type: application/json" \
  -d '{
    "appId":"LIFESTACK",
    "appName":"My Account",
    "credentials":"sk_live_xxx"
  }'

# List integrations
curl http://localhost:3000/api/integrations

# Test integration
curl -X POST http://localhost:3000/api/integrations/{id}/test
```

---

## 🎯 What You Get

✅ Event comments (public + anonymous)
✅ Comment likes & replies
✅ Attendee details with dietary/transport info
✅ API key management (LifeStack, Nexus OS, custom)
✅ Encrypted credential storage
✅ Integration audit logs
✅ Claude Auth cross-device support
✅ Email invitations via Resend
✅ CSV export of attendees

---

## 📞 Support

All code is ready to use. If issues arise:
1. Check `.env.local` variables
2. Verify database migration completed
3. Check browser console for client-side errors
4. Check server logs for API errors
5. Ensure cookies are being sent with requests

---

**Status**: ✅ Ready to Integrate & Deploy
**Time to production**: ~15 minutes
**Questions**: See `IMPLEMENTATION_SUMMARY.md` for detailed docs

Happy shipping! 🚀
