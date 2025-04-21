import * as cdk from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PikatchupriceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, 'PikatchuPriceBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
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
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'fetchPrices.handler',
      code: lambda.Code.fromAsset('lambda'),
    });
    
    // Create API Gateway for electricity prices
    const electricityApi = new apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: fetchPricesLambda,
    });

    // Create Fuel Prices Lambda
    const fetchFuelPricesLambda = new lambda.Function(this, 'fetchFuelPricesFunction', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'fetchFuelPrices.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TANKILLE_EMAIL: process.env.TANKILLE_EMAIL || '',
        TANKILLE_PASSWORD: process.env.TANKILLE_PASSWORD || '',
        DEFAULT_LATITUDE: '61.4937',
        DEFAULT_LONGITUDE: '23.8283',
      },
      timeout: cdk.Duration.seconds(30),
    });
    
    // Create API Gateway for fuel prices
    const fuelApi = new apigateway.LambdaRestApi(this, 'FuelPricesEndpoint', {
      handler: fetchFuelPricesLambda,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });
    
    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'FuelApiUrl', {
      value: fuelApi.url,
      description: 'The URL of the fuel prices API',
      exportName: 'FuelApiUrl',
    });
  }
}
