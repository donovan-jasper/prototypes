# CloudGuard

## One-line pitch
Get instant alerts when your cloud services fail—and recover your data before it's too late.

## Expanded vision

**Core audience:** Developers, indie hackers, and SaaS operators who rely on cloud infrastructure (Fly.io, Railway, Render, Vercel, AWS, GCP) and fear silent data loss or service disruptions.

**Broader appeal:**
- **Small business owners** running e-commerce sites or booking systems who need uptime monitoring without hiring DevOps
- **Freelancers and consultants** managing client infrastructure who need instant alerts to protect their reputation
- **Non-technical founders** who use no-code tools (Bubble, Webflow) backed by cloud databases and need a safety net
- **Students and hobbyists** learning cloud deployment who want to avoid costly mistakes

**Adjacent use cases:**
- **Backup verification:** Not just alerts—proof your backups actually work
- **Cost spike detection:** Get notified when a misconfigured service racks up unexpected bills
- **Multi-cloud orchestration:** Manage alerts across AWS, GCP, Azure, Fly.io, and niche providers in one place
- **Incident postmortems:** Auto-generate timeline reports for stakeholders or insurance claims

**Why non-technical users care:**
Most cloud monitoring tools assume you know what a "pod restart" or "egress spike" means. CloudGuard translates technical failures into plain English ("Your database stopped responding—here's how to fix it") and provides one-tap recovery workflows.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **Push notifications:** Expo Notifications + FCM/APNs
- **API integrations:** Axios for cloud provider APIs (Fly.io, AWS CloudWatch, GCP Monitoring)
- **Auth:** Expo AuthSession (OAuth 2.0 for cloud providers)
- **State management:** Zustand (lightweight, no Redux overhead)
- **Testing:** Jest + React Native Testing Library
- **Background tasks:** expo-task-manager for periodic health checks

## Core features

1. **Multi-cloud monitoring dashboard**
   - Connect Fly.io, AWS, Railway, Render, Vercel accounts via OAuth
   - Real-time status cards showing uptime, response times, and error rates
   - Color-coded health indicators (green/yellow/red)

2. **Smart push notifications**
   - Instant alerts for service outages, database failures, or unexpected deletions
   - Severity-based filtering (critical vs warning)
   - Actionable notifications with deep links to recovery tools

3. **One-tap recovery workflows**
   - Pre-built scripts for common failures (restart service, restore from backup, rollback deployment)
   - Guided step-by-step instructions for manual fixes
   - Offline access to recovery playbooks

4. **Automated backup verification**
   - Schedule daily checks to confirm backups exist and are restorable
   - Alert if backup age exceeds threshold (e.g., >24 hours old)
   - Premium: Automated cross-region backup replication

5. **Incident timeline & export**
   - Auto-log all alerts with timestamps and resolution status
   - Export reports as PDF for stakeholders or insurance claims
   - Premium: Slack/Discord webhook integrations

## Monetization strategy

**Free tier (hook):**
- Monitor up to 2 cloud services
- Push notifications for critical alerts only
- 7-day incident history
- Community support (Discord)

**Premium ($9.99/month or $89/year — 25% savings):**
- Unlimited cloud service connections
- All alert severities (critical, warning, info)
- 90-day incident history with export
- Automated backup verification
- One-tap recovery workflows
- Priority email support (24-hour response)

**Why people stay subscribed:**
- **Fear of data loss:** Once you've experienced a silent failure, you won't risk going back to free tier
- **Time savings:** Recovery workflows save hours of panic-Googling during outages
- **Peace of mind:** Backup verification is insurance—you pay for the confidence, not the feature

**Pricing reasoning:**
- $9.99 is impulse-buy territory for developers (less than a Netflix subscription)
- Annual discount incentivizes long-term commitment
- Comparable to Pingdom ($10/month) but mobile-first and multi-cloud

## File structure

