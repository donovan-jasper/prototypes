```markdown
# App Spec: SkillSprint

## 1. App Name
**SkillSprint** – A punchy, alliterative name that evokes speed and mastery.

## 2. One-line pitch
"Train your brain with bite-sized challenges—gamified skill-building for busy adults."

## 3. Expanded vision
**Primary Audience:**
- **Lifelong learners** (any skill, from cooking to coding)
- **Professionals** (lawyers, doctors, journalists) needing niche efficiency
- **Students** (preparing for exams, language fluency)
- **Corporate teams** (onboarding, upskilling)

**Adjacent Use Cases:**
- **Memory training** (for memory athletes)
- **Therapeutic skill-building** (ADHD, autism support)
- **Gamified onboarding** (new hires, remote teams)
- **Voice-to-text mastery** (transcriptionists, journalists)

**Why Non-Technical Users Care:**
- **No time for courses** → 5-minute daily challenges
- **No motivation alone** → Social leaderboards, team battles
- **No feedback** → AI-powered real-time corrections

## 4. Tech stack
- **Frontend:** React Native (Expo) + TypeScript
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **Storage:** SQLite (offline progress)
- **AI/ML:** TensorFlow Lite (on-device feedback)
- **Testing:** Jest + React Testing Library

## 5. Core features (MVP)
1. **Micro-Challenges** – 30-90s skill drills with instant feedback
2. **Social Streaks** – Daily login bonuses + team competitions
3. **AI Coach** – Voice/text input analysis (e.g., shorthand accuracy)
4. **Progress Dashboard** – Visual skill growth over time
5. **Skill Packs** – One-time purchases (e.g., "Medical Dictation")

## 6. Monetization strategy
- **Free tier:** Unlimited challenges, ads, basic analytics
- **Premium ($4.99/month):**
  - Offline mode
  - Advanced analytics (weakness reports)
  - Ad-free
  - Custom skill packs
- **One-time packs:** $9.99 (e.g., "Lawyer’s Typing")
- **Hook:** Free tier is addictive (streaks, leaderboards)
- **Paywall:** Premium removes friction (no ads, deeper insights)

## 7. Skip if saturated
SKIP: Duolingo and Memrise already dominate gamified learning. **Gap:** Real-time AI feedback + professional skill packs.

## 8. File structure
```
skillsprint/
├── src/
│   ├── components/ (reusable UI)
│   ├── screens/ (challenges, dashboard, etc.)
│   ├── hooks/ (auth, analytics)
│   ├── utils/ (AI feedback logic)
│   └── types/ (TypeScript interfaces)
├── tests/
│   ├── unit/ (Jest tests)
│   └── e2e/ (Detox tests)
├── assets/ (icons, sounds)
└── firebase.json (config)
```

## 9. Tests
```typescript
// Example: Challenge completion logic
import { completeChallenge } from '../utils/challenges';

describe('Challenge completion', () => {
  it('awards XP and unlocks next level', () => {
    const result = completeChallenge('typing', 100);
    expect(result.xp).toBe(50);
    expect(result.unlocked).toBe('level2');
  });
});
```

## 10. Implementation steps
1. **Setup:**
   ```bash
   npx create-expo-app skillsprint --template expo-template-blank-typescript
   ```
2. **Core flow:**
   - Scaffold screens: `Home`, `Challenge`, `Profile`
   - Add Firebase auth + Firestore
3. **AI feedback:**
   - Integrate TensorFlow Lite for on-device analysis
4. **Testing:**
   ```bash
   npm test -- --watch
   ```
5. **Polish:**
   - Add haptic feedback for streaks
   - Optimize for 5-minute sessions

## 11. Verification
- Run `npm start` → Expo Go on device
- Test all Jest suites (`npm test`)
- Validate Firebase auth + Firestore
```