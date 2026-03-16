# TypeBridge

## One-line pitch
Compile, debug, and run .NET WebAssembly apps directly on your phone—no desktop required.

## Expanded vision

**Core audience:** Mobile-first developers in emerging markets, students, and indie hackers who want to build high-performance web apps without being chained to a laptop.

**Broadest audience:**
- **Students learning .NET or WASM** who only have a phone or tablet
- **Developers in regions where desktop access is limited** (India, Southeast Asia, Africa)
- **Commuters and digital nomads** who want to code on-the-go
- **Educators teaching WASM concepts** who need a mobile-friendly sandbox

**Adjacent use cases:**
- **Live coding playground** for experimenting with WASM performance on mobile hardware
- **Portfolio showcase** for developers to demo WASM apps to clients directly from their phone
- **Learning platform** with interactive WASM tutorials and challenges
- **Performance benchmarking** tool to test WASM execution speed across different mobile devices

**Why non-technical people might want this:**
They won't directly, but this enables developers to build faster, more responsive mobile web experiences that benefit everyone. Think of it as the "engine" that powers the next generation of mobile-first apps.

## Tech stack
- **React Native (Expo)** for cross-platform iOS + Android
- **SQLite** for local project storage and compilation cache
- **Monaco Editor (react-native-webview)** for code editing
- **WASM runtime** via WebView with custom JavaScript bridge
- **Minimal dependencies:** expo-file-system, expo-sqlite, react-native-webview

## Core features

1. **One-tap WASM compilation** — Write TypeScript, compile to WASM, and run it in a sandboxed WebView—all on your phone
2. **Offline-first project manager** — Create, edit, and organize WASM projects locally with SQLite-backed persistence
3. **Live preview with console** — See your WASM app running in real-time with a built-in JavaScript console for debugging
4. **Code templates library** — Pre-built starter projects (game engine, image processor, crypto tool) to get users coding immediately
5. **Export to PWA** — One-tap export of your WASM project as a deployable Progressive Web App

## Monetization strategy

**Free tier:**
- Up to 3 projects
- Basic WASM compilation (limited to 1MB output)
- Access to 5 starter templates
- Local execution only

**Paid tier ($4.99/month or $39.99/year):**
- Unlimited projects
- Full WASM compilation (no size limits)
- All 20+ premium templates (game engines, ML models, crypto tools)
- Cloud sync across devices
- Export to PWA with custom branding
- Priority compilation queue (faster builds)

**Why people stay subscribed:**
- **Cloud sync** makes it essential for multi-device workflows
- **Premium templates** save hours of setup time
- **Export feature** turns the app from a toy into a production tool
- **Regular template updates** keep the library fresh and valuable

**Price reasoning:**
$4.99/month is impulse-buy territory for developers, and the annual option ($39.99) offers 33% savings to encourage long-term commitment. This undercuts desktop IDEs while targeting a mobile-first audience with lower price sensitivity.

## File structure

```
typebridge/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Projects list
│   │   ├── editor.tsx                # Code editor screen
│   │   ├── preview.tsx               # WASM preview screen
│   │   └── templates.tsx             # Template library
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ProjectCard.tsx
│   ├── CodeEditor.tsx
│   ├── WasmPreview.tsx
│   ├── ConsoleOutput.tsx
│   └── TemplateCard.tsx
├── lib/
│   ├── database.ts                   # SQLite setup
│   ├── compiler.ts                   # WASM compilation logic
│   ├── storage.ts                    # File system operations
│   ├── templates.ts                  # Template data
│   └── export.ts                     # PWA export logic
├── __tests__/
│   ├── compiler.test.ts
│   ├── storage.test.ts
│   ├── database.test.ts
│   └── export.test.ts
├── assets/
│   └── templates/                    # Bundled template files
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**__tests__/compiler.test.ts**
```typescript
import { compileTypeScriptToWasm, validateWasmOutput } from '../lib/compiler';

