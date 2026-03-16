# IdeaSpark

## One-line pitch
Turn fleeting ideas into real projects with instant feedback from people who've been there.

## Expanded vision

**Who is this REALLY for?**

This isn't just for entrepreneurs — it's for anyone who has ideas but doesn't know what to do with them:

- **Side hustlers** who need validation before investing time/money
- **Students and recent grads** exploring career paths and startup ideas
- **Corporate employees** with innovation ideas but no internal outlet
- **Hobbyists and makers** wanting to gauge interest before building
- **Career pivoters** testing new business concepts before quitting their job
- **Parents and retirees** with decades of experience who want to mentor or collaborate

**Broadest audience:** Anyone who's ever said "I have an idea but..." — that's 80% of smartphone users.

**Adjacent use cases:**
- Skill-based matchmaking (find co-founders, designers, developers)
- Micro-consulting (pay experts for 15-min feedback sessions)
- Trend spotting (what ideas are gaining traction in your city/industry?)
- Portfolio building (showcase your thinking, not just finished work)

**Why non-technical people want this:**
- No coding required — just describe your idea in plain English
- Get real human feedback in minutes, not weeks
- See what's working for others in your situation
- Find collaborators without LinkedIn awkwardness

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based)
- **Local storage:** SQLite (expo-sqlite)
- **State:** React Context + hooks (no Redux for MVP)
- **UI:** React Native Paper (Material Design)
- **Auth:** Expo SecureStore for tokens (mock auth for MVP)
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Spark Feed** — Swipeable card interface for browsing ideas (like Tinder for concepts). Vote up/down, comment, or "ignite" (save for later).

2. **Submit Spark** — Voice-to-text or typed idea submission with auto-categorization (tech, food, service, product, etc.). Character limit forces clarity.

3. **Feedback Inbox** — Real-time notifications when someone comments on your idea. Threaded discussions with upvoting for best feedback.

4. **Spark Score** — Gamified reputation system. Earn points for helpful feedback, successful ideas, and community engagement. Unlock badges and perks.

5. **Collab Matcher** — Opt-in to find collaborators based on skills, location, and idea interests. Simple DM system for initial contact.

## Monetization strategy

**Free tier (the hook):**
- Submit 3 ideas per month
- Browse unlimited ideas
- Basic feedback (text comments only)
- Public profile with Spark Score

**Premium ($7.99/month — positioned as "less than two coffees"):**
- Unlimited idea submissions
- Voice feedback (30-sec audio responses)
- Private idea boards (test concepts with select group)
- Advanced analytics (who viewed, engagement trends, demographic breakdown)
- Priority placement in Collab Matcher
- Ad-free experience
- Export ideas as PDF pitch decks

**What makes people STAY subscribed:**
- Sunk cost in their Spark Score and reputation
- Active collaborations in progress
- Monthly "Spark Report" showing their idea's traction vs similar concepts
- Exclusive access to "Spark Challenges" (weekly prompts with prizes)
- Fear of losing private boards and analytics history

**Additional revenue (future):**
- Sponsored challenges from brands seeking innovation
- Marketplace for connecting ideas with investors (10% commission)
- Premium workshops and webinars from successful Sparkers

## File structure

```
ideaspark/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Spark Feed
│   │   ├── submit.tsx         # Submit Spark
│   │   ├── inbox.tsx          # Feedback Inbox
│   │   └── profile.tsx        # User Profile
│   ├── idea/
│   │   └── [id].tsx           # Idea Detail
│   └── _layout.tsx
├── components/
│   ├── SparkCard.tsx
│   ├── FeedbackThread.tsx
│   ├── CategoryBadge.tsx
│   └── SparkScoreDisplay.tsx
├── lib/
│   ├── database.ts            # SQLite setup
│   ├── ideas.ts               # Idea CRUD operations
│   ├── feedback.ts            # Feedback operations
│   ├── scoring.ts             # Spark Score logic
│   └── types.ts               # TypeScript types
├── __tests__/
│   ├── ideas.test.ts
│   ├── feedback.test.ts
│   └── scoring.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

**lib/__tests__/ideas.test.ts** — Test idea creation, retrieval, voting, and categorization

**lib/__tests__/feedback.test.ts** — Test feedback submission, threading, and upvoting

**lib/__tests__/scoring.test.ts** — Test Spark Score calculation, badge unlocking, and reputation logic

## Implementation steps

1. **Initialize Expo project**
   ```bash
   npx create-expo-app@latest ideaspark --template tabs
   cd ideaspark
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite react-native-paper expo-router
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```

3. **Set up SQLite database** (`lib/database.ts`)
   - Create tables: `ideas`, `feedback`, `users`, `votes`
   - Write migration logic for schema versioning
   - Export `getDatabase()` helper

4. **Implement data layer** (`lib/ideas.ts`, `lib/feedback.ts`)
   - CRUD functions for ideas (create, read, update, delete)
   - Vote tracking (upvote/downvote with user association)
   - Feedback threading with parent/child relationships
   - Query builders for feed sorting (trending, new, top)

5. **Build Spark Score system** (`lib/scoring.ts`)
   - Calculate score based on: ideas submitted, feedback given, upvotes received, collaborations started
   - Badge thresholds (Newbie, Contributor, Innovator, Visionary)
   - Leaderboard query functions

6. **Create UI components**
   - `SparkCard.tsx` — Swipeable card with idea preview, category, score, and action buttons
   - `FeedbackThread.tsx` — Nested comment display with upvote buttons
   - `CategoryBadge.tsx` — Color-coded category chips
   - `SparkScoreDisplay.tsx` — Animated score counter with badge icon

7. **Build tab screens**
   - `index.tsx` (Feed) — FlatList of SparkCards with pull-to-refresh
   - `submit.tsx` — Form with TextInput, category picker, and voice-to-text button (mock for MVP)
   - `inbox.tsx` — List of feedback notifications with unread badges
   - `profile.tsx` — User stats, Spark Score, submitted ideas, and settings

8. **Implement idea detail screen** (`app/idea/[id].tsx`)
   - Full idea description
   - Feedback thread with reply functionality
   - Vote buttons and current vote count
   - "Ignite" (save) and "Collab" buttons

9. **Add navigation and routing**
   - Configure Expo Router tabs with icons
   - Deep linking for idea sharing
   - Modal for submit screen (optional)

10. **Write tests**
    - Unit tests for all database operations
    - Test Spark Score calculations with various scenarios
    - Test vote logic (prevent double voting, update counts)

11. **Seed database with sample data**
    - Create 20-30 sample ideas across categories
    - Generate realistic feedback threads
    - Populate user profiles with varying Spark Scores

12. **Polish UI**
    - Add loading states and error handling
    - Implement optimistic updates for votes
    - Add haptic feedback for interactions
    - Configure theme colors in `app.json`

## How to verify it works

**On device/simulator:**
1. Run `npx expo start` and scan QR code with Expo Go
2. Verify all tabs load without errors
3. Test idea submission flow (submit → see in feed → tap to view detail)
4. Test voting (upvote/downvote updates count immediately)
5. Test feedback (add comment → appears in thread and inbox)
6. Test Spark Score (submit idea + give feedback → score increases)
7. Verify swipe gestures on SparkCard work smoothly
8. Test pull-to-refresh on feed

**Automated tests:**
```bash
npm test
```
All tests in `__tests__/` must pass with >80% coverage on core logic.

**Key success metrics:**
- Feed loads <500ms with 50 ideas
- Vote updates reflect instantly (optimistic UI)
- Database queries return <100ms
- No memory leaks after 10 minutes of swiping
- App size <50MB