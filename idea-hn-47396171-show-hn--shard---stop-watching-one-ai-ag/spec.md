# ParallelMind

## One-line pitch
Run multiple AI tasks at once on your phone — get answers, code, and designs in parallel, not one at a time.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Anyone who uses AI tools and hates waiting. This isn't just for developers.

- **Content creators** who need to generate social media captions, edit images, and research trending topics simultaneously
- **Students** writing essays while researching sources and generating study guides in parallel
- **Small business owners** drafting emails, creating marketing copy, and analyzing competitor data at the same time
- **Consultants and freelancers** who bill by the hour and can't afford to watch loading spinners
- **Parents and busy professionals** who have 10 minutes between meetings and need to accomplish multiple things

### What adjacent use cases does this enable?

- **Task batching:** Queue up your entire morning routine (summarize emails, draft responses, create to-do list) and have it done by the time you finish coffee
- **Comparison shopping for AI outputs:** Run the same prompt through 4 different models simultaneously, pick the best result
- **Research acceleration:** Parallel web searches, document summarization, and fact-checking
- **Creative exploration:** Generate multiple design variations, writing styles, or problem-solving approaches at once

### Why would a non-technical person want this?

Because **waiting is the universal pain point**. You don't need to understand "agent orchestration" to appreciate getting 4 things done in the time it used to take to do 1. This is the difference between "AI is neat" and "AI changed how I work."

The app makes AI feel **abundant** instead of **scarce**. Instead of rationing your AI usage because each query takes 30-60 seconds, you can think bigger and move faster.

## Tech stack

- **React Native (Expo SDK 52+)** — cross-platform iOS/Android
- **Expo Router** — file-based navigation
- **SQLite (expo-sqlite)** — local task history and queue management
- **Zustand** — lightweight state management
- **React Native Reanimated** — smooth animations for task progress
- **Expo Notifications** — background task completion alerts
- **AsyncStorage** — user preferences and API keys
- **Jest + React Native Testing Library** — unit and integration tests

## Core features (MVP)

1. **Parallel Task Queue**
   - Add up to 4 tasks (free tier: 2 tasks)
   - Each task runs independently with real-time progress
   - Visual cards showing task status, estimated time remaining, and partial results
   - Swipe to cancel, tap to view full output

2. **Smart Task Templates**
   - Pre-built templates: "Code Review", "Content Ideas", "Research Summary", "Design Variations"
   - One-tap to launch common workflows
   - Custom templates (Pro feature)

3. **Result Comparison View**
   - Side-by-side comparison of outputs from parallel tasks
   - Copy, share, or merge results
   - Rate outputs to improve future suggestions

4. **Background Processing**
   - Tasks continue when app is backgrounded
   - Push notifications when tasks complete
   - Battery-efficient polling (not constant websockets)

5. **Task History & Replay**
   - SQLite-backed history of all completed tasks
   - One-tap to re-run previous tasks
   - Search and filter by date, type, or keyword

## Monetization strategy

### Free tier (the hook)
- 2 parallel tasks at a time
- 10 tasks per day
- Basic templates only
- 7-day task history

### Pro tier: $7.99/month (the paywall)
**Why this price?** Lower than Cursor ($20/mo) and GitHub Copilot ($10/mo), positioned as "the AI productivity tool you use everywhere, not just for coding."

**What you get:**
- 4 parallel tasks
- Unlimited daily tasks
- Custom templates
- 90-day task history
- Priority processing (faster queue)
- Export results to Markdown, PDF, or JSON

### What makes people STAY subscribed?

1. **Habit formation:** Once you experience parallel execution, serial AI feels painfully slow
2. **Task history becomes valuable:** Your library of past tasks and templates grows over time
3. **Time savings compound:** If you save 20 minutes/day, that's 10 hours/month — worth way more than $7.99
4. **Network effects:** Share templates with team members (future feature)

### One-time purchase option
**Lifetime Pro: $79.99** — for users who hate subscriptions. Positioned as "pay once, save forever."

## File structure

