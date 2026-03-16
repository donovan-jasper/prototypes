# CareQuest

## One-line pitch
Turn family health into a shared adventure — track checkups, earn rewards, and keep everyone healthy together.

## Expanded vision

**Broadest audience:** Anyone managing health for more than just themselves — parents coordinating kids' appointments, adult children caring for aging parents, couples tracking shared wellness goals, roommates splitting healthcare costs, even pet owners managing vet visits.

**Adjacent use cases:**
- **Chronic condition management** — families coordinating care for diabetes, asthma, allergies
- **Insurance optimization** — tracking preventive care to maximize HSA/FSA benefits and avoid penalties
- **Medical tourism** — expats and travelers managing healthcare across multiple countries
- **Workplace wellness** — small businesses gamifying employee health programs
- **Special needs coordination** — parents managing therapy appointments, IEP meetings, specialist visits

**Why non-technical people want this:** Healthcare is overwhelming. You forget when the dentist appointment was, lose vaccination records, miss the annual physical. This app makes you the hero who keeps everyone healthy without the mental load. The gamification isn't gimmicky — it's genuine motivation when your kid sees their "health streak" or your parent gets a badge for completing their annual checkup.

## Tech stack

- **React Native (Expo SDK 52+)** — cross-platform iOS/Android
- **expo-sqlite** — local-first data storage for health records
- **expo-notifications** — push reminders for upcoming appointments
- **expo-calendar** — sync with device calendar
- **expo-location** — location-based reminders near healthcare facilities
- **react-navigation** — tab + stack navigation
- **zustand** — lightweight state management
- **date-fns** — date manipulation
- **expo-secure-store** — encrypted storage for sensitive health data
- **jest + @testing-library/react-native** — testing

## Core features

1. **Family Health Dashboard** — visual timeline showing everyone's upcoming appointments, overdue checkups, and health streaks. Color-coded by urgency.

2. **Smart Reminders** — push notifications 1 week, 1 day, and 1 hour before appointments. Location-based alerts when near a healthcare facility with an overdue checkup.

3. **Quest System** — gamified challenges like "Complete 3 checkups this month" or "Maintain a 30-day health streak." Unlock badges, earn points, compete on family leaderboards.

4. **Health Passport** — digital record of vaccinations, prescriptions, allergies, and insurance info. Exportable PDF for school forms or travel.

5. **Provider Network** — search and save preferred doctors, dentists, specialists. One-tap to call or get directions.

## Monetization strategy

**Free tier:**
- Track up to 3 family members
- Basic reminders and calendar sync
- 5 quest badges
- Manual appointment entry

**Premium ($7.99/month or $59.99/year):**
- Unlimited family members
- Advanced reminders (location-based, custom intervals)
- Full quest library with 50+ badges
- Health Passport PDF export
- Provider discounts (partner with telehealth services for 10-20% off)
- Family analytics dashboard (spending trends, appointment frequency)
- Priority support

**Why people stay subscribed:**
- **Sunk cost** — once you've logged your family's health history, switching is painful
- **Habit formation** — daily check-ins and streaks create routine
- **Social pressure** — family leaderboards and shared quests keep everyone engaged
- **Insurance savings** — premium users get reminders that help avoid penalties for missed preventive care (can save $100s annually)

**Price reasoning:** Lower than typical health apps ($9.99) because we're targeting families (multiple users per subscription). Annual discount encourages long-term commitment.

## File structure

```
carequest/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── quests.tsx             # Quest system
│   │   ├── family.tsx             # Family members
│   │   └── profile.tsx            # Settings
│   ├── appointment/
│   │   ├── [id].tsx               # Appointment detail
│   │   └── add.tsx                # Add appointment
│   ├── member/
│   │   ├── [id].tsx               # Member detail
│   │   └── add.tsx                # Add member
│   └── _layout.tsx
├── components/
│   ├── AppointmentCard.tsx
│   ├── FamilyMemberCard.tsx
│   ├── QuestCard.tsx
│   ├── HealthStreak.tsx
│   └── UpcomingReminders.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── notifications.ts           # Push notification logic
│   ├── calendar.ts                # Calendar integration
│   ├── location.ts                # Location-based reminders
│   └── quests.ts                  # Quest/badge logic
├── store/
│   └── useStore.ts                # Zustand store
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── database.test.ts
│   ├── notifications.test.ts
│   ├── quests.test.ts
│   └── components/
│       ├── AppointmentCard.test.tsx
│       └── QuestCard.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/database.test.ts
import { addFamilyMember, getAppointments, addAppointment } from '../lib/database';

describe('Database operations', () => {
  test('adds family member', async () => {
    const member = await addFamilyMember('John Doe', '1990-01-01', 'self');
    expect(member.name).toBe('John Doe');
  });

  test('retrieves appointments for member', async () => {
    const appointments = await getAppointments(1);
    expect(Array.isArray(appointments)).toBe(true);
  });
});

// __tests__/quests.test.ts
import { checkQuestCompletion, calculateStreak } from '../lib/quests';

describe('Quest system', () => {
  test('completes quest when criteria met', () => {
    const quest = { id: 1, type: 'checkups', target: 3 };
    const completed = checkQuestCompletion(quest, 3);
    expect(completed).toBe(true);
  });

  test('calculates health streak correctly', () => {
    const appointments = [
      { date: '2026-03-01', completed: true },
      { date: '2026-02-15', completed: true },
      { date: '2026-02-01', completed: true },
    ];
    const streak = calculateStreak(appointments);
    expect(streak).toBeGreaterThan(0);
  });
});

// __tests__/notifications.test.ts
import { scheduleAppointmentReminder } from '../lib/notifications';

describe('Notifications', () => {
  test('schedules reminder for appointment', async () => {
    const notificationId = await scheduleAppointmentReminder({
      id: 1,
      title: 'Dentist',
      date: '2026-03-20T10:00:00',
    });
    expect(notificationId).toBeDefined();
  });
});

// __tests__/components/AppointmentCard.test.tsx
import { render } from '@testing-library/react-native';
import AppointmentCard from '../../components/AppointmentCard';

describe('AppointmentCard', () => {
  test('renders appointment details', () => {
    const appointment = {
      id: 1,
      title: 'Annual Physical',
      date: '2026-03-20T10:00:00',
      provider: 'Dr. Smith',
    };
    const { getByText } = render(<AppointmentCard appointment={appointment} />);
    expect(getByText('Annual Physical')).toBeTruthy();
    expect(getByText('Dr. Smith')).toBeTruthy();
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app carequest --template tabs
cd carequest
npm install expo-sqlite expo-notifications expo-calendar expo-location zustand date-fns expo-secure-store
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Configure Jest
Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-