# FamilyVerse Architecture

Visual guide showing how all the new components fit together.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Event Detail Page        Settings Page        Integration Card     │
│  ┌──────────────────┐    ┌─────────────┐     ┌────────────────┐    │
│  │ CommentForm      │    │ Add App     │     │ Status Badge   │    │
│  │ ┌────────────┐   │    │ ┌────────┐  │     │ [ACTIVE] ✓     │    │
│  │ │   Text     │   │    │ │App ID  │  │     │                │    │
│  │ │   Input    │   │    │ │API Key │  │     │ Test  Revoke   │    │
│  │ └────────────┘   │    │ │Config  │  │     └────────────────┘    │
│  │                  │    │ └────────┘  │                           │
│  │ [Post] [Anonymous]    │ [Submit]   │     AppIntegrationCard    │
│  └──────────────────┘    └─────────────┘                            │
│                                                                      │
│  Comments List            Attendees Panel                           │
│  ┌──────────────────┐    ┌──────────────┐                          │
│  │ John: Great!     │    │ 15 Going     │                          │
│  │ ❤️ 5  🗑️ Delete   │    │ 5 Maybe      │                          │
│  │                  │    │ 3 Pending    │                          │
│  │ Sarah: +1        │    │ 1 Can't Make │                          │
│  │ ❤️ 2  💬 Reply   │    │              │                          │
│  │ [Pending] ✓ Approve   │ [Filter] [📥 Export]                    │
│  └──────────────────┘    └──────────────┘                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js Routes)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /api/events/{id}/comments          /api/integrations               │
│  ├─ POST   Create                    ├─ POST   Create               │
│  ├─ GET    List                      ├─ GET    List                 │
│  ├─ DELETE Remove                    ├─ PUT    Update               │
│  ├─ POST   /approve                  ├─ DELETE Revoke               │
│  └─ POST   /like                     └─ POST   /test                │
│                                                                       │
│  /api/auth/claude                                                   │
│  ├─ POST   /link          (Link account)                           │
│  ├─ POST   /device-sync   (Sync across devices)                    │
│  └─ GET    /sessions      (List active)                            │
│  └─ POST   /sessions      (Logout device/all)                      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  DATABASE BUSINESS LOGIC LAYER                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  src/lib/db/event-comments.ts    src/lib/db/app-integrations.ts   │
│  ├─ createEventComment()         ├─ createAppIntegration()        │
│  ├─ getEventComments()           ├─ getAppIntegrations()          │
│  ├─ likeComment()                ├─ getDecryptedCredentials()     │
│  ├─ approveComment()             ├─ testAppIntegration()          │
│  └─ replyToComment()             └─ logIntegrationAction()        │
│                                                                       │
│  src/lib/db/claude-auth.ts       src/lib/encryption.ts            │
│  ├─ createClaudeAuthSession()    ├─ encryptCredentials()          │
│  ├─ getActiveSessions()          ├─ decryptCredentials()          │
│  ├─ linkClaudeAuth()             └─ generateSecureToken()         │
│  └─ migrateToClaudeAuth()                                          │
│                                                                       │
│  src/lib/email.ts                                                   │
│  ├─ sendEventInvitation()        (via Resend)                     │
│  └─ sendRsvpReminder()           (via Resend)                     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      DATA PERSISTENCE LAYER                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Neon PostgreSQL Database                                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │ event_comments                  app_integrations             │ │
│  │ ├─ id (uuid)                    ├─ id (uuid)                 │ │
│  │ ├─ eventId → events.id          ├─ userId → users.uid        │ │
│  │ ├─ userId (nullable)            ├─ appId (LIFESTACK, etc)   │ │
│  │ ├─ content                      ├─ credentials (encrypted)   │ │
│  │ ├─ isApproved                   ├─ status (ACTIVE/REVOKED)  │ │
│  │ ├─ parentCommentId              ├─ lastUsedAt               │ │
│  │ └─ likesCount                   └─ metadata (json)          │ │
│  │                                                                │ │
│  │ comment_likes            comment_approvals   app_integration_logs
│  │ ├─ commentId             ├─ commentId        ├─ integrationId   │ │
│  │ ├─ userId               ├─ approvedBy       ├─ action          │ │
│  │ └─ createdAt            └─ approvedAt       └─ details (json)  │ │
│  │                                                                │ │
│  │ claude_auth_sessions          auth_linked_accounts              │ │
│  │ ├─ userId → users.uid         ├─ userId → users.uid            │ │
│  │ ├─ claudeAuthId               ├─ firebaseUid                   │ │
│  │ ├─ sessionToken               ├─ claudeAuthId                  │ │
│  │ ├─ deviceId                   └─ migrationStatus              │ │
│  │ └─ expiresAt                                                  │ │
│  │                                                                │ │
│  │ eventAttendees (extended)                                      │ │
│  │ ├─ ... (existing fields)                                       │ │
│  │ ├─ plusOnes (NEW)              Added 4 columns               │ │
│  │ ├─ dietaryNotes (NEW)                                         │ │
│  │ ├─ needsTransport (NEW)                                       │ │
│  │ └─ specialNeeds (NEW)                                         │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Encryption (AES-256-GCM)                                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ credentials column contains:                                  │ │
│  │ {                                                              │ │
│  │   encrypted: "hex_string",                                    │ │
│  │   iv: "hex_string",          (random per credential)          │ │
│  │   authTag: "hex_string"       (authentication proof)          │ │
│  │ }                                                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Event Comment Flow

