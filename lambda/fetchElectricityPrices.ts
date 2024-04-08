import * as AWS from 'aws-sdk';
import https = require('https');

export const handler = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get('https://api.porssisahko.net/v1/latest-prices.json', (res: any) => {
      let data = '';
      
      // A chunk of data has been received.
      res.on('data', (chunk: any) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      res.on('end', () => {
        try {
          const prices = JSON.parse(data).prices;
          resolve({
            Payload: {
              prices: prices,
            }
          });
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          reject({
            statusCode: 500,
            body: 'Failed to parse data',
          });
        }
      });
    }).on('error', (error: any) => {
      console.error('Error fetching data:', error);
      reject({
        statusCode: 500,
        body: 'Failed to fetch data',
      });
    });
  });
};
