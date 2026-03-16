# SubmitGuard

## One-line pitch
Catch app store rejections before they happen — scan your builds locally and ship with confidence.

## Expanded vision

**Core audience:** Mobile developers, indie app makers, and small dev teams who've experienced the pain of app store rejections.

**Broadest reach:** This serves anyone who ships mobile apps — from solo indie developers launching their first app to small agencies managing multiple client projects. The real pain point isn't just compliance; it's the **anxiety and time loss** from rejection cycles.

**Adjacent use cases:**
- **Pre-submission confidence check** — developers can scan before every release, not just major versions
- **Learning tool** — junior developers can understand compliance requirements by seeing real-time feedback on their builds
- **Client handoff validation** — agencies can prove to clients that builds meet store requirements before delivery
- **Compliance documentation** — generate shareable reports for stakeholders showing compliance status

**Why non-technical people want this:** Product managers and project leads can independently verify build readiness without waiting for engineering, reducing release bottlenecks and improving team velocity.

**The real insight:** This isn't just a compliance checker — it's a **confidence builder** that removes the fear from shipping. Every developer has lost days to avoidable rejections. This app becomes the safety net that lets you ship faster.

## Tech stack

- **React Native (Expo)** — cross-platform iOS + Android
- **expo-file-system** — local build artifact access
- **expo-document-picker** — IPA/APK file selection
- **SQLite (expo-sqlite)** — local compliance rules database
- **plist / xml2js** — parse iOS Info.plist files
- **JSZip** — extract and analyze APK/IPA contents
- **React Navigation** — app navigation
- **Zustand** — lightweight state management

## Core features

1. **Local Build Scanner**
   - Import IPA (iOS) or APK (Android) files directly from device storage
   - Extract and analyze Info.plist, AndroidManifest.xml, and asset directories
   - Instant results without cloud uploads

2. **Smart Compliance Checks**
   - Privacy manifest validation (iOS 17+)
   - Required device capabilities verification
   - Icon and screenshot dimension validation
   - Age rating content detection
   - Third-party SDK compliance flags

3. **Actionable Fix Guidance**
   - Each issue shows exactly what's wrong and how to fix it
   - Copy-paste ready code snippets for common fixes
   - Links to relevant Apple/Google documentation

4. **Scan History & Reports**
   - Track compliance over time across builds
   - Export PDF reports for team sharing
   - Compare scans to see what changed

5. **Offline-First Operation**
   - All compliance rules stored locally in SQLite
   - No internet required for core scanning
   - Optional cloud sync for rule updates (paid tier)

## Monetization strategy

**Free tier (the hook):**
- 3 scans per month
- Basic compliance checks (icons, manifest structure, privacy basics)
- View results in-app only

**Paid tier — $6.99/month or $49.99/year (the paywall):**
- Unlimited scans
- Advanced checks (SDK compliance, age rating analysis, accessibility validation)
- PDF report exports
- Scan history beyond 30 days
- Priority rule updates when Apple/Google change requirements
- Multi-project tracking

**Why people stay subscribed:**
- **Continuous value:** App store rules change constantly — subscribers get instant updates
- **Peace of mind:** Unlimited scans mean checking every build becomes habit
- **Team utility:** Reports become part of the release process, making the subscription a team tool
- **Cost avoidance:** One avoided rejection (typically 2-5 day delay) pays for months of subscription

**Price reasoning:** Lower than typical dev tools ($9-15/month) to capture indie developers, but high enough to be sustainable. Annual option provides 30% discount to encourage commitment.

## File structure

```
submitguard/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Scanner screen
│   │   ├── history.tsx            # Scan history
│   │   └── settings.tsx           # Settings & subscription
│   ├── _layout.tsx
│   └── scan-results.tsx           # Detailed results screen
├── components/
│   ├── ScanButton.tsx
│   ├── ComplianceIssueCard.tsx
│   ├── ScanHistoryItem.tsx
│   └── UpgradePrompt.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── scanner/
│   │   ├── index.ts
│   │   ├── iosScanner.ts
│   │   ├── androidScanner.ts
│   │   └── complianceRules.ts
│   ├── storage.ts                 # File system operations
│   └── types.ts
├── store/
│   └── useStore.ts                # Zustand store
├── __tests__/
│   ├── scanner.test.ts
│   ├── complianceRules.test.ts
│   └── database.test.ts
├── assets/
│   └── compliance-rules.json      # Bundled rules database
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/scanner.test.ts
// __tests__/complianceRules.test.ts
// __tests__/database.test.ts
```

Each test file covers:
- Scanner: IPA/APK extraction, manifest parsing, issue detection
- Compliance rules: Rule matching, severity classification, fix suggestions
- Database: CRUD operations, scan history, rule storage

## Implementation steps

### 1. Project initialization
```bash
npx create-expo-app@latest submitguard --template tabs
cd submitguard
npm install expo-file-system expo-document-picker expo-sqlite jszip plist xml2js zustand react-native-pdf-lib
npm install -D @types/plist @types/xml2js jest @testing-library/react-native
```

### 2. Database setup (`lib/database.ts`)
- Create SQLite schema with tables: `scans`, `issues`, `compliance_rules`
- Write migration function to initialize database on first launch
- Seed `compliance_rules` table with bundled rules from `assets/compliance-rules.json`
- Export functions: `initDatabase()`, `saveScan()`, `getScans()`, `getRules()`