```
cloudguard/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Dashboard (service status cards)
│   │   ├── alerts.tsx             # Alert history & timeline
│   │   ├── recovery.tsx           # Recovery workflows library
│   │   └── settings.tsx           # Account & connected services
│   ├── _layout.tsx                # Root layout with tabs
│   ├── auth/
│   │   └── connect-service.tsx   # OAuth flow for cloud providers
│   └── modals/
│       ├── service-details.tsx   # Detailed metrics for a service
│       └── recovery-action.tsx   # Execute recovery workflow
├── components/
│   ├── ServiceCard.tsx           # Status card for dashboard
│   ├── AlertItem.tsx             # Alert list item
│   ├── RecoveryStep.tsx          # Step in recovery workflow
│   └── ConnectionButton.tsx      # OAuth connection button
├── lib/
│   ├── db.ts                     # SQLite setup & queries
│   ├── notifications.ts          # Push notification handlers
│   ├── cloudProviders/
│   │   ├── flyio.ts              # Fly.io API client
│   │   ├── aws.ts                # AWS CloudWatch client
│   │   └── types.ts              # Shared types for providers
│   ├── monitoring.ts             # Background health check logic
│   └── store.ts                  # Zustand state management
├── __tests__/
│   ├── db.test.ts
│   ├── monitoring.test.ts
│   ├── cloudProviders/
│   │   ├── flyio.test.ts
│   │   └── aws.test.ts
│   └── components/
│       ├── ServiceCard.test.tsx
│       └── AlertItem.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

**lib/__tests__/db.test.ts**
```typescript
import { openDatabase, saveService, getServices, saveAlert } from '../db';

describe('Database operations', () => {
  it('should save and retrieve services', async () => {
    const db = await openDatabase();
    await saveService(db, { id: '1', name: 'Test App', provider: 'flyio', status: 'healthy' });
    const services = await getServices(db);
    expect(services).toHaveLength(1);
    expect(services[0].name).toBe('Test App');
  });

  it('should save alerts with timestamps', async () => {
    const db = await openDatabase();
    await saveAlert(db, { serviceId: '1', severity: 'critical', message: 'Service down' });
    const alerts = await db.getAllAsync('SELECT * FROM alerts');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
  });
});
```

**lib/__tests__/monitoring.test.ts**
```typescript
import { checkServiceHealth, shouldTriggerAlert } from '../monitoring';

describe('Monitoring logic', () => {
  it('should detect unhealthy service', () => {
    const result = checkServiceHealth({ responseTime: 5000, errorRate: 0.15 });
    expect(result.status).toBe('unhealthy');
  });

  it('should trigger alert for critical failures', () => {
    const shouldAlert = shouldTriggerAlert('critical', Date.now() - 60000);
    expect(shouldAlert).toBe(true);
  });

  it('should not spam alerts within cooldown period', () => {
    const shouldAlert = shouldTriggerAlert('warning', Date.now() - 30000);
    expect(shouldAlert).toBe(false);
  });
});
```

**lib/__tests__/cloudProviders/flyio.test.ts**
```typescript
import { FlyioClient } from '../cloudProviders/flyio';

describe('Fly.io API client', () => {
  it('should parse app status correctly', () => {
    const mockResponse = { status: 'running', allocations: [{ healthy: true }] };
    const client = new FlyioClient('fake-token');
    const status = client.parseAppStatus(mockResponse);
    expect(status).toBe('healthy');
  });

  it('should detect deleted apps', () => {
    const mockResponse = { error: 'App not found' };
    const client = new FlyioClient('fake-token');
    const status = client.parseAppStatus(mockResponse);
    expect(status).toBe('deleted');
  });
});
```

**components/__tests__/ServiceCard.test.tsx**
```typescript
import { render } from '@testing-library/react-native';
import ServiceCard from '../ServiceCard';

