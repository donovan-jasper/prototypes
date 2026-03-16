# VoxCrew

## One-line pitch
Stay connected with your team hands-free—voice commands, AI assistance, and real-time updates for workers who can't stop to type.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** Field workers across industries who need to communicate and update systems while their hands are busy or dirty:
- Construction crews coordinating on-site
- Delivery drivers updating status between stops
- Warehouse staff managing inventory while moving pallets
- Healthcare workers (nurses, EMTs) documenting patient info
- Maintenance technicians logging repairs
- Restaurant/retail managers coordinating staff
- Parents managing household tasks while cooking or driving

**Broadest audience:** Anyone who needs to communicate or capture information when typing is inconvenient—which is most mobile users at some point in their day.

**Adjacent use cases:**
- Voice journaling for busy professionals
- Hands-free meeting notes and action items
- Voice-based task management for ADHD users
- Accessibility tool for users with mobility limitations
- Family coordination hub (grocery lists, schedules, reminders)
- Fitness tracking with voice logging during workouts

**Why non-technical people want this:**
- No learning curve—just talk naturally
- Eliminates the friction of opening apps, typing, and switching contexts
- AI handles the organization and formatting automatically
- Works while driving, cooking, exercising, or multitasking
- Makes professional communication accessible to non-desk workers

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Voice:** Expo Speech API + Web Speech API fallback
- **AI:** OpenAI Whisper API (transcription) + GPT-4 (intent parsing)
- **Storage:** SQLite (expo-sqlite) for local message/task cache
- **Auth:** Expo AuthSession + JWT
- **Push:** Expo Notifications
- **State:** Zustand (lightweight, no Redux overhead)
- **Testing:** Jest + React Native Testing Library

## Core features (MVP)

1. **Voice-first messaging**
   - Push-to-talk or continuous listening mode
   - AI transcribes and formats messages automatically
   - Send to channels or direct messages
   - Playback received messages as audio

2. **Smart task capture**
   - Say "remind me to..." or "add task..." and AI extracts action items
   - Auto-categorizes by project/location/urgency
   - Voice confirmation of captured tasks

3. **AI assistant queries**
   - Ask questions about past conversations, tasks, or team knowledge
   - "What did Sarah say about the electrical panel?"
   - "When is the concrete delivery scheduled?"

4. **Offline-first sync**
   - Record voice messages offline, sync when connected
   - Local SQLite cache for recent conversations
   - Background sync with conflict resolution

5. **Quick voice commands**
   - "Status update: finished north wall framing"
   - "Check in at site" (auto-logs location + time)
   - "What's next on my list?"

## Monetization strategy

**Free tier (hook):**
- 1 workspace, up to 5 team members
- 50 voice messages/month
- 7-day message history
- Basic AI transcription

**Pro tier ($12/month per user):**
- Unlimited workspaces and team size
- Unlimited voice messages
- Unlimited message history
- Advanced AI (intent parsing, smart summaries)
- Offline mode with full sync
- Priority support

**Team tier ($20/month per user, min 10 users):**
- Everything in Pro
- Admin dashboard and analytics
- Custom integrations (Procore, Fieldwire, etc.)
- Dedicated account manager
- SSO and advanced security

**What makes people STAY subscribed:**
- Network effects—team adoption creates lock-in
- Voice message history becomes institutional knowledge
- AI learns team-specific terminology and workflows
- Switching cost: losing conversation history and trained AI

**Reasoning:**
- $12/month is impulse-buy territory for individuals
- Lower than Slack ($8.75/user) but higher value for field workers
- Team tier targets enterprise budgets ($200/month for 10 users)
- Freemium converts 3-5% at industry standard rates

## File structure

```
voxcrew/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Messages/channels
│   │   ├── tasks.tsx          # Task list
│   │   └── settings.tsx       # User settings
│   ├── channel/[id].tsx       # Channel detail
│   └── _layout.tsx
├── components/
│   ├── VoiceButton.tsx        # Push-to-talk button
│   ├── MessageBubble.tsx      # Chat message display
│   ├── TaskCard.tsx           # Task item
│   └── AudioPlayer.tsx        # Playback controls
├── lib/
│   ├── db.ts                  # SQLite setup
│   ├── voice.ts               # Voice recording/transcription
│   ├── ai.ts                  # AI API calls
│   ├── sync.ts                # Offline sync logic
│   └── auth.ts                # Authentication
├── store/
│   ├── messages.ts            # Message state (Zustand)
│   ├── tasks.ts               # Task state
│   └── user.ts                # User/auth state
├── types/
│   └── index.ts               # TypeScript types
├── __tests__/
│   ├── voice.test.ts
│   ├── ai.test.ts
│   ├── sync.test.ts
│   └── db.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

### `__tests__/voice.test.ts`
```typescript
import { transcribeAudio, extractIntent } from '../lib/voice';

