# ParentCircle

## One-line pitch
Find trusted parents nearby to share childcare, errands, and playdates—instantly.

## Expanded vision

**Core audience:** Parents with children ages 0-12 who need flexible, trustworthy support networks.

**Broadest reach:**
- **Working parents** (dual-income households) who need last-minute backup when daycare closes early or a child is sick
- **Single parents** seeking emotional support and practical help without judgment
- **Stay-at-home parents** combating isolation and seeking adult interaction
- **New parents** who moved cities and lack family support nearby
- **Parents of special needs children** who need vetted caregivers familiar with specific requirements
- **Grandparents raising grandchildren** seeking peer support
- **Foster/adoptive parents** building community with others who understand their journey

**Adjacent use cases:**
- Carpooling to school/activities (reduces traffic, saves time)
- Bulk grocery/errand runs (one parent shops for 3 families)
- Skill swaps (tutoring, music lessons, sports coaching between families)
- Emergency contacts (verified neighbors who can help in crisis)
- Social events (adult game nights, book clubs while kids play)
- Hand-me-down exchanges (clothes, toys, gear)

**Why non-technical people want this:**
Parenting is exhausting and lonely. This isn't about "finding a babysitter"—it's about building a village when you don't have one. It replaces awkward neighborhood Facebook groups with a purpose-built tool that respects your time, verifies safety, and makes coordination effortless. The app does the heavy lifting (matching, scheduling, reminders) so parents can focus on connection.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based)
- **Local storage:** SQLite (expo-sqlite)
- **Maps:** react-native-maps
- **Auth:** Expo SecureStore for tokens
- **Push notifications:** Expo Notifications
- **Location:** expo-location
- **Image handling:** expo-image-picker
- **Testing:** Jest + React Native Testing Library
- **State:** React Context (keep it simple for MVP)

## Core features

1. **Verified Profiles with Trust Scores**
   - Phone verification + optional ID check
   - Parent reviews/ratings after each interaction
   - Visible trust score (0-100) based on completed exchanges, response time, and reviews
   - Profile shows kids' ages, interests, and parent's availability patterns

2. **Real-time Request Board**
   - Post needs ("Need pickup from soccer 4pm today") with radius filter (0.5-5 miles)
   - Instant push notifications to nearby parents who match criteria
   - One-tap "I can help" with auto-generated chat thread
   - Request expires after time window passes

