# AuthentiChat

## One-line pitch
Know when you're talking to a human — detect AI-generated messages and protect authentic connections in every conversation.

## Expanded vision

### Who is this REALLY for?

**Primary audience (broadest reach):**
- Anyone who texts, messages, or emails regularly (essentially everyone with a smartphone)
- Parents concerned about who their teens are really talking to online
- Dating app users wanting to verify authentic human interest vs bot/scam accounts
- Job seekers evaluating whether recruiter messages are personalized or mass AI-generated
- Small business owners managing customer communications
- Remote workers navigating professional relationships through digital channels

**Adjacent use cases:**
- **Romance scam protection**: Detect AI-generated dating profiles and messages before emotional/financial investment
- **Customer service quality**: Verify if businesses are using AI without disclosure
- **Educational integrity**: Parents/teachers checking if students are submitting AI-written work
- **Social media authenticity**: Identify bot accounts and AI-generated comments
- **Legal/compliance**: Document communication authenticity for disputes or records
- **Mental health**: Reduce anxiety about "who am I really talking to?" in digital relationships

**Why non-technical people want this:**
- Trust erosion is universal — everyone feels the uncanny valley of AI communication
- Simple visual indicators (authenticity score, human/AI badge) require zero technical knowledge
- Protects emotional investment in relationships (romantic, professional, familial)
- Empowers users to make informed decisions about how much to trust/invest in conversations
- Reduces cognitive load of constantly wondering "is this real?"

**The killer insight**: This isn't about detecting AI — it's about preserving human connection in an increasingly synthetic world. Every person who's ever wondered "is this person really interested in me or just using ChatGPT?" needs this app.

## Tech stack

- **Framework**: React Native (Expo SDK 52+)
- **Language**: TypeScript
- **Local storage**: SQLite (expo-sqlite)
- **AI detection**: On-device ML model (TensorFlow Lite via expo-ml) + cloud API fallback
- **Clipboard monitoring**: expo-clipboard
- **Notifications**: expo-notifications
- **State management**: Zustand (lightweight, minimal)
- **Testing**: Jest + React Native Testing Library
- **Analytics**: Expo Analytics (privacy-focused)

## Core features (MVP)

1. **Instant Paste Analysis**
   - Copy any message → open app → instant authenticity score (0-100% human)
   - Visual indicator: green (human), yellow (mixed), red (AI-generated)
   - Works offline with on-device model for privacy

2. **Conversation History Tracker**
   - Save analyzed messages with timestamps and scores
   - Tag conversations by person/platform
   - Trend view: "This person's messages were 90% human last month, now 20%"

3. **Smart Response Coach**
   - When AI is detected, suggests how to respond authentically
   - "Ask a specific follow-up question only a human would know"
   - "Request a voice note or video call"
   - Context-aware suggestions (dating vs professional vs family)

4. **Platform Integration Shortcuts**
   - Quick share from messaging apps (iOS share sheet, Android intent)
   - Analyze screenshots of conversations
   - Export authenticity reports as shareable images

5. **Authenticity Insights Dashboard**
   - Weekly summary: "You analyzed 47 messages, 68% were human-written"
   - Relationship health scores for frequent contacts
   - Red flags: sudden drops in authenticity from specific people

## Monetization strategy

**Free tier (the hook):**
- 10 message analyses per day
- Basic authenticity score (human/AI/mixed)
- 7-day conversation history
- Single-platform tracking

**Premium ($6.99/month or $49.99/year — 40% savings):**
- Unlimited analyses
- Advanced detection (identifies specific AI models: ChatGPT, Claude, etc.)
- Unlimited conversation history with search
- Multi-platform relationship tracking
- Response coaching with personalized strategies
- Authenticity trend alerts ("John's messages dropped to 15% human")
- Export detailed reports (PDF/CSV)
- Priority cloud processing (faster results)
- Browser extension for desktop messaging

**Why people STAY subscribed:**
- **Anxiety reduction**: Peace of mind is worth $7/month for active daters, job seekers, business owners
- **Relationship protection**: Ongoing monitoring prevents slow erosion of trust
- **Professional necessity**: Consultants/salespeople need to verify client engagement authenticity
- **Sunk cost**: Once you've built conversation history, switching away loses valuable data
- **Network effects**: More contacts tracked = more valuable insights

**Price reasoning:**
- Higher than typical utility apps ($2.99) because this solves emotional/trust problems, not just convenience
- Lower than therapy/coaching apps ($15+) to remain accessible
- Annual