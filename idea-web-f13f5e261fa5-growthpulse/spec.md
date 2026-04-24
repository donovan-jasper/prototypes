```markdown
# GrowthPulse App Spec

## 1. App Name
**ProgressPulse** (or **PulsePro** if "ProgressPulse" is taken)

## 2. One-line pitch
"Track habits, boost productivity, and unlock your potential with AI-powered insights and social accountability."

## 3. Expanded vision
**Broadest audience:**
- **Lifelong learners** (tracking skills, reading, language study)
- **Parents** (monitoring child development, screen time, sleep)
- **Corporate employees** (career growth, stress management, work-life balance)
- **Freelancers/entrepreneurs** (tracking income, productivity, mental health)
- **Students** (academic progress, study habits, exam prep)
- **Fitness enthusiasts** (beyond just workouts, including nutrition, recovery)

**Adjacent use cases:**
- **Therapists** (patient progress tracking)
- **HR teams** (employee well-being analytics)
- **Coaches** (athlete/client performance monitoring)
- **Schools/universities** (student development programs)

**Why non-technical users?**
- No manual logging needed (auto-syncs with wearables, calendars, apps)
- Gamified but not gimmicky (real progress, not just points)
- AI explains trends in plain language ("Your sleep improved 15% after reducing screen time")

## 4. Tech stack
- **Frontend:** React Native (Expo) + TypeScript
- **Backend:** Firebase (Auth, Firestore, Functions)
- **Storage:** SQLite (local) + Firebase (cloud sync)
- **AI:** TensorFlow Lite (on-device) + custom ML models
- **Health:** Apple HealthKit + Google Fit
- **Notifications:** Expo Notifications

## 5. Core features (MVP)
1. **Auto-tracking hub**
   - Syncs with 10+ apps (Google Calendar, Apple Health, Notion, etc.)
   - Auto-detects habits (e.g., "You meditated 3x this week")

2. **AI-powered insights**
   - "Why did your productivity drop last week?" (voice explanation)
   - "Your sleep quality correlates with workouts—great job!"

3. **Social accountability**
   - Join "challenges" (e.g., "30-day fitness streak")
   - Anonymous or public leaderboards

4. **Progress dashboard**
   - Visual trends (graphs, streaks)
   - Customizable widgets (e.g., "Water intake", "Reading time")

5. **Quick journal**
   - One-tap mood check-ins
   - Voice notes for reflections

## 6. Monetization strategy
- **Free tier:**
  - Basic tracking + manual entry
  - Limited AI insights (3/month)
  - No social features

- **Paid ($9.99/month):**
  - Full auto-tracking + AI insights
  - Social challenges + leaderboards
  - "Why" explanations (detailed analysis)
  - Export data (CSV/PDF)

- **Lifetime ($49.99):**
  - All premium features
  - Priority support
  - No ads

**Retention hooks:**
- "Your AI coach just noticed a pattern—unlock full insights now!"
- "You're in the top 10% of users like you—keep it up!"
- "Your progress report is ready—share it with your coach"

## 7. Skip if saturated
SKIP: Notion and Apple Health already cover basic tracking. ProgressPulse must differentiate with:
- **AI explanations** (not just data)
- **Social accountability** (beyond Notion’s "share" feature)
- **Gamification without rewards** (real progress, not points)

## 8. File structure
```
progresspulse/
├── app/
│   ├── (tabs)/
│   │   ├── home/
│   │   ├── insights/
│   │   ├── social/
│   │   └── settings/
├── components/
├── hooks/
├── lib/
│   ├── api/
│   ├── db/
│   └── ml/
├── tests/
│   ├── unit/
│   └── e2e/
└── utils/
```

## 9. Tests
```javascript
// tests/unit/habitTracker.test.ts
import { calculateStreak } from '../../lib/habitTracker';

describe('Habit Streak Logic', () => {
  it('should increment streak for consecutive days', () => {
    const dates = ['2023-01-01', '2023-01-02', '2023-01-03'];
    expect(calculateStreak(dates)).toBe(3);
  });

  it('should reset streak on missed day', () => {
    const dates = ['2023-01-01', '2023-01-03'];
    expect(calculateStreak(dates)).toBe(1);
  });
});
```

## 10. Implementation steps
1. **Setup:**
   - `expo init progresspulse --template expo-template-blank-typescript`
   - Add Firebase, SQLite, and HealthKit/Fit SDKs

2. **Core flow:**
   - Build auto-tracking pipeline (Firebase Functions + webhooks)
   - Implement SQLite schema for offline-first data
   - Add TensorFlow Lite model for on-device AI

3. **UI:**
   - Design tab-based navigation (Home, Insights, Social, Settings)
   - Build habit tracker UI with animations

4. **Testing:**
   - Write Jest tests for core logic (streaks, sync, AI)
   - Add Detox for UI tests

5. **Monetization:**
   - Implement in-app purchases
   - Add feature gating

## 11. Verification
- Run `npm test` (all unit tests pass)
- Test auto-sync with Google Fit/Apple Health
- Verify AI insights generate in <2s
- Check social features work in Expo Go
```