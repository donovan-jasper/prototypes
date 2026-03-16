# LaunchLift

## One-line pitch
Your pocket-sized promotion engine — discover, track, and submit to 100+ curated directories that actually drive downloads.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Solo founders and indie developers launching their first app
- Side project builders who need visibility without a marketing budget
- Small agency teams managing multiple client launches
- Content creators monetizing through apps/tools

**Broadest audience:**
- Anyone launching anything digital: newsletters, courses, communities, SaaS tools
- Freelancers building personal brand through side projects
- Students and bootcamp grads showcasing portfolio projects
- Non-technical founders who hired developers and need to drive initial traction

### Adjacent use cases

1. **Competitive intelligence** — Track where competitors are listed, see what works
2. **Launch checklist** — Turn directory submissions into a gamified launch roadmap
3. **Community discovery** — Find niche communities aligned with your product category
4. **SEO backlink strategy** — High-DR directories = valuable backlinks for web presence
5. **Press kit builder** — Standardize your pitch across all submissions

### Why non-technical people want this

- **Removes overwhelm**: No more Googling "where to promote my app" and getting lost in listicles
- **Actionable guidance**: Each directory shows submission requirements, approval time, and success rate
- **Progress tracking**: Visual dashboard shows launch momentum (submitted, approved, pending)
- **Time-saving**: Pre-filled submission forms using your app profile
- **Confidence**: DR rankings help prioritize high-impact directories first

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Navigation**: Expo Router (file-based routing)
- **Local database**: expo-sqlite for offline-first directory data
- **State management**: Zustand (lightweight, no boilerplate)
- **UI components**: React Native Paper (Material Design)
- **Forms**: React Hook Form
- **HTTP client**: Axios with retry logic
- **Analytics**: Expo Application Services (EAS) built-in analytics
- **Push notifications**: Expo Notifications
- **Testing**: Jest + React Native Testing Library

## Core features (MVP)

1. **Smart Directory Browser**
   - Filterable list of 100+ directories by category (app stores, startup lists, dev tools, niche communities)
   - Each listing shows: DR score, submission difficulty, avg approval time, cost (free/paid)
   - Offline-first: All directory data cached locally, syncs when online

2. **One-Tap Submission Tracker**
   - Mark directories as "Not Started", "Submitted", "Approved", "Rejected"
   - Add submission date and notes
   - Visual progress bar showing launch completion percentage
   - Push notification reminders for pending submissions

3. **App Profile Builder**
   - Single form to store your app details (name, tagline, description, screenshots, links)
   - Auto-fill submission forms using saved profile
   - Export profile as JSON for external use

4. **Priority Recommendations**
   - Algorithm ranks directories by: DR score × category match × approval rate
   - "Start Here" section shows top 10 directories for your app category
   - Weekly digest of newly added directories

5. **Submission Analytics (Premium)**
   - Track which directories drove actual traffic/downloads
   - UTM parameter generator for each directory link
   - Conversion funnel: submissions → approvals → clicks → installs

## Monetization strategy

### Free tier (Hook)
- Access to full directory list with basic info (name, URL, category)
- Manual submission tracking (mark as submitted/approved)
- Basic app profile (text fields only)
- Limit: Track up to 20 submissions

### Premium ($9.99/month or $79.99/year — Paywall)
- **Why this price?** Lower than typical SaaS ($15-30/mo) but higher than utility apps ($4.99). Targets serious launchers willing to invest in marketing.
- Unlimited submission tracking
- DR scores and priority rankings
- Submission analytics with traffic attribution
- Auto-fill forms with app profile
- Push notifications for new directories
- Export submission history as CSV
- Priority email support

### What makes people STAY subscribed?
- **Ongoing value**: New directories added weekly (FOMO on missing opportunities)
- **Launch cycles**: Most founders launch multiple products/updates per year
- **Analytics addiction**: Seeing which directories drive real results creates habit loop
- **Time savings**: Auto-fill alone saves 10+ hours per launch
- **Annual discount**: 33% off yearly plan encourages long-term commitment

