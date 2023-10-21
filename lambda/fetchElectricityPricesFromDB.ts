import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<any> => {
  const params = {
    TableName: 'PikaElectricityPricesTable',
    Limit: 60,  // Limit the number of results to 60
    ScanIndexForward: false,  // Sort in descending order
  };

  return new Promise((resolve, reject) => {
    dynamoDB.scan(params, (err, data) => {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        reject({
          statusCode: 500,
          body: 'Failed to fetch data from DynamoDB',
        });
      } else {
        resolve({
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(data.Items),
        });
      }
    });
  });
};
