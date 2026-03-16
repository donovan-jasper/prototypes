# CodeForge

## One-line pitch
Compile code for any platform—from retro consoles to modern devices—right from your phone, no cloud required.

## Expanded vision

### Core audience
- **Mobile-first developers**: Professionals who want to code during commutes, travel, or away from their desk
- **Embedded systems engineers**: Hardware developers who need to test compilation for ARM, RISC-V, AVR, and other targets on the go
- **Retro computing enthusiasts**: Hobbyists building games and demos for NES, Game Boy, Z80 systems, Commodore 64
- **CS students**: Learning computer architecture, assembly language, and compiler design with hands-on experimentation
- **Indie game developers**: Creating games for retro platforms or modern embedded devices
- **IoT developers**: Testing firmware compilation for ESP32, Arduino, Raspberry Pi Pico

### Broadest appeal
This isn't just a compiler—it's a **portable development lab**. Anyone learning how computers work at a fundamental level benefits: students studying for systems programming courses, educators demonstrating cross-compilation concepts, makers prototyping IoT devices, and nostalgic developers revisiting 8-bit and 16-bit platforms.

### Adjacent use cases
- **Educational tool**: Interactive tutorials showing how code compiles differently for various architectures
- **Prototyping platform**: Quick firmware tests before deploying to physical hardware
- **Portfolio builder**: Students can showcase cross-platform compilation skills
- **Retro game jams**: Entire game development workflow on mobile for Game Boy, NES, or Sega Genesis
- **Embedded systems learning**: Understand ARM vs x86 vs RISC-V without needing multiple development boards

### Non-technical appeal
For educators and students, this demystifies how software runs on different hardware. For hobbyists, it's a gateway to retro gaming creation without complex desktop toolchains.

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local storage**: SQLite (expo-sqlite)
- **Code editor**: @monaco-editor/react (web) or custom syntax highlighting for mobile
- **Compilation engine**: WebAssembly builds of LLVM toolchains (llvm-z80, llvm-mos, arm-none-eabi-gcc)
- **File system**: expo-file-system for project management
- **Syntax highlighting**: Prism.js or custom tokenizer
- **State management**: Zustand (lightweight, minimal boilerplate)
- **Testing**: Jest + React Native Testing Library

## Core features

1. **Multi-target compilation**
   - Compile C/C++/Assembly for 10+ architectures: x86, ARM, Z80, 6502, RISC-V, AVR, 68000
   - Real-time syntax checking and error highlighting
   - Binary output with hex viewer and disassembly view

2. **Offline-first code editor**
   - Full-featured IDE with syntax highlighting, autocomplete, and bracket matching
   - Project templates for common targets (Arduino, Game Boy, NES, ESP32)
   - File tree navigation with multi-file project support

3. **Interactive output viewer**
   - Hex dump of compiled binaries
   - Assembly disassembly view to see generated machine code
   - Compilation logs with error/warning navigation
   - Export binaries to share or flash to hardware

4. **Learning mode**
   - Side-by-side comparison: see how same code compiles for different architectures
   - Built-in tutorials for retro platforms (Game Boy graphics, NES sound, Z80 assembly)
   - Example projects for each supported target

5. **Cloud sync (premium)**
   - Sync projects across devices
   - Collaboration features for team projects
   - Version history and rollback

## Monetization strategy

### Free tier (hook)
- 3 compilation targets: x86, ARM, AVR (Arduino)
- 5 projects maximum
- Basic code editor with syntax highlighting
- Community templates and examples
- Ads between compilations (non-intrusive)

### Premium ($9.99/month) (paywall)
- All 10+ compilation targets including retro platforms (Z80, 6502, 68000, Game Boy, NES)
- Unlimited projects
- Offline compilation (no internet required)
- Export binaries to Files app or share
- Advanced editor features (autocomplete, refactoring)
- No ads

### Pro ($19.99/month)
- Everything in Premium
- Cloud sync across devices
- Team collaboration (shared projects)
- Priority compilation queue
- Custom toolchain configurations
- Priority support

### Retention strategy
- **Monthly challenges**: "Build a Game Boy game in 100 lines" with featured submissions
- **Template marketplace**: Users share project templates (free/paid), CodeForge takes 30% cut
- **Learning paths**: Structured courses that unlock as users progress (gamification)
- **Hardware integration**: Direct flashing to connected devices via USB-C (future feature)

### Pricing reasoning
$9.99 hits the sweet spot for hobbyists and students (less than a textbook, more than a coffee). $19.99 for Pro targets professionals who expense tools. Free tier is generous enough to build real projects, but retro platforms (the unique selling point) are paywalled to drive conversions.

