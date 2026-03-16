# GitFlow

## One-line pitch
Version control for everyone — see what changed, approve updates, and collaborate on code without learning Git commands.

## Expanded vision

### Who is this REALLY for?

**Primary audience:** The 80% of tech company employees who aren't engineers but need to interact with code repositories:
- **Designers** reviewing implementation of their designs, checking asset usage, updating design tokens
- **Product managers** tracking feature progress, reviewing changelogs, understanding what shipped
- **Content creators** updating copy, managing translations, editing markdown documentation
- **QA testers** verifying bug fixes, checking feature branches, documenting issues with code context
- **Marketing teams** updating landing pages, managing content repositories, reviewing analytics code

**Secondary audience:**
- **Junior developers** who find Git intimidating and want a gentler learning curve
- **Freelancers and consultants** who need quick repository access without desktop setup
- **Open source contributors** who want to review PRs and provide feedback on mobile
- **Students** learning version control for the first time

### What adjacent use cases does this enable?

1. **Async code reviews on mobile** — Approve PRs during commute, lunch breaks, or while traveling
2. **Real-time collaboration visibility** — See who's working on what, when changes happen, without Slack noise
3. **Non-technical stakeholder engagement** — Let anyone see progress without asking engineers for updates
4. **Documentation workflows** — Update READMEs, wikis, and docs files directly from mobile
5. **Quick hotfixes** — Edit config files, fix typos, update environment variables from anywhere
6. **Learning tool** — Visual representation of Git concepts helps people understand version control

### Why would a non-technical person want this?

- **Autonomy:** Stop bothering developers for simple updates or status checks
- **Transparency:** Understand what's actually happening in development without technical jargon
- **Contribution:** Participate in the development process without learning command line
- **Speed:** Make quick changes without waiting for a developer or opening a laptop
- **Confidence:** Guided workflows prevent mistakes and explain what each action does

The app translates Git's technical complexity into human-readable stories: "Sarah updated the homepage design" instead of "commit 3a7f9b2: refactor: update hero component styles."

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Git operations:** isomorphic-git (pure JavaScript Git implementation)
- **Local storage:** expo-sqlite for repository metadata, AsyncStorage for user preferences
- **File system:** expo-file-system for repository storage
- **Authentication:** expo-auth-session for OAuth (GitHub, GitLab, Bitbucket)
- **UI components:** react-native-paper (Material Design)
- **Navigation:** expo-router (file-based routing)
- **State management:** Zustand (lightweight, minimal boilerplate)
- **Diff visualization:** react-native-syntax-highlighter
- **Testing:** Jest + React Native Testing Library
- **Code quality:** ESLint, Prettier, TypeScript strict mode

## Core features (MVP)

1. **Visual Repository Browser**
   - Browse files and folders with familiar mobile UI patterns
   - See file history as a timeline with human-readable descriptions
   - Preview images, markdown, and code with syntax highlighting
   - Search across files and commit messages

2. **Guided Commit Workflow**
   - Simple file editor with change preview
   - Template-based commit messages ("Updated homepage copy", "Fixed typo in docs")
   - Visual diff showing exactly what changed (green = added, red = removed)
   - One-tap commit with automatic push

3. **Smart Pull Request Reviews**
   - Swipeable PR cards showing what changed and why
   - Inline comments on specific lines
   - Approve/request changes with pre-written templates
   - Notifications when you're mentioned or review is requested

4. **Team Activity Feed**
   - Real-time updates on who changed what
   - Filter by person, file type, or branch
   - Tap any activity to see the full change
   - Bookmark important changes for later

5. **Conflict-Free Branching**
   - Create branches with guided naming ("feature/", "fix/", "content/")
   - Switch branches with safety checks (warns about uncommitted changes)
   - Merge branches with automatic conflict detection
   - Visual merge preview before committing

## Monetization strategy

### Free tier (the hook)
- Connect up to 2 repositories
- Browse files and view history
- Read-only PR reviews (view and comment, but not approve)
- Basic activity feed (last 7 days)
- Single user account

**Why this works:** Users can immediately see value by browsing their team's repos and understanding what's happening. They'll hit limits when they want to actually contribute or manage multiple projects.

### Premium: $6.99/month or $59.99/year (15% discount)
- Unlimited repositories
- Full commit and push capabilities
- PR approval powers
- Advanced branching and merging
- Unlimited activity feed history
- Conflict resolution tools
- Team collaboration features (shared bookmarks, team activity filters)
- Priority support

