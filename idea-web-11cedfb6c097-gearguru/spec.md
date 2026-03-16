```markdown
# App Spec: GearGuru

## 1. App Name
**MetaMender** (or **GearMender** if "MetaMender" is taken)

## 2. One-line pitch
"Your game's second brain—manage inventories, optimize builds, and dominate the meta across all your favorite RPGs and loot-shooters."

## 3. Expanded vision
**Primary audience:** Hardcore gamers (RPG/MMO/looter fans) who juggle multiple games and want a unified tool.
**Broadened audience:**
- **Casual players** who want to optimize progression without diving deep into complex mechanics.
- **Streamers/YouTubers** who need real-time inventory/build tracking for content creation.
- **Parents/guardians** who want to track in-game purchases (e.g., loot boxes) for their kids.
- **Game journalists/reviewers** who need quick access to meta insights and vendor schedules.
**Adjacent use cases:**
- **Gaming communities** (Discord bots, Reddit tools) could integrate with MetaMender for shared tracking.
- **Esports teams** could use it for roster inventory/build management.
- **Twitch/YouTube overlays** could pull data from MetaMender for streamers.

## 4. Tech stack
- **Frontend:** React Native (Expo) for cross-platform iOS/Android.
- **Local storage:** SQLite for offline inventory/build caching.
- **APIs:** RESTful endpoints for game data (with fallback to web scraping for private APIs).
- **Auth:** Firebase Auth for user accounts.
- **Push notifications:** Firebase Cloud Messaging (FCM).

## 5. Core features (MVP)
1. **Universal Inventory Manager** – Sync and organize gear across multiple games.
2. **Build Optimizer** – Auto-generate and compare builds with stat weights.
3. **Dynamic Vendor Alerts** – Push notifications for in-game vendor resets.
4. **Meta Tracker** – Real-time trends for gear/weapons (e.g., "X weapon is overpowered").
5. **Community Builds** – Share/import builds from a trusted database.

## 6. Monetization strategy
- **Free tier:** Basic inventory tracking for 2 games + limited build optimization.
- **Premium ($4.99/month, $49.99/year):**
  - Unlimited game integrations.
  - Advanced analytics (e.g., "Your builds are 15% weaker than the meta").
  - Ad-free experience.
  - Exclusive community builds from top players.
- **Why stay subscribed?**
  - **Time savings** (no manual tracking).
  - **Competitive edge** (meta insights).
  - **Community trust** (verified builds from top players).

## 7. Skip if saturated
No clear gap—official companion apps and third-party tools already exist, but MetaMender’s cross-game focus and community-driven meta insights could differentiate it.

## 8. File structure
```
metamender/
├── app/
│   ├── components/ (reusable UI)
│   ├── screens/ (main app flows)
│   ├── utils/ (API/helpers)
│   └── styles/ (global theme)
├── tests/
│   ├── unit/ (Jest tests)
│   └── e2e/ (Detox tests)
├── assets/ (icons, fonts)
└── config/ (Expo/Firebase setup)
```

## 9. Tests
```javascript
// Example: tests/unit/buildOptimizer.test.js
import { optimizeBuild } from '../../app/utils/buildOptimizer';

describe('Build Optimizer', () => {
  it('should generate a valid build for given stats', () => {
    const stats = { attack: 100, defense: 50 };
    const build = optimizeBuild(stats);
    expect(build).toHaveProperty('weapons');
    expect(build).toHaveProperty('armor');
  });
});
```

## 10. Implementation steps
1. **Setup:** `expo init metamender` → Configure Firebase/Expo.
2. **Core flow:**
   - Build game integration layer (mock APIs first).
   - Implement SQLite for offline storage.
   - Add build optimizer logic (start with simple stat weights).
3. **Testing:**
   - Write unit tests for core logic (e.g., build optimizer).
   - Add Detox tests for critical UI flows (e.g., inventory sync).
4. **Monetization:**
   - Implement free/paid tiers with feature flags.
   - Add in-app purchase hooks (RevenueCat for cross-platform).

## 11. Verification
- Run `npm test` → All Jest tests pass.
- Open in Expo Go → Test inventory sync and build generation.
- Check Firebase console → Verify push notifications work.
```