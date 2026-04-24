```markdown
# CramCaster Evolution: FocusFlow

## 1. App Name
**FocusFlow** — Short, punchy, and implies movement toward focus. Alternatives considered: *MindSprint*, *ClarityPulse*, *FlowState*.

## 2. One-line pitch
"Your calendar, your focus. Auto-block distractions and crush your day with real-time progress tied to your schedule."

## 3. Expanded vision
**Broadest audience:**
- **Remote workers** (auto-mute during meetings, silent focus zones)
- **Students** (study sprints synced to class schedules)
- **Parents** (screen-time limits during school hours)
- **Executives** (priority mode during high-stakes calls)
- **Gamers** (focus sessions during competitive hours)

**Adjacent use cases:**
- **Work-life balance** (auto-switch to "do not disturb" after work hours)
- **Productivity coaching** (track focus streaks for accountability)
- **Team collaboration** (shared focus rooms for remote teams)

**Why non-technical users want this:**
- **Parents** who want to enforce screen limits without nagging
- **Executives** who hate being interrupted during critical calls
- **Students** who struggle with procrastination during exam weeks

## 4. Tech stack
- **React Native (Expo)** for cross-platform
- **SQLite** for local storage (calendar sync, task history)
- **Calendar APIs** (Google Calendar, Apple Calendar)
- **Ambient sensors** (microphone for noise detection, notification blocking)
- **Minimal deps**: `expo-calendar`, `expo-notifications`, `expo-av`

## 5. Core features (MVP)
1. **Auto-Focus Zones** — Detects calendar events and auto-mutes notifications/phone calls.
2. **Real-Time Progress Bar** — Shows focus time vs. scheduled time.
3. **Distraction Blocker** — Auto-closes distracting apps (e.g., social media) during focus sessions.
4. **Task Sync** — Pulls tasks from calendar events and to-do apps (Google Tasks, Microsoft To Do).

## 6. Monetization strategy
- **Free tier**: Basic focus timer, calendar sync, distraction blocking.
- **Premium ($4.99/month)**:
  - AI task prioritization (suggests best times to tackle tasks)
  - Team collaboration (shared focus rooms)
  - Advanced analytics (focus streaks, productivity reports)
- **Retention hooks**:
  - Gamification (streaks, badges)
  - Social proof (leaderboards for focus time)
  - Weekly progress reports (email/slack)

## 7. Skip if saturated
**SKIP: Incumbent apps (Forest, Focus@Will) dominate the focus timer space. However, FocusFlow’s calendar integration and ambient blocking make it unique.**

## 8. File structure
```
focusflow/
├── app/
│   ├── components/
│   ├── screens/
│   ├── utils/
│   └── services/
├── assets/
├── tests/
│   ├── __tests__/
│   └── jest.setup.js
├── app.json
└── package.json
```

## 9. Tests (Jest)
```javascript
// tests/__tests__/focusTimer.test.js
import { calculateFocusProgress } from '../../app/utils/focusTimer';

describe('Focus Timer', () => {
  it('calculates progress correctly', () => {
    const result = calculateFocusProgress(30, 60); // 30s elapsed, 60s total
    expect(result).toBe(50); // 50% progress
  });
});
```

## 10. Implementation steps
1. **Setup Expo project**:
   ```bash
   npx create-expo-app FocusFlow --template expo-template-blank-typescript
   ```
2. **Install deps**:
   ```bash
   expo install expo-calendar expo-notifications expo-av
   ```
3. **Build core components**:
   - `FocusTimerScreen` (countdown, progress bar)
   - `CalendarSync` (event detection)
   - `DistractionBlocker` (app blocking logic)
4. **Write tests** for each feature.
5. **Deploy to Expo Go** for testing.

## 11. Verification
- Run `npm test` to ensure all tests pass.
- Test on device/simulator:
  - Calendar events trigger focus mode.
  - Notifications are blocked during focus.
  - Progress bar updates in real-time.
```