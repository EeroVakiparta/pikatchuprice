require('dotenv').config();
const webpush = require('web-push');
const https = require('https');
const fs = require('fs');
const pubKey = process.env.VAPID_PUBLIC_KEY;
const privKey = process.env.VAPID_PRIVATE_KEY;

// VAPID keys should be generated
const vapidKeys = {
  publicKey: pubKey,
  privateKey: privKey
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const handler = async (event: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Fetch latest electricity prices
    const req = https.get('https://api.porssisahko.net/v1/latest-prices.json', (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        const prices = JSON.parse(data).prices;

        // Check if prices are below a certain threshold
        const lowPrice = prices.find((price: any) => price.price < 0.5);

        if (lowPrice) {
          // Read the subscription from the JSON file
          const rawSubscription = fs.readFileSync('subscription.json', 'utf-8');
          const pushSubscription = JSON.parse(rawSubscription);

          // Send a push notification
          webpush.sendNotification(pushSubscription, 'Low electricity price!').catch((error: any) => {
            console.error(error.stack);
          });
        }

        resolve({
          statusCode: 200,
          body: 'Checked prices',
        });
      });
    });

    req.on('error', (error: any) => {
      reject({
        statusCode: 500,
        body: 'Failed to fetch data',
      });
    });
  });
};
