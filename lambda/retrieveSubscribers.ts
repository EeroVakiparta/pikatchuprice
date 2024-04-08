import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME: string = process.env.TABLE_NAME || '';

export const handler = async (): Promise<{ phoneNumbers: string[] }> => {
  const params = {
    TableName: TABLE_NAME
  };
  
  try {
    const data = await dynamodb.scan(params).promise();
    const phoneNumbers = data.Items ? data.Items.map(item => item.phoneNumber.S) : [];
    return { phoneNumbers: phoneNumbers };
  } catch (error) {
    console.error('Error retrieving subscribers:', error);
    throw new Error('Failed to retrieve subscribers');
  }
};
