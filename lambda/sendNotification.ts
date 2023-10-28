import * as AWS from 'aws-sdk';
import https = require('https');
import fs = require('fs');

const sns = new AWS.SNS();
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get('https://api.porssisahko.net/v1/latest-prices.json', (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', async () => {  
        const prices = JSON.parse(data).prices;
        const lowPrice = prices.find((price: any) => price.price < 10.5); //TODO: put the price threshold somewhere else

        if (lowPrice) {
          // Retrieve phone numbers from DynamoDB
          const params = {
            TableName: 'UserSubscriptions'
          };
          const dbData = await dynamodb.scan(params).promise();
          const phoneNumbers = dbData.Items ? dbData.Items.map(item => item.phoneNumber) : [];

          // Subscribe each phone number to the SNS topic and publish message
          for (const phoneNumber of phoneNumbers) {
            const subscribeParams = {
              Protocol: 'sms',
              TopicArn: 'arn:aws:sns:eu-north-1:126278133652:PikaPriceTopic',
              Endpoint: phoneNumber
            };
            await sns.subscribe(subscribeParams).promise();
          }

          // Publish to SNS Topic
          const publishParams = {
            Message: 'Low electricity price!',
            TopicArn: 'arn:aws:sns:eu-north-1:126278133652:PikaPriceTopic'
          };

          sns.publish(publishParams, function(err, data) {
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
