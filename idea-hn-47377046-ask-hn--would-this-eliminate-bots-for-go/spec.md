# HumanGuard

## One-line pitch
Stop bots cold with invisible biometric verification that proves you're human without lifting a finger.

## Expanded vision

**Broadest audience:** Anyone who interacts with digital services and wants frictionless security.

**Core users:**
- **Everyday consumers** tired of CAPTCHAs, account takeovers, and spam bots flooding their favorite platforms
- **Small business owners** running e-commerce stores, booking systems, or membership sites who lose revenue to bot attacks but can't afford enterprise fraud solutions
- **Content creators and influencers** battling fake engagement, bot followers, and automated harassment
- **Parents** wanting to verify their kids are interacting with real humans in gaming/social apps
- **Remote workers** needing seamless multi-factor authentication that doesn't interrupt flow state

**Adjacent use cases:**
- **Dating app verification** — prove matches are real humans, not catfish bots
- **Ticket sales** — eliminate scalper bots from concert/event purchases
- **Online voting/polls** — ensure one human = one vote
- **Customer support** — route real humans to agents, auto-reject bot spam
- **Gaming anti-cheat** — detect automation scripts in real-time
- **Social media** — verify authentic engagement vs bot farms

**Why non-technical people want this:**
No more clicking fire hydrants. No more "prove you're human" interruptions. Just open an app, tap once, and you're verified everywhere for 24 hours. It's like TSA PreCheck for the internet — pay once, skip the line forever.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Biometrics:** `expo-local-authentication` (fingerprint/face)
- **Motion sensors:** `expo-sensors` (accelerometer, gyroscope)
- **Storage:** `expo-sqlite` (local verification history)
- **Crypto:** `expo-crypto` (token generation)
- **Backend:** Supabase (auth, API gateway, verification logs)
- **Testing:** Jest + React Native Testing Library

## Core features

1. **One-Tap Verification** — Single button generates a cryptographically signed "human token" valid for 24 hours, shareable across apps/websites via QR code or deep link

2. **Passive Liveness Detection** — Background monitoring of natural micro-movements (hand tremor, typing rhythm, screen pressure variance) that bots can't replicate

3. **Verification Dashboard** — See where you've been verified, revoke access to specific services, and get alerts when suspicious activity is detected

4. **Developer SDK** — Simple API for businesses to integrate HumanGuard verification into their apps/sites (3 lines of code)

5. **Trust Score** — Real-time 0-100 score based on biometric consistency, device reputation, and behavioral patterns (visible to user, shareable with services)

## Monetization strategy

**Free tier:**
- 5 verifications per month
- Basic trust score (updated daily)
- Single device only
- Hook: Let users experience frictionless verification on their most-used services (email login, one e-commerce site)

**Pro ($4.99/month or $49/year):**
- Unlimited verifications
- Real-time trust score updates
- Multi-device sync (phone + tablet)
- Priority verification (faster processing)
- Verification history export
- Reasoning: Price point matches password managers (1Password, Dashlane) — users already pay $3-5/month for security tools

**Business API ($299/month per 10K verifications):**
- White-label SDK
- Custom verification rules
- Webhook integrations
- Analytics dashboard
- Dedicated support

**Retention drivers:**
- Once integrated into daily logins (email, banking, shopping), switching cost is high
- Trust score improves over time — users don't want to restart from zero
- Network effects: More services accept HumanGuard = more valuable to users

## File structure

```
humanguard/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                 # Home/Verification screen
│   │   ├── dashboard.tsx             # Verification history
│   │   ├── settings.tsx              # Account settings
│   │   └── _layout.tsx               # Tab navigator
│   ├── _layout.tsx                   # Root layout
│   └── +not-found.tsx
├── components/
│   ├── VerificationButton.tsx        # Main verification trigger
│   ├── TrustScoreGauge.tsx          # Visual trust score display
│   ├── LivenessMonitor.tsx          # Background sensor tracking
│   └── QRCodeGenerator.tsx          # Token sharing
├── lib/
│   ├── biometrics.ts                # Biometric authentication logic
│   ├── sensors.ts                   # Motion/behavioral data collection
│   ├── crypto.ts                    # Token generation/signing
│   ├── database.ts                  # SQLite setup and queries
│   ├── trustScore.ts                # Trust score calculation
│   └── api.ts                       # Supabase client
├── __tests__/
│   ├── biometrics.test.ts
│   ├── sensors.test.ts
│   ├── crypto.test.ts
│   ├── trustScore.test.ts
│   └── components/
│       ├── VerificationButton.test.tsx
│       └── TrustScoreGauge.test.tsx
├── constants/
│   └── Config.ts                    # App constants
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**lib/__tests__/biometrics.test.ts**
```typescript
import { authenticateUser, isBiometricAvailable } from '../biometrics';
import * as LocalAuthentication from 'expo-local-authentication';

