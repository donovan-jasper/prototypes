# NightOwl AI

## One-line pitch
Your phone works while you sleep — wake up to organized files, summarized documents, and completed tasks, all processed locally without the cloud.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- **Busy professionals** who accumulate hundreds of photos, documents, and files daily but never have time to organize them
- **Students** who need to process lecture recordings, PDFs, and notes but don't want to pay for cloud AI services
- **Parents** who take endless photos/videos of their kids and want automatic organization and highlights
- **Small business owners** who need to process receipts, invoices, and documents without cloud privacy concerns

**Beyond the original niche:**
This isn't just for "power users" — it's for anyone who feels overwhelmed by digital clutter. The "night shift" concept is universally relatable: your phone becomes a personal assistant that works while you sleep, like a dishwasher for your digital life.

**Adjacent use cases:**
- **Photo curation**: Wake up to auto-generated albums, duplicate removal, and best-shot selection
- **Document processing**: Overnight OCR, summarization, and smart filing of PDFs/receipts
- **Audio transcription**: Process voice memos, meeting recordings, or lectures while charging
- **Content creation**: Generate social media captions, email drafts, or blog outlines from your notes
- **Learning assistant**: Flashcard generation, quiz creation, and study guides from textbooks

**Why non-technical people want this:**
- No setup complexity — just plug in your phone at night and wake up to results
- Solves the universal problem of "I'll organize this later" (which never happens)
- Privacy-first: your data never leaves your device
- One-time cost vs. endless subscriptions to cloud AI services

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Local AI**: Expo-compatible ML framework (TensorFlow Lite or ONNX Runtime)
- **Database**: SQLite (expo-sqlite)
- **Background tasks**: expo-task-manager + expo-background-fetch
- **File system**: expo-file-system
- **Notifications**: expo-notifications
- **Storage**: expo-secure-store (for settings/preferences)
- **Testing**: Jest + React Native Testing Library

**Key dependencies:**
```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.0",
  "expo-sqlite": "~15.0.0",
  "expo-task-manager": "~12.0.0",
  "expo-background-fetch": "~13.0.0",
  "expo-file-system": "~18.0.0",
  "expo-notifications": "~0.29.0",
  "expo-secure-store": "~14.0.0",
  "@tensorflow/tfjs": "^4.20.0",
  "@tensorflow/tfjs-react-native": "^0.8.0"
}
```

## Core features (MVP)

1. **Night Shift Scheduler**
   - Set charging + idle time window (e.g., 2am-6am)
   - Auto-detects when phone is plugged in and unused
   - Runs AI tasks in background with battery/thermal monitoring
   - Morning summary notification of completed work

2. **Smart File Organizer**
   - Scans photos, documents, downloads folder
   - Auto-categorizes by content (receipts, screenshots, memes, work docs)
   - Removes duplicates and blurry photos
   - Creates smart folders with searchable tags

3. **Document Processor**
   - OCR for images and PDFs
   - Summarization of long documents
   - Extracts key info (dates, amounts, names) from receipts/invoices
   - Searchable text database of all processed content

4. **Task Queue**
   - Simple interface to add tasks: "Organize my photos from last week"
   - Visual progress tracking
   - History of completed tasks with undo option

5. **Privacy Dashboard**
   - Shows what data is processed, where it's stored
   - One-tap data export/deletion
   - Battery and storage usage stats
   - Model size and performance metrics

## Monetization strategy

**Free tier (the hook):**
- 10 night shift tasks per month
- Basic file organization (photos only)
- Small AI model (faster but less accurate)
- 500MB processed data limit

**Paid tier: $4.99/month or $39.99/year (the paywall):**
- Unlimited night shift tasks
- All file types (documents, audio, video)
- Larger AI models (better accuracy)
- Unlimited processed data
- Priority processing queue
- Advanced features: audio transcription, content generation
- Cloud backup of task history (optional, encrypted)

**Why this price point:**
- Lower than ChatGPT Plus ($20/mo) or Notion AI ($10/mo)
- Comparable to productivity apps (Things 3: $10, Bear: $3/mo)
- One-time $4.99 option for users who hate subscriptions (lifetime basic features)