## File structure

```
codeforge/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Projects list
│   │   ├── editor.tsx             # Code editor screen
│   │   ├── output.tsx             # Compilation output viewer
│   │   └── learn.tsx              # Tutorials and examples
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── CodeEditor.tsx             # Syntax-highlighted editor
│   ├── CompilationOutput.tsx      # Binary/hex/asm viewer
│   ├── ProjectCard.tsx            # Project list item
│   ├── TargetSelector.tsx         # Architecture picker
│   ├── TemplateGallery.tsx        # Project templates
│   └── TutorialCard.tsx           # Learning content
├── lib/
│   ├── compiler/
│   │   ├── CompilerEngine.ts      # Main compilation orchestrator
│   │   ├── targets/
│   │   │   ├── x86.ts
│   │   │   ├── arm.ts
│   │   │   ├── z80.ts
│   │   │   ├── mos6502.ts
│   │   │   └── avr.ts
│   │   └── wasm/                  # WebAssembly toolchain binaries
│   ├── database/
│   │   ├── db.ts                  # SQLite setup
│   │   ├── migrations.ts
│   │   └── queries.ts
│   ├── storage/
│   │   ├── FileManager.ts         # Project file operations
│   │   └── ProjectManager.ts      # Project CRUD
│   ├── syntax/
│   │   ├── highlighter.ts         # Syntax highlighting
│   │   └── parser.ts              # Basic AST parsing
│   └── utils/
│       ├── binary.ts              # Hex/binary utilities
│       └── disassembler.ts        # Simple disassembly
├── store/
│   ├── projectStore.ts            # Zustand store for projects
│   ├── editorStore.ts             # Editor state
│   └── settingsStore.ts           # User preferences
├── constants/
│   ├── targets.ts                 # Compilation target configs
│   └── templates.ts               # Project templates
├── __tests__/
│   ├── compiler/
│   │   ├── CompilerEngine.test.ts
│   │   ├── x86.test.ts
│   │   └── z80.test.ts
│   ├── storage/
│   │   ├── FileManager.test.ts
│   │   └── ProjectManager.test.ts
│   └── utils/
│       ├── binary.test.ts
│       └── disassembler.test.ts
├── assets/
│   ├── fonts/
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/compiler/CompilerEngine.test.ts`
```typescript
import { CompilerEngine } from '@/lib/compiler/CompilerEngine';
import { CompilationTarget } from '@/constants/targets';

describe('CompilerEngine', () => {
  let engine: CompilerEngine;

  beforeEach(() => {
    engine = new CompilerEngine();
  });

  it('should compile simple C code for x86', async () => {
    const code = 'int main() { return 0; }';
    const result = await engine.compile(code, CompilationTarget.X86);
    
    expect(result.success).toBe(true);
    expect(result.binary).toBeDefined();
    expect(result.errors).toHaveLength(0);
  });

  it('should detect syntax errors', async () => {
    const code = 'int main() { return 0';
    const result = await engine.compile(code, CompilationTarget.X86);
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should handle Z80 assembly', async () => {
    const code = 'LD A, 0\nRET';
    const result = await engine.compile(code, CompilationTarget.Z80);
    
    expect(result.success).toBe(true);
    expect(result.binary).toBeDefined();
  });
});
```

### `__tests__/storage/ProjectManager.test.ts`
```typescript
import { ProjectManager } from '@/lib/storage/ProjectManager';
import { Project } from '@/types';

describe('ProjectManager', () => {
  let manager: ProjectManager;

  beforeEach(async () => {
    manager = new ProjectManager();
    await manager.initialize();
  });

  afterEach(async () => {
    await manager.clearAll();
  });

  it('should create a new project', async () => {
    const project = await manager.createProject({
      name: 'Test Project',
      target: 'x86',
      language: 'c',
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Test Project');
  });

  it('should list all projects', async () => {
    await manager.createProject({ name: 'Project 1', target: 'x86', language: 'c' });
    await manager.createProject({ name: 'Project 2', target: 'arm', language: 'cpp' });

    const projects = await manager.listProjects();
    expect(projects).toHaveLength(2);
  });

  it('should delete a project', async () => {
    const project = await manager.createProject({ name: 'To Delete', target: 'z80', language: 'asm' });
    await manager.deleteProject(project.id);

    const projects = await manager.listProjects();
    expect(projects).toHaveLength(0);
  });
});
```

