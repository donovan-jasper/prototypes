# SlideFlow

## One-line pitch
Turn any idea into beautiful slides in seconds using AI—no design skills required.

## Expanded vision

**Who is this REALLY for?**

This isn't just for people who want to render HTML as slides. This is for anyone who needs to communicate ideas visually but hates the friction of traditional presentation tools.

**Broadest audience:**
- **Students** cramming for presentations who need slides fast
- **Startup founders** pitching to investors without a designer
- **Sales teams** creating quick product demos on the go
- **Teachers** building lesson materials between classes
- **Content creators** repurposing blog posts or scripts into slide decks
- **Consultants** assembling client presentations from notes
- **Event speakers** preparing talks while traveling

**Adjacent use cases:**
- Convert meeting notes into shareable slide summaries
- Transform blog posts or articles into visual presentations
- Create social media carousel posts from text
- Generate training materials from documentation
- Build pitch decks from bullet points
- Turn interview transcripts into presentation slides

**Why non-technical people want this:**
Traditional slide tools have a paradox: they're powerful but overwhelming. You spend more time fighting with alignment, fonts, and animations than communicating your idea. SlideFlow removes that friction—you describe what you want, AI builds it, you present it. It's the difference between "I need to learn PowerPoint" and "I need to share this idea."

The HTML rendering is a technical implementation detail. The real value is **instant, beautiful slides from any input**—voice notes, text, photos, or URLs.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **UI:** React Native Paper (Material Design 3)
- **Local storage:** expo-sqlite for slide decks and settings
- **AI integration:** Anthropic Claude API (via edge function or direct)
- **HTML rendering:** react-native-webview for slide display
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Navigation:** Expo Router (file-based routing)
- **Testing:** Jest + React Native Testing Library
- **Payments:** RevenueCat (handles iOS/Android subscriptions)

## Core features (MVP)

1. **AI Slide Generation**
   - Input: text prompt, voice note, or photo
   - Output: complete HTML slide deck with styling
   - One-tap regeneration if you don't like the result

2. **Live Preview & Present Mode**
   - Swipe through slides in full-screen mode
   - Tap to advance, pinch to zoom
   - Works offline once generated

3. **Smart Templates**
   - AI auto-selects template based on content type (pitch, lesson, report)
   - Users can override with "Make it more [professional/fun/minimal]"

4. **One-Tap Export**
   - Share as PDF, HTML file, or link
   - Export to Google Slides or PowerPoint (premium)

5. **Deck Library**
   - All generated decks saved locally
   - Search by keyword or date
   - Duplicate and remix existing decks

## Monetization strategy

**Free tier (hook):**
- 5 AI-generated decks per month
- Basic templates only
- SlideFlow watermark on exports
- PDF export only

**Premium ($7/month or $60/year):**
- Unlimited AI generations
- Advanced templates (pitch deck, academic, corporate)
- Remove watermark
- Export to PowerPoint/Google Slides
- Custom branding (logo, colors)
- Priority AI processing (faster generation)
- Offline mode (pre-download AI models for basic edits)

**Why $7/month?**
- Higher than typical utility apps ($3-5) because AI costs are real
- Lower than creative tools ($10-15) to stay accessible to students
- Annual plan offers 30% savings to encourage retention

**What makes people STAY subscribed?**
- **Habit formation:** Once you've made 10+ decks, you rely on the library
- **Time savings:** Generating slides in 30 seconds vs 30 minutes is addictive
- **Quality consistency:** AI learns your style over time (premium feature)
- **Professional necessity:** Can't present with watermarks in client meetings

**Retention tactics:**
- Monthly usage reports: "You saved 4 hours this month"
- Deck anniversaries: "Your pitch deck from last year—want to update it?"
- Collaboration invites: "Invite a teammate, get 1 month free"

## File structure

