# Limitr Examples

Runnable examples for [Limitr](https://limitr.dev) — pricing infrastructure for AI and usage-based software.

Each example is self-contained with its own `package.json`. Clone the repo, pick an example, install, and run.

## Human Examples (Human generated for human consumption)

Take a look at the AI generated examples for brief general concepts, including AI tokens using Anthropic + input/output billing.

Then take a look at these examples for more involved use-cases and practical usage patterns.

## Local Examples (Claude/AI generated)

No account needed. Everything runs in-process.

| Example | Description | Run |
|---------|-------------|-----|
| [local/seat-limits](./local/seat-limits) | Seat-based SaaS with hard limits and increments | `cd local/seat-limits && npm i && npx tsx index.ts` |
| [local/ai-tokens](./local/ai-tokens) | AI token enforcement with hard gate + soft billing | `cd local/ai-tokens && npm i && npx tsx index.ts` |

## Cloud Examples (Claude/AI generated)

Requires a [Limitr Cloud](https://cloud.limitr.dev) account and API token.

| Example | Description | Run |
|---------|-------------|-----|
| [cloud/quick-start](./cloud/quick-start) | Minimal Cloud connection with one entitlement | `cd cloud/quick-start && npm i && npx tsx index.ts` |
| [cloud/ai-chat](./cloud/ai-chat) | AI chat with Claude, token billing, and tool use | `cd cloud/ai-chat && npm i && npx tsx index.ts` |

## Getting Started

```bash
git clone https://github.com/dev-formata-io/limitr-examples
cd limitr-examples

# Try a local example (no account needed)
cd local/seat-limits
npm install
npx tsx index.ts
```

## Resources

- [Limitr Docs](https://formata.gitbook.io/limitr)
- [Limitr Cloud](https://cloud.limitr.dev)
- [Limitr GitHub](https://github.com/dev-formata-io/limitr)
- [Stof Docs](https://docs.stof.dev)
- [Discord](https://discord.gg/Up5kxdeXZt)

Email info@limitr.dev

## License

Apache 2.0