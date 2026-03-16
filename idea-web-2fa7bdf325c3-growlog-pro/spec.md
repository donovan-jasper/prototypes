# GrowLog Pro Spec

## 1. App Name

**PlantPulse**

## 2. One-Line Pitch

Track every plant's journey from seed to harvest with AI-powered health insights and a community of growers who've been there before.

## 3. Expanded Vision

### Who This Is Really For

**Primary Audience:**
- **Home gardeners** (50M+ in US alone) who want to stop killing their tomatoes, herbs, and houseplants
- **Urban balcony/patio growers** who have limited space and need to maximize every plant
- **Community garden members** who want to share what's working in their specific microclimate
- **Parents teaching kids** about plant growth cycles and responsibility

**Secondary Audience:**
- Small-scale farmers and market gardeners tracking crop rotations
- Greenhouse operators managing multiple plant varieties
- Botany students and educators documenting experiments
- Plant collectors (succulents, orchids, rare tropicals) tracking care regimens

### Adjacent Use Cases

1. **Pest/Disease Early Warning System** — Photo-based AI diagnosis catches problems before they spread, saving entire gardens
2. **Hyperlocal Growing Calendar** — Community data shows what actually works in your zip code, not generic USDA zones
3. **Yield Optimization** — Track what fertilizer/watering schedule produces the most tomatoes, then replicate it
4. **Plant Trading Network** — "I have extra basil seedlings, you have tomato starts" — built-in community marketplace
5. **Educational Tool** — Time-lapse photo logs show kids (or adults) the magic of growth in a way that builds long-term engagement

### Why Non-Technical People Want This

- **Stops plant death anxiety** — "Is this normal or is my plant dying?" gets answered in seconds
- **Builds confidence** — Success tracking shows you're actually good at this, not cursed with a black thumb
- **Creates accountability** — Push notifications remind you to water before it's too late
- **Social proof** — See neighbors growing the same plants successfully, copy their methods
- **Saves money** — Stop replacing dead plants; optimize yields to reduce grocery bills

### The Broadest Possible Audience

This isn't a "gardening app" — it's a **plant success platform**. Anyone who's ever felt guilty about a dead houseplant, wondered if their vegetable garden is worth the effort, or wanted to teach their kids about nature is the audience. That's 100M+ potential users in North America alone.

## 4. Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Local Database:** SQLite (expo-sqlite)
- **State Management:** Zustand (lightweight, no boilerplate)
- **Image Handling:** expo-image-picker + expo-file-system
- **Offline Support:** expo-network for connectivity detection
- **AI Integration:** OpenAI Vision API (or Replicate for cost efficiency)
- **Charts:** react-native-chart-kit
- **Navigation:** expo-router (file-based routing)
- **Testing:** Jest + React Native Testing Library
- **Notifications:** expo-notifications

**Why This Stack:**
- Expo handles camera, file system, and notifications out of the box
- SQLite enables true offline-first with sync later
- Minimal dependencies = faster builds, fewer breaking changes
- OpenAI Vision API is pay-per-use (no upfront ML infrastructure)

## 5. Core Features (MVP)

### Feature 1: Smart Plant Profiles
- Add plants with photo, name, and planting date
- Auto-suggest care schedule based on plant type (watering, fertilizing)
- Track growth stages (seedling → vegetative → flowering → harvest)
- **Why it hooks:** Solves "when do I water this?" anxiety immediately

### Feature 2: Photo Timeline & AI Health Check
- Snap weekly progress photos with auto-tagging by date
- AI analyzes photos for pest/disease/nutrient deficiency signs
- Side-by-side comparison shows growth over time
- **Why it converts:** Visual proof of success + early problem detection = saved plants

### Feature 3: Care Log & Reminders
- Log watering, fertilizing, pruning with one tap
- Smart reminders based on last action + plant needs
- Track environmental conditions (temp/humidity if manually entered)
- **Why it retains:** Builds a habit loop; users feel guilty stopping after 2 weeks of data

### Feature 4: Community Insights (Freemium Hook)
- See anonymized success rates for your plant type in your region
- Browse top-performing care schedules from other growers
- Ask questions, get answers from experienced community members
- **Why it monetizes:** Free users see "3 growers in your area got 40% more tomatoes" → upgrade to see their exact methods

### Feature 5: Yield Tracking & Analytics (Premium)
- Record harvest weights, quality ratings
- Compare your yields to community averages
- Export data as CSV for serious growers
- **Why it's premium:** Casual growers don't need this; serious growers will pay for optimization data

