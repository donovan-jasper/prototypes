```markdown
# JustSwipe → SwipeClear

## 1. App Name
**SwipeClear** (or **ClearSwipe** if "SwipeClear" is taken)

## 2. One-line pitch
"Swipe to organize your digital life—messages, notifications, and apps—without lifting a finger."

## 3. Expanded vision
**Broadest audience:**
- **Overworked professionals** (25-45) drowning in work emails, Slack threads, and app notifications.
- **Busy parents** juggling school apps, grocery lists, and social media.
- **Digital minimalists** who want to reduce screen time but lack time for manual cleanup.
- **Power users** who want to automate context-switching (e.g., swiping to mute a work chat while cooking).

**Adjacent use cases:**
- **Corporate environments**: Swipe to archive work emails, mute team notifications, or "snooze" app alerts during meetings.
- **Student life**: Swipe to prioritize assignments, mute non-urgent notifications, or organize study materials.
- **Remote workers**: Swipe to separate personal and professional digital spaces.

**Why non-technical users want this:**
- No learning curve—just intuitive swipes.
- Reduces decision fatigue (e.g., "Should I delete this or archive it?").
- Works offline-first, syncing only when needed.

## 4. Tech stack
- **React Native (Expo)**: Cross-platform iOS/Android.
- **SQLite**: Local storage for fast swipe actions.
- **Minimal deps**: `@react-navigation/native`, `react-native-gesture-handler`, `expo-sqlite`.

## 5. Core features (MVP)
1. **Swipe-to-Archive**: One-handed gestures to clear messages, notifications, or app clutter.
2. **Contextual Swipes**: Swipe left to mute, right to prioritize, up to pin, down to delete.
3. **Auto-Sort**: AI-powered (optional) grouping of similar items (e.g., "Work Emails" folder).
4. **Cross-Device Sync**: Premium-only, but free tier syncs basic actions (e.g., archived messages).
5. **Quick Access Bar**: Floating widget to declutter current screen (e.g., hide non-essential apps).

## 6. Monetization strategy
- **Free tier**: 3 swipes/day, basic contextual actions (archive/mute).
- **Premium ($4.99/month)**:
  - Unlimited swipes.
  - AI sorting (e.g., "Organize my inbox by urgency").
  - Cross-device sync (e.g., archive a message on phone, see it archived on laptop).
- **Retention hooks**:
  - Gamification: "You’ve cleared 100 items this week—keep it up!"
  - Exclusive themes (e.g., "Minimalist Mode" for digital minimalists).

## 7. Skip if saturated
SKIP: No clear gap—existing apps (Clean Master, Notion, 1Password) already handle decluttering, but none offer gesture-based real-time organization.

## 8. File structure
```
swipeclear/
├── app/
│   ├── components/
│   │   ├── SwipeAction.tsx
│   │   └── QuickAccessBar.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── utils/
│   │   ├── db.ts (SQLite helpers)
│   │   └── swipeActions.ts
│   └── App.tsx
├── tests/
│   ├── swipeActions.test.ts
│   └── db.test.ts
└── package.json
```

## 9. Tests
```typescript
// swipeActions.test.ts
import { swipeToArchive } from '../app/utils/swipeActions';

test('swipeToArchive marks item as archived', () => {
  const item = { id: 1, archived: false };
  const result = swipeToArchive(item);
  expect(result.archived).toBe(true);
});
```

## 10. Implementation steps
1. **Set up Expo project**:
   ```bash
   npx create-expo-app swipeclear --template expo-template-blank-typescript
   cd swipeclear
   ```
2. **Install deps**:
   ```bash
   npx expo install @react-navigation/native react-native-gesture-handler expo-sqlite
   ```
3. **Build swipe component**:
   - Create `SwipeAction.tsx` with `PanResponder` for gestures.
4. **SQLite setup**:
   - Initialize DB in `db.ts` with tables for `messages`, `notifications`, `apps`.
5. **Test**:
   ```bash
   npm test
   ```

## 11. Verification
- Run in Expo Go: `npx expo start`.
- Test swipes on simulator/device.
- Run `npm test` to confirm logic.
```