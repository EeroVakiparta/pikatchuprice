# PikatchuPrice Documentation

Welcome to the PikatchuPrice documentation. This guide will help you understand how to work with the PikatchuPrice codebase, a serverless application for monitoring electricity prices and sending notifications.

## Table of Contents

1. [Lambda Function Development Guide](./lambda-development-guide.md)
2. [CDK Deployment Guide](./cdk-deployment-guide.md)
3. [Versioning Options](./versioning-options.md)
4. [Commit Guidelines](./commit-guidelines.md)
5. [GitHub Secrets Setup](./github-secrets-setup.md)
6. [API Response Format](./api-response-format.md)
7. [GitHub CLI Setup](./github-cli-setup.md)
8. [AI Assistant Guidelines](./ai-assistant-guidelines.md)
9. [Monitoring Deployed Applications](./monitoring-deployed-application.md)
10. [CI/CD with GitHub Actions](./github-secrets-setup.md#aws-authentication-method-access-keys)
11. [Branching Strategy](./branching-strategy.md)
12. [Deprecated Features](./deprecated-features.md)

## Project Overview

PikatchuPrice is an AWS-based system for monitoring electricity prices from external APIs, storing them in DynamoDB, and sending notifications to subscribed users when prices are below a configured threshold.

### Key Features

- **Price Fetching**: Scheduled fetching of electricity prices
- **Price Storage**: DynamoDB-based price history storage
- **User Registration**: API for users to subscribe to notifications
- **Notification System**: SMS and email notifications via SNS
- **Step Functions Workflow**: Orchestrated price checking and notification
- **Web Frontend**: Hosted S3/CloudFront website
- **CI/CD Pipeline**: Automated deployment using GitHub Actions with AWS access keys

### Architecture Diagram

```
                         ┌───────────────┐
                         │  CloudFront   │
                         │ Distribution  │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │     S3        │
                         │   Website     │
                         └───────────────┘
                                 ▲
                                 │
      ┌───────────────┐  ┌──────┴───────┐  ┌───────────────┐
      │EventBridge Rule│  │ API Gateway │  │   SNS Topic   │
      │   (Schedule)   │  │             │  │               │
      └───────┬───────┘  └──────┬───────┘  └───────┬───────┘
              │                 │                  │
              ▼                 ▼                  ▼
      ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
      │  Lambda for   │  │  Lambda for  │  │  Lambda for  │
      │ Price Fetching│  │ Data Retrieval│ │ Notifications│
      └───────┬───────┘  └──────┬───────┘  └──────┬───────┘
              │                 │                  │
              ▼                 ▼                  │
      ┌───────────────┐  ┌──────────────┐         │
      │   DynamoDB    │◄─┤Step Functions │◄────────┘
      │    Tables     │  │ State Machine │
      └───────────────┘  └──────────────┘
```

## Getting Started

To get started with PikatchuPrice development:

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure AWS credentials
4. Follow the development workflows in the specific guides

### CI/CD with GitHub Actions

PikatchuPrice uses GitHub Actions for continuous integration and deployment:

1. Every push to the `main` branch triggers the deployment workflow
2. The workflow builds, tests, and deploys the application to AWS
3. We use AWS access keys stored as GitHub secrets for authentication
4. See [GitHub Secrets Setup](./github-secrets-setup.md) for details on configuring AWS credentials and secrets

## Contributing

When contributing to the PikatchuPrice project:

1. Follow the [Lambda Development Guide](./lambda-development-guide.md) for Lambda function changes
2. Follow the [CDK Deployment Guide](./cdk-deployment-guide.md) for infrastructure changes
3. Ensure all Lambda functions use the latest supported Node.js runtime
4. Use the standard project structure
5. Include appropriate error handling and CORS headers
6. Test your changes locally before deploying
7. Follow the [Commit Guidelines](./commit-guidelines.md) for proper versioning

## Troubleshooting

Common issues and their solutions are covered in the specific guides. If you encounter any issues, check the CloudWatch logs for Lambda functions and the CloudFormation console for deployment issues. 