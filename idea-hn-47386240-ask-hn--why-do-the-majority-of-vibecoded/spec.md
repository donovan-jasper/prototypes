# ProtoPulse

## One-line pitch
Turn your app idea into a working prototype in minutes—no code, no designer, just your vision and our AI.

## Expanded vision

**Broadest audience:** Anyone with a problem they want to solve through software but lacks the technical skills to build it themselves. This includes:

- **Solopreneurs and indie hackers** (25-45) who need to validate ideas before investing in development
- **Product managers at companies** who want to quickly mock up features for stakeholder buy-in without waiting on design/dev resources
- **Students and educators** teaching entrepreneurship, product design, or innovation who need a tool to rapidly prototype concepts
- **Corporate intrapreneurs** pitching internal tools or process improvements who need visual proof-of-concept
- **Consultants and agencies** who want to show clients interactive mockups during discovery phases
- **Non-profit organizers** building community tools on tight budgets
- **Researchers** prototyping study interfaces or data collection tools

**Adjacent use cases:**
- Internal tool prototyping for operations teams
- Customer feedback collection through interactive mockups
- Rapid A/B testing of UI concepts before committing to development
- Educational projects for bootcamps and design thinking workshops
- Pitch deck supplements that investors can actually interact with
- Workflow documentation that shows rather than tells

**Why non-technical people want this:**
The gap between "I have an idea" and "I have something I can show investors/users/my team" is massive. Hiring costs $5K-50K. Learning to code takes months. Design tools require expertise. ProtoPulse eliminates that gap—you describe what you want, the AI guides you through critical decisions (monetization, user flows, key features), and you get a clickable prototype you can test with real users. It's the difference between a pitch deck with static screenshots and an actual working demo.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **AI integration:** OpenAI API (GPT-4) for intent understanding and component generation
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Navigation:** Expo Router (file-based routing)
- **UI components:** React Native Paper (Material Design, accessible)
- **Forms:** React Hook Form
- **Testing:** Jest + React Native Testing Library
- **Code generation:** Template-based system with AI-guided customization

## Core features

1. **Voice-to-Prototype Wizard**
   - Speak or type your app idea
   - AI asks clarifying questions (Who's it for? What's the main action? How do they pay?)
   - Generates initial screen flow with placeholder components
   - Users see their idea take shape in real-time

2. **Smart Component Library**
   - Pre-built, customizable UI blocks (login, feed, profile, checkout, etc.)
   - Drag-and-drop on mobile with haptic feedback
   - AI suggests components based on app type (e.g., "social app" gets feed + profile + messaging)
   - Each component has built-in best practices (accessibility, validation, error states)

3. **Interactive Preview Mode**
   - Test your prototype immediately on your actual device
   - Simulate user flows with realistic data
   - Share a live link with stakeholders for feedback
   - Track where testers get confused (heatmaps, drop-off points)

4. **Guided Decision Framework**
   - AI prompts critical questions at each stage: "How will users discover content?" "What happens if they forget their password?"
   - Prevents common pitfalls (no onboarding, unclear value prop, missing edge cases)
   - Suggests monetization strategies based on app category

5. **Export & Handoff**
   - Generate React Native code from prototype (paid tier)
   - Export design specs for developers (component tree, styles, assets)
   - Create user stories and acceptance criteria automatically
   - Figma-compatible design tokens

## Monetization strategy

**Free tier (Hook):**
- 1 active project
- Up to 5 screens
- Basic component library (10 components)
- Preview mode (no sharing)
- Community templates

**Pro - $19/month (Core value):**
- Unlimited projects
- Unlimited screens
- Full component library (50+ components)
- AI-guided decision framework
- Share prototypes with up to 10 testers
- Basic analytics (views, clicks)
- Export design specs

**Business - $49/month (Professional use):**
- Everything in Pro
- Export React Native code
- Advanced analytics (heatmaps, session recordings)
- Custom branding on shared prototypes
- Priority AI processing
- Team collaboration (3 seats)
- White-label option

**Why people stay subscribed:**
- **Ongoing validation:** Users don't build one prototype and leave—they iterate based on feedback, test variations, and refine before committing to development
- **Multiple projects:** Entrepreneurs often have several ideas in flight; the unlimited projects in Pro tier encourages keeping the subscription active
- **Handoff value:** The code export feature is valuable right before hiring developers, creating a natural retention point
- **Sunk cost:** Once you've built a prototype and gathered feedback, switching tools means starting over

