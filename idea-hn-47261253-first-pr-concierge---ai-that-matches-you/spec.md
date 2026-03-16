# ContribFlow

## One-line pitch
Find your next open source contribution in seconds—matched to your skills, guided step-by-step, celebrated when you ship.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Junior developers building portfolios for job applications
- Career switchers proving technical skills without formal CS degrees
- Students completing coursework or capstone projects
- Bootcamp graduates needing real-world experience
- Mid-level developers exploring new languages/frameworks
- Senior engineers mentoring through curated issue recommendations

**Broadest audience:**
This serves anyone who wants to **prove they can code** without gatekeepers. It's LinkedIn for developers who show rather than tell—a living resume that updates itself as you contribute.

**Adjacent use cases:**
- **Hiring managers** scouting contributors on projects they care about
- **Open source maintainers** attracting quality first-time contributors
- **Developer advocates** tracking community engagement metrics
- **Coding bootcamps** gamifying student contributions as curriculum
- **Tech communities** (Discord, Slack) surfacing relevant issues to members
- **Non-technical founders** understanding what their dev team could contribute to

**Why non-technical people want this:**
- Parents tracking their kid's coding progress (gamified achievements)
- Recruiters discovering talent through contribution history, not resumes
- Managers encouraging team learning through friendly competition
- Educators assigning real-world tasks instead of toy projects

The app transforms open source from "intimidating volunteer work" into "your public coding portfolio that recruiters actually check."

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** expo-sqlite for offline-first issue caching
- **API:** GitHub REST API v3 + GraphQL for user data
- **Auth:** expo-auth-session with GitHub OAuth
- **State:** Zustand (lightweight, no Redux overhead)
- **Navigation:** Expo Router (file-based)
- **UI:** React Native Paper (Material Design)
- **Notifications:** expo-notifications
- **Testing:** Jest + React Native Testing Library
- **AI:** OpenAI API (GPT-4o-mini for cost efficiency)

## Core features

1. **Smart Match Feed**
   - Analyzes your GitHub profile (languages, starred repos, past PRs)
   - Shows 5-10 curated issues daily with difficulty ratings
   - One-tap "Claim Issue" that comments on GitHub and adds to your queue
   - Offline mode caches issues for subway coding sessions

2. **Guided Contribution Flow**
   - Step-by-step checklist: Fork → Clone → Branch → Code → Test → PR
   - AI-generated "Getting Started" tips for each issue (setup commands, file locations)
   - In-app code snippet viewer with syntax highlighting
   - Push notification when maintainer responds to your PR

3. **Contribution Streak Tracker**
   - Daily streak counter (like Duolingo for coding)
   - Achievement badges: "First PR," "5-Day Streak," "10 Merged PRs"
   - Shareable cards for LinkedIn/Twitter ("I just shipped my 20th open source PR!")
   - Weekly digest: "You contributed to 3 projects this week"

4. **AI Mentor Chat**
   - Ask questions about specific issues ("How do I run tests for this repo?")
   - Get unstuck with context-aware hints (reads repo README, CONTRIBUTING.md)
   - Paid feature: Unlimited questions + code review before submitting PR

5. **Team Leaderboard** (Enterprise hook)
   - Companies create private groups for employees
   - Track team contributions, celebrate top contributors
   - Manager dashboard shows skill development trends

## Monetization strategy

### Free tier (the hook):
- 3 AI-matched issues per day
- Basic contribution tracking (streak, merged PR count)
- 5 AI mentor questions per month
- Public profile showing contribution history

### Paid tier — $7/month or $60/year (the paywall):
- **Unlimited AI-matched issues** with advanced filters (language, difficulty, project size)
- **Unlimited AI mentor chat** with code review before PR submission
- **Priority notifications** when maintainers respond (within 5 minutes vs 1 hour)
- **Custom learning paths** ("Master React in 12 contributions")
- **Private contributions** (hide specific repos from public profile)
- **Export portfolio** as PDF resume supplement