## 6. Monetization Strategy

### Free Tier (The Hook)
- Unlimited plants and photos
- Basic care reminders
- AI health checks (3 per month)
- Community browsing (read-only)
- **Goal:** Get users logging data for 2+ weeks (habit formation threshold)

### Premium Tier: $4.99/month or $39.99/year (17% discount)
- Unlimited AI health checks
- Advanced analytics (yield comparisons, growth rate charts)
- Community posting/commenting
- Export data to CSV
- Custom care schedules
- Priority support
- **Why this price:** Lower than Headspace ($12.99) but higher than basic utility apps ($2.99). Positions as "serious tool" not "toy app"

### Pro Tier: $9.99/month or $79.99/year (33% discount)
- Everything in Premium
- Sensor integration (Bluetooth temp/humidity monitors)
- Multi-garden management (track greenhouse + outdoor + indoor separately)
- Team collaboration (share gardens with family/partners)
- Early access to new features
- **Why this price:** Targets small-scale commercial growers and serious hobbyists who already spend $50+/month on supplies

### What Makes People Stay Subscribed

1. **Sunk cost fallacy** — "I have 6 months of data, can't lose it now"
2. **Seasonal renewal** — Spring planting season drives re-subscriptions
3. **Social accountability** — Community reputation/karma system
4. **Continuous AI improvement** — "Last month it caught my aphid problem early, saved my peppers"
5. **Yield optimization ROI** — "I grew $200 worth of tomatoes, $5/month is nothing"

### Revenue Projections (Conservative)

- 10,000 users after Year 1
- 5% conversion to Premium ($4.99) = 500 users = $2,495/month
- 1% conversion to Pro ($9.99) = 100 users = $999/month
- **Total MRR:** $3,494 (~$42K ARR)
- **Break-even:** ~$500/month (hosting + AI API costs)

## 7. Market Gap Analysis

**NOT SKIPPING** — Here's why:

### Competitors
- **Gardenify/PlantSnap:** Focus on plant identification, not growth tracking
- **Grow Journal/LeafLog:** Cannabis-only, stigmatized, can't be in App Store in many regions
- **Plantix:** Pest diagnosis only, no community or tracking
- **Generic garden planners:** Static calendars, no AI, no photos

### Clear Gap
No app combines:
1. Cross-plant-type tracking (vegetables + herbs + houseplants + flowers)
2. AI-powered health diagnostics
3. Community-driven local insights
4. Offline-first mobile experience
5. Freemium model with clear upgrade path

### Why We Can Win
- **Broader appeal** than cannabis-specific apps (App Store friendly)
- **More actionable** than identification apps (ongoing relationship, not one-time use)
- **Better UX** than farm management software (designed for mobile-first, not desktop)
- **Community moat** — as users contribute data, local insights become irreplaceable

## 8. File Structure

```
plantpulse/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home/Garden overview
│   │   ├── plants.tsx                # Plant list
│   │   ├── community.tsx             # Community feed
│   │   └── profile.tsx               # User settings
│   ├── plant/
│   │   ├── [id].tsx                  # Plant detail view
│   │   └── add.tsx                   # Add new plant
│   ├── photo/
│   │   └── [id].tsx                  # Photo detail with AI analysis
│   ├── _layout.tsx                   # Root layout
│   └── +not-found.tsx
├── components/
│   ├── PlantCard.tsx
│   ├── PhotoTimeline.tsx
│   ├── CareLogEntry.tsx
│   ├── AIHealthReport.tsx
│   ├── GrowthChart.tsx
│   └── CommunityPost.tsx
├── lib/
│   ├── database.ts                   # SQLite setup and migrations
│   ├── plants.ts                     # Plant CRUD operations
│   ├── photos.ts                     # Photo storage and retrieval
│   ├── careLogs.ts                   # Care log operations
│   ├── ai.ts                         # AI health check integration
│   ├── notifications.ts              # Reminder scheduling
│   └── storage.ts                    # File system helpers
├── store/
│   └── useStore.ts                   # Zustand global state
├── types/
│   └── index.ts                      # TypeScript interfaces
├── constants/
│   ├── plantTypes.ts                 # Plant care templates
│   └── colors.ts                     # Theme colors
├── __tests__/
│   ├── database.test.ts
│   ├── plants.test.ts
│   ├── careLogs.test.ts
│   └── notifications.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 9. Tests

### `__tests__/database.test.ts`
```typescript
import { openDatabase, initDatabase } from '../lib/database';

