# Cloud Quick Start

Minimal Limitr Cloud connection — connect to your policy, create a customer, enforce a limit.

**What this shows:**
- Connecting to Limitr Cloud with an API token
- Creating a customer with `ensureCustomer`
- Enforcing a limit and seeing usage sync to the dashboard

**Prerequisites:**
- A [Limitr Cloud](https://cloud.limitr.dev) account
- An API token (found in the **API Keys** tab)
- An active policy with at least one plan and entitlement

**Setup:**
```bash
npm install
cp .env.example .env
# Edit .env with your Limitr Cloud API token
npx tsx index.ts
```

Open the **Customers** tab in Limitr Cloud to see usage appear in real time.
