## Vigil

### One-line pitch
Never miss a beat. Vigil delivers unmissable, persistent alerts for your critical events, ensuring peace of mind and punctuality.

### Expanded vision
Vigil is for *everyone* whose life is governed by a schedule and who feels overwhelmed or let down by standard notifications. It's for the individual who values reliability, punctuality, and reducing mental load.

**Who is this REALLY for?**
Beyond the initial niche of busy professionals, students, parents, and individuals with ADHD/executive dysfunction, Vigil serves:
*   **Elderly individuals or their caregivers:** For crucial medication reminders, doctor appointments, or daily check-ins that absolutely cannot be missed.
*   **Freelancers and small business owners:** Juggling multiple client deadlines, project milestones, and invoicing schedules where missing a commitment can have significant financial repercussions.
*   **Individuals with chronic health conditions:** Requiring regular treatments, monitoring, or appointments where consistency is vital for well-being.
*   **Anyone prone to "notification fatigue":** Who has trained themselves to ignore the constant pings, only to miss something truly important.
*   **Travelers:** For flight check-ins, gate changes, or crucial departure times in unfamiliar environments.
*   **Families:** Coordinating complex schedules for children's activities, school events, and shared responsibilities.

**Adjacent use cases:**
*   **Health & Wellness:** Beyond medication, reminders for exercise, hydration, mindfulness breaks, or tracking vital signs.
*   **Personal Finance:** Bill payment reminders (especially for irregular ones), subscription renewal alerts, tax deadlines, or investment check-ins.
*   **Home Management:** Reminders for appliance maintenance, pet care, or recurring chores.
*   **Learning & Development:** Study session prompts, assignment due dates, or online course deadlines.
*   **Safety & Security:** Reminders to check locks, turn off appliances, or perform routine safety checks.

**Why would a non-technical person want this?**
"It just works." Vigil removes the anxiety and mental overhead of constantly double-checking calendars or worrying about missed appointments. It's a reliable digital assistant that acts as a safety net, ensuring they are always where they need to be, when they need to be, without having to actively manage a complex system. It prevents embarrassment, avoids penalties, saves time, and significantly reduces stress, offering tangible peace of mind.

### Tech stack
*   **Framework:** React Native (Expo)
*   **Local Storage:** SQLite (via `expo-sqlite`)
*   **State Management:** React Context API or Zustand (minimal dependency)
*   **Navigation:** React Navigation
*   **Calendar Integration:** Google Calendar API, Microsoft Graph API (Outlook), Apple EventKit (iOS only, for local calendar access)
*   **Notifications:** `expo-notifications` (for persistent local notifications, foreground handling)
*   **Location Services:** `expo-location` (for Time-to-Leave and location-based alerts)
*   **HTTP Client:** Axios or native Fetch API

### Core features (MVP only)

1.  **Unmissable, Customizable Alert System:**
    *   Persistent, full-screen takeover alerts (optional, but highly effective for critical events).
    *   Escalating alert patterns (e.g., initial chime, then increasing frequency/intensity until acknowledged).
    *   Customizable alert sounds, vibration patterns, and snooze durations per event or event type.
    *   Mandatory acknowledgment or explicit snooze to dismiss an alert, preventing accidental dismissal.

2.  **Multi-Calendar Integration:**
    *   Seamless synchronization with Google Calendar (MVP free tier).
    *   Premium support for Microsoft 365 (Outlook Calendar) and Apple Calendar (iCloud).
    *   Ability to select which calendars to monitor and filter events.

3.  **Smart Time-to-Leave (TTL) & Location-Based Alerts:**
    *   Calculates optimal departure times for events with a physical location, considering real-time traffic data (via Google Maps API or similar).
    *   Alerts users when it's time to leave, with reminders if they haven't departed.
    *   Location-based reminders (e.g., "Remind me to pick up dry cleaning when I leave work").

