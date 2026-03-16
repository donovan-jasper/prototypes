# CareCircle

**One-line pitch:** Keep your whole family healthy without the chaos — appointments, records, and reminders in one place.

---

## Expanded Vision

### Who is this REALLY for?

**Primary audience:**
- Parents managing 2+ kids' pediatric care (vaccinations, sports physicals, dental checkups)
- Adult children coordinating care for aging parents across multiple specialists
- Families with special needs members requiring frequent therapy/medical appointments
- Multi-generational households where one person is the "health coordinator"

**Broadest audience:**
- Anyone managing healthcare for people who can't manage it themselves (children, elderly, disabled family members)
- Caregivers who need to share health information with co-parents, ex-spouses, or other family members
- People who want a single source of truth for their household's health data that isn't locked into one hospital system

**Adjacent use cases:**
- Pet health tracking (veterinary appointments, vaccinations, medications)
- School health form management (immunization records, physical exam forms)
- Insurance claim tracking and FSA/HSA receipt organization
- Medication refill coordination across family members
- Travel health prep (vaccination records for international trips)

**Why non-technical people want this:**
- Eliminates the "when was their last flu shot?" panic
- No more digging through email for appointment confirmations
- Stops the "did you take your medicine?" daily arguments
- Makes it easy to answer doctor questions about family medical history
- Reduces anxiety about forgetting important health tasks

---

## Tech Stack

- **Framework:** React Native (Expo SDK 52+)
- **Navigation:** Expo Router (file-based routing)
- **Local storage:** Expo SQLite for structured health data
- **Secure storage:** Expo SecureStore for sensitive credentials
- **Notifications:** Expo Notifications for reminders
- **Calendar:** Expo Calendar for appointment integration
- **File storage:** Expo FileSystem + DocumentPicker for health records
- **State management:** React Context + hooks (no Redux needed for MVP)
- **Forms:** React Hook Form
- **Date handling:** date-fns
- **Testing:** Jest + React Native Testing Library

---

## Core Features (MVP)

1. **Family Profile Management**
   - Add unlimited family members with photos, birthdate, insurance info
   - Quick-switch between family members
   - Share access with co-parents/caregivers via invite code

2. **Smart Health Reminders**
   - Set recurring reminders (annual checkup, quarterly dental, monthly medication refill)
   - Push notifications with snooze/complete actions
   - Auto-suggest next appointment based on last visit date
   - Calendar integration to block time

3. **Appointment Tracker**
   - Log past and upcoming appointments with provider, date, reason, notes
   - Attach photos of documents (insurance cards, prescriptions, test results)
   - Quick "add to calendar" button
   - Filter/search by family member or appointment type

4. **Health Record Vault**
   - Secure document storage (vaccination records, lab results, prescriptions)
   - OCR text extraction from photos for searchability (premium)
   - Export all records for a family member as PDF
   - Offline access to critical documents

5. **Medication Manager**
   - Track current medications per family member
   - Refill reminders with pharmacy info
   - Dosage instructions and notes
   - Drug interaction warnings (premium, via API)

---

## Monetization Strategy

### Free Tier (Hook)
- Up to 3 family members
- Unlimited appointments and reminders
- Basic document storage (up to 50 photos/PDFs)
- Manual data entry only

### Premium Tier: $4.99/month or $49.99/year (16% discount)
**Paywall triggers:**
- Adding 4th+ family member
- Uploading 51st+ document
- Accessing OCR text extraction
- Enabling medication interaction checks
- Exporting comprehensive health reports

**Why this price point:**
- Lower than typical health app subscriptions ($9.99+)
- Comparable to family streaming services (Disney+, Apple TV+)
- Annual option encourages long-term commitment
- Family value proposition justifies cost vs individual health apps

**Retention drivers:**
- Data lock-in (years of health history)
- Shared access with family members (network effect)
- Automated reminders become habitual
- Peace of mind from having records accessible during emergencies
- Annual checkup season (back-to-school, flu season) drives re-engagement

### Future revenue streams (post-MVP)
- Telehealth integration ($2 per consultation fee)
- Insurance claim filing assistance ($14.99/month add-on)
- Provider partnerships (referral fees)
- White-label for pediatric practices

---

## Market Position

**NOT skipping because:**
- MyChart/Epic are provider-locked (only work with specific hospital systems)
- Apple Health Records require iOS and don't handle family coordination
- Google Health shut down consumer product
- HealthTap is individual-focused, not family
- Existing "family health" apps have poor UX and limited adoption