### Additional revenue streams (post-MVP)
- Affiliate commissions from paid directory submissions
- Sponsored directory placements (directories pay to be featured)
- White-label version for marketing agencies ($299/mo)

## File structure

```
launchlift/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Directory browser
│   │   ├── tracker.tsx            # Submission tracker
│   │   ├── profile.tsx            # App profile
│   │   └── analytics.tsx          # Premium analytics
│   ├── directory/
│   │   └── [id].tsx               # Directory detail view
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── DirectoryCard.tsx
│   ├── SubmissionStatusBadge.tsx
│   ├── ProgressBar.tsx
│   ├── FilterSheet.tsx
│   └── PremiumGate.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── directories.ts             # Directory CRUD
│   ├── submissions.ts             # Submission tracking
│   ├── profile.ts                 # App profile logic
│   ├── analytics.ts               # Analytics calculations
│   └── seed.ts                    # Initial directory data
├── store/
│   └── useStore.ts                # Zustand store
├── constants/
│   ├── directories.json           # Seed data
│   └── categories.ts
├── hooks/
│   ├── useDirectories.ts
│   ├── useSubmissions.ts
│   └── usePremium.ts
├── __tests__/
│   ├── directories.test.ts
│   ├── submissions.test.ts
│   ├── analytics.test.ts
│   └── components/
│       ├── DirectoryCard.test.tsx
│       └── ProgressBar.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### Core logic tests

**`__tests__/directories.test.ts`**
- Filter directories by category
- Sort by DR score
- Search by name/description
- Calculate priority score

**`__tests__/submissions.test.ts`**
- Create submission record
- Update submission status
- Calculate completion percentage
- Generate submission timeline

**`__tests__/analytics.test.ts`**
- Track directory performance
- Calculate conversion rates
- Generate UTM parameters
- Export analytics data

**`__tests__/components/DirectoryCard.test.tsx`**
- Renders directory info correctly
- Shows premium badge when required
- Handles tap to detail view

**`__tests__/components/ProgressBar.test.tsx`**
- Calculates percentage correctly
- Updates on submission changes
- Shows milestone animations

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app launchlift --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-router zustand react-native-paper axios
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```
3. Configure `app.json` with app name, bundle ID, icons
4. Set up Jest config for React Native
5. Create directory structure as specified

### Phase 2: Database layer
1. Create `lib/database.ts`:
   - Initialize SQLite database
   - Define schema: `directories`, `submissions`, `app_profile`
   - Write migration functions
2. Create `lib/seed.ts`:
   - Load `constants/directories.json` (100 directories with DR scores, categories, URLs)
   - Seed database on first launch
3. Write `lib/directories.ts`:
   - `getAllDirectories()` — fetch all with filters
   - `getDirectoryById(id)` — single directory
   - `searchDirectories(query)` — full-text search
   - `getTopDirectories(category, limit)` — priority ranking
4. Write `lib/submissions.ts`:
   - `createSubmission(directoryId, status, notes)` — track submission
   - `updateSubmissionStatus(id, status)` — change status
   - `getSubmissionsByStatus(status)` — filter by status
   - `getCompletionPercentage()` — calculate progress
5. Write `lib/profile.ts`:
   - `saveProfile(data)` — upsert app profile
   - `getProfile()` — retrieve profile
   - `exportProfile()` — JSON export

### Phase 3: State management
1. Create `store/useStore.ts` with Zustand:
   - `directories` — cached directory list
   - `submissions` — submission tracking state
   - `profile` — app profile data
   - `isPremium` — subscription status
   - Actions: `loadDirectories`, `addSubmission`, `updateProfile`, `setPremium`

### Phase 4: UI components
1. `components/DirectoryCard.tsx`:
   - Display directory name, category, DR score
   - Show submission status badge if tracked
   - Premium lock icon for paid features
2. `components/SubmissionStatusBadge.tsx`:
   - Color-coded badges: gray (not started), blue (submitted), green (approved), red (rejected)