**Pricing reasoning:**
- $19/mo is impulse-buy territory for solopreneurs (less than one hour of freelance dev time)
- $49/mo targets agencies/consultants who bill clients $100-200/hr and can justify the cost with one client project
- Free tier is generous enough to validate the tool but limited enough to drive upgrades

## File structure

```
protopulse/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Projects list
│   │   ├── create.tsx             # Voice-to-prototype wizard
│   │   └── library.tsx            # Component library
│   ├── project/
│   │   ├── [id]/
│   │   │   ├── index.tsx          # Project editor
│   │   │   ├── preview.tsx        # Interactive preview
│   │   │   └── export.tsx         # Export options
│   │   └── _layout.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx
│   │   ├── ComponentPalette.tsx
│   │   ├── PropertyPanel.tsx
│   │   └── ScreenNavigator.tsx
│   ├── wizard/
│   │   ├── VoiceInput.tsx
│   │   ├── QuestionFlow.tsx
│   │   └── ProgressIndicator.tsx
│   ├── preview/
│   │   ├── PreviewRenderer.tsx
│   │   ├── InteractionRecorder.tsx
│   │   └── ShareModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── lib/
│   ├── ai/
│   │   ├── intentParser.ts
│   │   ├── componentSuggester.ts
│   │   ├── questionGenerator.ts
│   │   └── codeGenerator.ts
│   ├── db/
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   └── queries.ts
│   ├── templates/
│   │   ├── componentTemplates.ts
│   │   ├── screenTemplates.ts
│   │   └── appTemplates.ts
│   └── utils/
│       ├── validation.ts
│       └── export.ts
├── store/
│   ├── projectStore.ts
│   ├── editorStore.ts
│   └── userStore.ts
├── types/
│   ├── project.ts
│   ├── component.ts
│   └── user.ts
├── __tests__/
│   ├── ai/
│   │   ├── intentParser.test.ts
│   │   ├── componentSuggester.test.ts
│   │   └── codeGenerator.test.ts
│   ├── db/
│   │   └── queries.test.ts
│   ├── components/
│   │   ├── Canvas.test.tsx
│   │   └── VoiceInput.test.tsx
│   └── utils/
│       └── validation.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**__tests__/ai/intentParser.test.ts**
```typescript
import { parseIntent } from '@/lib/ai/intentParser';

describe('Intent Parser', () => {
  it('should extract app type from description', async () => {
    const result = await parseIntent('I want to build a social app for dog owners');
    expect(result.appType).toBe('social');
    expect(result.targetAudience).toContain('dog owners');
  });

  it('should identify key features from natural language', async () => {
    const result = await parseIntent('Users can post photos and comment on each other\'s posts');
    expect(result.features).toContain('photo_upload');
    expect(result.features).toContain('comments');
  });

  it('should handle vague descriptions by asking clarifying questions', async () => {
    const result = await parseIntent('I need an app for my business');
    expect(result.needsClarification).toBe(true);
    expect(result.questions.length).toBeGreaterThan(0);
  });
});
```

**__tests__/ai/componentSuggester.test.ts**
```typescript
import { suggestComponents } from '@/lib/ai/componentSuggester';

describe('Component Suggester', () => {
  it('should suggest feed components for social apps', () => {
    const suggestions = suggestComponents({ appType: 'social', features: ['posts'] });
    expect(suggestions).toContainEqual(expect.objectContaining({ type: 'feed' }));
    expect(suggestions).toContainEqual(expect.objectContaining({ type: 'post_card' }));
  });

  it('should suggest checkout flow for e-commerce apps', () => {
    const suggestions = suggestComponents({ appType: 'ecommerce', features: ['payments'] });
    expect(suggestions).toContainEqual(expect.objectContaining({ type: 'product_list' }));
    expect(suggestions).toContainEqual(expect.objectContaining({ type: 'cart' }));
    expect(suggestions).toContainEqual(expect.objectContaining({ type: 'checkout' }));
  });
});
```

**__tests__/ai/codeGenerator.test.ts**
```typescript
import { generateComponentCode } from '@/lib/ai/codeGenerator';

describe('Code Generator', () => {
  it('should generate valid React Native component code', () => {
    const code = generateComponentCode({
      type: 'button',
      props: { label: 'Submit', variant: 'primary' }
    });
    expect(code).toContain('import React from');
    expect(code).toContain('export default');
    expect(code).toContain('Submit');
  });

  it('should include accessibility props', () => {
    const code = generateComponentCode({
      type: 'button',
      props: { label: 'Delete', variant: 'danger' }
    });
    expect(code).toContain('accessibilityLabel');
    expect(code).toContain('accessibilityRole');
  });
});
```

**__tests__/db/queries.test.ts**
```typescript
import { createProject, getProject, updateProject } from '@/lib/db/queries';
import { initDatabase } from '@/lib/db/schema';

