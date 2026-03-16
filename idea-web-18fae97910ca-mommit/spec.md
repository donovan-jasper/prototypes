# MemoryMate

## One-line pitch
Never forget what matters — AI reminders that know when, where, and why you need them.

## Expanded vision

**Core audience:** Anyone juggling multiple responsibilities — parents managing family schedules, professionals balancing work and personal life, students tracking assignments and social commitments, caregivers coordinating medical appointments, and individuals with ADHD or memory challenges.

**Broadest reach:** This isn't just a reminder app — it's a personal memory assistant that understands context. The 30-60 demographic is the sweet spot, but the real opportunity is in shared memory management:

- **Families:** Shared grocery lists, pickup schedules, medication reminders for elderly parents
- **Couples:** Relationship maintenance (anniversaries, date nights, "call your mom" nudges)
- **Roommates/housemates:** Chore rotation, bill splitting reminders, shared responsibilities
- **Small teams:** Informal work groups that don't need enterprise tools but need coordination

**Adjacent use cases:**
- Social memory: "You met Sarah at the conference last month — she mentioned her startup"
- Habit formation: Contextual nudges that adapt to your routine
- Relationship intelligence: Remember birthdays, preferences, conversation topics
- Health tracking: Medication schedules, symptom logging, appointment prep

**Non-technical appeal:** It feels like having a thoughtful assistant who knows your life. No complex setup, no productivity jargon — just "remember this for me" and it handles the rest.

**Clear gap:** Existing apps are either too simple (basic to-do lists) or too complex (project management overkill). None combine AI-powered contextual awareness with social/shared memory features. The magic is in the *when* and *why* of reminders, not just the *what*.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite) for reminders, user data
- **AI/ML:** OpenAI API (GPT-4o-mini) for natural language processing and contextual suggestions
- **Notifications:** expo-notifications for push reminders
- **Location:** expo-location for geofencing triggers
- **Voice:** expo-speech for voice input/output
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Navigation:** Expo Router (file-based routing)
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Smart capture:** Voice or text input that understands natural language ("Remind me to call mom every Sunday at 5 PM" or "Buy milk when I'm near the grocery store")

2. **Contextual triggers:** Time-based, location-based, and routine-based reminders (e.g., "It's Monday morning — time for your weekly review")

3. **Shared memories:** Create family/group spaces where reminders sync across members (mom adds "pick up kids at 3 PM" and dad gets notified)

4. **AI suggestions:** Learns your patterns and proactively suggests reminders ("You usually call your mom on Sundays — want me to remind you?")

5. **Quick actions:** One-tap snooze, reschedule, or mark complete with smart follow-ups ("You snoozed this 3 times — should I move it to tomorrow?")

## Monetization strategy

**Free tier (hook):**
- Unlimited basic reminders (time-based only)
- Up to 3 shared memory spaces
- Voice input
- 50 AI-powered reminder suggestions per month

**Premium ($4.99/month or $39.99/year):**
- Unlimited AI suggestions and natural language processing
- Location-based triggers (geofencing)
- Unlimited shared spaces
- Priority support
- Advanced analytics (memory patterns, completion rates)
- Custom reminder sounds and themes

**Family plan ($12.99/month):**
- Up to 6 accounts
- Shared family dashboard
- Coordinated reminders (e.g., "Dad picked up kids — Mom's reminder auto-dismissed")