3. `components/ProgressBar.tsx`:
   - Animated progress bar showing completion %
   - Milestone markers at 25%, 50%, 75%, 100%
4. `components/FilterSheet.tsx`:
   - Bottom sheet with category checkboxes
   - DR score range slider
   - Sort options (DR, name, date added)
5. `components/PremiumGate.tsx`:
   - Overlay for premium features
   - "Upgrade to Premium" CTA button

### Phase 5: Screens
1. `app/(tabs)/index.tsx` — Directory Browser:
   - FlatList of DirectoryCard components
   - Search bar at top
   - Filter button opens FilterSheet
   - Pull-to-refresh to sync new directories
2. `app/(tabs)/tracker.tsx` — Submission Tracker:
   - ProgressBar at top
   - Segmented control: All / Submitted / Approved / Rejected
   - List of tracked submissions with status
   - FAB to add new submission
3. `app/(tabs)/profile.tsx` — App Profile:
   - Form fields: app name, tagline, description, category, website, screenshots
   - Save button
   - Export button (premium)
4. `app/(tabs)/analytics.tsx` — Analytics (Premium):
   - PremiumGate if not subscribed
   - Charts: submissions over time, approval rate, top directories
   - Traffic attribution table
5. `app/directory/[id].tsx` — Directory Detail:
   - Full directory info: description, submission requirements, approval time
   - "Mark as Submitted" button
   - "Open Submission Form" button (opens URL)
   - Notes field for tracking

### Phase 6: Premium features
1. Implement in-app purchases using Expo's Revenue Cat integration:
   - Monthly subscription: $9.99
   - Annual subscription: $79.99
2. Gate features in code:
   - Check `isPremium` state before showing DR scores, analytics, auto-fill
3. Add paywall screen with feature comparison table

### Phase 7: Notifications
1. Set up Expo Notifications:
   - Request permissions on first launch
   - Schedule weekly digest of new directories
   - Reminder notifications for pending submissions (3 days after submission)

### Phase 8: Testing
1. Write all tests in `__tests__/` directory
2. Run `npm test` to verify all tests pass
3. Achieve >80% code coverage on core logic

### Phase 9: Polish
1. Add loading states and error handling
2. Implement offline mode with sync queue
3. Add onboarding flow (3 screens explaining features)
4. Create app icon and splash screen
5. Test on iOS and Android devices

### Phase 10: Deployment
1. Build production app: `eas build --platform all`
2. Submit to App Store and Google Play
3. Set up analytics tracking
4. Launch with Product Hunt post (meta!)

## How to verify it works

### Local development
1. Install Expo Go app on iOS/Android device
2. Run `npm install` in project directory
3. Run `npx expo start`
4. Scan QR code with Expo Go
5. Verify:
   - Directory list loads with 100+ entries
   - Search and filters work
   - Can create submission and see progress bar update
   - App profile saves and persists
   - Premium gate blocks analytics screen
   - Offline mode works (enable airplane mode, app still functions)

### Automated tests
1. Run `npm test`
2. All tests in `__tests__/` must pass
3. Check coverage report: `npm test -- --coverage`
4. Verify >80% coverage on `lib/` directory

### Manual testing checklist
- [ ] Create app profile with all fields
- [ ] Browse directories and filter by category
- [ ] Search for specific directory by name
- [ ] Mark 5 directories as submitted
- [ ] Check progress bar shows 5% completion
- [ ] Update one submission to "Approved"
- [ ] Open directory detail view
- [ ] Try to access analytics (should show premium gate)
- [ ] Close and reopen app (data persists)
- [ ] Enable airplane mode (app still works)
- [ ] Pull to refresh directory list

### Production readiness
- [ ] App builds successfully with `eas build`
- [ ] No console errors or warnings
- [ ] Smooth 60fps scrolling on directory list
- [ ] App size <50MB
- [ ] Cold start time <3 seconds
- [ ] All images optimized
- [ ] Privacy policy and terms of service added
- [ ] In-app purchase flow tested with sandbox account