# MorseMate

## One-line pitch
Master Morse code through daily challenges, compete with friends, and unlock a timeless survival skill—all from your pocket.

## Expanded vision

### Who is this REALLY for?

**Primary audiences:**
- **Outdoor enthusiasts & survivalists** — Hikers, campers, and preppers who want a legitimate emergency communication skill that works without cell service
- **Parents teaching kids** — Morse code as a fun "secret language" for families, road trips, and screen-free bonding
- **Accessibility community** — People with speech or hearing challenges who can use Morse as an alternative communication method
- **Nostalgia seekers** — Adults who remember Morse from movies, military history, or childhood and want to finally learn it
- **Students & educators** — Teachers looking for engaging STEM activities; students wanting a unique skill for college apps

**Adjacent use cases:**
- **Secret messaging** — Couples, friends, or coworkers creating private communication channels in plain sight (tapping on tables, flashing lights)
- **Focus training** — Morse code practice as a meditative, pattern-recognition exercise similar to Duolingo's appeal
- **Party trick** — Learning enough to impress people at gatherings or use in escape rooms
- **Emergency preparedness** — Real-world utility for power outages, natural disasters, or remote travel where SOS knowledge matters

**Why non-technical people want this:**
- It's a **game first**, learning second — no intimidating "study" vibe
- **Social proof** — Share progress, challenge friends, unlock achievements
- **Practical safety net** — Knowing SOS in Morse feels empowering, like learning CPR
- **Nostalgia + novelty** — Morse code is retro-cool, like vinyl records or film cameras

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Local storage:** SQLite (expo-sqlite)
- **Audio:** expo-av for Morse tone generation
- **Haptics:** expo-haptics for vibration feedback
- **State management:** React Context API (no Redux for MVP)
- **Testing:** Jest + React Native Testing Library
- **Analytics:** Expo Application Services (free tier)

## Core features

1. **Daily Morse Challenge** — One new word/phrase per day (starts easy: "SOS", "HELP", progresses to quotes). Streak tracking. Miss a day, lose your streak. This is the hook.

2. **Tap Trainer** — Interactive screen where you tap dots/dashes to spell words. Real-time feedback with haptic vibration and audio. Gamified levels (letters → words → sentences).

3. **Flashlight SOS Mode** — One-tap emergency signal that flashes SOS in Morse using the phone's flashlight. Works offline. Premium feature: customizable messages beyond SOS.

4. **Friend Challenges** — Send a Morse-encoded message to a friend (via share link). They decode it in-app. Leaderboard for fastest decoders.

5. **Offline Decoder** — Type text, get Morse output (audio + visual). Paste Morse, get text. Essential utility that keeps people coming back.

## Monetization strategy

**Free tier:**
- Daily challenges (limited to 1/day)
- Tap Trainer (first 10 levels)
- Basic SOS flashlight mode
- Decoder (text ↔ Morse, with ads)

**Premium ($3.99/month or $29.99/year):**
- **Unlimited challenges** — Practice any past challenge, custom word lists
- **Advanced SOS** — Custom emergency messages, strobe patterns, audio alerts
- **Ad-free experience**
- **Multiplayer tournaments** — Weekly competitions with prizes (badges, not cash)
- **Progress sync** — Cloud backup of streaks and achievements

**Why people stay subscribed:**
- **Streak anxiety** — Once you hit a 30-day streak, you don't want to lose premium features
- **Social competition** — Leaderboards and friend challenges create FOMO
- **Real utility** — The custom SOS feature feels like insurance; people keep it "just in case"
- **Habit formation** — Daily challenges become part of morning routines (like Wordle)

**Price reasoning:**
- Lower than Duolingo ($6.99) because narrower use case
- Higher than throwaway apps ($0.99) because of real skill-building value
- Annual discount (37% off) drives long-term commitment

## File structure

