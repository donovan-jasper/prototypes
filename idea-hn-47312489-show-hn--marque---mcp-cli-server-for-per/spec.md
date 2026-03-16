# DesignBlend

## One-line pitch
Generate beautiful, consistent design systems in seconds—just snap a screenshot or describe your vision.

## Expanded vision

**Who is this REALLY for?**

This isn't just for designers. It's for anyone who needs to make digital things look good, fast:

- **Solo founders and indie hackers** who need a polished app UI but can't afford a designer
- **Content creators and influencers** building personal brand apps, Notion templates, or digital products
- **Small business owners** creating their own mobile apps, websites, or marketing materials
- **Students and bootcamp grads** who need professional-looking portfolios and projects
- **Product managers** who want to mock up ideas before involving design teams
- **Non-technical entrepreneurs** who want to visualize their app idea to pitch investors

**Broadest audience:** Anyone who's ever thought "I wish this looked better" but doesn't know where to start.

**Adjacent use cases:**
- Brand identity generation (colors, fonts, spacing) from a single reference image
- Instant UI mockups from verbal descriptions ("make it look like Stripe but warmer")
- Design system documentation that auto-updates as you refine
- Accessibility checking and contrast ratio optimization
- Export to Figma, Tailwind config, or React Native StyleSheet

**Why non-technical people want this:**
You don't need to understand design tokens, color theory, or typography scales. Just show the app something you like, describe what you're building, and get a complete design system that actually works. It's like having a designer in your pocket who never judges your taste.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **AI/ML:** OpenAI GPT-4 Vision API for image analysis, GPT-4 for system generation
- **Camera:** expo-camera
- **Image processing:** expo-image-manipulator
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Styling:** NativeWind (Tailwind for React Native)
- **Testing:** Jest + React Native Testing Library
- **Analytics:** Expo Analytics (built-in, privacy-focused)

## Core features (MVP)

1. **Snap & Analyze** — Take a photo of any UI (app screenshot, website, poster) and instantly extract colors, typography, spacing, and component patterns. Get a named design system in 10 seconds.

2. **Blend Systems** — Combine 2-3 design references to create something unique. "Make it 70% Stripe, 30% Linear" or "Blend these three apps but make it warmer."

3. **Live Preview** — See your design system applied to common UI patterns (buttons, cards, forms, navigation) in real-time. Export as code (React Native, Tailwind, CSS variables) or Figma tokens.

4. **Smart Refinement** — AI suggests improvements: "Your contrast ratio is too low for accessibility" or "This color palette works better for dark mode."

5. **Project Library** — Save unlimited design systems, tag them by project or mood, and instantly switch between them. Each system includes usage examples and code snippets.

## Monetization strategy

**Free tier (the hook):**
- 3 design systems per month
- Basic image analysis (colors + fonts only)
- Export to CSS variables
- Community design systems (browse and clone popular systems)

**Pro tier — $7.99/month (the paywall):**
- Unlimited design systems
- Advanced blending (3+ references, weighted mixing)
- Full component analysis (spacing, shadows, borders, animations)
- Export to React Native, Tailwind, Figma, Sketch
- AI refinement suggestions
- Dark mode auto-generation
- Priority support

**Why this price?** Lower than Figma ($12) or Adobe ($10+), positioned as an "indie tool" not enterprise software. Comparable to other creator tools (Canva Pro $13, Notion Plus $8).

**What makes people STAY subscribed?**
- Their entire design system library lives in the app (switching cost)
- They use it at the start of every new project (habitual)
- AI suggestions improve over time based on their preferences (personalization)
- Export formats save hours of manual work (ROI is clear)

**One-time purchase option:** $39 "Lifetime Starter" (limited to 10 systems, no blending) for people who hate subscriptions.

## File structure

