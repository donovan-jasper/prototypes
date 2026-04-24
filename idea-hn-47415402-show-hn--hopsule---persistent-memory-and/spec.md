```markdown
# **Hopsule** → **Architect** (App Name)
**One-line pitch:** "The AI coding copilot that enforces your team’s architecture rules—so your code stays clean, not chaotic."

---

## **Expanded Vision**
**Primary Audience:**
- **Software teams** using AI-assisted coding (Cursor, Copilot, Claude) who want architectural consistency.
- **Tech leads & architects** enforcing coding standards across distributed teams.
- **Freelancers & indie devs** who want to maintain clean, maintainable code without manual checks.

**Adjacent Use Cases:**
- **Non-technical stakeholders** (PMs, designers) who want to "speak the language" of code constraints.
- **Open-source contributors** who need to align with project guidelines.
- **AI-assisted learning** (students, bootcamp grads) who need structured feedback.

**Why Non-Technical Users?**
- Business teams can define "rules" (e.g., "No direct database calls from frontend") without coding knowledge.
- Legal/compliance teams can enforce security policies (e.g., "No hardcoded secrets").

---

## **Tech Stack**
- **Frontend:** React Native (Expo) for cross-platform iOS/Android.
- **Local Storage:** SQLite (for offline rule caching).
- **AI Integration:** REST hooks for Cursor/Copilot APIs.
- **Auth:** Firebase Auth (team-based sign-in).
- **Testing:** Jest + React Testing Library.

---

## **Core Features (MVP)**
1. **Rule Injection** – Paste team rules (e.g., "No `console.log` in production") and auto-apply them to AI outputs.
2. **Context Snippets** – Quickly insert architecture docs (e.g., "Use `useMemo` for expensive calculations") into IDEs.
3. **Conflict Alerts** – Highlight AI suggestions that violate team rules in real-time.

---

## **Monetization Strategy**
- **Free Tier:** Individual devs (1 rule, 100 AI checks/month).
- **Paid:** Teams start at **$15/user/month** (billed annually at $12).
  - **Hook:** Free tier is enough for solo devs but not teams.
  - **Paywall:** Rule complexity (e.g., regex-based rules), advanced analytics.
- **Retention:**
  - **Usage analytics** (e.g., "Your team saved 30% of debugging time").
  - **Slack/email digests** of rule violations.

---

## **Skip if Saturated?**
**SKIP:** Notion + Slack already cover documentation/chat, but **Architect** is the first mobile-first AI rule enforcer. The gap is real.

---

## **File Structure**
```
architect/
├── src/
│   ├── components/ (RuleEditor, ConflictAlert)
│   ├── hooks/ (useAIRuleInjection.js)
│   ├── storage/ (SQLite rules cache)
│   ├── tests/ (Jest tests for rule validation)
├── app.json (Expo config)
├── package.json
```

---

## **Tests**
```javascript
// src/tests/ruleValidation.test.js
import { validateRule } from '../hooks/useAIRuleInjection';

test('Rejects console.log in production', () => {
  const rule = { name: 'No console.log', pattern: 'console.log' };
  const code = 'console.log("debug")';
  expect(validateRule(code, rule)).toBe(false);
});
```

---

## **Implementation Steps**
1. **Setup:**
   ```bash
   npx create-expo-app architect
   cd architect
   npm install expo-sqlite @react-navigation/native
   ```
2. **Core Logic:**
   - Build `useAIRuleInjection.js` (hooks into AI APIs).
   - SQLite schema for rules:
     ```sql
     CREATE TABLE rules (id TEXT PRIMARY KEY, pattern TEXT, severity TEXT);
     ```
3. **UI:**
   - Rule editor (text input + regex preview).
   - Conflict alerts (red/yellow warnings).

---

## **Verification**
1. Run in Expo Go:
   ```bash
   npx expo start
   ```
2. Test rules:
   ```bash
   npm test
   ```
3. Validate AI injection by pasting a rule and checking Copilot/Cursor outputs.
```