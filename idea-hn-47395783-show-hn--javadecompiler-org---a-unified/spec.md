# CodeLens

## One-line pitch
Examine and understand any compiled app's code structure instantly — your pocket reverse engineering lab for security audits, code reviews, and learning on the go.

## Expanded vision

**Core audience expansion:**

This isn't just for security researchers. This is for:

- **Mobile developers debugging production issues** — When your app crashes in production and you need to quickly examine a compiled build to understand what went wrong, you don't have time to boot up a laptop. Pull out your phone, decompile, and diagnose.

- **Students and bootcamp grads learning how apps work** — Reverse engineering is the fastest way to learn. Students can examine popular apps to understand architectural patterns, see how features are implemented, and learn from production code. This democratizes learning that was previously locked behind expensive desktop tools.

- **Freelance consultants doing code audits** — Clients send you an APK or IPA and want a security assessment. You're at a coffee shop, on a train, or traveling. You can start the audit immediately, deliver faster, and win more contracts.

- **Tech-curious non-developers** — People who want to understand "what's inside" their favorite apps. Think of it like "how it's made" for software. Educational content creators, tech journalists, and curious users who want to peek under the hood.

- **Open source contributors** — Examining closed-source apps to understand APIs, data structures, and integration patterns before building compatible open source alternatives.

**Adjacent use cases:**
- Competitive analysis (understanding how competitors built features)
- Malware analysis (identifying suspicious code patterns)
- Legacy code archaeology (understanding old codebases with no documentation)
- Educational content creation (creating tutorials showing real-world code)
- API reverse engineering (discovering undocumented endpoints)

**The non-technical hook:**
"Ever wonder how Instagram stories work? Or how TikTok's algorithm decides what to show you? CodeLens lets you peek inside any app and see the actual code that makes it tick." It's curiosity-driven exploration made accessible.

## Tech stack

- **React Native (Expo)** — Cross-platform iOS + Android
- **expo-file-system** — File handling and storage
- **expo-document-picker** — APK/IPA/JAR file selection
- **SQLite (expo-sqlite)** — Local storage for decompilation history and favorites
- **react-native-syntax-highlighter** — Code display with syntax highlighting
- **@react-native-community/netinfo** — Detect online/offline for cloud features
- **react-native-share** — Export and share decompiled code
- **expo-crypto** — File hashing for integrity checks
- **zustand** — Lightweight state management
- **react-native-reanimated** — Smooth animations for code navigation

**Decompilation engines (lightweight mobile ports):**
- **Fernflower** (Java) — Lightweight, mobile-friendly
- **Procyon** (Java/Android) — Good for APK analysis
- **Smali/Baksmali** — Android DEX bytecode
- **Custom JavaScript parser** — For React Native bundles

## Core features

1. **Instant Decompilation** — Drop in an APK, IPA, or JAR file and get readable source code in seconds. Supports Java, Kotlin, JavaScript (React Native bundles), and basic Swift/Objective-C headers. Smart caching means you never decompile the same file twice.

2. **Visual Code Explorer** — Navigate decompiled code with a file tree, search across all files, jump to definitions, and see class hierarchies. Syntax highlighting and collapsible code blocks make it readable on small screens.

3. **Security Insights** — Automatic detection of common vulnerabilities: hardcoded API keys, insecure network calls, weak encryption, exposed secrets. Get a security score and actionable recommendations. This is the killer feature that makes security professionals pay.

4. **Comparison Mode** — Upload two versions of the same app and see exactly what changed between releases. Perfect for tracking updates, finding new features, or detecting malicious modifications.

5. **Export & Share** — Save decompiled code as organized folders, generate PDF reports with security findings, or share specific code snippets with syntax highlighting intact.

## Monetization strategy

**Free tier (the hook):**
- Decompile up to 3 files per month
- Basic Java/Kotlin decompilation only
- View code with syntax highlighting
- File size limit: 50MB
- Ads between decompilation sessions (non-intrusive)