```
parallelmind/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Task queue screen
│   │   ├── templates.tsx          # Template library
│   │   └── history.tsx            # Task history
│   ├── task/[id].tsx              # Individual task detail
│   ├── compare.tsx                # Side-by-side comparison
│   ├── settings.tsx               # Settings & subscription
│   └── _layout.tsx
├── components/
│   ├── TaskCard.tsx               # Individual task in queue
│   ├── TaskProgress.tsx           # Progress indicator
│   ├── TemplateCard.tsx           # Template selection
│   ├── ComparisonView.tsx         # Side-by-side results
│   └── SubscriptionPrompt.tsx     # Paywall UI
├── lib/
│   ├── database.ts                # SQLite setup & queries
│   ├── taskQueue.ts               # Task orchestration logic
│   ├── aiProvider.ts              # AI API integration (OpenAI, Anthropic, etc.)
│   ├── notifications.ts           # Push notification handling
│   └── subscription.ts            # In-app purchase logic
├── store/
│   └── taskStore.ts               # Zustand state management
├── constants/
│   ├── templates.ts               # Pre-built task templates
│   └── config.ts                  # App configuration
├── __tests__/
│   ├── taskQueue.test.ts
│   ├── database.test.ts
│   ├── aiProvider.test.ts
│   └── components/
│       ├── TaskCard.test.tsx
│       └── ComparisonView.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/taskQueue.test.ts`
```typescript
import { TaskQueue } from '../lib/taskQueue';
import { Task, TaskStatus } from '../types';

describe('TaskQueue', () => {
  let queue: TaskQueue;

  beforeEach(() => {
    queue = new TaskQueue(4); // Max 4 parallel tasks
  });

  test('adds task to queue', () => {
    const task: Task = {
      id: '1',
      prompt: 'Test prompt',
      status: TaskStatus.PENDING,
      createdAt: Date.now(),
    };
    queue.addTask(task);
    expect(queue.getTasks()).toHaveLength(1);
  });

  test('respects max parallel limit', () => {
    for (let i = 0; i < 6; i++) {
      queue.addTask({
        id: `${i}`,
        prompt: `Task ${i}`,
        status: TaskStatus.PENDING,
        createdAt: Date.now(),
      });
    }
    const running = queue.getTasks().filter(t => t.status === TaskStatus.RUNNING);
    expect(running.length).toBeLessThanOrEqual(4);
  });

  test('completes task and starts next in queue', async () => {
    for (let i = 0; i < 5; i++) {
      queue.addTask({
        id: `${i}`,
        prompt: `Task ${i}`,
        status: TaskStatus.PENDING,
        createdAt: Date.now(),
      });
    }
    
    await queue.completeTask('0');
    const running = queue.getTasks().filter(t => t.status === TaskStatus.RUNNING);
    expect(running.length).toBe(4);
  });

  test('cancels task', () => {
    const task: Task = {
      id: '1',
      prompt: 'Test',
      status: TaskStatus.RUNNING,
      createdAt: Date.now(),
    };
    queue.addTask(task);
    queue.cancelTask('1');
    expect(queue.getTask('1')?.status).toBe(TaskStatus.CANCELLED);
  });
});
```

