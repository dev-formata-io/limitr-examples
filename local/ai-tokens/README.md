# AI Token Enforcement (Local)

The pattern most AI companies need — a hard budget gate before the LLM call, soft metering after for accurate billing.

**What this shows:**
- Hard limit as a pre-call gate check (rough estimate, blocks if over budget)
- Soft limits for actual input/output token billing (records overages)
- Per-model credit definitions with overhead cost and pricing
- Simulated LLM calls with accumulated token tracking

**Run it:**
```bash
npm install
npx tsx index.ts
```

No Limitr Cloud account needed. Everything runs locally.
