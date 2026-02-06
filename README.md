# FamilyVerse - Your Digital Family Legacy

A modern, beautiful, and professional family tree application built with Next.js, Firebase, and React. Create, manage, and celebrate your family connections with style!

## ✨ Features

### 🌳 Interactive Family Tree
- Beautiful, animated family member cards with profile photos
- Visual relationship mapping (parents, spouses, children)
- Drag-and-drop organization
- Real-time updates across all devices
- Gender-specific styling and icons
- Smooth animations and micro-interactions

### 📊 Smart Dashboard
- **Family Stats**: Live statistics showing total members, generations, relationships
- **Activity Feed**: Real-time updates on family tree changes and milestones
- **Upcoming Events**: Birthday reminders, anniversaries, and special occasions
- **Quick Actions**: One-click access to common tasks
- **Progress Tracking**: Visual indicators for family tree completion

### 🎮 Family Games Hub
- 30+ party games for all ages
- Categories: Icebreakers, Trivia, Drawing, Acting, Word Games, Physical Activities
- Detailed game instructions and rules
- Player count and duration filters
- Difficulty ratings and fun factor scores
- No-screen family fun activities

### 📹 Video Library
- Curated family-friendly content
- Categories: Educational, Storytelling, Music, Exercise, Arts & Crafts
- Age-appropriate filtering
- Video ratings and duration info
- Safe, educational content for kids

### 🛡️ Parental Controls
- **Child Profile Management**: Create and manage profiles for each child
- **Content Filtering**: Age-appropriate ratings and category management
- **Screen Time Management**: Daily/weekly limits with customizable schedules
- **Activity Monitoring**: Detailed reports on content consumption
- **Bedtime Mode**: Automatic device restrictions during sleep hours
- **Educational Priority**: Promote learning content
- **Achievement System**: Celebrate milestones and progress

### 🔔 Real-time Notifications
- In-app notification center
- Badge counters for unread notifications
- Activity alerts and updates
- Birthday and event reminders
- Family member join notifications

### 🎨 Beautiful Themes
- **Family Theme**: Bright, welcoming colors perfect for all ages
- **Kids Theme**: Playful, energetic design with rounded corners
- **Teens Theme**: Cool, dynamic dark mode aesthetic
- **Adults Theme**: Sophisticated, elegant color palette
- Smooth theme transitions
- Theme persistence across sessions

### 🔐 Authentication & Security
- Email/password authentication
- Secure Firebase integration
- Protected routes and role-based access
- Password reset functionality
- Email verification
- Session management

### 💫 User Experience
- **Smooth Animations**: Fade-ins, slide-ups, hover effects
- **Loading States**: Professional skeleton screens and spinners
- **Error Handling**: Friendly error messages and recovery options
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Toast Notifications**: Non-intrusive success/error messages
- **Progress Indicators**: Visual feedback for all actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd FamilyVerse
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage for profile photos
   - Copy your Firebase config

4. Create a `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:9002](http://localhost:9002)

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: React Context
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📁 Project Structure

```
src/
├── app/                      # Next.js app router pages
│   ├── dashboard/           # Main dashboard and features
│   ├── login/              # Authentication pages
│   └── signup/
├── components/              # React components
│   ├── auth/               # Login and signup forms
│   ├── dashboard/          # Dashboard widgets
│   ├── family/             # Family tree components
│   ├── games/              # Games hub
│   ├── media/              # Video library
│   ├── parental-controls/  # Parental control features
│   ├── layout/             # Header, navigation
│   └── ui/                 # Reusable UI components
├── context/                # React context providers
├── firebase/               # Firebase configuration
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and data
└── types/                  # TypeScript type definitions
```

## 🎨 Key Features Highlight

### Animated Dashboard Cards
- Gradient backgrounds
- Hover scale effects
- Icon animations
- Smooth color transitions

### Professional Loading States
- Skeleton screens during data fetch
- Animated spinners
- Progress indicators
- Staggered animations for lists

### Enhanced Family Tree
- Larger, more detailed member cards
- Relationship indicators with icons
- Hover effects and zoom
- Responsive grid layout

### Activity Feed
- Real-time updates
- Color-coded activity types
- Relative timestamps
- Avatar integration

### Notification System
- Unread badge counter
- Categorized notifications
- Mark as read functionality
- Smooth slide-in animations

## 🎯 Usage Tips

1. **Start Fresh**: Create your account and set up your family
2. **Add Members**: Begin with yourself and immediate family
3. **Connect Relationships**: Link parents, spouses, and children
4. **Upload Photos**: Add profile pictures for a personal touch
5. **Invite Family**: Share your family join code
6. **Explore Games**: Check out the family games section
7. **Watch Together**: Browse the video library
8. **Set Controls**: Configure parental controls if needed

## 🔄 Updates & Improvements

### Recent Enhancements (v2.0)
- ✅ Complete UI/UX overhaul with modern animations
- ✅ Enhanced dashboard with 4 new interactive widgets
- ✅ Professional loading states throughout
- ✅ Notification center with badge counter
- ✅ Improved family tree with detailed cards
- ✅ Activity feed with real-time updates
- ✅ Upcoming events calendar
- ✅ Quick actions for common tasks
- ✅ Enhanced authentication flows
- ✅ Error boundaries for better error handling
- ✅ Responsive design improvements
- ✅ Performance optimizations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI Components by [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)

---

Made with ❤️ for families everywhere

