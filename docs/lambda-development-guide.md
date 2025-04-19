# Lambda Function Development Guide

This guide covers how to develop and test Lambda functions in the PikatchuPrice project.

## Overview of Lambda Functions

The project includes the following Lambda functions:

1. **fetchPrices**: Fetches electricity prices from external API and stores them in DynamoDB
2. **fetchElectricityPrices**: Retrieves prices for the Step Functions workflow
3. **fetchElectricityPricesFromDB**: Retrieves prices from DynamoDB for API clients
4. **checkPriceThreshold**: Filters prices below a configured threshold
5. **registerPhoneNumber**: Handles user registrations for notifications
6. **retrieveSubscribers**: Gets list of subscribed users
7. **sendNotification**: Sends notifications via SNS
8. **sendSms**: Sends SMS notifications

## Lambda Function Structure

Each Lambda function should follow this structure:

```typescript
import * as AWS from 'aws-sdk';

// Optionally initialize AWS clients
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

// Define interface for event input if needed
interface MyEvent {
  // Event properties
}

// Define interface for response if needed
interface MyResponse {
  // Response properties
}

// Export the handler function
export const handler = async (event: MyEvent): Promise<MyResponse> => {
  try {
    // Your function logic here
    
    // Return standardized response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Success', data: {} })
    };
  } catch (error) {
    console.error('Error:', error);
    
    // Return standardized error response
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Error processing request' })
    };
  }
};
```

## Lambda Function Development Workflow

### 1. Create or Modify Lambda Function

Create a new TypeScript file in the `lambda/` directory or modify an existing one:

```bash
# Create a new Lambda function
touch lambda/myNewFunction.ts
```

### 2. Build the Lambda Function

After writing or modifying code, build the TypeScript:

```bash
npm run build
```

This will compile the TypeScript code into JavaScript in the same directory.

### 3. Local Testing

You can test Lambda functions locally before deploying:

```bash
# Test with empty event
cd lambda
node -e "console.log(JSON.stringify(require('./myNewFunction').handler({})))"

# Test with a sample event from a JSON file
cd lambda
node -e "console.log(JSON.stringify(require('./myNewFunction').handler(require('./test-event.json'))))"
```

### 4. Add to CDK Stack

If you've created a new Lambda function, add it to the CDK stack in `lib/pikatchuprice-stack.ts`:

```typescript
const myNewLambda = new lambda.Function(this, 'MyNewFunction', {
  runtime: lambda.Runtime.NODEJS_LATEST,
  handler: 'myNewFunction.handler',
  code: lambda.Code.fromAsset('lambda'),
  timeout: cdk.Duration.seconds(10),
  environment: {
    // Environment variables
    KEY: 'value'
  }
});

// Grant permissions as needed
myTable.grantReadData(myNewLambda);
myTopic.grantPublish(myNewLambda);
```

### 5. Deploy the Changes

Deploy your changes:

```bash
cdk diff  # To see what will change
cdk deploy
```

## Testing Lambda Functions in AWS

After deployment, you can test your Lambda functions using the AWS Console or AWS CLI:

```bash
# Invoke Lambda function and see output
aws lambda invoke --function-name PikatchupriceStack-MyNewFunction --payload '{}' output.json

# View the output
cat output.json

# View CloudWatch logs
aws logs get-log-events --log-group-name /aws/lambda/PikatchupriceStack-MyNewFunction --log-stream-name $(aws logs describe-log-streams --log-group-name /aws/lambda/PikatchupriceStack-MyNewFunction --order-by LastEventTime --descending --limit 1 --query 'logStreams[0].logStreamName' --output text)
```

## Common Patterns

### DynamoDB Operations

```typescript
// Query by partition key
const queryResult = await dynamoDB.query({
  TableName: process.env.TABLE_NAME || 'MyTable',
  KeyConditionExpression: 'partitionKey = :pk',
  ExpressionAttributeValues: {
    ':pk': 'SomeValue'
  }
}).promise();

// Put item
await dynamoDB.put({
  TableName: process.env.TABLE_NAME || 'MyTable',
  Item: {
    partitionKey: 'SomeValue',
    sortKey: 'SomeOtherValue',
    data: 'Content'
  }
}).promise();
```

### SNS Publishing

```typescript
await sns.publish({
  TopicArn: process.env.TOPIC_ARN,
  Message: JSON.stringify({
    default: 'Default message',
    email: 'Email message',
    sms: 'SMS message'
  }),
  MessageStructure: 'json'
}).promise();
```

### HTTP Requests

```typescript
import * as https from 'https';

function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Usage
const data = await httpsRequest('https://api.example.com/data');
const jsonData = JSON.parse(data);
```

## Best Practices

1. **Error Handling**: Always use try/catch blocks and handle errors gracefully
2. **Environment Variables**: Use environment variables for configuration
3. **Logging**: Use `console.log`, `console.info`, `console.warn`, and `console.error` for appropriate log levels
4. **Timeouts**: Set appropriate timeout values in the CDK definition
5. **Response Format**: Always return proper API Gateway response format with CORS headers
6. **Cold Starts**: Minimize cold start times by:
   - Declaring AWS clients outside the handler function
   - Minimizing dependencies
   - Using global variables for caching
7. **Security**: Follow the principle of least privilege when granting permissions 