### `__tests__/database.test.ts`
```typescript
import { Database } from '../lib/database';
import { Task, TaskStatus } from '../types';

describe('Database', () => {
  let db: Database;

  beforeEach(async () => {
    db = new Database(':memory:'); // In-memory DB for tests
    await db.initialize();
  });

  afterEach(async () => {
    await db.close();
  });

  test('saves task to database', async () => {
    const task: Task = {
      id: '1',
      prompt: 'Test prompt',
      status: TaskStatus.COMPLETED,
      result: 'Test result',
      createdAt: Date.now(),
      completedAt: Date.now(),
    };
    
    await db.saveTask(task);
    const retrieved = await db.getTask('1');
    expect(retrieved?.prompt).toBe('Test prompt');
  });

  test('retrieves task history', async () => {
    const tasks: Task[] = [
      { id: '1', prompt: 'Task 1', status: TaskStatus.COMPLETED, createdAt: Date.now() - 2000 },
      { id: '2', prompt: 'Task 2', status: TaskStatus.COMPLETED, createdAt: Date.now() - 1000 },
      { id: '3', prompt: 'Task 3', status: TaskStatus.COMPLETED, createdAt: Date.now() },
    ];
    
    for (const task of tasks) {
      await db.saveTask(task);
    }
    
    const history = await db.getTaskHistory(10);
    expect(history).toHaveLength(3);
    expect(history[0].id).toBe('3'); // Most recent first
  });

  test('deletes old tasks beyond retention period', async () => {
    const oldTask: Task = {
      id: '1',
      prompt: 'Old task',
      status: TaskStatus.COMPLETED,
      createdAt: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
    };
    
    await db.saveTask(oldTask);
    await db.cleanupOldTasks(7); // 7-day retention
    const retrieved = await db.getTask('1');
    expect(retrieved).toBeNull();
  });
});
```

### `__tests__/components/TaskCard.test.tsx`
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskCard from '../../components/TaskCard';
import { Task, TaskStatus } from '../../types';

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    prompt: 'Generate a blog post',
    status: TaskStatus.RUNNING,
    progress: 0.5,
    createdAt: Date.now(),
  };

  test('renders task prompt', () => {
    const { getByText } = render(<TaskCard task={mockTask} onCancel={() => {}} />);
    expect(getByText('Generate a blog post')).toBeTruthy();
  });

  test('shows progress indicator', () => {
    const { getByTestId } = render(<TaskCard task={mockTask} onCancel={() => {}} />);
    const progressBar = getByTestId('progress-bar');
    expect(progressBar).toBeTruthy();
  });

  test('calls onCancel when cancel button pressed', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(<TaskCard task={mockTask} onCancel={onCancel} />);
    
    fireEvent.press(getByTestId('cancel-button'));
    expect(onCancel).toHaveBeenCalledWith('1');
  });

  test('displays completed status', () => {
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
    const { getByText } = render(<TaskCard task={completedTask} onCancel={() => {}} />);
    expect(getByText(/completed/i)).toBeTruthy();
  });
});
```

## Implementation steps

### Step 1: Project setup
```bash
npx create-expo-app@latest parallelmind --template tabs
cd parallelmind
npm install zustand expo-sqlite expo-notifications @react-native-async-storage/async-storage
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

### Step 2: Configure TypeScript types
Create `types/index.ts`:
```typescript
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Task {
  id: string;
  prompt: string;
  status: TaskStatus;
  progress?: number;
  result?: string;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  templateId?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  isPro: boolean;
}

export interface UserSubscription {
  isPro: boolean;
  maxParallelTasks: number;
  dailyTaskLimit: number;
  historyRetentionDays: number;
}
```

### Step 3: Set up SQLite database
Create `lib/database.ts`:
```typescript
import * as SQLite from 'expo-sqlite';
import { Task } from '../types';

export class Database {
  private db: SQLite.SQLiteDatabase;

  constructor(dbName: string = 'parallelmind.db') {
    this.db = SQLite.openDatabaseSync(dbName);
  }

  async initialize() {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        status TEXT NOT NULL,
        progress REAL,
        result TEXT,
        error TEXT,
        created_at INTEGER NOT NULL,
        started_at INTEGER,
        completed_at INTEGER,
        template_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_created_at ON tasks(created_at DESC);
    `);
  }

  async saveTask(task: Task): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO tasks 
       (id, prompt, status, progress, result, error, created_at, started_at, completed_at, template_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.prompt,
        task.status,
        task.progress ?? null,
        task.result ?? null,
        task.error ?? null,
        task.createdAt,
        task.startedAt ?? null,
        task.completedAt ?? null,
        task.templateId ?? null,
      ]
    );
  }

  async getTask(id: string): Promise<Task | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    return result ? this.mapRowToTask(result) : null;
  }

  async getTaskHistory(limit: number = 50): Promise<Task[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return results.map(this.mapRowToTask);
  }

  async cleanupOldTasks(retentionDays: number): Promise<void> {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    await this.db.runAsync('DELETE FROM tasks WHERE created_at < ?', [cutoffTime]);
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      prompt: row.prompt,
      status: row.status,
      progress: row.progress,
      result: row.result,
      error: row.error,
      createdAt: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      templateId: row.template_id,
    };
  }

  async close() {
    await this.db.closeAsync();
  }
}
```

### Step 4: Implement task queue orchestration
Create `lib/taskQueue.ts`:
```typescript
import { Task, TaskStatus } from '../types';
import { AIProvider } from './aiProvider';

