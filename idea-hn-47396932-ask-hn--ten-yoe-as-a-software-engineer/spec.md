```markdown
# **App Name: CodeShift**
*One-line pitch:* "Your career bridge to AI/embedded systems—learn, build, and connect with mobile-first tools."

---

## **Expanded Vision**
**Primary Audience:**
- Mid-career engineers (5-15 YoE) pivoting into AI/embedded roles.
- Developers curious about AI but overwhelmed by the fast pace of LLMs.

**Broadened Audience:**
- **Non-technical professionals** transitioning into tech-adjacent roles (e.g., data analysts, IoT consultants).
- **Students** preparing for AI/embedded careers with hands-on projects.
- **Corporate trainers** deploying microlearning for upskilling teams.

**Adjacent Use Cases:**
- **Freelancers** monetizing AI/embedded skills via project templates.
- **Startups** sourcing talent with verified learning paths.
- **Educators** creating mobile-friendly courses.

---

## **Tech Stack**
- **Frontend:** React Native (Expo) for cross-platform iOS/Android.
- **Backend:** Firebase (Auth, Firestore, Storage) for real-time collaboration.
- **Local DB:** SQLite for offline learning paths.
- **Testing:** Jest + React Testing Library.
- **CI/CD:** GitHub Actions (Expo EAS).

---

## **Core Features (MVP)**
1. **Curated Learning Paths**
   - AI/embedded "skill bridges" (e.g., "Python → TensorFlow" or "C → Embedded C++").
   - Progress tracking with micro-certifications.

2. **Project Templates**
   - Pre-built AI/embedded projects (e.g., "Deploy a TinyML model on ESP32").
   - GitHub integration for version control.

3. **Community Hub**
   - Peer Q&A, mentorship requests, and job boards.
   - Push notifications for new learning opportunities.

---

## **Monetization Strategy**
- **Free Tier:**
  - 3 learning paths, 1 project template, basic community access.
- **Premium ($15/month):**
  - Unlimited advanced paths (e.g., "Build a GAN from scratch").
  - 1:1 mentorship (3 sessions/year).
  - Exclusive job board (verified AI/embedded roles).

**Hook:** Free tier shows value; premium adds accountability (mentorship) and exclusivity (jobs).

---

## **Skip if Saturated?**
No gap in mobile-first AI/embedded learning tools. Competitors (Udemy, GitHub) dominate, but **CodeShift** differentiates with:
- **Mobile-first project development** (no desktop required).
- **Career transition focus** (not just courses).

---

## **File Structure**
```
codeshift/
├── app/
│   ├── (tabs)/
│   │   ├── learn/
│   │   ├── projects/
│   │   └── community/
├── components/
│   ├── LearningPathCard.tsx
│   └── ProjectTemplate.tsx
├── utils/
│   ├── api.ts
│   └── db.ts
├── tests/
│   ├── LearningPath.test.tsx
│   └── ProjectTemplate.test.tsx
└── package.json
```

---

## **Tests**
```typescript
// tests/LearningPath.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import LearningPathCard from '../components/LearningPathCard';

test('renders learning path with progress', () => {
  const { getByText } = render(<LearningPathCard title="Python → TensorFlow" progress={50} />);
  expect(getByText('50% Complete')).toBeTruthy();
});
```

---

## **Implementation Steps**
1. **Setup:**
   ```bash
   npx create-expo-app -t expo-template-blank-typescript
   cd codeshift
   npm install @react-navigation/native react-native-paper jest @testing-library/react-native
   ```

2. **Core Flow:**
   - Build `LearningPathCard` with progress tracking.
   - Add Firebase Auth for community features.
   - Implement SQLite for offline paths.

3. **Testing:**
   ```bash
   npm test
   ```

4. **Deploy:**
   ```bash
   npx expo prebuild
   npx expo run:android
   ```

---

## **Verification**
- Run `npm test` to validate components.
- Test on Expo Go (iOS/Android) for UI/UX.
- Verify Firebase integration with `console.log` for API calls.
```