**What makes people STAY subscribed:**
- **Habit formation**: They rely on waking up to organized files
- **Sunk cost**: Processed data and task history are valuable
- **Incremental value**: Each month, more files get organized, making the app more useful
- **Privacy**: Switching to cloud AI means losing privacy benefits
- **Cost savings**: Cheaper than paying for multiple cloud AI services

**Revenue projections:**
- 10,000 downloads in year 1 (realistic for niche productivity app)
- 5% conversion to paid = 500 subscribers
- $4.99/mo × 500 = $2,495/mo = ~$30k/year
- Sustainable for solo dev or small team

## File structure

```
nightowl-ai/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home/Dashboard
│   │   ├── tasks.tsx                 # Task Queue
│   │   ├── files.tsx                 # File Browser
│   │   └── settings.tsx              # Settings/Privacy
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── NightShiftScheduler.tsx
│   ├── TaskCard.tsx
│   ├── FileGrid.tsx
│   ├── ProgressBar.tsx
│   └── PrivacyDashboard.tsx
├── services/
│   ├── ai/
│   │   ├── modelLoader.ts            # Load TFLite models
│   │   ├── imageClassifier.ts        # Photo categorization
│   │   ├── textProcessor.ts          # OCR and summarization
│   │   └── taskExecutor.ts           # Run AI tasks
│   ├── background/
│   │   ├── nightShiftTask.ts         # Background task registration
│   │   └── batteryMonitor.ts         # Battery/thermal checks
│   ├── storage/
│   │   ├── database.ts               # SQLite setup
│   │   ├── fileManager.ts            # File system operations
│   │   └── taskQueue.ts              # Task persistence
│   └── notifications/
│       └── notificationService.ts    # Morning summaries
├── hooks/
│   ├── useNightShift.ts
│   ├── useTasks.ts
│   ├── useFiles.ts
│   └── useDatabase.ts
├── constants/
│   ├── Models.ts                     # AI model configs
│   └── Config.ts                     # App settings
├── types/
│   └── index.ts                      # TypeScript types
├── __tests__/
│   ├── services/
│   │   ├── taskExecutor.test.ts
│   │   ├── fileManager.test.ts
│   │   └── database.test.ts
│   ├── hooks/
│   │   ├── useNightShift.test.ts
│   │   └── useTasks.test.ts
│   └── components/
│       ├── TaskCard.test.tsx
│       └── NightShiftScheduler.test.tsx
├── assets/
│   ├── models/                       # TFLite model files
│   └── images/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### Core logic tests

**`__tests__/services/taskExecutor.test.ts`**
```typescript
import { TaskExecutor } from '@/services/ai/taskExecutor';
import { TaskType } from '@/types';

describe('TaskExecutor', () => {
  it('should execute photo organization task', async () => {
    const executor = new TaskExecutor();
    const task = {
      id: '1',
      type: TaskType.ORGANIZE_PHOTOS,
      status: 'pending',
      createdAt: Date.now(),
    };
    
    const result = await executor.execute(task);
    expect(result.status).toBe('completed');
    expect(result.filesProcessed).toBeGreaterThan(0);
  });

  it('should handle task cancellation', async () => {
    const executor = new TaskExecutor();
    const task = {
      id: '2',
      type: TaskType.PROCESS_DOCUMENTS,
      status: 'pending',
      createdAt: Date.now(),
    };
    
    const promise = executor.execute(task);
    executor.cancel(task.id);
    
    await expect(promise).rejects.toThrow('Task cancelled');
  });
});
```

**`__tests__/services/fileManager.test.ts`**
```typescript
import { FileManager } from '@/services/storage/fileManager';

describe('FileManager', () => {
  it('should categorize files by type', async () => {
    const manager = new FileManager();
    const files = [
      { uri: 'file:///photo.jpg', type: 'image' },
      { uri: 'file:///receipt.pdf', type: 'document' },
    ];
    
    const categorized = await manager.categorize(files);
    expect(categorized.photos).toHaveLength(1);
    expect(categorized.documents).toHaveLength(1);
  });

  it('should detect duplicate files', async () => {
    const manager = new FileManager();
    const files = [
      { uri: 'file:///photo1.jpg', hash: 'abc123' },
      { uri: 'file:///photo2.jpg', hash: 'abc123' },
    ];
    
    const duplicates = await manager.findDuplicates(files);
    expect(duplicates).toHaveLength(1);
  });
});
```

**`__tests__/services/database.test.ts`**
```typescript
import { Database } from '@/services/storage/database';