describe('WASM Compiler', () => {
  it('should compile valid TypeScript to WASM', async () => {
    const code = 'export function add(a: number, b: number): number { return a + b; }';
    const result = await compileTypeScriptToWasm(code);
    expect(result.success).toBe(true);
    expect(result.wasmBytes).toBeDefined();
  });

  it('should return error for invalid TypeScript', async () => {
    const code = 'export function broken(a: number { return a; }';
    const result = await compileTypeScriptToWasm(code);
    expect(result.success).toBe(false);
    expect(result.error).toContain('syntax');
  });

  it('should validate WASM output format', () => {
    const validWasm = new Uint8Array([0x00, 0x61, 0x73, 0x6d]); // WASM magic number
    expect(validateWasmOutput(validWasm)).toBe(true);
  });
});
```

**__tests__/storage.test.ts**
```typescript
import { saveProject, loadProject, deleteProject } from '../lib/storage';

describe('Project Storage', () => {
  const mockProject = {
    id: 'test-123',
    name: 'Test Project',
    code: 'console.log("test");',
    createdAt: Date.now(),
  };

  it('should save project to SQLite', async () => {
    const result = await saveProject(mockProject);
    expect(result.success).toBe(true);
  });

  it('should load saved project', async () => {
    await saveProject(mockProject);
    const loaded = await loadProject('test-123');
    expect(loaded.name).toBe('Test Project');
  });

  it('should delete project', async () => {
    await saveProject(mockProject);
    await deleteProject('test-123');
    const loaded = await loadProject('test-123');
    expect(loaded).toBeNull();
  });
});
```

**__tests__/database.test.ts**
```typescript
import { initDatabase, getProjects } from '../lib/database';

describe('Database', () => {
  it('should initialize SQLite database', async () => {
    const db = await initDatabase();
    expect(db).toBeDefined();
  });

  it('should retrieve all projects', async () => {
    const projects = await getProjects();
    expect(Array.isArray(projects)).toBe(true);
  });
});
```

**__tests__/export.test.ts**
```typescript
import { exportToPWA, generateManifest } from '../lib/export';

