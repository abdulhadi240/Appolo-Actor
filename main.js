import { Actor, log } from 'apify';
import got from 'got';

await Actor.init();
const input = await Actor.getInput();
const { records, apolloUrl } = input;

// Your n8n webhook URL
const N8N_WEBHOOK = 'https://leadassist.chitlangia.co/webhook/apify';

log.info('Sending payload to n8n…', { records, apolloUrl });

let driveLink;
try {
    const response = await got.post(N8N_WEBHOOK, {
        json: { records, apolloUrl },
        responseType: 'json',
        timeout: { request: 60_000 },
    });
    // assuming n8n returns { driveLink: "https://drive.google.com/…" }
    driveLink = response.body.driveLink;
    if (!driveLink) throw new Error('No driveLink in response');
}
catch (err) {
    log.error('Failed to call n8n webhook', { error: err.message });
    throw err;
}

// Store the result so that it’s visible in the Apify Console / via API
await Actor.pushData({
    request: { records, apolloUrl },
    driveLink,
});

log.info('Done. Google Drive link:', { driveLink });
await Actor.exit();
