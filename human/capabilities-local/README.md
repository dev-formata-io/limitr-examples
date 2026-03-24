# Capabilities 101 (Local Stof Capabilities)

Limitr is actually a sandboxed local embedded execution environment. Capabilities are dynamic actions that can be attached to your policy document, using Stof. Helpers exist on the policy to transform capabilities into AI tools you can use in your AI agents and MCP servers.

This is the foundation that enables Limitr Network, where services can auto-assemble and use one another with automatic billing through Limitr. A voucher code is created in Limitr Cloud that is linked with plans on any Limitr-powered (and listed) service (just check the ones you want to use). They can be revoked anytime and must set an expiration date. They can also be scoped to a max spend (although, not pre-paid). e.g. "I want to give these 25 services on these plans $20 for the next 15 minutes to do these things for me, go!".

**What this shows:**
- Basic capability definitions
- Basic running of capabilities
- Claude tools array, ready to use with your agent
- Claude tool use call, creates a tool result block automatically by running the capability

**Run it:**
```bash
npm install
npm run start
```