**Clear gap:** No consumer app elegantly solves multi-person health coordination with shared access, cross-platform support, and provider-agnostic data entry.

---

## File Structure

```
carecircle/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Family dashboard
│   │   ├── appointments.tsx       # Appointment list
│   │   ├── reminders.tsx          # Reminder management
│   │   ├── records.tsx            # Document vault
│   │   └── settings.tsx           # Settings & premium
│   ├── family/
│   │   ├── [id].tsx               # Family member detail
│   │   └── add.tsx                # Add family member
│   ├── appointment/
│   │   ├── [id].tsx               # Appointment detail
│   │   └── add.tsx                # Add appointment
│   ├── medication/
│   │   ├── [id].tsx               # Medication detail
│   │   └── add.tsx                # Add medication
│   ├── _layout.tsx                # Root layout
│   └── +not-found.tsx
├── components/
│   ├── FamilyMemberCard.tsx
│   ├── AppointmentCard.tsx
│   ├── ReminderCard.tsx
│   ├── DocumentCard.tsx
│   ├── MedicationCard.tsx
│   ├── PremiumBadge.tsx
│   └── EmptyState.tsx
├── lib/
│   ├── database.ts                # SQLite setup & migrations
│   ├── familyService.ts           # Family CRUD operations
│   ├── appointmentService.ts      # Appointment CRUD
│   ├── reminderService.ts         # Reminder CRUD + scheduling
│   ├── documentService.ts         # Document storage
│   ├── medicationService.ts       # Medication CRUD
│   ├── notificationService.ts     # Push notification logic
│   └── premiumService.ts          # Subscription validation
├── hooks/
│   ├── useDatabase.ts
│   ├── useFamilyMembers.ts
│   ├── useAppointments.ts
│   ├── useReminders.ts
│   └── usePremium.ts
├── constants/
│   ├── Colors.ts
│   └── AppointmentTypes.ts
├── types/
│   └── index.ts                   # TypeScript interfaces
├── __tests__/
│   ├── familyService.test.ts
│   ├── appointmentService.test.ts
│   ├── reminderService.test.ts
│   ├── medicationService.test.ts
│   └── notificationService.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Tests

### `__tests__/familyService.test.ts`
```typescript
import { addFamilyMember, getFamilyMembers, updateFamilyMember, deleteFamilyMember } from '../lib/familyService';
import * as SQLite from 'expo-sqlite';

jest.mock('expo-sqlite');

describe('Family Service', () => {
  it('should add a family member', async () => {
    const member = await addFamilyMember({
      name: 'John Doe',
      birthdate: '2020-01-01',
      relationship: 'Son',
    });
    expect(member.id).toBeDefined();
    expect(member.name).toBe('John Doe');
  });

  it('should retrieve all family members', async () => {
    const members = await getFamilyMembers();
    expect(Array.isArray(members)).toBe(true);
  });

  it('should update a family member', async () => {
    const updated = await updateFamilyMember(1, { name: 'Jane Doe' });
    expect(updated.name).toBe('Jane Doe');
  });

  it('should delete a family member', async () => {
    await deleteFamilyMember(1);
    const members = await getFamilyMembers();
    expect(members.find(m => m.id === 1)).toBeUndefined();
  });
});
```

### `__tests__/appointmentService.test.ts`
```typescript
import { addAppointment, getAppointmentsByMember, updateAppointment } from '../lib/appointmentService';

describe('Appointment Service', () => {
  it('should add an appointment', async () => {
    const appointment = await addAppointment({
      familyMemberId: 1,
      type: 'Pediatrician',
      provider: 'Dr. Smith',
      date: '2026-04-15T10:00:00Z',
      notes: 'Annual checkup',
    });
    expect(appointment.id).toBeDefined();
  });

  it('should retrieve appointments for a family member', async () => {
    const appointments = await getAppointmentsByMember(1);
    expect(appointments.length).toBeGreaterThan(0);
  });

  it('should update an appointment', async () => {
    const updated = await updateAppointment(1, { notes: 'Rescheduled' });
    expect(updated.notes).toBe('Rescheduled');
  });
});
```

### `__tests__/reminderService.test.ts`
```typescript
import { addReminder, getActiveReminders, scheduleNotification } from '../lib/reminderService';