### `__tests__/utils/binary.test.ts`
```typescript
import { toHexDump, toBinary, parseHex } from '@/lib/utils/binary';

describe('Binary utilities', () => {
  it('should convert buffer to hex dump', () => {
    const buffer = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]);
    const hex = toHexDump(buffer);
    
    expect(hex).toContain('48 65 6C 6C 6F');
  });

  it('should convert number to binary string', () => {
    expect(toBinary(5)).toBe('00000101');
    expect(toBinary(255)).toBe('11111111');
  });

  it('should parse hex string to buffer', () => {
    const buffer = parseHex('48656C6C6F');
    expect(buffer).toEqual(new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F]));
  });
});
```

### `__tests__/compiler/z80.test.ts`
```typescript
import { Z80Compiler } from '@/lib/compiler/targets/z80';

describe('Z80 Compiler', () => {
  let compiler: Z80Compiler;

  beforeEach(() => {
    compiler = new Z80Compiler();
  });

  it('should compile basic Z80 assembly', async () => {
    const asm = `
      LD A, 10
      LD B, 20
      ADD A, B
      RET
    `;
    
    const result = await compiler.compile(asm);
    expect(result.success).toBe(true);
    expect(result.binary.length).toBeGreaterThan(0);
  });

  it('should handle invalid opcodes', async () => {
    const asm = 'INVALID_OPCODE';
    const result = await compiler.compile(asm);
    
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('invalid opcode');
  });
});
```

## Implementation steps

### Phase 1: Project setup and core infrastructure

1. **Initialize Expo project**
   ```bash
   npx create-expo-app codeforge --template tabs
   cd codeforge
   npx expo install expo-sqlite expo-file-system
   npm install zustand @types/jest
   npm install -D jest @testing-library/react-native
   ```

2. **Configure TypeScript and testing**
   - Update `tsconfig.json` with strict mode and path aliases
   - Create `jest.config.js` for React Native testing
   - Set up test utilities and mocks

3. **Database schema setup**
   - Create `lib/database/db.ts` with SQLite initialization
   - Define schema for projects, files, and settings tables
   - Implement migration system for schema updates
   - Write `lib/database/queries.ts` with CRUD operations

4. **File system management**
   - Implement `lib/storage/FileManager.ts` for reading/writing project files
   - Create `lib/storage/ProjectManager.ts` for project lifecycle management
   - Add file tree navigation logic
   - Write tests for file operations

### Phase 2: Code editor implementation

5. **Build code editor component**
   - Create `components/CodeEditor.tsx` with basic text input
   - Implement syntax highlighting using Prism.js or custom tokenizer
   - Add line numbers and basic editing features
   - Handle multi-file editing with tab navigation

6. **Syntax highlighting and parsing**
   - Implement `lib/syntax/highlighter.ts` for C/C++/Assembly
   - Create `lib/syntax/parser.ts` for basic error detection
   - Add real-time syntax checking
   - Support multiple language modes

7. **Editor state management**
   - Create `store/editorStore.ts` with Zustand
   - Track current file, cursor position, undo/redo
   - Implement auto-save functionality
   - Add editor preferences (theme, font size)

### Phase 3: Compilation engine

8. **Compiler architecture**
   - Design `lib/compiler/CompilerEngine.ts` as main orchestrator
   - Define compilation target interface
   - Implement error handling and logging
   - Create compilation queue system

9. **Target implementations**
   - Start with `lib/compiler/targets/x86.ts` (simplest)
   - Implement `lib/compiler/targets/arm.ts`
   - Add `lib/compiler/targets/avr.ts` for Arduino
   - Create mock implementations initially, replace with WASM toolchains later

10. **WebAssembly integration**
    - Research and integrate LLVM WASM builds
    - Create `lib/compiler/wasm/` directory for toolchain binaries
    - Implement WASM module loading and execution
    - Handle memory management for large compilations

11. **Retro platform compilers**
    - Implement `lib/compiler/targets/z80.ts`
    - Add `lib/compiler/targets/mos6502.ts` for NES/C64
    - Create Game Boy and NES specific toolchains
    - Write comprehensive tests for each target

### Phase 4: Output and visualization

12. **Compilation output viewer**
    - Create `components/CompilationOutput.tsx`
    - Implement hex dump view with `lib/utils/binary.ts`
    - Add disassembly view with `lib/utils/disassembler.ts`
    - Show compilation logs with error navigation

13. **Binary export functionality**
    - Implement export to Files app using expo-file-system
    - Add share functionality for compiled binaries
    - Support multiple export formats (bin, hex, elf)

### Phase 5: UI and navigation

