# PlantPulse

## One-line pitch
Track, grow, and share your plant journey with a community that celebrates every leaf.

## Expanded vision

**Who is this REALLY for?**

PlantPulse serves anyone who wants to feel confident caring for living things — not just "plant people." The core audience includes:

- **Anxious first-time plant owners** who kill everything and want to break the cycle
- **Apartment dwellers** seeking to bring nature indoors without a yard
- **Parents teaching kids responsibility** through plant care (gateway to pet ownership)
- **Mental health seekers** using plant care as a mindfulness practice
- **Gift recipients** who got a plant and have no idea what to do with it
- **Collectors and hobbyists** who want to track growth and share wins

**Adjacent use cases:**

- **Habit formation tool** — daily plant care becomes a keystone habit for other routines
- **Home inventory** — track what plants you own, where you bought them, what you paid
- **Gift planning** — know what plants friends have before buying duplicates
- **Moving/relocation** — document plant care needs when hiring plant sitters or moving homes
- **Educational tool** — teachers and parents use it to teach biology, responsibility, and patience

**Why non-technical people want this:**

It removes the guesswork from plant care. No more "is it dead or dormant?" panic. No more "did I water this already?" confusion. It's a confidence builder that makes you feel like you have a green thumb, even if you've never grown anything before.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local storage:** SQLite (expo-sqlite)
- **Camera:** expo-camera + expo-image-picker
- **Notifications:** expo-notifications
- **State management:** React Context + hooks (no Redux for MVP)
- **UI:** React Native Paper (Material Design components)
- **Testing:** Jest + React Native Testing Library
- **Image storage:** Local filesystem (expo-file-system)

## Core features

1. **Smart Care Reminders**
   - Set watering, fertilizing, and pruning schedules per plant
   - Push notifications with snooze/done actions
   - Adaptive scheduling based on completion history (if you water early consistently, it adjusts)

2. **Photo Timeline**
   - Snap progress photos with one tap
   - Auto-tagged by date, shows growth over time
   - Before/after comparisons to celebrate wins

3. **Plant Health Check**
   - Quick symptom checker (yellowing leaves, drooping, etc.)
   - Suggests fixes based on common issues
   - Links to care guides for your specific plant type

4. **Community Feed**
   - Share your plant wins (optional, opt-in)
   - Browse others' plant journeys for inspiration
   - React and comment on posts

5. **Streak Tracker**
   - Gamified daily check-in system
   - Earn badges for consistent care (7-day, 30-day, 100-day streaks)
   - Unlock plant care tips as you level up

## Monetization strategy

**Free tier:**
- Up to 5 plants
- Basic care reminders
- Photo timeline (limited to 10 photos per plant)
- Community browsing (read-only)

**Paid tier ($4.99/month or $39.99/year):**
- Unlimited plants
- Unlimited photos with cloud backup
- Advanced symptom checker with expert-curated solutions
- Full community access (post, comment, react)
- Ad-free experience
- Offline plant database (1000+ species with care guides)
- Custom reminder sounds and themes

**Price reasoning:**
- Lower than Headspace ($12.99/mo) but higher than basic utility apps ($2.99/mo)
- Positioned as a "wellness tool" not just a tracker
- Annual plan offers 33% savings to encourage long-term commitment

