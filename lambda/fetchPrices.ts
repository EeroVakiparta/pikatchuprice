const https = require('https');

export const handler = async (event: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://api.porssisahko.net/v1/latest-prices.json', (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          // Parse the original data
          const jsonData = JSON.parse(data);
          
          // Extract the prices array from the response
          const pricesArray = jsonData.prices || [];
          
          // Convert the data to match our application format
          const appFormatData = pricesArray.map((price: any) => ({
            price: price.price,
            priceTime: price.startDate,
            timestamp: new Date(price.startDate).getTime()
          }));
          
          resolve({
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(appFormatData)
          });
        } catch (err) {
          console.error('Error processing data:', err);
          reject({
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to process data' })
          });
        }
      });
    });

    req.on('error', (error: any) => {
      console.error('Error fetching data:', error);
      reject({
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to fetch data' })
      });
    });
  });
};