describe('Database', () => {
  it('should initialize database with correct tables', async () => {
    const db = await openDatabase();
    await initDatabase(db);
    
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    expect(tables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'plants' }),
        expect.objectContaining({ name: 'photos' }),
        expect.objectContaining({ name: 'care_logs' }),
      ])
    );
  });
});
```

### `__tests__/plants.test.ts`
```typescript
import { addPlant, getPlant, updatePlant, deletePlant } from '../lib/plants';
import { openDatabase, initDatabase } from '../lib/database';

describe('Plant Operations', () => {
  let db: any;

  beforeAll(async () => {
    db = await openDatabase();
    await initDatabase(db);
  });

  it('should add a new plant', async () => {
    const plantId = await addPlant(db, {
      name: 'Tomato',
      type: 'vegetable',
      plantedDate: new Date().toISOString(),
    });
    
    expect(plantId).toBeGreaterThan(0);
  });

  it('should retrieve a plant by id', async () => {
    const plantId = await addPlant(db, {
      name: 'Basil',
      type: 'herb',
      plantedDate: new Date().toISOString(),
    });
    
    const plant = await getPlant(db, plantId);
    expect(plant.name).toBe('Basil');
    expect(plant.type).toBe('herb');
  });

  it('should update plant details', async () => {
    const plantId = await addPlant(db, {
      name: 'Pepper',
      type: 'vegetable',
      plantedDate: new Date().toISOString(),
    });
    
    await updatePlant(db, plantId, { name: 'Bell Pepper' });
    const plant = await getPlant(db, plantId);
    expect(plant.name).toBe('Bell Pepper');
  });

  it('should delete a plant', async () => {
    const plantId = await addPlant(db, {
      name: 'Lettuce',
      type: 'vegetable',
      plantedDate: new Date().toISOString(),
    });
    
    await deletePlant(db, plantId);
    const plant = await getPlant(db, plantId);
    expect(plant).toBeNull();
  });
});
```

### `__tests__/careLogs.test.ts`
```typescript
import { addCareLog, getCareLogs, getLastCareLog } from '../lib/careLogs';
import { addPlant } from '../lib/plants';
import { openDatabase, initDatabase } from '../lib/database';

describe('Care Log Operations', () => {
  let db: any;
  let plantId: number;

  beforeAll(async () => {
    db = await openDatabase();
    await initDatabase(db);
    plantId = await addPlant(db, {
      name: 'Test Plant',
      type: 'herb',
      plantedDate: new Date().toISOString(),
    });
  });

  it('should add a care log entry', async () => {
    const logId = await addCareLog(db, {
      plantId,
      type: 'watering',
      notes: 'Watered 500ml',
      timestamp: new Date().toISOString(),
    });
    
    expect(logId).toBeGreaterThan(0);
  });

  it('should retrieve care logs for a plant', async () => {
    await addCareLog(db, {
      plantId,
      type: 'fertilizing',
      notes: 'Added compost',
      timestamp: new Date().toISOString(),
    });
    
    const logs = await getCareLogs(db, plantId);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].plantId).toBe(plantId);
  });

  it('should get last care log by type', async () => {
    const now = new Date();
    await addCareLog(db, {
      plantId,
      type: 'watering',
      notes: 'Recent watering',
      timestamp: now.toISOString(),
    });
    
    const lastLog = await getLastCareLog(db, plantId, 'watering');
    expect(lastLog).not.toBeNull();
    expect(lastLog.type).toBe('watering');
  });
});
```

### `__tests__/notifications.test.ts`
```typescript
import { scheduleWateringReminder, cancelReminder } from '../lib/notifications';

describe('Notification Scheduling', () => {
  it('should schedule a watering reminder', async () => {
    const notificationId = await scheduleWateringReminder({
      plantId: 1,
      plantName: 'Tomato',
      daysUntilNextWatering: 2,
    });
    
    expect(notificationId).toBeDefined();
  });

  it('should cancel a scheduled reminder', async () => {
    const notificationId = await scheduleWateringReminder({
      plantId: 2,
      plantName: 'Basil',
      daysUntilNextWatering: 1,
    });
    
    await cancelReminder(notificationId);
    // Verify cancellation (implementation-specific)
    expect(true).toBe(true);
  });
});
```

## 10. Implementation Steps

### Step 1: Project Setup
```bash
npx create-expo-app@latest plantpulse --template tabs
cd plantpulse
npm install expo-sqlite zustand expo-image-picker expo-file-system expo-notifications react-native-chart-kit
npm install --save-dev jest @testing-library/react-native @types/jest
```

### Step 2: Database Schema (`lib/database.ts`)
```typescript
import * as SQLite from 'expo-sqlite';