describe('ServiceCard component', () => {
  it('should render service name and status', () => {
    const { getByText } = render(
      <ServiceCard name="My App" provider="flyio" status="healthy" />
    );
    expect(getByText('My App')).toBeTruthy();
    expect(getByText('Healthy')).toBeTruthy();
  });

  it('should show red indicator for unhealthy status', () => {
    const { getByTestId } = render(
      <ServiceCard name="Broken App" provider="aws" status="unhealthy" />
    );
    const indicator = getByTestId('status-indicator');
    expect(indicator.props.style.backgroundColor).toBe('#EF4444');
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app cloudguard --template tabs
cd cloudguard
npm install expo-sqlite expo-notifications expo-auth-session axios zustand
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Configure TypeScript and testing
- Update `tsconfig.json` with strict mode
- Add Jest config to `package.json`:
```json
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ]
}
```

### 3. Database schema (lib/db.ts)
```typescript
import * as SQLite from 'expo-sqlite';

export async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('cloudguard.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      last_check INTEGER,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      resolved INTEGER DEFAULT 0,
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS recovery_workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      steps TEXT NOT NULL
    );
  `);
  
  return db;
}

export async function saveService(db: SQLite.SQLiteDatabase, service: any) {
  await db.runAsync(
    'INSERT OR REPLACE INTO services (id, name, provider, status, last_check, metadata) VALUES (?, ?, ?, ?, ?, ?)',
    [service.id, service.name, service.provider, service.status, Date.now(), JSON.stringify(service.metadata || {})]
  );
}

export async function getServices(db: SQLite.SQLiteDatabase) {
  return await db.getAllAsync('SELECT * FROM services ORDER BY name');
}

export async function saveAlert(db: SQLite.SQLiteDatabase, alert: any) {
  await db.runAsync(
    'INSERT INTO alerts (service_id, severity, message, timestamp) VALUES (?, ?, ?, ?)',
    [alert.serviceId, alert.severity, alert.message, Date.now()]
  );
}
```

### 4. Cloud provider clients (lib/cloudProviders/flyio.ts)
```typescript
import axios from 'axios';

export class FlyioClient {
  private token: string;
  private baseUrl = 'https://api.fly.io/graphql';

  constructor(token: string) {
    this.token = token;
  }

  async getApps() {
    const query = `
      query {
        apps {
          nodes {
            id
            name
            status
            organization { id }
          }
        }
      }
    `;
    
    const response = await axios.post(
      this.baseUrl,
      { query },
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    
    return response.data.data.apps.nodes;
  }

  async getAppStatus(appId: string) {
    const query = `
      query($appId: String!) {
        app(name: $appId) {
          status
          allocations {
            id
            healthy
          }
        }
      }
    `;
    
    try {
      const response = await axios.post(
        this.baseUrl,
        { query, variables: { appId } },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );
      
      return this.parseAppStatus(response.data.data.app);
    } catch (error) {
      if (error.response?.status === 404) {
        return 'deleted';
      }
      throw error;
    }
  }

  parseAppStatus(appData: any): 'healthy' | 'unhealthy' | 'deleted' {
    if (!appData) return 'deleted';
    if (appData.status !== 'running') return 'unhealthy';
    
    const healthyAllocations = appData.allocations?.filter((a: any) => a.healthy).length || 0;
    return healthyAllocations > 0 ? 'healthy' : 'unhealthy';
  }
}
```

### 5. Monitoring logic (lib/monitoring.ts)
```typescript
export function checkServiceHealth(metrics: { responseTime: number; errorRate: number }) {
  if (metrics.responseTime > 3000 || metrics.errorRate > 0.1) {
    return { status: 'unhealthy', reason: 'High latency or error rate' };
  }
  return { status: 'healthy' };
}

const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export function shouldTriggerAlert(severity: string, lastAlertTime: number): boolean {
  if (severity === 'critical') return true;
  return Date.now() - lastAlertTime > ALERT_COOLDOWN;
}
```

### 6. Push notification setup (lib/notifications.ts)
```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('critical', {
      name: 'Critical Alerts',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function sendLocalNotification(title: string, body: string, severity: 'critical' | 'warning') {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: severity === 'critical',
      priority: severity === 'critical' ? 'high' : 'default',
    },
    trigger: null,
  });
}
```

### 7. State management (lib/store.ts)
```typescript
import { create } from 'zustand';

interface Service {
  id: string;
  name: string;
  provider: string;
  status: 'healthy' | 'unhealthy' | 'deleted';
}

interface Alert {
  id: number;
  serviceId: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

interface AppState {
  services: Service[];
  alerts: Alert[];
  addService: (service: Service) => void;
  updateServiceStatus: (id: string, status: Service['status']) => void;
  addAlert: (alert: Alert) => void;
}

export const useStore = create<AppState>((set) => ({
  services: [],
  alerts: [],
  addService: (service) => set((state) => ({ services: [...state.services, service] })),
  updateServiceStatus: (id, status) =>
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, status } : s)),
    })),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
}));
```

### 8. UI components (components/ServiceCard.tsx)
```typescript
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ServiceCardProps {
  name: string;
  provider: string;
  status: 'healthy' | 'unhealthy' | 'deleted';
  onPress?: () => void;
}

