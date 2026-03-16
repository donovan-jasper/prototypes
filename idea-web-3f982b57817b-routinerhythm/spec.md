# RoutineRhythm Spec

## 1. App Name

**FlexFlow**

## 2. One-line pitch

Your life, automatically organized around your ever-changing schedule — so you never miss what matters.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Shift workers (nurses, retail, hospitality, gig drivers, pilots, first responders) who need their personal life to adapt around unpredictable work schedules
- Students juggling variable class schedules, part-time jobs, and social commitments
- Parents managing co-parenting schedules, kids' activities, and work
- Freelancers and contractors with project-based availability

**Broader audience:**
- Anyone with ADHD or executive function challenges who struggles with routine consistency
- People in life transitions (new parents, career changes, relocations) who need structure that adapts
- Busy professionals seeking better work-life integration without manual planning overhead
- Caregivers balancing their own needs with unpredictable care responsibilities

### Adjacent use cases

- **Fitness integration**: Automatically schedule workouts when you have energy windows
- **Social life optimization**: Suggest when to reach out to friends based on your availability patterns
- **Meal planning**: Adapt meal prep and grocery shopping to your schedule
- **Sleep optimization**: Track and suggest ideal sleep windows based on your commitments
- **Energy management**: Learn when you're most productive and schedule accordingly

### Why non-technical people want this

This isn't a productivity tool — it's a **stress reducer**. People don't want to think about when to do laundry, when to call their mom, or when to squeeze in a workout. They want to show up to their life and have it work. FlexFlow removes the cognitive load of constant re-planning when your schedule changes, which is exhausting for anyone but especially critical for those with unpredictable lives.

## 4. Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Database**: SQLite (expo-sqlite) for local-first data
- **State management**: Zustand (lightweight, simple)
- **Date/time**: date-fns (smaller than moment.js)
- **Notifications**: expo-notifications
- **Calendar integration**: expo-calendar (optional, premium feature)
- **UI**: React Native Paper (Material Design components)
- **Testing**: Jest + React Native Testing Library

## 5. Core features (MVP)

### 1. Dynamic Schedule Input
- Quick-add work shifts, appointments, and commitments
- Visual weekly view showing availability gaps
- Import from calendar (premium) or manual entry (free)

### 2. Adaptive Task Queue
- Tasks automatically suggest themselves in available time slots
- Priority-based sorting (urgent, important, flexible)
- One-tap reschedule when plans change
- Smart defaults: "Call dentist" suggests during business hours

### 3. Flexible Routines
- Create routines that adapt to your schedule (e.g., "Morning routine" adjusts if you work early vs late shift)
- Habit tracking that doesn't break streaks when life happens
- Suggested routine templates for common scenarios (shift worker, student, parent)

### 4. Proactive Notifications
- "You have 45 minutes before your shift — time to prep dinner?"
- "Your schedule cleared up tomorrow morning — want to schedule that dentist call?"
- Context-aware: doesn't suggest gym at midnight

### 5. Energy-Aware Scheduling (Premium)
- Track when you complete tasks to learn your energy patterns
- Suggest high-focus tasks during your peak hours
- Protect downtime after draining commitments

## 6. Monetization strategy

### Free tier (the hook)
- Unlimited schedule entries
- Up to 15 active tasks
- 3 flexible routines
- Basic notifications
- Manual schedule input only

### Paid tier: **FlexFlow Pro** — $5.99/month or $49.99/year (17% savings)

**Premium features:**
- Unlimited tasks and routines
- Calendar sync (auto-import work schedules)
- Energy-aware scheduling with analytics
- Advanced notification customization
- Cross-device sync (future: web dashboard)
- Routine templates library
- Weekly insights and optimization suggestions

### Why people stay subscribed

1. **Sunk cost of data**: Once you've trained FlexFlow on your patterns, switching is painful
2. **Compounding value**: The longer you use it, the smarter it gets at predicting your needs
3. **Stress reduction**: The mental relief of not manually re-planning every schedule change is worth $6/month
4. **Time savings**: If it saves 30 minutes of planning per week, that's 26 hours/year — easily worth $50

### Conversion strategy
- 14-day free trial of Pro features
- Prompt upgrade when hitting free tier limits (16th task, 4th routine)
- Show "time saved" metric to demonstrate value
- Offer annual plan at onboarding with discount

## 7. Market position

**NOT SKIP** — Clear gap exists:

- **Todoist/TickTick**: Static task lists, no schedule adaptation
- **Reclaim.ai**: Calendar blocking for knowledge workers, not shift workers or personal life
- **Habit trackers**: Don't integrate with schedule changes
- **Shift worker apps**: Work-only, no personal life integration