export class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private maxParallel: number;
  private aiProvider: AIProvider;

  constructor(maxParallel: number = 2) {
    this.maxParallel = maxParallel;
    this.aiProvider = new AIProvider();
  }

  addTask(task: Task): void {
    this.tasks.set(task.id, task);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    const running = Array.from(this.tasks.values()).filter(
      t => t.status === TaskStatus.RUNNING
    ).length;

    if (running >= this.maxParallel) return;

    const pending = Array.from(this.tasks.values())
      .filter(t => t.status === TaskStatus.PENDING)
      .sort((a, b) => a.createdAt - b.createdAt);

    const toStart = pending.slice(0, this.maxParallel - running);

    for (const task of toStart) {
      this.runTask(task);
    }
  }

  private async runTask(task: Task): Promise<void> {
    task.status = TaskStatus.RUNNING;
    task.startedAt = Date.now();
    this.tasks.set(task.id, task);

    try {
      const result = await this.aiProvider.execute(
        task.prompt,
        (progress) => {
          task.progress = progress;
          this.tasks.set(task.id, task);
        }
      );

      task.status = TaskStatus.COMPLETED;
      task.result = result;
      task.completedAt = Date.now();
    } catch (error) {
      task.status = TaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = Date.now();
    }

    this.tasks.set(task.id, task);
    this.processQueue();
  }

  cancelTask(id: string): void {
    const task = this.tasks.get(id);
    if (task && task.status === TaskStatus.RUNNING) {
      task.status = TaskStatus.CANCELLED;
      task.completedAt = Date.now();
      this.tasks.set(id, task);
      this.processQueue();
    }
  }

  async completeTask(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = Date.now();
      this.tasks.set(id, task);
      this.processQueue();
    }
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  setMaxParallel(max: number): void {
    this.maxParallel = max;
    this.processQueue();
  }
}
```

### Step 5: Create AI provider integration
Create `lib/aiProvider.ts`:
```typescript
export class AIProvider {
  private apiKey: string = '';

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  async execute(
    prompt: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Simulate AI processing with progress updates
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.1;
        if (onProgress) onProgress(Math.min(progress, 0.9));
        
        if (progress >= 1) {
          clearInterval(interval);
          if (onProgress) onProgress(1);
          resolve(`Result for: ${prompt}`);
        }
      }, 500);
    });

    // Real implementation would call OpenAI/Anthropic API:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [{ role: 'user', content: prompt }],
    //     stream: true,
    //   }),
    // });
  }
}
```

### Step 6: Set up Zustand store
Create `store/taskStore.ts`:
```typescript
import { create } from 'zustand';
import { Task, TaskStatus, UserSubscription } from '../types';
import { TaskQueue } from '../lib/taskQueue';
import { Database } from '../lib/database';

interface TaskStore {
  tasks: Task[];
  queue: TaskQueue;
  db: Database;
  subscription: UserSubscription;
  
  initialize: () => Promise<void>;
  addTask: (prompt: string, templateId?: string) => void;
  cancelTask: (id: string) => void;
  loadHistory: () => Promise<void>;
  updateSubscription: (subscription: UserSubscription) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  queue: new TaskQueue(2),
  db: new Database(),
  subscription: {
    isPro: false,
    maxParallelTasks: 2,
    dailyTaskLimit: 10,
    historyRetentionDays: 7,
  },