describe('Voice transcription', () => {
  it('should transcribe audio to text', async () => {
    const mockAudio = 'base64audiodata';
    const result = await transcribeAudio(mockAudio);
    expect(result).toHaveProperty('text');
    expect(typeof result.text).toBe('string');
  });
});

describe('Intent extraction', () => {
  it('should identify task creation intent', () => {
    const text = 'Remind me to check the electrical panel tomorrow';
    const intent = extractIntent(text);
    expect(intent.type).toBe('task');
    expect(intent.action).toBe('create');
  });

  it('should identify message intent', () => {
    const text = 'Tell the team we finished the north wall';
    const intent = extractIntent(text);
    expect(intent.type).toBe('message');
  });
});
```

### `__tests__/ai.test.ts`
```typescript
import { parseVoiceCommand, generateResponse } from '../lib/ai';

describe('AI command parsing', () => {
  it('should parse status update command', async () => {
    const command = 'Status update: finished framing';
    const parsed = await parseVoiceCommand(command);
    expect(parsed.type).toBe('status_update');
    expect(parsed.content).toContain('finished framing');
  });

  it('should parse query command', async () => {
    const command = 'What did Sarah say about the delivery?';
    const parsed = await parseVoiceCommand(command);
    expect(parsed.type).toBe('query');
    expect(parsed.target).toBe('Sarah');
  });
});
```

### `__tests__/sync.test.ts`
```typescript
import { queueOfflineMessage, syncPendingMessages } from '../lib/sync';
import { db } from '../lib/db';

describe('Offline sync', () => {
  beforeEach(async () => {
    await db.execAsync('DELETE FROM pending_messages');
  });

  it('should queue messages when offline', async () => {
    const message = { text: 'Test message', channelId: '123' };
    await queueOfflineMessage(message);
    
    const pending = await db.getAllAsync('SELECT * FROM pending_messages');
    expect(pending.length).toBe(1);
  });

  it('should sync pending messages when online', async () => {
    await queueOfflineMessage({ text: 'Message 1', channelId: '123' });
    await queueOfflineMessage({ text: 'Message 2', channelId: '123' });
    
    const synced = await syncPendingMessages();
    expect(synced).toBe(2);
    
    const pending = await db.getAllAsync('SELECT * FROM pending_messages');
    expect(pending.length).toBe(0);
  });
});
```

### `__tests__/db.test.ts`
```typescript
import { initDatabase, saveMessage, getMessages } from '../lib/db';