**Premium ($12.99/month or $99/year — reasoning below):**
- Unlimited decompilations
- All languages supported (Java, Kotlin, JS, Swift headers, Objective-C)
- Security insights and vulnerability scanning
- Comparison mode for version diffing
- Export to PDF, ZIP, or organized folders
- No file size limits
- Ad-free experience
- Cloud sync across devices
- Priority processing (faster decompilation)

**Why $12.99?** Desktop tools like JD-GUI are free but limited. Professional tools like IDA Pro cost $1,000+. We're positioning between "hobbyist free tool" and "enterprise security suite." Security professionals bill $100-300/hour — if this saves them 30 minutes once, it's paid for itself. Students get value from learning. Developers get value from debugging. The price is low enough for individuals, high enough to feel premium.

**What makes people stay subscribed:**
- **Decompilation history** — All your past work is saved and searchable. Cancel and you lose access to your library.
- **Security insights improve over time** — We continuously add new vulnerability patterns. Subscribers get the latest detection rules.
- **Comparison mode is addictive** — Once you've used it to track competitor updates or audit your own releases, you can't go back.
- **Cloud sync** — Start analysis on your phone, finish on your tablet. Seamless workflow.

**Enterprise tier ($49.99/month per seat, minimum 5 seats):**
- Team collaboration features
- Shared decompilation libraries
- Custom vulnerability rules
- API access for CI/CD integration
- Priority support
- Compliance reporting (SOC 2, GDPR audit trails)

## File structure

