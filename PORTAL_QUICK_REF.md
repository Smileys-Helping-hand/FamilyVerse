# 🌀 The Portal - Quick Reference

## What is The Portal?

The Portal is Aweh Chat's mini-app launcher - think of it as your phone's home screen, but for launching different experiences within the app.

## Access Methods

1. **Navigation Bar**: Click "✨ Portal" in the header
2. **Dashboard**: Click the featured Portal card
3. **User Menu**: Dropdown → "The Portal ✨"

Direct URL: `/portal`

## Available Apps

### 🎉 The Party OS (Active)
**Where**: `/party/join`
- Sim Racing leaderboards & live timing
- Imposter game with voting system
- Betting pool for races
- TV Mode for big screen display

### 💸 Flash Pay (Beta)
**Where**: `/portal/flash-pay`
- Quick bill calculator
- *Coming Soon*: OCR receipt scanner
- *Coming Soon*: Smart item-by-item split
- *Coming Soon*: WhatsApp payment requests

### 📅 Events (Beta)
**Where**: `/dashboard`
- Family calendar
- RSVP tracking
- Event reminders
- Location sharing

### 🎮 Games Hub (Active)
**Where**: `/dashboard/games`
- Multiplayer games
- Trivia challenges
- Leaderboards
- Reward points

### 👥 Groups (Active)
**Where**: `/dashboard/groups`
- Trip planning
- Shared checklists
- Group recommendations
- Polls and voting

### 🎁 Rewards (Coming Soon)
**Where**: `/portal/rewards`
- Points system
- Achievement badges
- Prize redemption
- Unlockable features

## Status Ring System

Your avatar now shows what you're doing:

| Status | Ring Color | Animation | Meaning |
|--------|-----------|-----------|---------|
| 🟢 Online | Green | Pulsing | Available for chat |
| 🏁 Racing | Checkered | Rotating | In the Sim Rig |
| 🔴 Imposter | Red | Pulsing | Playing Imposter (don't disturb!) |
| 🟣 Party | Purple | Pulsing | In Party Mode |
| ⚫ Offline | Gray | None | Not available |

## Authentication

✅ **Seamless Session**: Once you log into Aweh Chat, you're automatically logged into all Portal apps. No need to sign in again!

The session follows you:
- Dashboard → Portal → Mini-App
- No interruptions
- One logout logs you out everywhere

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Auth**: Firebase Auth (inherited from main app)
- **Styling**: Tailwind CSS with Cape Sunset theme
- **Animation**: Framer Motion
- **Real-time**: Pusher (for Party OS)

## Color Theme: Cape Sunset

```css
Orange: #FF6B35 (Primary - Main actions)
Purple: #9D4EDD (Secondary - Portal background)
Pink: #F72585 (Accent - Highlights)

Dark Background: #0D0F14 (Base)
```

## Cape Town Slang Guide

- **Aweh**: Hello / What's up
- **China**: Friend / Mate
- **Lekker**: Nice / Great / Awesome
- **Sharp sharp**: Okay / Alright / Quick
- **Eish**: Expression of surprise/frustration
- **Howzit**: How are you?
- **Vibe/Vibing**: Hanging out / Good time

## Quick Commands

```bash
# Start dev server
npm run dev

# Access Portal
http://localhost:3000/portal

# Access Flash Pay
http://localhost:3000/portal/flash-pay

# Test Status Ring
1. Go to /party/racing (see checkered ring)
2. Go to /party/imposter (see red ring)
3. Go to /dashboard (see green ring)
```

## Adding Your Own Mini-App

1. Create page: `src/app/portal/my-app/page.tsx`
2. Add to `MINI_APPS` array in `/portal/page.tsx`
3. Set icon, colors, badge, features
4. Test authentication flow

Example:
```typescript
{
  id: 'my-app',
  name: 'My App',
  tagline: 'Short description',
  icon: IconName,
  gradient: 'from-blue-500 via-cyan-500 to-teal-500',
  href: '/portal/my-app',
  badge: 'Beta',
  status: 'active',
}
```

## Troubleshooting

**Portal not showing?**
- Check if logged in (`/login`)
- Ensure `userProfile.familyId` exists
- Check console for errors

**Status ring not updating?**
- Clear browser cache
- Check `useUserStatus()` hook
- Verify route pathname matching

**Mini-app not launching?**
- Check `href` in MINI_APPS array
- Ensure page file exists
- Verify portal layout wraps the route

## Future Features

- [ ] Voice notes with AI transcription
- [ ] @AwehBot command system
- [ ] Live preview widgets in chat
- [ ] Offline-first messaging
- [ ] OCR receipt scanning
- [ ] Full rewards system

---

**Need help?** Check [AWEH_CHAT_GUIDE.md](./AWEH_CHAT_GUIDE.md) for full documentation.

**Aweh, china! Happy vibing! 🤙🔥**
