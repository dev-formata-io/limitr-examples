/**
 * Limitr Example: Seat-Based Limits (Local)
 *
 * A SaaS product with two plans and hard seat limits.
 * No cloud account needed — everything runs in-process.
 */

import { Limitr } from "@formata/limitr";

// ── Define the pricing policy ────────────────────────────────────────────────

const POLICY = `
policy:
  credits:
    seat:
      label: Seat
      description: One team seat

  plans:
    starter:
      label: Starter
      price:
        amount: 0
      entitlements:
        seats:
          description: Team seats included in this plan
          limit:
            credit: seat
            mode: hard
            value: 2
            increment: 1

    growth:
      label: Growth
      price:
        amount: 49
      entitlements:
        seats:
          description: Team seats included in this plan
          limit:
            credit: seat
            mode: hard
            value: 10
            increment: 1
`;

// ── Run the example ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Load the policy locally — no network, no cloud
  const policy: Limitr = await Limitr.new(POLICY, "yaml");

  // Create a customer on the starter plan
  await policy.createCustomer("org_acme", "starter");
  console.log("Created customer 'org_acme' on starter plan (2 seat limit)\n");

  // Add seats one at a time using increment (shorthand for allow with the limit's increment value)
  console.log("Adding seats to org_acme:");
  const seat1: boolean = await policy.increment("org_acme", "seats");
  console.log(`  Seat 1: ${seat1 ? "✓ added" : "✗ denied"}`);

  const seat2: boolean = await policy.increment("org_acme", "seats");
  console.log(`  Seat 2: ${seat2 ? "✓ added" : "✗ denied"}`);

  const seat3: boolean = await policy.increment("org_acme", "seats");
  console.log(`  Seat 3: ${seat3 ? "✓ added" : "✗ denied"} (limit reached)`);

  // Check current usage
  const usage: number = await policy.value("org_acme", "seats") ?? 0;
  const limit: number = await policy.limit("org_acme", "seats") ?? 0;
  console.log(`\n  Current seats: ${usage}/${limit}\n`);

  // Upgrade the customer to the growth plan
  await policy.setCustomerPlan("org_acme", "growth", false);
  console.log("Upgraded org_acme to growth plan (10 seat limit)\n");

  // Now we can add more seats
  console.log("Adding more seats after upgrade:");
  const seat3Again: boolean = await policy.increment("org_acme", "seats");
  console.log(`  Seat 3: ${seat3Again ? "✓ added" : "✗ denied"}`);

  const seat4: boolean = await policy.increment("org_acme", "seats");
  console.log(`  Seat 4: ${seat4 ? "✓ added" : "✗ denied"}`);

  const updatedUsage: number = await policy.value("org_acme", "seats") ?? 0;
  const updatedLimit: number = await policy.limit("org_acme", "seats") ?? 0;
  console.log(`\n  Current seats: ${updatedUsage}/${updatedLimit}`);
}

main().catch(console.error);
