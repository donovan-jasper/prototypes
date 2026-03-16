```markdown
# InstaGran Evolution: "Bondly"

## 1. App Name
**Bondly** (Alliterative + "bond" + "socially")

## 2. One-line pitch
"Connect with people who share your passions—anywhere, anytime. From mentorship to caregiving, Bondly turns strangers into your support network."

## 3. Expanded vision
**Primary Audience:**
- **Adults 50+** (lonely but tech-savvy) + **Gen Z/Millennials** (seeking mentors/mentees)
- **Parents** (trusted playdates, tutoring, or errand help)
- **Remote workers** (virtual coworking with like-minded peers)

**Adjacent Use Cases:**
- **Caregiving coordination**: Match caregivers with families needing help.
- **Mentorship hub**: Connect professionals with students or retirees with expertise.
- **Hobby clubs**: Organize book clubs, fitness groups, or volunteer teams.
- **Emergency support**: Link users to crisis resources (e.g., mental health hotlines).

**Why Non-Technical Users Want This:**
- **No commitment**: Schedule one-off meetups or join ongoing groups.
- **Safe & verified**: Background checks for caregivers, hobby validation for groups.
- **Location flexibility**: Virtual or in-person—no travel required.

## 4. Tech Stack
- **Frontend**: React Native (Expo) + TypeScript
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Storage**: SQLite (offline caching) + Firebase Storage (media)
- **Dependencies**: Minimal (React Navigation, Redux Toolkit, Jest)

## 5. Core Features (MVP)
1. **Smart Matching**: AI-driven recommendations for activities/hobbies.
2. **Hybrid Meetups**: Virtual (video chat) + in-person (location-based).
3. **Caregiving Hub**: Verified profiles + scheduling for trusted helpers.
4. **Group Challenges**: Time-limited activities (e.g., "Weekly Book Club").
5. **Emergency Contacts**: One-tap access to local support services.

## 6. Monetization Strategy
- **Free Tier**: Basic matching + virtual meetups.
- **Premium ($4.99/month)**:
  - Verified profiles (caregivers/mentors)
  - Priority matching
  - Exclusive group challenges
- **One-Time Fees**:
  - $10 for in-person meetups (covers coordination).
  - $20 for group outings (e.g., museum trips).

**Hook**: Free tier builds trust; premium unlocks deeper connections.
**Retention**: Exclusive events + community badges (e.g., "Top Mentor").

## 7. Skip if saturated
N/A: No dominant player in structured social bonding for 50+ + mentorship/caregiving.

## 8. File Structure
```
bondly/
├── src/
│   ├── components/ (reusable UI)
│   ├── screens/ (navigation stack)
│   ├── services/ (Firebase, SQLite)
│   ├── utils/ (helpers, types)
│   └── tests/ (Jest files)
├── assets/ (icons, fonts)
└── app.json (Expo config)
```

## 9. Tests
```javascript
// Example: src/tests/matching.test.ts
import { getMatchingScore } from '../utils/matching';

test('Matching score for shared interests', () => {
  const user1 = { hobbies: ['hiking', 'reading'] };
  const user2 = { hobbies: ['reading', 'cooking'] };
  expect(getMatchingScore(user1, user2)).toBe(50); // 1/2 shared
});
```

## 10. Implementation Steps
1. **Setup**: `expo init bondly --template expo-template-blank-typescript`
2. **Firebase**: Add `firebase.js` with Auth/Firestore setup.
3. **MVP Screens**:
   - `ProfileScreen` (hobbies, preferences)
   - `MatchScreen` (swipe or list view)
   - `EventScreen` (virtual/in-person options)
4. **Testing**: Add Jest config + run `npm test`.
5. **Deploy**: `expo publish` + submit to App Store/Play Store.

## 11. Verification
- **Local Test**: `npm start` → Expo Go (iOS/Android simulator).
- **Unit Tests**: `npm test` (all passing).
- **Manual Check**: Verify Firebase auth + Firestore writes.
```