# AI Chat with Claude + Limitr Cloud

A complete AI chat example with Claude (Anthropic SDK), token-level billing through Limitr Cloud, and tool use support.

**What this shows:**
- Hard limit gate check before every LLM call (blocks if over budget)
- Soft limit metering for actual input/output tokens after each call
- Accumulated token tracking across multi-turn tool use loops
- Full Claude SDK integration with tool calling

**Prerequisites:**
- A [Limitr Cloud](https://cloud.limitr.dev) account
- An API token with write permissions for Customers and Events
- An active policy with these entitlements:
  - `ai-gate` — hard limit, daily reset (budget gate)
  - `claude-input` — soft limit, daily reset (input token metering)
  - `claude-output` — soft limit, daily reset (output token metering)
- An [Anthropic API key](https://console.anthropic.com/)

**Setup:**
```bash
npm install
cp .env.example .env
# Edit .env with your Limitr and Anthropic tokens
npx tsx index.ts
```

Open the **Customers** tab in Limitr Cloud to see token usage appear in real time.

**Policy setup tip:** Use the Limitr Cloud UI to create credits for `ai-budget`, `claude-sonnet-input`, and `claude-sonnet-output`, then add entitlements referencing them. See the [local/ai-tokens](../../local/ai-tokens) example for the full policy YAML if you'd prefer to define it manually.
