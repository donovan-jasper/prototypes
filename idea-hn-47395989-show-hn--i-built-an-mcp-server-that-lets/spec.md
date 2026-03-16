# ThreadFlow

## One-line pitch
Manage your social media like texting a friend — post, schedule, and analyze across Threads and Bluesky with simple voice or text commands.

## Expanded vision

**Core audience:** Anyone who creates content on social media but hates the friction of switching apps, remembering optimal posting times, or manually tracking what works.

**Broadest reach:**
- **Busy parents** running side hustles (Etsy shops, coaching services) who need to post between school runs
- **Freelancers and solopreneurs** (photographers, designers, consultants) who want social presence without hiring a VA
- **College students and young creators** building personal brands while juggling classes
- **Local business owners** (coffee shops, salons, gyms) who know they "should post more" but never do
- **Anyone managing a community account** (book clubs, sports teams, neighborhood groups)

**Adjacent use cases:**
- **Content repurposing:** "Turn my last Instagram caption into a Threads post"
- **Engagement triage:** "Show me comments I haven't replied to" with quick-reply suggestions
- **Trend surfing:** "What's trending on Threads right now that fits my niche?"
- **Cross-posting intelligence:** Automatically adapt tone/format for each platform
- **Voice-first creation:** Record ideas while driving, walking, cooking — app transcribes and formats

**Non-technical appeal:** It's like having a social media assistant in your pocket. No dashboards to learn, no scheduling grids to fill out. Just tell it what you want, and it handles the rest. The AI learns your voice, suggests improvements, and reminds you when you're going quiet.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** SQLite (expo-sqlite)
- **AI/NLP:** OpenAI API (GPT-4o-mini for cost efficiency)
- **Social APIs:** Threads API, Bluesky AT Protocol
- **Auth:** expo-auth-session with OAuth 2.0
- **Notifications:** expo-notifications
- **State management:** Zustand (lightweight, no boilerplate)
- **Testing:** Jest + React Native Testing Library
- **Voice input:** expo-speech (optional, for voice commands)

## Core features (MVP)

1. **Natural language posting**
   - Text or voice input: "Post to Threads: Just launched my new pottery collection 🏺"
   - AI refines tone, adds relevant hashtags, suggests best posting time
   - One-tap approve or edit before publishing

2. **Smart scheduling**
   - "Schedule this for tomorrow morning when my audience is most active"
   - App learns optimal times from your past engagement data
   - Queue view shows upcoming posts with drag-to-reorder

3. **Unified inbox**
   - All comments/mentions from Threads + Bluesky in one feed
   - AI-suggested replies: "Thank them," "Answer their question," "Invite to DM"
   - Swipe actions for quick responses

4. **Performance insights**
   - Simple cards: "Your best post this week," "You're posting 40% less than last month"
   - No overwhelming dashboards — just actionable nudges
   - Export reports as shareable images

5. **Multi-account support**
   - Switch between personal/business accounts with one tap
   - Cross-post with platform-specific tweaks (e.g., different hashtags for Threads vs Bluesky)

## Monetization strategy

**Free tier (hook):**
- Connect 1 account per platform (1 Threads + 1 Bluesky)
- 5 AI-assisted posts per month
- Basic scheduling (manual time selection)
- 7-day engagement history

**Pro tier — $8.99/month** (reasoning: undercuts Buffer at $10/mo, targets individuals not teams)
- Unlimited accounts
- Unlimited AI posts with advanced tone controls ("Make this funnier," "More professional")
- Smart scheduling with auto-optimization
- 90-day analytics with trend detection
- Priority support

**What keeps them subscribed:**
- **Habit formation:** After 2 weeks of AI-assisted posting, manual posting feels tedious
- **Data lock-in:** Historical analytics and learned preferences make switching painful
- **Time savings:** Users report saving 3-5 hours/week — worth $36-60 in opportunity cost
- **Incremental features:** Monthly AI model improvements, new platform integrations (Twitter/X, LinkedIn next)

**Enterprise tier — $299 one-time** (for agencies managing 10+ clients):
- White-label reports
- Team collaboration (assign posts to reviewers)
- API access for custom integrations
- Lifetime updates

## File structure

