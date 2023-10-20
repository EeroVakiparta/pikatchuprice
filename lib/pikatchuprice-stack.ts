import * as cdk from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
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
  }
}