```
designblend/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home: recent systems + quick actions
│   │   ├── library.tsx               # All saved design systems
│   │   ├── create.tsx                # Camera + image picker
│   │   └── settings.tsx              # Account, subscription, export prefs
│   ├── system/
│   │   └── [id].tsx                  # Design system detail view
│   ├── blend.tsx                     # Multi-system blending interface
│   ├── preview.tsx                   # Live component preview
│   └── _layout.tsx                   # Root layout with navigation
├── components/
│   ├── DesignSystemCard.tsx          # Grid item for library
│   ├── ColorPalette.tsx              # Color swatch display
│   ├── TypographyScale.tsx           # Font preview
│   ├── ComponentPreview.tsx          # Button/card/form examples
│   ├── CameraCapture.tsx             # Camera interface
│   ├── BlendSlider.tsx               # Weight adjustment for blending
│   └── ExportModal.tsx               # Code export options
├── lib/
│   ├── db.ts                         # SQLite setup and queries
│   ├── ai.ts                         # OpenAI API calls
│   ├── imageAnalysis.ts              # Vision API processing
│   ├── designSystem.ts               # System generation logic
│   ├── blending.ts                   # Multi-system merging
│   ├── export.ts                     # Code generation (RN, Tailwind, etc.)
│   └── storage.ts                    # File system for images
├── store/
│   └── useDesignStore.ts             # Zustand state management
├── types/
│   └── index.ts                      # TypeScript interfaces
├── __tests__/
│   ├── imageAnalysis.test.ts
│   ├── designSystem.test.ts
│   ├── blending.test.ts
│   └── export.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/imageAnalysis.test.ts
import { extractColors, analyzeTypography } from '../lib/imageAnalysis';

describe('Image Analysis', () => {
  it('extracts dominant colors from image data', () => {
    const mockImageData = 'base64...';
    const colors = extractColors(mockImageData);
    expect(colors).toHaveLength(5);
    expect(colors[0]).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('identifies font characteristics', () => {
    const mockAnalysis = { fontFamily: 'Sans-serif', weights: [400, 700] };
    expect(analyzeTypography(mockAnalysis)).toHaveProperty('scale');
  });
});

// __tests__/designSystem.test.ts
import { generateSystem } from '../lib/designSystem';

describe('Design System Generation', () => {
  it('creates valid design system from analysis', () => {
    const analysis = {
      colors: ['#000000', '#FFFFFF'],
      typography: { base: 16, scale: 1.25 },
      spacing: [4, 8, 16, 32]
    };
    const system = generateSystem(analysis);
    expect(system).toHaveProperty('name');
    expect(system.colors.primary).toBeDefined();
  });
});

// __tests__/blending.test.ts
import { blendSystems } from '../lib/blending';

describe('System Blending', () => {
  it('merges two systems with weighted average', () => {
    const system1 = { colors: { primary: '#FF0000' } };
    const system2 = { colors: { primary: '#0000FF' } };
    const blended = blendSystems([system1, system2], [0.5, 0.5]);
    expect(blended.colors.primary).toBe('#7F007F');
  });
});

// __tests__/export.test.ts
import { exportToReactNative, exportToTailwind } from '../lib/export';

describe('Code Export', () => {
  it('generates valid React Native StyleSheet', () => {
    const system = { colors: { primary: '#000' } };
    const code = exportToReactNative(system);
    expect(code).toContain('StyleSheet.create');
    expect(code).toContain('primary: "#000"');
  });

  it('generates valid Tailwind config', () => {
    const system = { colors: { primary: '#000' } };
    const config = exportToTailwind(system);
    expect(config).toContain('module.exports');
    expect(config).toContain('primary: "#000"');
  });
});
```

## Implementation steps

### Phase 1: Project setup and database

1. Initialize Expo project with TypeScript template:
   ```bash
   npx create-expo-app designblend --template expo-template-blank-typescript
   cd designblend
   ```