describe('Database Queries', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should create and retrieve a project', async () => {
    const project = await createProject({
      name: 'Test App',
      description: 'A test project',
      appType: 'social'
    });
    expect(project.id).toBeDefined();

    const retrieved = await getProject(project.id);
    expect(retrieved?.name).toBe('Test App');
  });

  it('should update project properties', async () => {
    const project = await createProject({ name: 'Original', appType: 'utility' });
    await updateProject(project.id, { name: 'Updated' });
    
    const updated = await getProject(project.id);
    expect(updated?.name).toBe('Updated');
  });
});
```

**__tests__/components/Canvas.test.tsx**
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Canvas from '@/components/editor/Canvas';

describe('Canvas Component', () => {
  it('should render empty canvas with placeholder', () => {
    const { getByText } = render(<Canvas components={[]} />);
    expect(getByText(/tap to add/i)).toBeTruthy();
  });

  it('should render components in correct order', () => {
    const components = [
      { id: '1', type: 'header', order: 0 },
      { id: '2', type: 'button', order: 1 }
    ];
    const { getByTestId } = render(<Canvas components={components} />);
    
    const canvas = getByTestId('canvas');
    expect(canvas.children[0]).toHaveProperty('type', 'header');
    expect(canvas.children[1]).toHaveProperty('type', 'button');
  });
});
```

**__tests__/utils/validation.test.ts**
```typescript
import { validateProjectName, validateScreenFlow } from '@/lib/utils/validation';

describe('Validation Utils', () => {
  it('should reject empty project names', () => {
    expect(validateProjectName('')).toBe(false);
    expect(validateProjectName('   ')).toBe(false);
  });

  it('should accept valid project names', () => {
    expect(validateProjectName('My App')).toBe(true);
    expect(validateProjectName('App-123')).toBe(true);
  });

  it('should detect circular navigation in screen flow', () => {
    const flow = [
      { from: 'home', to: 'profile' },
      { from: 'profile', to: 'settings' },
      { from: 'settings', to: 'home' }
    ];
    expect(validateScreenFlow(flow).hasCircularReference).toBe(true);
  });
});
```

## Implementation steps

### Phase 1: Project Setup & Database

1. **Initialize Expo project**
   ```bash
   npx create-expo-app protopulse --template tabs
   cd protopulse
   npx expo install expo-sqlite expo-router zustand react-native-paper
   npx expo install --dev jest @testing-library/react-native @types/jest
   ```

2. **Configure TypeScript**
   - Update `tsconfig.json` with path aliases (`@/` for root)
   - Add strict type checking

3. **Set up database schema** (`lib/db/schema.ts`)
   - Create tables: `projects`, `screens`, `components`, `user_settings`
   - Projects table: id, name, description, appType, createdAt, updatedAt
   - Screens table: id, projectId, name, order, layout (JSON)
   - Components table: id, screenId, type, props (JSON), position (JSON), order
   - Write migration function to initialize tables

4. **Implement database queries** (`lib/db/queries.ts`)
   - CRUD operations for projects
   - CRUD operations for screens
   - CRUD operations for components
   - Batch operations for performance (e.g., save entire screen at once)

5. **Write database tests** (`__tests__/db/queries.test.ts`)
   - Test all CRUD operations
   - Test foreign key constraints
   - Test JSON serialization/deserialization

### Phase 2: State Management & Core Types

6. **Define TypeScript types** (`types/`)
   - `Project`: id, name, description, appType, screens[], metadata
   - `Screen`: id, name, components[], layout, navigation
   - `Component`: id, type, props, position, children[]
   - `ComponentTemplate`: type, defaultProps, category, icon

7. **Create Zustand stores** (`store/`)
   - `projectStore`: current project, screens, CRUD actions, sync with DB
   - `editorStore`: selected component, canvas zoom, undo/redo stack
   - `userStore`: subscription tier, preferences, onboarding state

8. **Implement undo/redo** in `editorStore`
   - Track state snapshots on each edit
   - Limit history to last 50 actions
   - Debounce rapid changes (e.g., dragging)

### Phase 3: Component Templates & Library

9. **Create component templates** (`lib/templates/componentTemplates.ts`)
   - Define 10 basic components: Button, Input, Text, Image, Card, List, Header, Footer, TabBar, Modal
   - Each template includes: type, defaultProps, renderFunction, category, description
   - Include accessibility defaults (labels, roles, hints)