jest.mock('expo-local-authentication');

describe('Biometrics', () => {
  it('should check if biometric hardware is available', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    const result = await isBiometricAvailable();
    expect(result).toBe(true);
  });

  it('should authenticate user successfully', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: true,
    });
    const result = await authenticateUser();
    expect(result.success).toBe(true);
  });
});
```

**lib/__tests__/sensors.test.ts**
```typescript
import { collectBehavioralData, calculateMovementEntropy } from '../sensors';

describe('Sensors', () => {
  it('should calculate movement entropy from accelerometer data', () => {
    const mockData = [
      { x: 0.1, y: 0.2, z: 0.3 },
      { x: 0.15, y: 0.25, z: 0.35 },
      { x: 0.12, y: 0.22, z: 0.32 },
    ];
    const entropy = calculateMovementEntropy(mockData);
    expect(entropy).toBeGreaterThan(0);
    expect(entropy).toBeLessThan(1);
  });

  it('should detect bot-like patterns (zero variance)', () => {
    const mockData = [
      { x: 0.1, y: 0.1, z: 0.1 },
      { x: 0.1, y: 0.1, z: 0.1 },
      { x: 0.1, y: 0.1, z: 0.1 },
    ];
    const entropy = calculateMovementEntropy(mockData);
    expect(entropy).toBe(0);
  });
});
```

**lib/__tests__/crypto.test.ts**
```typescript
import { generateVerificationToken, verifyToken } from '../crypto';

describe('Crypto', () => {
  it('should generate a valid verification token', async () => {
    const token = await generateVerificationToken('user123', 85);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should verify a valid token', async () => {
    const token = await generateVerificationToken('user123', 85);
    const isValid = await verifyToken(token);
    expect(isValid).toBe(true);
  });

  it('should reject tampered tokens', async () => {
    const token = await generateVerificationToken('user123', 85);
    const tamperedToken = token.slice(0, -5) + 'XXXXX';
    const isValid = await verifyToken(tamperedToken);
    expect(isValid).toBe(false);
  });
});
```

**lib/__tests__/trustScore.test.ts**
```typescript
import { calculateTrustScore, updateTrustScore } from '../trustScore';