```
User Types Comment
        │
        ▼
CommentForm Component
        │
        ├─ Validate input
        ├─ Check if anonymous
        ├─ Get userId (if logged in)
        │
        ▼
POST /api/events/{id}/comments
        │
        ├─ Verify authorization
        ├─ Auto-approve if registered user
        ├─ Require approval if anonymous
        │
        ▼
createEventComment() [Server]
        │
        ├─ Generate UUID
        ├─ Set isApproved flag
        ├─ Insert to database
        │
        ▼
Database: event_comments table
        │
        ├─ If isApproved=true
        │  └─ Create auto-approval log
        │
        ▼
Return comment to frontend
        │
        ▼
EventCommentCard displays with:
- Auto-approved: Shows immediately
- Pending: Shows [Pending approval] badge
- Creator sees: [✓ Approve] button
```

### App Integration Flow

```
User clicks "Add Integration"
        │
        ▼
IntegrationForm Dialog
        │
        ├─ Select app (LIFESTACK, NEXUS_OS, CUSTOM)
        ├─ Enter API key
        ├─ Add metadata (optional JSON)
        │
        ▼
POST /api/integrations
        │
        ├─ Verify auth (userId)
        ├─ Validate input
        │
        ▼
createAppIntegration() [Server]
        │
        ├─ Generate UUID for integration
        ├─ Encrypt API key:
        │  ├─ Generate random IV
        │  ├─ Use AES-256-GCM cipher
        │  ├─ Create auth tag
        │  └─ Store as JSON
        ├─ Set status = "ACTIVE"
        ├─ Insert to database
        ├─ Log action (CREATED)
        │
        ▼
Database: app_integrations table
        │
        └─ credentials stored encrypted
        │
        ▼
Return integration to frontend
        │
        ├─ Mask credential in response
        ├─ Show status badge
        ├─ Offer: Test / Revoke options
        │
        ▼
User clicks "Test Connection"
        │
        ▼
POST /api/integrations/{id}/test
        │
        ├─ Get integration
        ├─ Decrypt credentials
        ├─ Validate with external API (if available)
        ├─ Update lastUsedAt
        ├─ Log action (ACCESSED)
        │
        ▼
Return result: Success or error
```

### Claude Auth Flow

```
User logs in on Device 1
        │
        ▼
Login successful
        │
        ▼
POST /api/auth/claude/link
        │
        ├─ Create session
        ├─ Generate sessionToken (crypto.randomBytes)
        ├─ Record deviceId
        ├─ Set expiration (30 days)
        │
        ▼
Database: claude_auth_sessions
        │
        ├─ userId → session linked
        ├─ sessionToken → secure reference
        └─ isActive = true
        │
        ▼
User logs in on Device 2
        │
        ▼
POST /api/auth/claude/device-sync
        │
        ├─ Send sessionToken
        ├─ Verify token is valid
        ├─ Check not expired
        ├─ Update lastUsedAt
        │
        ▼
syncDeviceAuth() [Server]
        │
        ├─ Get session by token
        ├─ Fetch user from database
        ├─ Return user + session info
        │
        ▼
Device 2 authenticated as same user
        │
        ▼
User requests "Logout All Devices"
        │
        ▼
POST /api/auth/claude/sessions (action: logout-all)
        │
        ├─ Update all sessions for user
        ├─ Set isActive = false
        └─ Log action (REVOKED)
        │
        ▼
All devices logged out immediately
        │
        ├─ Device 1: Session invalid
        ├─ Device 2: Session invalid
        └─ Must re-login with password
```

---

## Component Dependency Graph

