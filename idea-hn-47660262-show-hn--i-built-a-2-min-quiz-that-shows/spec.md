```markdown
# App Spec: Calibrate

## 1. App Name
**Calibrate** (or **Calibra** for brevity)

## 2. One-line pitch
"Train your gut instincts to make better decisions—every day."

## 3. Expanded vision
**Broadest audience:**
- **General public:** Anyone who makes frequent estimates (e.g., grocery budgets, travel plans).
- **Decision-heavy roles:** Sales reps, recruiters, parents, entrepreneurs.
- **Casual users:** Gamified self-improvement for anyone curious about cognitive biases.

**Adjacent use cases:**
- **Social proof:** Share calibration scores to compare with friends/family.
- **Team calibration:** Companies can use it for hiring/deal evaluation.
- **Therapeutic:** Helps anxiety-prone users feel more in control.

**Why non-technical users?**
- No math skills required—just intuitive feedback (e.g., "You overestimated by 20% last week").
- Works offline, so no internet dependency.

## 4. Tech stack
- **Frontend:** React Native (Expo) + TypeScript
- **Storage:** SQLite (local) + Firebase (sync for paid users)
- **Probabilistic models:** Custom Beta-PERT calculations (client-side)
- **Testing:** Jest + React Testing Library

## 5. Core features (MVP)
1. **Daily 2-minute quiz** (gamified with streaks, badges).
2. **Real-time decision tracker** (push notifications for calibration prompts).
3. **Progress dashboard** (visualize accuracy trends over time).
4. **AI feedback** (paid tier only: "Your 'restaurant bill' estimates are 15% off—improve with these tips").
5. **Offline mode** (syncs when connectivity returns).

## 6. Monetization strategy
- **Free tier:** Quiz + basic tracking (ads for feedback).
- **Paid ($4.99/month):** Full history, AI insights, and "calibration challenges" (e.g., "Estimate your next 5 meetings").
- **Lifetime ($29.99):** For power users (e.g., sales teams).

**Hook:** Free quiz is addictive (gamification). Paywall is for *actionable* insights.

**Retention:**
- Weekly "calibration score" emails (paid users only).
- Leaderboards (opt-in social features).

## 7. Skip if saturated
N/A—no direct competitors combine decision calibration + real-time tracking.

## 8. File structure
```
calibrate/
├── src/
│   ├── components/ (Quiz, Tracker, Dashboard)
│   ├── utils/ (betaDistribution.ts, storage.ts)
│   ├── screens/ (Home, History, Settings)
│   ├── types/ (Decision.ts, User.ts)
├── tests/
│   ├── utils.test.ts
│   ├── components.test.tsx
├── assets/ (icons, animations)
├── app.json (Expo config)
```

## 9. Tests
```typescript
// tests/utils.test.ts
import { calculateBetaDistribution } from '../src/utils/betaDistribution';

test('Beta distribution calculates correctly', () => {
  const result = calculateBetaDistribution(5, 2); // 5 successes, 2 failures
  expect(result.mean).toBeCloseTo(0.714, 2); // 5/(5+2)
});
```

## 10. Implementation steps
1. **Setup:** `expo init calibrate --template expo-template-blank-typescript`
2. **Core logic:**
   - Implement `betaDistribution.ts` (client-side calculations).
   - Build `DecisionTracker` component (SQLite storage).
3. **UI:**
   - Design quiz flow (React Navigation).
   - Add dashboard charts (Victory Native).
4. **Testing:** Write Jest tests for all utils.
5. **Monetization:**
   - Add Firebase for paid features.
   - Implement in-app purchases (RevenueCat).

## 11. Verification
- Run `npm test` (all tests pass).
- Test on Expo Go:
  - Quiz completes in 2 minutes.
  - Offline mode works (SQLite persists).
  - Push notifications trigger calibration prompts.
```