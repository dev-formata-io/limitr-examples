/**
 * API monetization example.
 * Updated: 3/23/26
 */

import { Limitr } from '@formata/limitr';

// Going to use Stof here instead of YAML to define a capability right in our policy
// Think of it like JSON with functions & types (see https://stof.dev)
const policy = await Limitr.new(`
policy: {
    credits: {
        elapsed_ms: {
            label: 'Millisecond'
            description: 'One millisecond of elapsed time'
            stof_units: 'ms'
        }
    }
    plans: {
        base: {
            label: 'Base Plan'
            default: true
            entitlements: {
                elapsed_time: {
                    description: 'How much time has passed'
                    limit: {
                        credit: 'elapsed_ms'
                        mode: 'observe'
                        minimum: 0
                    }
                }
            }
        }
    }
    capabilities: {
        say-hi: {
            description: 'Say hello to someone by name'
            parameters: [{ name: 'name', description: 'Name of the person to say hi to' }]

            #[run]
            fn run_say_hi() {
                const name = self.input.name ?? 'World';
                ?self.set_result(\`Hello, \${name}!\`);
            }
        }
    }
}`);


// Create a customer to play around with
const customerId = 'example';
await policy.createCustomer(customerId, 'base');

// Lets call our 'say-hi' capability
let now = Date.now();
console.log(await policy.runCapability('say-hi', { name: 'Limitr' }, customerId));

// Increment our elapsed time meter in ms
await policy.allow(customerId, 'elapsed_time', (Date.now() - now) + 'ms');
console.log('say-hi elapsed ms:', await policy.value(customerId, 'elapsed_time'));
now = Date.now();


// Now we have a new capability and want to link it with a local async JS function
async function weatherReport(city: string, state: string): Promise<string> { return `Imagine a weather report for ${city}, ${state}!`; }
policy.doc.lib('Linked', 'weather_report', async (city: string, state: string) => await weatherReport(city, state), true);
await policy.setCapabilities(`
linked-capability: {
    description: 'Get a weather report by city and state'
    parameters: [{ name: 'city', description: 'City' }, { name: 'state', description: 'State code' }]

    #[run]
    fn run_get_weather() {
        const city = self.input.city ?? 'Unknown';
        const state = self.input.state ?? 'MI';
        self.set_result(await ?Linked.weather_report(city, state) ?? 'unknown report');
    }
}`);

// Lets call it via Claude tools this time!
const toolUse = {
    type: 'tool_use',
    id: 'tool_use_123',
    name: 'linked-capability',
    input: {
        city: 'Boston',
        state: 'MA'
    }
};
const toolResult = await policy.claudeToolUse(toolUse, customerId);
console.log(toolResult);

// Increment our elapsed time meter in ms
await policy.allow(customerId, 'elapsed_time', (Date.now() - now) + 'ms');
console.log('total elapsed ms:', await policy.value(customerId, 'elapsed_time'));
