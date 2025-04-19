# PikatchuPrice - Electricity Price Monitoring

<p align="center">
  <img src="https://www.freeiconspng.com/uploads/pikachu-transparent-29.gif" alt="Pikachu" width="250"/>
</p>

PikatchuPrice (aka PP) is an AWS-based system for monitoring electricity prices, providing real-time price data visualization and price alert notifications through a serverless architecture.

[![Deploy PikatchuPrice CDK Stack](https://github.com/EeroVakiparta/pikatchuprice/actions/workflows/cdk-deploy.yml/badge.svg)](https://github.com/EeroVakiparta/pikatchuprice/actions/workflows/cdk-deploy.yml)

## Features

- **Real-time Price Monitoring**: Fetches electricity prices and displays them in a color-coded chart
- **Price Alerts**: Subscribe to receive notifications when prices drop below thresholds
- **Serverless Architecture**: Built on AWS Lambda, DynamoDB, and S3
- **Mobile Friendly**: Responsive design works on any device
- **PWA Support**: Install as a Progressive Web App on mobile devices

## Documentation

Comprehensive documentation is available in the [docs](./docs) directory:

- [API Response Format](./docs/api-response-format.md) - Details on the API data structure
- [Lambda Development Guide](./docs/lambda-development-guide.md) - Guide for working with Lambda functions
- [CDK Deployment Guide](./docs/cdk-deployment-guide.md) - Instructions for deploying the application
- [Versioning Options](./docs/versioning-options.md) - Information on versioning strategies
- [Commit Guidelines](./docs/commit-guidelines.md) - Standards for commit messages

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/EeroVakiparta/pikatchuprice.git
   cd pikatchuprice
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure AWS credentials:
   ```
   aws configure
   ```

4. Deploy the stack:
   ```
   npm run cdk deploy
   ```

## GitHub Actions CI/CD Setup

To enable automatic deployment through GitHub Actions, you need to configure AWS credentials:

1. **Create an IAM User for GitHub Actions**:
   - Go to the AWS IAM console and create a new user
   - Set access type to "Programmatic access"
   - Attach policies needed for CDK deployment (e.g., `AdministratorAccess` for simplicity, or more restrictive policies for production)
   - After creation, save the Access Key ID and Secret Access Key

2. **Add AWS Credentials to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add a new repository secret named `AWS_ACCESS_KEY_ID` with the access key from the IAM user
   - Add another repository secret named `AWS_SECRET_ACCESS_KEY` with the secret key from the IAM user

3. **Additional Secrets**:
   - If you're using semantic-release, add a GitHub token as `NPM_TOKEN` (see docs for details)

## Development Commands

* `npm run build`   - Compile TypeScript to JavaScript
* `npm run watch`   - Watch for changes and compile
* `npm run test`    - Run the test suite
* `npm run cdk deploy` - Deploy the stack to AWS
* `npm run cdk diff`  - Compare deployed stack with current state
* `npm run cdk synth` - Generate the CloudFormation template

## License

This project is licensed under the MIT License - see the LICENSE file for details.