**Price reasoning:** 
- Higher than typical utility apps ($4.99) because this is a professional tool that saves time
- Lower than developer tools ($9.99+) because target audience isn't engineers
- Annual plan encourages long-term commitment with meaningful savings

### What makes people STAY subscribed?

1. **Daily habit formation** — Checking activity feed becomes part of morning routine
2. **Workflow integration** — Once you start committing from mobile, going back to desktop feels slow
3. **Team dependency** — If your team uses it for async reviews, you can't opt out
4. **Data lock-in** — Bookmarks, custom filters, and activity history create switching costs
5. **Continuous value** — Every commit, review, and update reinforces the subscription value

### Additional revenue streams (post-MVP)
- **Team plans:** $49.99/month for 5 users (volume discount)
- **Enterprise:** Custom pricing for SSO, audit logs, advanced permissions
- **One-time purchases:** Premium themes ($2.99), advanced diff tools ($4.99)

## File structure

```
gitflow/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── oauth-callback.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Activity feed
│   │   ├── repositories.tsx       # Repository list
│   │   ├── pull-requests.tsx      # PR list
│   │   └── profile.tsx            # User settings
│   ├── repository/
│   │   ├── [id]/
│   │   │   ├── index.tsx          # Repository home
│   │   │   ├── files.tsx          # File browser
│   │   │   ├── history.tsx        # Commit history
│   │   │   ├── branches.tsx       # Branch management
│   │   │   └── file/[path].tsx    # File viewer/editor
│   │   └── _layout.tsx
│   ├── pull-request/
│   │   └── [id].tsx               # PR detail view
│   ├── _layout.tsx
│   └── +not-found.tsx
├── src/
│   ├── components/
│   │   ├── ActivityCard.tsx
│   │   ├── CommitCard.tsx
│   │   ├── DiffViewer.tsx
│   │   ├── FileTree.tsx
│   │   ├── PullRequestCard.tsx
│   │   ├── RepositoryCard.tsx
│   │   ├── BranchSelector.tsx
│   │   ├── CommitForm.tsx
│   │   └── ConflictResolver.tsx
│   ├── services/
│   │   ├── git/
│   │   │   ├── GitService.ts      # Core git operations
│   │   │   ├── CloneService.ts
│   │   │   ├── CommitService.ts
│   │   │   ├── BranchService.ts
│   │   │   ├── MergeService.ts
│   │   │   └── DiffService.ts
│   │   ├── api/
│   │   │   ├── GitHubAPI.ts
│   │   │   ├── GitLabAPI.ts
│   │   │   └── BitbucketAPI.ts
│   │   ├── storage/
│   │   │   ├── DatabaseService.ts
│   │   │   └── FileSystemService.ts
│   │   └── auth/
│   │       └── AuthService.ts
│   ├── stores/
│   │   ├── useAuthStore.ts
│   │   ├── useRepositoryStore.ts
│   │   ├── useActivityStore.ts
│   │   └── usePullRequestStore.ts
│   ├── hooks/
│   │   ├── useRepository.ts
│   │   ├── useCommit.ts
│   │   ├── useBranch.ts
│   │   └── usePullRequest.ts
│   ├── utils/
│   │   ├── formatters.ts          # Date, file size, etc.
│   │   ├── validators.ts          # Input validation
│   │   ├── parsers.ts             # Git output parsing
│   │   └── humanize.ts            # Technical -> human text
│   ├── types/
│   │   ├── git.ts
│   │   ├── repository.ts
│   │   ├── pullRequest.ts
│   │   └── activity.ts
│   └── constants/
│       ├── colors.ts
│       ├── commitTemplates.ts
│       └── config.ts
├── assets/
│   ├── images/
│   └── fonts/
├── __tests__/
│   ├── services/
│   │   ├── GitService.test.ts
│   │   ├── CommitService.test.ts
│   │   ├── BranchService.test.ts
│   │   └── DiffService.test.ts
│   ├── utils/
│   │   ├── formatters.test.ts
│   │   ├── validators.test.ts
│   │   └── humanize.test.ts
│   ├── stores/
│   │   └── useRepositoryStore.test.ts
│   └── components/
│       ├── DiffViewer.test.tsx
│       └── CommitForm.test.tsx
├── app.json
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Tests

### Core Git Operations Tests

**`__tests__/services/GitService.test.ts`**
- Clone repository from remote URL
- Fetch latest changes from remote
- Handle authentication errors gracefully
- Validate repository structure after clone

**`__tests__/services/CommitService.test.ts`**
- Stage files for commit
- Create commit with message
- Push commit to remote
- Handle merge conflicts during push
- Validate commit message format

**`__tests__/services/BranchService.test.ts`**
- List all branches (local and remote)
- Create new branch from current HEAD
- Switch between branches
- Delete local and remote branches
- Handle branch naming validation

**`__tests__/services/DiffService.test.ts`**
- Generate diff between commits
- Parse diff output into structured format
- Calculate file change statistics
- Handle binary file diffs
- Generate unified diff format

### Utility Tests

**`__tests__/utils/formatters.test.ts`**
- Format relative timestamps ("2 hours ago")
- Format file sizes (bytes to KB/MB)
- Format commit hashes (short form)
- Format author names and emails

**`__tests__/utils/validators.test.ts`**
- Validate Git repository URLs
- Validate branch names
- Validate commit messages
- Validate file paths

**`__tests__/utils/humanize.test.ts`**
- Convert technical commit messages to human-readable
- Detect commit types (feature, fix, docs, etc.)
- Generate activity descriptions
- Simplify Git error messages

### Component Tests

**`__tests__/components/DiffViewer.test.tsx`**
- Render added lines in green
- Render removed lines in red
- Handle large diffs with virtualization
- Toggle between unified and split view

**`__tests__/components/CommitForm.test.tsx`**
- Display staged files
- Validate commit message input
- Show commit message templates
- Handle commit submission

### Store Tests

**`__tests__/stores/useRepositoryStore.test.ts`**
- Add repository to store
- Remove repository from store
- Update repository metadata
- Persist repositories to SQLite
- Load repositories on app start

## Implementation steps

### Phase 1: Project Setup & Core Infrastructure

1. **Initialize Expo project**
   ```bash
   npx create-expo-app gitflow --template tabs
   cd gitflow
   ```

2. **Install core dependencies**
   ```bash
   npx expo install expo-router expo-sqlite expo-file-system expo-auth-session expo-crypto
   npm install isomorphic-git react-native-paper zustand
   npm install -D @types/react @types/react-native typescript jest @testing-library/react-native
   ```

3. **Configure TypeScript**
   - Update `tsconfig.json` with strict mode
   - Add path aliases for `@/` pointing to `src/`

4. **Set up file-based routing**
   - Create `app/` directory structure as specified
   - Configure `app/_layout.tsx` with navigation theme
   - Set up tab navigation in `app/(tabs)/_layout.tsx`

5. **Initialize SQLite database**
   - Create `src/services/storage/DatabaseService.ts`
   - Define schema for repositories, commits, branches, activity
   - Write migration functions for schema updates
   - Add initialization logic in app entry point

### Phase 2: Authentication & API Integration

6. **Implement OAuth authentication**
   - Create `src/services/auth/AuthService.ts`
   - Set up GitHub OAuth flow with expo-auth-session
   - Store access tokens securely with expo-secure-store
   - Create `app/(auth)/login.tsx` with provider selection
   - Handle OAuth callback in `app/(auth)/oauth-callback.tsx`

7. **Build GitHub API client**
   - Create `src/services/api/GitHubAPI.ts`
   - Implement methods: listRepositories, getPullRequests, getCommits
   - Add error handling and rate limit detection
   - Write tests for API client

8. **Create auth store**
   - Implement `src/stores/useAuthStore.ts` with Zustand
   - Add login, logout, token refresh logic
   - Persist auth state to AsyncStorage

### Phase 3: Git Core Functionality

9. **Implement Git service layer**
   - Create `src/services/git/GitService.ts` as main interface
   - Wrap isomorphic-git with mobile-friendly API
   - Configure file system paths using expo-file-system
   - Add credential management for HTTPS auth

10. **Build clone functionality**
    - Create `src/services/git/CloneService.ts`
    - Implement progress tracking for clone operations
    - Handle large repositories with streaming
    - Add tests for clone success and failure cases

11. **Implement commit operations**
    - Create `src/services/git/CommitService.ts`
    - Add staging, committing, and pushing
    - Implement commit message templates
    - Write tests for commit workflow

12. **Build branch management**
    - Create `src/services/git/BranchService.ts`
    - Implement list, create, switch, delete operations
    - Add branch name validation
    - Write tests for branch operations

13. **Create diff service**
    - Create `src/services/git/DiffService.ts`
    - Parse git diff output into structured format
    - Calculate file statistics (additions, deletions)
    - Write tests for diff parsing

### Phase 4: Repository Management UI

14. **Build repository list screen**
    - Create `app/(tabs)/repositories.tsx`
    - Implement `src/components/RepositoryCard.tsx`
    - Add pull-to-refresh functionality
    - Connect to `src/stores/useRepositoryStore.ts`

15. **Create repository detail screen**
    - Build `app/repository/[id]/index.tsx`
    - Show repository stats, recent activity, branches
    - Add quick actions (pull, commit, switch branch)

16. **Implement file browser**
    - Create `app/repository/[id]/files.tsx`
    - Build `src/components/FileTree.tsx` with folder navigation
    - Add file type icons and size display
    - Implement search functionality

17. **Build file viewer/editor**
    - Create `app/repository/[id]/file/[path].tsx`
    - Add syntax highlighting with react-native-syntax-highlighter
    - Implement edit mode with save functionality
    - Show file history and blame information

### Phase 5: Commit & History Features

18. **Create commit history view**
    - Build `app/repository/[id]/history.tsx`
    - Implement `src/components/CommitCard.tsx`
    - Add infinite scroll for long histories
    - Show commit graph visualization

19. **Build commit form**
    - Create `src/components/CommitForm.tsx`
    - Show staged files with checkboxes
    - Add commit message templates dropdown
    - Implement commit preview with diff

20. **Create diff viewer**
    - Build `src/components/DiffViewer.tsx`
    - Implement line-by-line diff rendering
    - Add syntax highlighting for code diffs
    - Support unified and split view modes

### Phase 6: Pull Request Features

21. **Build PR list screen**
    - Create `app/(tabs)/pull-requests.tsx`
    - Implement `src/components/PullRequestCard.tsx`
    - Add filters (open, closed, assigned to me)
    - Show PR status and review state

22. **Create PR detail view**
    - Build `app/pull-request/[id].tsx`
    - Show PR description, commits, and files changed
    - Add inline comment functionality
    - Implement approve/request changes actions

23. **Build review interface**
    - Create comment threads on specific lines
    - Add review templates for common feedback
    - Show review status from other reviewers
    - Implement submit review flow

### Phase 7: Activity Feed & Collaboration

24. **Build activity feed**
    - Create `app/(tabs)/index.tsx`
    - Implement `src/components/ActivityCard.tsx`
    - Fetch activities from GitHub API
    - Add real-time updates with polling

25. **Create humanization layer**
    - Implement `src/utils/humanize.ts`
    - Convert technical messages to readable text
    - Add activity type detection
    - Write tests for humanization logic

26. **Build notification system**
    - Add push notification setup
    - Implement notification preferences
    - Create notification action handlers
    - Test notification delivery

### Phase 8: Branch Management UI

27. **Create branch selector**
    - Build `src/components/BranchSelector.tsx`
    - Show current branch with indicator
    - List all branches with search
    - Add create branch action

28. **Build branch management screen**
    - Create `app/repository/[id]/branches.tsx`
    - Show branch list with last commit info
    - Add delete and merge actions
    - Implement branch comparison view

29. **Create merge interface**
    - Build `src/services/git/MergeService.ts`
    - Implement conflict detection
    - Create `src/components/ConflictResolver.tsx`
    - Add merge preview and confirmation

### Phase 9: Polish & Optimization

30. **Implement caching layer**
    - Cache repository metadata in SQLite
    - Store recent commits and branches locally
    - Add cache invalidation logic
    - Implement offline mode for cached data

31. **Add loading states**
    - Create skeleton screens for all views
    - Add progress indicators for long operations
    - Implement optimistic updates for commits
    - Show error states with retry actions

32. **Build onboarding flow**
    - Create welcome screens explaining features
    - Add interactive tutorial for first commit
    - Implement feature discovery tooltips
    - Add skip option for experienced users

33. **Optimize performance**
    - Implement virtualized lists for long histories
    - Add image lazy loading
    - Optimize diff rendering for large files
    - Profile and fix performance bottlenecks

### Phase 10: Monetization & Analytics

34. **Implement paywall**
    - Add repository limit check for free tier
    - Create upgrade prompts at feature limits
    - Build subscription management screen
    - Integrate with App Store/Play Store billing

35. **Add analytics**
    - Track feature usage with privacy-first approach
    - Monitor error rates and crash reports
    - Measure conversion funnel (install → commit)
    - Add A/B testing framework for pricing

36. **Create premium features**
    - Lock advanced branching behind paywall
    - Add team collaboration features
    - Implement conflict resolution tools
    - Build custom themes for premium users

### Phase 11: Testing & Quality Assurance

37. **Write comprehensive tests**
    - Achieve 80%+ code coverage
    - Test all Git operations with mock repositories
    - Add integration tests for critical flows
    - Test offline functionality

38. **Perform security audit**
    - Review token storage and transmission
    - Test OAuth implementation
    - Validate input sanitization
    - Check for common mobile vulnerabilities

39. **Test on real devices**
    - Test on iOS (iPhone 12+, iPad)
    - Test on Android (various screen sizes)
    - Verify performance on older devices
    - Test with slow network conditions

### Phase 12: Launch Preparation

40. **Create app store assets**
    - Design app icon and screenshots
    - Write compelling app description
    - Create demo video showing key features
    - Prepare privacy policy and terms of service

41. **Set up backend services**
    - Deploy webhook handlers for notifications
    - Set up analytics backend
    - Configure crash reporting
    - Implement feature flags for gradual rollout

42. **Prepare launch strategy**
    - Create landing page with waitlist
    - Write launch blog post
    - Prepare social media content
    - Plan Product Hunt launch

## How to verify it works

### Local Development Testing

1. **Start Expo development server**
   ```bash
   npm start
   ```

2. **Test on iOS Simulator**
   ```bash
   npm run ios
   ```
   - Verify app launches without crashes
   - Test OAuth login flow with GitHub
   - Clone a test repository
   - Make a commit and push changes
   - Create and switch branches
   - Review a pull request

3. **Test on Android Emulator**
   ```bash
   npm run android
   ```
   - Repeat all iOS tests
   - Verify UI renders correctly on different screen sizes
   - Test back button navigation
   - Verify file system permissions

4. **Test on physical device with Expo Go**
   - Scan QR code from Expo dev server
   - Test on real network conditions
   - Verify push notifications
   - Test offline mode functionality

### Automated Testing

5. **Run unit tests**
   ```bash
   npm test
   ```
   - All tests must pass
   - Coverage should be >80%
   - No console errors or warnings

6. **Run type checking**
   ```bash
   npm run type-check
   ```
   - No TypeScript errors
   - All types properly defined

7. **Run linting**
   ```bash
   npm run lint
   ```
   - No ESLint errors
   - Code follows style guide

### Feature Verification Checklist

**Authentication:**
- [ ] User can log in with GitHub OAuth
- [ ] Access token is stored securely
- [ ] Token refresh works automatically
- [ ] User can log out and clear data

**Repository Management:**
- [ ] User can view list of repositories
- [ ] User can clone a repository
- [ ] Repository files are browsable
- [ ] File content displays correctly with syntax highlighting

**Commit Operations:**
- [ ] User can edit files
- [ ] Changes are staged correctly
- [ ] Commit form shows staged files
- [ ] Commit is created and pushed successfully
- [ ] Commit appears in history

**Branch Management:**
- [ ] User can view all branches
- [ ] User can create new branch
- [ ] User can switch between branches
- [ ] User can delete branches
- [ ] Branch selector shows current branch

**Pull Requests:**
- [ ] User can view list of PRs
- [ ] PR details load correctly
- [ ] User can comment on PRs
- [ ] User can approve/request changes
- [ ] PR status updates in real-time

**Activity Feed:**
- [ ] Recent activities display correctly
- [ ] Activities are humanized (readable text)
- [ ] Feed updates with new activities
- [ ] User can filter activities

**Offline Mode:**
- [ ] Cached repositories are accessible offline
- [ ] User can view commit history offline
- [ ] Changes sync when back online
- [ ] Appropriate offline indicators shown

**Performance:**
- [ ] App launches in <3 seconds
- [ ] Repository cloning shows progress
- [ ] Large file diffs render smoothly
- [ ] No memory leaks during extended use

### Pre-Launch Verification

8. **Test subscription flow**
   - Verify free tier limits are enforced
   - Test upgrade to premium
   - Verify premium features unlock
   - Test subscription cancellation

9. **Security verification**
   - Tokens are never logged
   - Sensitive data is encrypted
   - API calls use HTTPS
   - No hardcoded credentials

10. **Accessibility testing**
    - Screen reader compatibility
    - Sufficient color contrast
    - Touch targets are >44x44pt
    - Keyboard navigation works