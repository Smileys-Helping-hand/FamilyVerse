# **App Name**: FamilyVerse

## Core Features:

- Firebase Initialization: Initialize Firebase Auth, Firestore, and Storage for the application.
- User Authentication: Implement user registration, login, and logout functionalities using Firebase Auth.
- Auth Context: Manage user session state using React Context to provide user data and authentication functions across the app.
- Family Creation: Allow users to create a new family tree with a unique join code. Store family data in Firestore.
- Family Joining: Enable users to join an existing family tree using a join code. Update family member roles in Firestore.
- Protected Routes: Implement route protection to ensure only authenticated users can access certain parts of the application, enhancing security and user experience.
- Dashboard: Display family information.
- Interactive Tree Canvas: Integrate react-flow or a similar library to visualize family members as nodes and relationships as connected edges. Support drag-and-drop and zoom.
- Member Management: Create a dedicated form to add family members with fields for Name, Gender, Birth Date, and Relationship links (Parents, Spouses, Children).
- Complex Relationships: Ensure the data model supports complex links (e.g., half-siblings, multiple spouses) via an adjacency list or edge array.
- Media Integration: Allow users to upload profile photos for family members using Firebase Storage, with direct display on the Tree nodes.
- Unique Invite System: Implement a logic to generate short, random 6-character "Join Codes" for families that map to the Family ID.
- Activity Logging: A simple audit log in Firestore tracking who added or edited a member.

## Parental Control Features:

### Child Profile Management
- **Add Child Profiles**: Parents can create profiles for their children with name, age, and birthdate information.
- **Link to Family Tree**: Optional linking of child profiles to family tree members for integrated family management.
- **Avatar Customization**: Personalize each child's profile with avatars.

### Content Safety & Filtering
- **Age-Appropriate Ratings**: Set content age ratings (All Ages 0-5, Kids 6-12, Teen 13-17, Mature 18+).
- **Category Management**: Enable/disable content categories including:
  - Educational (learning & skill development)
  - Entertainment (age-appropriate shows & games)
  - Creative (art, music, crafting)
  - Social (family & friend interactions)
  - News (current events for kids)
  - Sports (physical activities)
- **Keyword Blocking**: Automatically filter content containing specified inappropriate keywords.
- **Approval System**: Require parent approval before children access new apps, websites, or content.
- **Educational Priority**: Automatically promote and recommend educational content first.

### Screen Time Management
- **Daily & Weekly Limits**: Set maximum screen time with customizable limits (15 min to 8 hours daily).
- **Allowed Hours**: Define when children can use devices during the day (e.g., 8:00 AM - 8:00 PM).
- **Bedtime Mode**: Automatically restrict device access during sleep hours with customizable start/end times.
- **Break Reminders**: Send regular reminders to take breaks from screens (configurable intervals).
- **Device-Free Zones**: Designate physical areas where devices should not be used (bedroom, dining table, etc.).

### Activity Monitoring & Reports
- **Daily Activity Reports**: Track what children watch and interact with, including:
  - Content viewed with duration, category, and educational status
  - Social interactions (messages, posts, comments)
  - Educational achievements and milestones
  - Flagged inappropriate content attempts
- **Screen Time Analytics**: Visual progress bars showing daily/weekly usage against limits.
- **Educational Content Tracking**: Monitor percentage of educational vs. entertainment content consumed.
- **Achievement System**: Celebrate children's progress with educational, creative, and social achievements.
- **Alert System**: Three-tier alert system (low, medium, high severity) for:
  - Screen time limit warnings
  - Inappropriate content attempts
  - Unusual activity patterns

### Safety Features
- **Real-time Notifications**: Instant alerts for parents when high-priority events occur.
- **Weekly Summary Reports**: Automated weekly emails with comprehensive activity summaries.
- **Content Flagging**: Automatic detection and flagging of potentially inappropriate interactions.
- **Educational Recommendations**: AI-powered suggestions for age-appropriate educational content.

### Parent Dashboard
- **Overview Tab**: Quick view of all children with current screen time, limits, and status indicators.
- **Settings Tab**: Comprehensive controls for content policies and screen time rules per child.
- **Reports Tab**: Detailed activity reports with tabbed views for content, interactions, and achievements.
- **Digital Wellness Tips**: Built-in guidance for promoting healthy device habits.

## Style Guidelines:

- Use a 'Slate' or 'Neutral' color palette for a sophisticated, archival feel.
- Background color: Very light grey (#F9FAFB), almost white, for a clean and modern feel.
- Accent color: Sky Blue (#38BDF8) for interactive elements and highlights.
- Font: 'Inter', a sans-serif font known for its readability and modern design, suitable for both headlines and body text.
- Use simple, clear icons from a library like Feather or Heroicons to represent family members, relationships, and actions.
- Maintain a clean and organized layout with consistent spacing and padding, using Tailwind CSS grid and flexbox utilities to create a responsive design.
- Implement subtle animations, such as fade-in effects or smooth transitions, to enhance user experience and provide visual feedback during actions.
- Use rounded corners for the tree nodes (cards) to make them feel friendly.