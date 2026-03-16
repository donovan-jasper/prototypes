# SensorSync

## One-line pitch
Turn any sensor into real-time insights — track health, monitor equipment, and analyze data streams with professional-grade accuracy on your phone.

## Expanded vision

**Core audience:** Anyone who owns sensor-based devices and wants reliable, real-time data without the complexity.

**Broadest reach:**
- **Health enthusiasts** tracking glucose monitors, ECG patches, sleep sensors, or custom biometric devices
- **Parents** monitoring baby vitals, room temperature, air quality in nurseries
- **Pet owners** tracking activity collars, health monitors, smart feeders
- **Home automation users** wanting unified sensor dashboards (temperature, humidity, motion, energy)
- **Small business owners** monitoring equipment (freezer temps, HVAC, machinery vibration)
- **Gardeners** tracking soil moisture, light levels, greenhouse conditions
- **Elderly care** family members monitoring fall detection, medication adherence, activity patterns

**Why non-technical people want this:**
- Their expensive sensors (Dexcom, Oura, custom medical devices) often have terrible apps
- They want ONE app for ALL their sensors instead of 10 different manufacturer apps
- They need alerts that actually work when sensors lose connection or drift
- They want to share sensor data with family, doctors, or teammates without screenshots
- They're tired of data being locked in proprietary ecosystems

**Adjacent use cases:**
- Historical trend analysis and pattern recognition
- Multi-sensor correlation (e.g., "my sleep quality drops when room temp exceeds 72°F")
- Family/team dashboards for shared monitoring
- Export to health records or professional analysis tools
- Custom alert rules that work across sensor types

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **Signal processing:** Custom TypeScript DSP implementations (resampling, filtering, drift compensation)
- **Bluetooth:** expo-bluetooth for direct sensor connections
- **Background processing:** expo-task-manager for continuous monitoring
- **Charts:** react-native-chart-kit
- **State:** Zustand (lightweight, simple)
- **Testing:** Jest + React Native Testing Library

## Core features

1. **Universal sensor connection** — Connect via Bluetooth, WiFi, or cloud APIs. Auto-detect common protocols (BLE GATT, MQTT, HTTP webhooks). Works with 50+ popular sensors out of the box.

2. **Real-time drift correction** — Automatically compensates for irregular timing, packet loss, and clock drift. Shows confidence intervals so users know when data is interpolated vs measured.

3. **Smart alerts** — Set thresholds with hysteresis (avoid alert spam). Get notified when sensors disconnect, batteries run low, or values exceed safe ranges. Works even when app is backgrounded.

4. **Multi-sensor dashboard** — Unified view of all connected sensors with live graphs. Swipe between sensors, pinch to zoom time ranges, tap for detailed stats.

5. **Data export & sharing** — Export to CSV, Apple Health, Google Fit. Generate shareable links for doctors/family with time-limited access.

## Monetization strategy

**Free tier (the hook):**
- Connect up to 3 sensors simultaneously
- 7 days of historical data
- Basic alerts (threshold-based only)
- Standard sensor library (top 20 consumer devices)

**Premium ($12.99/month or $99/year — reasoning: positioned between consumer fitness apps ($9.99) and professional monitoring tools ($20+)):**
- Unlimited sensors
- Unlimited historical data with cloud backup
- Advanced alerts (pattern detection, multi-sensor correlation)
- Custom sensor support (add any BLE/WiFi device)
- Professional analytics (FFT, statistical analysis, anomaly detection)
- Family sharing (up to 5 members)
- Priority support for sensor integration requests

**What makes people stay subscribed:**
- Historical data becomes more valuable over time (sunk cost)
- Custom sensors they've configured (switching cost)
- Shared dashboards with family/team (network effect)
- Alerts that prevent costly failures (equipment damage, health emergencies)
- Professional features for side businesses (consultants, trainers, small manufacturers)

**Additional revenue:**
- One-time sensor profile purchases ($2.99 each) for niche devices
- White-label licensing for hardware manufacturers

## File structure

