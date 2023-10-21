import * as AWS from 'aws-sdk';
import https = require('https');
import fs = require('fs');

const sns = new AWS.SNS();

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
          // Publish to SNS Topic
          const params = {
            Message: 'Low electricity price!',
            TopicArn: 'arn:aws:sns:eu-north-1:126278133652:PikaPriceTopic'
          };

          sns.publish(params, function(err, data) {
            if (err) console.error(err, err.stack);
            else console.log(data);
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
