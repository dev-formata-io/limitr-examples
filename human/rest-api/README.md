# Monetize REST API

Simplest real-life example. Monetize your REST API by calls.

**What this shows:**
- Limitr Cloud auth/customer handler with API keys (remember API keys can be alt IDs too per customer)
- API call limits (hard, soft, or observe - they work the same)
- API call billing (e.g. soft limit of 10 calls included/hour, $0.10 per call overage/hour, or any sort of variation)

**Run it:**
```bash
npm install
npm run start
```

**Requirements**
[Limitr Cloud](https://cloud.limitr.dev) account & policy with single entitlement named "api-calls" with a simple "int" credit. Copy your API token from the API keys tab.
