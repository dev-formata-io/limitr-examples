/**
 * Limitr Example: AI Chat with Claude + Limitr Cloud
 *
 * Complete AI chat with:
 * - Hard limit gate check before LLM calls
 * - Soft limit metering for actual input/output tokens
 * - Accumulated token tracking across tool use loops
 * - Full Claude SDK integration with tool calling
 *
 * Prerequisites:
 * - Limitr Cloud account with active policy (see README)
 * - Anthropic API key
 * - Both tokens in .env (copy .env.example to .env)
 */

import { Limitr } from "@formata/limitr";
import Anthropic from "@anthropic-ai/sdk";
import { ToolUnion } from '@anthropic-ai/sdk/resources';


// ── Configuration ────────────────────────────────────────────────────────────

const LIMITR_TOKEN: string = process.env.LIMITR_TOKEN ?? "";
const ANTHROPIC_API_KEY: string = process.env.ANTHROPIC_API_KEY ?? "";
const CUSTOMER_ID: string = process.env.CUSTOMER_ID ?? "user_123";
const MODEL: string = "claude-sonnet-4-20250514";

if (!LIMITR_TOKEN || !ANTHROPIC_API_KEY) {
  console.error("Missing LIMITR_TOKEN or ANTHROPIC_API_KEY. Copy .env.example to .env.");
  process.exit(1);
}


// ── Types ────────────────────────────────────────────────────────────────────

interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}


// ── Define a simple tool for Claude via Limitr Capability ─────────────────────

async function addCapabilities(policy: Limitr) {
  // This is just one way to define tools, but its cool, so here you go!
  // Uses Stof - your embedded policy execution engine (wasm)
  await policy.setCapabilities(`
    Capability get_weather: {
      description: 'Get the current seather for a city'
      parameters: [{ name: 'city', description: 'The city name' }]

      #[run]
      fn run_get_weather() {
        const city = self.input.city;
        const forecast = new {
          city,
          temperature: 76F,
          unit: 'fahrenheit',
          conditions: 'sunny',
        };
        ?self.set_result(stringify('yaml', forecast));
        drop(forecast);
      }
    }`);
}


// ── Chat function with Limitr enforcement ────────────────────────────────────

async function chat(
  policy: Limitr,
  anthropic: Anthropic,
  message: string
): Promise<string> {
  // Step 1: Gate check — rough estimate, hard limit
  const estimatedTokens: number = Math.ceil(message.length / 4) + 500;
  const canProceed: boolean = await policy.allow(CUSTOMER_ID, "ai-gate", estimatedTokens);

  if (!canProceed) {
    return "⚠ Daily AI budget exceeded. Try again tomorrow.";
  }
  const tools = (await policy.claudeTools()) as unknown as ToolUnion[];

  // Step 2: Call Claude with tool use loop
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: message }];
  let totalInputTokens: number = 0;
  let totalOutputTokens: number = 0;

  let response: Anthropic.Message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages,
    tools,
  });
  totalInputTokens += response.usage?.input_tokens ?? 0;
  totalOutputTokens += response.usage?.output_tokens ?? 0;

  // Handle tool use loop
  while (response.stop_reason === "tool_use") {
    messages.push({ role: "assistant", content: response.content });

    const toolResults: ToolResult[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const toolRes = await policy.claudeToolUse(block);
        if (toolRes) {
          toolResults.push(toolRes as unknown as ToolResult);
          console.log(`  🔧 Tool: ${block.name}(${JSON.stringify(block.input)}) → ${toolRes}`);
        }
      }
    }

    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages,
      tools,
    });
    totalInputTokens += response.usage?.input_tokens ?? 0;
    totalOutputTokens += response.usage?.output_tokens ?? 0;
  }

  // Step 3: Meter actual token usage (soft limits — records for billing)
  if (totalInputTokens > 0) {
    await policy.allow(CUSTOMER_ID, "claude-input", totalInputTokens);
  }
  if (totalOutputTokens > 0) {
    await policy.allow(CUSTOMER_ID, "claude-output", totalOutputTokens);
  }

  console.log(`  📊 Tokens — input: ${totalInputTokens}, output: ${totalOutputTokens}`);

  // Extract the text response
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "(no response)";
}


// ── Run the example ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Connect to Limitr Cloud and setup policy
  console.log("Connecting to Limitr Cloud...");
  const policy: Limitr = await Limitr.cloud({ token: LIMITR_TOKEN }) ?? await Limitr.new();
  await addCapabilities(policy);
  console.log("Connected ✓\n");

  // Ensure customer exists
  await policy.ensureCustomer(CUSTOMER_ID, "starter");

  // Initialize Anthropic client
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  // Run some chat messages
  const queries: string[] = [
    "What's the weather like in Boston?",
    "How about San Francisco? Compare it to Boston.",
    "Thanks! Give me a brief summary of both cities' weather.",
  ];

  for (const query of queries) {
    console.log(`\n💬 User: ${query}`);
    const response: string = await chat(policy, anthropic, query);
    console.log(`🤖 Claude: ${response.slice(0, 200)}${response.length > 200 ? "..." : ""}`);
  }

  // Show final usage
  const budgetUsed: number = await policy.value(CUSTOMER_ID, "ai-gate") ?? 0;
  const inputUsed: number = await policy.value(CUSTOMER_ID, "claude-input") ?? 0;
  const outputUsed: number = await policy.value(CUSTOMER_ID, "claude-output") ?? 0;

  console.log("\n── Usage Summary ──────────────────────────");
  console.log(`  AI budget gate:  ${budgetUsed} (hard limit)`);
  console.log(`  Claude input:    ${inputUsed} tokens (soft meter)`);
  console.log(`  Claude output:   ${outputUsed} tokens (soft meter)`);
  console.log("\nOpen Limitr Cloud → Customers tab to see this in your dashboard.");

  // Keep connection alive briefly for sync
  await policy.close();
}


main().catch(console.error);
