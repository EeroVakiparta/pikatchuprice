import * as AWS from 'aws-sdk';
import https = require('https');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<any> => {
  try {
    const data = await fetchDataFromExternalAPI();
    const prices = JSON.parse(data).prices;

    // Prepare batch write requests with a limit of 25 items per request
    const batchWritePromises: Promise<any>[] = [];

    for (let i = 0; i < prices.length; i += 25) {
      const batchItems = prices.slice(i, i + 25);
      const batchWriteParams = {
        RequestItems: {
          'PikaElectricityPricesTable': batchItems.map((price: any) => ({
            PutRequest: {
              Item: {
                'partitionKey': 'ElectricityPrices',
                'datetime': price.startDate,
                'price': price.price, // Store individual price
              },
            },
          })),
        },
      };
      batchWritePromises.push(dynamoDB.batchWrite(batchWriteParams).promise());
    }

    // Execute batch write promises in parallel
    await Promise.all(batchWritePromises);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: data,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: 'Failed to fetch or store data',
    };
  }
};

async function fetchDataFromExternalAPI(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    https.get('https://api.porssisahko.net/v1/latest-prices.json', (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error: any) => {
      reject(error);
    });
  });
}