describe('Database', () => {
  let db: Database;

  beforeEach(async () => {
    db = new Database();
    await db.init();
  });

  afterEach(async () => {
    await db.clear();
  });

  it('should create and retrieve tasks', async () => {
    const task = {
      type: 'organize_photos',
      status: 'pending',
      createdAt: Date.now(),
    };
    
    const id = await db.createTask(task);
    const retrieved = await db.getTask(id);
    
    expect(retrieved.type).toBe(task.type);
    expect(retrieved.status).toBe(task.status);
  });

  it('should update task status', async () => {
    const task = await db.createTask({ type: 'test', status: 'pending' });
    await db.updateTaskStatus(task.id, 'completed');
    
    const updated = await db.getTask(task.id);
    expect(updated.status).toBe('completed');
  });
});
```

**`__tests__/hooks/useNightShift.test.ts`**
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useNightShift } from '@/hooks/useNightShift';

describe('useNightShift', () => {
  it('should enable night shift mode', async () => {
    const { result } = renderHook(() => useNightShift());
    
    await act(async () => {
      await result.current.enable({ startHour: 2, endHour: 6 });
    });
    
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.schedule.startHour).toBe(2);
  });

  it('should check if currently in night shift window', () => {
    const { result } = renderHook(() => useNightShift());
    
    const now = new Date();
    now.setHours(3); // 3am
    
    const isActive = result.current.isInWindow(now, { startHour: 2, endHour: 6 });
    expect(isActive).toBe(true);
  });
});
```

**`__tests__/components/TaskCard.test.tsx`**
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskCard } from '@/components/TaskCard';

describe('TaskCard', () => {
  it('should render task details', () => {
    const task = {
      id: '1',
      type: 'organize_photos',
      status: 'completed',
      filesProcessed: 42,
      createdAt: Date.now(),
    };
    
    const { getByText } = render(<TaskCard task={task} />);
    expect(getByText('Organize Photos')).toBeTruthy();
    expect(getByText('42 files processed')).toBeTruthy();
  });

  it('should call onCancel when cancel button pressed', () => {
    const onCancel = jest.fn();
    const task = { id: '1', type: 'test', status: 'pending' };
    
    const { getByText } = render(<TaskCard task={task} onCancel={onCancel} />);
    fireEvent.press(getByText('Cancel'));
    
    expect(onCancel).toHaveBeenCalledWith('1');
  });
});
```

## Implementation steps

### Phase 1: Project setup and core infrastructure

1. **Initialize Expo project**
   ```bash
   npx create-expo-app nightowl-ai --template tabs
   cd nightowl-ai
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-task-manager expo-background-fetch expo-file-system expo-notifications expo-secure-store
   npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
   npm install -D jest @testing-library/react-native @testing-library/jest-native
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Create `types/index.ts` with core types:
     ```typescript
     export enum TaskType {
       ORGANIZE_PHOTOS = 'organize_photos',
       PROCESS_DOCUMENTS = 'process_documents',
       TRANSCRIBE_AUDIO = 'transcribe_audio',
     }
     
     export interface Task {
       id: string;
       type: TaskType;
       status: 'pending' | 'running' | 'completed' | 'failed';
       progress?: number;
       filesProcessed?: number;
       createdAt: number;
       completedAt?: number;
       error?: string;
     }
     
     export interface NightShiftSchedule {
       enabled: boolean;
       startHour: number;
       endHour: number;
       requiresCharging: boolean;
       minBatteryLevel: number;
     }
     ```

4. **Setup Jest configuration**
   - Create `jest.config.js`:
     ```javascript
     module.exports = {
       preset: 'jest-expo',
       transformIgnorePatterns: [
         'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
       ],
       setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
     };
     ```

### Phase 2: Database and storage layer

5. **Create SQLite database service** (`services/storage/database.ts`)
   - Initialize database with tables: `tasks`, `files`, `processed_content`
   - Implement CRUD operations for tasks
   - Add migration system for schema updates
   - Create indexes for performance

6. **Implement file manager** (`services/storage/fileManager.ts`)
   - Scan device file system (photos, documents, downloads)
   - Calculate file hashes for duplicate detection
   - Categorize files by MIME type and content
   - Move/copy files to organized folders

