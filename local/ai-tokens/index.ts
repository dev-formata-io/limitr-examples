/**
 * Limitr Example: AI Token Enforcement (Local)
 *
 * The pattern most AI companies need:
 * 1. Hard limit gate check BEFORE the LLM call (rough estimate, blocks if over)
 * 2. Soft limit metering AFTER the call (actual tokens, records for billing)
 *
 * No cloud account needed — everything runs in-process.
 */

import { Limitr } from "@formata/limitr";

// ── Define the pricing policy ────────────────────────────────────────────────

const POLICY = `
policy:
  credits:
    ai-budget:
      label: AI Budget
      description: Rough budget gate for all AI usage
      stof_units: int

    claude-sonnet-input:
      label: Claude Sonnet Input
      description: Input tokens for Claude Sonnet
      stof_units: int
      overhead_cost: 0.000003
      pricing_model: flat
      price:
        amount: 0.000004

    claude-sonnet-output:
      label: Claude Sonnet Output
      description: Output tokens for Claude Sonnet
      stof_units: int
      overhead_cost: 0.000015
      pricing_model: flat
      price:
        amount: 0.00002

  plans:
    starter:
      label: Starter
      price:
        amount: 0
      entitlements:
        ai-gate:
          description: Daily AI budget gate (hard limit, rough estimate)
          limit:
            credit: ai-budget
            mode: hard
            value: 50000
            resets: true
            reset_inc: 1day

        claude-input:
          description: Claude input token metering (soft limit, actual usage)
          limit:
            credit: claude-sonnet-input
            mode: soft
            value: 100000
            resets: true
            reset_inc: 1day

        claude-output:
          description: Claude output token metering (soft limit, actual usage)
          limit:
            credit: claude-sonnet-output
            mode: soft
            value: 50000
            resets: true
            reset_inc: 1day
`;

// ── Simulate an LLM call ─────────────────────────────────────────────────────

interface LLMResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

function simulateLLMCall(prompt: string): LLMResponse {
  // In production, this would be an actual Anthropic SDK call
  const inputTokens: number = Math.ceil(prompt.length / 4);
  const outputTokens: number = Math.floor(Math.random() * 500) + 100;
  return {
    text: `Response to: "${prompt.slice(0, 30)}..."`,
    inputTokens,
    outputTokens,
  };
}

// ── Run the example ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const policy: Limitr = await Limitr.new(POLICY, "yaml");
  await policy.createCustomer("user_123", "starter");
  console.log("Created customer 'user_123' on starter plan\n");
  console.log("Limits:");
  console.log("  AI budget gate: 50,000/day (hard)");
  console.log("  Claude input:   100,000/day (soft)");
  console.log("  Claude output:  50,000/day (soft)\n");

  // Simulate several AI requests
  const prompts: string[] = [
    "Explain the difference between REST and GraphQL APIs in detail",
    "Write a Python script that processes CSV files and generates summary statistics",
    "What are the best practices for designing a microservices architecture?",
    "Help me debug this TypeScript error with async/await and Promise types",
  ];

  let totalInput: number = 0;
  let totalOutput: number = 0;

  for (const prompt of prompts) {
    // Step 1: Gate check with rough estimate (hard limit)
    const estimatedTokens: number = Math.ceil(prompt.length / 4) + 300; // rough estimate
    const canProceed: boolean = await policy.allow("user_123", "ai-gate", estimatedTokens);

    if (!canProceed) {
      console.log(`✗ BLOCKED: "${prompt.slice(0, 40)}..." — daily budget exceeded`);
      continue;
    }

    // Step 2: Make the LLM call (only if gate check passed)
    const response: LLMResponse = simulateLLMCall(prompt);
    totalInput += response.inputTokens;
    totalOutput += response.outputTokens;

    // Step 3: Meter actual usage (soft limits — always succeeds, records overages)
    await policy.allow("user_123", "claude-input", response.inputTokens);
    await policy.allow("user_123", "claude-output", response.outputTokens);

    console.log(`✓ "${prompt.slice(0, 40)}..."`);
    console.log(`    input: ${response.inputTokens} tokens, output: ${response.outputTokens} tokens`);
  }

  // Show final usage
  const budgetUsed: number = await policy.value("user_123", "ai-gate") ?? 0;
  const budgetLimit: number = await policy.limit("user_123", "ai-gate") ?? 0;
  const inputUsed: number = await policy.value("user_123", "claude-input") ?? 0;
  const inputLimit: number = await policy.limit("user_123", "claude-input") ?? 0;
  const outputUsed: number = await policy.value("user_123", "claude-output") ?? 0;
  const outputLimit: number = await policy.limit("user_123", "claude-output") ?? 0;

  console.log("\n── Usage Summary ──────────────────────────");
  console.log(`  AI budget:      ${budgetUsed} / ${budgetLimit} (hard gate)`);
  console.log(`  Claude input:   ${inputUsed} / ${inputLimit} (soft meter)`);
  console.log(`  Claude output:  ${outputUsed} / ${outputLimit} (soft meter)`);
  console.log(`  Total tokens:   ${totalInput + totalOutput}`);
}

main().catch(console.error);