```
threadflow/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx              # Home: natural language input
│   │   ├── schedule.tsx           # Queue of scheduled posts
│   │   ├── inbox.tsx              # Unified engagement feed
│   │   └── insights.tsx           # Analytics dashboard
│   ├── _layout.tsx                # Root navigation
│   ├── auth.tsx                   # OAuth login flow
│   └── settings.tsx               # Account management
├── components/
│   ├── PostComposer.tsx           # AI-assisted post editor
│   ├── ScheduleCard.tsx           # Individual scheduled post
│   ├── InboxItem.tsx              # Comment/mention card
│   └── InsightCard.tsx            # Analytics widget
├── lib/
│   ├── ai.ts                      # OpenAI API wrapper
│   ├── threads.ts                 # Threads API client
│   ├── bluesky.ts                 # Bluesky AT Protocol client
│   ├── db.ts                      # SQLite setup and queries
│   ├── scheduler.ts               # Background task scheduling
│   └── analytics.ts               # Engagement calculation logic
├── store/
│   └── useStore.ts                # Zustand global state
├── types/
│   └── index.ts                   # TypeScript interfaces
├── __tests__/
│   ├── ai.test.ts
│   ├── scheduler.test.ts
│   ├── analytics.test.ts
│   └── PostComposer.test.tsx
├── app.json                       # Expo config
├── package.json
└── tsconfig.json
```

## Tests

**lib/__tests__/ai.test.ts**
```typescript
import { refinePost, suggestHashtags } from '../ai';

describe('AI post refinement', () => {
  it('should improve casual text for social media', async () => {
    const input = 'just made a new thing check it out';
    const refined = await refinePost(input, 'friendly');
    expect(refined).toContain('Just made');
    expect(refined.length).toBeGreaterThan(input.length);
  });

  it('should suggest relevant hashtags', async () => {
    const post = 'Excited to share my new pottery collection!';
    const tags = await suggestHashtags(post);
    expect(tags).toContain('#pottery');
    expect(tags.length).toBeLessThanOrEqual(5);
  });
});
```

**lib/__tests__/scheduler.test.ts**
```typescript
import { calculateOptimalTime, getUpcomingPosts } from '../scheduler';

describe('Smart scheduling', () => {
  it('should calculate best posting time based on history', () => {
    const history = [
      { postedAt: '2026-03-15T09:00:00Z', engagement: 120 },
      { postedAt: '2026-03-15T14:00:00Z', engagement: 45 },
      { postedAt: '2026-03-15T19:00:00Z', engagement: 200 },
    ];
    const optimal = calculateOptimalTime(history);
    expect(optimal.getHours()).toBe(19); // 7 PM had best engagement
  });

  it('should retrieve posts scheduled for next 7 days', async () => {
    const posts = await getUpcomingPosts(7);
    expect(Array.isArray(posts)).toBe(true);
    posts.forEach(post => {
      expect(post.scheduledFor).toBeDefined();
    });
  });
});
```

**lib/__tests__/analytics.test.ts**
```typescript
import { calculateEngagementRate, detectTrends } from '../analytics';

describe('Analytics calculations', () => {
  it('should calculate engagement rate correctly', () => {
    const post = { likes: 50, comments: 10, shares: 5, impressions: 1000 };
    const rate = calculateEngagementRate(post);
    expect(rate).toBe(6.5); // (50+10+5)/1000 * 100
  });

  it('should detect posting frequency trends', () => {
    const thisWeek = 3;
    const lastWeek = 5;
    const trend = detectTrends(thisWeek, lastWeek);
    expect(trend.direction).toBe('down');
    expect(trend.percentage).toBe(40);
  });
});
```

**components/__tests__/PostComposer.test.tsx**
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostComposer from '../PostComposer';

