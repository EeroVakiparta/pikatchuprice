# CDK Deployment Guide

This guide covers how to work with AWS CDK infrastructure in the PikatchuPrice project.

## Overview

The project uses AWS Cloud Development Kit (CDK) to define, manage, and deploy all AWS infrastructure using code. The primary CDK stack is defined in `lib/pikatchuprice-stack.ts`.

## Prerequisites

- AWS CLI configured with appropriate IAM permissions
- Node.js (use the latest LTS version)
- AWS CDK 2.95.1 or later

## Key Components in the Stack

The CDK stack includes the following resources:

1. **S3 Website Bucket** - Hosts the static frontend
2. **CloudFront Distribution** - Serves the website with global caching
3. **DynamoDB Tables** - Stores electricity prices and user subscriptions
4. **Lambda Functions** - Serverless functions for various operations
5. **API Gateway** - RESTful API endpoints
6. **SNS Topics** - Notification delivery
7. **Step Functions** - Workflow for price checking and notification
8. **EventBridge Rules** - Scheduled tasks for fetching prices

## CDK Project Structure

```
.
├── bin/
│   └── pikatchuprice.ts      # CDK app entrypoint
├── lib/
│   └── pikatchuprice-stack.ts # Main stack definition
├── lambda/                   # Lambda function code
├── public/                   # Static website files
└── cdk.json                  # CDK configuration
```

## Development Workflow

### 1. Install Dependencies

```bash
npm install
```

### 2. Make Changes to Infrastructure

Edit the stack definition in `lib/pikatchuprice-stack.ts`.

### 3. Synthesize CloudFormation Template

```bash
npm run cdk synth
```

This generates a CloudFormation template from your CDK code in the `cdk.out` directory.

### 4. Preview Changes

```bash
npm run cdk diff
```

This shows what changes will be applied to your deployed infrastructure.

### 5. Deploy Changes

```bash
npm run cdk deploy
```

This deploys the changes to your AWS account.

## Common CDK Tasks

### Adding a New Lambda Function

```typescript
// Define the Lambda function
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

// Grant necessary permissions
myTable.grantReadData(myNewLambda);
myTopic.grantPublish(myNewLambda);

// Create a REST API endpoint for the Lambda
new apigateway.LambdaRestApi(this, 'MyNewApi', {
  handler: myNewLambda,
  proxy: true,
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS
  }
});
```

### Adding a New DynamoDB Table

```typescript
const myNewTable = new dynamodb.Table(this, 'MyNewTable', {
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: cdk.RemovalPolicy.DESTROY // Only for dev environments
});
```

### Creating a New Scheduled Task

```typescript
// Create a rule that triggers on a schedule
const rule = new events.Rule(this, 'ScheduledRule', {
  schedule: events.Schedule.cron({ minute: '0', hour: '12' }) // Runs daily at noon
});

// Add the Lambda function as a target
rule.addTarget(new targets.LambdaFunction(myLambda));
```

## Multi-Environment Deployment

### Environment-Specific Configuration

You can use different AWS profiles for different environments:

```bash
# Development
cdk deploy --profile dev

# Staging
cdk deploy --profile staging

# Production
cdk deploy --profile prod
```

### Using Context Values

You can define environment-specific values in `cdk.json`:

```json
{
  "context": {
    "dev": {
      "domain": "dev.example.com",
      "priceThreshold": "15.0"
    },
    "prod": {
      "domain": "example.com",
      "priceThreshold": "10.5"
    }
  }
}
```

And use them in your stack:

```typescript
const env = this.node.tryGetContext('env') || 'dev';
const config = this.node.tryGetContext(env);

const threshold = config.priceThreshold;
```

## Destroying Infrastructure

⚠️ **Warning**: This will delete all resources defined in the stack, including data in DynamoDB tables.

```bash
npm run cdk destroy
```

## Best Practices

1. **Use Descriptive Construct IDs**: Give meaningful names to resources
2. **Leverage L2 Constructs**: Use the higher-level constructs when available
3. **Resource Policies**: Follow the principle of least privilege
4. **Environment Variables**: Pass configuration to Lambda functions via environment variables
5. **Removal Policies**: Be careful with `DESTROY` removal policies in production

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure your AWS account has the necessary permissions
   
   Solution: Add missing permissions to your IAM user or role

2. **Resource Already Exists**: CloudFormation cannot create resources that already exist
   
   Solution: Import existing resources or use a different name

3. **Stack Update Failed**: CloudFormation stack update failed

   Solution: Check the CloudFormation console for detailed error messages

### Debugging

1. **CDK Output**: Use `npm run cdk synth` to inspect the generated CloudFormation template
2. **CloudWatch Logs**: Check Lambda function logs in CloudWatch
3. **CDK Bootstrapping**: Ensure your environment is bootstrapped with `cdk bootstrap`

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)
- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/latest/) 