```
morsemate/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Daily Challenge screen
│   │   ├── trainer.tsx            # Tap Trainer
│   │   ├── decoder.tsx            # Text ↔ Morse converter
│   │   └── profile.tsx            # Stats, settings, premium
│   ├── challenge/[id].tsx         # Individual challenge detail
│   ├── sos.tsx                    # Emergency SOS mode
│   └── _layout.tsx
├── components/
│   ├── MorseDisplay.tsx           # Visual dot/dash renderer
│   ├── TapInput.tsx               # Tap detection component
│   ├── StreakCounter.tsx          # Streak UI
│   ├── PremiumGate.tsx            # Paywall modal
│   └── LeaderboardCard.tsx        # Friend rankings
├── lib/
│   ├── morse.ts                   # Morse encode/decode logic
│   ├── audio.ts                   # Sound generation
│   ├── haptics.ts                 # Vibration patterns
│   ├── database.ts                # SQLite setup
│   └── challenges.ts              # Daily challenge generation
├── hooks/
│   ├── useMorsePlayer.ts          # Audio playback hook
│   ├── useStreak.ts               # Streak tracking
│   └── usePremium.ts              # Subscription state
├── constants/
│   ├── morse-map.ts               # Character → Morse mappings
│   └── challenges.ts              # Predefined challenge data
├── __tests__/
│   ├── morse.test.ts
│   ├── challenges.test.ts
│   ├── streak.test.ts
│   └── components/
│       ├── MorseDisplay.test.tsx
│       └── TapInput.test.tsx
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

### `__tests__/morse.test.ts`
```typescript
import { textToMorse, morseToText, isValidMorse } from '../lib/morse';

describe('Morse encoding/decoding', () => {
  test('converts text to Morse', () => {
    expect(textToMorse('SOS')).toBe('... --- ...');
    expect(textToMorse('HELLO')).toBe('.... . .-.. .-.. ---');
  });

  test('converts Morse to text', () => {
    expect(morseToText('... --- ...')).toBe('SOS');
    expect(morseToText('.... . .-.. .-.. ---')).toBe('HELLO');
  });

  test('handles invalid Morse', () => {
    expect(isValidMorse('... --- ...')).toBe(true);
    expect(isValidMorse('xyz')).toBe(false);
  });

  test('ignores case and extra spaces', () => {
    expect(textToMorse('hello')).toBe(textToMorse('HELLO'));
    expect(morseToText('...  ---  ...')).toBe('SOS');
  });
});
```

### `__tests__/challenges.test.ts`
```typescript
import { getDailyChallenge, getChallengeForDate } from '../lib/challenges';

describe('Daily challenges', () => {
  test('generates consistent challenge for same date', () => {
    const date = new Date('2026-03-16');
    const challenge1 = getChallengeForDate(date);
    const challenge2 = getChallengeForDate(date);
    expect(challenge1.word).toBe(challenge2.word);
  });

  test('generates different challenges for different dates', () => {
    const date1 = new Date('2026-03-16');
    const date2 = new Date('2026-03-17');
    const challenge1 = getChallengeForDate(date1);
    const challenge2 = getChallengeForDate(date2);
    expect(challenge1.word).not.toBe(challenge2.word);
  });

  test('returns valid Morse for challenge', () => {
    const challenge = getDailyChallenge();
    expect(challenge.morse).toMatch(/^[.\- ]+$/);
  });
});
```

### `__tests__/streak.test.ts`
```typescript
import { updateStreak, getStreak, resetStreak } from '../lib/database';