```
codelens/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home - recent decompilations
│   │   ├── explore.tsx               # Browse and search history
│   │   ├── insights.tsx              # Security insights dashboard
│   │   └── settings.tsx              # Settings and subscription
│   ├── decompile/
│   │   └── [id].tsx                  # Decompilation viewer
│   ├── compare/
│   │   └── [id].tsx                  # Comparison mode
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── CodeViewer.tsx                # Syntax-highlighted code display
│   ├── FileTree.tsx                  # Navigable file structure
│   ├── SecurityBadge.tsx             # Vulnerability indicators
│   ├── ComparisonView.tsx            # Side-by-side diff viewer
│   ├── UploadButton.tsx              # File picker component
│   └── SubscriptionGate.tsx          # Paywall component
├── lib/
│   ├── decompiler/
│   │   ├── index.ts                  # Main decompiler orchestrator
│   │   ├── java-decompiler.ts        # Fernflower wrapper
│   │   ├── android-decompiler.ts     # APK/DEX handler
│   │   ├── js-decompiler.ts          # React Native bundle parser
│   │   └── file-parser.ts            # ZIP/JAR extraction
│   ├── security/
│   │   ├── scanner.ts                # Vulnerability detection
│   │   ├── rules.ts                  # Security rule definitions
│   │   └── scoring.ts                # Security score calculator
│   ├── storage/
│   │   ├── database.ts               # SQLite setup and queries
│   │   ├── cache.ts                  # Decompilation cache manager
│   │   └── export.ts                 # Export functionality
│   ├── comparison/
│   │   ├── differ.ts                 # Code diffing algorithm
│   │   └── matcher.ts                # File matching logic
│   └── subscription/
│       ├── paywall.ts                # Subscription logic
│       └── limits.ts                 # Usage limit enforcement
├── hooks/
│   ├── useDecompilation.ts           # Decompilation state management
│   ├── useSecurityScan.ts            # Security scanning hook
│   ├── useSubscription.ts            # Subscription status
│   └── useFileStorage.ts             # File system operations
├── store/
│   └── app-store.ts                  # Zustand global state
├── constants/
│   ├── security-rules.ts             # Vulnerability patterns
│   └── subscription-tiers.ts         # Pricing and limits
├── __tests__/
│   ├── decompiler.test.ts
│   ├── security-scanner.test.ts
│   ├── differ.test.ts
│   ├── database.test.ts
│   └── subscription.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/decompiler.test.ts
import { decompileJavaClass, extractAPK } from '../lib/decompiler';

describe('Java Decompiler', () => {
  it('should decompile a simple Java class', async () => {
    const bytecode = Buffer.from('mock-bytecode');
    const result = await decompileJavaClass(bytecode);
    expect(result).toContain('public class');
  });

  it('should handle invalid bytecode gracefully', async () => {
    const invalid = Buffer.from('not-bytecode');
    await expect(decompileJavaClass(invalid)).rejects.toThrow();
  });
});

// __tests__/security-scanner.test.ts
import { scanForVulnerabilities, calculateSecurityScore } from '../lib/security/scanner';

describe('Security Scanner', () => {
  it('should detect hardcoded API keys', () => {
    const code = 'const API_KEY = "sk_live_12345";';
    const results = scanForVulnerabilities(code);
    expect(results).toContainEqual(
      expect.objectContaining({ type: 'hardcoded_secret' })
    );
  });

  it('should calculate security score correctly', () => {
    const vulnerabilities = [
      { severity: 'high', type: 'sql_injection' },
      { severity: 'low', type: 'weak_crypto' }
    ];
    const score = calculateSecurityScore(vulnerabilities);
    expect(score).toBeLessThan(70);
  });
});

// __tests__/differ.test.ts
import { diffFiles, matchFiles } from '../lib/comparison/differ';

describe('Code Differ', () => {
  it('should identify added lines', () => {
    const oldCode = 'line1\nline2';
    const newCode = 'line1\nline2\nline3';
    const diff = diffFiles(oldCode, newCode);
    expect(diff.additions).toHaveLength(1);
  });

  it('should match files by path similarity', () => {
    const files1 = ['com/app/MainActivity.java'];
    const files2 = ['com/app/MainActivity.java', 'com/app/NewActivity.java'];
    const matches = matchFiles(files1, files2);
    expect(matches).toHaveLength(1);
  });
});

// __tests__/database.test.ts
import { saveDecompilation, getRecentDecompilations } from '../lib/storage/database';

describe('Database Operations', () => {
  it('should save and retrieve decompilation', async () => {
    const data = {
      fileName: 'test.apk',
      fileSize: 1024,
      decompiled: true,
      timestamp: Date.now()
    };
    await saveDecompilation(data);
    const recent = await getRecentDecompilations(1);
    expect(recent[0].fileName).toBe('test.apk');
  });
});

// __tests__/subscription.test.ts
import { checkUsageLimit, canAccessFeature } from '../lib/subscription/limits';

describe('Subscription Limits', () => {
  it('should enforce free tier limits', () => {
    const usage = { decompilationsThisMonth: 3 };
    const canDecompile = checkUsageLimit(usage, 'free');
    expect(canDecompile).toBe(false);
  });

  it('should allow premium features for subscribers', () => {
    const canCompare = canAccessFeature('comparison', 'premium');
    expect(canCompare).toBe(true);
  });
});
```

## Implementation steps

### Phase 1: Project setup and core infrastructure

1. **Initialize Expo project**
   ```bash
   npx create-expo-app codelens --template tabs
   cd codelens
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-file-system expo-document-picker expo-sqlite expo-crypto expo-sharing
   npm install zustand react-native-syntax-highlighter @react-native-community/netinfo
   npm install -D @types/react @types/react-native jest @testing-library/react-native
   ```

3. **Set up SQLite database schema**
   - Create `lib/storage/database.ts`
   - Define tables: `decompilations`, `security_findings`, `user_settings`
   - Implement CRUD operations with proper indexing
   - Add migration system for schema updates

4. **Create Zustand store**
   - Define global state: current decompilation, subscription status, usage limits
   - Implement actions: setDecompilation, updateSubscription, incrementUsage
   - Add persistence middleware for offline support

### Phase 2: File handling and decompilation engine

