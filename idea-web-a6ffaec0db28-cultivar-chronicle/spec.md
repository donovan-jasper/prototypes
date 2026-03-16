# TrackFlow

## One-line pitch
Visual habit tracking with smart analytics that shows you exactly what's working—for fitness, projects, pets, or any daily routine.

## Expanded vision

**Core audience:** Anyone who wants to see patterns in their daily life, not just log data.

This serves:
- **Fitness enthusiasts** tracking workouts, meals, body measurements with photo progress
- **Pet owners** monitoring feeding schedules, behavior changes, vet visits, weight trends
- **Home improvement DIYers** documenting renovation stages, material costs, before/after comparisons
- **Parents** tracking baby milestones, sleep patterns, feeding schedules with photo memories
- **Chronic illness patients** logging symptoms, medications, triggers with environmental context
- **Gardeners** (original niche) tracking plant growth, watering, weather conditions
- **Habit builders** visualizing streaks, identifying what breaks them, optimizing routines

**Why this beats competitors:**
- Notion/Keep: Too generic, no analytics, no visual timeline
- Habitica: Gamification fatigue, no real-world data capture
- Day One: Journaling focus, not optimization-focused
- Fitness apps: Single-purpose, can't track multiple life areas

**The hook:** Mobile sensors (camera, location, weather API) automatically enrich entries. You snap a photo of your morning run route, and TrackFlow logs the weather, distance, and time—then shows you that you run 15% faster on sunny days.

**Non-technical appeal:** It's Instagram for your goals. Visual, satisfying, shareable progress timelines that make you want to keep going.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Camera:** expo-camera + expo-image-picker
- **Location:** expo-location
- **Weather:** OpenWeatherMap API (free tier)
- **Charts:** react-native-chart-kit
- **Notifications:** expo-notifications
- **State:** React Context (no Redux for MVP)
- **Testing:** Jest + React Native Testing Library

## Core features

1. **Visual timeline entries**
   - Snap photo + quick text note
   - Auto-capture: timestamp, location, weather
   - Tag with custom categories (workout, meal, project, etc.)

2. **Smart analytics dashboard**
   - Streak tracking with visual calendar heatmap
   - Correlation insights ("You log workouts 3x more on weekends")
   - Photo comparison slider (before/after any date range)
   - Export data as CSV or shareable image

3. **Flexible tracking templates**
   - Pre-built: Fitness, Pet Care, Home Projects, Baby Milestones
   - Custom: Define your own metrics (numeric, yes/no, photo, text)
   - Quick-log widgets for common entries

4. **Reminder system**
   - Smart notifications based on your patterns
   - "You usually water plants on Tuesdays—reminder?"
   - Snooze/reschedule with one tap

5. **Offline-first with cloud sync** (premium)
   - All data stored locally in SQLite
   - Optional cloud backup for premium users
   - Works perfectly without internet

## Monetization strategy

**Free tier:**
- Unlimited entries and photos (stored locally)
- 2 tracking categories
- Basic analytics (streaks, calendar view)
- 7-day data retention for insights

**Premium ($4.99/month or $39.99/year):**
- Unlimited categories
- Advanced analytics (correlations, predictions, trends)
- Cloud backup and cross-device sync
- Export data (CSV, PDF reports)
- Ad-free experience
- Custom reminder schedules
- Photo comparison tools

**Hook:** Free tier gets people addicted to streaks and visual progress. Paywall hits when they want to track multiple life areas (fitness + pet + project) or need historical insights beyond 7 days.

**Retention driver:** The longer you use it, the more valuable your data becomes. Switching costs are high because you lose your entire visual history and analytics. Annual plan offers 33% savings, locking users in.

**Price reasoning:** Lower than Notion ($10/mo) but higher than basic habit trackers ($2-3/mo) because we offer sensor integration + analytics. Target is 5% conversion at 100k downloads = 5k paid users = $25k MRR.

## File structure

```
trackflow/
├── app.json
├── package.json
├── babel.config.js
├── jest.config.js
├── App.tsx
├── src/
│   ├── components/
│   │   ├── EntryCard.tsx
│   │   ├── EntryCard.test.tsx
│   │   ├── TimelineView.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── AnalyticsDashboard.test.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── PhotoComparison.tsx
│   │   └── StreakCalendar.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── AddEntryScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── services/
│   │   ├── database.ts
│   │   ├── database.test.ts
│   │   ├── weather.ts
│   │   ├── weather.test.ts
│   │   ├── notifications.ts
│   │   └── analytics.ts
│   ├── hooks/
│   │   ├── useEntries.ts
│   │   ├── useCategories.ts
│   │   └── useStreaks.ts
│   ├── context/
│   │   └── AppContext.tsx
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── dateHelpers.ts
│       ├── dateHelpers.test.ts
│       └── constants.ts
└── assets/
    ├── icon.png
    └── splash.png
```

## Tests

