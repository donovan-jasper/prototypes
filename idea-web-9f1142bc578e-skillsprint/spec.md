```markdown
# SkillSprint → **SkillHive**

## 1. App Name
**SkillHive** – A playful, alliterative name suggesting a thriving ecosystem of skills, growth, and community.

## 2. One-line pitch
"Gamify your learning journey with friends, unlock badges, and track progress—no fluff, just skill."

## 3. Expanded vision
**Broadest audience:**
- **Lifelong learners** (anyone tracking skills, not just professionals/students)
- **Parents** (monitoring kids' education progress)
- **Corporate teams** (employee upskilling with employer branding)
- **Hobbyists** (crafting, fitness, language learning)
- **Remote workers** (structured motivation for self-directed learning)

**Adjacent use cases:**
- **Career changers** (visualizing their skill progression)
- **Freelancers** (building a portfolio of achievements)
- **Gamers** (tracking in-game skills)
- **Therapists** (patient progress tracking for skill-building)

**Why non-technical users?**
- Parents can track kids' milestones (e.g., "My kid just earned 'Math Whiz'!")
- Hobbyists can compete in local skill challenges (e.g., "Best DIY project this month")

## 4. Tech stack
- **Frontend:** React Native (Expo) with TypeScript
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **Local DB:** SQLite (for offline progress)
- **Testing:** Jest + React Testing Library

## 5. Core features (MVP)
1. **Skill Tree** – Visual roadmap of goals with unlockable badges
2. **Daily Challenges** – Micro-tasks with XP rewards
3. **Social Hive** – Join/host skill groups (e.g., "Python Developers")
4. **Evidence Vault** – Upload photos/certificates to prove progress
5. **Employer Badges** – Paid feature for corporate branding

## 6. Monetization
- **Free tier:**
  - Basic habit tracking
  - Public skill trees
  - Limited badges
- **Premium ($9.99/month):**
  - Advanced analytics (weaknesses, streaks)
  - Private groups
  - Custom badges
- **Enterprise ($29.99/month):**
  - Employer branding
  - Team leaderboards
  - Bulk user management

**Hook:** Free tier is addictive (gamification), but premium unlocks **social accountability** and **data-driven growth**.

**Retention:**
- Push notifications for streaks
- Monthly "Skill of the Month" challenges
- Employer badges as a career portfolio

## 7. Skip if saturated?
No clear gap—competitors like Duolingo and Habitica cover parts of this. **But** SkillHive’s unique angle is **corporate upskilling + social accountability**.

## 8. File structure
```
skillhive/
├── app/
│   ├── components/ (SkillTree, ChallengeCard, etc.)
│   ├── screens/ (Home, Hive, Profile)
│   ├── utils/ (auth, db, types)
├── assets/ (icons, badges)
├── tests/
│   ├── components/
│   ├── utils/
├── firebase.json
├── package.json
```

## 9. Tests (example)
```typescript
// tests/utils/skillTree.test.ts
import { calculateXP } from '../../app/utils/skillTree';

test('XP calculation for daily challenges', () => {
  expect(calculateXP(3)).toBe(30); // 3 days = 30 XP
});
```

## 10. Implementation steps
1. **Setup:**
   ```bash
   npx create-expo-app -t expo-template-blank-typescript
   npm install firebase @react-navigation/native
   ```
2. **Firebase config:**
   - Set up Auth, Firestore, and Storage in Firebase Console
   - Add `firebaseConfig.ts` with credentials
3. **MVP features:**
   - Build `SkillTree` component with D3.js (or React Native SVG)
   - Implement daily challenges with SQLite for offline sync
   - Add social groups with Firestore queries
4. **Testing:**
   ```bash
   npm test
   ```

## 11. Verification
- Run `npx expo start` and test on iOS/Android
- Run `npm test` to ensure all logic passes
- Verify Firebase auth and Firestore writes
```