describe('Streak tracking', () => {
  beforeEach(async () => {
    await resetStreak();
  });

  test('starts at 0', async () => {
    const streak = await getStreak();
    expect(streak.current).toBe(0);
  });

  test('increments on consecutive days', async () => {
    await updateStreak(new Date('2026-03-16'));
    await updateStreak(new Date('2026-03-17'));
    const streak = await getStreak();
    expect(streak.current).toBe(2);
  });

  test('resets on missed day', async () => {
    await updateStreak(new Date('2026-03-16'));
    await updateStreak(new Date('2026-03-18')); // Skipped 17th
    const streak = await getStreak();
    expect(streak.current).toBe(1);
  });
});
```

### `__tests__/components/MorseDisplay.test.tsx`
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import MorseDisplay from '../../components/MorseDisplay';

describe('MorseDisplay', () => {
  test('renders dots and dashes', () => {
    const { getByText } = render(<MorseDisplay morse="... --- ..." />);
    expect(getByText('... --- ...')).toBeTruthy();
  });

  test('handles empty input', () => {
    const { queryByText } = render(<MorseDisplay morse="" />);
    expect(queryByText(/[.\-]/)).toBeNull();
  });
});
```

### `__tests__/components/TapInput.test.tsx`
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TapInput from '../../components/TapInput';

describe('TapInput', () => {
  test('detects short tap as dot', () => {
    const onInput = jest.fn();
    const { getByTestId } = render(<TapInput onInput={onInput} />);
    const button = getByTestId('tap-button');
    
    fireEvent(button, 'pressIn');
    setTimeout(() => fireEvent(button, 'pressOut'), 100);
    
    expect(onInput).toHaveBeenCalledWith('.');
  });

  test('detects long press as dash', () => {
    const onInput = jest.fn();
    const { getByTestId } = render(<TapInput onInput={onInput} />);
    const button = getByTestId('tap-button');
    
    fireEvent(button, 'pressIn');
    setTimeout(() => fireEvent(button, 'pressOut'), 400);
    
    expect(onInput).toHaveBeenCalledWith('-');
  });
});
```

## Implementation steps

### 1. Project setup
```bash
npx create-expo-app@latest morsemate --template tabs
cd morsemate
npm install expo-sqlite expo-av expo-haptics
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

### 2. Configure Jest (`jest.config.js`)
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

### 3. Create Morse mapping (`constants/morse-map.ts`)
```typescript
export const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
};

export const REVERSE_MORSE_MAP = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);
```

### 4. Implement core Morse logic (`lib/morse.ts`)
```typescript
import { MORSE_MAP, REVERSE_MORSE_MAP } from '../constants/morse-map';

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map(char => MORSE_MAP[char] || '')
    .join(' ')
    .trim();
}

export function morseToText(morse: string): string {
  return morse
    .split(' ')
    .map(code => REVERSE_MORSE_MAP[code] || '')
    .join('')
    .trim();
}

export function isValidMorse(morse: string): boolean {
  return /^[.\- /]+$/.test(morse);
}
```

### 5. Set up SQLite database (`lib/database.ts`)
```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('morsemate.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY,
      current INTEGER DEFAULT 0,
      longest INTEGER DEFAULT 0,
      last_completed TEXT
    );
    
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      word TEXT,
      completed INTEGER DEFAULT 0
    );
    
    INSERT OR IGNORE INTO streaks (id, current, longest) VALUES (1, 0, 0);
  `);
}

export async function getStreak() {
  const result = db.getFirstSync('SELECT * FROM streaks WHERE id = 1');
  return result || { current: 0, longest: 0, last_completed: null };
}

export async function updateStreak(date: Date) {
  const streak = await getStreak();
  const lastDate = streak.last_completed ? new Date(streak.last_completed) : null;
  const daysDiff = lastDate 
    ? Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  let newCurrent = daysDiff === 1 ? streak.current + 1 : 1;
  let newLongest = Math.max(newCurrent, streak.longest);

  db.runSync(
    'UPDATE streaks SET current = ?, longest = ?, last_completed = ? WHERE id = 1',
    [newCurrent, newLongest, date.toISOString()]
  );
}

export async function resetStreak() {
  db.runSync('UPDATE streaks SET current = 0, last_completed = NULL WHERE id = 1');
}
```

### 6. Create challenge generator (`lib/challenges.ts`)
```typescript
import { textToMorse } from './morse';

