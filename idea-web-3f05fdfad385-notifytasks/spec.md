1.  **App Name**
    Aura

2.  **One-line pitch**
    Declutter your mind. Capture, organize, and conquer your day at a glance, without ever opening an app.

3.  **Expanded vision**
    Aura is for *everyone* who feels overwhelmed by the constant mental load of remembering small details, tasks, and ideas. It's for the person who wants to be present in the moment but also needs a reliable safety net for their thoughts.

    *   **Broadest Audience**: Beyond busy professionals, parents, and students, Aura appeals to:
        *   **Digital Minimalists**: Who seek powerful tools without the distraction of full-blown apps.
        *   **Individuals with ADHD**: Who benefit immensely from externalizing memory and having immediate, low-friction access to reminders.
        *   **Creatives & Innovators**: Who need to capture fleeting ideas before they vanish, without breaking their flow.
        *   **Travelers**: For quickly noting gate changes, hotel room numbers, or local recommendations.
        *   **Health-conscious individuals**: For medication reminders, water intake tracking, or quick mood check-ins.
        *   **Anyone prone to "I'll remember that later" moments**: Which inevitably lead to forgotten tasks.
    *   **Adjacent Use Cases**:
        *   **Micro-Habit Tracker**: "Drink water," "Stand up," "Take a deep breath" reminders that can be checked off directly from the lock screen.
        *   **Ephemeral Shopping Lists**: Add items as you run out, check them off in the store without unlocking your phone fully.
        *   **Quick Meeting Notes/Action Items**: Jot down key takeaways or immediate follow-ups during a call.
        *   **Learning Aid**: Pin a vocabulary word, a historical date, or a formula for quick recall throughout the day.
        *   **"Parking Spot" for Brain Clutter**: A temporary holding place for anything that pops into your head that you don't want to forget but don't need to act on immediately.
    *   **Why a Non-Technical Person Would Want This**:
        *   "It's like having a super-smart sticky note that lives right on your phone's screen and never gets lost."
        *   "No more 'Where did I put that note?' or 'What was that thing I needed to do?' – it's always right there."
        *   "It helps me stop worrying about forgetting things, so I can focus on what I'm doing right now."
        *   "It saves me time and stress by making sure I never miss a small but important detail."
        *   "It just makes my day feel smoother and less chaotic."

4.  **Tech stack**
    *   **Frontend**: React Native (Expo managed workflow)
    *   **Local Storage**: SQLite (via `expo-sqlite`)
    *   **State Management**: React Context API (or a minimal library like Zustand/Jotai for simplicity)
    *   **Notifications/Widgets**: `expo-notifications`, `expo-widget-kit` (or native modules for deeper iOS/Android widget/Live Activity integration if `expo-widget-kit` is insufficient for all requirements).
    *   **Dependencies**: Kept minimal to ensure performance and reduce bundle size.

5.  **Core features (MVP)**
    1.  **Zero-Friction Capture**: Instantly add notes, tasks, or reminders via dedicated Home Screen widgets (iOS/Android), persistent actionable notifications (Android), or a quick action within the main app.
    2.  **Dynamic Glanceable Interfaces**: Display active items across Lock Screen widgets (iOS/Android), Home Screen widgets (iOS/Android), Live Activities (iOS), and persistent, actionable notifications (Android). Content updates dynamically.
    3.  **One-Tap Interaction**: Complete tasks, snooze reminders, or open for quick edit directly from any glanceable interface (widget, notification, Live Activity) without launching the full app.
    4.  **Flexible Item Types**: Support for simple text notes, actionable tasks (checkboxes), and time-based reminders with optional recurring settings.

