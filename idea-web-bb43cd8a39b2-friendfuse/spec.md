# FriendSpark

## One-line pitch
Turn everyday moments into friendship fuel—track streaks, unlock challenges, and never let distance dim your closest connections.

## Expanded vision

**Core audience:** Anyone who's ever felt guilty about a friendship fading. This isn't just for young professionals—it's for:

- **College friends scattered across cities** who want to stay close despite distance
- **New parents** who feel isolated and need structured ways to maintain adult friendships
- **Introverts** who want to be good friends but struggle with spontaneous outreach
- **Long-distance best friends** who need rituals to stay connected
- **People rebuilding social lives** after relocation, breakups, or life transitions
- **Busy professionals** who care deeply but forget to reach out

**Adjacent use cases:**
- Family connection tracking (siblings, cousins, aging parents)
- Accountability partnerships (workout buddies, study partners)
- Mentorship relationships that need regular check-ins
- Support groups maintaining connection between meetings
- Book clubs, hobby groups keeping momentum between events

**Why non-technical people want this:** Friendships are invisible labor. You know you should text that friend, but life gets busy. FriendSpark makes the invisible visible—it's a fitness tracker for relationships. You get the dopamine hit of streaks, the satisfaction of completing challenges, and the peace of mind that you're being a good friend. It removes the mental load of "when did I last talk to Sarah?" and replaces guilt with gamified momentum.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Notifications:** expo-notifications
- **Navigation:** expo-router (file-based)
- **State:** React Context + AsyncStorage for settings
- **Date handling:** date-fns
- **Testing:** Jest + React Native Testing Library
- **Analytics:** Expo Analytics (built-in, privacy-focused)

Keep it lean—no Firebase, no heavy animation libraries, no unnecessary deps.

## Core features

1. **Friendship Streaks** — Track consecutive days/weeks you've connected with each friend (text, call, hangout). Visual streak counter with fire emoji escalation. Lose the streak if you go too long without contact.

2. **Smart Nudges** — Get gentle notifications when you haven't talked to someone in a while. Customizable per friend (some need weekly check-ins, others monthly). Includes conversation starter suggestions.

3. **Challenge Library** — Pre-built friendship challenges: "Send a voice memo," "Share a photo from 5 years ago," "Ask about their biggest win this month." Unlock new challenges as streaks grow.

4. **Connection Timeline** — Visual history of your friendship: when you last talked, what you did together, inside jokes logged. Makes every interaction feel meaningful and tracked.

5. **Friendship Score** — Aggregate health metric per friend (frequency, depth of interaction, challenge completion). Not judgmental—just a gentle dashboard showing who might need attention.

## Monetization strategy

**Free tier (the hook):**
- Track up to 5 friends
- Basic streaks and nudges
- 10 standard challenges
- 7-day connection history

**FriendSpark Pro — $4.99/month or $39.99/year:**
- Unlimited friends
- Advanced analytics (best times to connect, friendship trends over time)
- 100+ premium challenges (deeper, more creative prompts)
- Custom challenge builder
- Full timeline history (unlimited)
- Priority nudges (smarter timing based on your habits)
- Ad-free experience
- Export friendship data (annual "friendship report")