5. **Build file picker and validator**
   - Create `components/UploadButton.tsx` with expo-document-picker
   - Validate file types (APK, IPA, JAR, CLASS)
   - Check file size limits based on subscription tier
   - Calculate file hash for caching

6. **Implement Java decompiler**
   - Create `lib/decompiler/java-decompiler.ts`
   - Integrate lightweight Fernflower port (or use WebAssembly build)
   - Handle CLASS file parsing and bytecode analysis
   - Return structured AST with source code

7. **Implement Android APK decompiler**
   - Create `lib/decompiler/android-decompiler.ts`
   - Extract APK using JSZip or similar
   - Parse AndroidManifest.xml
   - Decompile DEX files to Smali/Java
   - Extract resources and assets

8. **Implement JavaScript bundle decompiler**
   - Create `lib/decompiler/js-decompiler.ts`
   - Parse React Native bundles (Metro format)
   - Beautify minified JavaScript
   - Extract component structure and dependencies

9. **Build decompilation orchestrator**
   - Create `lib/decompiler/index.ts`
   - Detect file type automatically
   - Route to appropriate decompiler
   - Implement caching layer (check hash before decompiling)
   - Handle errors gracefully with user-friendly messages

### Phase 3: Code viewer and navigation

10. **Create syntax-highlighted code viewer**
    - Build `components/CodeViewer.tsx`
    - Integrate react-native-syntax-highlighter
    - Support multiple languages (Java, Kotlin, JavaScript, XML)
    - Implement line numbers and code folding
    - Add pinch-to-zoom for readability

11. **Build file tree navigator**
    - Create `components/FileTree.tsx`
    - Display hierarchical folder structure
    - Implement expand/collapse animations
    - Add search functionality across all files
    - Show file icons based on type

12. **Implement code search**
    - Add full-text search across decompiled code
    - Support regex patterns
    - Highlight search results in code viewer
    - Show search results count and navigation

### Phase 4: Security scanning

13. **Build vulnerability scanner**
    - Create `lib/security/scanner.ts`
    - Define regex patterns for common vulnerabilities:
      - Hardcoded API keys (AWS, Stripe, Firebase patterns)
      - SQL injection risks (string concatenation in queries)
      - Insecure network calls (HTTP instead of HTTPS)
      - Weak encryption (MD5, SHA1 usage)
      - Exposed secrets (passwords, tokens in code)
    - Implement severity scoring (critical, high, medium, low)

14. **Create security rules engine**
    - Define `constants/security-rules.ts` with extensible rule format
    - Implement rule matching against code AST
    - Add context-aware detection (reduce false positives)
    - Support custom rules for enterprise tier

15. **Build security insights UI**
    - Create `app/(tabs)/insights.tsx`
    - Display security score with visual gauge
    - List vulnerabilities grouped by severity
    - Show code snippets with highlighted issues
    - Provide remediation suggestions

### Phase 5: Comparison mode

16. **Implement file diffing algorithm**
    - Create `lib/comparison/differ.ts`
    - Use Myers diff algorithm for line-by-line comparison
    - Detect added, removed, and modified lines
    - Calculate similarity percentage

17. **Build file matcher**
    - Create `lib/comparison/matcher.ts`
    - Match files between two decompilations by path
    - Handle renamed files using content similarity
    - Identify new and deleted files

18. **Create comparison UI**
    - Build `components/ComparisonView.tsx`
    - Side-by-side diff view with synchronized scrolling
    - Color-coded additions (green) and deletions (red)
    - File-level comparison summary
    - Export comparison report

### Phase 6: Export and sharing

19. **Implement export functionality**
    - Create `lib/storage/export.ts`
    - Export as ZIP with organized folder structure
    - Generate PDF reports with security findings
    - Include metadata (file name, decompilation date, security score)
    - Use expo-sharing for native share sheet

20. **Build share functionality**
    - Share individual code snippets with syntax highlighting
    - Share security reports as formatted text
    - Generate shareable links (for premium users with cloud sync)

### Phase 7: Subscription and monetization