describe('Reminder Service', () => {
  it('should add a reminder', async () => {
    const reminder = await addReminder({
      familyMemberId: 1,
      title: 'Flu shot',
      frequency: 'yearly',
      nextDate: '2026-10-01',
    });
    expect(reminder.id).toBeDefined();
  });

  it('should retrieve active reminders', async () => {
    const reminders = await getActiveReminders();
    expect(Array.isArray(reminders)).toBe(true);
  });

  it('should schedule a notification', async () => {
    const notificationId = await scheduleNotification({
      title: 'Reminder',
      body: 'Time for flu shot',
      trigger: { date: new Date('2026-10-01') },
    });
    expect(notificationId).toBeDefined();
  });
});
```

### `__tests__/medicationService.test.ts`
```typescript
import { addMedication, getMedicationsByMember, updateMedication } from '../lib/medicationService';

describe('Medication Service', () => {
  it('should add a medication', async () => {
    const medication = await addMedication({
      familyMemberId: 1,
      name: 'Amoxicillin',
      dosage: '250mg',
      frequency: 'twice daily',
      refillDate: '2026-04-01',
    });
    expect(medication.id).toBeDefined();
  });

  it('should retrieve medications for a family member', async () => {
    const medications = await getMedicationsByMember(1);
    expect(medications.length).toBeGreaterThan(0);
  });
});
```

### `__tests__/notificationService.test.ts`
```typescript
import { requestPermissions, scheduleReminder, cancelReminder } from '../lib/notificationService';

describe('Notification Service', () => {
  it('should request notification permissions', async () => {
    const granted = await requestPermissions();
    expect(typeof granted).toBe('boolean');
  });

  it('should schedule a reminder notification', async () => {
    const id = await scheduleReminder('Test reminder', new Date());
    expect(id).toBeDefined();
  });

  it('should cancel a scheduled notification', async () => {
    await cancelReminder('test-id');
    // No error means success
  });
});
```

---

## Implementation Steps

### 1. Project Setup
```bash
npx create-expo-app carecircle --template tabs
cd carecircle
npx expo install expo-sqlite expo-secure-store expo-notifications expo-calendar expo-document-picker expo-file-system
npm install react-hook-form date-fns
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

### 2. Configure TypeScript Types (`types/index.ts`)
```typescript
export interface FamilyMember {
  id: number;
  name: string;
  birthdate: string;
  relationship: string;
  photoUri?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  familyMemberId: number;
  type: string;
  provider: string;
  date: string;
  location?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface Reminder {
  id: number;
  familyMemberId: number;
  title: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  notificationId?: string;
  active: boolean;
  createdAt: string;
}

export interface Document {
  id: number;
  familyMemberId: number;
  title: string;
  type: string;
  fileUri: string;
  uploadDate: string;
}

export interface Medication {
  id: number;
  familyMemberId: number;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy?: string;
  refillDate?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}
```

### 3. Database Setup (`lib/database.ts`)
```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('carecircle.db');

export const initDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birthdate TEXT NOT NULL,
      relationship TEXT NOT NULL,
      photo_uri TEXT,
      insurance_provider TEXT,
      insurance_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_member_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_member_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      frequency TEXT NOT NULL,
      next_date TEXT NOT NULL,
      notification_id TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_member_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      file_uri TEXT NOT NULL,
      upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_member_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      prescribed_by TEXT,
      refill_date TEXT,
      notes TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
    );
  `);
};

export default db;
```

### 4. Family Service (`lib/familyService.ts`)
```typescript
import db from './database';
import { FamilyMember } from '../types';

export const addFamilyMember = async (data: Omit<FamilyMember, 'id' | 'createdAt'>): Promise<FamilyMember> => {
  const result = await db.runAsync(
    'INSERT INTO family_members (name, birthdate, relationship, photo_uri, insurance_provider, insurance_id) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.birthdate, data.relationship, data.photoUri || null, data.insuranceProvider || null, data.insuranceId || null]
  );
  
  const member = await db.getFirstAsync<FamilyMember>(
    'SELECT * FROM family_members WHERE id = ?',
    [result.lastInsertRowId]
  );
  
  return member!;
};

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  return await db.getAllAsync<FamilyMember>('SELECT * FROM family_members ORDER BY created_at DESC');
};

export const getFamilyMember = async (id: number): Promise<FamilyMember | null> => {
  return await db.getFirstAsync<FamilyMember>('SELECT * FROM family_members WHERE id = ?', [id]);
};

export const updateFamilyMember = async (id: number, data: Partial<FamilyMember>): Promise<FamilyMember> => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  await db.runAsync(`UPDATE family_members SET ${fields} WHERE id = ?`, values);
  
  return (await getFamilyMember(id))!;
};