### 3. Compliance rules data (`assets/compliance-rules.json`)
Create JSON structure:
```json
{
  "ios": [
    {
      "id": "ios_privacy_manifest",
      "title": "Privacy Manifest Required",
      "description": "iOS 17+ requires PrivacyInfo.xcprivacy",
      "severity": "critical",
      "check": "file_exists",
      "path": "PrivacyInfo.xcprivacy",
      "fix": "Add PrivacyInfo.xcprivacy to your Xcode project..."
    }
  ],
  "android": [...]
}
```

### 4. Scanner core logic (`lib/scanner/`)

**`index.ts`:**
- Export `scanBuild(fileUri: string, platform: 'ios' | 'android')`
- Detect platform from file extension (.ipa vs .apk)
- Route to platform-specific scanner
- Return unified `ScanResult` type

**`iosScanner.ts`:**
- Use JSZip to extract IPA contents
- Parse Info.plist with `plist` library
- Check for required keys: CFBundleIdentifier, CFBundleVersion, NSPrivacyTracking, etc.
- Validate icon files exist in expected paths
- Return array of `ComplianceIssue` objects

**`androidScanner.ts`:**
- Extract APK with JSZip
- Parse AndroidManifest.xml with `xml2js`
- Check permissions, SDK versions, application name
- Validate launcher icons in res/drawable
- Return array of `ComplianceIssue` objects

**`complianceRules.ts`:**
- Load rules from SQLite
- Match detected issues against rules database
- Assign severity levels (critical, warning, info)
- Attach fix guidance to each issue

### 5. State management (`store/useStore.ts`)
Create Zustand store with:
- `scans: ScanResult[]` — scan history
- `currentScan: ScanResult | null` — active scan
- `scanCount: number` — free tier limit tracking
- `isPremium: boolean` — subscription status
- Actions: `addScan()`, `setCurrentScan()`, `incrementScanCount()`

### 6. Scanner screen (`app/(tabs)/index.tsx`)
- "Select Build File" button using `expo-document-picker`
- Show loading state during scan
- Display scan count for free users ("2/3 scans used")
- Navigate to results screen on completion
- Show upgrade prompt if scan limit reached

### 7. Results screen (`app/scan-results.tsx`)
- Group issues by severity (Critical → Warning → Info)
- Render `ComplianceIssueCard` for each issue
- Each card shows: title, description, fix guidance
- "Export Report" button (premium only)
- "Save Scan" button to add to history

### 8. History screen (`app/(tabs)/history.tsx`)
- FlatList of past scans from SQLite
- Each item shows: date, platform, issue count, pass/fail status
- Tap to view full results
- Swipe to delete (premium: unlimited history, free: last 3 scans)

### 9. Settings screen (`app/(tabs)/settings.tsx`)
- Subscription status display
- "Upgrade to Premium" button (links to in-app purchase flow)
- "Update Compliance Rules" button (premium only)
- About section with version info

### 10. Components

**`ScanButton.tsx`:**
- Reusable button with loading state
- Disabled state when scan limit reached (free tier)

**`ComplianceIssueCard.tsx`:**
- Props: `issue: ComplianceIssue`
- Color-coded by severity
- Expandable to show full fix guidance
- Copy button for code snippets

**`UpgradePrompt.tsx`:**
- Modal overlay
- Shows premium features
- "Upgrade Now" CTA

### 11. Types (`lib/types.ts`)
```typescript
export interface ScanResult {
  id: string;
  timestamp: number;
  platform: 'ios' | 'android';
  fileName: string;
  issues: ComplianceIssue[];
  passed: boolean;
}

export interface ComplianceIssue {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  fix: string;
  documentationUrl?: string;
}
```

### 12. Testing setup

**`jest.config.js`:**
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
};
```

**`__tests__/scanner.test.ts`:**
- Mock file system and JSZip
- Test IPA extraction and Info.plist parsing
- Test APK extraction and manifest parsing
- Verify issue detection for missing required fields

**`__tests__/complianceRules.test.ts`:**
- Test rule matching logic
- Verify severity assignment
- Test fix guidance generation

**`__tests__/database.test.ts`:**
- Test scan CRUD operations
- Test rule loading from JSON
- Test scan history limits (free vs premium)

### 13. Seed data
Create sample compliance rules covering:
- iOS: Privacy manifest, App Transport Security, required device capabilities, icon sizes
- Android: Permissions, target SDK version, launcher icons, app name requirements

### 14. Polish
- Add empty states for history screen
- Add error handling for corrupted build files
- Add success animations after scan completion
- Implement basic analytics (scan count, issue frequency)

## How to verify it works

### Local development
```bash
npm install
npm test  # All tests must pass
npx expo start
```

### Testing on device/simulator

**iOS Simulator:**
1. Press `i` in Expo CLI to open iOS simulator
2. Tap "Select Build File" on Scanner tab
3. Use a sample IPA file (create one from any Xcode project: Product → Archive → Export)
4. Verify scan completes and shows issues
5. Check History tab shows saved scan
6. Verify free tier limits (3 scans max)

**Android Emulator:**
1. Press `a` in Expo CLI to open Android emulator
2. Repeat steps 2-6 with an APK file

**Test checklist:**
- [ ] Can select and scan IPA files
- [ ] Can select and scan APK files
- [ ] Issues display with correct severity colors
- [ ] Fix guidance is readable and actionable
- [ ] Scan history persists across app restarts
- [ ] Free tier blocks scans after limit
- [ ] Upgrade prompt appears correctly
- [ ] `npm test` passes all unit tests
- [ ] App doesn't crash with malformed build files

**Sample test builds:**
- Create a minimal React Native app with intentional compliance issues (missing privacy manifest, wrong icon sizes)
- Build IPA and APK
- Use these as test fixtures to verify scanner catches known issues