**Why people stay subscribed:**
- Streaks create sunk-cost fallacy (can't lose that 90-day streak with your best friend)
- The guilt of downgrading and losing analytics/history
- Premium challenges keep the experience fresh
- Annual "friendship report" becomes a shareable, emotional artifact

**Price reasoning:** Lower than typical productivity apps ($9.99) because this is emotional, not professional. Comparable to meditation apps ($5-7/month) which also target well-being. Annual discount encourages long-term commitment.

## File structure

```
friendspark/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Friends list + streaks
│   │   ├── challenges.tsx         # Challenge library
│   │   ├── insights.tsx           # Analytics dashboard
│   │   └── settings.tsx           # Settings + subscription
│   ├── friend/
│   │   └── [id].tsx               # Individual friend detail
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── FriendCard.tsx
│   ├── StreakBadge.tsx
│   ├── ChallengeCard.tsx
│   ├── NudgeNotification.tsx
│   └── ConnectionTimeline.tsx
├── lib/
│   ├── database.ts                # SQLite setup + queries
│   ├── notifications.ts           # Notification scheduling
│   ├── streaks.ts                 # Streak calculation logic
│   ├── challenges.ts              # Challenge data + logic
│   └── analytics.ts               # Friendship score calculation
├── constants/
│   └── challenges.ts              # Challenge library data
├── hooks/
│   ├── useFriends.ts
│   ├── useStreaks.ts
│   └── useNotifications.ts
├── __tests__/
│   ├── streaks.test.ts
│   ├── analytics.test.ts
│   ├── challenges.test.ts
│   └── database.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**`__tests__/streaks.test.ts`** — Test streak calculation, expiration logic, and edge cases (same-day multiple interactions, timezone handling)

**`__tests__/analytics.test.ts`** — Test friendship score algorithm, trend detection, and nudge timing logic

**`__tests__/challenges.test.ts`** — Test challenge unlocking, completion tracking, and filtering by friend

**`__tests__/database.test.ts`** — Test CRUD operations for friends, interactions, and challenges

## Implementation steps

1. **Initialize Expo project**
   ```bash
   npx create-expo-app@latest friendspark --template tabs
   cd friendspark
   npx expo install expo-sqlite expo-notifications date-fns
   npm install --save-dev jest @testing-library/react-native @types/jest
   ```

2. **Set up SQLite database schema** (`lib/database.ts`)
   - Create `friends` table: id, name, phone, email, avatar, created_at
   - Create `interactions` table: id, friend_id, type (text/call/hangout), timestamp, notes
   - Create `challenges` table: id, friend_id, challenge_type, completed_at, status
   - Create `settings` table: id, key, value (for notification preferences)
   - Write init function to create tables on first launch

3. **Build streak calculation logic** (`lib/streaks.ts`)
   - Function to calculate current streak from interactions table
   - Function to determine if streak is at risk (last interaction > threshold)
   - Function to get longest streak ever for a friend
   - Export types: `Streak { current: number, longest: number, lastInteraction: Date, status: 'active' | 'at-risk' | 'broken' }`

4. **Create notification system** (`lib/notifications.ts`)
   - Request permissions on app launch
   - Schedule daily check for at-risk streaks (8am local time)
   - Send nudge notifications with friend name + conversation starter
   - Allow per-friend notification frequency settings (daily/weekly/monthly)

5. **Build challenge library** (`constants/challenges.ts`)
   - Define 50+ challenges with metadata: title, description, difficulty, unlock_requirement
   - Free tier: 10 basic challenges (e.g., "Send a text," "Share a meme")
   - Pro tier: Advanced challenges (e.g., "Record a 2-minute voice memo about your week")
   - Function to filter available challenges based on subscription + streak level

6. **Implement friendship score algorithm** (`lib/analytics.ts`)
   - Score = (interaction_frequency * 0.4) + (interaction_variety * 0.3) + (challenge_completion * 0.3)
   - Frequency: interactions per week vs. expected cadence
   - Variety: mix of text/call/hangout (not just texts)
   - Challenge completion: percentage of attempted challenges finished
   - Return score 0-100 with status: 'thriving' | 'healthy' | 'needs-attention' | 'fading'

7. **Build Friends List screen** (`app/(tabs)/index.tsx`)
   - FlatList of FriendCard components
   - Show name, avatar, current streak, friendship score
   - Sort by: at-risk streaks first, then by score
   - FAB to add new friend
   - Pull-to-refresh to recalculate all streaks

8. **Build Friend Detail screen** (`app/friend/[id].tsx`)
   - Header: name, avatar, streak badge, friendship score
   - Quick action buttons: "Log Text," "Log Call," "Log Hangout"
   - Connection Timeline: chronological list of all interactions
   - Active challenges section
   - "Start Challenge" button to browse available challenges

9. **Build Challenges screen** (`app/(tabs)/challenges.tsx`)
   - Tabs: "Active" | "Available" | "Completed"
   - Filter by friend or show all
   - ChallengeCard shows title, description, friend name, due date
   - Tap to mark complete (with optional note)
   - Lock icon on premium challenges if free tier

10. **Build Insights screen** (`app/(tabs)/insights.tsx`)
    - Summary cards: total friends, average streak, total interactions this month
    - Chart: interaction frequency over last 30 days
    - "Friends Needing Attention" list (score < 40)
    - "Longest Streaks" leaderboard
    - Premium: trend analysis, best connection times, friendship growth over time

11. **Build Settings screen** (`app/(tabs)/settings.tsx`)
    - Notification preferences (global + per-friend overrides)
    - Subscription management (show current tier, upgrade CTA)
    - Data export (premium feature)
    - About/Help/Privacy Policy links

12. **Implement subscription paywall**
    - Use Expo's in-app purchases (expo-in-app-purchases)
    - Show paywall modal when accessing premium features
    - Graceful degradation: show "Upgrade to Pro" cards instead of locked features
    - 7-day free trial for annual plan

13. **Add onboarding flow**
    - Welcome screen explaining core concept
    - Request notification permissions
    - "Add Your First Friend" prompt
    - Quick tutorial on logging interactions and starting challenges

14. **Write tests**
    - Mock SQLite database for all tests
    - Test streak calculation with various interaction patterns
    - Test friendship score edge cases (new friend, inactive friend, super active friend)
    - Test challenge unlocking logic
    - Test notification scheduling

15. **Polish UI**
    - Consistent color scheme (warm, friendly tones—coral, teal, cream)
    - Smooth animations for streak increments
    - Haptic feedback on interaction logging
    - Empty states with encouraging copy
    - Accessibility: VoiceOver labels, sufficient contrast, tap targets 44x44pt

## How to verify it works

**On device/simulator:**
1. Run `npx expo start` and scan QR code with Expo Go
2. Grant notification permissions when prompted
3. Add a test friend with name and contact info
4. Log an interaction (text/call/hangout) and verify streak increments to 1
5. Navigate to friend detail and verify interaction appears in timeline
6. Start a challenge and mark it complete
7. Check Insights screen shows updated stats
8. Wait 24 hours (or manually advance system time) and verify nudge notification appears
9. Add 5+ friends and verify free tier limit enforced
10. Tap "Upgrade to Pro" and verify paywall modal appears

**Automated tests:**
```bash
npm test
```
All tests in `__tests__/` must pass. Verify:
- Streak calculation handles same-day interactions correctly
- Friendship score returns values 0-100
- Challenge unlocking respects subscription tier
- Database queries return expected results

**Key success metrics:**
- App launches without crashes
- Streaks persist across app restarts (SQLite working)
- Notifications fire at expected times
- All navigation flows work (tabs, friend detail, back button)
- Premium features show paywall for free users
- `npm test` exits with code 0