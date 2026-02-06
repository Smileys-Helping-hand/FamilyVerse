# Aweh Chat - Super App Implementation Guide

## 🎉 What We Built

Your app has been transformed from FamilyVerse into **Aweh Chat** - a South African-themed Super App with The Portal gateway system!

---

## ✨ Phase 1: Core Messaging Refinement (COMPLETE)

### Rebranding
- **App Name**: Changed from "FamilyVerse" to "Aweh Chat"
- **Tagline**: "The Super App for your squad - Chat, Portal, and vibes 🔥"
- **Logo**: Updated to Sparkles icon with orange gradient
- **Color Palette**: Cape Sunset theme (Vibrant Oranges/Purples/Pinks)
- **Default Mode**: Dark mode by default

### Color Scheme (globals.css)
```css
Primary: Orange (20° hue, 95% saturation, 55% lightness)
Secondary: Purple (280° hue, 85% saturation, 60% lightness)
Accent: Pink (330° hue, 90% saturation, 60% lightness)
Background: Dark slate (240° hue, 10% saturation, 5% lightness)
```

### SA Slang Integration
- Dashboard greeting: "Howzit, [Name]! 🤙"
- Family reference: "Vibing with [Family] squad"
- Portal description: "Your gateway to all the lekker features"
- Logout toast: "Sharp sharp! 👋 Catch you later, china!"
- Error toasts: "Eish! 😅"

---

## 🌀 Phase 2: The Portal (COMPLETE)

### Main Portal Dashboard (`/portal`)
**Location**: `src/app/portal/page.tsx`

**Features**:
- Full-screen gradient background (slate → purple → orange)
- Animated pulsing background orbs
- 6 mini-app cards in responsive grid
- Stats bar showing Points, Events, Family, Status
- Auto-authenticated (inherits from main app session)

### Mini-Apps Available

#### 1. **The Party OS** 🎉
- **Status**: Active
- **Link**: `/party/join`
- **Features**: Sim Racing, Imposter, Betting Pool, TV Mode
- **Colors**: Purple → Pink → Rose gradient

#### 2. **Flash Pay** 💸
- **Status**: Beta (Calculator only)
- **Link**: `/portal/flash-pay`
- **Features**: Manual bill splitter, OCR coming soon
- **Colors**: Green → Emerald → Teal gradient

#### 3. **Events** 📅
- **Status**: Beta
- **Link**: `/dashboard` (placeholder)
- **Features**: Calendar, RSVPs, Reminders, Location sharing
- **Colors**: Blue → Cyan → Sky gradient

#### 4. **Games Hub** 🎮
- **Status**: Active
- **Link**: `/dashboard/games`
- **Features**: Multiplayer games, trivia, leaderboards, rewards
- **Colors**: Orange → Amber → Yellow gradient

#### 5. **Groups** 👥
- **Status**: Active
- **Link**: `/dashboard/groups`
- **Features**: Trip planner, checklists, recommendations, polls
- **Colors**: Violet → Purple → Fuchsia gradient

#### 6. **Rewards** 🎁
- **Status**: Coming Soon
- **Link**: `/portal/rewards`
- **Features**: Points, achievements, prizes, unlockables
- **Colors**: Pink → Rose → Red gradient

### Flash Pay App (`/portal/flash-pay`)
**Location**: `src/app/portal/flash-pay/page.tsx`

**Current Features**:
- Manual calculator (Total Bill ÷ Number of People)
- Live split calculation display
- Coming Soon banners for OCR scanner

**Planned Features**:
- 📸 OCR receipt scanning (snap photo, AI extracts items)
- 👥 Smart split (assign items to specific people)
- 💸 Payment requests (send via WhatsApp)

---

## 🎯 Phase 3: Status Ring System (COMPLETE)

### Status Ring Avatar Component
**Location**: `src/components/ui/status-ring-avatar.tsx`

**Auto-Detection Logic**:
```typescript
/party/racing OR /party/tv → Status: "racing" (Checkered ring, yellow glow)
/party/imposter → Status: "imposter" (Red ring, pulsing, "Don't disturb!")
/party/* → Status: "party" (Purple ring, party mode)
Default → Status: "online" (Green ring, available)
```

**Ring Styles**:
- **Online**: Green ring, pulsing, "Online & Chatting"
- **Racing**: Checkered pattern ring, yellow glow, rotating animation
- **Imposter**: Red ring, pulsing, danger indicator
- **Party**: Purple ring, pulsing, party indicator
- **Offline**: Gray ring, no animation

**Sizes**: `sm`, `md`, `lg`, `xl`

### Integration Points
1. **UserNav Dropdown**: Top-right avatar now shows live status
2. **Auto-Updates**: Status changes based on current page route
3. **Hover Tooltip**: Displays current status label

---

## 🚀 How to Use

### Accessing The Portal
1. Click "✨ Portal" in the main navigation
2. Or click The Portal card on the dashboard
3. Or dropdown → "The Portal ✨"

### Launching Mini-Apps
1. Navigate to `/portal`
2. Click "Launch App" on any active mini-app card
3. Session automatically passed (no re-login needed)

### Testing Status Ring
1. Go to `/party/racing` → Avatar shows checkered ring
2. Go to `/party/imposter` → Avatar shows red ring
3. Go to `/dashboard` → Avatar shows green ring (online)
4. Hover over avatar → See status tooltip

---

## 🎨 Design System

### Color Usage
- **Orange (Primary)**: Main actions, Portal branding
- **Purple (Secondary)**: Party features, portal background
- **Pink (Accent)**: Highlights, hover states
- **Green**: Success, online status, Flash Pay
- **Red**: Imposter mode, errors
- **Yellow**: Racing mode, warnings