FlexFlow uniquely combines schedule awareness, task management, and habit tracking with intelligent adaptation. No well-funded incumbent owns this specific intersection for variable-schedule audiences.

## 8. File structure

```
flexflow/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Today view
│   │   ├── schedule.tsx           # Week schedule view
│   │   ├── tasks.tsx              # Task queue
│   │   └── routines.tsx           # Routines & habits
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ScheduleBlock.tsx
│   ├── TaskCard.tsx
│   ├── RoutineCard.tsx
│   ├── TimeSlotSuggestion.tsx
│   └── QuickAddButton.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── scheduler.ts               # Core scheduling logic
│   ├── notifications.ts           # Notification management
│   └── analytics.ts               # Energy pattern tracking
├── store/
│   ├── scheduleStore.ts
│   ├── taskStore.ts
│   └── routineStore.ts
├── types/
│   └── index.ts
├── __tests__/
│   ├── scheduler.test.ts
│   ├── taskStore.test.ts
│   └── routineStore.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## 9. Tests

### `__tests__/scheduler.test.ts`
```typescript
import { findAvailableSlots, suggestTaskTime } from '../lib/scheduler';
import { addHours, startOfDay } from 'date-fns';

describe('Scheduler', () => {
  test('finds available slots between commitments', () => {
    const today = startOfDay(new Date());
    const commitments = [
      { start: addHours(today, 9), end: addHours(today, 17) }, // 9am-5pm work
    ];
    
    const slots = findAvailableSlots(today, commitments);
    
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].start.getHours()).toBeLessThan(9); // Morning slot
  });

  test('suggests task time based on priority and duration', () => {
    const today = startOfDay(new Date());
    const task = {
      id: '1',
      title: 'Call dentist',
      priority: 'high',
      estimatedMinutes: 15,
      timeConstraints: { businessHours: true },
    };
    
    const commitments = [
      { start: addHours(today, 13), end: addHours(today, 17) },
    ];
    
    const suggestion = suggestTaskTime(task, today, commitments);
    
    expect(suggestion).toBeDefined();
    expect(suggestion!.getHours()).toBeGreaterThanOrEqual(9);
    expect(suggestion!.getHours()).toBeLessThan(13);
  });
});
```

### `__tests__/taskStore.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useTaskStore } from '../store/taskStore';

describe('Task Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTaskStore());
    act(() => {
      result.current.clearAll();
    });
  });

  test('adds task with correct defaults', () => {
    const { result } = renderHook(() => useTaskStore());
    
    act(() => {
      result.current.addTask({
        title: 'Buy groceries',
        priority: 'medium',
        estimatedMinutes: 30,
      });
    });
    
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Buy groceries');
    expect(result.current.tasks[0].completed).toBe(false);
  });

  test('reschedules task to new time slot', () => {
    const { result } = renderHook(() => useTaskStore());
    const newTime = new Date();
    
    act(() => {
      result.current.addTask({ title: 'Test task', priority: 'low', estimatedMinutes: 15 });
      result.current.rescheduleTask(result.current.tasks[0].id, newTime);
    });
    
    expect(result.current.tasks[0].scheduledFor).toEqual(newTime);
  });
});
```

### `__tests__/routineStore.test.ts`
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useRoutineStore } from '../store/routineStore';

describe('Routine Store', () => {
  test('creates flexible routine with time windows', () => {
    const { result } = renderHook(() => useRoutineStore());
    
    act(() => {
      result.current.addRoutine({
        name: 'Morning routine',
        tasks: ['Shower', 'Breakfast', 'Review day'],
        flexible: true,
        preferredTimeWindow: { start: 6, end: 10 }, // 6am-10am
      });
    });
    
    expect(result.current.routines).toHaveLength(1);
    expect(result.current.routines[0].flexible).toBe(true);
  });

  test('marks routine completion without breaking streak on skip', () => {
    const { result } = renderHook(() => useRoutineStore());
    
    act(() => {
      result.current.addRoutine({
        name: 'Evening routine',
        tasks: ['Dinner prep'],
        flexible: false,
      });
      result.current.skipRoutine(result.current.routines[0].id, 'Schedule conflict');
    });
    
    expect(result.current.routines[0].streak).toBe(0);
    expect(result.current.routines[0].lastSkipReason).toBe('Schedule conflict');
  });
});
```

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app flexflow --template tabs`
2. Install dependencies:
   ```bash
   npm install zustand expo-sqlite date-fns react-native-paper expo-notifications
   npm install -D @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with app name, bundle ID, notification permissions
4. Set up TypeScript types in `types/index.ts`

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database
   - Create tables: `schedules`, `tasks`, `routines`, `routine_completions`
   - Write CRUD functions for each entity