export const deleteFamilyMember = async (id: number): Promise<void> => {
  await db.runAsync('DELETE FROM family_members WHERE id = ?', [id]);
};
```

### 5. Appointment Service (`lib/appointmentService.ts`)
```typescript
import db from './database';
import { Appointment } from '../types';

export const addAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'completed'>): Promise<Appointment> => {
  const result = await db.runAsync(
    'INSERT INTO appointments (family_member_id, type, provider, date, location, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [data.familyMemberId, data.type, data.provider, data.date, data.location || null, data.notes || null]
  );
  
  return (await db.getFirstAsync<Appointment>('SELECT * FROM appointments WHERE id = ?', [result.lastInsertRowId]))!;
};

export const getAppointmentsByMember = async (familyMemberId: number): Promise<Appointment[]> => {
  return await db.getAllAsync<Appointment>(
    'SELECT * FROM appointments WHERE family_member_id = ? ORDER BY date DESC',
    [familyMemberId]
  );
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  return await db.getAllAsync<Appointment>('SELECT * FROM appointments ORDER BY date DESC');
};

export const updateAppointment = async (id: number, data: Partial<Appointment>): Promise<Appointment> => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  await db.runAsync(`UPDATE appointments SET ${fields} WHERE id = ?`, values);
  
  return (await db.getFirstAsync<Appointment>('SELECT * FROM appointments WHERE id = ?', [id]))!;
};

export const deleteAppointment = async (id: number): Promise<void> => {
  await db.runAsync('DELETE FROM appointments WHERE id = ?', [id]);
};
```

### 6. Reminder Service (`lib/reminderService.ts`)
```typescript
import db from './database';
import { Reminder } from '../types';
import * as Notifications from 'expo-notifications';
import { addMonths, addWeeks, addDays, addYears } from 'date-fns';

export const addReminder = async (data: Omit<Reminder, 'id' | 'createdAt' | 'active' | 'notificationId'>): Promise<Reminder> => {
  const result = await db.runAsync(
    'INSERT INTO reminders (family_member_id, title, frequency, next_date) VALUES (?, ?, ?, ?)',
    [data.familyMemberId, data.title, data.frequency, data.nextDate]
  );
  
  const reminder = (await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [result.lastInsertRowId]))!;
  
  // Schedule notification
  const notificationId = await scheduleReminderNotification(reminder);
  await db.runAsync('UPDATE reminders SET notification_id = ? WHERE id = ?', [notificationId, reminder.id]);
  
  return { ...reminder, notificationId };
};

export const getActiveReminders = async (): Promise<Reminder[]> => {
  return await db.getAllAsync<Reminder>('SELECT * FROM reminders WHERE active = 1 ORDER BY next_date ASC');
};

export const getRemindersByMember = async (familyMemberId: number): Promise<Reminder[]> => {
  return await db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE family_member_id = ? AND active = 1 ORDER BY next_date ASC',
    [familyMemberId]
  );
};

export const updateReminder = async (id: number, data: Partial<Reminder>): Promise<Reminder> => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  await db.runAsync(`UPDATE reminders SET ${fields} WHERE id = ?`, values);
  
  return (await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]))!;
};

export const completeReminder = async (id: number): Promise<void> => {
  const reminder = await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]);
  if (!reminder) return;
  
  // Calculate next date based on frequency
  let nextDate = new Date(reminder.nextDate);
  switch (reminder.frequency) {
    case 'daily':
      nextDate = addDays(nextDate, 1);
      break;
    case 'weekly':
      nextDate = addWeeks(nextDate, 1);
      break;
    case 'monthly':
      nextDate = addMonths(nextDate, 1);
      break;
    case 'yearly':
      nextDate = addYears(nextDate, 1);
      break;
    case 'once':
      await db.runAsync('UPDATE reminders SET active = 0 WHERE id = ?', [id]);
      if (reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }
      return;
  }
  
  // Cancel old notification and schedule new one
  if (reminder.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
  }
  
  const notificationId = await scheduleReminderNotification({ ...reminder, nextDate: nextDate.toISOString() });
  await db.runAsync('UPDATE reminders SET next_date = ?, notification_id = ? WHERE id = ?', [nextDate.toISOString(), notificationId, id]);
};

const scheduleReminderNotification = async (reminder: Reminder): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Health Reminder',
      body: reminder.title,
      data: { reminderId: reminder.id },
    },
    trigger: {
      date: new Date(reminder.nextDate),
    },
  });
};
```

### 7. Notification Service (`lib/notificationService.ts`)
```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  return finalStatus === 'granted';
};

