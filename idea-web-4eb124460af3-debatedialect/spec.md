```markdown
# DebateDialect Evolution

## 1. App Name
**Argora** (from "argument" + "agora" — the ancient gathering place for debate)

## 2. One-line pitch
"Structured debates with real-time voting and evidence-based arguments—turn social media chaos into clear, data-driven discussions."

## 3. Expanded Vision
**Broadest Audience:**
- **Students** (group projects, class discussions)
- **Professionals** (salary negotiations, policy discussions)
- **Civic-minded individuals** (local governance, public policy)
- **Gamers** (esports team debates, strategy discussions)
- **Parents** (raising kids, parenting styles)
- **Corporate teams** (brainstorming, decision-making)

**Adjacent Use Cases:**
- **Education:** Debate-based learning modules for K-12 and universities.
- **Journalism:** Fact-checking and source attribution for journalists.
- **Politics:** Structured policy debates for advocacy groups.
- **Gaming:** Esports team strategy sessions.
- **HR:** Conflict resolution in workplace discussions.

**Why Non-Technical Users Want This:**
- No need to learn debate rules—structured format guides them.
- Real-time voting and evidence trees make debates feel like a game.
- Mobile-first design for quick, on-the-go debates.

## 4. Tech Stack
- **Frontend:** React Native (Expo) for cross-platform iOS/Android
- **Backend:** Firebase (Auth, Realtime DB, Cloud Functions)
- **Storage:** SQLite (local cache for offline debates)
- **Testing:** Jest + React Testing Library
- **Analytics:** Firebase Analytics

## 5. Core Features (MVP)
1. **Structured Debate Trees** – Visual argument mapping with pro/con nodes.
2. **Real-Time Voting** – Upvote/downvote arguments to surface best points.
3. **Evidence-Based Arguments** – Attach links, images, or PDFs to claims.
4. **Moderation Tools** – Kick users, lock debates, or ban toxic language.
5. **Voice-to-Text Input** – Speak arguments instead of typing.

## 6. Monetization Strategy
- **Free Tier:**
  - 3 debates/month
  - Basic moderation tools
  - Ad-supported
- **Paid Tier ($4.99/month):**
  - Unlimited debates
  - Advanced analytics (who agrees/disagrees with what)
  - Custom debate templates (e.g., "Negotiation Framework")
  - Ad-free experience
  - Team collaboration (for educators/corporate use)

**Hook:** Free tier lets users try the core value. Paid tier unlocks scalability and analytics.

**Retention:**
- Gamification (badges for active debaters)
- Social proof (show "X people agree with your argument")
- Custom templates for power users

## 7. Skip if Saturated
**SKIP:** Existing apps like Kialo and Debate.org already dominate structured debates. Argora’s gap is mobile-first UX and real-time voting, but not enough to disrupt.

## 8. File Structure
```
argora/
├── app/
│   ├── components/
│   ├── screens/
│   ├── utils/
│   └── services/
├── assets/
├── tests/
│   ├── unit/
│   └── integration/
├── firebase/
├── package.json
└── README.md
```

## 9. Tests
```javascript
// tests/unit/debateTree.test.js
import { buildDebateTree, addArgument } from '../../app/utils/debateTree';

test('buildDebateTree creates a root node', () => {
  const tree = buildDebateTree('Main Topic');
  expect(tree.root.title).toBe('Main Topic');
});

test('addArgument appends to the correct parent', () => {
  const tree = buildDebateTree('Main Topic');
  addArgument(tree, 'Main Topic', 'Pro Argument', 'pro');
  expect(tree.root.children[0].title).toBe('Pro Argument');
});
```

## 10. Implementation Steps
1. **Setup Expo Project**
   ```bash
   npx create-expo-app argora --template expo-template-blank-typescript
   cd argora
   ```
2. **Firebase Integration**
   - Set up Firebase project and enable Auth, Realtime DB.
   - Add Firebase config to `app/services/firebase.ts`.
3. **Debate Tree Logic**
   - Implement `buildDebateTree` and `addArgument` in `app/utils/debateTree.ts`.
4. **UI Screens**
   - `DebateScreen.tsx` (main debate view)
   - `ArgumentModal.tsx` (add new arguments)
5. **Testing**
   - Write Jest tests for debate tree logic.
   - Test UI with React Testing Library.

## 11. Verification
- Run `npm test` to validate logic.
- Test UI on Expo Go (iOS/Android simulator).
- Verify Firebase integration with `npx expo start`.
```