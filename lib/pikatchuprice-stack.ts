import * as cdk from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';


export class PikatchupriceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, 'PikatchuPriceBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    const bucketPolicy = new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${websiteBucket.bucketArn}/*`],
      effect: Effect.ALLOW,
      principals: [new ArnPrincipal('*')],
    });

    websiteBucket.addToResourcePolicy(bucketPolicy);

    // Create a CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'MyDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    const pikaElectricityPricesTable = new dynamodb.Table(this, 'PikaElectricityPricesTable', {
      partitionKey: { name: 'partitionKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'datetime', type: dynamodb.AttributeType.STRING },
      tableName: 'PikaElectricityPricesTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // Only for dev/test environments
    });


    // Create UserSubscriptions table
    const userSubscriptionsTable = new dynamodb.Table(this, 'UserSubscriptionsTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      tableName: 'UserSubscriptions',
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // Only for dev/test environments
    });



    // Update your existing BucketDeployment to include the distribution
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./public')],
      destinationBucket: websiteBucket,
      distribution,
    });

    // Create SNS Topic
    const topic = new sns.Topic(this, 'MyTopic');

    const fetchPricesLambda = new lambda.Function(this, 'fetchPricesFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'fetchPrices.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(10),
    });

    // Allow Lambda to publish to SNS Topic
    topic.grantPublish(fetchPricesLambda);
    // Grant write permissions to the Lambda function
    pikaElectricityPricesTable.grantWriteData(fetchPricesLambda);
    // Optionally, add an email subscription to the topic
    topic.addSubscription(new snsSubscriptions.EmailSubscription('vakipartaeero@gmail.com'));

  

    // Create a new Lambda function for notifications
    const notifyLambda = new lambda.Function(this, 'notifyFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'sendNotification.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || ''
      }
    });

    const fetchElectricityPricesFromDBLambda = new lambda.Function(this, 'fetchElectricityPricesFromDBFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'fetchElectricityPricesFromDB.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    pikaElectricityPricesTable.grantReadData(fetchElectricityPricesFromDBLambda);

    new apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: fetchElectricityPricesFromDBLambda, // Use fetchElectricityPricesFromDBLambda as the handler
    });
    //

    // Schedule the Lambda function to run every hour
    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      targets: [new targets.LambdaFunction(notifyLambda)],
    });

    // Schedule your Lambda function to run once a day
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '6,18' }),  // This will run the function at 6am and 6pm UTC
    });

    rule.addTarget(new targets.LambdaFunction(fetchPricesLambda));
  }
}