6.  **Monetization strategy**
    *   **Free Tier Hook**:
        *   Unlimited creation of notes, tasks, and reminders within the main app.
        *   Basic display of items in Home Screen widgets and persistent notifications.
        *   **The Hook**: Users experience the core benefit of quick capture and glanceable display, but with limitations that encourage upgrade.
        *   **The Paywall**: Only a limited number of "active" items (e.g., 3-5) can be pinned to the most dynamic/prominent glanceable interfaces (Lock Screen widgets, Live Activities, actionable persistent notifications). Basic customization (e.g., default colors).
    *   **Paid Tier (Aura Premium)**:
        *   **Price Point**: $2.99/month or $19.99/year (2 months free equivalent).
        *   **Reasoning**: This price point aligns with premium utility apps that significantly enhance productivity and reduce mental overhead. The value proposition is unparalleled convenience and peace of mind, making it a "must-have" tool for busy individuals. The annual option offers a clear discount, incentivizing longer-term commitment.
        *   **Features Unlocked**:
            *   **Unlimited Active Glanceable Items**: Pin as many tasks/notes/reminders as needed to Lock Screen widgets, Live Activities, and actionable notifications.
            *   **Advanced Customization**: Unlock themes, custom colors, icons, and fonts for widgets and in-app display.
            *   **Location-Based Reminders**: Get reminded when arriving at or leaving a specific location.
            *   **Advanced Snooze Options**: More granular snooze times (e.g., "Snooze until I get home," "Snooze for 1 hour, then every 15 mins").
            *   **Priority Support**.
            *   *Future Expansion*: Integration with calendars, advanced widget types (e.g., progress bars for habits), sharing capabilities.
    *   **What Makes People STAY Subscribed**:
        *   **Deep Integration & Habit Formation**: Once Aura becomes an indispensable part of a user's daily workflow and mental offloading strategy, the friction of switching or losing premium features is too high.
        *   **Continuous Value**: Regular updates, adoption of new OS features, and introduction of premium-only enhancements ensure the app remains cutting-edge and valuable.
        *   **Peace of Mind**: The core benefit of reduced mental load and never forgetting important details is a powerful psychological driver for retention.
        *   **Customization**: Users invest time in personalizing their Aura experience, making it feel truly "theirs."

7.  **Skip if saturated**
    DO NOT SKIP. While competitors offer widgets, none fully deliver a unified, truly "zero-tap" or "one-tap" *actionable* experience across *all* advanced mobile OS features (Live Activities, Dynamic Island, persistent actionable notifications) for a broad spectrum of quick information (notes, tasks, reminders, micro-habits). Aura's focus on seamless interaction directly from the glanceable surface, minimizing app launches, carves out a distinct and valuable niche.

8.  **File structure**

    ```
    Aura/
    ├── app.json
    ├── babel.config.js
    ├── jest.config.js
    ├── package.json
    ├── tsconfig.json
    ├── App.tsx
    ├── assets/
    │   ├── fonts/
    │   └── images/
    ├── src/
    │   ├── api/ (for future integrations, if any)
    │   ├── components/
    │   │   ├── common/ (e.g., Button, InputField)
    │   │   ├── TaskItem.tsx
    │   │   └── WidgetPreview.tsx
    │   ├── constants/
    │   │   ├── AppConstants.ts
    │   │   └── Colors.ts
    │   ├── context/ (for global state like theme, premium status)
    │   │   └── TaskContext.tsx
    │   ├── hooks/
    │   │   ├── useTasks.ts
    │   │   └── usePremiumStatus.ts
    │   ├── navigation/ (if multiple screens, e.g., Premium screen)
    │   │   └── AppNavigator.tsx
    │   ├── screens/
    │   │   ├── HomeScreen.tsx
    │   │   └── PremiumScreen.tsx
    │   ├── services/
    │   │   ├── DatabaseService.ts (SQLite initialization)
    │   │   ├── TaskService.ts (CRUD for tasks)
    │   │   ├── NotificationService.ts (handles expo-notifications, background tasks)
    │   │   └── WidgetService.ts (handles widget updates, data sharing)
    │   ├── types/
    │   │   ├── index.d.ts
    │   │   └── TaskTypes.ts
    │   └── utils/
    │       ├── DateUtils.ts
    │       └── helpers.ts
    ├── tests/
    │   ├── components/
    │   │   └── TaskItem.test.tsx
    │   ├── services/
    │   │   ├── DatabaseService.test.ts
    │   │   ├── NotificationService.test.ts
    │   │   └── TaskService.test.ts
    │   └── screens/
    │       └── HomeScreen.test.tsx
    ├── widgets/ (Platform-specific code for widgets, if not fully handled by expo-widget-kit)
    │   ├── android/
    │   │   └── WidgetModule.java
    │   └── ios/
    │       └── AuraWidgetExtension/
    │           ├── AuraWidget.swift
    │           └── AuraWidgetBundle.swift
    ```