4.  **Intuitive Event Dashboard & Management:**
    *   A clean, focused view of upcoming critical events.
    *   Quick actions to acknowledge, snooze, or dismiss alerts directly from the dashboard or lock screen.
    *   Ability to easily mark events as "critical" to trigger enhanced alert settings.

### Monetization strategy

**Freemium Model:**

*   **Free Tier (The Hook):**
    *   Basic persistent and escalating alerts for *one* connected calendar source (e.g., Google Calendar).
    *   Standard alert sounds and vibration patterns.
    *   Limited snooze options (e.g., 5, 10, 15 minutes).
    *   No Time-to-Leave functionality.
    *   Ad-supported (minimal, non-intrusive banner ads).
    *   **Goal:** Allow users to experience the core value proposition of "never missing an event" and build trust in the app's reliability.

*   **Paid Tier (The Paywall - "Vigil Premium"):**
    *   **Subscription Price:** $4.99/month or $39.99/year (20% discount for annual).
    *   **Reasoning:** This price point is low enough to be an impulse purchase for the peace of mind it offers, yet significant enough to generate sustainable revenue. Missing a single important meeting, deadline, or bill payment can easily cost more in lost opportunities, penalties, or stress than the annual subscription. It's an investment in reliability and reduced anxiety.
    *   **Features:**
        *   Unlimited calendar integrations (Google, Outlook, Apple, etc.).
        *   Advanced alert customization: full-screen takeover alerts, custom sound uploads, haptic feedback patterns, granular escalation settings, extended snooze options.
        *   Smart Time-to-Leave (TTL) with real-time traffic integration and predictive routing.
        *   Location-based alerts (e.g., "remind me when I arrive at X location").
        *   Cross-device sync (iOS, Android, potentially web/desktop companion in the future).
        *   Family Sharing (up to 5 members).
        *   No ads.
        *   Priority customer support.

**What makes people STAY subscribed?**
1.  **Unwavering Reliability:** The app consistently delivers on its promise of unmissable alerts, becoming an indispensable part of their daily routine.
2.  **Reduced Stress & Mental Load:** Users become accustomed to the peace of mind that Vigil provides, making it difficult to go back to worrying about missed events.
3.  **Time & Money Saved:** Tangible benefits from avoiding late fees, missed appointments, or professional repercussions.
4.  **Continuous Improvement:** Regular updates with new integrations (e.g., project management tools like Asana/Jira, travel apps), advanced customization options, and performance enhancements.
5.  **Personalized Insights (Future):** Features like "You've been on time for X meetings this month thanks to Vigil" or "You typically need an extra 10 minutes to reach location Y on Tuesdays" could reinforce value.

### Skip if saturated
SKIP: Not saturated. While basic calendar and reminder apps exist, no single incumbent fully dominates the niche of *truly persistent, escalating, deeply integrated, and traffic-aware* unmissable alerts as a primary focus. The gap for a dedicated "never miss anything" solution is clear.

### File structure

```
Vigil/
├── assets/
│   ├── images/
│   │   └── logo.png
│   └── sounds/
│       └── default_alert.mp3
├── src/
│   ├── App.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── OnboardingScreen.js
│   │   ├── main/
│   │   │   ├── DashboardScreen.js
│   │   │   ├── EventDetailScreen.js
│   │   │   ├── SettingsScreen.js
│   │   │   └── CalendarIntegrationScreen.js
│   │   └── alerts/
│   │       └── FullScreenAlert.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   └── Input.js
│   │   ├── dashboard/
│   │   │   └── EventCard.js
│   │   ├── settings/
│   │   │   ├── AlertCustomizationRow.js
│   │   │   └── CalendarConnectButton.js
│   │   └── notifications/
│   │       └── PersistentAlertModal.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── SettingsContext.js
│   │   └── CalendarContext.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useNotifications.js
│   │   └── useCalendarSync.js
│   ├── services/
│   │   ├── auth/
│   │   │   ├── googleAuth.js
│   │   │   └── microsoftAuth.js
│   │   ├── calendar/
│   │   │   ├── googleCalendar.js
│   │   │   ├── outlookCalendar.js
│   │   │   └── appleCalendar.js
│   │   ├── notifications/
│   │   │   └── notificationService.js
│   │   ├── location/
│   │   │   └── locationService.js
│   │   ├── data/
│   │   │   ├── database.js
│   │   │   ├── eventRepository.js
│   │   │   └── settingsRepository.js
│   │   └── api/
│   │       └── trafficApi.js (for TTL)
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── dateUtils.js
│   └── types/
│       └── index.ts (for TypeScript, if used)
├── __tests__/
│   ├── services/
│   │   ├── notificationService.test.js
│   │   ├── calendar/
│   │   │   └── googleCalendar.test.js
│   │   ├── location/
│   │   │   └── locationService.test.js
│   │   └── data/
│   │       └── eventRepository.test.js
│   └── utils/
│       └── dateUtils.test.js
├── .env
├── .gitignore
├── app.json
├── babel.config.js
├── package.json
├── README.md
```

