```markdown
# App Spec: **GitHub AI** (Working title: **CodePilot**)

## 1. App Name
**CodePilot** – A clever, alliterative name that suggests AI-powered guidance for developers on the go.

## 2. One-line pitch
"Your AI-powered Scrum team in your pocket—manage GitHub issues, automate reviews, and ship faster from anywhere."

## 3. Expanded vision
**Primary Audience:**
- **Mobile developers** (iOS/Android) who need to triage issues, approve PRs, and manage workflows without a desktop.
- **Freelancers & small teams** who rely on GitHub but lack dedicated tools for mobile workflows.
- **Non-technical stakeholders** (PMs, QA testers) who need to review, approve, or comment on issues on the fly.

**Adjacent Use Cases:**
- **Remote teams** – Instant access to GitHub without switching tabs.
- **On-the-go developers** – Approve PRs, leave comments, or escalate issues while commuting.
- **Cross-functional collaboration** – Non-devs can track progress, request changes, or approve work without GitHub access.

**Why Non-Technical Users?**
- PMs can prioritize issues, request clarifications, or approve work without GitHub.
- QA testers can log bugs, request retests, or verify fixes on mobile.

## 4. Tech Stack
- **React Native + Expo** (cross-platform, fast iteration)
- **SQLite** (local storage for offline mode)
- **GitHub API** (OAuth integration)
- **Minimal deps**: Only essential libraries (e.g., `react-native-github-api`, `expo-notifications`).

## 5. Core Features (MVP)
1. **AI-Powered Issue Triage** – Auto-categorize, prioritize, and assign issues with AI.
2. **Mobile PR Approvals** – Approve/reject PRs, leave comments, and merge from the app.
3. **Real-Time Notifications** – Push alerts for new issues, PRs, and comments.
4. **Offline Mode** – Sync changes when reconnected.
5. **Basic Scrum Automation** – AI suggests next tasks based on sprint goals.

## 6. Monetization Strategy
- **Free Tier**: Issue tracking, basic notifications, offline mode.
- **Paid Tier ($9/month)**:
  - AI-powered workflow automation (Scrum Master, Planner, Dev, QA agents).
  - Priority support.
  - Advanced analytics (e.g., "Time to merge" reports).
- **Enterprise ($299/month)**: Custom AI agents, SSO, and team analytics.

**Hook vs. Paywall**:
- Free tier is "good enough" for casual use, but AI automation is the killer feature.
- **Retention**: AI saves time, so users stay subscribed for efficiency gains.

## 7. Skip if saturated
**SKIP**: GitHub Mobile already exists, but **CodePilot** differentiates by adding AI automation. The gap is mobile-optimized AI workflows.

## 8. File Structure
```
codepilot/
├── src/
│   ├── components/ (UI)
│   ├── hooks/ (GitHub API, AI logic)
│   ├── screens/ (IssueList, PRReview, etc.)
│   ├── utils/ (SQLite helpers)
│   └── App.tsx
├── tests/
│   ├── hooks.test.ts
│   ├── utils.test.ts
│   └── components.test.tsx
├── app.json (Expo config)
└── package.json
```

## 9. Tests
```typescript
// tests/hooks.test.ts
import { useGitHubIssues } from '../src/hooks/useGitHubIssues';

test('fetches issues from GitHub API', async () => {
  const { issues } = useGitHubIssues('repo');
  expect(issues).toHaveLength(5); // Mocked response
});
```

## 10. Implementation Steps
1. **Setup**: `npx create-expo-app codepilot --template expo-template-blank-typescript`
2. **GitHub Auth**: Integrate `react-native-github-api` for OAuth.
3. **MVP Features**:
   - Build `IssueList` screen (fetch issues via API).
   - Add PR approval buttons.
   - Implement SQLite for offline mode.
4. **AI Integration**:
   - Use a lightweight AI (e.g., Hugging Face API) for issue triage.
   - Mock AI responses first, then optimize.

## 11. Verification
- Run `npm test` (Jest) to validate hooks/utils.
- Test on **Expo Go** (iOS/Android) to confirm UI/UX.
- Validate GitHub API calls with mock data.
```