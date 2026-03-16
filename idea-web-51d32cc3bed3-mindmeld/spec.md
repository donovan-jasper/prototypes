# MindMeld Mobile App Specification

## 1. App Name

**FlowState**

## 2. One-Line Pitch

Your life, on autopilot—smart reminders and habits that adapt to you, so you never forget what matters.

## 3. Expanded Vision

### Who is this REALLY for?

**Primary Audience:**
- **Busy professionals (25-45)** juggling meetings, deadlines, and personal commitments
- **Students (18-25)** managing classes, assignments, social life, and part-time work
- **Parents (30-50)** coordinating family schedules, appointments, and household tasks
- **Neurodivergent individuals** (ADHD, autism) who benefit from external structure and routine support
- **Caregivers** managing medication schedules, appointments for elderly parents or dependents

**Broadest Audience:**
Anyone who feels overwhelmed by the mental load of remembering everything. This isn't just a productivity app—it's a cognitive assistant that reduces anxiety and decision fatigue.

**Adjacent Use Cases:**
- **Health & Wellness:** Medication reminders, hydration tracking, exercise habits
- **Financial Management:** Bill payment reminders, subscription tracking
- **Relationship Maintenance:** Birthday reminders, "check in with mom" nudges, gift ideas
- **Home Management:** Maintenance schedules (change air filter, water plants)
- **Learning & Growth:** Language practice, reading goals, skill-building habits

**Why Non-Technical People Want This:**
Unlike complex productivity systems (Notion, Obsidian), FlowState requires zero setup. It learns from your behavior—when you grocery shop, when you exercise, when you're most productive—and proactively suggests reminders. It's the difference between a manual calendar and a personal assistant.

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local Storage:** SQLite (expo-sqlite)
- **State Management:** Zustand (lightweight, minimal boilerplate)
- **Notifications:** expo-notifications
- **Location:** expo-location (for context-aware triggers)
- **Date/Time:** date-fns
- **ML/AI:** TensorFlow.js Lite (for on-device pattern recognition)
- **Testing:** Jest + React Native Testing Library
- **Analytics:** expo-analytics (privacy-focused)

## 5. Core Features (MVP)

### 1. Smart Reminder Creation
- Natural language input: "Remind me to call mom tomorrow at 3pm"
- Voice input support
- Quick-add widget for iOS/Android home screen
- Automatic categorization (work, personal, health, etc.)

### 2. Context-Aware Triggers
- Location-based: "Remind me to buy milk when I'm near a grocery store"
- Time-based patterns: Learn when user typically does tasks and suggest optimal times
- Activity-based: "Remind me to stretch after 2 hours of sitting" (using device motion sensors)

### 3. Habit Tracking with Adaptive Scheduling
- Streak tracking with visual progress
- Flexible scheduling: If user misses a habit, app suggests alternative times
- Habit stacking: "After you finish your morning coffee, do 5 minutes of stretching"

### 4. Intelligent Snooze
- Instead of generic "snooze 10 minutes," app learns optimal snooze patterns
- Suggests better times based on calendar and past behavior
- "You usually complete this task at 7pm—reschedule to then?"

### 5. Weekly Insights Dashboard
- Shows completion rates, busiest times, most-forgotten tasks
- Suggests optimizations: "You complete tasks 40% more often in the morning—want to move these?"
- Celebrates wins to maintain motivation

## 6. Monetization Strategy

### Free Tier (Hook)
- Up to 20 active reminders
- Basic habit tracking (3 habits max)
- Location-based reminders (1 location)
- Weekly insights (last 7 days only)

### Premium Tier: $4.99/month or $39.99/year (17% discount)
**Unlocks:**
- Unlimited reminders and habits
- Advanced context triggers (weather, calendar integration, commute time)
- Cross-device sync (iOS + Android + web dashboard)
- Smart scheduling AI (learns optimal times for each task)
- Recurring task templates
- Export data (CSV, JSON)
- Priority support

**Why This Price Point:**
- Lower than Todoist Premium ($5.99/mo) and Things 3 ($9.99 one-time per platform)
- Comparable to Habitica ($4.99/mo) but with superior AI features
- Annual plan encourages long-term commitment (better LTV)

**Retention Strategy:**
- **Habit streaks:** Users won't want to lose progress (sunk cost fallacy works in our favor)
- **Personalization lock-in:** The longer they use it, the smarter it gets—switching costs increase
- **Monthly "You saved X hours this month" reports** to reinforce value
- **Social proof:** "You're in the top 10% of consistent users" badges

## 7. Market Gap Analysis

**NOT SKIPPING** — Here's why:

While Todoist, Microsoft To-Do, and Apple Reminders are well-funded, they are **feature-rich but not intelligent**. They require manual input and don't learn from user behavior. The gap is clear:

- **Todoist:** Powerful but overwhelming for casual users; no AI-driven suggestions
- **Microsoft To-Do:** Basic, lacks context-awareness
- **Apple Reminders:** Limited to Apple ecosystem, no habit tracking
- **Habitica:** Gamified but not practical for real-world task management
- **Motion, Reclaim.ai:** Focus on calendar blocking for professionals, not general life management

**FlowState's Differentiator:** On-device ML that learns user patterns without sending data to servers (privacy-first), combined with a dead-simple UX that requires zero manual setup.

## 8. File Structure

```
flowstate/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home (Today's tasks)
│   │   ├── habits.tsx             # Habit tracker
│   │   ├── insights.tsx           # Weekly insights
│   │   └── settings.tsx           # Settings & premium
│   ├── _layout.tsx                # Root layout
│   └── add-reminder.tsx           # Modal for adding reminders
├── components/
│   ├── ReminderCard.tsx           # Individual reminder display
│   ├── HabitCard.tsx              # Habit progress card
│   ├── SmartSuggestion.tsx        # AI-suggested reminder
│   ├── StreakBadge.tsx            # Visual streak indicator
│   └── PremiumGate.tsx            # Paywall component
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── notifications.ts           # Notification scheduling
│   ├── ml-engine.ts               # Pattern recognition logic
│   ├── location.ts                # Location-based triggers
│   └── analytics.ts               # Privacy-focused tracking
├── store/
│   ├── reminders.ts               # Zustand store for reminders
│   ├── habits.ts                  # Zustand store for habits
│   └── user.ts                    # User preferences & premium status
├── types/
│   └── index.ts                   # TypeScript interfaces
├── __tests__/
│   ├── database.test.ts
│   ├── ml-engine.test.ts
│   ├── notifications.test.ts
│   └── components/
│       ├── ReminderCard.test.tsx
│       └── HabitCard.test.tsx
├── app.json
├── package.json
├