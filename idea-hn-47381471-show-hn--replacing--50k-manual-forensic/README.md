# TraceGuard

Automated financial tracking and audit trail app that uses deterministic algorithms to trace money flow for personal asset protection, inheritance claims, business partnerships, and relationship finances.

**Who it's for:** High-net-worth individuals going through divorce, business partners needing financial transparency, entrepreneurs protecting pre-marital assets, small business owners tracking mixed personal/business funds, and anyone in financial disputes requiring audit trails.

**Gap:** Existing finance apps focus on budgeting and investment tracking, but none provide court-admissible financial forensics or deterministic money-tracing capabilities for legal disputes. Current apps rely on aggregation APIs that can fail or change, creating unreliable records.

**Monetization:** Freemium model - free basic tracking, premium $99/month for advanced forensic features, unlimited document processing, and exportable audit trails. One-time $499 for major financial event analysis (divorce, inheritance, business dissolution).

**Viability: 8/10 | Competition: 8/10 | Difficulty: Hard - requires sophisticated OCR, complex financial algorithms, legal compliance standards, and building trust for sensitive financial data processing**

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Google Cloud Vision API:
   - Create a project in Google Cloud Console
   - Enable the Vision API
   - Create an API key
   - Replace `YOUR_API_KEY_HERE` in `lib/ocr.ts` with your actual API key
4. Start the development server: `npx expo start`

## OCR Configuration

The app uses Google Cloud Vision API for text extraction. To set it up:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Cloud Vision API
4. Create credentials (API key)
5. Update the API key in `lib/ocr.ts`

The OCR implementation includes:
- Image preprocessing with expo-image-manipulator
- Network error handling with user-friendly messages
- Local caching of OCR results (24-hour cache)
- Graceful fallback to manual entry when OCR fails

## Run