2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-camera expo-image-manipulator expo-image-picker
   npm install zustand nativewind openai
   npm install -D @types/jest @testing-library/react-native jest-expo
   ```

3. Create SQLite schema in `lib/db.ts`:
   - `design_systems` table: id, name, colors (JSON), typography (JSON), spacing (JSON), created_at, updated_at
   - `system_images` table: id, system_id, image_uri, analysis (JSON)
   - Initialize database on app launch
   - Create CRUD functions: createSystem, getSystem, updateSystem, deleteSystem, listSystems

4. Set up Zustand store in `store/useDesignStore.ts`:
   - State: currentSystem, systems (array), isLoading, error
   - Actions: loadSystems, selectSystem, saveSystem, deleteSystem

### Phase 2: Camera and image analysis

5. Build `CameraCapture.tsx` component:
   - Request camera permissions
   - Display camera preview with capture button
   - Save captured image to file system
   - Return image URI to parent

6. Implement `lib/imageAnalysis.ts`:
   - `analyzeImage(imageUri)`: Send to OpenAI Vision API with prompt: "Extract the color palette (5 colors), typography characteristics (font style, weights, sizes), spacing patterns, and component styles from this UI screenshot. Return as JSON."
   - Parse API response into structured data
   - Handle errors and rate limits

7. Create `lib/designSystem.ts`:
   - `generateSystem(analysis)`: Convert raw analysis into design system object
   - Auto-generate system name using AI (e.g., "Ocean Breeze", "Midnight Slate")
   - Create semantic color names (primary, secondary, accent, background, text)
   - Generate typography scale (base size, ratio, line heights)
   - Define spacing scale (4px base, 1.5x ratio)

### Phase 3: Core UI screens

8. Build `app/(tabs)/create.tsx`:
   - Show camera button and image picker button
   - Display loading state while analyzing
   - Show preview of extracted system
   - "Save System" button that writes to database

9. Build `app/(tabs)/library.tsx`:
   - Grid of `DesignSystemCard` components
   - Each card shows: name, color palette preview, creation date
   - Tap to navigate to detail view
   - Long press for delete option

10. Build `app/system/[id].tsx`:
    - Display full design system details
    - `ColorPalette` component: swatches with hex codes, tap to copy
    - `TypographyScale` component: font sizes with examples
    - Spacing scale visualization
    - "Preview Components" button → navigate to preview screen
    - "Export" button → open export modal

11. Build `app/preview.tsx`:
    - Show common UI patterns using current system:
      - Buttons (primary, secondary, outline)
      - Cards with shadows
      - Form inputs
      - Navigation bar
    - Apply colors, typography, spacing from system
    - Real-time updates when system changes

### Phase 4: Blending feature

12. Build `app/blend.tsx`:
    - Multi-select from library (2-5 systems)
    - `BlendSlider` for each selected system (weight 0-100%)
    - Live preview of blended result
    - "Create Blended System" button

13. Implement `lib/blending.ts`:
    - `blendSystems(systems, weights)`: Merge multiple systems
    - Color blending: weighted average in LAB color space (perceptually uniform)
    - Typography: pick most common characteristics, average sizes
    - Spacing: merge and deduplicate values
    - Return new system object

### Phase 5: Export and AI refinement

14. Implement `lib/export.ts`:
    - `exportToReactNative(system)`: Generate StyleSheet code
    - `exportToTailwind(system)`: Generate tailwind.config.js
    - `exportToCSS(system)`: Generate CSS variables
    - `exportToFigma(system)`: Generate Figma tokens JSON

15. Build `ExportModal.tsx`:
    - Format selector (React Native, Tailwind, CSS, Figma)
    - Code preview with syntax highlighting
    - "Copy to Clipboard" button
    - "Share" button (native share sheet)

16. Add AI refinement in `lib/ai.ts`:
    - `suggestImprovements(system)`: Send system to GPT-4 with prompt: "Analyze this design system for accessibility issues, color harmony, and usability. Suggest 3 specific improvements."
    - Display suggestions in system detail view
    - "Apply Suggestion" button that updates system

### Phase 6: Monetization and polish

17. Implement usage limits:
    - Track system count in AsyncStorage
    - Show paywall modal when free tier limit reached
    - "Upgrade to Pro" button → in-app purchase flow

18. Add subscription handling:
    - Integrate Expo In-App Purchases
    - Validate subscription status on app launch
    - Unlock Pro features: unlimited systems, blending, advanced export

19. Build `app/(tabs)/settings.tsx`:
    - Display subscription status
    - "Manage Subscription" button
    - Export preferences (default format)
    - About section with version number

20. Polish UI:
    - Add loading skeletons
    - Smooth transitions between screens
    - Haptic feedback on key actions
    - Empty states with helpful CTAs
    - Error boundaries with retry options

### Phase 7: Testing and optimization

21. Write and run all tests:
    ```bash
    npm test
    ```
    - Ensure all core logic tests pass
    - Add integration tests for critical flows

22. Test on physical devices:
    - iOS: Test camera, image picker, export sharing
    - Android: Test permissions, file storage, back button behavior

23. Optimize performance:
    - Lazy load images in library grid
    - Debounce blend slider updates
    - Cache AI responses for identical images
    - Compress stored images

## How to verify it works

### On device/simulator:

1. **Start the app:**
   ```bash
   npx expo start
   ```
   Scan QR code with Expo Go (iOS) or Expo app (Android)

2. **Test core flow:**
   - Tap "Create" tab → "Take Photo"
   - Grant camera permission
   - Capture a screenshot of any app (use another phone or computer screen)
   - Wait for analysis (5-10 seconds)
   - Verify extracted colors and fonts appear
   - Tap "Save System"
   - Navigate to "Library" tab
   - Verify new system appears in grid
   - Tap system card → verify detail view shows all data
   - Tap "Preview Components" → verify buttons/cards use system colors
   - Tap "Export" → select React Native → verify code is generated
   - Tap "Copy to Clipboard" → paste in notes app to verify

3. **Test blending:**
   - Create 2-3 systems using different reference images
   - Tap "Blend" from any system detail view
   - Select 2 systems
   - Adjust sliders
   - Verify preview updates in real-time
   - Save blended system
   - Verify it appears in library

4. **Test limits (free tier):**
   - Create 3 systems
   - Attempt to create 4th system
   - Verify paywall modal appears
   - (In production: test actual IAP flow)

### Automated tests:

```bash
npm test
```

All tests must pass:
- ✓ Image analysis extracts colors
- ✓ Design system generation creates valid structure
- ✓ Blending merges systems correctly
- ✓ Export generates valid code for all formats

### Success criteria:

- App launches without crashes
- Camera captures and analyzes images successfully
- Design systems save and load from database
- All UI screens render correctly
- Export generates valid, copy-pasteable code
- Tests pass with 100% success rate
- No console errors or warnings in Expo logs