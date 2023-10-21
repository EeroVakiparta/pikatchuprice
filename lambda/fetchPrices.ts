import * as AWS from 'aws-sdk';
import https = require('https');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get('https://api.porssisahko.net/v1/latest-prices.json', (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        const prices = JSON.parse(data).prices;

        // Loop through each price to store it in DynamoDB
        prices.forEach((price: any) => {
          const putParams = {
            TableName: 'NewElectricityPrices',
            Item: {
              'datetime': price.startDate,
              'price': price.price
            }
          };

          dynamoDB.put(putParams, (err, dbData) => {
            if (err) {
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
              console.log("Added item:", JSON.stringify(dbData, null, 2));
            }
          });
        });

        resolve({
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: data,
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
