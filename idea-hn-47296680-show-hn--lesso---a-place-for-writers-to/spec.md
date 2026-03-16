# CourseKit

## One-line pitch
Turn your writing into paid courses in minutes—no video, no website, just your words.

## Expanded vision

### Who is this REALLY for?

**Primary audience:**
- Newsletter writers (Substack, Beehiiv, Ghost) with 500+ subscribers who want to monetize expertise without creating videos
- Freelance writers and journalists who've accumulated domain knowledge and want passive income
- Corporate trainers and consultants who need to package their frameworks into sellable IP
- Academic researchers who want to share findings outside traditional publishing
- Coaches and therapists who prefer written exercises over video sessions

**Broadest audience:**
Anyone who writes professionally and has knowledge worth packaging. This includes:
- Technical writers who document complex systems and could sell "how-to" courses
- Legal/medical professionals who write guides and want to monetize compliance training
- Hobbyists with deep expertise (gardening, woodworking, cooking) who blog regularly
- Parents creating homeschool curricula from their teaching notes
- Community organizers building educational resources for their groups

**Adjacent use cases:**
- **Internal training libraries**: Companies use it to convert documentation into onboarding courses
- **Membership content**: Creators bundle courses as exclusive member perks
- **Lead magnets**: Free mini-courses that funnel into paid consulting
- **Book companions**: Authors create course versions of their books for different learning styles
- **Certification prep**: Subject matter experts build exam prep courses from study guides

**Why non-technical people want this:**
- No code, no website builder, no video editing—just write like you already do
- Import existing content (blog posts, PDFs, Google Docs) instead of starting from scratch
- AI suggests course structure from your raw writing, saving hours of outlining
- Mobile-first means you can draft a lesson while commuting, publish from a coffee shop
- Built-in payment processing—no Stripe setup, no invoicing headaches

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local storage**: SQLite (expo-sqlite)
- **Authentication**: Expo AuthSession + JWT
- **Payments**: Stripe Connect (for creator payouts) + Stripe Checkout
- **AI integration**: OpenAI API (GPT-4) for course structuring
- **File handling**: expo-document-picker, expo-file-system
- **Rich text**: react-native-markdown-display (for rendering), simple textarea (for editing)
- **State management**: Zustand (lightweight, no boilerplate)
- **Navigation**: Expo Router (file-based routing)
- **Testing**: Jest + React Native Testing Library
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)

## Core features (MVP)

1. **One-tap content import**
   - Paste Substack/Medium URLs to auto-extract articles
   - Upload PDFs/Word docs and convert to lessons
   - Connect Google Drive/Dropbox for bulk import
   - AI analyzes imported content and suggests course structure (modules + lessons)

2. **Mobile-native course builder**
   - Drag-and-drop lesson reordering
   - Markdown editor with preview
   - Voice-to-text for quick lesson drafting
   - Offline mode—write without internet, sync later
   - Add quizzes (multiple choice, short answer) between lessons

3. **Instant publishing + payments**
   - One-tap publish to your unique coursekit.app/yourname page
   - Set course price ($9-$999) or make it free
   - Stripe handles payments, you get 85% (we take 15%)
   - Students access courses via web link (no app required for them)
   - Push notifications when someone enrolls

4. **Student engagement dashboard**
   - See who's enrolled, completion rates, and quiz scores
   - Send broadcast messages to all students in a course
   - Drip content—release lessons on a schedule
   - Export student emails for your newsletter

5. **AI course assistant**
   - "Generate course outline from my last 10 blog posts"
   - "Suggest quiz questions for this lesson"
   - "Rewrite this section for beginners"
   - "Create a landing page description"

## Monetization strategy

**Free tier (the hook):**
- Create 1 course with up to 5 lessons
- Up to 25 students per course
- Basic analytics (enrollments, completions)
- 80% revenue share (we take 20%)
- CourseKit branding on course pages

**Pro tier - $14.99/month (the paywall):**
- Unlimited courses and lessons
- Unlimited students
- 85% revenue share (we take 15%)
- Remove CourseKit branding
- Advanced analytics (time spent, drop-off points, quiz performance)
- Drip content scheduling
- Custom domain (courses.yourname.com)
- Priority AI credits (50 requests/month vs 10 on free)
- Email export for marketing

**Why people STAY subscribed:**
- **Recurring revenue dependency**: Once you have paying students, you need Pro to keep the 85% split and remove branding
- **Network effects**: More courses = more students = more revenue = higher perceived value of the subscription
- **AI becomes essential**: After using AI to structure 2-3 courses, manual outlining feels painful
- **Analytics addiction**: Seeing completion rates and student progress is habit-forming
- **Sunk cost**: Migrating courses to another platform means losing your coursekit.app/yourname URL and student base

