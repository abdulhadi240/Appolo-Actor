import { Actor, log } from 'apify';
import got from 'got';

await Actor.init();

try {
    const input = await Actor.getInput();
    const { records, apolloUrl } = input;

    if (typeof records !== 'number' || !apolloUrl) {
        throw new Error('Invalid input: both "records" (number) and "apolloUrl" (string) are required');
    }

    log.info('Sending payload to n8n webhook…', { records, apolloUrl });

    // Replace with your real n8n webhook URL
    const N8N_WEBHOOK = 'https://leadassist.chitlangia.co/webhook-test/f27a2349-b597-4040-8ece-b93dd04b8b32';
    if (!N8N_WEBHOOK) {
        throw new Error('N8N_WEBHOOK_URL environment variable is not set');
    }

    const response = await got.post(N8N_WEBHOOK, {
        json: { records, apolloUrl },
        responseType: 'json',
        timeout: { request: 60_000 },
    });

    const driveLink = response.body.driveLink;
    if (!driveLink || typeof driveLink !== 'string') {
        throw new Error(`Invalid response from n8n: ${JSON.stringify(response.body)}`);
    }

    // Push the result into the dataset
    await Actor.pushData({
        request: { records, apolloUrl },
        driveLink,
    });

    log.info('Successfully retrieved drive link:', { driveLink });
    await Actor.exit();
}
catch (err) {
    log.error('Actor run failed:', { message: err.message, stack: err.stack });
    // Mark the run as failed, so in the console you’ll see the failure reason
    await Actor.fail(`Run failed: ${err.message}`);
}
