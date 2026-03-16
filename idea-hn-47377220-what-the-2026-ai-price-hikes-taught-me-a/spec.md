# AI Cost Optimizer App Spec

## 1. App Name

**ModelMiser**

## 2. One-Line Pitch

Stop overpaying for AI — get the same results for less with smart model recommendations that adapt to your budget and task.

## 3. Expanded Vision

### Who This Is REALLY For

**Primary Audience:**
- **Small business owners** running AI-powered chatbots, content generation, or customer service who see their API bills climbing monthly
- **Freelancers and solopreneurs** using AI for writing, design briefs, research, or client work who need predictable costs
- **Students and educators** experimenting with AI projects on tight budgets
- **Indie developers** building AI features into their apps who need to optimize costs before scaling

**Broader Appeal:**
This isn't just for "AI users" — it's for anyone who:
- Uses ChatGPT, Claude, or similar tools regularly and wonders if they're overspending
- Wants to understand what they're actually paying for when they hit "generate"
- Needs to justify AI expenses to a boss, client, or partner
- Feels overwhelmed by the explosion of AI model choices (GPT-4, Claude, Gemini, Llama, etc.)

**Adjacent Use Cases:**
- **Personal finance for AI** — track spending across multiple AI services in one place
- **Learning tool** — understand AI model capabilities through hands-on comparison
- **Procurement assistant** — help teams choose the right AI vendor contracts
- **Carbon footprint awareness** — larger models = more compute = more energy; budget-conscious users often care about sustainability too

**Why Non-Technical People Want This:**
You don't need to understand "tokens" or "parameters" — ModelMiser speaks in plain language: "This task will cost $0.03 with Model A or $0.008 with Model B, and both will give you great results." It's like having a savvy friend who knows which grocery store has the best deals, but for AI.

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local Storage:** expo-sqlite for usage history, model metadata, and offline caching
- **State Management:** React Context API (keep it simple)
- **Navigation:** expo-router (file-based routing)
- **UI Components:** React Native Paper (Material Design, accessible out of the box)
- **Charts:** react-native-chart-kit for cost visualization
- **API Integration:** axios for model pricing API calls
- **Testing:** Jest + React Native Testing Library
- **Linting:** ESLint + Prettier

**Key Dependencies (Minimal):**
```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.0",
  "expo-sqlite": "~15.0.0",
  "expo-router": "~4.0.0",
  "react-native-paper": "^5.12.0",
  "axios": "^1.7.0",
  "react-native-chart-kit": "^6.12.0"
}
```

## 5. Core Features (MVP)

### Feature 1: Smart Model Matcher
**What:** Describe your task in plain English ("Write a blog post about gardening"), and ModelMiser recommends 3 models ranked by cost-effectiveness, showing estimated cost, speed, and quality score.

**Why it's essential:** This is the core value prop — instant, actionable savings without requiring AI expertise.

### Feature 2: Real-Time Cost Tracker
**What:** Log your AI usage (manual entry or paste API responses), and see a running total of monthly spend across all services (OpenAI, Anthropic, Google, etc.). Visual breakdown by model and task type.

**Why it's essential:** You can't optimize what you don't measure. This creates the "aha moment" that drives upgrades.

### Feature 3: Offline Model Database
**What:** Pre-loaded database of 20+ popular AI models with pricing, capabilities, and use-case recommendations. Works without internet, syncs pricing updates weekly.

**Why it's essential:** Mobile users need instant answers even on spotty connections. This also reduces API dependency costs.

### Feature 4: Task Templates
**What:** Pre-built templates for common tasks (blog writing, code review, email drafts, image generation) with optimized model suggestions and cost estimates.

**Why it's essential:** Lowers the learning curve for non-technical users and provides immediate utility.

### Feature 5: Budget Alerts
**What:** Set monthly AI spending limits and get push notifications when you're at 50%, 75%, and 90% of your budget. Suggests cheaper alternatives when you're close to the limit.

**Why it's essential:** Prevents bill shock and creates a habit loop (check app → see savings → feel smart → keep using).

## 6. Monetization Strategy

### Free Tier (The Hook)
- Access to Smart Model Matcher (3 recommendations per task)
- Basic cost tracking (last 30 days, up to 50 logged tasks)
- Offline model database (refreshed monthly)
- 5 task templates

