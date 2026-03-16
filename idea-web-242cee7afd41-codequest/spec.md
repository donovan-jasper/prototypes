```markdown
# App Name: **CogniQuest**

1. **App Name**: *CogniQuest*
   - Why? Alliterative, punchy, and suggests a journey of cognitive mastery. Avoids reusing "CodeQuest" while keeping the gamified, skill-building essence.

2. **One-line pitch**:
   *"Train your mind with daily challenges—sharpen logic, math, and reasoning for smarter decisions, better tests, and career success."*

3. **Expanded vision**:
   - **Broadest audience**: Anyone who values mental agility—students, professionals, lifelong learners, and even parents (for cognitive stimulation).
   - **Adjacent use cases**:
     - **Job candidates**: Prep for interviews (e.g., behavioral, data science, consulting).
     - **Parents**: Boost kids' problem-solving skills outside school.
     - **Corporate training**: Upskill employees with gamified learning.
   - **Non-technical appeal**: No prior expertise needed—just curiosity to improve.

4. **Tech stack**:
   - **Frontend**: React Native (Expo) for cross-platform consistency.
   - **Local DB**: SQLite for offline progress tracking.
   - **Backend**: Firebase (Auth, Firestore for analytics, Cloud Functions for adaptive logic).
   - **Testing**: Jest + React Testing Library.

5. **Core features (MVP)**:
   - **Daily Challenges**: 3-5 adaptive problems per domain (logic, math, verbal, strategy).
   - **Progress Dashboard**: Streaks, skill heatmaps, and performance trends.
   - **Adaptive Learning**: Problems adjust difficulty based on user performance.
   - **Micro-Learning**: 5-10 minute sessions for mobile-friendly practice.
   - **Social Streaks**: Compete with friends (optional) or global leaderboards.

6. **Monetization strategy**:
   - **Free tier**: 3 daily challenges, basic analytics, ads.
   - **Paid tier ($9.99/month or $79.99/year)**:
     - Unlimited challenges.
     - Advanced analytics (weakness breakdowns).
     - Ad-free, offline access, and "Mastermind" hints.
   - **Hook**: Free tier shows value (e.g., "Try it—you’ll want more!").
   - **Retention**: Premium users get "Cognitive Score" reports (e.g., "You improved 15% in logic this month").

7. **Skip if saturated**:
   - No direct competitors offer *both* gamified, adaptive problem-solving *and* real-world skill application (e.g., test prep + career skills).

8. **File structure**:
   ```
   /cogniquest
   ├── /app
   │   ├── /screens (DailyChallenges, Dashboard, etc.)
   │   ├── /components (ProblemCard, ProgressChart)
   │   ├── /hooks (useAdaptiveLogic, useStreaks)
   ├── /assets (icons, sounds)
   ├── /tests
   │   ├── /unit (ProblemSolver.test.js)
   │   ├── /e2e (UserFlow.test.js)
   ├── firebase.js
   ├── App.js
   ```

9. **Tests**:
   ```javascript
   // ProblemSolver.test.js
   import { calculateAdaptiveDifficulty } from '../hooks/useAdaptiveLogic';

   test('adjusts difficulty based on performance', () => {
     expect(calculateAdaptiveDifficulty(80, 'easy')).toBe('medium');
     expect(calculateAdaptiveDifficulty(30, 'hard')).toBe('medium');
   });
   ```

10. **Implementation steps**:
    - **Phase 1**: Build core problem engine (logic/math problems) + SQLite storage.
    - **Phase 2**: Add Firebase backend for analytics and adaptive logic.
    - **Phase 3**: Design UI/UX for micro-learning (e.g., swipe-to-solve).
    - **Phase 4**: Add social features (streaks) and monetization.

11. **Verification**:
    - Run `npm test` to validate logic.
    - Test on Expo Go: Daily challenges should load, and difficulty should adjust after attempts.
```