7. **Create task queue system** (`services/storage/taskQueue.ts`)
   - Persist tasks to SQLite
   - Priority queue implementation
   - Task retry logic with exponential backoff
   - Task cancellation support

8. **Write tests for storage layer**
   - Test database CRUD operations
   - Test file categorization logic
   - Test duplicate detection
   - Test task queue ordering

### Phase 3: AI and background processing

9. **Setup TensorFlow Lite integration** (`services/ai/modelLoader.ts`)
   - Download and bundle lightweight models (MobileNet for images, DistilBERT for text)
   - Implement model loading with caching
   - Add model version management
   - Handle model download failures gracefully

10. **Implement image classifier** (`services/ai/imageClassifier.ts`)
    - Load MobileNet model
    - Classify photos into categories (people, food, documents, screenshots, etc.)
    - Detect blurry/low-quality images
    - Extract EXIF metadata (date, location)

11. **Implement text processor** (`services/ai/textProcessor.ts`)
    - OCR using TensorFlow Lite OCR model
    - Text summarization (extractive, first 3 sentences)
    - Named entity recognition (dates, amounts, names)
    - Keyword extraction

12. **Create task executor** (`services/ai/taskExecutor.ts`)
    - Execute tasks based on type
    - Monitor battery and thermal state
    - Pause/resume on battery drain or overheating
    - Report progress via callbacks

13. **Write tests for AI services**
    - Test model loading and inference
    - Test image classification accuracy (sample images)
    - Test OCR on sample documents
    - Test task execution and cancellation

### Phase 4: Background task scheduling

14. **Implement night shift background task** (`services/background/nightShiftTask.ts`)
    - Register background task with expo-task-manager
    - Check if in night shift window
    - Verify charging and battery level
    - Execute queued tasks
    - Send completion notification

15. **Create battery monitor** (`services/background/batteryMonitor.ts`)
    - Monitor battery level and charging state
    - Detect thermal throttling
    - Pause tasks if battery drops below threshold
    - Resume when conditions improve

16. **Setup notification service** (`services/notifications/notificationService.ts`)
    - Request notification permissions
    - Send morning summary (tasks completed, files organized)
    - Send alerts for failed tasks
    - Schedule daily reminders if no tasks queued

17. **Write tests for background services**
    - Test night shift window detection
    - Test battery monitoring logic
    - Mock background task execution

### Phase 5: UI components and screens

18. **Create reusable components**
    - `NightShiftScheduler.tsx`: Time picker for night shift window
    - `TaskCard.tsx`: Display task status and progress
    - `FileGrid.tsx`: Grid view of organized files
    - `ProgressBar.tsx`: Animated progress indicator
    - `PrivacyDashboard.tsx`: Data usage and privacy stats

19. **Build home screen** (`app/(tabs)/index.tsx`)
    - Show night shift status (enabled/disabled, next run time)
    - Display recent task history
    - Quick actions: "Organize photos now", "Add task"
    - Stats: files processed, storage saved

20. **Build task queue screen** (`app/(tabs)/tasks.tsx`)
    - List of pending/running/completed tasks
    - Add new task button with type selector
    - Task detail view with progress
    - Cancel/retry buttons

21. **Build file browser screen** (`app/(tabs)/files.tsx`)
    - Organized folders (Photos, Documents, Receipts, etc.)
    - Search functionality
    - File preview
    - Undo organization action

22. **Build settings screen** (`app/(tabs)/settings.tsx`)
    - Night shift schedule configuration
    - Battery and storage thresholds
    - Model selection (small/medium/large)
    - Privacy dashboard
    - Subscription management

23. **Write component tests**
    - Test TaskCard rendering and interactions
    - Test NightShiftScheduler time selection
    - Test FileGrid display and navigation

### Phase 6: Hooks and state management

24. **Create custom hooks**
    - `useNightShift.ts`: Manage night shift schedule and status
    - `useTasks.ts`: CRUD operations for tasks
    - `useFiles.ts`: File system operations and search
    - `useDatabase.ts`: Database connection and queries

25. **Write hook tests**
    - Test useNightShift enable/disable
    - Test useTasks create/update/delete
    - Test useFiles search and categorization

### Phase 7: Monetization and onboarding

26. **Implement paywall**
    - Use expo-in-app-purchases or RevenueCat
    - Show paywall after 10 free tasks
    - Highlight premium features
    - Restore purchases functionality