9.  **Tests**

    *   **`tests/services/DatabaseService.test.ts`**
        *   `initializes database and creates tasks table`
        *   `handles database errors gracefully`
    *   **`tests/services/TaskService.test.ts`**
        *   `addTask: adds a new task successfully`
        *   `getTasks: retrieves all tasks`
        *   `getTaskById: retrieves a specific task by ID`
        *   `updateTask: updates an existing task's content and properties`
        *   `updateTaskStatus: marks a task as complete/incomplete`
        *   `deleteTask: removes a task from the database`
        *   `getActiveGlanceableTasks: retrieves tasks suitable for widgets/notifications (respecting limits)`
    *   **`tests/services/NotificationService.test.ts`** (Mocking `expo-notifications`)
        *   `scheduleReminder: schedules a time-based notification`
        *   `cancelNotification: cancels a scheduled notification`
        *   `updatePersistentNotification: updates content of Android persistent notification`
        *   `handleNotificationAction: processes 'complete' action from notification`
        *   `handleNotificationAction: processes 'snooze' action from notification`
    *   **`tests/services/WidgetService.test.ts`** (Mocking widget update mechanisms)
        *   `updateHomeWidgets: triggers update for all Home Screen widgets`
        *   `updateLiveActivity: updates content for iOS Live Activity`
        *   `sendDataToWidget: ensures data is correctly formatted and sent for widget display`
    *   **`tests/components/TaskItem.test.tsx`** (Using React Testing Library)
        *   `renders task content and checkbox correctly`
        *   `calls onComplete when checkbox is pressed`
        *   `calls onDelete when delete button is pressed`
        *   `displays snooze option for reminder tasks`
    *   **`tests/screens/HomeScreen.test.tsx`** (Using React Testing Library)
        *   `renders list of tasks fetched from TaskService`
        *   `allows adding a new task via input field`
        *   `displays premium upgrade prompt when free limits are reached`