```
sensorsync/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard
│   │   ├── sensors.tsx            # Sensor management
│   │   ├── alerts.tsx             # Alert configuration
│   │   └── settings.tsx           # Settings & export
│   ├── sensor/[id].tsx            # Individual sensor detail
│   └── _layout.tsx
├── components/
│   ├── SensorCard.tsx
│   ├── LiveChart.tsx
│   ├── AlertConfig.tsx
│   ├── ConnectionStatus.tsx
│   └── DataExporter.tsx
├── lib/
│   ├── dsp/
│   │   ├── resampler.ts           # Irregular timing compensation
│   │   ├── filter.ts              # Signal filtering
│   │   ├── drift.ts               # Clock drift correction
│   │   └── interpolator.ts        # Gap filling
│   ├── sensors/
│   │   ├── bluetooth.ts           # BLE connection manager
│   │   ├── profiles.ts            # Sensor profiles/protocols
│   │   └── parser.ts              # Data parsing
│   ├── storage/
│   │   ├── database.ts            # SQLite setup
│   │   ├── sensors.ts             # Sensor CRUD
│   │   └── readings.ts            # Time-series data
│   ├── alerts/
│   │   ├── engine.ts              # Alert evaluation
│   │   └── notifications.ts       # Push notifications
│   └── export/
│       ├── csv.ts
│       ├── health-kit.ts
│       └── share.ts
├── store/
│   └── index.ts                   # Zustand store
├── constants/
│   └── SensorProfiles.ts          # Built-in sensor definitions
├── __tests__/
│   ├── dsp/
│   │   ├── resampler.test.ts
│   │   ├── filter.test.ts
│   │   └── drift.test.ts
│   ├── sensors/
│   │   └── parser.test.ts
│   ├── storage/
│   │   └── database.test.ts
│   └── alerts/
│       └── engine.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Tests

```typescript
// __tests__/dsp/resampler.test.ts
import { resampleIrregular } from '@/lib/dsp/resampler';

describe('Resampler', () => {
  it('should resample irregular timestamps to fixed intervals', () => {
    const input = [
      { timestamp: 1000, value: 10 },
      { timestamp: 1150, value: 15 },
      { timestamp: 1280, value: 12 },
    ];
    const result = resampleIrregular(input, 100); // 100ms intervals
    expect(result).toHaveLength(3);
    expect(result[0].timestamp).toBe(1000);
    expect(result[1].timestamp).toBe(1100);
    expect(result[2].timestamp).toBe(1200);
  });

  it('should handle packet loss with interpolation', () => {
    const input = [
      { timestamp: 1000, value: 10 },
      { timestamp: 1300, value: 16 }, // 200ms gap
    ];
    const result = resampleIrregular(input, 100);
    expect(result).toHaveLength(4);
    expect(result[1].value).toBeCloseTo(12);
    expect(result[2].value).toBeCloseTo(14);
  });
});

// __tests__/dsp/drift.test.ts
import { compensateDrift } from '@/lib/dsp/drift';

describe('Drift Compensation', () => {
  it('should detect and correct clock drift', () => {
    const input = [
      { timestamp: 1000, value: 10 },
      { timestamp: 2005, value: 15 }, // 5ms drift
      { timestamp: 3010, value: 20 }, // 10ms cumulative
    ];
    const result = compensateDrift(input, 1000); // Expected 1000ms intervals
    expect(result[1].timestamp).toBe(2000);
    expect(result[2].timestamp).toBe(3000);
  });
});

// __tests__/alerts/engine.test.ts
import { evaluateAlert } from '@/lib/alerts/engine';

describe('Alert Engine', () => {
  it('should trigger threshold alert', () => {
    const alert = { type: 'threshold', value: 100, condition: 'above' };
    const reading = { value: 105 };
    expect(evaluateAlert(alert, reading)).toBe(true);
  });

  it('should apply hysteresis to prevent spam', () => {
    const alert = { type: 'threshold', value: 100, hysteresis: 5 };
    expect(evaluateAlert(alert, { value: 101 })).toBe(false); // Within hysteresis
    expect(evaluateAlert(alert, { value: 106 })).toBe(true);
  });
});

// __tests__/storage/database.test.ts
import { initDatabase, saveSensorReading } from '@/lib/storage/database';