3. **Recurring Circles**
   - Create private groups (e.g., "Tuesday Playdate Crew" or "School Carpool")
   - Shared calendar for recurring commitments
   - Rotation tracking (who hosted last, who's next)
   - Group chat with photo sharing

4. **Safety Check-ins**
   - Automated "Did [Child] arrive safely?" prompts after scheduled exchanges
   - Emergency contact sharing within active requests
   - In-app incident reporting with 24hr response SLA

5. **Favor Bank**
   - Track who helped whom (not transactional, just visibility)
   - Gentle nudges if balance is heavily one-sided
   - Celebrate milestones ("You've helped 10 families this month!")

## Monetization strategy

**Free tier (hook):**
- Create profile + verify phone
- Join up to 2 Circles
- Post 3 requests per month
- View Request Board (but can only respond to 5/month)
- Basic messaging

**Premium ($9.99/month or $89/year — 25% savings):**
- Unlimited requests + responses
- Join unlimited Circles
- Priority placement in Request Board (shown first to nearby parents)
- Advanced filters (kids' ages, specific needs like "allergy-aware")
- ID verification badge (builds trust faster)
- Ad-free experience
- "Concierge" feature: AI suggests best matches based on past successful exchanges

**Why people stay subscribed:**
- Once you're in 3+ active Circles, downgrading means leaving groups (FOMO)
- Premium users get 3x more responses to requests (data-driven urgency)
- The network effect: as more premium users join, free users feel left out of the "inner circle"
- Annual subscribers get exclusive access to local family events (partnerships with museums, trampoline parks)

**Additional revenue:**
- Sponsored listings from vetted local businesses (daycares, tutors, pediatricians) — $200-500/month per business
- Affiliate fees from background check provider (optional $15 upgrade)

## File structure

```
parent-circle/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Request Board
│   │   ├── circles.tsx            # My Circles
│   │   ├── messages.tsx           # Chat threads
│   │   └── profile.tsx            # User profile
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── request/
│   │   ├── [id].tsx               # Request detail
│   │   └── create.tsx             # New request
│   ├── circle/
│   │   ├── [id].tsx               # Circle detail
│   │   └── create.tsx             # New circle
│   └── _layout.tsx
├── components/
│   ├── RequestCard.tsx
│   ├── ProfileBadge.tsx
│   ├── TrustScore.tsx
│   ├── MapView.tsx
│   └── SafetyCheckIn.tsx
├── lib/
│   ├── db.ts                      # SQLite setup
│   ├── auth.ts                    # Auth helpers
│   ├── location.ts                # Location utils
│   ├── notifications.ts           # Push notification setup
│   └── trustScore.ts              # Trust score calculation
├── hooks/
│   ├── useRequests.ts
│   ├── useCircles.ts
│   ├── useAuth.ts
│   └── useLocation.ts
├── types/
│   └── index.ts
├── __tests__/
│   ├── trustScore.test.ts
│   ├── RequestCard.test.tsx
│   ├── useRequests.test.ts
│   └── db.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**lib/__tests__/trustScore.test.ts**
```typescript
import { calculateTrustScore } from '../trustScore';

describe('Trust Score Calculation', () => {
  it('should return 50 for new users with no activity', () => {
    expect(calculateTrustScore(0, 0, 0)).toBe(50);
  });

  it('should increase score with completed exchanges', () => {
    expect(calculateTrustScore(10, 0, 0)).toBeGreaterThan(50);
  });

  it('should cap score at 100', () => {
    expect(calculateTrustScore(1000, 500, 0)).toBe(100);
  });

  it('should decrease score with negative reviews', () => {
    expect(calculateTrustScore(10, 5, 3)).toBeLessThan(calculateTrustScore(10, 5, 0));
  });
});
```

**components/__tests__/RequestCard.test.tsx**
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import RequestCard from '../RequestCard';

describe('RequestCard', () => {
  const mockRequest = {
    id: '1',
    title: 'Need pickup from school',
    description: 'Soccer practice ends at 4pm',
    distance: 0.8,
    authorName: 'Jane Doe',
    authorTrustScore: 85,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };

  it('should render request title and description', () => {
    const { getByText } = render(<RequestCard request={mockRequest} />);
    expect(getByText('Need pickup from school')).toBeTruthy();
    expect(getByText('Soccer practice ends at 4pm')).toBeTruthy();
  });

  it('should display distance in miles', () => {
    const { getByText } = render(<RequestCard request={mockRequest} />);
    expect(getByText('0.8 mi away')).toBeTruthy();
  });

  it('should show trust score badge', () => {
    const { getByText } = render(<RequestCard request={mockRequest} />);
    expect(getByText('85')).toBeTruthy();
  });
});
```

**hooks/__tests__/useRequests.test.ts**
```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useRequests } from '../useRequests';
import * as db from '../../lib/db';

jest.mock('../../lib/db');

describe('useRequests', () => {
  it('should load requests from database', async () => {
    const mockRequests = [
      { id: '1', title: 'Test Request', latitude: 40.7, longitude: -74.0 },
    ];
    (db.getRequests as jest.Mock).mockResolvedValue(mockRequests);

    const { result } = renderHook(() => useRequests({ latitude: 40.7, longitude: -74.0, radius: 5 }));

    await waitFor(() => {
      expect(result.current.requests).toEqual(mockRequests);
    });
  });

  it('should filter requests by radius', async () => {
    const mockRequests = [
      { id: '1', title: 'Nearby', latitude: 40.7, longitude: -74.0 },
      { id: '2', title: 'Far away', latitude: 41.0, longitude: -75.0 },
    ];
    (db.getRequests as jest.Mock).mockResolvedValue(mockRequests);

    const { result } = renderHook(() => useRequests({ latitude: 40.7, longitude: -74.0, radius: 1 }));

    await waitFor(() => {
      expect(result.current.requests.length).toBe(1);
      expect(result.current.requests[0].title).toBe('Nearby');
    });
  });
});
```

**lib/__tests__/db.test.ts**
```typescript
import * as SQLite from 'expo-sqlite';
import { initDatabase, createRequest, getRequests } from '../db';

jest.mock('expo-sqlite');

describe('Database Operations', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      execAsync: jest.fn(),
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
    };
    (SQLite.openDatabaseSync as jest.Mock).mockReturnValue(mockDb);
  });

  it('should initialize database with correct schema', async () => {
    await initDatabase();
    expect(mockDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS users'));
    expect(mockDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS requests'));
  });

  it('should create a new request', async () => {
    const request = {
      title: 'Test Request',
      description: 'Test description',
      latitude: 40.7,
      longitude: -74.0,
      authorId: 'user123',
      expiresAt: new Date().toISOString(),
    };

    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });

    const result = await createRequest(request);
    expect(result).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO requests'),
      expect.arrayContaining([request.title, request.description])
    );
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest parent-circle --template tabs
cd parent-circle
npm install expo-sqlite expo-location expo-notifications react-native-maps expo-image-picker expo-secure-store
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

### 2. Configure TypeScript types
Create `types/index.ts`:
```typescript
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  trustScore: number;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  authorId: string;
  authorName: string;
  authorTrustScore: number;
  expiresAt: string;
  status: 'open' | 'claimed' | 'completed' | 'expired';
  createdAt: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  requestId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}
```

### 3. Database setup
Create `lib/db.ts`:
```typescript
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = SQLite.openDatabaseSync('parentcircle.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      latitude REAL,
      longitude REAL,
      trust_score INTEGER DEFAULT 50,
      is_verified INTEGER DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      completed_exchanges INTEGER DEFAULT 0,
      positive_reviews INTEGER DEFAULT 0,
      negative_reviews INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      author_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS circles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS circle_members (
      circle_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (circle_id, user_id),
      FOREIGN KEY (circle_id) REFERENCES circles(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      request_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id),
      FOREIGN KEY (request_id) REFERENCES requests(id)
    );

    CREATE INDEX IF NOT EXISTS idx_requests_location ON requests(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
  `);
}

export async function createUser(user: Omit<User, 'id' | 'trustScore' | 'createdAt'>) {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.runAsync(
    'INSERT INTO users (id, name, phone, email, latitude, longitude, is_verified, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, user.name, user.phone, user.email || null, user.latitude, user.longitude, user.isVerified ? 1 : 0, user.isPremium ? 1 : 0]
  );
  return id;
}

export async function getUser(id: string): Promise<User | null> {
  const result = await db.getFirstAsync<any>('SELECT * FROM users WHERE id = ?', [id]);
  if (!result) return null;
  return {
    id: result.id,
    name: result.name,
    phone: result.phone,
    email: result.email,
    latitude: result.latitude,
    longitude: result.longitude,
    trustScore: result.trust_score,
    isVerified: result.is_verified === 1,
    isPremium: result.is_premium === 1,
    createdAt: result.created_at,
  };
}

export async function createRequest(request: Omit<Request, 'id' | 'status' | 'createdAt' | 'authorName' | 'authorTrustScore'>) {
  const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.runAsync(
    'INSERT INTO requests (id, title, description, latitude, longitude, author_id, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, request.title, request.description, request.latitude, request.longitude, request.authorId, request.expiresAt]
  );
  return id;
}

export async function getRequests(userLat: number, userLon: number, radiusMiles: number): Promise<Request[]> {
  // Haversine formula approximation for filtering
  const latDelta = radiusMiles / 69; // 1 degree lat ≈ 69 miles
  const lonDelta = radiusMiles / (69 * Math.cos(userLat * Math.PI / 180));

  const results = await db.getAllAsync<any>(
    `SELECT r.*, u.name as author_name, u.trust_score as author_trust_score
     FROM requests r
     JOIN users u ON r.author_id = u.id
     WHERE r.status = 'open'
     AND r.latitude BETWEEN ? AND ?
     AND r.longitude BETWEEN ? AND ?
     AND datetime(r.expires_at) > datetime('now')
     ORDER BY r.created_at DESC`,
    [userLat - latDelta, userLat + latDelta, userLon - lonDelta, userLon + lonDelta]
  );

  return results.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    latitude: r.latitude,
    longitude: r.longitude,
    authorId: r.author_id,
    authorName: r.author_name,
    authorTrustScore: r.author_trust_score,
    expiresAt: r.expires_at,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export function getDatabase() {
  return db;
}
```

### 4. Trust score calculation
Create `lib/trustScore.ts`:
```typescript
export function calculateTrustScore(
  completedExchanges: number,
  positiveReviews: number,
  negativeReviews: number
): number {
  if (completedExchanges === 0) return 50; // New user baseline

  const exchangeScore = Math.min(completedExchanges * 2, 40); // Max 40 points from exchanges
  const reviewScore = (positiveReviews * 5) - (negativeReviews * 10); // Positive adds 5, negative subtracts 10
  const totalReviews = positiveReviews + negativeReviews;
  const reviewRatio = totalReviews > 0 ? (positiveReviews / totalReviews) * 30 : 0; // Max 30 points from ratio

  const score = 50 + exchangeScore + reviewScore + reviewRatio;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function updateUserTrustScore(userId: string, db: any) {
  const user = await db.getFirstAsync<any>(
    'SELECT completed_exchanges, positive_reviews, negative_reviews FROM users WHERE id = ?',
    [userId]
  );

  if (!user) return;

  const newScore = calculateTrustScore(
    user.completed_exchanges,
    user.positive_reviews,
    user.negative_reviews
  );

  await db.runAsync('UPDATE users SET trust_score = ? WHERE id = ?', [newScore, userId]);
}
```

### 5. Location utilities
Create `lib/location.ts`:
```typescript
import * as Location from 'expo-location';

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### 6. Auth context
Create `lib/auth.ts`:
```typescript
import * as SecureStore from 'expo-secure-store';

const USER_ID_KEY = 'user_id';

export async function saveUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export async function getUserId(): Promise<string | null> {
  return await SecureStore.getItemAsync(USER_ID_KEY);
}

export async function clearUserId(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}
```

### 7. Custom hooks
Create `hooks/useAuth.ts`:
```typescript
import { useState, useEffect } from 'react';
import { getUserId } from '../lib/auth';
import { getUser } from '../lib/db';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userId = await getUserId();
      if (userId) {
        const userData = await getUser(userId);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, refreshUser: loadUser };
}
```

Create `hooks/useRequests.ts`:
```typescript
import { useState, useEffect } from 'react';
import { getRequests } from '../lib/db';
import { Request } from '../types';
import { calculateDistance } from '../lib/location';

interface UseRequestsParams {
  latitude: number;
  longitude: number;
  radius: number;
}

export function useRequests({ latitude, longitude, radius }: UseRequestsParams) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [latitude, longitude, radius]);

  async function loadRequests() {
    try {
      const data = await getRequests(latitude, longitude, radius);
      // Filter by actual distance
      const filtered = data.filter(req => {
        const distance = calculateDistance(latitude, longitude, req.latitude, req.longitude);
        return distance <= radius;
      });
      setRequests(filtered);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  }

  return { requests, loading, refresh: loadRequests };
}
```

### 8. Core components
Create `components/TrustScore.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TrustScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export default function TrustScore({ score, size = 'medium' }: TrustScoreProps) {
  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 16 },
    large: { width: 64, height: 64, fontSize: 20 },
  };

  return (
    <View style={[styles.container, { backgroundColor: getColor(), ...sizeStyles[size] }]}>
      <Text style={[styles.score, { fontSize: sizeStyles[size].fontSize }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
```

Create `components/RequestCard.tsx`:
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Request } from '../types';
import TrustScore from './TrustScore';
import { calculateDistance } from '../lib/location';

interface RequestCardProps {
  request: Request;
  userLocation: { latitude: number; longitude: number };
  onPress: () => void;
}

export default function RequestCard({ request, userLocation, onPress }: RequestCardProps) {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    request.latitude,
    request.longitude
  );

  const timeLeft = Math.round((new Date(request.expiresAt).getTime() - Date.now()) / 60000);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <TrustScore score={request.authorTrustScore} size="small" />
          <Text style={styles.authorName}>{request.authorName}</Text>
        </View>
        <Text style={styles.distance}>{distance.toFixed(1)} mi away</Text>
      </View>
      <Text style={styles.title}>{request.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{request.description}</Text>
      <Text style={styles.expires}>Expires in {timeLeft}m</Text>
    </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  expires: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
});
```

### 9. Main screens
Create `app/(tabs)/index.tsx` (Request Board):
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useRequests } from '../../hooks/useRequests';
import { getCurrentLocation } from '../../lib/location';
import RequestCard from '../../components/RequestCard';

export default function RequestBoard() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [radius, setRadius] = useState(5);
  const { requests, loading, refresh } = useRequests({ ...location, radius });

  useEffect(() => {
    loadLocation();
  }, []);

  async function loadLocation() {
    const loc = await getCurrentLocation();
    if (loc) setLocation(loc);
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view requests</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Requests</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/request/create')}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.