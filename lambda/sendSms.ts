import * as AWS from 'aws-sdk';

const sns = new AWS.SNS();
const TOPIC_ARN: string = process.env.TOPIC_ARN || '';

export const handler = async (event: { lowPrices: Array<{ price: number, startDate: string, endDate: string }>, phoneNumbers: string[] }): Promise<void> => {
  const { phoneNumbers, lowPrices } = event;

  if (!phoneNumbers || phoneNumbers.length === 0) {
    console.error('No phone numbers provided');
    throw new Error('No phone numbers provided');
  }

  const message = lowPrices.map(priceInfo => 
    `Price: ${priceInfo.price} EUR, Time: ${new Date(priceInfo.startDate).toLocaleTimeString()} to ${new Date(priceInfo.endDate).toLocaleTimeString()}`
  ).join('\n');

  for (const phoneNumber of phoneNumbers) {
    const subscribeParams = {
      Protocol: 'sms',
      TopicArn: TOPIC_ARN,
      Endpoint: phoneNumber,
    };
    await sns.subscribe(subscribeParams).promise();
  }

  const publishParams = {
    Message: `Low electricity prices:\n${message}`,
    TopicArn: TOPIC_ARN,
  };

  try {
    await sns.publish(publishParams).promise();
    console.log('SMS notifications sent successfully');
  } catch (error) {
    console.error('Error sending SMS notifications:', error);
    throw new Error('Failed to send SMS notifications');
  }
};