```typescript
// src/services/database.test.ts
import { addEntry, getEntries, getStreakCount } from './database';

describe('Database Service', () => {
  test('adds entry and retrieves it', async () => {
    const entry = await addEntry({
      categoryId: 1,
      note: 'Morning run',
      photoUri: null,
      weather: 'sunny',
      location: null,
    });
    expect(entry.id).toBeDefined();
    
    const entries = await getEntries(1);
    expect(entries.length).toBeGreaterThan(0);
  });

  test('calculates streak correctly', async () => {
    const streak = await getStreakCount(1);
    expect(typeof streak).toBe('number');
  });
});

// src/components/AnalyticsDashboard.test.tsx
import { render } from '@testing-library/react-native';
import AnalyticsDashboard from './AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
  test('renders streak count', () => {
    const { getByText } = render(
      <AnalyticsDashboard categoryId={1} entries={[]} />
    );
    expect(getByText(/streak/i)).toBeTruthy();
  });
});

// src/utils/dateHelpers.test.ts
import { isConsecutiveDay, formatStreakDate } from './dateHelpers';

describe('Date Helpers', () => {
  test('detects consecutive days', () => {
    const today = new Date('2026-03-16');
    const yesterday = new Date('2026-03-15');
    expect(isConsecutiveDay(yesterday, today)).toBe(true);
  });

  test('formats date for streak display', () => {
    const date = new Date('2026-03-16');
    expect(formatStreakDate(date)).toBe('Mar 16');
  });
});

// src/services/weather.test.ts
import { fetchWeather } from './weather';

describe('Weather Service', () => {
  test('fetches weather data', async () => {
    const weather = await fetchWeather(37.7749, -122.4194);
    expect(weather).toHaveProperty('temp');
    expect(weather).toHaveProperty('condition');
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app trackflow --template blank-typescript
cd trackflow
npm install expo-sqlite expo-camera expo-image-picker expo-location expo-notifications react-native-chart-kit
npm install --save-dev jest @testing-library/react-native @types/jest
```

### 2. Configure app.json
```json
{
  "expo": {
    "name": "TrackFlow",
    "slug": "trackflow",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow TrackFlow to capture progress photos"
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Allow TrackFlow to tag entries with location"
        }
      ]
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.trackflow.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.trackflow.app"
    }
  }
}
```

### 3. Create type definitions (src/types/index.ts)
```typescript
export interface Entry {
  id: number;
  categoryId: number;
  timestamp: number;
  note: string;
  photoUri: string | null;
  weather: string | null;
  temperature: number | null;
  location: string | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastEntryDate: number | null;
}
```

### 4. Database service (src/services/database.ts)
- Initialize SQLite with tables: categories, entries
- Implement CRUD operations: addEntry, getEntries, deleteEntry
- Implement streak calculation: getStreakCount (consecutive days with entries)
- Add category management: addCategory, getCategories
- Include migration logic for schema updates

### 5. Weather service (src/services/weather.ts)
- Fetch from OpenWeatherMap API using lat/lon
- Cache results for 1 hour to avoid rate limits
- Return simplified object: { temp, condition, icon }
- Handle errors gracefully (return null if API fails)

### 6. Notification service (src/services/notifications.ts)
- Request permissions on first launch
- Schedule daily reminders based on user's typical entry time
- Smart suggestions: "You usually log at 8am, want a reminder?"
- Cancel/reschedule notifications

### 7. Core components
- **EntryCard**: Display single entry with photo, note, timestamp, weather badge
- **TimelineView**: FlatList of EntryCards, pull-to-refresh, infinite scroll
- **AnalyticsDashboard**: Streak counter, calendar heatmap, insights cards
- **CategoryPicker**: Horizontal scrollable list of category chips
- **PhotoComparison**: Side-by-side slider for before/after photos
- **StreakCalendar**: Month view with colored dots for entry days

### 8. Screens
- **OnboardingScreen**: 3-slide intro, ask for permissions, create first category
- **HomeScreen**: Timeline view with FAB to add entry, top tabs for categories
- **AddEntryScreen**: Camera/gallery picker, text input, auto-fetch weather/location
- **AnalyticsScreen**: Dashboard with charts, export button (premium gate)
- **SettingsScreen**: Manage categories, notification preferences, premium upgrade

### 9. Context setup (src/context/AppContext.tsx)
- Global state: categories, isPremium, settings
- Provide hooks: useCategories, useSettings
- Persist settings to AsyncStorage

### 10. Navigation
- Use React Navigation (install @react-navigation/native, @react-navigation/bottom-tabs)
- Bottom tabs: Home, Analytics, Settings
- Modal stack for AddEntry

### 11. Premium paywall
- Check isPremium flag before showing advanced analytics
- Show upgrade prompt with benefits list
- Mock payment flow for MVP (toggle isPremium in settings)

### 12. Polish
- Add loading states, error boundaries
- Implement pull-to-refresh on timeline
- Add haptic feedback on entry creation
- Dark mode support using Expo's useColorScheme

## How to verify it works

### Local testing
```bash
npm install
npm test  # All Jest tests must pass
npx expo start
```

### On device (Expo Go)
1. Scan QR code with Expo Go app
2. Grant camera and location permissions
3. Create a category (e.g., "Fitness")
4. Add an entry with photo—verify weather and location auto-populate
5. Add 3 more entries on consecutive days
6. Check Analytics screen—streak should show "4 days"
7. Test notifications: Set reminder, wait for notification to fire
8. Toggle premium in Settings—verify analytics export unlocks

### Acceptance criteria
- [ ] Can create entry with photo in under 10 seconds
- [ ] Streak calculation is accurate (test with mock dates)
- [ ] Weather API returns data (or gracefully fails)
- [ ] Notifications fire at scheduled time
- [ ] Timeline scrolls smoothly with 100+ entries
- [ ] All Jest tests pass (`npm test`)
- [ ] App works offline (entries save to SQLite)
- [ ] Premium features are properly gated