**Price reasoning:**
- $14.99 is below Teachable ($39/mo) and Kajabi ($149/mo) but above Substack ($0)
- Targets creators making $500-5k/month from courses—subscription is <3% of revenue
- High enough to filter serious creators, low enough for experimentation

## File structure

```
coursekit/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard (courses list)
│   │   ├── create.tsx             # New course wizard
│   │   ├── students.tsx           # Student management
│   │   └── settings.tsx           # Account settings
│   ├── course/
│   │   ├── [id].tsx               # Course editor
│   │   └── lesson/[lessonId].tsx  # Lesson editor
│   ├── import.tsx                 # Content import flow
│   └── _layout.tsx
├── components/
│   ├── CourseCard.tsx
│   ├── LessonEditor.tsx
│   ├── MarkdownPreview.tsx
│   ├── QuizBuilder.tsx
│   ├── AIAssistant.tsx
│   ├── AnalyticsDashboard.tsx
│   └── PaymentSetup.tsx
├── lib/
│   ├── db.ts                      # SQLite setup
│   ├── supabase.ts                # Supabase client
│   ├── stripe.ts                  # Stripe integration
│   ├── ai.ts                      # OpenAI API calls
│   ├── import.ts                  # Content extraction logic
│   └── sync.ts                    # Offline sync
├── store/
│   ├── authStore.ts               # Zustand auth state
│   ├── courseStore.ts             # Zustand course state
│   └── settingsStore.ts           # Zustand settings state
├── types/
│   └── index.ts                   # TypeScript types
├── __tests__/
│   ├── import.test.ts
│   ├── courseStore.test.ts
│   ├── ai.test.ts
│   └── sync.test.ts
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

```typescript
// __tests__/import.test.ts
import { extractContentFromURL, convertPDFToText } from '../lib/import';

describe('Content Import', () => {
  test('extracts title and body from Substack URL', async () => {
    const result = await extractContentFromURL('https://example.substack.com/p/test');
    expect(result.title).toBeDefined();
    expect(result.body.length).toBeGreaterThan(0);
  });

  test('handles invalid URLs gracefully', async () => {
    await expect(extractContentFromURL('not-a-url')).rejects.toThrow();
  });
});

// __tests__/courseStore.test.ts
import { useCourseStore } from '../store/courseStore';

describe('Course Store', () => {
  test('creates a new course', () => {
    const store = useCourseStore.getState();
    store.createCourse({ title: 'Test Course', description: 'Test' });
    expect(store.courses.length).toBe(1);
  });

  test('adds lesson to course', () => {
    const store = useCourseStore.getState();
    const courseId = store.courses[0].id;
    store.addLesson(courseId, { title: 'Lesson 1', content: 'Content' });
    expect(store.courses[0].lessons.length).toBe(1);
  });
});

// __tests__/ai.test.ts
import { generateCourseOutline, suggestQuizQuestions } from '../lib/ai';

describe('AI Assistant', () => {
  test('generates course outline from text', async () => {
    const outline = await generateCourseOutline('Sample blog post content...');
    expect(outline.modules.length).toBeGreaterThan(0);
  });

  test('suggests quiz questions for lesson', async () => {
    const questions = await suggestQuizQuestions('Lesson content about React hooks');
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].type).toBe('multiple_choice');
  });
});

// __tests__/sync.test.ts
import { syncOfflineChanges, queueChange } from '../lib/sync';

