require('dotenv').config();
const webpush = require('web-push');
const https = require('https');
const fs = require('fs');
const pubKey = process.env.VAPID_PUBLIC_KEY;
const privKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  pubKey,
  privKey
);

export const handler = async (event: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get('https://api.porssisahko.net/v1/latest-prices.json', (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        const prices = JSON.parse(data).prices;
        const lowPrice = prices.find((price: any) => price.price < 0.5);

        if (lowPrice) {
          // Read subscriptions from the JSON file
          const subscriptions = JSON.parse(fs.readFileSync('subscriptions.json', 'utf8'));

          subscriptions.forEach((subscription: any) => {
            webpush.sendNotification(subscription, 'Low electricity price!')
              .catch((error: any) => {
                console.error(error.stack);
              });
          });
        }

        resolve({
          statusCode: 200,
          body: 'Checked prices',
        });
      });
    }).on('error', (error: any) => {
      reject({
        statusCode: 500,
        body: 'Failed to fetch data',
      });
    });
  });
};