27. **Create onboarding flow**
    - Welcome screen explaining night shift concept
    - Request permissions (files, notifications, background)
    - Setup first night shift schedule
    - Add first task tutorial

28. **Add analytics** (optional, privacy-preserving)
    - Track feature usage (no PII)
    - Monitor task completion rates
    - Measure battery impact
    - A/B test paywall messaging

### Phase 8: Testing and optimization

29. **End-to-end testing**
    - Test full night shift cycle (schedule → execute → notify)
    - Test task queue with multiple tasks
    - Test file organization with real photos/documents
    - Test background task on device (not simulator)

30. **Performance optimization**
    - Profile AI inference time
    - Optimize database queries with indexes
    - Reduce app bundle size (lazy load models)
    - Test battery drain over 8-hour night shift

31. **Error handling and logging**
    - Add Sentry or similar for crash reporting
    - Log task failures with context
    - Graceful degradation if models fail to load
    - User-friendly error messages

### Phase 9: Polish and launch prep

32. **UI polish**
    - Add animations (task completion, file organization)
    - Dark mode support
    - Accessibility labels and screen reader support
    - Haptic feedback for interactions

33. **App Store assets**
    - Screenshots showing before/after file organization
    - App icon (owl + moon theme)
    - Privacy policy and terms of service
    - App Store description emphasizing privacy and night shift

34. **Beta testing**
    - TestFlight for iOS (50-100 testers)
    - Internal testing track for Android
    - Collect feedback on battery usage and accuracy
    - Iterate on onboarding flow

## How to verify it works

### Local development

1. **Start Expo dev server**
   ```bash
   npx expo start
   ```

2. **Run on iOS simulator**
   ```bash
   npx expo run:ios
   ```

3. **Run on Android emulator**
   ```bash
   npx expo run:android
   ```

4. **Test on physical device**
   - Scan QR code with Expo Go app
   - Or build development client: `npx expo run:ios --device`

### Functional testing checklist

- [ ] Night shift schedule can be enabled/disabled
- [ ] Tasks can be added to queue
- [ ] Background task executes when phone is charging (test overnight)
- [ ] Morning notification appears with summary
- [ ] Photos are categorized correctly (test with 20+ sample photos)
- [ ] Documents are OCR'd and searchable
- [ ] Duplicate photos are detected and removed
- [ ] Task can be cancelled mid-execution
- [ ] App doesn't drain battery excessively (< 5% overnight)
- [ ] Paywall appears after 10 free tasks
- [ ] Subscription can be purchased and restored

### Automated testing

```bash
npm test
```

**Expected output:**
```
PASS  __tests__/services/taskExecutor.test.ts
PASS  __tests__/services/fileManager.test.ts
PASS  __tests__/services/database.test.ts
PASS  __tests__/hooks/useNightShift.test.ts
PASS  __tests__/components/TaskCard.test.tsx

Test Suites: 5 passed, 5 total
Tests:       15 passed, 15 total
```

### Performance benchmarks

- **AI inference time**: < 2 seconds per photo classification
- **OCR processing**: < 5 seconds per page
- **Database query time**: < 100ms for task retrieval
- **Background task startup**: < 10 seconds
- **Battery drain**: < 5% over 8-hour night shift with 100 tasks

### Manual verification steps

1. **Night shift activation**
   - Set schedule for 2am-6am
   - Plug in phone at 1:55am
   - Verify background task starts at 2am (check logs)
   - Verify notification at 6am with summary

2. **Photo organization**
   - Add 50 photos to camera roll (mix of people, food, screenshots)
   - Create "Organize photos" task
   - Run task manually or wait for night shift
   - Verify photos are moved to categorized folders
   - Verify duplicates are removed

3. **Document processing**
   - Add 5 PDF receipts to downloads folder
   - Create "Process documents" task
   - Verify OCR extracts text correctly
   - Verify amounts and dates are detected
   - Search for extracted text in app

4. **Battery and thermal monitoring**
   - Start intensive task (100+ photos)
   - Unplug phone mid-task
   - Verify task pauses when battery < 20%
   - Plug back in, verify task resumes

5. **Paywall and subscription**
   - Complete 10 free tasks
   - Verify paywall appears on 11th task
   - Purchase subscription (use sandbox account)
   - Verify unlimited tasks are enabled
   - Restore purchase on second device