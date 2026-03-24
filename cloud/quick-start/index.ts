/**
 * Limitr Example: Cloud Quick Start
 *
 * Minimal Limitr Cloud connection. Connects to your active policy,
 * creates a customer, and enforces a limit.
 *
 * Prerequisites:
 * - Limitr Cloud account with an active policy
 * - API token in .env (copy .env.example to .env)
 */

import { Limitr } from "@formata/limitr";

// ── Configuration ────────────────────────────────────────────────────────────

const TOKEN: string = process.env.LIMITR_TOKEN ?? "";
const CUSTOMER_ID: string = process.env.CUSTOMER_ID ?? "user_123";
const ENTITLEMENT: string = process.env.ENTITLEMENT ?? "api_usage";

if (!TOKEN) {
  console.error("Missing LIMITR_TOKEN. Copy .env.example to .env and add your token.");
  process.exit(1);
}

// ── Run the example ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Connect to Limitr Cloud — establishes local enforcement + live sync
  console.log("Connecting to Limitr Cloud...");
  const policy: Limitr = await Limitr.cloud({ token: TOKEN }) ?? await Limitr.new();
  console.log("Connected ✓\n");

  // Ensure the customer exists (creates if needed, loads from cloud if already exists)
  await policy.ensureCustomer(CUSTOMER_ID, "starter");
  console.log(`Customer '${CUSTOMER_ID}' ready on starter plan\n`);

  // Make some policy checks
  console.log(`Checking '${ENTITLEMENT}' for ${CUSTOMER_ID}:\n`);

  for (let i = 1; i <= 5; i++) {
    const allowed: boolean = await policy.allow(CUSTOMER_ID, ENTITLEMENT, 1);
    console.log(`  Check ${i}: ${allowed ? "✓ allowed" : "✗ denied"}`);
  }

  // Check current usage
  const usage: number = await policy.value(CUSTOMER_ID, ENTITLEMENT) ?? 0;
  console.log(`\n  Current usage: ${usage}`);
  console.log("\nOpen Limitr Cloud → Customers tab to see usage in real time.");

  // Keep the connection alive briefly so sync completes
  await policy.close();
}

main().catch(console.error);