describe('Trust Score', () => {
  it('should calculate initial trust score', () => {
    const score = calculateTrustScore({
      biometricSuccess: true,
      movementEntropy: 0.7,
      deviceReputation: 0.8,
      verificationHistory: 5,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should penalize bot-like behavior', () => {
    const score = calculateTrustScore({
      biometricSuccess: false,
      movementEntropy: 0.0,
      deviceReputation: 0.3,
      verificationHistory: 0,
    });
    expect(score).toBeLessThan(50);
  });

  it('should reward consistent human behavior', () => {
    const score = calculateTrustScore({
      biometricSuccess: true,
      movementEntropy: 0.85,
      deviceReputation: 0.95,
      verificationHistory: 100,
    });
    expect(score).toBeGreaterThan(80);
  });
});
```

**components/__tests__/VerificationButton.test.tsx**
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VerificationButton from '../VerificationButton';

describe('VerificationButton', () => {
  it('should render correctly', () => {
    const { getByText } = render(<VerificationButton onVerify={jest.fn()} />);
    expect(getByText('Verify I\'m Human')).toBeTruthy();
  });

  it('should call onVerify when pressed', async () => {
    const mockVerify = jest.fn();
    const { getByText } = render(<VerificationButton onVerify={mockVerify} />);
    
    fireEvent.press(getByText('Verify I\'m Human'));
    
    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalled();
    });
  });

  it('should show loading state during verification', async () => {
    const { getByText, queryByText } = render(
      <VerificationButton onVerify={async () => new Promise(resolve => setTimeout(resolve, 100))} />
    );
    
    fireEvent.press(getByText('Verify I\'m Human'));
    
    expect(queryByText('Verifying...')).toBeTruthy();
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest humanguard --template tabs
cd humanguard
npm install expo-local-authentication expo-sensors expo-sqlite expo-crypto @supabase/supabase-js
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

### 2. Configure Jest (jest.config.js)
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

### 3. Create database schema (lib/database.ts)
```typescript
import * as SQLite from 'expo-sqlite';

export interface Verification {
  id: number;
  timestamp: number;
  trustScore: number;
  service: string;
  token: string;
}

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('humanguard.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      trustScore INTEGER NOT NULL,
      service TEXT NOT NULL,
      token TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_timestamp ON verifications(timestamp);
  `);
}

export async function saveVerification(verification: Omit<Verification, 'id'>) {
  const result = await db.runAsync(
    'INSERT INTO verifications (timestamp, trustScore, service, token) VALUES (?, ?, ?, ?)',
    verification.timestamp,
    verification.trustScore,
    verification.service,
    verification.token
  );
  return result.lastInsertRowId;
}

export async function getVerifications(limit = 50): Promise<Verification[]> {
  const result = await db.getAllAsync<Verification>(
    'SELECT * FROM verifications ORDER BY timestamp DESC LIMIT ?',
    limit
  );
  return result;
}

export async function getVerificationCount(): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM verifications'
  );
  return result?.count || 0;
}
```

### 4. Implement biometric authentication (lib/biometrics.ts)
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    
    return { success: result.success };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

### 5. Implement sensor data collection (lib/sensors.ts)
```typescript
import { Accelerometer, Gyroscope } from 'expo-sensors';

export interface SensorData {
  x: number;
  y: number;
  z: number;
}

export function collectBehavioralData(duration = 2000): Promise<SensorData[]> {
  return new Promise((resolve) => {
    const data: SensorData[] = [];
    
    const subscription = Accelerometer.addListener((accelerometerData) => {
      data.push(accelerometerData);
    });
    
    Accelerometer.setUpdateInterval(100);
    
    setTimeout(() => {
      subscription.remove();
      resolve(data);
    }, duration);
  });
}

export function calculateMovementEntropy(data: SensorData[]): number {
  if (data.length < 2) return 0;
  
  let totalVariance = 0;
  
  for (let i = 1; i < data.length; i++) {
    const dx = Math.abs(data[i].x - data[i - 1].x);
    const dy = Math.abs(data[i].y - data[i - 1].y);
    const dz = Math.abs(data[i].z - data[i - 1].z);
    totalVariance += dx + dy + dz;
  }
  
  const avgVariance = totalVariance / (data.length - 1);
  return Math.min(avgVariance * 10, 1);
}
```

### 6. Implement token generation (lib/crypto.ts)
```typescript
import * as Crypto from 'expo-crypto';

export async function generateVerificationToken(
  userId: string,
  trustScore: number
): Promise<string> {
  const timestamp = Date.now();
  const payload = JSON.stringify({ userId, trustScore, timestamp });
  
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload + process.env.EXPO_PUBLIC_SECRET_KEY
  );
  
  const token = Buffer.from(payload).toString('base64') + '.' + hash;
  return token;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, hash] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString();
    
    const expectedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      payload + process.env.EXPO_PUBLIC_SECRET_KEY
    );
    
    if (hash !== expectedHash) return false;
    
    const { timestamp } = JSON.parse(payload);
    const age = Date.now() - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return age < maxAge;
  } catch {
    return false;
  }
}
```

### 7. Implement trust score calculation (lib/trustScore.ts)
```typescript
export interface TrustFactors {
  biometricSuccess: boolean;
  movementEntropy: number;
  deviceReputation: number;
  verificationHistory: number;
}

export function calculateTrustScore(factors: TrustFactors): number {
  let score = 0;
  
  if (factors.biometricSuccess) score += 40;
  
  score += factors.movementEntropy * 30;
  
  score += factors.deviceReputation * 20;
  
  const historyBonus = Math.min(factors.verificationHistory / 10, 1) * 10;
  score += historyBonus;
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

export async function updateTrustScore(
  currentScore: number,
  newFactors: TrustFactors
): Promise<number> {
  const newScore = calculateTrustScore(newFactors);
  return Math.round((currentScore * 0.7) + (newScore * 0.3));
}
```

### 8. Create VerificationButton component (components/VerificationButton.tsx)
```typescript
import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  onVerify: () => Promise<void>;
}

export default function VerificationButton({ onVerify }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onVerify();
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>Verify I'm Human</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

### 9. Create TrustScoreGauge component (components/TrustScoreGauge.tsx)
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  score: number;
}

export default function TrustScoreGauge({ score }: Props) {
  const getColor = () => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <View style={styles.container}>
      <View style={styles.gauge}>
        <View
          style={[
            styles.fill,
            { width: `${score}%`, backgroundColor: getColor() },
          ]}
        />
      </View>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.label}>Trust Score</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  gauge: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
```

### 10. Implement home screen (app/(tabs)/index.tsx)
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import VerificationButton from '@/components/VerificationButton';
import TrustScoreGauge from '@/components/TrustScoreGauge';
import { authenticateUser, isBiometricAvailable } from '@/lib/biometrics';
import { collectBehavioralData, calculateMovementEntropy } from '@/lib/sensors';
import { generateVerificationToken } from '@/lib/crypto';
import { calculateTrustScore } from '@/lib/trustScore';
import { initDatabase, saveVerification, getVerificationCount } from '@/lib/database';

export default function HomeScreen() {
  const [trustScore, setTrustScore] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);

  useEffect(() => {
    initDatabase();
    loadVerificationCount();
  }, []);

  const loadVerificationCount = async () => {
    const count = await getVerificationCount();
    setVerificationCount(count);
  };

  const handleVerify = async () => {
    try {
      const biometricAvailable = await isBiometricAvailable();
      if (!biometricAvailable) {
        Alert.alert('Error', 'Biometric authentication not available');
        return;
      }

      const authResult = await authenticateUser();
      if (!authResult.success) {
        Alert.alert('Error', 'Authentication failed');
        return;
      }

      const sensorData = await collectBehavioralData();
      const entropy = calculateMovementEntropy(sensorData);

      const score = calculateTrustScore({
        biometricSuccess: true,
        movementEntropy: entropy,
        deviceReputation: 0.8,
        verificationHistory: verificationCount,
      });

      setTrustScore(score);

      const token = await generateVerificationToken('user123', score);

      await saveVerification({
        timestamp: Date.now(),
        trustScore: score,
        service: 'manual',
        token,
      });

      await loadVerificationCount();

      Alert.alert('Success', `Verified! Trust Score: ${score}`);
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HumanGuard</Text>
      <Text style={styles.subtitle}>Prove you're human, instantly</Text>
      
      <TrustScoreGauge score={trustScore} />
      
      <VerificationButton onVerify={handleVerify} />
      
      <Text style={styles.count}>
        {verificationCount} verification{verificationCount !== 1 ? 's' : ''} completed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 40,
  },
  count: {
    marginTop: 20,
    fontSize: 14,
    color: '#8E8E93',
  },
});
```

### 11. Implement dashboard screen (app/(tabs)/dashboard.tsx)
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getVerifications, Verification } from '@/lib/database';

export default function DashboardScreen() {
  const [verifications, setVerifications] = useState<Verification[]>([]);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    const data = await getVerifications();
    setVerifications(data);
  };

  const renderItem = ({ item }: { item: Verification }) => (
    <View style={styles.item}>
      <Text style={styles.service}>{item.service}</Text>
      <Text style={styles.score}>Score: {item.trustScore}</Text>
      <Text style={styles.date}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification History</Text>
      <FlatList
        data={verifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    padding: 20,
  },
  list: {
    padding: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  service: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  score: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
```

### 12. Add environment variables (.env)
```
EXPO_PUBLIC_SECRET_KEY=your-secret-key-here-change-in-production
```

### 13. Update package.json scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "test": "jest --coverage"
  }
}
```

## How to verify it works

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run tests:**
   ```bash
   npm test
   ```
   All tests should pass with coverage report.

3. **Start Expo:**
   ```bash
   npx expo start
   ```

4. **Test on device/simulator:**
   - Press `i` for iOS simulator or `a` for Android emulator
   - Or scan QR code with Expo Go app on physical device

5. **Verify core functionality:**
   - Tap "Verify I'm Human" button
   - Complete biometric authentication (fingerprint/face)
   - Hold device and move naturally for 2 seconds
   - Trust score should appear (60-100 range for humans)
   - Check dashboard tab to see verification history
   - Verify SQLite database persists data across app restarts

6. **Test edge cases:**
   - Deny biometric permission → should show error
   - Keep device perfectly still → trust score should be lower
   - Complete multiple verifications → count should increment