### Tests

Tests will be written using Jest.

```javascript
// __tests__/services/notificationService.test.js
import { schedulePersistentAlert, dismissAlert, acknowledgeAlert } from '../../src/services/notifications/notificationService';
import * as Notifications from 'expo-notifications';

// Mock Expo Notifications module
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
}));

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule a persistent alert with escalation', async () => {
    const event = {
      id: 'event-123',
      title: 'Important Meeting',
      date: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      isCritical: true,
      alertSettings: {
        escalationPattern: [0, 10, 30], // at 0, 10, 30 seconds before event
        sound: 'custom_sound.mp3',
        vibration: true,
      },
    };

    await schedulePersistentAlert(event);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3); // Initial + 2 escalations
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Vigil Alert: Important Meeting',
          body: expect.stringContaining('starts in less than a minute'),
          sound: 'custom_sound.mp3',
          sticky: true, // Persistent notification
        }),
        trigger: expect.objectContaining({
          seconds: expect.any(Number),
        }),
      })
    );
  });

  it('should dismiss all scheduled alerts for a given event ID', async () => {
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValueOnce([
      { identifier: 'vigil-event-123-0', content: { data: { eventId: 'event-123' } } },
      { identifier: 'vigil-event-123-1', content: { data: { eventId: 'event-123' } } },
      { identifier: 'vigil-event-456-0', content: { data: { eventId: 'event-456' } } },
    ]);

    await dismissAlert('event-123');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('vigil-event-123-0');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('vigil-event-123-1');
  });

  it('should acknowledge an alert by dismissing it and logging the action', async () => {
    const notificationId = 'some-notification-id';
    const eventId = 'event-123';
    await acknowledgeAlert(notificationId, eventId);
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(notificationId);
    // In a real scenario, this would also update the event status in the database
  });
});

// __tests__/services/calendar/googleCalendar.test.js
import { fetchGoogleCalendarEvents, syncGoogleCalendar } from '../../src/services/calendar/googleCalendar';
import { getAccessToken } from '../../src/services/auth/googleAuth'; // Mock this
import { saveEvent, getEventsByCalendarId } from '../../src/services/data/eventRepository'; // Mock this

jest.mock('../../src/services/auth/googleAuth');
jest.mock('../../src/services/data/eventRepository');
jest.mock('axios'); // Mock axios for API calls

describe('googleCalendarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAccessToken.mockResolvedValue('mock_access_token');
  });

  it('should fetch events from Google Calendar API', async () => {
    const mockEvents = {
      data: {
        items: [
          { id: 'gcal-1', summary: 'Test Event 1', start: { dateTime: '2023-10-26T09:00:00Z' }, end: { dateTime: '2023-10-26T10:00:00Z' } },
        ],
      },
    };
    require('axios').get.mockResolvedValue(mockEvents);

    const events = await fetchGoogleCalendarEvents('calendarId123');
    expect(events.length).toBe(1);
    expect(events[0].title).toBe('Test Event 1');
    expect(require('axios').get).toHaveBeenCalledWith(
      expect.stringContaining('https://www.googleapis.com/calendar/v3/calendars/calendarId123/events'),
      expect.any(Object)
    );
  });

  it('should sync events and save them to local storage', async () => {
    const mockGoogleEvents = [
      { id: 'gcal-1', summary: 'New Event', start: { dateTime: '2023-10-27T10:00:00Z' }, end: { dateTime: '2023-10-27T11:00:00Z' } },
    ];
    fetchGoogleCalendarEvents.mockResolvedValue(mockGoogleEvents);
    getEventsByCalendarId.mockResolvedValue([]); // No existing events

    await syncGoogleCalendar('calendarId123');

    expect(saveEvent).toHaveBeenCalledTimes(1);
    expect(saveEvent).toHaveBeenCalledWith(expect.objectContaining({
      calendarId: 'calendarId123',
      externalId: 'gcal-1',
      title: 'New Event',
    }));
  });
});

// __tests__/services/location/locationService.test.js
import { calculateTimeToLeave, startBackgroundLocationTracking } from '../../src/services/location/locationService';
import * as Location from 'expo-location';
import { getTrafficData } from '../../src/services/api/trafficApi'; // Mock this

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 34.0522, longitude: -118.2437 } })),
  startLocationUpdatesAsync: jest.fn(),
  hasStartedLocationUpdatesAsync: jest.fn(() => Promise.resolve(false)),
}));
jest.mock('../../src/services/api/trafficApi');

describe('locationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate time to leave based on current location and traffic', async () => {
    const destination = { latitude: 34.0000, longitude: -118.0000 };
    const eventTime = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    const travelDurationSeconds = 1800; // 30 minutes

    getTrafficData.mockResolvedValue(travelDurationSeconds); // Mock traffic API response

    const ttl = await calculateTimeToLeave(destination, eventTime);

    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    expect(getTrafficData).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 34.0522, longitude: -118.2437 }),
      destination
    );
    // Expect TTL to be 30 minutes before eventTime
    const expectedLeaveTime = new Date(eventTime.getTime() - travelDurationSeconds * 1000);
    expect(ttl.getTime()).toBeCloseTo(expectedLeaveTime.getTime(), -3); // Compare within 1 second
  });

  it('should start background location tracking if not already running', async () => {
    Location.hasStartedLocationUpdatesAsync.mockResolvedValue(false);
    await startBackgroundLocationTracking();
    expect(Location.requestBackgroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
      'VIGIL_LOCATION_TASK',
      expect.objectContaining({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000, // 1 minute
      })
    );
  });
});
```