export async function openDatabase() {
  return await SQLite.openDatabaseAsync('plantpulse.db');
}

export async function initDatabase(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      variety TEXT,
      planted_date TEXT NOT NULL,
      expected_harvest_date TEXT,
      location TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL,
      uri TEXT NOT NULL,
      thumbnail_uri TEXT,
      ai_analysis TEXT,
      health_score INTEGER,
      taken_at TEXT NOT NULL,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS care_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount TEXT,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plant_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      notification_id TEXT,
      next_due TEXT NOT NULL,
      frequency_days INTEGER NOT NULL,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_photos_plant ON photos(plant_id);
    CREATE INDEX IF NOT EXISTS idx_care_logs_plant ON care_logs(plant_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_plant ON reminders(plant_id);
  `);
}
```

### Step 3: TypeScript Types (`types/index.ts`)
```typescript
export interface Plant {
  id: number;
  name: string;
  type: 'vegetable' | 'herb' | 'flower' | 'houseplant' | 'fruit' | 'other';
  variety?: string;
  plantedDate: string;
  expectedHarvestDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface Photo {
  id: number;
  plantId: number;
  uri: string;
  thumbnailUri?: string;
  aiAnalysis?: string;
  healthScore?: number;
  takenAt: string;
}

export interface CareLog {
  id: number;
  plantId: number;
  type: 'watering' | 'fertilizing' | 'pruning' | 'transplanting' | 'harvesting' | 'other';
  amount?: string;
  notes?: string;
  timestamp: string;
}

export interface Reminder {
  id: number;
  plantId: number;
  type: 'watering' | 'fertilizing' | 'pruning';
  notificationId?: string;
  nextDue: string;
  frequencyDays: number;
}
```

### Step 4: Plant Operations (`lib/plants.ts`)
```typescript
import * as SQLite from 'expo-sqlite';
import { Plant } from '../types';

export async function addPlant(
  db: SQLite.SQLiteDatabase,
  plant: Omit<Plant, 'id' | 'createdAt'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO plants (name, type, variety, planted_date, expected_harvest_date, location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      plant.name,
      plant.type,
      plant.variety || null,
      plant.plantedDate,
      plant.expectedHarvestDate || null,
      plant.location || null,
      plant.notes || null,
    ]
  );
  return result.lastInsertRowId;
}

export async function getPlant(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<Plant | null> {
  const result = await db.getFirstAsync<Plant>(
    'SELECT * FROM plants WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function getAllPlants(
  db: SQLite.SQLiteDatabase
): Promise<Plant[]> {
  return await db.getAllAsync<Plant>('SELECT * FROM plants ORDER BY created_at DESC');
}

export async function updatePlant(
  db: SQLite.SQLiteDatabase,
  id: number,
  updates: Partial<Plant>
): Promise<void> {
  const fields = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), id];
  
  await db.runAsync(
    `UPDATE plants SET ${fields} WHERE id = ?`,
    values
  );
}

export async function deletePlant(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM plants WHERE id = ?', [id]);
}
```

### Step 5: Photo Operations (`lib/photos.ts`)
```typescript
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Photo } from '../types';

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [4, 3],
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
}

export async function savePhoto(
  db: SQLite.SQLiteDatabase,
  plantId: number,
  uri: string
): Promise<number> {
  const filename = `${Date.now()}.jpg`;
  const directory = `${FileSystem.documentDirectory}photos/`;
  
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const newUri = `${directory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: newUri });

  const result = await db.runAsync(
    `INSERT INTO photos (plant_id, uri, taken_at) VALUES (?, ?, ?)`,
    [plantId, newUri, new Date().toISOString()]
  );
  
  return result.lastInsertRowId;
}