```
slideflow/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home: deck library
│   │   ├── create.tsx             # AI generation screen
│   │   └── settings.tsx           # Settings & subscription
│   ├── deck/
│   │   └── [id].tsx               # View/present individual deck
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── DeckCard.tsx               # Deck preview card
│   ├── SlideViewer.tsx            # WebView-based slide renderer
│   ├── AIPromptInput.tsx          # Multi-input (text/voice/photo)
│   ├── TemplateSelector.tsx       # Template picker
│   └── ExportSheet.tsx            # Export options bottom sheet
├── lib/
│   ├── ai/
│   │   ├── generateSlides.ts     # Claude API integration
│   │   └── promptTemplates.ts    # System prompts for different deck types
│   ├── db/
│   │   ├── schema.ts             # SQLite schema
│   │   └── queries.ts            # Database operations
│   ├── html/
│   │   ├── slideTemplate.ts      # Base HTML/CSS for slides
│   │   └── themes.ts             # Color schemes and fonts
│   └── export/
│       ├── toPDF.ts              # PDF generation
│       └── toHTML.ts             # Standalone HTML export
├── store/
│   └── useStore.ts               # Zustand store (decks, settings)
├── constants/
│   └── Config.ts                 # API keys, feature flags
├── __tests__/
│   ├── generateSlides.test.ts
│   ├── db.test.ts
│   ├── slideTemplate.test.ts
│   └── components/
│       ├── DeckCard.test.tsx
│       └── SlideViewer.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**Core logic tests:**

```typescript
// __tests__/generateSlides.test.ts
import { generateSlides } from '../lib/ai/generateSlides';

describe('generateSlides', () => {
  it('generates valid HTML from text prompt', async () => {
    const result = await generateSlides('Create a 3-slide pitch deck about AI');
    expect(result.slides).toHaveLength(3);
    expect(result.html).toContain('<div class="slide">');
  });

  it('handles API errors gracefully', async () => {
    await expect(generateSlides('')).rejects.toThrow('Prompt cannot be empty');
  });
});

// __tests__/db.test.ts
import { saveDeck, getDeck, listDecks } from '../lib/db/queries';

describe('Database operations', () => {
  it('saves and retrieves a deck', async () => {
    const deck = { title: 'Test Deck', html: '<div>Slide 1</div>', createdAt: Date.now() };
    const id = await saveDeck(deck);
    const retrieved = await getDeck(id);
    expect(retrieved.title).toBe('Test Deck');
  });

  it('lists all decks sorted by date', async () => {
    const decks = await listDecks();
    expect(Array.isArray(decks)).toBe(true);
  });
});

// __tests__/slideTemplate.test.ts
import { createSlideHTML } from '../lib/html/slideTemplate';

describe('Slide template generation', () => {
  it('wraps content in valid HTML structure', () => {
    const html = createSlideHTML(['<h1>Title</h1>', '<p>Content</p>'], 'minimal');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<div class="slide">');
  });

  it('applies theme styles correctly', () => {
    const html = createSlideHTML(['<h1>Test</h1>'], 'corporate');
    expect(html).toContain('font-family');
  });
});

// __tests__/components/DeckCard.test.tsx
import { render } from '@testing-library/react-native';
import DeckCard from '../../components/DeckCard';

describe('DeckCard', () => {
  it('renders deck title and preview', () => {
    const { getByText } = render(
      <DeckCard title="My Deck" slideCount={5} createdAt={Date.now()} />
    );
    expect(getByText('My Deck')).toBeTruthy();
    expect(getByText('5 slides')).toBeTruthy();
  });
});

// __tests__/components/SlideViewer.test.tsx
import { render } from '@testing-library/react-native';
import SlideViewer from '../../components/SlideViewer';