**Goal:** Get users hooked on seeing their potential savings. The free tier must deliver real value but leave them wanting more precision and history.

### Pro Tier: $7.99/month or $59.99/year (25% savings)
**Why this price:** Lower than the original $9.99 to undercut typical SaaS pricing ($10-15/month). Users saving $20-50/month on AI costs will see this as a no-brainer ROI.

**Pro Features:**
- Unlimited model recommendations with detailed comparison charts
- Full cost tracking history (unlimited tasks, exportable CSV)
- Advanced filters (sort by speed, quality, carbon footprint)
- API integration (auto-import usage from OpenAI, Anthropic via API keys)
- Custom task templates (save your own)
- Weekly cost reports via email
- Priority model database updates (daily pricing sync)
- "What-if" scenarios (e.g., "What if I switched all my GPT-4 tasks to Claude Sonnet?")

### One-Time Purchase: AI Efficiency Audit ($29.99, not $49.99)
**What:** Upload a month of your AI API logs, get a detailed report with:
- Total spend breakdown by model and task
- Specific recommendations for cheaper alternatives
- Projected annual savings
- Custom optimization roadmap

**Why people buy:** One-time deep dive for power users or businesses evaluating AI costs. Lower price point ($29.99) makes it an impulse buy.

### What Makes People STAY Subscribed?
1. **Habit formation:** Weekly reports create a ritual ("Check my AI savings every Monday")
2. **Increasing savings:** As users optimize, they see cumulative savings grow (gamification)
3. **API integration:** Once connected, manual tracking feels like a chore
4. **Fear of loss:** Losing historical data and custom templates creates switching costs

## 7. Market Viability

**NOT SATURATED.** 

No direct competitors exist. Adjacent tools:
- **OpenAI Playground, Anthropic Console:** Focus on experimentation, not cost optimization
- **LangChain, LlamaIndex:** Developer tools, not end-user apps
- **Personal finance apps (Mint, YNAB):** Don't understand AI-specific cost structures

**Clear gap:** AI cost management is a new category. Early mover advantage is massive as AI adoption accelerates and prices fluctuate.

## 8. File Structure

```
modelmiser/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Home: Smart Model Matcher
│   │   ├── tracker.tsx            # Cost Tracker
│   │   ├── templates.tsx          # Task Templates
│   │   └── settings.tsx           # Settings & Pro upgrade
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ModelCard.tsx              # Display model recommendation
│   ├── CostChart.tsx              # Visualize spending
│   ├── TaskTemplateCard.tsx      # Template selection
│   ├── BudgetAlert.tsx            # Alert component
│   └── ProUpgradeModal.tsx        # Paywall UI
├── services/
│   ├── database.ts                # SQLite setup & queries
│   ├── modelService.ts            # Model matching logic
│   ├── costCalculator.ts          # Cost estimation algorithms
│   └── apiClient.ts               # External API calls (pricing updates)
├── types/
│   ├── models.ts                  # Model, Task, Usage types
│   └── index.ts
├── constants/
│   ├── models.json                # Pre-loaded model database
│   └── templates.json             # Task templates
├── hooks/
│   ├── useDatabase.ts             # Database operations hook
│   └── useCostTracking.ts         # Cost tracking logic
├── __tests__/
│   ├── modelService.test.ts
│   ├── costCalculator.test.ts
│   ├── database.test.ts
│   └── components/
│       ├── ModelCard.test.tsx
│       └── CostChart.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### Core Logic Tests

**`__tests__/modelService.test.ts`**
```typescript
import { matchModelsForTask, rankByEfficiency } from '../services/modelService';
import { TaskType } from '../types/models';

describe('Model Service', () => {
  test('matches models for text generation task', () => {
    const task = {
      description: 'Write a blog post',
      type: TaskType.TEXT_GENERATION,
      estimatedTokens: 1000
    };
    const matches = matchModelsForTask(task);
    expect(matches).toHaveLength(3);
    expect(matches[0].costEstimate).toBeLessThan(matches[2].costEstimate);
  });

  test('ranks models by cost-effectiveness', () => {
    const models = [
      { id: 'gpt-4', cost: 0.03, qualityScore: 95 },
      { id: 'gpt-3.5', cost: 0.002, qualityScore: 85 },
      { id: 'claude-sonnet', cost: 0.015, qualityScore: 90 }
    ];
    const ranked = rankByEfficiency(models);
    expect(ranked[0].id).toBe('gpt-3.5'); // Best value
  });
});
```

**`__tests__/costCalculator.test.ts`**
```typescript
import { calculateCost, estimateTokens, projectMonthlyCost } from '../services/costCalculator';

