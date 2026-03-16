```markdown
# **App Name: FinSight**
*One-line pitch:* "Your financial compass—real-time insights, smart tools, and actionable advice to master money without the jargon."

---

## **Expanded Vision**
**Who is this REALLY for?**
- **Broad audience:** Anyone managing money, from students to retirees.
- **Adjacent use cases:**
  - Parents teaching kids about money.
  - Small businesses tracking cash flow.
  - Renters budgeting for homeownership.
- **Why non-technical users want it:**
  - No complex charts or jargon.
  - Real-time alerts for spending, savings, and market shifts.
  - Gamified learning (e.g., "You saved $20 this week—keep it up!").

---

## **Tech Stack**
- **Frontend:** React Native (Expo) for cross-platform.
- **Local DB:** SQLite for offline access to financial data.
- **APIs:**
  - Plaid (bank syncing).
  - Alpha Vantage (market data).
  - Firebase (auth, analytics).
- **Testing:** Jest + React Testing Library.

---

## **Core Features (MVP)**
1. **Smart Spending Tracker**
   - Auto-categorizes transactions (e.g., "Coffee" → "Lifestyle").
   - Push alerts for overspending (e.g., "You’ve hit your grocery budget limit").

2. **Micro-Investing Simulator**
   - "What if I invested $50/month at 7%?" with visual projections.

3. **Debt Payoff Roadmap**
   - AI-generated plan to crush debt faster.

---

## **Monetization Strategy**
- **Free tier:**
  - Basic budgeting, spending insights, and market alerts.
- **Premium ($4.99/month):**
  - **Hook:** Unlocks personalized debt payoff, investment simulations, and ad-free experience.
  - **Retention:** Exclusive "Money Master" badge in-app + monthly financial health reports.

---

## **Skip if Saturated?**
**NO.** No direct competitor simplifies financial literacy this way.

---

## **File Structure**
```
finsight/
├── __tests__/
│   ├── spending.test.js
│   ├── investment.test.js
│   └── debt.test.js
├── src/
│   ├── components/
│   │   ├── BudgetTracker.js
│   │   ├── MarketAlerts.js
│   │   └── DebtRoadmap.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── InsightsScreen.js
│   │   └── SettingsScreen.js
│   ├── utils/
│   │   ├── api.js
│   │   └── storage.js
│   └── App.js
├── app.json
└── package.json
```

---

## **Tests**
```javascript
// __tests__/spending.test.js
import { calculateSpendingTrend } from '../src/utils/spending';

test('calculates spending trend correctly', () => {
  const transactions = [{ amount: 10 }, { amount: 20 }];
  expect(calculateSpendingTrend(transactions)).toBe(15);
});
```

---

## **Implementation Steps**
1. **Setup:**
   ```bash
   npx create-expo-app finsight
   cd finsight
   npm install react-native-sqlite-storage @react-navigation/native
   ```
2. **Core Logic:**
   - Build `spending.js` to categorize transactions.
   - Add `investment.js` for compounding simulations.
3. **UI:**
   - Design `HomeScreen` with spending insights.
   - Add `DebtRoadmap` screen with step-by-step guidance.

---

## **Verification**
- Run `npm test` (all tests pass).
- Test on Expo Go (iOS/Android) with:
  ```bash
  npx expo start
  ```
```