describe('Offline Sync', () => {
  test('queues changes when offline', () => {
    queueChange({ type: 'UPDATE_LESSON', data: { id: '1', content: 'New' } });
    expect(getQueueLength()).toBe(1);
  });

  test('syncs queued changes when online', async () => {
    await syncOfflineChanges();
    expect(getQueueLength()).toBe(0);
  });
});
```

## Implementation steps

### Phase 1: Project setup
1. Initialize Expo project: `npx create-expo-app coursekit --template tabs`
2. Install dependencies:
   ```bash
   npx expo install expo-sqlite expo-document-picker expo-file-system expo-auth-session
   npm install zustand react-native-markdown-display @supabase/supabase-js stripe
   npm install -D jest @testing-library/react-native @types/jest
   ```
3. Configure `app.json` with app name, bundle ID, and permissions (camera, files, notifications)
4. Set up TypeScript types in `types/index.ts` (Course, Lesson, User, Quiz, etc.)
5. Configure Jest in `jest.config.js` for React Native

### Phase 2: Database and auth
1. Create Supabase project and get API keys
2. Set up `lib/supabase.ts` with client initialization
3. Create SQLite schema in `lib/db.ts`:
   - `courses` table (id, title, description, price, published, created_at)
   - `lessons` table (id, course_id, title, content, order, created_at)
   - `quizzes` table (id, lesson_id, questions JSON, created_at)
   - `sync_queue` table (id, action, data JSON, synced)
4. Implement auth screens (`app/(auth)/login.tsx`, `signup.tsx`) with Supabase Auth
5. Create `store/authStore.ts` with Zustand for auth state

### Phase 3: Course management
1. Build dashboard (`app/(tabs)/index.tsx`) showing course list with CourseCard components
2. Implement `store/courseStore.ts` with actions: createCourse, updateCourse, deleteCourse, addLesson
3. Create course editor (`app/course/[id].tsx`) with:
   - Editable title/description
   - Lesson list with drag-to-reorder
   - Add lesson button
   - Publish toggle
4. Build lesson editor (`app/course/lesson/[lessonId].tsx`) with:
   - Markdown textarea
   - Live preview using react-native-markdown-display
   - Voice-to-text button (expo-speech)
   - Save button (auto-saves to SQLite)

### Phase 4: Content import
1. Create import screen (`app/import.tsx`) with three tabs: URL, File, AI Generate
2. Implement `lib/import.ts`:
   - `extractContentFromURL()`: Fetch HTML, parse with regex/cheerio-like logic
   - `convertPDFToText()`: Use expo-file-system + PDF.js or send to backend
   - `parseMarkdown()`: Split by headers into lessons
3. Add "Import" button to dashboard that navigates to import screen
4. After import, show preview of extracted lessons with "Create Course" button

### Phase 5: AI assistant
1. Set up `lib/ai.ts` with OpenAI API client
2. Implement functions:
   - `generateCourseOutline(text)`: Send to GPT-4 with prompt, parse JSON response
   - `suggestQuizQuestions(lessonContent)`: Generate 3-5 questions
   - `rewriteForAudience(text, audience)`: Simplify or formalize content
3. Add AI button to course editor that opens modal with AI options
4. Track AI usage in `store/settingsStore.ts` (free tier = 10 requests/month)

### Phase 6: Payments and publishing
1. Set up Stripe Connect in `lib/stripe.ts`:
   - Create connected account for creator
   - Generate payment links for courses
2. Add "Set Price" modal in course editor
3. Implement publish flow:
   - Upload course data to Supabase
   - Generate unique URL (coursekit.app/username/course-slug)
   - Create Stripe product and price
4. Build student enrollment webhook (Supabase Edge Function) that:
   - Records enrollment in database
   - Sends push notification to creator
   - Emails student with course access link

### Phase 7: Student management
1. Create students screen (`app/(tabs)/students.tsx`) showing:
   - List of enrolled students per course
   - Completion percentage
   - Last active date
2. Implement analytics dashboard component:
   - Chart of enrollments over time
   - Lesson completion rates
   - Quiz score averages
3. Add "Send Message" button that opens modal to broadcast to all students

### Phase 8: Offline sync
1. Implement `lib/sync.ts`:
   - `queueChange(action, data)`: Save to sync_queue table
   - `syncOfflineChanges()`: POST queued changes to Supabase when online
   - Listen to network state changes (expo-network)
2. Modify courseStore actions to queue changes when offline
3. Show sync status indicator in header

### Phase 9: Subscription paywall
1. Create settings screen (`app/(tabs)/settings.tsx`) with:
   - Current plan display
   - "Upgrade to Pro" button
   - Stripe billing portal link
2. Implement feature gates in courseStore:
   - Check plan before allowing >1 course (free tier)
   - Show upgrade modal when hitting limits
3. Set up Stripe subscription webhooks to update user plan in Supabase

### Phase 10: Polish and testing
1. Write all tests in `__tests__/` directory
2. Add loading states and error handling to all screens
3. Implement push notifications (expo-notifications) for:
   - New student enrollments
   - Course completion milestones
4. Add onboarding flow for first-time users
5. Test on iOS and Android devices via Expo Go
6. Run `npm test` to verify all tests pass

## How to verify it works

### Local development
1. Start Expo dev server: `npx expo start`
2. Scan QR code with Expo Go app (iOS/Android)
3. Test core flows:
   - Sign up with email
   - Create a course with 2-3 lessons
   - Import content from a URL (use a public blog post)
   - Use AI to generate quiz questions
   - Toggle offline mode (airplane mode) and edit a lesson
   - Go back online and verify sync
   - Set a course price and publish
   - View analytics dashboard

### Automated tests
1. Run test suite: `npm test`
2. Verify all tests pass:
   - Content import extracts title and body
   - Course store creates courses and lessons
   - AI generates valid outlines and questions
   - Offline sync queues and processes changes

### Production readiness
1. Build for iOS: `eas build --platform ios`
2. Build for Android: `eas build --platform android`
3. Test on physical devices (not just simulator)
4. Verify Stripe payments work end-to-end (use test mode)
5. Check push notifications arrive on device
6. Confirm offline mode syncs correctly after reconnecting