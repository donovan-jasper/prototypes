# CareConnect Companion Spec

## 1. App Name

**SimpliPhone**

## 2. One-line pitch

Your phone, simplified — big buttons, clear screens, and peace of mind for you and your loved ones.

## 3. Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Seniors (65+) who feel overwhelmed by modern smartphones
- Adults with cognitive challenges (dementia, TBI, autism spectrum)
- People with vision or motor impairments
- Post-stroke patients relearning phone use

**Broader audience (the real opportunity):**
- Parents setting up phones for elderly relatives remotely
- Adult children managing aging parents' digital lives
- Healthcare facilities needing standardized patient communication tools
- Anyone recovering from surgery/injury who needs temporary simplified access
- Digital minimalists wanting a "dumb phone" experience without buying new hardware
- People with anxiety around technology complexity

### Adjacent use cases:
- **Kids' first phone**: Parents want simplified, controlled interfaces before giving full smartphone access
- **Focus mode for everyone**: Professionals wanting distraction-free communication during work hours
- **Emergency preparedness**: Simplified interface for crisis situations when cognitive load is high
- **Temporary caregiver handoff**: When babysitters, nurses, or relatives need to use someone's phone without full access

### Why non-technical people want this:
- **No new device to buy** — transforms existing phone instantly
- **Remote setup** — adult children can configure parents' phones from across the country
- **Reversible** — not locked in, can switch back to normal phone anytime
- **Familiar contacts** — uses existing phone contacts, no re-entry
- **Peace of mind** — location sharing, medication reminders, emergency contacts always accessible

The killer insight: This isn't just an accessibility app — it's a **phone mode switcher** that anyone might need at different life stages. Market it as "your phone, your way" rather than "for people with disabilities."

## 4. Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Navigation**: Expo Router (file-based routing)
- **Local storage**: Expo SQLite for contacts, settings, medication schedules
- **State management**: React Context + AsyncStorage for preferences
- **UI**: React Native Paper (accessible components out of the box)
- **Notifications**: Expo Notifications for medication reminders
- **Location**: Expo Location for caregiver tracking (opt-in)
- **Permissions**: Expo Contacts, Expo SMS, Expo Phone
- **Testing**: Jest + React Native Testing Library
- **Analytics**: Expo Analytics (privacy-focused)

Keep dependencies minimal — no Firebase, no complex backend initially.

## 5. Core features (MVP)

### 1. **Big Button Home Screen**
- 6 large, customizable tiles (Call, Messages, Photos, Emergency, Medication, Settings)
- High contrast themes (dark/light)
- Adjustable text size (system-wide override)
- Voice labels on tap-and-hold

### 2. **Favorite Contacts (Speed Dial)**
- Up to 8 contacts with photos
- One-tap call or message
- Emergency contact marked with red border
- Caregiver can remotely add/edit contacts via shared link

### 3. **Medication Reminder System**
- Visual + audio + vibration alerts
- Photo of medication with dosage
- "Taken" / "Skipped" / "Snooze 15min" buttons
- Weekly adherence report for caregivers

### 4. **Caregiver Dashboard (Web Portal)**
- Remote configuration of user's interface
- Location check-in (opt-in, not constant tracking)
- Medication adherence view
- Emergency alert notifications
- Shareable setup link (caregiver sends link → user taps → app configures automatically)

### 5. **Emergency Mode**
- Shake phone 3 times → auto-call emergency contact
- Flashing screen with "CALLING [NAME]" in huge text
- Sends location SMS to all emergency contacts
- Works even if app is in background

## 6. Monetization strategy

### Free tier (the hook):
- Big button home screen
- Up to 3 favorite contacts
- Basic medication reminders (1 medication)
- Single emergency contact

### Paid tier — **SimpliPhone Plus** ($4.99/month or $39.99/year):
- Unlimited favorite contacts
- Unlimited medications with photo reminders
- Caregiver dashboard access (up to 3 caregivers)
- Location sharing
- Weekly adherence reports
- Priority support
- Custom themes and icon packs

### Family plan — **SimpliPhone Family** ($9.99/month):
- Up to 5 user accounts
- Centralized caregiver dashboard
- Shared emergency contacts across family
- Group medication management

### One-time purchase option — **SimpliPhone Lifetime** ($99.99):
- All Plus features forever
- Appeals to adult children buying for parents ("set it and forget it")

### What makes people STAY subscribed?
- **Caregiver dashboard** — once you're monitoring a loved one, you won't cancel
- **Medication adherence data** — becomes part of healthcare routine
- **Remote configuration** — saves trips to parents' house
- **Peace of mind** — location sharing during emergencies is priceless