describe('Database operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should save and retrieve messages', async () => {
    const message = {
      id: '1',
      text: 'Test message',
      channelId: '123',
      userId: 'user1',
      timestamp: Date.now()
    };
    
    await saveMessage(message);
    const messages = await getMessages('123');
    
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].text).toBe('Test message');
  });
});
```

## Implementation steps

### 1. Project initialization
```bash
npx create-expo-app voxcrew --template blank-typescript
cd voxcrew
npx expo install expo-router expo-sqlite expo-av expo-speech expo-notifications
npm install zustand @react-native-async-storage/async-storage
npm install -D jest @testing-library/react-native @types/jest
```

### 2. Configure app.json
```json
{
  "expo": {
    "name": "VoxCrew",
    "slug": "voxcrew",
    "scheme": "voxcrew",
    "plugins": [
      "expo-router",
      [
        "expo-av",
        {
          "microphonePermission": "Allow VoxCrew to access your microphone for voice messages."
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.voxcrew.app",
      "supportsTablet": true
    },
    "android": {
      "package": "com.voxcrew.app",
      "permissions": ["RECORD_AUDIO", "INTERNET"]
    }
  }
}
```

### 3. Set up database schema (`lib/db.ts`)
```typescript
import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('voxcrew.db');

export async function initDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      audio_url TEXT,
      timestamp INTEGER NOT NULL,
      synced INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date INTEGER,
      completed INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_messages (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
  `);
}

export async function saveMessage(message: any) {
  await db.runAsync(
    'INSERT INTO messages (id, channel_id, user_id, text, audio_url, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [message.id, message.channelId, message.userId, message.text, message.audioUrl || null, message.timestamp]
  );
}

export async function getMessages(channelId: string) {
  return await db.getAllAsync(
    'SELECT * FROM messages WHERE channel_id = ? ORDER BY timestamp DESC LIMIT 100',
    [channelId]
  );
}
```

### 4. Implement voice recording (`lib/voice.ts`)
```typescript
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let recording: Audio.Recording | null = null;

export async function startRecording() {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
  } catch (err) {
    console.error('Failed to start recording', err);
  }
}

export async function stopRecording() {
  if (!recording) return null;

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;
  return uri;
}

export async function transcribeAudio(audioUri: string): Promise<{ text: string }> {
  // Read audio file as base64
  const base64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Call OpenAI Whisper API
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: base64,
      model: 'whisper-1',
    }),
  });

  const data = await response.json();
  return { text: data.text };
}

export function extractIntent(text: string) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('remind me') || lowerText.includes('add task')) {
    return { type: 'task', action: 'create' };
  }
  
  if (lowerText.includes('tell') || lowerText.includes('message')) {
    return { type: 'message', action: 'send' };
  }
  
  if (lowerText.includes('what') || lowerText.includes('when') || lowerText.includes('who')) {
    return { type: 'query', action: 'search' };
  }
  
  return { type: 'message', action: 'send' };
}
```

### 5. Implement AI parsing (`lib/ai.ts`)
```typescript
export async function parseVoiceCommand(text: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Parse voice commands into structured actions. Return JSON with type (message/task/query/status_update), content, and any extracted metadata.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function generateResponse(query: string, context: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for field workers. Answer questions based on conversation history and task data.'
        },
        {
          role: 'user',
          content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${query}`
        }
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### 6. Implement offline sync (`lib/sync.ts`)
```typescript
import { db } from './db';
import NetInfo from '@react-native-community/netinfo';

export async function queueOfflineMessage(message: any) {
  const id = Date.now().toString();
  await db.runAsync(
    'INSERT INTO pending_messages (id, data, created_at) VALUES (?, ?, ?)',
    [id, JSON.stringify(message), Date.now()]
  );
}

export async function syncPendingMessages() {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return 0;

  const pending = await db.getAllAsync('SELECT * FROM pending_messages ORDER BY created_at ASC');
  
  let synced = 0;
  for (const item of pending) {
    try {
      const message = JSON.parse(item.data);
      // Send to backend API
      await fetch('https://api.voxcrew.com/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      
      await db.runAsync('DELETE FROM pending_messages WHERE id = ?', [item.id]);
      synced++;
    } catch (err) {
      console.error('Failed to sync message', err);
    }
  }
  
  return synced;
}
```

### 7. Create Zustand stores (`store/messages.ts`)
```typescript
import { create } from 'zustand';

interface Message {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  audioUrl?: string;
  timestamp: number;
}

interface MessageStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ 
    messages: [message, ...state.messages] 
  })),
  setMessages: (messages) => set({ messages }),
}));
```

### 8. Build VoiceButton component (`components/VoiceButton.tsx`)
```typescript
import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { startRecording, stopRecording, transcribeAudio } from '../lib/voice';

export default function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);

  const handlePress = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      setIsRecording(false);
      
      if (uri) {
        const { text } = await transcribeAudio(uri);
        onTranscript(text);
      }
    } else {
      await startRecording();
      setIsRecording(true);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isRecording && styles.recording]} 
      onPress={handlePress}
    >
      <Text style={styles.text}>{isRecording ? '🔴 Stop' : '🎤 Talk'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recording: {
    backgroundColor: '#FF3B30',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### 9. Build main messages screen (`app/(tabs)/index.tsx`)
```typescript
import { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useMessageStore } from '../../store/messages';
import { getMessages, saveMessage } from '../../lib/db';
import VoiceButton from '../../components/VoiceButton';
import MessageBubble from '../../components/MessageBubble';

export default function MessagesScreen() {
  const { messages, setMessages, addMessage } = useMessageStore();
  const [channelId] = useState('default');

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    const msgs = await getMessages(channelId);
    setMessages(msgs);
  }

  async function handleTranscript(text: string) {
    const message = {
      id: Date.now().toString(),
      channelId,
      userId: 'current-user',
      text,
      timestamp: Date.now(),
    };
    
    await saveMessage(message);
    addMessage(message);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
      />
      <VoiceButton onTranscript={handleTranscript} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### 10. Configure Jest (`