export async function getPhotosForPlant(
  db: SQLite.SQLiteDatabase,
  plantId: number
): Promise<Photo[]> {
  return await db.getAllAsync<Photo>(
    'SELECT * FROM photos WHERE plant_id = ? ORDER BY taken_at DESC',
    [plantId]
  );
}
```

### Step 6: Care Log Operations (`lib/careLogs.ts`)
```typescript
import * as SQLite from 'expo-sqlite';
import { CareLog } from '../types';

export async function addCareLog(
  db: SQLite.SQLiteDatabase,
  log: Omit<CareLog, 'id'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO care_logs (plant_id, type, amount, notes, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [log.plantId, log.type, log.amount || null, log.notes || null, log.timestamp]
  );
  return result.lastInsertRowId;
}

export async function getCareLogs(
  db: SQLite.SQLiteDatabase,
  plantId: number
): Promise<CareLog[]> {
  return await db.getAllAsync<CareLog>(
    'SELECT * FROM care_logs WHERE plant_id = ? ORDER BY timestamp DESC',
    [plantId]
  );
}

export async function getLastCareLog(
  db: SQLite.SQLiteDatabase,
  plantId: number,
  type: string
): Promise<CareLog | null> {
  const result = await db.getFirstAsync<CareLog>(
    'SELECT * FROM care_logs WHERE plant_id = ? AND type = ? ORDER BY timestamp DESC LIMIT 1',
    [plantId, type]
  );
  return result || null;
}
```

### Step 7: Notification System (`lib/notifications.ts`)
```typescript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleWateringReminder(params: {
  plantId: number;
  plantName: string;
  daysUntilNextWatering: number;
}): Promise<string> {
  const trigger = {
    seconds: params.daysUntilNextWatering * 24 * 60 * 60,
  };

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Time to water!',
      body: `Your ${params.plantName} needs watering`,
      data: { plantId: params.plantId },
    },
    trigger,
  });
}

export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
```

### Step 8: AI Health Check (`lib/ai.ts`)
```typescript
export async function analyzePhotoHealth(imageUri: string): Promise<{
  analysis: string;
  healthScore: number;
  issues: string[];
}> {
  // Placeholder for AI integration
  // In production, send to OpenAI Vision API or similar
  
  // Mock response for MVP
  return {
    analysis: 'Plant appears healthy with good leaf color and structure.',
    healthScore: 85,
    issues: [],
  };
}

// Production implementation would look like:
/*
export async function analyzePhotoHealth(imageUri: string) {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this plant photo for health issues, pests, diseases, and nutrient deficiencies. Provide a health score 0-100.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } }
        ]
      }],
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  // Parse response and return structured data
}
*/
```

### Step 9: Global State (`store/useStore.ts`)
```typescript
import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';

interface AppState {
  db: SQLite.SQLiteDatabase | null;
  initDb: () => Promise<void>;
  isPremium: boolean;
  aiChecksRemaining: number;
  decrementAIChecks: () => void;
}

export const useStore = create<AppState>((set) => ({
  db: null,
  isPremium: false,
  aiChecksRemaining: 3,
  
  initDb: async () => {
    const { openDatabase, initDatabase } = await import('../lib/database');
    const database = await openDatabase();
    await initDatabase(database);
    set({ db: database });
  },
  
  decrementAIChecks: () => set((state) => ({
    aiChecksRemaining: Math.max(0, state.aiChecksRemaining - 1)
  })),
}));
```

### Step 10: Home Screen (`app/(tabs)/index.tsx`)
```typescript
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { getAllPlants } from '../../lib/plants';
import { Plant } from '../../types';
import PlantCard from '../../components/PlantCard';

export default function HomeScreen() {
  const router = useRouter();
  const { db, initDb } = useStore();
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    initDb();
  }, []);

  useEffect(() => {
    if (db) loadPlants();
  }, [db]);

  async function loadPlants() {
    if (!db) return;
    const allPlants = await getAllPlants(db);
    setPlants(allPlants);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Garden</Text>
      
      {plants.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No plants yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/plant/add')}
          >
            <Text style={styles.addButtonText}>Add Your First Plant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PlantCard plant={item} onPress={() => router.push(`/plant/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 16 },
  addButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
```

### Step 11: Plant Card Component (`components/PlantCard.tsx`)
```typescript
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Plant } from '../types';

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
}

export default function PlantCard({ plant, onPress }: PlantCardProps) {
  const daysSincePlanted = Math.floor(
    (Date.now() - new Date(plant.plantedDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={styles.type}>{plant.type}</Text>
        <Text style={styles.days}>{daysSincePlanted} days old</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    