### Implementation steps

1.  **Project Setup (Day 1-2):**
    *   Initialize new Expo project (`expo init Vigil`).
    *   Install core dependencies: `expo-sqlite`, `expo-notifications`, `expo-location`, `react-navigation`, `axios`.
    *   Configure `app.json` for permissions (notifications, location, background fetch).
    *   Set up basic navigation structure (Auth vs. Main flow).

2.  **Local Data Storage (Day 2-3):**
    *   Implement `src/services/data/database.js` to initialize SQLite database.
    *   Create `src/services/data/eventRepository.js` for CRUD operations on local events (store event details, calendar ID, alert settings, acknowledgment status).
    *   Create `src/services/data/settingsRepository.js` for user preferences (calendar connections, default alert settings, premium status).

3.  **Authentication & Google Calendar Integration (Day 3-7):**
    *   Implement `src/services/auth/googleAuth.js` for OAuth 2.0 flow using `expo-auth-session` to get Google access tokens.
    *   Develop `src/services/calendar/googleCalendar.js` to fetch events from Google Calendar API using the obtained token.
    *   Create `src/screens/main/CalendarIntegrationScreen.js` for users to connect their Google Calendar.
    *   Implement `useCalendarSync` hook to periodically fetch and sync events into local SQLite.

4.  **Notification System (Day 7-12):**
    *   Implement `src/services/notifications/notificationService.js` using `expo-notifications`.
    *   Develop functions for scheduling persistent, escalating local notifications.
    *   Implement foreground notification handling and background task for receiving/processing notifications.
    *   Design `src/screens/alerts/FullScreenAlert.js` for critical, unmissable alerts (full-screen takeover, mandatory acknowledgment).
    *   Integrate custom sounds and vibration patterns.
    *   Create UI in `src/screens/main/SettingsScreen.js` for customizing default alert settings and individual event overrides.