export const scheduleReminder = async (title: string, date: Date): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: 'CareCircle Reminder',
      body: title,
    },
    trigger: { date },
  });
};

export const cancelReminder = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};
```

### 8. Medication Service (`lib/medicationService.ts`)
```typescript
import db from './database';
import { Medication } from '../types';

export const addMedication = async (data: Omit<Medication, 'id' | 'createdAt' | 'active'>): Promise<Medication> => {
  const result = await db.runAsync(
    'INSERT INTO medications (family_member_id, name, dosage, frequency, prescribed_by, refill_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.familyMemberId, data.name, data.dosage, data.frequency, data.prescribedBy || null, data.refillDate || null, data.notes || null]
  );
  
  return (await db.getFirstAsync<Medication>('SELECT * FROM medications WHERE id = ?', [result.lastInsertRowId]))!;
};

export const getMedicationsByMember = async (familyMemberId: number): Promise<Medication[]> => {
  return await db.getAllAsync<Medication>(
    'SELECT * FROM medications WHERE family_member_id = ? AND active = 1 ORDER BY created_at DESC',
    [familyMemberId]
  );
};

export const updateMedication = async (id: number, data: Partial<Medication>): Promise<Medication> => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  await db.runAsync(`UPDATE medications SET ${fields} WHERE id = ?`, values);
  
  return (await db.getFirstAsync<Medication>('SELECT * FROM medications WHERE id = ?', [id]))!;
};

export const deleteMedication = async (id: number): Promise<void> => {
  await db.runAsync('UPDATE medications SET active = 0 WHERE id = ?', [id]);
};
```

### 9. Document Service (`lib/documentService.ts`)
```typescript
import db from './database';
import { Document } from '../types';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export const addDocument = async (familyMemberId: number, title: string, type: string, fileUri: string): Promise<Document> => {
  const result = await db.runAsync(
    'INSERT INTO documents (family_member_id, title, type, file_uri) VALUES (?, ?, ?, ?)',
    [familyMemberId, title, type, fileUri]
  );
  
  return (await db.getFirstAsync<Document>('SELECT * FROM documents WHERE id = ?', [result.lastInsertRowId]))!;
};

export const getDocumentsByMember = async (familyMemberId: number): Promise<Document[]> => {
  return await db.getAllAsync<Document>(
    'SELECT * FROM documents WHERE family_member_id = ? ORDER BY upload_date DESC',
    [familyMemberId]
  );
};

export const pickDocument = async (): Promise<DocumentPicker.DocumentPickerResult> => {
  return await DocumentPicker.getDocumentAsync({
    type: ['image/*', 'application/pdf'],
    copyToCacheDirectory: true,
  });
};

export const deleteDocument = async (id: number): Promise<void> => {
  const doc = await db.getFirstAsync<Document>('SELECT * FROM documents WHERE id = ?', [id]);
  if (doc) {
    await FileSystem.deleteAsync(doc.fileUri, { idempotent: true });
    await db.runAsync('DELETE FROM documents WHERE id = ?', [id]);
  }
};
```

### 10. Premium Service (`lib/premiumService.ts`)
```typescript
import * as SecureStore from 'expo-secure-store';

const PREMIUM_KEY = 'carecircle_premium';

export const isPremium = async (): Promise<boolean> => {
  const value = await SecureStore.getItemAsync(PREMIUM_KEY);
  return value === 'true';
};

export const setPremium = async (premium: boolean): Promise<void> => {
  await SecureStore.setItemAsync(PREMIUM_KEY, premium.toString());
};

export const checkFamilyLimit = async (currentCount: number): Promise<boolean> => {
  const premium = await isPremium();
  return premium || currentCount < 3;
};

export const checkDocumentLimit = async (currentCount: number): Promise<boolean> => {
  const premium = await isPremium();
  return premium || currentCount < 50;
};
```

### 11. Custom Hooks (`hooks/`)

**`hooks/useDatabase.ts`:**
```typescript
import { useEffect, useState } from 'react';
import { initDatabase } from '../lib/database';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setIsReady(true));
  }, []);

  return isReady;
};
```

**`hooks/useFamilyMembers.ts`:**
```typescript
import { useState, useEffect } from 'react';
import { FamilyMember } from '../types';
import { getFamilyMembers } from '../lib/familyService';

export const useFamilyMembers = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const data = await getFamilyMembers();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { members, loading,