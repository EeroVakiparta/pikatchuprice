import * as cdk from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

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

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./public')],
      destinationBucket: websiteBucket,
    });

    const fetchPricesLambda = new lambda.Function(this, 'fetchPricesFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'fetchPrices.handler',
      code: lambda.Code.fromAsset('lambda'),
    });
    
    new apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: fetchPricesLambda,
    });

    // Create a new Lambda function for notifications
    const notifyLambda = new lambda.Function(this, 'notifyFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'notify.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // Schedule the Lambda function to run every hour
    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      targets: [new targets.LambdaFunction(notifyLambda)],
    });
  }
}