  initialize: async () => {
    const { db } = get();
    await db.initialize();
    await get().loadHistory();
  },

  addTask: (prompt: string, templateId?: string) => {
    const { queue, db, tasks } = get();
    const task: Task = {
      id: Date.now().toString(),
      prompt,
      status: TaskStatus.PENDING,
      createdAt: Date.now(),
      templateId,
    };

    queue.addTask(task);
    db.saveTask(task);
    set({ tasks: [...tasks, task] });

    // Poll for updates
    const interval = setInterval(() => {
      const updated = queue.getTask(task.id);
      if (updated) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === task.id ? updated : t)
        }));
        db.saveTask(updated);

        if (updated.status === TaskStatus.COMPLETED || 
            updated.status === TaskStatus.FAILED ||
            updated.status === TaskStatus.CANCELLED) {
          clearInterval(interval);
        }
      }
    }, 500);
  },

  cancelTask: (id: string) => {
    const { queue } = get();
    queue.cancelTask(id);
  },

  loadHistory: async () => {
    const { db } = get();
    const history = await db.getTaskHistory(50);
    set({ tasks: history });
  },

  updateSubscription: (subscription: UserSubscription) => {
    const { queue } = get();
    queue.setMaxParallel(subscription.maxParallelTasks);
    set({ subscription });
  },
}));
```

### Step 7: Build TaskCard component
Create `components/TaskCard.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onCancel: (id: string) => void;
  onPress?: (id: string) => void;
}

export default function TaskCard({ task, onCancel, onPress }: TaskCardProps) {
  const getStatusColor = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED: return '#4CAF50';
      case TaskStatus.RUNNING: return '#2196F3';
      case TaskStatus.FAILED: return '#F44336';
      case TaskStatus.CANCELLED: return '#9E9E9E';
      default: return '#FFC107';
    }
  };

  return (
    <Pressable 
      style={styles.card}
      onPress={() => onPress?.(task.id)}
    >
      <View style={styles.header}>
        <Text style={styles.prompt} numberOfLines={2}>
          {task.prompt}
        </Text>
        {task.status === TaskStatus.RUNNING && (
          <Pressable 
            testID="cancel-button"
            onPress={() => onCancel(task.id)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>✕</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </Text>
      </View>

      {task.status === TaskStatus.RUNNING && task.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View 
            testID="progress-bar"
            style={[styles.progressBar, { width: `${task.progress * 100}%` }]} 
          />
        </View>
      )}

      {task.result && (
        <Text style={styles.preview} numberOfLines={3}>
          {task.result}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  preview: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
```

### Step 8: Build main task queue screen
Create `app/(tabs)/index.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useTaskStore } from '../../store/taskStore';
import TaskCard from '../../components/TaskCard';
import { TaskStatus } from '../../types';
import { router } from 'expo-router';

export default function TaskQueueScreen() {
  const { tasks, addTask, cancelTask, initialize, subscription } = useTaskStore();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    initialize();
  }, []);

  const activeTasks = tasks.filter(
    t => t.status === TaskStatus.PENDING || t.status === TaskStatus.RUNNING
  );

  const handleAddTask = () => {
    if (prompt.trim()) {
      addTask(prompt.trim());
      setPrompt('');
    }
  };

  const canAddTask = activeTasks.length < subscription.maxParallelTasks;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Tasks</Text>
        <Text style={styles.subtitle}>
          {activeTasks.length} / {subscription.maxParallelTasks} running
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What do you want to do?"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          maxLength={500}
        />
        <Pressable 
          style={[styles.addButton, !canAddTask && styles.addButtonDisabled]}
          onPress={handleAddTask}
          disabled={!canAddTask || !prompt.trim()}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </Pressable>
      </View>

      {!canAddTask && (
        <Text style={styles.limitWarning}>
          Task limit reached. Upgrade to Pro for more parallel tasks.
        </Text>
      )}

      <FlatList
        data={activeTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onCancel={cancelTask}
            onPress={(id) => router.push(`/task/${id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No active tasks. Add one above!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 14,