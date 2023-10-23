import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<any> => {
    const currentDatetime = new Date();
    console.log(`Current datetime: ${currentDatetime}`);

    currentDatetime.setHours(currentDatetime.getHours() - 2); // To make sure the current hour is included
    const datetimeISOForFiltering = currentDatetime.toISOString();

    //log to CloudWatch the current datetime
    


    const params = {
        TableName: 'PPElectricityPricesTable',
        FilterExpression: 'priceTime >= :start',
        ExpressionAttributeValues: {
            ':start': datetimeISOForFiltering, // Use current time as the start
        },
    };


    //log to CloudWatch the params used to read from DynamoDB
    console.log(`DynamoDB params: ${JSON.stringify(params)}`);

    return new Promise((resolve, reject) => {

        dynamoDB.scan(params, (err, data) => {

            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                reject({
                    statusCode: 500,
                    body: 'Failed to fetch data from DynamoDB',
                });
            } else {
                //log to CloudWatch how many items were read from DynamoDB
                if (!data.Items || data.Items.length === 0) {
                    console.log(`No items found in DynamoDB`);
                    resolve({
                        statusCode: 404,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: 'No data found',
                    });

                } else {
                    console.log(`Read ${data.Items.length} items from DynamoDB`);
                    resolve({
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify(data.Items),
                    });
                }

            }
        });
    });
};
