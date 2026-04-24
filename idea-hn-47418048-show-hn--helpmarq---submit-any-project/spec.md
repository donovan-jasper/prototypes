```markdown
# Helpmarq Evolution: App Spec

## 1. App Name
**Critiq** (short for "Critical Feedback" + "Quick")
*Alternatives considered: FeedbackFuse, ReviewRush, SnapJudge*

## 2. One-line pitch
"Instant, structured feedback from real users—no more guessing what works."

## 3. Expanded Vision
**Broadest Audience:**
- **Creatives**: Designers, writers, filmmakers, musicians.
- **Entrepreneurs**: Founders, marketers, and product teams validating ideas.
- **Students**: Portfolio builders, thesis reviewers.
- **Freelancers**: Clients needing rapid validation before contracts.

**Adjacent Use Cases:**
- **Remote teams**: Get feedback on prototypes without in-person reviews.
- **Social media**: Validate ad creatives, influencer content, or memes.
- **Gamers**: Test game mechanics or UI/UX before launch.
- **Non-tech users**: Parents reviewing school projects, hobbyists validating ideas.

**Why Non-Technical Users?**
- "I’m not a designer, but I need to know if my logo is confusing."
- "My friend’s startup pitch needs real reactions before pitching investors."

## 4. Tech Stack
- **Frontend**: React Native (Expo) for cross-platform.
- **Backend**: Firebase (Auth, Firestore, Storage) for scalability.
- **Local DB**: SQLite for offline submissions.
- **Testing**: Jest + React Testing Library.
- **CI/CD**: GitHub Actions for automated testing.

## 5. Core Features (MVP)
1. **Guided Submissions**:
   - Users select a template (e.g., "Logo Review," "Pitch Deck") and answer prompts.
   - Supports images, videos, or links.
2. **Real-Time Feedback**:
   - Reviewers answer structured questions (e.g., "Is this clear?" "Would you use this?").
   - AI scores sentiment (e.g., "7/10 for usability").
3. **Priority Queue**:
   - Paid users get faster responses via "Feedback Sprint" ($20/3 reviews).

## 6. Monetization Strategy
- **Free Tier**:
  - 1 submission/month.
  - Basic feedback (no scoring, limited reviewers).
- **Paid Tier ($5/month)**:
  - Unlimited submissions.
  - Structured scoring (e.g., "Usability: 8/10").
  - Priority queue.
- **One-Time $20 "Sprint"**:
  - 3 reviews in 24 hours (for urgent validation).
- **Why It Sticks**:
  - **Hook**: Free tier lets users try without commitment.
  - **Paywall**: Scoring and speed differentiate from competitors.
  - **Retention**: Analytics dashboard (paid) shows trends over time.

## 7. Skip if Saturated
*No skip—this fills a gap in mobile-first structured feedback.*

## 8. File Structure
```
critiq/
├── app/
│   ├── components/ (shared UI)
│   ├── screens/ (Submission, Feedback, Profile)
│   ├── utils/ (auth, api, tests)
├── assets/ (icons, templates)
├── tests/
│   ├── unit/ (Jest tests)
│   ├── e2e/ (Detox tests)
├── firebase.json (config)
└── package.json
```

## 9. Tests
```javascript
// tests/unit/submission.test.js
import { validateSubmission } from '../../app/utils/submission';

test('validates image submissions', () => {
  expect(validateSubmission({ type: 'image', file: 'test.png' })).toBe(true);
});
```

## 10. Implementation Steps
1. **Setup**:
   ```bash
   expo init critiq
   cd critiq
   npm install firebase @react-navigation/native
   ```
2. **Firebase Setup**:
   - Add `firebase.js` with Firestore rules for submissions.
3. **Core Flow**:
   - Build `SubmissionScreen` with template selection.
   - Add `FeedbackScreen` with structured questions.
4. **Monetization**:
   - Implement Stripe for subscriptions.
   - Add "Sprint" button with Firestore queue logic.

## 11. Verification
- Run `npm test` (Jest) for unit tests.
- Test on Expo Go with:
  ```bash
  expo start
  ```
- Validate Firebase submissions via Firestore console.
```