21. **Integrate subscription system**
    - Create `lib/subscription/paywall.ts`
    - Integrate RevenueCat or Expo In-App Purchases
    - Define subscription tiers in `constants/subscription-tiers.ts`
    - Implement usage tracking and limit enforcement

22. **Build paywall UI**
    - Create `components/SubscriptionGate.tsx`
    - Show feature comparison table
    - Implement smooth upgrade flow
    - Add restore purchases functionality

23. **Implement usage limits**
    - Track decompilations per month in SQLite
    - Enforce file size limits based on tier
    - Gate premium features (comparison, security scan, export)
    - Show usage progress in settings

### Phase 8: Polish and optimization

24. **Add onboarding flow**
    - Create first-run tutorial
    - Show example decompilation
    - Explain key features
    - Prompt for subscription trial

25. **Implement caching and performance optimization**
    - Cache decompiled code in file system
    - Lazy load large files
    - Optimize syntax highlighting for mobile
    - Add loading states and progress indicators

26. **Add error handling and logging**
    - Graceful error messages for failed decompilations
    - Log errors for debugging (without PII)
    - Implement retry logic for network operations
    - Add offline mode support

27. **Create settings screen**
    - Build `app/(tabs)/settings.tsx`
    - Theme selection (light/dark)
    - Font size adjustment
    - Clear cache option
    - Subscription management
    - About and privacy policy links

### Phase 9: Testing and deployment

28. **Write comprehensive tests**
    - Unit tests for all decompiler modules
    - Integration tests for database operations
    - UI tests for critical flows (upload, view, export)
    - Subscription logic tests
    - Security scanner accuracy tests

29. **Test on real devices**
    - Test APK decompilation on Android
    - Test IPA header extraction on iOS
    - Verify performance with large files (100MB+)
    - Test offline functionality
    - Verify subscription flows on both platforms

30. **Prepare for App Store submission**
    - Create app icons and screenshots
    - Write App Store description emphasizing educational use
    - Add privacy policy (no data collection beyond subscription)
    - Implement age rating compliance
    - Add disclaimer about reverse engineering legality

## How to verify it works

### Local development testing

1. **Start Expo development server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   - Press `i` in terminal to open iOS simulator
   - Upload a sample JAR file (create a simple Java class and compile it)
   - Verify decompilation produces readable Java code
   - Test file tree navigation
   - Verify syntax highlighting works

3. **Test on Android Emulator**
   - Press `a` in terminal to open Android emulator
   - Upload a sample APK (use a simple open-source app)
   - Verify APK extraction and decompilation
   - Test security scanner on code with intentional vulnerabilities
   - Verify export functionality

4. **Test on physical device with Expo Go**
   - Scan QR code with Expo Go app
   - Test file picker with real APK/JAR files
   - Verify performance with larger files (50MB+)
   - Test comparison mode with two versions of same app
   - Verify subscription paywall appears correctly

### Automated testing

5. **Run Jest test suite**
   ```bash
   npm test
   ```
   - All tests in `__tests__/` must pass
   - Coverage should be >80% for core logic
   - Security scanner tests must detect all sample vulnerabilities

6. **Test critical user flows**
   - Upload → Decompile → View code (must complete in <10 seconds for small files)
   - Security scan → View insights → Export report
   - Compare two files → View diff → Share comparison
   - Hit free tier limit → See paywall → Upgrade flow

### Production readiness checklist

- [ ] Decompilation works for Java, Kotlin, and JavaScript
- [ ] Security scanner detects at least 10 common vulnerability types
- [ ] Comparison mode accurately diffs code changes
- [ ] Export generates valid ZIP and PDF files
- [ ] Subscription paywall enforces limits correctly
- [ ] App works offline (cached decompilations accessible)
- [ ] No crashes with invalid or corrupted files
- [ ] Performance acceptable on 3-year-old devices
- [ ] All tests pass with `npm test`
- [ ] App Store guidelines compliance verified