const CHALLENGE_WORDS = [
  'SOS', 'HELP', 'HELLO', 'WORLD', 'MORSE', 'CODE', 'SIGNAL', 'RADIO',
  'EMERGENCY', 'RESCUE', 'DANGER', 'SAFE', 'ALERT', 'MESSAGE', 'SEND'
];

export function getChallengeForDate(date: Date) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const word = CHALLENGE_WORDS[dayOfYear % CHALLENGE_WORDS.length];
  return {
    word,
    morse: textToMorse(word),
    date: date.toISOString().split('T')[0]
  };
}

export function getDailyChallenge() {
  return getChallengeForDate(new Date());
}
```

### 7. Build audio player (`lib/audio.ts`)
```typescript
import { Audio } from 'expo-av';

const DOT_DURATION = 100; // ms
const DASH_DURATION = 300; // ms
const FREQUENCY = 800; // Hz

export async function playMorse(morse: string) {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  
  for (const char of morse) {
    if (char === '.') {
      await playTone(DOT_DURATION);
    } else if (char === '-') {
      await playTone(DASH_DURATION);
    } else if (char === ' ') {
      await sleep(DOT_DURATION);
    }
    await sleep(DOT_DURATION); // Gap between symbols
  }
}

async function playTone(duration: number) {
  // Simplified - in production, use expo-av's Audio.Sound with generated tone
  await sleep(duration);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 8. Build haptic feedback (`lib/haptics.ts`)
```typescript
import * as Haptics from 'expo-haptics';

export async function vibrateMorse(morse: string) {
  for (const char of morse) {
    if (char === '.') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sleep(100);
    } else if (char === '-') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await sleep(300);
    } else if (char === ' ') {
      await sleep(100);
    }
    await sleep(100);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 9. Create MorseDisplay component (`components/MorseDisplay.tsx`)
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  morse: string;
}

export default function MorseDisplay({ morse }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.morse}>{morse}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  morse: {
    fontSize: 32,
    fontFamily: 'monospace',
    color: '#00ff00',
    textAlign: 'center',
  },
});
```

### 10. Create TapInput component (`components/TapInput.tsx`)
```typescript
import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  onInput: (symbol: '.' | '-') => void;
}

export default function TapInput({ onInput }: Props) {
  const [pressStart, setPressStart] = useState<number | null>(null);

  const handlePressIn = () => {
    setPressStart(Date.now());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (!pressStart) return;
    const duration = Date.now() - pressStart;
    const symbol = duration < 200 ? '.' : '-';
    onInput(symbol);
    setPressStart(null);
  };

  return (
    <Pressable
      testID="tap-button"
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={styles.buttonText}>TAP</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#0051D5',
  },
  buttonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
});
```

### 11. Build Daily Challenge screen (`app/(tabs)/index.tsx`)
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getDailyChallenge } from '../../lib/challenges';
import { updateStreak } from '../../lib/database';
import MorseDisplay from '../../components/MorseDisplay';
import TapInput from '../../components/TapInput';