**Why $7/month?**
- Higher than typical mobile apps ($2-5) because target audience has income
- Lower than dev tools ($10-20) to stay impulse-purchase friendly
- Annual discount (2 months free) drives commitment

**What makes people STAY subscribed?**
- **Sunk cost of streak:** Cancel and lose your 47-day contribution streak
- **AI mentor becomes indispensable:** After getting unstuck 3 times, you can't code without it
- **Portfolio lock-in:** Your curated contribution history lives in the app
- **Team accountability:** If your company pays, you use it to prove productivity
- **Monthly "You shipped X PRs" report** makes you feel accomplished

### Enterprise — $15/user/month (min 10 seats):
- Team leaderboards and analytics
- Manager dashboard (who's contributing, skill gaps)
- SSO and admin controls
- Dedicated Slack/Discord bot for issue recommendations

## File structure

```
contribflow/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── callback.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Smart Match Feed
│   │   ├── queue.tsx          # Claimed issues
│   │   ├── profile.tsx        # Streak & achievements
│   │   └── mentor.tsx         # AI chat
│   └── _layout.tsx
├── components/
│   ├── IssueCard.tsx
│   ├── StreakCounter.tsx
│   ├── AchievementBadge.tsx
│   ├── ContributionChecklist.tsx
│   └── MentorChat.tsx
├── lib/
│   ├── github.ts              # API client
│   ├── ai.ts                  # OpenAI integration
│   ├── database.ts            # SQLite setup
│   ├── matching.ts            # Issue recommendation logic
│   └── notifications.ts
├── store/
│   ├── authStore.ts
│   ├── issuesStore.ts
│   └── profileStore.ts
├── types/
│   └── index.ts
├── __tests__/
│   ├── matching.test.ts
│   ├── github.test.ts
│   ├── IssueCard.test.tsx
│   └── StreakCounter.test.tsx
├── app.json
├── package.json
└── tsconfig.json
```

## Tests

```typescript
// __tests__/matching.test.ts
import { scoreIssue, rankIssues } from '../lib/matching';

describe('Issue Matching Algorithm', () => {
  test('prioritizes issues in user languages', () => {
    const userProfile = { languages: ['TypeScript', 'Python'] };
    const issue = { labels: ['typescript', 'good-first-issue'] };
    expect(scoreIssue(issue, userProfile)).toBeGreaterThan(50);
  });

  test('ranks beginner issues higher for new contributors', () => {
    const issues = [
      { labels: ['good-first-issue'], difficulty: 1 },
      { labels: ['help-wanted'], difficulty: 3 }
    ];
    const ranked = rankIssues(issues, { contributionCount: 2 });
    expect(ranked[0].difficulty).toBe(1);
  });
});

// __tests__/github.test.ts
import { fetchUserRepos, fetchIssues } from '../lib/github';

describe('GitHub API Client', () => {
  test('fetches user repositories', async () => {
    const repos = await fetchUserRepos('testuser', 'fake-token');
    expect(Array.isArray(repos)).toBe(true);
  });

  test('handles API rate limiting', async () => {
    // Mock rate limit response
    await expect(fetchIssues('fake-token')).rejects.toThrow('Rate limit');
  });
});

// __tests__/IssueCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import IssueCard from '../components/IssueCard';

describe('IssueCard Component', () => {
  test('renders issue title and labels', () => {
    const issue = { title: 'Fix typo', labels: ['documentation'] };
    const { getByText } = render(<IssueCard issue={issue} />);
    expect(getByText('Fix typo')).toBeTruthy();
    expect(getByText('documentation')).toBeTruthy();
  });

  test('calls onClaim when button pressed', () => {
    const onClaim = jest.fn();
    const { getByText } = render(<IssueCard issue={{}} onClaim={onClaim} />);
    fireEvent.press(getByText('Claim Issue'));
    expect(onClaim).toHaveBeenCalled();
  });
});

// __tests__/StreakCounter.test.tsx
import { render } from '@testing-library/react-native';
import StreakCounter from '../components/StreakCounter';

describe('StreakCounter Component', () => {
  test('displays current streak', () => {
    const { getByText } = render(<StreakCounter streak={7} />);
    expect(getByText('7')).toBeTruthy();
  });

  test('shows fire emoji for streaks over 5', () => {
    const { getByText } = render(<StreakCounter streak={10} />);
    expect(getByText(/🔥/)).toBeTruthy();
  });
});
```

## Implementation steps

### Phase 1: Project Setup
1. Initialize Expo app: `npx create-expo-app contribflow --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-auth-session expo-notifications
   npm install zustand react-native-paper @octokit/rest openai
   npm install -D @types/react @types/jest @testing-library/react-native
   ```
3. Configure `app.json`:
   - Set `scheme` for OAuth callback
   - Add GitHub OAuth client ID (from GitHub Developer Settings)
   - Configure notification permissions
4. Set up TypeScript types in `types/index.ts`:
   - `GitHubUser`, `Issue`, `Repository`, `Contribution`, `Achievement`

### Phase 2: Authentication
5. Create `lib/github.ts`:
   - Initialize Octokit client
   - `authenticateUser()` using expo-auth-session
   - `fetchUserProfile()` to get username, avatar, bio
   - `fetchUserRepos()` to analyze languages and activity
6. Build `app/(auth)/login.tsx`:
   - "Sign in with GitHub" button
   - Handle OAuth redirect to `callback.tsx`
   - Store access token in secure storage (expo-secure-store)
7. Create `store/authStore.ts`:
   - Zustand store for `user`, `token`, `isAuthenticated`
   - `login()` and `logout()` actions

### Phase 3: Database Setup
8. Create `lib/database.ts`:
   - Initialize SQLite with tables: `issues`, `contributions`, `achievements`
   - `issues` table: id, title, repo, url, labels, difficulty, claimedAt, completedAt
   - `contributions` table: id, issueId, prUrl, mergedAt, streakDay
   - `achievements` table: id, type, unlockedAt, shared
9. Write migration functions: `createTables()`, `seedInitialData()`

### Phase 4: Issue Matching Engine
10. Create `lib/matching.ts`:
    - `analyzeUserProfile(repos)`: Extract top 3 languages, contribution frequency
    - `fetchGoodFirstIssues(languages)`: Query GitHub for `good-first-issue` label
    - `scoreIssue(issue, profile)`: Algorithm:
      - +30 points if language matches user's top 3
      - +20 points for `good-first-issue` label
      - +10 points if repo has <100 stars (less intimidating)
      - -10 points if issue is >30 days old (likely stale)
    - `rankIssues(issues, profile)`: Sort by score, return top 10
11. Create `store/issuesStore.ts`:
    - `matchedIssues`, `claimedIssues`, `completedIssues`
    - `fetchMatches()`, `claimIssue()`, `markCompleted()`

### Phase 5: Smart Match Feed UI
12. Build `components/IssueCard.tsx`:
    - Display: repo name, issue title, difficulty badge, labels
    - "Claim Issue" button → calls GitHub API to comment "I'd like to work on this!"
    - Save to local SQLite `issues` table with `claimedAt` timestamp
13. Create `app/(tabs)/index.tsx`:
    - FlatList of `IssueCard` components
    - Pull-to-refresh to fetch new matches
    - Empty state: "No matches yet—analyzing your profile..."
    - Filter chips: Language, Difficulty (Easy/Medium/Hard)

### Phase 6: Contribution Queue
14. Build `app/(tabs)/queue.tsx`:
    - Show claimed issues with checklist:
      - [ ] Fork repository
      - [ ] Clone locally
      - [ ] Create branch
      - [ ] Make changes
      - [ ] Submit PR
    - Each step has "Copy command" button (e.g., `git clone <url>`)
    - "Mark as Completed" button → prompts for PR URL
15. Create `components/ContributionChecklist.tsx`:
    - Checkbox list with progress indicator
    - Persist state in SQLite

### Phase 7: Streak Tracker
16. Build `components/StreakCounter.tsx`:
    - Calculate streak from `contributions` table (consecutive days with merged PRs)
    - Display: "🔥 7 Day Streak"
    - Show longest streak and current streak
17. Create `app/(tabs)/profile.tsx`:
    - User avatar, username, bio (from GitHub)
    - Streak counter at top
    - Achievement badges grid (locked/unlocked states)
    - Stats: Total PRs, Languages contributed to, Favorite repos
18. Implement achievement logic in `lib/achievements.ts`:
    - Check conditions after each PR merge:
      - "First PR" → 1 merged PR
      - "Streak Master" → 7-day streak
      - "Polyglot" → Contributed to 3+ languages
    - Save to `achievements` table, trigger notification

### Phase 8: AI Mentor
19. Create `lib/ai.ts`:
    - `askMentor(question, issueContext)`: Call OpenAI API
    - System prompt: "You are a helpful coding mentor. User is working on [issue]. Answer concisely."
    - Include repo README and CONTRIBUTING.md in context (fetch from GitHub)
    - Rate limit: 5 questions/month for free users
20. Build `components/MentorChat.tsx`:
    - Chat interface with message bubbles
    - Input field with "Ask AI Mentor" button
    - Show remaining free questions for non-subscribers
21. Create `app/(tabs)/mentor.tsx`:
    - Render `MentorChat` component
    - Paywall modal if user exceeds free tier

### Phase 9: Notifications
22. Create `lib/notifications.ts`:
    - `scheduleStreakReminder()`: Daily at 8pm if no contribution today
    - `notifyPRResponse()`: When maintainer comments on user's PR (poll GitHub API)
    - `celebrateAchievement(badge)`: Show notification when unlocked
23. Set up background task in `app/_layout.tsx`:
    - Register notification handlers
    - Request permissions on first launch

### Phase 10: Monetization
24. Integrate RevenueCat or Expo In-App Purchases:
    - Create subscription products: Monthly ($7), Annual ($60)
    - Implement paywall in `components/PaywallModal.tsx`
    - Gate features: Unlimited AI questions, advanced filters, custom learning paths
25. Add subscription check in `store/authStore.ts`:
    - `isSubscribed` boolean
    - Fetch subscription status on app launch

### Phase 11: Polish
26. Add loading states and error handling:
    - Skeleton screens while fetching issues
    - Retry buttons for failed API calls
    - Offline mode indicator
27. Implement analytics (Expo Analytics or Mixpanel):
    - Track: Issues claimed, PRs submitted, Subscription conversions
28. Create onboarding flow:
    - 3-screen tutorial: "Find issues" → "Get guided" → "Build your portfolio"
    - Skip button for returning users

### Phase 12: Testing
29. Write unit tests (see Tests section above)
30. Run `npm test` to verify all tests pass
31. Manual testing checklist:
    - Sign in with GitHub → Profile loads correctly
    - Claim issue → Comment appears on GitHub
    - Complete contribution → Streak increments
    - Ask AI mentor → Response appears in chat
    - Trigger paywall → Subscription flow works

## How to verify it works

### Local Development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test authentication:
   - Tap "Sign in with GitHub"
   - Authorize app in browser
   - Verify profile loads with correct username/avatar
4. Test issue matching:
   - Pull down on feed to refresh
   - Verify issues match your GitHub languages
   - Claim an issue → Check GitHub for your comment
5. Test streak tracking:
   - Manually insert test data in SQLite (use Expo SQLite Studio)
   - Verify streak counter updates
6. Test AI mentor:
   - Ask a question about a claimed issue
   - Verify response is contextually relevant
7. Run tests: `npm test` → All tests must pass

### Production Readiness
- Build for iOS: `eas build --platform ios`
- Build for Android: `eas build --platform android`
- Test on physical devices (not just simulator)
- Verify push notifications work on real devices
- Check App Store screenshots and metadata
- Submit for review with clear privacy policy (GitHub data usage)