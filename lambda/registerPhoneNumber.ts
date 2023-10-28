import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let body;
    try {
        body = JSON.parse(event.body || '');  // Add null check here
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error('Failed to parse JSON body:', e.message);
        } else {
            console.error('Failed to parse JSON body:', e);
        }
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',  
            },
            body: JSON.stringify({error: 'Invalid JSON format'}),
        };
    }
    const { userId, phoneNumber } = body;

    // Validate phone number (e.g., using a regex)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',  
    },
      body: JSON.stringify({ error: 'Invalid phone number format' }),
    };
  }
  
  // Store phone number in DynamoDB
  const params = {
    TableName: tableName,
    Item: {
      userId: body.userId,
      phoneNumber: phoneNumber,
    },
  };
  
  try {
    await dynamoDB.put(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',  
    },
      body: JSON.stringify({ message: 'Phone number registered successfully' }),
    };
  } catch (error) {
    console.error('Error registering phone number:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',  
    },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