### Revenue reasoning:
- $4.99/month is impulse-buy territory (less than a coffee)
- $39.99/year = 33% discount, encourages annual commitment
- Family plan targets the real buyer (adult children managing multiple elderly relatives)
- Lifetime option captures high-intent buyers who hate subscriptions

## 7. Market gap analysis

**NOT SKIP** — Clear gap exists:

- **Able**: Focuses on physical disabilities, not cognitive simplification
- **CareZone**: Medication tracking only, no phone interface simplification
- **Simple**: Generic launcher, no caregiver features or medical integration
- **TalkBack/Zoom**: System accessibility, not holistic simplified experience

**Our differentiation:**
- Only app combining simplified interface + medication management + caregiver remote control
- No hardware required (unlike Jitterbug phones)
- Reversible (unlike permanent accessibility settings)
- Cross-generational appeal (not just "for old people")

No well-funded incumbent owns this exact intersection. Closest competitor is Simple Launcher (small team, no caregiver features).

## 8. File structure

```
simpliphone/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx                 # Tab navigator
│   │   ├── index.tsx                   # Home screen (big buttons)
│   │   ├── contacts.tsx                # Favorite contacts
│   │   ├── medications.tsx             # Medication list
│   │   └── settings.tsx                # Settings screen
│   ├── emergency.tsx                   # Emergency mode screen
│   ├── onboarding.tsx                  # First-time setup
│   └── _layout.tsx                     # Root layout
├── components/
│   ├── BigButton.tsx                   # Large accessible button
│   ├── ContactCard.tsx                 # Contact with photo
│   ├── MedicationCard.tsx              # Medication reminder card
│   ├── EmergencyButton.tsx             # Emergency trigger
│   └── ThemeToggle.tsx                 # Accessibility theme switcher
├── contexts/
│   ├── SettingsContext.tsx             # App settings state
│   └── MedicationContext.tsx           # Medication data state
├── database/
│   ├── db.ts                           # SQLite setup
│   ├── contacts.ts                     # Contact CRUD operations
│   └── medications.ts                  # Medication CRUD operations
├── hooks/
│   ├── useContacts.ts                  # Contact management hook
│   ├── useMedications.ts               # Medication management hook
│   ├── useEmergency.ts                 # Emergency mode hook
│   └── useAccessibility.ts             # Accessibility settings hook
├── services/
│   ├── notifications.ts                # Medication reminder scheduling
│   ├── location.ts                     # Location sharing service
│   └── emergency.ts                    # Emergency call/SMS service
├── utils/
│   ├── accessibility.ts                # Accessibility helpers
│   └── validation.ts                   # Input validation
├── __tests__/
│   ├── components/
│   │   ├── BigButton.test.tsx
│   │   ├── ContactCard.test.tsx
│   │   └── MedicationCard.test.tsx
│   ├── hooks/
│   │   ├── useContacts.test.ts
│   │   └── useMedications.test.ts
│   ├── services/
│   │   ├── notifications.test.ts
│   │   └── emergency.test.ts
│   └── database/
│       ├── contacts.test.ts
│       └── medications.test.ts
├── assets/
│   ├── icons/
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 9. Tests

### Test files required:

**Component tests:**
- `__tests__/components/BigButton.test.tsx` — Verify accessibility props, onPress, sizing
- `__tests__/components/ContactCard.test.tsx` — Test contact display, call/message actions
- `__tests__/components/MedicationCard.test.tsx` — Test reminder display, taken/skipped actions

**Hook tests:**
- `__tests__/hooks/useContacts.test.ts` — CRUD operations, favorite toggling
- `__tests__/hooks/useMedications.test.ts` — Add/edit/delete medications, schedule parsing

**Service tests:**
- `__tests__/services/notifications.test.ts` — Schedule creation, cancellation, repeat logic
- `__tests__/services/emergency.test.ts` — Emergency call triggering, SMS sending, location attachment

**Database tests:**
- `__tests__/database/contacts.test.ts` — SQLite contact operations
- `__tests__/database/medications.test.ts` — SQLite medication operations, adherence tracking

All tests must pass with `npm test` before deployment.

## 10. Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app simpliphone --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-notifications expo-location expo-contacts expo-sms expo-linking
   npx expo install react-native-paper react-native-safe-area-context
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json`:
   - Set app name, slug, version
   - Add permissions: `CALL_PHONE`, `SEND_SMS`, `READ_CONTACTS`, `ACCESS_FINE_LOCATION`, `VIBRATE`
   - Configure notification icon and sound
4. Set up Jest config in `jest.config.js`
5. Create folder structure as specified above

### Phase 2: Database layer
1. Create `database/db.ts`:
   - Initialize SQLite database
   - Create tables: `contacts`, `medications`, `settings`, `adherence_log`