### Gradients
All cards use 3-color gradients:
```tsx
from-[color1] via-[color2] to-[color3]
```

### Animations
- Pulsing background orbs: 3 layers, staggered delays
- Status rings: Pulse on online/party/imposter
- Checkered ring: Slow rotation (racing mode)
- Card hover: Scale 110%, shadow glow, translate -8px

---

## 📂 File Structure

```
src/
├── app/
│   ├── layout.tsx (Updated metadata: "Aweh Chat")
│   ├── portal/
│   │   ├── layout.tsx (Auth guard, auto-redirect)
│   │   ├── page.tsx (Main Portal dashboard)
│   │   └── flash-pay/
│   │       └── page.tsx (Bill splitter)
│   └── dashboard/
│       └── page.tsx (Added Portal featured card)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx (Updated branding, added Portal nav)
│   │   └── UserNav.tsx (Status Ring integration)
│   └── ui/
│       └── status-ring-avatar.tsx (Status Ring system)
│
└── app/
    └── globals.css (Cape Sunset color theme)
```

---

## 🔐 Authentication Flow

The Portal uses seamless auth inheritance:

```typescript
1. User logs into Aweh Chat
2. AuthProvider wraps entire app
3. Portal layout checks userProfile.familyId
4. If authenticated → Show Portal
5. If not → Redirect to /login
6. Session persists across all mini-apps
```

**No re-authentication needed** when switching between:
- Dashboard ↔ Portal
- Portal ↔ Party OS
- Portal ↔ Flash Pay
- Portal ↔ Any mini-app

---

## 🎮 Next Steps (Phase 4 & Beyond)

### Pending Features

#### Voice Notes with Transcription
**Location**: TBD (likely `src/components/chat/VoiceNoteRecorder.tsx`)
- Record audio messages (Web Audio API)
- Upload to Firebase Storage
- Send to Gemini Flash for transcription
- Display both audio + text in chat

#### Context-Aware Sidebar
**Location**: TBD (likely `src/components/chat/ChatSidebar.tsx`)
- Live widget previews for shared links
- Betting integration (system messages)
- @AwehBot command parser

#### Performance Optimizations
- TanStack Query with persistence
- Offline-first messaging
- Lazy loading for Portal apps
- Service Worker for offline support

#### Additional Mini-Apps
- **Scannables**: QR code check-ins (already exists at `/admin/qr-studio`)
- **Split Pay**: Full OCR receipt scanner
- **Event RSVP**: Calendar integration
- **Rewards**: Points and achievements system

---

## 🐛 Known Issues & Limitations

1. **Flash Pay OCR**: Not yet implemented (manual calculator only)
2. **Rewards App**: Coming soon (placeholder card)
3. **Status Ring Checkered Pattern**: CSS pattern, may need SVG fallback
4. **Party Chat**: Not integrated with RichInput yet
5. **Offline Mode**: Not implemented yet

---

## 💡 Development Tips

### Adding a New Mini-App

1. **Create the page**:
```tsx
// src/app/portal/my-app/page.tsx
export default function MyAppPage() {
  return <div>My App Content</div>;
}
```

2. **Add to MINI_APPS array** in `/portal/page.tsx`:
```typescript
{
  id: 'my-app',
  name: 'My App',
  tagline: 'One-liner description',
  description: 'Full description',
  icon: IconFromLucide,
  gradient: 'from-blue-500 via-cyan-500 to-teal-500',
  glowColor: 'shadow-blue-500/50',
  href: '/portal/my-app',
  badge: 'Beta',
  badgeVariant: 'default',
  features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
  status: 'active',
}
```

3. **Test authentication** (ensure `/portal/layout.tsx` wraps it)

4. **Add navigation link** (optional) to Header or UserNav

### Customizing Status Ring

```tsx
// Add new status type
export type UserStatus = 'online' | 'racing' | 'imposter' | 'party' | 'custom';

// Add to statusConfig
custom: {
  ring: 'ring-blue-500',
  glow: 'shadow-blue-500/50',
  pulse: true,
  label: 'Custom Status',
}
```

### Updating Cape Sunset Colors

Edit `src/app/globals.css`:
```css
--primary: 20 95% 55%; /* Orange */
--secondary: 280 85% 60%; /* Purple */
--accent: 330 90% 60%; /* Pink */
```

---

## 🎉 Summary

**Phase 1 & 2 Complete!**
- ✅ Rebranded to Aweh Chat
- ✅ Cape Sunset dark theme
- ✅ SA slang throughout
- ✅ The Portal navigation system
- ✅ 6 mini-apps (3 active, 3 coming soon)
- ✅ Flash Pay calculator
- ✅ Status Ring avatars
- ✅ Seamless authentication

**Ready for Testing**:
1. Visit `/portal` to see The Portal
2. Launch Party OS, Games, or Groups
3. Try Flash Pay calculator
4. Watch avatar status change on different pages
5. Hover over avatar for status tooltip

**Next Priority**:
- Voice notes with Gemini transcription
- Context-aware sidebar
- Offline-first messaging
- Flash Pay OCR scanner

---

## 🔗 Quick Links

- Main Portal: `/portal`
- Flash Pay: `/portal/flash-pay`
- Party OS: `/party/join`
- Games Hub: `/dashboard/games`
- Groups: `/dashboard/groups`
- Admin Panel: `/admin/control`
- QR Studio: `/admin/qr-studio`
- Super Input Demo: `/admin/super-input-demo`

---

**Built with 🔥 by the Aweh Chat team**

*Aweh, china! Let's vibe! 🤙*
