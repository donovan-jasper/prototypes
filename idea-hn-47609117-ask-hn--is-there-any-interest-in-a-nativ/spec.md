```markdown
# **App Name: "DiscordX"**

1. **App Name**: DiscordX
   - *Why?* Short, punchy, and implies "Discord Extreme" — positioning it as the fastest, most feature-rich alternative.

2. **One-line pitch**:
   "The fastest Discord client for mobile — instant load times, offline mode, and battery-friendly performance."

3. **Expanded vision**:
   - **Broadest audience**: Any Discord user who values speed, battery life, or offline access (gamers, remote workers, students, professionals). But also:
     - **Casual users** who want a smoother experience than the official app.
     - **Power users** who need advanced features like background sync and custom caching.
     - **Non-technical users** who just want a reliable, fast messaging app (even if they don’t use Discord).
   - **Adjacent use cases**:
     - A universal instant messaging client (could later integrate Slack, Teams, etc.).
     - A productivity tool for users who need offline access (e.g., field workers, travelers).
   - **Why non-technical users?** Because the performance benefits (faster, lighter) make it appealing to everyone, not just "techies."

4. **Tech stack**:
   - **React Native (Expo)**: Cross-platform (iOS/Android) with minimal native code.
   - **SQLite**: For local storage (messages, media caching).
   - **Qt/C++ (optional)**: For performance-critical parts (e.g., background sync).
   - **Minimal deps**: Only essential libraries (e.g., `react-native-sqlite-storage`, `expo-file-system`).

5. **Core features (MVP)**:
   - **Instant load times**: No webview lag.
   - **Offline mode**: Read/send messages without internet.
   - **Battery-friendly**: Optimized rendering and background sync.
   - **Custom caching**: Store media locally to reduce data usage.
   - **Dark mode + custom themes** (optional).

6. **Monetization strategy**:
   - **Free tier**: Basic offline access, dark mode, and fast loading.
   - **Paid (DiscordX Pro)**:
     - Unlimited background sync.
     - Advanced caching (store more media).
     - Custom themes/emotes.
     - Priority support.
   - **Price**: $4.99/month (mid-tier for mobile apps; higher than free but not premium).
   - **Retention hooks**:
     - Frequent performance updates (e.g., "New optimization: 30% faster!").
     - Exclusive features (e.g., "Pro users get early access to new servers").
     - "Lifetime Pro" option for power users.

7. **Skip if saturated?**
   - **NO**: The gap is clear (existing clients are either slow or lack offline features). Competitors (official Discord, Revolt, Element) don’t offer this exact combo.

8. **File structure**:
   ```
   discordx/
   ├── src/
   │   ├── components/ (UI)
   │   ├── hooks/ (React hooks)
   │   ├── storage/ (SQLite logic)
   │   ├── utils/ (performance optimizations)
   │   └── tests/ (Jest tests)
   ├── assets/ (icons, themes)
   ├── app.json (Expo config)
   └── package.json
   ```

9. **Tests (Jest)**:
   ```javascript
   // Example: src/tests/storage.test.js
   import { saveMessageOffline, getOfflineMessages } from '../storage';

   test('saves and retrieves offline messages', async () => {
     const testMsg = { id: '1', text: 'Hello' };
     await saveMessageOffline(testMsg);
     const messages = await getOfflineMessages();
     expect(messages).toContainEqual(testMsg);
   });
   ```

10. **Implementation steps**:
    - **Phase 1**: Set up Expo project + SQLite integration.
    - **Phase 2**: Build core UI (servers, channels, messages).
    - **Phase 3**: Add offline caching (SQLite + file system).
    - **Phase 4**: Optimize performance (reduce re-renders, lazy load).
    - **Phase 5**: Add Pro features (background sync, themes).

11. **Verification**:
    - Run `npm test` (Jest) to ensure storage logic works.
    - Test on device/simulator with Expo Go:
      - Verify offline mode (toggle airplane mode).
      - Check load times vs. official Discord app.
```