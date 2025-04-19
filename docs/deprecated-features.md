# Deprecated Features

This document outlines features that were previously implemented but have since been deprecated or removed from the PikatchuPrice application.

## Phone Number Registration System

### Overview

The phone number registration system was implemented as an experimental feature to allow users to subscribe to price alerts via SMS. The system included:

1. A registration form in the web UI
2. An API endpoint to handle registrations
3. A DynamoDB table to store user phone numbers
4. A Lambda function to process registration requests

### Reasons for Deprecation

The feature was deprecated for the following reasons:

1. **Cost concerns**: SMS notification costs could scale unpredictably with user growth
2. **Implementation complexity**: Managing phone number validation, opt-out processes, and privacy concerns added significant complexity
3. **Limited usage**: The feature had low adoption among users
4. **Alternative approaches**: Web notifications and email alerts provide similar functionality with lower costs and complexity

### Implementation Notes

The original implementation included:

- A modal dialog in the frontend for user registration
- An API Gateway endpoint for registration processing
- A DynamoDB table for storing subscription data
- Integration with AWS SNS for message delivery

#### Deprecated Lambda Functions

The following Lambda functions were part of the SMS notification system and have been removed:

- `registerPhoneNumber.js` - Handled user registration and stored phone numbers in DynamoDB
- `retrieveSubscribers.js` - Retrieved subscribed phone numbers from DynamoDB
- `sendNotification.js` - Checked for low prices and triggered notifications
- `sendSms.js` - Handled the actual sending of SMS messages through AWS SNS

### Database Retention

While the UI components, API endpoints, and Lambda functions for phone number registration have been removed, the backend DynamoDB table has been retained for historical data and to support potential future reactivation of the feature.

## Migration Path

For any users who were relying on SMS notifications, alternative notification methods are being explored, including:

1. Browser-based push notifications
2. Email notifications
3. Integration with messaging platforms

## Code References

The original implementation can be found in the repository history in these locations:

- Frontend registration UI: `public/index.html`
- Lambda functions: 
  - `lambda/registerPhoneNumber.js`
  - `lambda/retrieveSubscribers.js`
  - `lambda/sendNotification.js`
  - `lambda/sendSms.js`
- CDK infrastructure: `lib/pikatchuprice-stack.ts` 