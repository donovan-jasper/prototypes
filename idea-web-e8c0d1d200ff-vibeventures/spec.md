```markdown
# **App Name: VibeHive**

1. **App Name**: VibeHive
   - *Why?* Short, punchy, and suggests a thriving community of shared interests ("vibes") and a "hive" of activity.

2. **One-line pitch**:
   "Find your tribe. Discover spontaneous, hyper-local activities—right where you are."

3. **Expanded vision**:
   - **Broadest audience**: Anyone seeking real-world connections, from solo travelers to retirees, urbanites to rural dwellers. Also serves:
     - **Parents** looking for kid-friendly activities.
     - **Remote workers** needing local networking.
     - **Small business owners** promoting events.
     - **Event planners** (weddings, workshops, etc.).
   - **Adjacent use cases**:
     - "Date night" discovery.
     - Last-minute group outings (e.g., "Who’s up for a hike?").
     - Local volunteer opportunities.
   - **Why non-technical users?** Because it’s effortless—no scheduling hassle, no ticketing fees, just real people nearby.

4. **Tech stack**:
   - **Frontend**: React Native (Expo) + TypeScript.
   - **Backend**: Firebase (Auth, Firestore, Cloud Functions).
   - **Maps**: Google Maps SDK (for location-based discovery).
   - **Storage**: SQLite (local cache) + Firebase Storage (images).
   - **Push Notifications**: Expo Notifications.

5. **Core features (MVP)**:
   - **1. "Vibe Map"**: Real-time pins for events/hobbies near you.
   - **2. "Hive Chat"**: Group DMs for event coordination.
   - **3. "Quick Join"**: One-tap to RSVP to spontaneous events.
   - **4. "Organizer Mode"**: Create events with a 3-step form.
   - **5. "Vibe Badges"**: Earnable rewards for participation (e.g., "Weekend Warrior").

6. **Monetization strategy**:
   - **Free tier**: Unlimited event discovery, basic chat, and "Quick Join."
   - **Paid tiers**:
     - **Hive Pro ($4.99/month)**: Ad-free, early event access, "Vibe Badges" unlock faster.
     - **Organizer Boost ($19.99/month)**: Featured events, analytics, and 5% commission on paid tickets.
   - **Price reasoning**: Low enough to avoid friction but high enough to justify value.
   - **Retention hooks**:
     - Gamification (badges, streaks).
     - Exclusive local event previews.
     - Organizers get analytics to prove ROI.

7. **Skip if saturated**:
   - *SKIP: Competitors like Meetup and Facebook Events already dominate this niche, but VibeHive’s hyper-local, interest-first approach with a stronger social focus could differentiate it.*

8. **File structure**:
   ```
   /vibe-hive
   ├── /src
   │   ├── /components (reusable UI)
   │   ├── /screens (app flows)
   │   ├── /hooks (custom logic)
   │   ├── /utils (helpers)
   │   ├── /types (TypeScript interfaces)
   │   └── App.tsx (entry)
   ├── /tests
   │   ├── __mocks__ (test data)
   │   └── unit (Jest tests)
   ├── /assets (images, icons)
   └── firebase.json (config)
   ```

9. **Tests**:
   ```javascript
   // Example: /tests/unit/event.test.ts
   import { filterEventsByDistance } from '../../src/utils/eventFilters';

   test('filters events within 5km', () => {
     const events = [{ id: 1, distance: 3 }, { id: 2, distance: 7 }];
     const result = filterEventsByDistance(events, 5);
     expect(result).toHaveLength(1);
   });
   ```

10. **Implementation steps**:
    - **Step 1**: Set up Expo + Firebase.
    - **Step 2**: Build "Vibe Map" with Google Maps SDK.
    - **Step 3**: Add Firestore event CRUD.
    - **Step 4**: Implement "Quick Join" logic.
    - **Step 5**: Add Hive Chat (Firebase Realtime DB).
    - **Step 6**: Test with `npm test` + Expo Go.

11. **Verification**:
    - Run `npm test` to ensure all unit tests pass.
    - Test on Expo Go: Check map pins, event creation, and chat.
```