2. Implement `database/contacts.ts`:
   - `addContact(name, phone, photo, isFavorite, isEmergency)`
   - `getContacts()`, `getFavorites()`, `getEmergencyContacts()`
   - `updateContact(id, data)`, `deleteContact(id)`
3. Implement `database/medications.ts`:
   - `addMedication(name, dosage, schedule, photo)`
   - `getMedications()`, `getMedicationById(id)`
   - `logAdherence(medicationId, status, timestamp)`
   - `getAdherenceReport(medicationId, startDate, endDate)`
4. Write tests for all database operations

### Phase 3: Core services
1. Create `services/notifications.ts`:
   - `requestPermissions()`
   - `scheduleMedicationReminder(medication)`
   - `cancelReminder(notificationId)`
   - `handleNotificationResponse(response)` — mark medication as taken
2. Create `services/location.ts`:
   - `requestLocationPermission()`
   - `getCurrentLocation()`
   - `shareLocationViaSMS(contacts)`
3. Create `services/emergency.ts`:
   - `triggerEmergencyCall(contact)`
   - `sendEmergencySMS(contacts, location)`
   - `detectShakeGesture()` — use accelerometer
4. Write tests for all services

### Phase 4: State management
1. Create `contexts/SettingsContext.tsx`:
   - Theme (light/dark/high-contrast)
   - Text size multiplier
   - Sound/vibration preferences
   - Emergency contacts list
2. Create `contexts/MedicationContext.tsx`:
   - Medication list state
   - Adherence log state
   - CRUD operations wrapped in context
3. Implement `hooks/useAccessibility.ts`:
   - `useTextSize()` — returns scaled font sizes
   - `useHighContrast()` — returns theme colors
   - `useVoiceLabels()` — returns accessibility labels

### Phase 5: UI components
1. Create `components/BigButton.tsx`:
   - Large touchable area (min 88x88 dp)
   - Icon + label
   - High contrast border
   - Accessibility props (accessibilityRole, accessibilityLabel)
   - Haptic feedback on press
2. Create `components/ContactCard.tsx`:
   - Photo (or initials fallback)
   - Name in large text
   - Call/Message buttons
   - Emergency indicator (red border)
3. Create `components/MedicationCard.tsx`:
   - Medication photo
   - Name + dosage
   - Next dose time
   - "Take Now" / "Taken" / "Skip" buttons
4. Create `components/EmergencyButton.tsx`:
   - Large red button
   - Shake-to-activate indicator
   - Countdown before call (3 seconds, cancellable)
5. Write tests for all components

### Phase 6: Screens
1. Implement `app/(tabs)/index.tsx` (Home):
   - 2x3 grid of BigButtons
   - Buttons: Call, Messages, Photos, Emergency, Medications, Settings
   - Each button navigates to respective screen or triggers action
2. Implement `app/(tabs)/contacts.tsx`:
   - List of favorite contacts (max 8 in free tier)
   - Add contact button (imports from phone contacts)
   - Edit/delete actions
   - Mark as emergency contact toggle
3. Implement `app/(tabs)/medications.tsx`:
   - List of medications with next dose time
   - Add medication form (name, dosage, schedule, photo)
   - Adherence calendar view
   - "Take Now" quick action
4. Implement `app/(tabs)/settings.tsx`:
   - Theme selector
   - Text size slider
   - Emergency contacts management
   - Caregiver setup (generate shareable link)
   - Subscription status / upgrade prompt
5. Implement `app/emergency.tsx`:
   - Full-screen red background
   - "CALLING [NAME]" in huge text
   - Cancel button (large, easy to hit)
   - Auto-call after 3-second countdown
   - Send location SMS to all emergency contacts
6. Implement `app/onboarding.tsx`:
   - Welcome screen
   - Permission requests (contacts, notifications, location)
   - Add first emergency contact
   - Set up first medication (optional)
   - Theme selection

### Phase 7: Notification handling
1. Register notification handlers in `app/_layout.tsx`:
   - Listen for notification responses
   - Navigate to medication screen when tapped
   - Show "Mark as Taken" action button
2. Schedule daily medication reminders:
   - Parse medication schedule (e.g., "8:00 AM, 8:00 PM")
   - Create repeating notifications
   - Attach medication ID to notification data
3. Handle background notifications:
   - Update adherence log when "Taken" action tapped
   - Reschedule if snoozed

### Phase 8: Emergency mode
1. Implement shake detection:
   - Use `expo-sensors` Accelerometer
   - Detect 3 rapid shakes (threshold: 2.5g)
   - Trigger emergency mode
