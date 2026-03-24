/**
 * API monetization example.
 * Updated: 3/23/26
 */

import express from 'express';
import cors from 'cors';
import { Limitr } from '@formata/limitr';

const policy = await Limitr.cloud({ token: process.env.LIMITR_TOKEN ?? "" });
if (!policy) process.exit(1);

const app = express();
app.use(cors());
app.use(express.json());


/**
 * If bearer is a Limitr voucher, auth & add voucher customer + capabilities (Limitr Network - cool stuff).
 * Otherwise, do boring bearer auth or whatever normally, or just create a new Limitr customer like so.
 */
async function authenticate(bearer: string): Promise<boolean> {
    if (!policy) return false;
    return await policy.addVoucher(bearer, async () => {
        // we're just going to create a new customer for demo if they don't exist - you should check against known keys, etc. here
        if (await policy.ensureCustomer(bearer, 'starter', 'api-key', bearer, undefined, undefined, { meta_stuff_goes_here: true })) {
            // brand new customer was created - no local or remote customer found, so init stuff goes here
        }
        return true;
    });
}


/**
 * POST /call
 *
 * Purpose: charge/meter per API call.
 * Body: literally anything you want.
 *
 * Run: `curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer my_token_123" -d "{}" http://localhost:3000/call`
 */
app.post('/call', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) { return res.status(401).json({ error: 'Missing Authorization header. Use: Bearer <voucher-code>' }); }
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

    // Auth or create new Limitr customer
    if (!await authenticate(bearer)) { return res.status(401).json({ error: 'Not authenticated' }); }

    // Check if we can do another API call
    // This one line does the metering, billing, etc. (calls allow() under the hood)
    if (!policy || !await policy.increment(bearer, 'api-calls')) {
        return res.status(400).json({ error: 'API call limit reached - try again later' });
    }

    // Do your cool API things...

    return res.status(200).json({ success: true });
});


const port = 3000;
app.listen(port, () => { console.log(`Server running at http://localhost:${port}`); });