14. **Projects list screen**
    - Create `app/(tabs)/index.tsx` with project cards
    - Implement `components/ProjectCard.tsx`
    - Add search and filter functionality
    - Show project metadata (target, last modified)

15. **Editor screen**
    - Build `app/(tabs)/editor.tsx` with code editor
    - Add `components/TargetSelector.tsx` for architecture picker
    - Implement compile button with loading states
    - Show compilation status and errors inline

16. **Output screen**
    - Create `app/(tabs)/output.tsx` with tabbed views
    - Show hex dump, disassembly, and logs
    - Add copy and export actions
    - Implement zoom and scroll for large outputs

17. **Learning screen**
    - Build `app/(tabs)/learn.tsx` with tutorial cards
    - Create `components/TutorialCard.tsx`
    - Implement `components/TemplateGallery.tsx`
    - Add interactive examples with "Try it" buttons

### Phase 6: Templates and examples

18. **Project templates**
    - Define templates in `constants/templates.ts`
    - Create starter projects for each target
    - Add Game Boy "Hello World" template
    - Include Arduino blink example
    - Add NES sprite demo

19. **Tutorial content**
    - Write beginner tutorials for each platform
    - Create side-by-side comparison examples
    - Add interactive challenges
    - Include commented example code

### Phase 7: Premium features

20. **Monetization setup**
    - Integrate RevenueCat or Expo In-App Purchases
    - Implement subscription tiers in `store/settingsStore.ts`
    - Add paywall screens for premium targets
    - Track feature usage for free tier limits

21. **Cloud sync (premium)**
    - Set up Firebase or Supabase backend
    - Implement project sync logic
    - Add conflict resolution
    - Show sync status in UI

### Phase 8: Polish and optimization

22. **Performance optimization**
    - Lazy load WASM modules
    - Implement compilation caching
    - Optimize editor rendering for large files
    - Add background compilation for faster feedback

23. **Error handling and UX**
    - Add helpful error messages for compilation failures
    - Implement retry logic for failed operations
    - Show progress indicators for long operations
    - Add onboarding flow for new users

24. **Testing and QA**
    - Write integration tests for full compilation flow
    - Test on physical iOS and Android devices
    - Verify all compilation targets work correctly
    - Test subscription flows

### Phase 9: Launch preparation

25. **App Store assets**
    - Create app icon and screenshots
    - Write App Store description
    - Prepare demo videos
    - Set up TestFlight for beta testing

26. **Documentation**
    - Write user guide for each target platform
    - Create API documentation for custom toolchains
    - Add FAQ and troubleshooting guide
    - Document premium features

## How to verify it works

### Development testing

1. **Start Expo development server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   - Press `i` in terminal to open iOS Simulator
   - Create a new project from the Projects screen
   - Write simple C code: `int main() { return 0; }`
   - Select x86 target and compile
   - Verify binary output appears in Output tab
   - Check hex dump shows compiled bytes

3. **Test on Android Emulator**
   - Press `a` in terminal to open Android Emulator
   - Repeat same workflow as iOS
   - Test file export functionality
   - Verify projects persist after app restart

4. **Test on physical device with Expo Go**
   - Scan QR code with Expo Go app
   - Test all compilation targets
   - Verify offline compilation works (airplane mode)
   - Test project creation, editing, and deletion

### Automated testing

5. **Run unit tests**
   ```bash
   npm test
   ```
   - All tests in `__tests__/` must pass
   - Coverage should be >70% for core logic
   - Compiler tests verify each target works
   - Storage tests confirm data persistence

6. **Test compilation targets**
   ```bash
   npm test -- compiler
   ```
   - Verify x86, ARM, AVR compile successfully
   - Check Z80 and 6502 assembly parsing
   - Confirm error detection works
   - Validate binary output format

### Feature verification checklist

- [ ] Create new project from template
- [ ] Edit code with syntax highlighting
- [ ] Compile for at least 3 different targets
- [ ] View hex dump of compiled binary
- [ ] Export binary to Files app
- [ ] Delete project and confirm removal
- [ ] App works offline (no network required)
- [ ] Projects persist after app restart
- [ ] Error messages show for invalid code
- [ ] Tutorial examples compile successfully
- [ ] Free tier limits enforced (3 targets, 5 projects)
- [ ] Premium paywall appears for locked targets
- [ ] All tests pass with `npm test`

### Performance benchmarks

- Project creation: <500ms
- Code compilation (simple): <2s
- Syntax highlighting: <100ms for 1000 lines
- App launch: <3s on mid-range device
- Binary export: <1s for 100KB file