export default function ServiceCard({ name, provider, status, onPress }: ServiceCardProps) {
  const statusColor = status === 'healthy' ? '#10B981' : status === 'unhealthy' ? '#F59E0B' : '#EF4444';
  
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={[styles.indicator, { backgroundColor: statusColor }]} testID="status-indicator" />
      </View>
      <Text style={styles.provider}>{provider}</Text>
      <Text style={[styles.status, { color: statusColor }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  provider: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
});
```

### 9. Dashboard screen (app/(tabs)/index.tsx)
```typescript
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import ServiceCard from '@/components/ServiceCard';
import { useStore } from '@/lib/store';
import { openDatabase, getServices } from '@/lib/db';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const services = useStore((state) => state.services);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const db = await openDatabase();
    const dbServices = await getServices(db);
    // Update store with services from DB
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadServices();
    // Trigger health checks for all services
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          name={service.name}
          provider={service.provider}
          status={service.status}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
});
```

### 10. Background task registration (app/_layout.tsx)
```typescript
import { useEffect } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { registerForPushNotifications } from '@/lib/notifications';

const HEALTH_CHECK_TASK = 'health-check-task';

TaskManager.defineTask(HEALTH_CHECK_TASK, async () => {
  // Run health checks for all services
  // Send notifications if issues detected
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications();
    registerBackgroundTask();
  }, []);

  async function registerBackgroundTask() {
    await BackgroundFetch.registerTaskAsync(HEALTH_CHECK_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  return (
    // Layout JSX
  );
}
```

### 11. OAuth connection flow (app/auth/connect-service.tsx)
```typescript
import { useState } from 'react';
import { View, Button } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { FlyioClient } from '@/lib/cloudProviders/flyio';

export default function ConnectServiceScreen() {
  const [loading, setLoading] = useState(false);

  async function connectFlyio() {
    setLoading(true);
    
    const redirectUri = AuthSession.makeRedirectUri();
    const authUrl = `https://fly.io/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUri}`;
    
    const result = await AuthSession.startAsync({ authUrl });
    
    if (result.type === 'success') {
      const token = result.params.access_token;
      const client = new FlyioClient(token);
      const apps = await client.getApps();
      // Save apps to database
    }
    
    setLoading(false);
  }

  return (
    <View>
      <Button title="Connect Fly.io" onPress={connectFlyio} disabled={loading} />
    </View>
  );
}
```

### 12. Write all tests
- Implement test files from Tests section above
- Run `npm test` to verify all pass

### 13. Configure app.json
```json
{
  "expo": {
    "name": "CloudGuard",
    "slug": "cloudguard",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.cloudguard.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.cloudguard.app",
      "permissions": ["RECEIVE_BOOT_COMPLETED"]
    },
    "plugins": [
      "expo-sqlite",
      "expo-notifications"
    ]
  }
}
```

## How to verify it works

### On device/simulator:
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go (iOS) or press 'a' for Android emulator
3. Grant notification permissions when prompted
4. Navigate to Settings tab and tap "Connect Fly.io"
5. Complete OAuth flow (use test credentials)
6. Return to Dashboard—should see connected services with status indicators
7. Pull down to refresh—status should update
8. Simulate a service failure by manually updating DB status to "unhealthy"
9. Verify push notification appears within 30 seconds
10. Tap notification—should deep link to service details

### Automated tests:
```bash
npm test
```

All tests must pass:
- Database CRUD operations
- Service health check logic
- Alert cooldown behavior
- Fly.io API response parsing
- Component rendering with correct status colors

### Manual verification checklist:
- [ ] Services load from SQLite on app launch
- [ ] Pull-to-refresh triggers health checks
- [ ] Status indicators show correct colors (green/yellow/red)
- [ ] Push notifications appear for critical alerts
- [ ] Background task runs every 15 minutes (check device logs)
- [ ] OAuth flow completes and stores access token
- [ ] Alert history persists across app restarts
- [ ] App works offline (shows cached data)