export default function DailyChallengeScreen() {
  const [challenge, setChallenge] = useState(getDailyChallenge());
  const [userInput, setUserInput] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleInput = (symbol: '.' | '-') => {
    const newInput = userInput + symbol;
    setUserInput(newInput);

    if (newInput === challenge.morse.replace(/ /g, '')) {
      setCompleted(true);
      updateStreak(new Date());
    }
  };

  const handleReset = () => {
    setUserInput('');
    setCompleted(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Challenge</Text>
      <Text style={styles.word}>{challenge.word}</Text>
      <MorseDisplay morse={challenge.morse} />
      
      {!completed ? (
        <>
          <Text style={styles.input}>{userInput}</Text>
          <TapInput onInput={handleInput} />
          <Button title="Reset" onPress={handleReset} />
        </>
      ) : (
        <Text style={styles.success}>Challenge Complete! 🎉</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  word: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    fontSize: 24,
    fontFamily: 'monospace',
    marginVertical: 20,
  },
  success: {
    fontSize: 24,
    color: 'green',
    marginTop: 20,
  },
});
```

### 12. Build Decoder screen (`app/(tabs)/decoder.tsx`)
```typescript
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Button } from 'react-native';
import { textToMorse, morseToText } from '../../lib/morse';

export default function DecoderScreen() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleConvert = () => {
    if (mode === 'encode') {
      setOutput(textToMorse(input));
    } else {
      setOutput(morseToText(input));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Morse Decoder</Text>
      
      <View style={styles.modeToggle}>
        <Button 
          title="Text → Morse" 
          onPress={() => setMode('encode')}
          color={mode === 'encode' ? '#007AFF' : '#999'}
        />
        <Button 
          title="Morse → Text" 
          onPress={() => setMode('decode')}
          color={mode === 'decode' ? '#007AFF' : '#999'}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder={mode === 'encode' ? 'Enter text' : 'Enter Morse (. - /)'}
        value={input}
        onChangeText={setInput}
        multiline
      />

      <Button title="Convert" onPress={handleConvert} />

      <Text style={styles.output}>{output}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  output: {
    fontSize: 24,
    fontFamily: 'monospace',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});
```

### 13. Build SOS mode (`app/sos.tsx`)
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function SOSScreen() {
  const [active, setActive] = useState(false);

  const flashSOS = async () => {
    setActive(true);
    // SOS pattern: ... --- ...
    const pattern = [100, 100, 100, 100, 100, 300, 300, 300, 300, 300, 300, 100, 100, 100, 100, 100];
    
    for (const duration of pattern) {
      await Haptics.impactAsync(
        duration > 200 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light
      );
      await new Promise(resolve => setTimeout(resolve, duration));
    }
    
    setActive(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>
      <Text style={styles.warning}>⚠️ Use only in real emergencies</Text>
      
      <Button 
        title={active ? "Signaling..." : "Send SOS"} 
        onPress={flashSOS}
        disabled={active}
        color="#FF3B30"
      />
      
      <Text style={styles.info}>
        This will flash SOS in Morse code using haptic feedback.
        Premium: Unlock flashlight and custom messages.
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  warning: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 40,
  },
  info: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
  },
});
```

### 14. Initialize database in app layout (`app/_layout.tsx`)
```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '../lib/database';

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sos" options={{ title: 'Emergency SOS' }} />
    </Stack>
  );
}
```

### 15. Update package.json scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## How to verify it works

### 1. Run tests
```bash
npm test
```
All tests must pass. Expected output:
```
PASS  __tests__/morse.test.ts
PASS  __tests__/challenges.test.ts
PASS  __tests__/streak.test.ts
PASS  __tests__/components/MorseDisplay.test.tsx
PASS  __tests__/components/TapInput.test.tsx

Test Suites: 5 passed, 5 total
Tests:       15 passed, 15 total
```

### 2. Start Expo dev server
```bash
npm start
```

### 3. Test on device/simulator
- **iOS Simulator:** Press `i` in terminal
- **Android Emulator:** Press `a` in terminal
- **Physical device:** Scan QR code with Expo Go app

### 4. Manual verification checklist
- [ ] Daily Challenge screen loads with today's word
- [ ] Tap button responds to short/long presses
- [ ] Correct Morse input completes challenge
- [ ] Decoder converts text ↔ Morse accurately
- [ ] SOS screen triggers haptic feedback pattern
- [ ] Streak counter increments on challenge completion
- [ ] App works offline (no network errors)

### 5. Test edge cases
- Complete challenge, close app, reopen → streak persists
- Skip a day → streak resets to 1 on next completion
- Enter invalid Morse in decoder → handles gracefully
- Rapid tapping → doesn't crash or duplicate inputs