10. **Build Component Palette UI** (`components/editor/ComponentPalette.tsx`)
    - Scrollable list of available components
    - Search/filter by category
    - Drag-to-canvas interaction (use PanResponder)
    - Show component preview on long-press

11. **Implement Canvas** (`components/editor/Canvas.tsx`)
    - Render components from current screen state
    - Handle drop events from palette
    - Allow selecting/moving/resizing components
    - Show selection handles and bounding box
    - Snap to grid for alignment

12. **Build Property Panel** (`components/editor/PropertyPanel.tsx`)
    - Show properties of selected component
    - Dynamic form based on component type
    - Live preview of changes
    - Color picker, font selector, spacing controls

### Phase 4: AI Integration

13. **Set up OpenAI API client** (`lib/ai/client.ts`)
    - Configure API key from environment variable
    - Implement retry logic with exponential backoff
    - Add request/response logging for debugging
    - Handle rate limits gracefully

14. **Implement Intent Parser** (`lib/ai/intentParser.ts`)
    - Send user description to GPT-4 with structured prompt
    - Extract: appType, targetAudience, keyFeatures, monetizationIdeas
    - Return clarifying questions if description is vague
    - Parse response into typed object

15. **Write Intent Parser tests** (`__tests__/ai/intentParser.test.ts`)
    - Mock OpenAI API responses
    - Test various input descriptions
    - Verify correct extraction of app metadata

16. **Implement Component Suggester** (`lib/ai/componentSuggester.ts`)
    - Rule-based system for common patterns (social → feed, ecommerce → product list)
    - AI fallback for unusual app types
    - Return ordered list of suggested components with reasoning

17. **Implement Question Generator** (`lib/ai/questionGenerator.ts`)
    - Generate contextual questions based on app type and current progress
    - Examples: "How will users sign up?", "What happens when they complete a purchase?"
    - Prioritize critical decisions (auth, payments, data model)

18. **Implement Code Generator** (`lib/ai/codeGenerator.ts`)
    - Template-based generation for each component type
    - Insert user-customized props into templates
    - Generate complete screen files with imports and exports
    - Include comments explaining key sections

19. **Write Code Generator tests** (`__tests__/ai/codeGenerator.test.ts`)
    - Verify generated code is syntactically valid
    - Check for required accessibility props
    - Ensure imports are correct

### Phase 5: Voice-to-Prototype Wizard

20. **Build Voice Input component** (`components/wizard/VoiceInput.tsx`)
    - Use Expo's Audio API for recording
    - Send audio to OpenAI Whisper API for transcription
    - Show real-time transcription feedback
    - Allow editing transcribed text

21. **Build Question Flow component** (`components/wizard/QuestionFlow.tsx`)
    - Display AI-generated questions one at a time
    - Support voice or text responses
    - Show progress indicator
    - Allow going back to previous questions

22. **Build Create screen** (`app/(tabs)/create.tsx`)
    - Start with voice/text input for initial idea
    - Show AI-generated questions in sequence
    - Display real-time preview of generated screens
    - Save project to database on completion

23. **Write Wizard tests** (`__tests__/components/VoiceInput.test.tsx`)
    - Mock audio recording
    - Test transcription flow
    - Verify error handling

### Phase 6: Project Editor

24. **Build Project Editor screen** (`app/project/[id]/index.tsx`)
    - Load project from database
    - Render Canvas, ComponentPalette, and PropertyPanel
    - Implement screen navigation (tabs for each screen)
    - Auto-save changes to database (debounced)

25. **Implement Screen Navigator** (`components/editor/ScreenNavigator.tsx`)
    - Horizontal scrollable list of screens
    - Add/delete/reorder screens
    - Show thumbnail preview of each screen

26. **Add keyboard shortcuts** (for external keyboard users)
    - Cmd/Ctrl+Z for undo
    - Cmd/Ctrl+Y for redo
    - Delete key to remove selected component
    - Arrow keys to nudge component position

### Phase 7: Interactive Preview

27. **Build Preview Renderer** (`components/preview/PreviewRenderer.tsx`)
    - Render screens exactly as they'll appear in final app
    - Support navigation between screens
    - Simulate interactions (button taps, form submissions)
    - Use realistic sample data

28. **Implement Interaction Recorder** (`components/preview/InteractionRecorder.tsx`)
    - Track user taps, scrolls, and navigation
    - Store interaction data in database
    - Generate heatmap visualization
    - Identify drop-off points in user flow

29. **Build Preview screen** (`app/project/[id]/preview.tsx`)
    - Full-screen preview mode
    - Toggle between preview and edit mode
    - Share button to generate public link (paid feature)