5.  **Event Dashboard & Management (Day 12-15):**
    *   Build `src/screens/main/DashboardScreen.js` to display upcoming events from local storage.
    *   Implement `src/components/dashboard/EventCard.js` for each event, showing status, time, and quick actions (snooze, acknowledge).
    *   Develop `src/screens/main/EventDetailScreen.js` to view full event details and modify specific alert settings.

6.  **Smart Time-to-Leave (TTL) (Day 15-18):**
    *   Implement `src/services/location/locationService.js` to request location permissions and get current user location.
    *   Integrate with a traffic API (e.g., Google Maps Directions API) via `src/services/api/trafficApi.js` to get real-time travel duration.
    *   Modify `notificationService` to schedule TTL alerts based on calculated departure times.
    *   Add UI in `EventDetailScreen` to enable/disable TTL for events with locations.
    *   Implement background location tracking (using `Location.startLocationUpdatesAsync` and `TaskManager.defineTask`) for continuous TTL updates.

7.  **Monetization Integration (Day 18-20):**
    *   Integrate `expo-in-app-purchases` (or platform-specific SDKs) for managing subscriptions.
    *   Implement logic to check premium status and unlock paid features (multiple calendars, advanced customization, TTL).
    *   Design `src/screens/main/PremiumScreen.js` to showcase premium benefits and handle subscription purchases.

8.  **Testing & Polish (Day 20-22):**
    *   Write comprehensive Jest unit tests for all core services and utilities.
    *   Perform thorough manual testing on both iOS and Android devices/simulators.
    *   Refine UI/UX for a smooth and intuitive user experience.
    *   Optimize performance and battery usage.

### How to verify it works

1.  **Unit Tests:**
    *   Run `npm test` from the project root. All tests in the `__tests__` directory must pass, ensuring core logic (notification scheduling, calendar parsing, TTL calculation, data persistence) functions as expected.

2.  **Expo Go on Device/Simulator:**
    *   **Installation:** Install the app via Expo Go on both an iOS and Android physical device (preferred for notification/location testing) or simulator.
    *   **Onboarding & Calendar Sync:** Complete the onboarding flow, connect a Google Calendar account (free tier).
    *   **Event Creation & Alerts:**
        *   Create several test events in the connected Google Calendar:
            *   A short-term event (e.g., 5 minutes from now) marked as "critical" to test persistent, escalating alerts and full-screen takeover.
            *   An event with a physical location to test Time-to-Leave functionality (simulate being far away, then closer).
            *   A regular event to test standard persistent alerts.
        *   Verify that alerts trigger correctly, are persistent (don't disappear easily), and escalate as configured.
        *   Test acknowledging and snoozing alerts from the full-screen alert, lock screen, and dashboard.
    *   **Settings & Customization:**
        *   Navigate to settings and customize default alert sounds/vibrations. Verify changes apply to new events.
        *   For premium features (if mocked or tested with a test subscription): Connect an Outlook/Apple Calendar, verify events sync. Test advanced alert patterns and custom sounds.
    *   **Time-to-Leave (TTL):**
        *   For events with locations, verify TTL notifications appear at the calculated time, taking into account simulated or real traffic conditions.
        *   Test background location updates by moving the device/simulator and observing if TTL recalculates.
    *   **Data Persistence:** Close and reopen the app multiple times. Verify that connected calendars, event data, and user settings remain intact.
    *   **Monetization Flow:** If implemented, simulate a subscription purchase and verify premium features are unlocked.