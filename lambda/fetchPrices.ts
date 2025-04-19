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
          
          // Create the new format with prices array
          const newFormat = {
            prices: jsonData.prices.map((price: any) => ({
              price: price.price,
              startDate: price.startDate,
              endDate: price.endDate
            }))
          };
          
          // Return both formats for backward compatibility
          // This includes all the data properties from the original format 
          // but also includes the new 'prices' array property
          const backwardCompatibleData = {
            ...jsonData,
            ...newFormat
          };
          
          resolve({
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(backwardCompatibleData),
          });
        } catch (err) {
          console.error('Error processing data:', err);
          reject({
            statusCode: 500,
            body: 'Failed to process data',
          });
        }
      });
    });

    req.on('error', (error: any) => {
      console.error('Error fetching data:', error);
      reject({
        statusCode: 500,
        body: 'Failed to fetch data',
      });
    });
  });
};