describe('PostComposer', () => {
  it('should refine text when user taps enhance button', async () => {
    const { getByPlaceholderText, getByText } = render(<PostComposer />);
    const input = getByPlaceholderText('What do you want to post?');
    
    fireEvent.changeText(input, 'new blog post is up');
    fireEvent.press(getByText('Enhance'));
    
    await waitFor(() => {
      expect(input.props.value).toContain('New blog post');
    });
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app threadflow --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-auth-session expo-notifications
   npm install zustand openai @atproto/api
   npm install -D @types/jest @testing-library/react-native
   ```
3. Configure `app.json`:
   - Set bundle identifier: `com.threadflow.app`
   - Add notification permissions
   - Configure deep linking scheme: `threadflow://`

### Phase 2: Database setup
1. Create `lib/db.ts`:
   - Initialize SQLite database with tables: `accounts`, `posts`, `scheduled_posts`, `engagement_history`
   - Write migration functions for schema updates
2. Define TypeScript interfaces in `types/index.ts`:
   - `Account`, `Post`, `ScheduledPost`, `EngagementMetrics`
3. Test database CRUD operations

### Phase 3: Authentication
1. Implement OAuth flow in `app/auth.tsx`:
   - Threads: Use Meta's OAuth 2.0 (requires app registration at developers.facebook.com)
   - Bluesky: Use AT Protocol session creation
2. Store tokens securely in SQLite (encrypted)
3. Create account switcher in settings

### Phase 4: Social API clients
1. Build `lib/threads.ts`:
   - `publishPost(text, mediaUrls)` → POST to Threads API
   - `fetchComments(postId)` → GET comments
   - `replyToComment(commentId, text)` → POST reply
2. Build `lib/bluesky.ts`:
   - Use `@atproto/api` SDK
   - `createPost(text)` → publish to Bluesky
   - `getNotifications()` → fetch mentions
3. Add error handling for rate limits and auth failures

### Phase 5: AI integration
1. Create `lib/ai.ts`:
   - `refinePost(input, tone)` → call OpenAI API with prompt engineering
   - `suggestHashtags(text)` → extract keywords and return relevant tags
   - `generateReply(comment, context)` → suggest response to engagement
2. Implement token usage tracking to stay within budget
3. Add fallback for offline mode (queue requests)

### Phase 6: Core UI components
1. `PostComposer.tsx`:
   - Text input with character counter
   - "Enhance" button triggers AI refinement
   - Platform selector (Threads/Bluesky/Both)
   - Schedule picker (now/later/optimal)
2. `ScheduleCard.tsx`:
   - Display scheduled post preview
   - Edit/delete actions
   - Drag handle for reordering
3. `InboxItem.tsx`:
   - Show comment/mention with user avatar
   - AI-suggested reply chips
   - Swipe-to-reply gesture

### Phase 7: Scheduling logic
1. Implement `lib/scheduler.ts`:
   - `calculateOptimalTime(history)` → analyze past engagement
   - `queuePost(post, scheduledFor)` → save to database
   - Background task (expo-task-manager) to publish queued posts
2. Set up local notifications for post reminders
3. Handle timezone conversions

### Phase 8: Analytics
1. Build `lib/analytics.ts`:
   - Fetch post metrics from APIs
   - Calculate engagement rates
   - Detect trends (posting frequency, best-performing content)
2. Create `InsightCard.tsx` widgets:
   - "Top post this week"
   - "Engagement trend" chart
   - "Suggested action" nudges

### Phase 9: State management
1. Set up Zustand store in `store/useStore.ts`:
   - `accounts` (connected social accounts)
   - `scheduledPosts` (queue)
   - `inboxItems` (unread engagement)
   - `settings` (user preferences)
2. Persist state to SQLite on changes

### Phase 10: Navigation and screens
1. Configure tab navigation in `app/(tabs)/_layout.tsx`
2. Build home screen (`index.tsx`):
   - Large text input for natural language commands
   - Recent posts list
3. Build schedule screen (`schedule.tsx`):
   - Scrollable list of `ScheduleCard` components
   - "Add post" FAB
4. Build inbox screen (`inbox.tsx`):
   - Filterable list (all/Threads/Bluesky)
   - Pull-to-refresh
5. Build insights screen (`insights.tsx`):
   - Grid of `InsightCard` widgets

### Phase 11: Monetization gates
1. Add subscription check middleware:
   - Free tier: limit AI calls to 5/month
   - Pro tier: unlock all features
2. Integrate RevenueCat or Expo's in-app purchases
3. Build paywall screen with feature comparison

### Phase 12: Testing
1. Write unit tests for all `lib/` modules
2. Write component tests for UI interactions
3. Run `npm test` and ensure 100% pass rate
4. Manual testing on iOS simulator and Android emulator

### Phase 13: Polish
1. Add loading states and error messages
2. Implement haptic feedback for key actions
3. Create onboarding flow (3 screens max)
4. Design app icon and splash screen

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test authentication flow:
   - Tap "Connect Threads" → should redirect to Meta OAuth
   - Tap "Connect Bluesky" → should prompt for handle/password
4. Test post creation:
   - Type "Post to Threads: Testing ThreadFlow 🚀"
   - Tap "Enhance" → text should improve
   - Tap "Post now" → verify post appears on Threads
5. Test scheduling:
   - Create post with "Schedule for tomorrow 9am"
   - Check schedule screen → post should appear in queue
6. Test inbox:
   - Comment on your Threads post from another account
   - Pull to refresh inbox → comment should appear
   - Tap suggested reply → should populate composer

### Automated tests
```bash
npm test
```
All tests in `__tests__/` must pass. Expected output:
```
PASS  lib/__tests__/ai.test.ts
PASS  lib/__tests__/scheduler.test.ts
PASS  lib/__tests__/analytics.test.ts
PASS  components/__tests__/PostComposer.test.tsx

Test Suites: 4 passed, 4 total
Tests:       8 passed, 8 total
```

### Production readiness checklist
- [ ] OAuth redirects work on physical devices
- [ ] Background tasks publish scheduled posts on time
- [ ] Notifications trigger when engagement arrives
- [ ] App handles network failures gracefully
- [ ] Subscription paywall blocks free tier overuse
- [ ] Analytics data matches platform-native metrics (±5% variance acceptable)