2. Add migration system for schema updates
3. Test database operations manually in Expo Go

### Phase 3: State management
1. Create `store/scheduleStore.ts`:
   - State: array of schedule blocks (work shifts, appointments)
   - Actions: add, edit, delete, getByDateRange
2. Create `store/taskStore.ts`:
   - State: tasks with priority, estimated time, scheduled time
   - Actions: add, complete, reschedule, delete
   - Computed: tasks by priority, overdue tasks
3. Create `store/routineStore.ts`:
   - State: routines with flexible time windows
   - Actions: add, complete, skip, track streak
4. Write tests for all stores

### Phase 4: Core scheduling logic
1. Create `lib/scheduler.ts`:
   - `findAvailableSlots(date, commitments)`: Returns free time blocks
   - `suggestTaskTime(task, date, commitments)`: Suggests optimal time for task
   - `adaptRoutine(routine, schedule)`: Adjusts routine timing based on schedule
   - `calculateEnergyScore(completionHistory)`: Learns user's productive hours
2. Write comprehensive tests for scheduling algorithms
3. Handle edge cases: overnight shifts, multi-day tasks, conflicting priorities

### Phase 5: UI components
1. Create `components/ScheduleBlock.tsx`:
   - Visual representation of time blocks
   - Color-coded by type (work, personal, free time)
2. Create `components/TaskCard.tsx`:
   - Swipeable card with complete/reschedule actions
   - Shows suggested time slot
3. Create `components/RoutineCard.tsx`:
   - Expandable to show routine tasks
   - Progress indicator for completion
4. Create `components/TimeSlotSuggestion.tsx`:
   - Chip showing "Suggested: 2:30 PM - 3:00 PM"
   - Tap to accept suggestion

### Phase 6: Main screens
1. `app/(tabs)/index.tsx` - Today view:
   - Current schedule block
   - Next 3 suggested tasks
   - Quick-add button
2. `app/(tabs)/schedule.tsx` - Week view:
   - Horizontal scrollable week calendar
   - Visual timeline of commitments
   - Tap day to add schedule block
3. `app/(tabs)/tasks.tsx` - Task queue:
   - Filterable list (all, today, overdue)
   - Drag to reorder priority
   - Bulk reschedule when schedule changes
4. `app/(tabs)/routines.tsx` - Routines:
   - List of active routines
   - Tap to mark complete or skip
   - Streak tracking

### Phase 7: Notifications
1. Create `lib/notifications.ts`:
   - Request permissions on first launch
   - Schedule notifications for suggested tasks
   - Context-aware: "You have 30 min before work — time for morning routine?"
   - Cancel/reschedule when tasks move
2. Test notifications on physical device (won't work in simulator)

### Phase 8: Premium features gate
1. Add subscription check to stores
2. Show upgrade prompt when hitting free tier limits
3. Implement 14-day trial logic
4. Add "Pro" badge to premium features in UI

### Phase 9: Polish
1. Add loading states and error handling
2. Implement haptic feedback for interactions
3. Add empty states with helpful onboarding
4. Create first-run tutorial
5. Add settings screen (notification preferences, theme)

### Phase 10: Testing & refinement
1. Run full test suite: `npm test`
2. Test on iOS and Android devices via Expo Go
3. Test edge cases: overnight shifts, all-day events, conflicting tasks
4. Gather feedback from 5-10 beta users in target audience
5. Iterate on scheduling algorithm based on real usage

## 11. How to verify it works

### Development testing
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app on iOS/Android device
3. Test core flows:
   - Add a work shift for tomorrow 9am-5pm
   - Add task "Call dentist" (15 min, business hours)
   - Verify task suggests time between 9am-5pm today or after 5pm tomorrow
   - Create morning routine with 3 tasks
   - Mark routine complete, verify streak increments
   - Add conflicting schedule block, verify tasks reschedule

### Automated testing
```bash
npm test
```
All tests must pass:
- Scheduler finds available slots correctly
- Task suggestions respect time constraints
- Routines adapt to schedule changes
- Stores maintain data integrity

### Device-specific testing
- **Notifications**: Must test on physical device (iOS/Android)
  - Add task, verify notification appears at suggested time
  - Reschedule task, verify old notification cancels
- **Performance**: Scroll through week view with 50+ schedule blocks
- **Offline**: Airplane mode, verify app functions without network

### Acceptance criteria
- [ ] Can add schedule block in under 5 seconds
- [ ] Task suggestions appear within 2 seconds of schedule change
- [ ] Routines adapt timing when schedule conflicts
- [ ] Notifications arrive on time and are contextually relevant
- [ ] App loads in under 2 seconds on mid-range device
- [ ] All Jest tests pass
- [ ] No crashes during 30-minute usage session