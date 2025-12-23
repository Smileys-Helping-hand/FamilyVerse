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

## Style Guidelines:

- Use a 'Slate' or 'Neutral' color palette for a sophisticated, archival feel.
- Background color: Very light grey (#F9FAFB), almost white, for a clean and modern feel.
- Accent color: Sky Blue (#38BDF8) for interactive elements and highlights.
- Font: 'Inter', a sans-serif font known for its readability and modern design, suitable for both headlines and body text.
- Use simple, clear icons from a library like Feather or Heroicons to represent family members, relationships, and actions.
- Maintain a clean and organized layout with consistent spacing and padding, using Tailwind CSS grid and flexbox utilities to create a responsive design.
- Implement subtle animations, such as fade-in effects or smooth transitions, to enhance user experience and provide visual feedback during actions.
- Use rounded corners for the tree nodes (cards) to make them feel friendly.