30. **Build Share Modal** (`components/preview/ShareModal.tsx`)
    - Generate unique shareable URL
    - Set expiration date
    - Copy link to clipboard
    - Show QR code for easy mobile access

### Phase 8: Export & Monetization

31. **Implement Export functionality** (`lib/utils/export.ts`)
    - Generate React Native code for each screen
    - Create project structure with proper file organization
    - Include package.json with dependencies
    - Generate README with setup instructions
    - Zip files for download

32. **Build Export screen** (`app/project/[id]/export.tsx`)
    - Show export options (code, design specs, user stories)
    - Preview generated files before download
    - Paywall for code export (Business tier only)

33. **Implement subscription checks** throughout app
    - Check tier before allowing premium features
    - Show upgrade prompts with clear value proposition
    - Track feature usage for analytics

34. **Build paywall UI**
    - Comparison table of Free vs Pro vs Business
    - Highlight most popular tier
    - Show testimonials/social proof
    - Integrate with Expo's in-app purchases (or RevenueCat)

### Phase 9: Projects List & Onboarding

35. **Build Projects List screen** (`app/(tabs)/index.tsx`)
    - Grid/list view of user's projects
    - Sort by recent, name, or app type
    - Search functionality
    - Quick actions (duplicate, delete, share)

36. **Build Component Library screen** (`app/(tabs)/library.tsx`)
    - Browse all available components
    - Filter by category
    - Preview component in isolation
    - Add to favorites

37. **Implement onboarding flow**
    - Welcome screen explaining core value
    - Quick tutorial (create first project)
    - Request permissions (microphone for voice input)
    - Set up account (optional, for cloud sync)

### Phase 10: Polish & Testing

38. **Add loading states** everywhere
    - Skeleton screens while loading projects
    - Spinner during AI processing
    - Progress bars for exports

39. **Implement error handling**
    - Graceful degradation when AI fails
    - Offline mode (save locally, sync later)
    - User-friendly error messages
    - Retry mechanisms

40. **Add haptic feedback**
    - On component drop
    - On successful save
    - On errors

41. **Optimize performance**
    - Lazy load component templates
    - Virtualize long lists
    - Debounce auto-save
    - Cache AI responses

42. **Run all tests**
    ```bash
    npm test
    ```
    - Ensure 100% of tests pass
    - Add missing tests for edge cases

43. **Manual testing on devices**
    - Test on iOS (iPhone SE, iPhone 15 Pro)
    - Test on Android (Pixel 5, Samsung Galaxy S23)
    - Test voice input in noisy environments
    - Test with VoiceOver/TalkBack enabled

## How to verify it works

### Development Setup
```bash
npm install
npm test  # All tests must pass
npx expo start
```

### Testing on Device/Simulator

1. **Scan QR code** with Expo Go app (iOS/Android)

2. **Create a new project:**
   - Tap "Create" tab
   - Speak or type: "I want to build a fitness app where users can log workouts and track progress"
   - Answer AI questions about target audience, key features
   - Verify screens are generated automatically

3. **Edit the project:**
   - Tap into the generated project
   - Drag a Button component from palette onto canvas
   - Select button and change label in property panel
   - Verify changes appear immediately
   - Verify auto-save indicator shows "Saved"

4. **Test preview mode:**
   - Tap "Preview" button
   - Navigate between screens
   - Tap buttons and verify interactions work
   - Exit preview and verify you return to editor

5. **Test export (if Business tier):**
   - Tap "Export" button
   - Select "React Native Code"
   - Verify zip file downloads
   - Extract and verify file structure matches expected output

6. **Test voice input:**
   - Grant microphone permission
   - Tap microphone icon in wizard
   - Speak a project description
   - Verify transcription appears correctly

7. **Test offline mode:**
   - Enable airplane mode
   - Create a new project
   - Verify it saves locally
   - Disable airplane mode
   - Verify project syncs (if cloud sync implemented)

### Automated Tests
```bash
npm test -- --coverage
```
- Verify coverage is >80% for critical paths (AI, database, code generation)
- All tests in `__tests__/` must pass

### Acceptance Criteria
- [ ] User can create a project from voice/text description in <2 minutes
- [ ] AI generates at least 3 relevant screens based on app type
- [ ] User can drag components onto canvas and see immediate visual feedback
- [ ] Preview mode accurately renders all components with working interactions
- [ ] Export generates valid React Native code that runs without errors
- [ ] App works offline (local storage only)
- [ ] All tests pass with `npm test`
- [ ] App loads in <3 seconds on mid-range device
- [ ] No crashes during 10-minute usage session