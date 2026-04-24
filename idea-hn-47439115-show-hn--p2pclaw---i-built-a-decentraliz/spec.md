```markdown
# App Spec: PeerVerse

## 1. App Name
**PeerVerse** – A decentralized research network where scientists and AI agents collaborate with cryptographic proof verification.

## 2. One-line pitch
"Publish, validate, and collaborate on research with verifiable proofs—no gatekeepers, just trustless science."

## 3. Expanded vision
**Who is this REALLY for?**
- **Academic researchers** (PhDs, postdocs) who want unbiased peer review.
- **Independent scientists** (citizen scientists, hobbyists) who lack institutional access.
- **AI developers** who need verifiable training data and model validation.
- **Journalists & policymakers** who need trustworthy, verifiable research.
- **Students & educators** who want accessible, decentralized research tools.

**Adjacent use cases:**
- **Open-source research** (GitHub for science).
- **AI-assisted research** (AI agents co-authoring papers).
- **Field science** (offline-first data collection from labs, expeditions).
- **Anti-censorship research** (bypassing paywalled journals).

**Why non-technical people want this:**
- **Scientists in developing regions** who can’t afford subscriptions.
- **Journalists** who need verifiable sources.
- **Citizen scientists** who want to contribute to research.

## 4. Tech stack
- **Frontend:** React Native (Expo) for cross-platform.
- **Local storage:** SQLite (offline-first sync).
- **Decentralized storage:** IPFS (for research papers, datasets).
- **Cryptography:** Libsodium (for proof verification).
- **AI agents:** Web3-compatible API (e.g., Hugging Face).
- **Backend:** Firebase (for auth, notifications).

## 5. Core features (MVP)
1. **Decentralized Paper Submission** – Submit research with cryptographic hashes.
2. **Peer-to-Peer Review** – AI agents and humans validate findings.
3. **Offline-First Mode** – Collect data in the field, sync later.
4. **Proof Verification** – Cryptographic validation of research claims.
5. **AI Agent Collaboration** – AI agents suggest edits, references.

## 6. Monetization strategy
- **Free tier:**
  - Basic paper submission.
  - Limited AI agent interactions.
  - No priority review.
- **Paid tiers:**
  - **Verified Researcher ($9.99/month):**
    - Priority review.
    - Advanced proof tools.
    - Access to AI agent integrations.
  - **AI Researcher ($99/year):**
    - Full AI agent collaboration.
    - Custom model training data.
    - White-label research tools.
- **Why people stay subscribed:**
  - **Scientists** need priority review for grants/publications.
  - **AI devs** need verified datasets for training.
  - **Institutions** pay for bulk verified research.

## 7. Skip if saturated
**SKIP:** ResearchGate and Zotero already dominate, but **PeerVerse** differentiates with:
- **Decentralized proofs** (no human gatekeepers).
- **Mobile-first field science** (no desktop required).
- **AI agent collaboration** (no existing competitor).

## 8. File structure
```
peerverse/
├── app/
│   ├── components/ (UI)
│   ├── screens/ (views)
│   ├── utils/ (crypto, IPFS)
│   └── services/ (Firebase, AI agents)
├── assets/ (icons, fonts)
├── tests/ (Jest)
└── package.json
```

## 9. Tests
```javascript
// tests/crypto.test.js
const { generateProof, verifyProof } = require('../app/utils/crypto');

test('Proof generation and verification', () => {
  const data = "Sample research paper";
  const proof = generateProof(data);
  expect(verifyProof(data, proof)).toBe(true);
});
```

## 10. Implementation steps
1. **Setup Expo project:**
   ```bash
   npx create-expo-app peerverse
   cd peerverse
   ```
2. **Install deps:**
   ```bash
   npm install react-native-sqlite-storage @react-native-async-storage/async-storage ipfs-http-client libsodium-wrappers
   ```
3. **Build core features:**
   - Implement `PaperSubmissionScreen` (MVP).
   - Add `ProofVerification` utility.
   - Set up Firebase auth.
4. **Test:**
   ```bash
   npm test
   ```
5. **Deploy:**
   ```bash
   expo publish
   ```

## 11. Verification
- **Run on device:** `expo start --ios` or `--android`.
- **Tests must pass:** `npm test`.
```