describe('Cost Calculator', () => {
  test('calculates cost for GPT-4 correctly', () => {
    const cost = calculateCost('gpt-4', 1000, 500);
    expect(cost).toBeCloseTo(0.045); // $0.03/1k input + $0.06/1k output
  });

  test('estimates tokens from text length', () => {
    const text = 'This is a test prompt with about twenty words in it for estimation purposes.';
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(15);
    expect(tokens).toBeLessThan(30);
  });

  test('projects monthly cost from usage history', () => {
    const history = [
      { date: '2026-03-01', cost: 5.50 },
      { date: '2026-03-08', cost: 6.20 },
      { date: '2026-03-15', cost: 4.80 }
    ];
    const projection = projectMonthlyCost(history);
    expect(projection).toBeGreaterThan(20);
  });
});
```

**`__tests__/database.test.ts`**
```typescript
import { initDatabase, logUsage, getMonthlyTotal } from '../services/database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('logs usage entry', async () => {
    const entry = {
      modelId: 'gpt-3.5-turbo',
      taskType: 'text_generation',
      cost: 0.002,
      tokens: 1000,
      timestamp: Date.now()
    };
    const id = await logUsage(entry);
    expect(id).toBeGreaterThan(0);
  });

  test('calculates monthly total', async () => {
    await logUsage({ modelId: 'gpt-4', cost: 5.00, timestamp: Date.now() });
    await logUsage({ modelId: 'claude', cost: 3.50, timestamp: Date.now() });
    const total = await getMonthlyTotal();
    expect(total).toBe(8.50);
  });
});
```

**`__tests__/components/ModelCard.test.tsx`**
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import ModelCard from '../../components/ModelCard';

describe('ModelCard Component', () => {
  test('renders model information correctly', () => {
    const model = {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      costEstimate: 0.002,
      qualityScore: 85,
      speed: 'fast'
    };
    const { getByText } = render(<ModelCard model={model} />);
    expect(getByText('GPT-3.5 Turbo')).toBeTruthy();
    expect(getByText('$0.002')).toBeTruthy();
  });
});
```

## 10. Implementation Steps

### Step 1: Project Setup
```bash
npx create-expo-app modelmiser --template tabs
cd modelmiser
npm install expo-sqlite expo-router react-native-paper axios react-native-chart-kit
npm install --save-dev @types/react @types/react-native jest @testing-library/react-native
```

### Step 2: Configure TypeScript
Create `tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Step 3: Define Types
Create `types/models.ts`:
```typescript
export enum TaskType {
  TEXT_GENERATION = 'text_generation',
  CODE_GENERATION = 'code_generation',
  IMAGE_GENERATION = 'image_generation',
  CHAT = 'chat',
  SUMMARIZATION = 'summarization'
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  qualityScore: number;
  speedRating: 'slow' | 'medium' | 'fast';
  capabilities: TaskType[];
  contextWindow: number;
}

export interface Task {
  description: string;
  type: TaskType;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
}

export interface ModelRecommendation {
  model: AIModel;
  costEstimate: number;
  efficiencyScore: number;
  reasoning: string;
}