describe('PWA Export', () => {
  const mockProject = {
    id: 'test-123',
    name: 'Test App',
    code: 'console.log("test");',
    wasmBytes: new Uint8Array([0x00, 0x61, 0x73, 0x6d]),
  };

  it('should generate valid PWA manifest', () => {
    const manifest = generateManifest(mockProject);
    expect(manifest.name).toBe('Test App');
    expect(manifest.start_url).toBe('/');
  });

  it('should export project as PWA bundle', async () => {
    const result = await exportToPWA(mockProject);
    expect(result.success).toBe(true);
    expect(result.files).toContain('index.html');
    expect(result.files).toContain('manifest.json');
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app typebridge --template tabs
cd typebridge
npm install expo-sqlite expo-file-system react-native-webview
npm install -D jest @testing-library/react-native
```

### 2. Database layer (`lib/database.ts`)
- Initialize SQLite with `expo-sqlite`
- Create `projects` table: `id, name, code, wasmBytes, createdAt, updatedAt`
- Implement CRUD operations: `createProject`, `getProjects`, `updateProject`, `deleteProject`
- Add migration logic for schema updates

### 3. Storage utilities (`lib/storage.ts`)
- Wrap database operations with error handling
- Implement `saveProject` to persist code and WASM bytes
- Implement `loadProject` to retrieve by ID
- Add `exportProjectFiles` to write to file system for sharing

### 4. WASM compiler (`lib/compiler.ts`)
- Use WebView to run TypeScript compiler in JavaScript context
- Inject `typescript` library via CDN into WebView
- Send TypeScript code via `postMessage` to WebView
- Receive compiled JavaScript, then convert to WASM-compatible format
- Return `{ success: boolean, wasmBytes?: Uint8Array, error?: string }`
- Cache compilation results in SQLite to avoid re-compiling unchanged code

### 5. Template system (`lib/templates.ts`)
- Define template structure: `{ id, name, description, code, category, isPremium }`
- Bundle 5 free templates in `assets/templates/`
- Implement `getTemplates(isPremium: boolean)` to filter by tier
- Add `applyTemplate(projectId, templateId)` to clone template code into project

### 6. PWA export (`lib/export.ts`)
- Generate `manifest.json` with project name, icons, theme color
- Create `index.html` that loads WASM module
- Bundle WASM bytes as base64 or separate file
- Use `expo-file-system` to write files to device storage
- Return shareable file URI

### 7. Projects list screen (`app/(tabs)/index.tsx`)
- Fetch projects from database on mount
- Render `FlatList` of `ProjectCard` components
- Add FAB (floating action button) to create new project
- Implement swipe-to-delete with confirmation modal
- Add search/filter by name

### 8. Code editor screen (`app/(tabs)/editor.tsx`)
- Embed `react-native-webview` with Monaco Editor loaded from CDN
- Inject project code into editor via `postMessage`
- Listen for code changes and debounce saves to SQLite
- Add toolbar with "Compile", "Preview", "Export" buttons
- Show compilation errors in bottom sheet

### 9. Preview screen (`app/(tabs)/preview.tsx`)
- Render `WasmPreview` component with WebView
- Load compiled WASM bytes into WebView runtime
- Capture `console.log` output and display in `ConsoleOutput` component
- Add "Refresh" button to re-run WASM module
- Show performance metrics (execution time, memory usage)

### 10. Templates screen (`app/(tabs)/templates.tsx`)
- Fetch templates from `lib/templates.ts`
- Render grid of `TemplateCard` components
- Show "Premium" badge on locked templates
- On tap, create new project from template or show paywall
- Add category filters (Games, Tools, ML, Crypto)

### 11. Components
- **ProjectCard**: Display project name, last modified, thumbnail preview
- **CodeEditor**: WebView wrapper with Monaco, syntax highlighting, auto-complete
- **WasmPreview**: WebView that executes WASM with error boundaries
- **ConsoleOutput**: Scrollable log viewer with syntax highlighting
- **TemplateCard**: Image, title, description, premium badge

### 12. Monetization integration
- Use Expo's in-app purchases or RevenueCat
- Implement `checkSubscriptionStatus()` in `lib/subscription.ts`
- Gate premium features: cloud sync, full compilation, premium templates, export
- Show paywall modal when accessing locked features
- Add "Restore Purchases" button in settings

### 13. Testing
- Write Jest tests for all `lib/` modules
- Mock SQLite and file system operations
- Test compilation with valid/invalid TypeScript
- Test CRUD operations on projects
- Run `npm test` to verify all tests pass

### 14. Polish
- Add onboarding flow with 3 screens explaining core features
- Implement dark mode support
- Add haptic feedback on button presses
- Optimize WASM compilation for mobile (limit bundle size)
- Add error tracking with Sentry

## How to verify it works

### On device (Expo Go)
1. Install Expo Go on iOS or Android
2. Run `npx expo start` in project directory
3. Scan QR code with Expo Go
4. **Test flow:**
   - Create new project from template
   - Edit code in Monaco editor
   - Tap "Compile" and verify no errors
   - Tap "Preview" and see WASM output in WebView
   - Check console for `console.log` statements
   - Export to PWA and verify files are created
   - Delete project and confirm it's removed from list

### Automated tests
```bash
npm test
```
All tests in `__tests__/` must pass:
- Compiler validates TypeScript and produces WASM
- Storage saves/loads/deletes projects correctly
- Database initializes and queries work
- Export generates valid PWA files

### Manual verification checklist
- [ ] Projects persist after app restart
- [ ] Code editor syntax highlighting works
- [ ] WASM compilation completes in <5 seconds for small projects
- [ ] Preview WebView executes WASM without crashes
- [ ] Console captures all output
- [ ] Templates load and apply correctly
- [ ] Premium features show paywall when not subscribed
- [ ] Export creates valid PWA files in device storage
- [ ] App works offline (no network required for core features)