describe('SlideViewer', () => {
  it('renders WebView with HTML content', () => {
    const { getByTestId } = render(
      <SlideViewer html="<div>Test</div>" testID="slide-viewer" />
    );
    expect(getByTestId('slide-viewer')).toBeTruthy();
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app slideflow --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite react-native-webview zustand
   npm install react-native-paper
   npm install --save-dev jest @testing-library/react-native
   ```
3. Configure `app.json` with app name, bundle ID, and permissions (camera, microphone for voice input)
4. Set up Jest config for React Native

### Phase 2: Database layer
1. Create SQLite schema in `lib/db/schema.ts`:
   - `decks` table: id, title, html, thumbnail, createdAt, updatedAt
   - `settings` table: userId, isPremium, apiKey
2. Implement CRUD operations in `lib/db/queries.ts`
3. Write tests for all database operations
4. Initialize database on app launch in `app/_layout.tsx`

### Phase 3: AI integration
1. Create `lib/ai/generateSlides.ts`:
   - Function to call Claude API with user prompt
   - System prompt that instructs Claude to output structured HTML slides
   - Parse response into array of slide HTML strings
2. Create `lib/ai/promptTemplates.ts` with templates for different deck types
3. Add error handling for API failures (network, rate limits)
4. Write tests mocking API responses

### Phase 4: HTML rendering
1. Create `lib/html/slideTemplate.ts`:
   - Function that wraps slide content in full HTML document
   - Include CSS for responsive slide layout (16:9 aspect ratio)
   - Support for swipe gestures and navigation
2. Create `lib/html/themes.ts` with 3-5 visual themes
3. Build `components/SlideViewer.tsx`:
   - WebView component that renders HTML
   - Gesture handlers for swipe navigation
   - Full-screen mode toggle
4. Test rendering with sample HTML

### Phase 5: Core screens
1. **Home screen** (`app/(tabs)/index.tsx`):
   - List of saved decks using FlatList
   - Each deck shows thumbnail, title, slide count, date
   - Pull-to-refresh to reload from database
   - Tap deck to navigate to viewer
2. **Create screen** (`app/(tabs)/create.tsx`):
   - Text input for prompt
   - Voice input button (use expo-speech-recognition)
   - Photo input button (use expo-image-picker)
   - Template selector dropdown
   - "Generate" button that calls AI API
   - Loading state with progress indicator
   - Preview generated slides before saving
3. **Deck viewer** (`app/deck/[id].tsx`):
   - Full-screen slide viewer
   - Navigation controls (prev/next, slide counter)
   - Share button (opens export sheet)
   - Edit button (regenerate with AI)
4. **Settings screen** (`app/(tabs)/settings.tsx`):
   - Subscription status and upgrade button
   - API key input (for users who want to use their own)
   - Theme preferences
   - Export format defaults

### Phase 6: Export functionality
1. Create `lib/export/toPDF.ts`:
   - Use react-native-html-to-pdf or similar
   - Convert HTML slides to multi-page PDF
2. Create `lib/export/toHTML.ts`:
   - Bundle slides into standalone HTML file
   - Include all CSS inline for portability
3. Build `components/ExportSheet.tsx`:
   - Bottom sheet with export options
   - Share via native share sheet
   - Save to device storage

### Phase 7: State management
1. Set up Zustand store in `store/useStore.ts`:
   - Decks array synced with database
   - Current deck being viewed/edited
   - User settings and premium status
   - Loading states
2. Connect store to all screens
3. Implement optimistic updates for better UX

### Phase 8: Monetization
1. Integrate RevenueCat SDK
2. Create paywall screen with feature comparison
3. Implement usage limits for free tier (track in database)
4. Add watermark to free exports
5. Gate premium features behind subscription check

### Phase 9: Polish
1. Add onboarding flow (3 screens explaining core features)
2. Implement empty states for deck library
3. Add haptic feedback for interactions
4. Create app icon and splash screen
5. Add error boundaries and crash reporting
6. Optimize performance (lazy load decks, cache rendered slides)

### Phase 10: Testing & deployment
1. Run all Jest tests: `npm test`
2. Test on physical iOS and Android devices via Expo Go
3. Test subscription flow in sandbox mode
4. Build production apps: `eas build --platform all`
5. Submit to App Store and Google Play

## How to verify it works

**Local development:**
1. Start Expo dev server: `npx expo start`
2. Open in Expo Go on iOS/Android device or simulator
3. Test flow:
   - Tap "Create" tab
   - Enter prompt: "Create a 3-slide pitch deck about a coffee shop"
   - Tap "Generate"
   - Verify slides appear in preview
   - Tap "Save"
   - Return to home tab and verify deck appears in library
   - Tap deck to open viewer
   - Swipe through slides
   - Tap share button and verify export options

**Automated tests:**
```bash
npm test
```
All tests must pass before deployment.

**Production verification:**
1. Install TestFlight/internal testing build
2. Complete full user journey from onboarding to export
3. Test subscription purchase in sandbox mode
4. Verify offline mode works (airplane mode test)
5. Test on multiple device sizes (iPhone SE, iPad, Android tablet)