export interface UsageEntry {
  id?: number;
  modelId: string;
  taskType: TaskType;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
}
```

### Step 4: Create Model Database
Create `constants/models.json`:
```json
[
  {
    "id": "gpt-4-turbo",
    "name": "GPT-4 Turbo",
    "provider": "OpenAI",
    "inputCostPer1k": 0.01,
    "outputCostPer1k": 0.03,
    "qualityScore": 95,
    "speedRating": "medium",
    "capabilities": ["text_generation", "code_generation", "chat", "summarization"],
    "contextWindow": 128000
  },
  {
    "id": "gpt-3.5-turbo",
    "name": "GPT-3.5 Turbo",
    "provider": "OpenAI",
    "inputCostPer1k": 0.0005,
    "outputCostPer1k": 0.0015,
    "qualityScore": 80,
    "speedRating": "fast",
    "capabilities": ["text_generation", "code_generation", "chat", "summarization"],
    "contextWindow": 16385
  },
  {
    "id": "claude-3-opus",
    "name": "Claude 3 Opus",
    "provider": "Anthropic",
    "inputCostPer1k": 0.015,
    "outputCostPer1k": 0.075,
    "qualityScore": 98,
    "speedRating": "slow",
    "capabilities": ["text_generation", "code_generation", "chat", "summarization"],
    "contextWindow": 200000
  },
  {
    "id": "claude-3-sonnet",
    "name": "Claude 3 Sonnet",
    "provider": "Anthropic",
    "inputCostPer1k": 0.003,
    "outputCostPer1k": 0.015,
    "qualityScore": 90,
    "speedRating": "medium",
    "capabilities": ["text_generation", "code_generation", "chat", "summarization"],
    "contextWindow": 200000
  },
  {
    "id": "gemini-pro",
    "name": "Gemini Pro",
    "provider": "Google",
    "inputCostPer1k": 0.00025,
    "outputCostPer1k": 0.0005,
    "qualityScore": 82,
    "speedRating": "fast",
    "capabilities": ["text_generation", "chat", "summarization"],
    "contextWindow": 32000
  }
]
```

### Step 5: Implement Database Service
Create `services/database.ts`:
```typescript
import * as SQLite from 'expo-sqlite';
import { UsageEntry } from '../types/models';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('modelmiser.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modelId TEXT NOT NULL,
      taskType TEXT NOT NULL,
      inputTokens INTEGER NOT NULL,
      outputTokens INTEGER NOT NULL,
      cost REAL NOT NULL,
      timestamp INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_timestamp ON usage(timestamp);
  `);
}

export async function logUsage(entry: UsageEntry): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO usage (modelId, taskType, inputTokens, outputTokens, cost, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    entry.modelId,
    entry.taskType,
    entry.inputTokens,
    entry.outputTokens,
    entry.cost,
    entry.timestamp
  );
  return result.lastInsertRowId;
}

export async function getMonthlyTotal(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(cost) as total FROM usage WHERE timestamp >= ?',
    startOfMonth.getTime()
  );
  
  return result?.total || 0;
}

export async function getUsageHistory(limit: number = 50): Promise<UsageEntry[]> {
  const rows = await db.getAllAsync<UsageEntry>(
    'SELECT * FROM usage ORDER BY timestamp DESC LIMIT ?',
    limit
  );
  return rows;
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key
  );
  return result?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}
```

### Step 6: Implement Cost Calculator
Create `services/costCalculator.ts`:
```typescript
import { AIModel } from '../types/models';

export function calculateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * model.outputCostPer1k;
  return inputCost + outputCost;
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

export function projectMonthlyCost(history: Array<{ date: string; cost: number }>): number {
  if (history.length === 0) return 0;
  
  const totalCost = history.reduce((sum, entry) => sum + entry.cost, 0);
  const daysTracked = history.length;
  const avgDailyCost = totalCost / daysTracked;
  
  return avgDailyCost * 30;
}

export function calculateSavings(
  currentModel: AIModel,
  alternativeModel: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const currentCost = calculateCost(currentModel, inputTokens, outputTokens);
  const alternativeCost = calculateCost(alternativeModel, inputTokens, outputTokens);
  return currentCost - alternativeCost;
}
```

### Step 7: Implement Model Service
Create `services/modelService.ts`:
```typescript
import { AIModel, Task, ModelRecommendation, TaskType } from '../types/models';
import modelsData from '../constants/models.json';
import { calculateCost } from './costCalculator';

const models: AIModel[] = modelsData as AIModel[];

export function matchModelsForTask(task: Task): ModelRecommendation[] {
  const compatibleModels = models.filter(model =>
    model.capabilities.includes(task.type)
  );
  
  const recommendations = compatibleModels.map(model => {
    const costEstimate = calculateCost(
      model,
      task.estimatedInputTokens,
      task.estimatedOutputTokens
    );
    
    // Efficiency score: balance of quality and cost
    const efficiencyScore = (model.qualityScore / 100) / (costEstimate * 100);
    
    let reasoning = `${model.name} offers `;
    if (model.qualityScore >= 90) {
      reasoning += 'excellent quality';
    } else if (model.qualityScore >= 80) {
      reasoning += 'good quality';
    } else {
      reasoning += 'decent quality';
    }
    reasoning += ` at $${costEstimate.toFixed(4)} per task.`;
    
    return {
      model,
      costEstimate,
      efficiencyScore,
      reasoning
    };
  });
  
  return rankByEfficiency(recommendations).slice(0, 3);
}

export function rankByEfficiency(recommendations: ModelRecommendation[]): ModelRecommendation[] {
  return recommendations.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

export function getModelById(id: string): AIModel | undefined {
  return models.find(model => model.id === id);
}

export function getAllModels(): AIModel[] {
  return models;
}
```

### Step 8: Create UI Components
Create `components/ModelCard.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { ModelRecommendation } from '../types/models';

interface Props {
  recommendation: ModelRecommendation;
  rank: number;
}

export default function ModelCard({ recommendation, rank }: Props) {
  const { model, costEstimate, reasoning } = recommendation;
  
  const getBadgeColor = () => {
    if (rank === 1) return '#4CAF50';
    if (rank === 2) return '#2196F3';
    return '#FF9800';
  };
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text variant="titleMedium" style={styles.modelName}>
              {model.name}
            </Text>
            <Chip
              style={[styles.badge, { backgroundColor: getBadgeColor() }]}
              textStyle={styles.badgeText}
            >
              #{rank}
            </Chip>
          </View>
          <Text variant="bodySmall" style={styles.provider}>
            {model.provider}
          </Text>
        </View>
        
        <View style={styles.costRow}>
          <Text variant="headlineSmall" style={styles.cost}>
            ${costEstimate.toFixed(4)}
          </Text>
          <Text variant="bodySmall" style={styles.perTask}>
            per task
          </Text>
        </View>
        
        <Text variant="bodyMedium" style={styles.reasoning}>
          {reasoning}
        </Text>
        
        <View style={styles.specs}>
          <Chip icon="speedometer" style={styles.specChip}>
            {model.speedRating}
          </Chip>
          <Chip icon="star" style={styles.specChip}>
            Quality: {model.qualityScore}/100
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modelName: {
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  provider: {
    color: '#666',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cost: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 4,
  },
  perTask: {
    color: '#666',
  },
  reasoning: {
    marginBottom: 12,
    lineHeight: 20,
  },
  specs: {
    flexDirection: 'row',
    gap: 8,
  },
  specChip: {
    height: 28,
  },
});
```

Create `components/CostChart.tsx`:
```typescript
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text } from 'react-native-paper';

interface Props {
  data: Array<{ date: string; cost: number }>;
}

export default function CostChart({ data }: Props) {
  const screenWidth = Dimensions.get('window').width;
  
  const chartData = {
    labels: data.map(d => new Date(d.date).getDate().toString()),
    datasets: [{
      data: data.map(d => d.cost),
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
    }],
  };
  
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };
  
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge">No usage data yet</Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Start logging your AI usage to see cost trends
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Daily Spending
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#666',
  },
});
```

### Step 9: Implement Main Screens
Create `app/(tabs)/index.tsx`:
```typescript
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { TaskType } from '../../types/models';
import { matchModelsForTask } from '../../services/modelService';
import { estimateTokens } from '../../services/costCalculator';
import ModelCard from '../../components/ModelCard';

export default function HomeScreen() {
  const [taskDescription, setTaskDescription] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleFindModels = () => {
    if (!taskDescription.trim()) return;
    
    setLoading(true);
    
    // Simple task type detection
    let taskType = TaskType.TEXT_GENERATION;
    if (taskDescription.toLowerCase().includes('code')) {
      taskType = TaskType.CODE_GENERATION;
    } else if (taskDescription.toLowerCase().includes('summarize')) {
      taskType = TaskType.SUMMARIZATION;
    }
    
    const estimatedTokens = estimateTokens(taskDescription);
    
    const task = {
      description: taskDescription,
      type: taskType,
      estimatedInputTokens: estimatedTokens,
      estimatedOutputTokens: estimatedTokens * 2, // Assume output is 2x input
    };
    
    const matches = matchModelsForTask(task);
    setRecommendations(matches);
    setLoading(false);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Smart Model Matcher
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Describe your task and we'll find the best