2. Emergency call flow:
   - Show countdown screen (3 seconds)
   - Allow cancellation
   - Auto-dial emergency contact
   - Send SMS with location to all emergency contacts
3. Test on physical device (shake detection doesn't work in simulator)

### Phase 9: Accessibility enhancements
1. Add VoiceOver/TalkBack support:
   - Set `accessibilityLabel` on all interactive elements
   - Set `accessibilityHint` for complex actions
   - Group related elements with `accessibilityRole`
2. Implement high-contrast themes:
   - Light: white background, black text, blue accents
   - Dark: black background, white text, yellow accents
   - High-contrast: pure black/white, no gradients
3. Add haptic feedback:
   - Light tap on button press
   - Heavy tap on emergency trigger
   - Success pattern on medication taken
4. Test with system accessibility settings:
   - Large text (up to 300%)
   - Bold text
   - Reduce motion

### Phase 10: Caregiver features (web portal stub)
1. Generate shareable setup link:
   - Create unique code in `settings` table
   - Generate deep link: `simpliphone://setup?code=ABC123`
   - Display QR code + copyable link
2. Implement deep link handler:
   - Parse setup code from URL
   - Fetch configuration from API (future: implement backend)
   - Apply settings (contacts, medications, theme)
3. For MVP, store setup data in AsyncStorage:
   - Caregiver can export settings as JSON
   - User imports via QR code or manual paste

### Phase 11: Monetization integration
1. Add subscription check:
   - Free tier: max 3 contacts, 1 medication
   - Paid tier: unlimited
   - Show upgrade prompt when limits reached
2. Implement paywall screen:
   - Feature comparison table
   - "Start Free Trial" button (7 days)
   - Pricing options (monthly/yearly/lifetime)
3. Integrate Expo In-App Purchases (future):
   - For MVP, show pricing only (no actual payment)
   - Add "Coming Soon" badge

### Phase 12: Testing & polish
1. Run all Jest tests: `npm test`
2. Test on physical devices:
   - iOS: iPhone SE (small screen), iPhone 14 Pro (large screen)
   - Android: Pixel 5, Samsung Galaxy (test different launchers)
3. Test accessibility:
   - Enable VoiceOver/TalkBack
   - Set text size to maximum
   - Enable high-contrast mode
4. Test emergency mode:
   - Shake detection
   - Call triggering
   - SMS sending
5. Performance testing:
   - App launch time < 2 seconds
   - Smooth scrolling (60 FPS)
   - No memory leaks

## 11. How to verify it works

### Local development:
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test on physical device (required for shake detection, calls, SMS)

### Automated tests:
```bash
npm test
```
All tests must pass (100% of test suites).

### Manual verification checklist:

**Home screen:**
- [ ] All 6 big buttons render correctly
- [ ] Buttons respond to touch with haptic feedback
- [ ] Navigation works for each button
- [ ] Theme toggle changes colors immediately

**Contacts:**
- [ ] Can add contact from phone contacts
- [ ] Contact photo displays (or initials fallback)
- [ ] Call button triggers phone dialer
- [ ] Message button opens SMS app
- [ ] Can mark contact as emergency (red border appears)
- [ ] Free tier limits to 3 contacts (upgrade prompt shows)

**Medications:**
- [ ] Can add medication with photo
- [ ] Medication card shows next dose time
- [ ] "Take Now" button logs adherence
- [ ] Notification appears at scheduled time
- [ ] Tapping notification opens medication screen
- [ ] Adherence calendar shows taken/skipped doses

**Emergency mode:**
- [ ] Shake phone 3 times → emergency screen appears
- [ ] Countdown starts (3 seconds)
- [ ] Can cancel before call
- [ ] Auto-dials emergency contact
- [ ] Sends SMS with location to all emergency contacts

**Accessibility:**
- [ ] VoiceOver reads all buttons correctly
- [ ] Text scales with system settings (up to 300%)
- [ ] High-contrast theme has sufficient contrast ratio (4.5:1 minimum)
- [ ] All interactive elements are at least 88x88 dp

**Settings:**
- [ ] Theme changes apply immediately
- [ ] Text size slider updates all screens
- [ ] Emergency contacts list updates
- [ ] Setup link generates and copies to clipboard

### Performance benchmarks:
- App launch: < 2 seconds (cold start)
- Screen navigation: < 100ms
- Database queries: < 50ms
- Notification scheduling: < 200ms

### Device testing matrix:
- iOS 15+ (iPhone SE, iPhone 14 Pro)
- Android 10+ (Pixel 5, Samsung Galaxy S21)
- Tablet support (iPad, Android tablet) — optional for MVP

All core features must work on both platforms before launch.