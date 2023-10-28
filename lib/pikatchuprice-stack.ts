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

    const pikaElectricityPricesTable = new dynamodb.Table(this, 'PPElectricityPricesTable', {
      partitionKey: { name: 'partitionKey', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'priceTime', type: dynamodb.AttributeType.STRING },
      tableName: 'PPElectricityPricesTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // Only for dev/test environments
    });

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
    const priceNotificationTopic = new sns.Topic(this, 'PriceNotificationTopic');

    const fetchPricesLambda = new lambda.Function(this, 'fetchPricesFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'fetchPrices.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(10),
    });

    priceNotificationTopic.grantPublish(fetchPricesLambda);
    pikaElectricityPricesTable.grantWriteData(fetchPricesLambda);
    priceNotificationTopic.addSubscription(new snsSubscriptions.EmailSubscription('vakipartaeero@gmail.com'));

    const registerPhoneNumberLambda = new lambda.Function(this, 'RegisterPhoneNumberFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'registerPhoneNumber.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: userSubscriptionsTable.tableName,
      },
    });

    userSubscriptionsTable.grantWriteData(registerPhoneNumberLambda);

    const registerPhoneNumberApi = new apigateway.RestApi(this, 'RegisterPhoneNumberApi', {
      restApiName: 'Register Phone Number Service',
      description: 'This service registers a phone number for price notifications.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,  // Allows access from any origin
        allowMethods: apigateway.Cors.ALL_METHODS,  // Allows all HTTP methods
      },
    });
    
    const registerPhoneNumberIntegration = new apigateway.LambdaIntegration(registerPhoneNumberLambda);
    registerPhoneNumberApi.root.addMethod('POST', registerPhoneNumberIntegration);  // Adding a POST method to the API root

    const notifyUsersLambda = new lambda.Function(this, 'notifyFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'sendNotification.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TOPIC_ARN: priceNotificationTopic.topicArn,
      },
    });

    priceNotificationTopic.grantPublish(notifyUsersLambda);

    const fetchElectricityPricesFromDBLambda = new lambda.Function(this, 'fetchElectricityPricesFromDBFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'fetchElectricityPricesFromDB.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    pikaElectricityPricesTable.grantReadData(fetchElectricityPricesFromDBLambda);

    new apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: fetchElectricityPricesFromDBLambda,
    });

    // NOTIFY USERS RULE
    new events.Rule(this, 'NotifyUsersRule', {
      //schedule: events.Schedule.cron({ minute: '0', hour: '17' }),
      //send notification every 10 minutes for testing purposes
      schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
      targets: [new targets.LambdaFunction(notifyUsersLambda)],
    });

    // GET NEW PRICES RULE
    const ruleNewPricesFetchingSchedule = new events.Rule(this, 'FetchPricesRule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '10-16' }),
    });

    ruleNewPricesFetchingSchedule.addTarget(new targets.LambdaFunction(fetchPricesLambda));

  }
}