**Retention drivers:**
- AI gets smarter over time (personalized to your life)
- Shared spaces create network effects (can't leave without disrupting family)
- Habit formation creates dependency (you rely on it daily)
- Data lock-in (your memory history is valuable)

**Pricing reasoning:** Slightly above basic to-do apps ($2.99) but below productivity suites ($9.99). The AI and social features justify premium positioning. Annual discount (33% off) encourages long-term commitment.

## File structure

```
memorymate/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home/Today view
│   │   ├── memories.tsx           # All reminders list
│   │   ├── shared.tsx             # Shared spaces
│   │   └── settings.tsx           # Settings/profile
│   ├── _layout.tsx                # Root layout
│   ├── add-memory.tsx             # Add/edit reminder modal
│   └── space/[id].tsx             # Shared space detail
├── components/
│   ├── MemoryCard.tsx             # Reminder card component
│   ├── VoiceInput.tsx             # Voice capture button
│   ├── SmartSuggestions.tsx       # AI suggestion chips
│   └── QuickActions.tsx           # Snooze/complete buttons
├── lib/
│   ├── db.ts                      # SQLite setup and queries
│   ├── ai.ts                      # OpenAI integration
│   ├── notifications.ts           # Push notification logic
│   ├── location.ts                # Geofencing helpers
│   └── types.ts                   # TypeScript types
├── store/
│   └── memoryStore.ts             # Zustand state management
├── __tests__/
│   ├── db.test.ts                 # Database operations
│   ├── ai.test.ts                 # AI parsing logic
│   ├── notifications.test.ts     # Notification scheduling
│   └── memoryStore.test.ts        # State management
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

**lib/__tests__/db.test.ts** — Database CRUD operations
**lib/__tests__/ai.test.ts** — Natural language parsing and suggestion generation
**lib/__tests__/notifications.test.ts** — Reminder scheduling and trigger logic
**store/__tests__/memoryStore.test.ts** — State mutations and persistence

## Implementation steps

1. **Project setup**
   ```bash
   npx create-expo-app memorymate --template tabs
   cd memorymate
   npx expo install expo-sqlite expo-notifications expo-location expo-speech
   npm install zustand openai date-fns
   npm install -D jest @testing-library/react-native @testing-library/jest-native
   ```

2. **Database schema (lib/db.ts)**
   - Create SQLite tables: `memories` (id, title, description, trigger_type, trigger_value, completed, created_at, user_id), `spaces` (id, name, members), `space_memories` (space_id, memory_id)
   - Write helper functions: `createMemory()`, `getMemories()`, `updateMemory()`, `deleteMemory()`, `createSpace()`, `addMemberToSpace()`

3. **Type definitions (lib/types.ts)**
   - Define `Memory`, `Space`, `TriggerType` (time, location, routine), `User` interfaces

4. **State management (store/memoryStore.ts)**
   - Zustand store with actions: `addMemory`, `toggleComplete`, `snoozeMemory`, `fetchMemories`, `syncSpaces`
   - Persist state to SQLite on mutations

5. **AI integration (lib/ai.ts)**
   - `parseNaturalLanguage(input: string)` — Extract intent, trigger type, and details from user input
   - `generateSuggestions(userHistory: Memory[])` — Analyze patterns and suggest new reminders
   - Use OpenAI API with structured outputs (JSON mode)

6. **Notification system (lib/notifications.ts)**
   - Request permissions on app launch
   - `scheduleNotification(memory: Memory)` — Schedule based on trigger type
   - `cancelNotification(memoryId: string)`
   - Handle notification taps to open specific memory

7. **Location triggers (lib/location.ts)**
   - Request location permissions
   - `setupGeofence(memory: Memory)` — Monitor location for proximity triggers
   - Background location tracking (iOS/Android config in app.json)

8. **Home screen (app/(tabs)/index.tsx)**
   - Display today's reminders grouped by time
   - Show AI suggestions at top
   - Quick add button (voice or text)
   - Pull-to-refresh

9. **Voice input (components/VoiceInput.tsx)**
   - Record audio, convert to text (expo-speech)
   - Pass to AI parser
   - Show parsed result for confirmation before saving

10. **Add/edit modal (app/add-memory.tsx)**
    - Text input with AI parsing preview
    - Manual trigger type selection (fallback)
    - Date/time picker for time-based
    - Location picker for location-based
    - Space selector for shared reminders

11. **Shared spaces (app/(tabs)/shared.tsx)**
    - List all spaces user belongs to
    - Create new space flow
    - Invite members (share code or link)

12. **Space detail (app/space/[id].tsx)**
    - Show all memories in space
    - Member list with roles
    - Add memory to space

13. **Settings (app/(tabs)/settings.tsx)**
    - Subscription status and upgrade CTA
    - Notification preferences
    - Location permissions toggle
    - Export data option

14. **Testing setup**
    - Configure Jest in package.json
    - Write unit tests for db, ai, notifications, store
    - Mock external dependencies (OpenAI, expo modules)

15. **Styling and polish**
    - Consistent color scheme (calming blues/greens)
    - Smooth animations (react-native-reanimated)
    - Haptic feedback on actions
    - Empty states with helpful CTAs

16. **App configuration (app.json)**
    - Set permissions: notifications, location (background), microphone
    - Configure deep linking for shared space invites
    - Add app icon and splash screen

## How to verify it works

**Local development:**
```bash
npm install
npm test                    # All tests must pass
npx expo start
```

**On device (Expo Go):**
1. Scan QR code from `npx expo start`
2. Grant notification and location permissions when prompted
3. Add a reminder using voice: "Remind me to call mom tomorrow at 5 PM"
4. Verify reminder appears in home screen
5. Wait for notification at scheduled time (or change device time to test)
6. Create a shared space and add a reminder
7. Test location trigger by setting a geofence near current location

**Production build:**
```bash
eas build --platform ios
eas build --platform android
```

**Success criteria:**
- All Jest tests pass (`npm test`)
- Voice input correctly parses natural language
- Notifications fire at correct times
- Location triggers activate within geofence
- Shared spaces sync across devices (test with two phones)
- App launches without crashes on iOS 15+ and Android 10+