10. **Implementation steps**

    1.  **Project Setup (AI Agent)**
        *   Initialize a new Expo project: `npx create-expo-app Aura --template blank-typescript`.
        *   Install core dependencies: `expo-sqlite`, `expo-notifications`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens`, `react-native-safe-area-context`, `expo-in-app-purchases` (or `react-native-iap`).
        *   Configure `app.json` with app name, icon, and necessary permissions for notifications and background tasks.
        *   Set up Jest and React Testing Library for unit and component testing.

    2.  **Database & Task Management (AI Agent)**
        *   Create `src/services/DatabaseService.ts`: Initialize SQLite database, create `tasks` table (`id`, `content`, `type: 'note'|'task'|'reminder'`, `isCompleted`, `dueDate`, `isPinned`, `createdAt`, `updatedAt`, `locationData`, `isPremium`).
        *   Create `src/services/TaskService.ts`: Implement `addTask`, `getTasks`, `getTaskById`, `updateTask`, `updateTaskStatus`, `deleteTask`, and `getActiveGlanceableTasks` (which will apply free tier limits).
        *   Implement a `TaskContext` in `src/context/TaskContext.tsx` to provide task data and actions globally.

    3.  **Core App UI (AI Agent)**
        *   Develop `src/screens/HomeScreen.tsx`:
            *   Display a list of tasks fetched from `TaskContext`.
            *   Implement an input field and button for quick task/note creation.
            *   Include a basic filter/sort option (e.g., "Active," "Completed").
            *   Add a visual indicator/prompt for premium features when free limits are hit.
        *   Create `src/components/TaskItem.tsx`:
            *   Render individual tasks with content, checkbox (for tasks), and a delete button.
            *   Implement basic swipe-to-delete or long-press options.
            *   Show reminder icon/time for reminder tasks.

    4.  **Notification Integration (AI Agent)**
        *   Create `src/services/NotificationService.ts`:
            *   Request notification permissions using `expo-notifications`.
            *   Implement `scheduleReminder(task)` to schedule time-based notifications.
            *   Implement `updatePersistentNotification(tasks)` for Android: Create/update a persistent, actionable notification displaying active tasks with "Complete" and "Snooze" buttons.
            *   Set up `expo-notifications` background task handler to process actions (complete, snooze) from notifications, updating `TaskService`.

    5.  **Widget Integration (AI Agent)**
        *   Create `src/services/WidgetService.ts`:
            *   Implement data sharing mechanism (e.g., App Groups for iOS, Shared Preferences for Android) for widgets to access task data.
            *   Implement `updateHomeWidgets(tasks)` to trigger updates for installed Home Screen widgets.
            *   *For iOS Widgets*: Create native iOS Widget Extension (SwiftUI) in `widgets/ios/AuraWidgetExtension`. Display `getActiveGlanceableTasks` and implement quick-add and one-tap action buttons.
            *   *For Android Widgets*: Implement `AppWidgetProvider` and layout in `widgets/android`. Display `getActiveGlanceableTasks` and implement quick-add and one-tap action buttons via `PendingIntents`.
        *   *For iOS Live Activities/Dynamic Island*: Research and implement `expo-live-activities` (or a custom native module). Implement `startLiveActivity(task)` and `updateLiveActivity(task)` to show a single, most critical active task with "Complete" and "Snooze" actions.

    6.  **Monetization Logic (AI Agent)**
        *   Create `src/screens/PremiumScreen.tsx`: Detail premium benefits and integrate in-app purchase flow using `expo-in-app-purchases` (or `react-native-iap`).
        *   Implement `usePremiumStatus` hook in `src/hooks/usePremiumStatus.ts` to check subscription status.
        *   Modify `TaskService.getActiveGlanceableTasks` and UI components to enforce free tier limits (e.g., only 3 tasks shown in widgets/Live Activities for free users).

    7.  **Testing (AI Agent)**
        *   Write unit tests for `DatabaseService`, `TaskService`, `NotificationService`, and `WidgetService` (mocking external dependencies).
        *   Write component tests for `TaskItem` and `HomeScreen` to ensure UI renders correctly and interactions trigger appropriate actions.

    8.  **Refinement & Polish (AI Agent)**
        *   Implement consistent styling using a UI library (e.g., `react-native-paper` or custom styles).
        *   Add loading states, error handling, and empty state messages.
        *   Ensure smooth animations and transitions for a premium feel.
        *   Optimize performance for quick launch and responsiveness.

11. **How to verify it works**

    *   **Automated Tests**: Run `npm test`. All unit and component tests must pass, ensuring core logic and UI interactions are functioning as expected.
    *   **Expo Go / Device Testing**:
        *   **Installation**: Deploy the app to both an iOS device/simulator and an Android device/emulator using Expo Go or a development build.
        *   **Core Functionality**:
            *   Verify tasks, notes, and reminders can be added, updated, marked complete, and deleted within the main app.
            *   Confirm time-based reminders trigger notifications at the correct times.
        *   **Glanceable Interfaces**:
            *   **Home Screen Widgets**: Add Aura widgets to the Home Screen on both platforms. Verify they display active tasks/notes and update dynamically. Test the quick-add button/action.
            *   **Lock Screen Widgets (iOS)**: Add Aura widgets to the iOS Lock Screen. Verify display and dynamic updates.
            *   **Persistent Notifications (Android)**: Check that the persistent notification appears, displays active tasks, and allows "Complete" and "Snooze" actions directly.
            *   **Live Activities / Dynamic Island (iOS)**: Verify that a critical task can be pinned to Live Activities/Dynamic Island, updates in real-time, and allows one-tap actions.
        *   **One-Tap Interaction**:
            *   Perform "Complete" and "Snooze" actions directly from widgets, persistent notifications, and Live Activities. Verify that the task status updates correctly within the main app without requiring the app to be fully opened.
        *   **Monetization**:
            *   Test the free tier limits: Ensure only the allowed number of items appear in glanceable interfaces for non-premium users.
            *   Simulate a premium subscription purchase (using sandbox accounts). Verify that premium features (e.g., unlimited active items, advanced customization) are unlocked immediately.