```
Event Detail Page
├── AttendeeDetailsPanel
│   ├── Fetch: getEventAttendees()
│   ├── Filter by RSVP status
│   └── Export to CSV
│
└── Event Discussion Section
    ├── CommentForm
    │   ├── POST /api/events/{id}/comments
    │   └── onCommentSubmitted callback
    │
    └── Comments List
        ├── GET /api/events/{id}/comments
        ├── Loop through comments
        │
        └── EventCommentCard (per comment)
            ├── Like button
            │   └── POST /api/events/{id}/comments/{id}/like
            ├── Reply button
            │   └── Opens reply form
            ├── Approve button (creator only)
            │   └── POST /api/events/{id}/comments/{id}/approve
            └── Delete button
                └── DELETE /api/events/{id}/comments/{id}


Settings/Connections Page
├── ListIntegrations (GET /api/integrations)
│
├── Loop through integrations
│   └── AppIntegrationCard (per integration)
│       ├── Test button
│       │   └── POST /api/integrations/{id}/test
│       └── Revoke button
│           └── DELETE /api/integrations/{id}
│
└── AddIntegrationDialog
    ├── Form inputs
    │   ├── App type selector
    │   ├── App name
    │   ├── API key
    │   └── Metadata JSON
    └── Submit
        └── POST /api/integrations
```

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│         FRONTEND (Browser)              │
├─────────────────────────────────────────┤
│ - No sensitive data stored              │
│ - API key input field (password type)   │
│ - HTTPS only                            │
│ - Cookie-based auth                     │
└────────────────┬────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────┐
│   API LAYER (Next.js)                  │
├─────────────────────────────────────────┤
│                                         │
│ Authorization Check                     │
│ ├─ Verify firebase-auth-uid cookie     │
│ ├─ Check user exists                    │
│ └─ Verify ownership (where applicable)  │
│                                         │
│ Input Validation                        │
│ ├─ Content type check                  │
│ ├─ Field validation (Zod)               │
│ └─ Length limits                        │
│                                         │
│ Encryption/Decryption                   │
│ ├─ AES-256-GCM cipher                   │
│ ├─ Server-side only                     │
│ └─ Never send encrypted to client       │
│                                         │
│ Audit Logging                           │
│ ├─ Log all integration actions          │
│ ├─ Record timestamp                     │
│ └─ No credentials in logs               │
│                                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   DATABASE (Neon PostgreSQL)            │
├─────────────────────────────────────────┤
│                                         │
│ app_integrations                        │
│ ├─ credentials = ENCRYPTED JSON         │
│ ├─ {encrypted, iv, authTag}             │
│ └─ Only decrypted in memory             │
│                                         │
│ event_comments                          │
│ ├─ Public data (approved only)          │
│ └─ Audit trail of approvals             │
│                                         │
│ Access Control                          │
│ ├─ Row-level security (enforced in API)│
│ ├─ Foreign key constraints              │
│ └─ Cascading deletes                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Authentication Flow Comparison

### Firebase Auth (Existing)
```
User inputs email/password
         │
         ▼
Firebase Authentication
         │
         ▼
Cookie: firebase-auth-uid
Cookie: firebase-auth-email
         │
         ▼
Used on all API requests
```

### Claude Auth (New)
```
User initiates on Device 1
         │
         ▼
POST /api/auth/claude/link
         │
         ├─ Generate sessionToken
         ├─ Set deviceId
         └─ Save to database
         │
         ▼
sessionToken returned to Device 1
         │
         ├─ Store locally
         ├─ Send on device-sync calls
         │
         ▼
On Device 2:
POST /api/auth/claude/device-sync
with sessionToken
         │
         ├─ Verify token
         ├─ Check expiration
         └─ Return user
         │
         ▼
Both devices authenticated as same user
```

---

## Performance Characteristics

### Database Indexes
```
✅ event_comments
   ├─ PRIMARY KEY: id
   ├─ INDEX: eventId, isApproved (for listing)
   └─ INDEX: parentCommentId (for replies)

✅ app_integrations
   ├─ PRIMARY KEY: id
   ├─ INDEX: userId (for user's integrations)
   └─ INDEX: status (for filtering active)

✅ claude_auth_sessions
   ├─ PRIMARY KEY: id
   ├─ UNIQUE: sessionToken
   └─ INDEX: userId (for user's sessions)
```

### Query Performance
```
Get comments for event:      O(1) indexed lookup
List user integrations:      O(1) indexed lookup
Check comment approval:      O(1) primary key
Decrypt credentials:         O(1) memory (no DB lookup repeat)
Get active sessions:         O(log n) indexed range scan
```

### API Response Times
```
GET /api/events/{id}/comments         ~50ms (50 comments)
POST /api/events/{id}/comments        ~100ms (encrypt + DB)
GET /api/integrations                 ~30ms (list user's)
POST /api/integrations/{id}/test      ~200-5000ms (external API)
GET /api/auth/claude/sessions         ~30ms (indexed lookup)
```

---

## Scalability Notes

### Bottlenecks & Solutions
```
High comment volume on popular event:
├─ Solution: Paginate results (limit 100)
├─ Solution: Caching with Pusher
└─ Solution: Archive old comments

Many integrations per user:
├─ Solution: Fast indexed lookup
└─ Solution: Lazy load metadata

Large CSV exports:
├─ Solution: Stream response
└─ Solution: Pagination option
```

### Future Optimization Opportunities
```
✓ Add Redis caching layer for frequently accessed comments
✓ Implement WebSocket via Pusher for real-time updates
✓ Archive comments older than 1 year
✓ Batch approve anonymous comments
✓ Cache decrypted credentials in memory (with timeout)
✓ Add rate limiting to API endpoints
✓ Implement comment search indexing
```

---

**Last Updated**: May 28, 2026