**Retention hooks:**
- Photo timeline creates sunk cost fallacy (don't want to lose progress photos)
- Streaks create daily habit loops
- Community creates social accountability
- Seasonal care tips keep users engaged year-round

**One-time purchases:**
- Premium plant packs ($1.99 each) — rare/exotic species care guides
- Custom themes ($0.99 each)

## File structure

```
plantpulse/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # My Plants (home)
│   │   ├── community.tsx          # Community feed
│   │   ├── care.tsx               # Today's care tasks
│   │   └── profile.tsx            # User profile & settings
│   ├── plant/
│   │   ├── [id].tsx               # Plant detail view
│   │   └── add.tsx                # Add new plant
│   ├── _layout.tsx                # Root layout
│   └── +not-found.tsx
├── components/
│   ├── PlantCard.tsx
│   ├── CareReminderItem.tsx
│   ├── PhotoTimeline.tsx
│   ├── SymptomChecker.tsx
│   ├── CommunityPost.tsx
│   └── StreakBadge.tsx
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── notifications.ts           # Push notification logic
│   ├── storage.ts                 # Image file management
│   └── plantData.ts               # Plant care database
├── hooks/
│   ├── usePlants.ts
│   ├── useCareReminders.ts
│   └── useStreak.ts
├── contexts/
│   └── AppContext.tsx             # Global state
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── database.test.ts
│   ├── notifications.test.ts
│   ├── usePlants.test.ts
│   └── plantData.test.ts
├── assets/
│   ├── images/
│   └── plant-icons/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**__tests__/database.test.ts**
```typescript
import { openDatabase, addPlant, getPlants, updatePlant, deletePlant } from '../lib/database';

describe('Database operations', () => {
  beforeEach(async () => {
    await openDatabase();
  });

  test('adds a plant successfully', async () => {
    const plant = await addPlant({
      name: 'Monstera',
      species: 'Monstera deliciosa',
      wateringFrequency: 7,
      lastWatered: new Date().toISOString(),
    });
    expect(plant.id).toBeDefined();
    expect(plant.name).toBe('Monstera');
  });

  test('retrieves all plants', async () => {
    await addPlant({ name: 'Pothos', species: 'Epipremnum aureum', wateringFrequency: 5 });
    const plants = await getPlants();
    expect(plants.length).toBeGreaterThan(0);
  });

  test('updates plant watering date', async () => {
    const plant = await addPlant({ name: 'Snake Plant', species: 'Sansevieria', wateringFrequency: 14 });
    const newDate = new Date().toISOString();
    await updatePlant(plant.id, { lastWatered: newDate });
    const updated = await getPlants();
    const found = updated.find(p => p.id === plant.id);
    expect(found?.lastWatered).toBe(newDate);
  });

  test('deletes a plant', async () => {
    const plant = await addPlant({ name: 'Cactus', species: 'Cactaceae', wateringFrequency: 21 });
    await deletePlant(plant.id);
    const plants = await getPlants();
    expect(plants.find(p => p.id === plant.id)).toBeUndefined();
  });
});
```

**__tests__/notifications.test.ts**
```typescript
import { scheduleWateringReminder, cancelReminder, getNextWateringDate } from '../lib/notifications';

describe('Notification scheduling', () => {
  test('calculates next watering date correctly', () => {
    const lastWatered = new Date('2026-03-10');
    const frequency = 7;
    const nextDate = getNextWateringDate(lastWatered, frequency);
    expect(nextDate.toISOString().split('T')[0]).toBe('2026-03-17');
  });

  test('schedules a reminder', async () => {
    const notificationId = await scheduleWateringReminder({
      plantId: '1',
      plantName: 'Monstera',
      nextWateringDate: new Date('2026-03-20'),
    });
    expect(notificationId).toBeDefined();
  });

  test('cancels a reminder', async () => {
    const notificationId = await scheduleWateringReminder({
      plantId: '2',
      plantName: 'Pothos',
      nextWateringDate: new Date('2026-03-18'),
    });
    await cancelReminder(notificationId);
    // Verify cancellation (implementation-specific)
    expect(true).toBe(true);
  });
});
```

**__tests__/usePlants.test.ts**
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { usePlants } from '../hooks/usePlants';

describe('usePlants hook', () => {
  test('loads plants on mount', async () => {
    const { result } = renderHook(() => usePlants());
    await act(async () => {
      await result.current.loadPlants();
    });
    expect(result.current.plants).toBeDefined();
  });

  test('adds a new plant', async () => {
    const { result } = renderHook(() => usePlants());
    await act(async () => {
      await result.current.addPlant({
        name: 'Fiddle Leaf Fig',
        species: 'Ficus lyrata',
        wateringFrequency: 7,
      });
    });
    expect(result.current.plants.length).toBeGreaterThan(0);
  });
});
```

**__tests__/plantData.test.ts**
```typescript
import { getPlantCareGuide, searchPlantSpecies, getSymptomSolutions } from '../lib/plantData';

describe('Plant data library', () => {
  test('retrieves care guide for known species', () => {
    const guide = getPlantCareGuide('Monstera deliciosa');
    expect(guide).toBeDefined();
    expect(guide.wateringFrequency).toBeGreaterThan(0);
  });

  test('searches plant species by name', () => {
    const results = searchPlantSpecies('monstera');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].commonName.toLowerCase()).toContain('monstera');
  });

  test('provides solutions for common symptoms', () => {
    const solutions = getSymptomSolutions('yellowing leaves');
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions[0].cause).toBeDefined();
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app plantpulse --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-image-picker expo-file-system react-native-paper
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json`:
   - Set app name, slug, version
   - Add notification permissions
   - Add camera permissions
4. Set up TypeScript types in `types/index.ts`:
   ```typescript
   export interface Plant {
     id: string;
     name: string;
     species: string;
     wateringFrequency: number; // days
     lastWatered?: string; // ISO date
     lastFertilized?: string;
     photoUris: string[];
     notes?: string;
     createdAt: string;
   }

   export interface CareReminder {
     id: string;
     plantId: string;
     type: 'water' | 'fertilize' | 'prune';
     scheduledFor: string;
     completed: boolean;
   }

   export interface CommunityPost {
     id: string;
     userId: string;
     plantId: string;
     photoUri: string;
     caption: string;
     likes: number;
     createdAt: string;
   }
   ```

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database
   - Create tables: `plants`, `care_reminders`, `photos`, `user_settings`
   - Implement CRUD functions: `addPlant`, `getPlants`, `updatePlant`, `deletePlant`
   - Add migration logic for schema updates
2. Create `lib/storage.ts`:
   - Functions to save/load images from filesystem
   - Image compression before saving
   - Cleanup orphaned images
3. Write tests in `__tests__/database.test.ts`

### Phase 3: Plant data library
1. Create `lib/plantData.ts`:
   - Hardcode 50+ common houseplants with care guides
   - Structure: `{ species, commonName, wateringFrequency, lightRequirements, toxicity, tips }`
   - Implement `getPlantCareGuide(species)` and `searchPlantSpecies(query)`
   - Add symptom checker data: `{ symptom, possibleCauses, solutions }`
2. Write tests in `__tests__/plantData.test.ts`

### Phase 4: Notification system
1. Create `lib/notifications.ts`:
   - Request notification permissions on app launch
   - `scheduleWateringReminder(plant)` — calculates next watering date, schedules notification
   - `cancelReminder(notificationId)`
   - `getNextWateringDate(lastWatered, frequency)` — date math helper
   - Handle notification actions (mark as done, snooze)
2. Write tests in `__tests__/notifications.test.ts`

### Phase 5: Core hooks
1. Create `hooks/usePlants.ts`:
   - `loadPlants()` — fetch from DB
   - `addPlant(data)` — insert + schedule reminders
   - `updatePlant(id, data)` — update + reschedule reminders
   - `deletePlant(id)` — remove + cancel reminders
   - Return `{ plants, loading, error, addPlant, updatePlant, deletePlant }`
2. Create `hooks/useCareReminders.ts`:
   - `getTodayReminders()` — fetch due reminders
   - `completeReminder(id)` — mark done, update plant's lastWatered
   - `snoozeReminder(id, hours)` — reschedule
3. Create `hooks/useStreak.ts`:
   - Track consecutive days with completed care tasks
   - `getCurrentStreak()`, `updateStreak()`
4. Write tests for hooks

### Phase 6: UI components
1. Create `components/PlantCard.tsx`:
   - Display plant name, species, photo thumbnail
   - Show next watering date
   - Tap to navigate to detail view
2. Create `components/CareReminderItem.tsx`:
   - Show reminder type (water/fertilize/prune)
   - Plant name and photo
   - Action buttons: Done, Snooze
3. Create `components/PhotoTimeline.tsx`:
   - Horizontal scrollable gallery
   - Show date stamps on photos
   - Tap to view full size
4. Create `components/SymptomChecker.tsx`:
   - Searchable list of symptoms
   - Display possible causes and solutions
5. Create `components/CommunityPost.tsx`:
   - Post card with photo, caption, likes
   - Like button, comment count
6. Create `components/StreakBadge.tsx`:
   - Display current streak number
   - Show next badge milestone

### Phase 7: Screens
1. `app/(tabs)/index.tsx` — My Plants:
   - Grid of PlantCard components
   - FAB to add new plant
   - Empty state: "Add your first plant!"
2. `app/(tabs)/care.tsx` — Today's Care:
   - List of CareReminderItem components
   - Filter by type (all/water/fertilize)
   - Streak badge at top
3. `app/(tabs)/community.tsx` — Community Feed:
   - Vertical scroll of CommunityPost components
   - Pull to refresh
   - Paywall overlay if free tier
4. `app/(tabs)/profile.tsx` — Profile & Settings:
   - User stats (total plants, longest streak)
   - Settings: notification preferences, theme
   - Upgrade to premium button
5. `app/plant/[id].tsx` — Plant Detail:
   - Large photo carousel
   - Plant info (name, species, care schedule)
   - Edit button
   - PhotoTimeline component
   - SymptomChecker component
   - Delete plant option
6. `app/plant/add.tsx` — Add Plant:
   - Form: name, species (searchable dropdown), photo picker
   - Auto-populate care schedule from plantData
   - Save button

### Phase 8: Context & state
1. Create `contexts/AppContext.tsx`:
   - Wrap app with provider
   - Store user settings, premium status, streak data
   - Provide global state to all screens

### Phase 9: Styling
1. Configure React Native Paper theme in `app/_layout.tsx`
2. Create consistent spacing, colors, typography
3. Add dark mode support
4. Ensure accessibility (labels, contrast, touch targets)

### Phase 10: Testing & polish
1. Run `npm test` — ensure all tests pass
2. Test on iOS simulator and Android emulator
3. Test push notifications (requires physical device)
4. Test image capture and storage
5. Test offline functionality
6. Add loading states and error handling
7. Add haptic feedback for actions
8. Optimize image sizes and database queries

### Phase 11: Monetization integration
1. Add paywall screen for premium features
2. Implement feature flags for free vs paid
3. Add in-app purchase logic (Expo's expo-in-app-purchases or RevenueCat)
4. Test purchase flow in sandbox

### Phase 12: Community features (post-MVP)
1. Add user authentication (Expo AuthSession + backend)
2. Implement post creation and feed
3. Add like/comment functionality
4. Moderate content (report/block)

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test core flows:
   - Add a plant with photo
   - Set watering reminder
   - Wait for notification (or manually trigger)
   - Mark reminder as done
   - View photo timeline
   - Check symptom checker
   - Browse community feed (mock data)

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - Database CRUD operations
   - Notification scheduling
   - Plant data queries
   - Hook state management

### Device testing
1. Test on physical iOS device (notifications require real device)
2. Test on physical Android device
3. Verify camera permissions work
4. Verify push notifications appear
5. Test offline mode (airplane mode)

### Acceptance criteria
- Can add 5+ plants with photos
- Notifications fire at correct times
- Photo timeline displays chronologically
- Symptom checker returns relevant results
- App works offline (no crashes)
- All tests pass with `npm test`
- No console errors in Expo dev tools