describe('Database', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('should save and retrieve sensor readings', async () => {
    const reading = {
      sensorId: 'test-sensor',
      timestamp: Date.now(),
      value: 42,
    };
    await saveSensorReading(reading);
    const retrieved = await getSensorReadings('test-sensor', 1);
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].value).toBe(42);
  });
});
```

## Implementation steps

### Phase 1: Project setup and database foundation

1. **Initialize Expo project**
   ```bash
   npx create-expo-app@latest sensorsync --template tabs
   cd sensorsync
   ```

2. **Install dependencies**
   ```bash
   npx expo install expo-sqlite expo-bluetooth expo-task-manager expo-notifications
   npm install zustand react-native-chart-kit
   npm install -D @types/react-native jest @testing-library/react-native
   ```

3. **Create database schema** (`lib/storage/database.ts`)
   - Tables: sensors, readings, alerts, alert_history
   - Indexes on timestamp for fast time-range queries
   - Implement connection pooling and prepared statements

4. **Build storage layer** (`lib/storage/sensors.ts`, `lib/storage/readings.ts`)
   - CRUD operations for sensors
   - Batch insert for readings (performance critical)
   - Time-range queries with pagination
   - Data retention policies (auto-delete old free tier data)

### Phase 2: DSP core algorithms

5. **Implement resampler** (`lib/dsp/resampler.ts`)
   - Linear interpolation for missing samples
   - Configurable target sample rate
   - Confidence scoring (0-1 based on interpolation distance)
   - Handle edge cases (single sample, large gaps)

6. **Build drift compensator** (`lib/dsp/drift.ts`)
   - Detect drift using linear regression on timestamps
   - Apply correction factor to future samples
   - Reset on large discontinuities (sensor restart)

7. **Add signal filters** (`lib/dsp/filter.ts`)
   - Moving average (configurable window)
   - Exponential smoothing
   - Outlier detection and removal

8. **Write DSP tests** (`__tests__/dsp/*.test.ts`)
   - Test with synthetic irregular data
   - Verify interpolation accuracy
   - Check drift correction convergence

### Phase 3: Bluetooth sensor connectivity

9. **Create Bluetooth manager** (`lib/sensors/bluetooth.ts`)
   - Scan for BLE devices
   - Connect/disconnect with retry logic
   - Handle connection state changes
   - Read characteristics with notifications

10. **Define sensor profiles** (`constants/SensorProfiles.ts`)
    - Common BLE services (Heart Rate, Battery, Custom)
    - Data parsing rules (byte order, scaling, units)
    - At least 10 popular sensors (Polar H10, Wahoo, generic BLE)

11. **Build data parser** (`lib/sensors/parser.ts`)
    - Match incoming data to sensor profile
    - Convert raw bytes to typed values
    - Validate data integrity (checksums, range checks)

### Phase 4: UI components

12. **Create SensorCard component** (`components/SensorCard.tsx`)
    - Show sensor name, current value, connection status
    - Mini sparkline chart (last 20 samples)
    - Tap to navigate to detail view

13. **Build LiveChart component** (`components/LiveChart.tsx`)
    - Real-time updating line chart
    - Pinch to zoom, pan to scroll
    - Show confidence intervals for interpolated data
    - Display gaps/packet loss visually

14. **Implement ConnectionStatus** (`components/ConnectionStatus.tsx`)
    - Visual indicator (green/yellow/red)
    - Show signal strength, battery level
    - Last update timestamp

### Phase 5: Dashboard and sensor management

15. **Build dashboard screen** (`app/(tabs)/index.tsx`)
    - Grid of SensorCard components
    - Pull to refresh
    - Empty state with "Add Sensor" CTA
    - Show aggregate stats (total sensors, active connections)

16. **Create sensor management** (`app/(tabs)/sensors.tsx`)
    - List all configured sensors
    - Add new sensor flow (scan → select → configure)
    - Edit sensor settings (name, units, sample rate)
    - Delete sensor with confirmation

17. **Build sensor detail view** (`app/sensor/[id].tsx`)
    - Full-screen LiveChart
    - Current value with large typography
    - Stats panel (min/max/avg over time range)
    - Time range selector (1h, 6h, 24h, 7d, 30d)

### Phase 6: Alert system

18. **Create alert engine** (`lib/alerts/engine.ts`)
    - Evaluate threshold alerts with hysteresis
    - Detect disconnection (no data for N seconds)
    - Battery low warnings
    - Pattern detection (rising/falling trends)

19. **Build notification system** (`lib/alerts/notifications.ts`)
    - Request permissions on first launch
    - Schedule local notifications
    - Handle notification taps (deep link to sensor)
    - Respect quiet hours

20. **Implement alert UI** (`app/(tabs)/alerts.tsx`)
    - List configured alerts
    - Add/edit alert flow
    - Alert history with timestamps
    - Test alert button

### Phase 7: Background processing

21. **Setup background tasks** (`lib/sensors/background.ts`)
    - Register task with expo-task-manager
    - Continue BLE connections in background
    - Process incoming data and evaluate alerts
    - Respect battery optimization settings

22. **Add foreground service** (Android only)
    - Persistent notification when monitoring
    - Show current sensor values in notification
    - Quick actions (pause/resume)

### Phase 8: Data export and sharing

23. **Build CSV exporter** (`lib/export/csv.ts`)
    - Generate CSV with headers
    - Include metadata (sensor info, time range)
    - Share via system share sheet

24. **Implement Health Kit integration** (`lib/export/health-kit.ts`)
    - Map sensor types to HealthKit types
    - Request permissions
    - Batch write samples

25. **Create share links** (`lib/export/share.ts`)
    - Generate time-limited access tokens
    - Web viewer for shared data (separate web app)
    - Revoke access

### Phase 9: Settings and monetization

26. **Build settings screen** (`app/(tabs)/settings.tsx`)
    - Account management
    - Subscription status and upgrade CTA
    - Data retention settings
    - Export all data
    - Privacy policy, terms

27. **Implement paywall**
    - Check subscription status on app launch
    - Show upgrade prompts at feature limits
    - Integrate with RevenueCat or Expo IAP
    - Handle subscription lifecycle

### Phase 10: Polish and testing

28. **Add loading states**
    - Skeleton screens for data loading
    - Spinner for BLE scanning
    - Progress indicators for exports

29. **Error handling**
    - User-friendly error messages
    - Retry mechanisms for transient failures
    - Offline mode (show cached data)

30. **Write integration tests**
    - Test full sensor connection flow
    - Verify alert triggering end-to-end
    - Test data export formats

31. **Performance optimization**
    - Virtualize long sensor lists
    - Throttle chart updates (max 10fps)
    - Batch database writes
    - Profile with React DevTools

## How to verify it works

### Development testing

1. **Start Expo dev server**
   ```bash
   npx expo start
   ```

2. **Test on iOS Simulator**
   - Press `i` in terminal
   - Verify UI renders correctly
   - Test with mock sensor data (no BLE in simulator)

3. **Test on Android Emulator**
   - Press `a` in terminal
   - Enable Bluetooth in emulator settings
   - Test BLE scanning with virtual devices

4. **Test on physical device** (required for full BLE testing)
   - Scan QR code with Expo Go
   - Connect real BLE sensor (heart rate monitor, thermometer)
   - Verify real-time data streaming
   - Test background monitoring (lock screen)
   - Trigger alerts and verify notifications

### Automated testing

5. **Run unit tests**
   ```bash
   npm test
   ```
   - All DSP tests must pass
   - Database tests must pass
   - Alert engine tests must pass

6. **Run with coverage**
   ```bash
   npm test -- --coverage
   ```
   - Aim for >80% coverage on lib/ directory

### Manual verification checklist

- [ ] Connect at least 2 different BLE sensors simultaneously
- [ ] Verify data appears in real-time on dashboard
- [ ] Zoom and pan on LiveChart works smoothly
- [ ] Create threshold alert, trigger it, receive notification
- [ ] Disconnect sensor, verify alert fires
- [ ] Export data to CSV, open in spreadsheet
- [ ] Background monitoring continues with screen locked (5+ minutes)
- [ ] App handles sensor reconnection after Bluetooth toggle
- [ ] Free tier limits enforced (3 sensors, 7 days data)
- [ ] Upgrade flow works (test with sandbox account)

### Performance benchmarks

- Dashboard loads in <500ms with 10 sensors
- Chart updates at 10fps with 1000 data points
- Database query for 24h of data completes in <100ms
- BLE data processing latency <50ms
- App memory usage <150MB with 5 active sensors