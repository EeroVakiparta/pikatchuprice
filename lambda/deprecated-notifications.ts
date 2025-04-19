/**
 * DEPRECATED: SMS Notification System
 * 
 * This file serves as documentation for the deprecated SMS notification system.
 * The original implementation included the following files:
 * - registerPhoneNumber.ts/.js - Registered user phone numbers in DynamoDB
 * - retrieveSubscribers.ts/.js - Retrieved subscribed phone numbers
 * - sendNotification.ts/.js - Checked for low prices and triggered notifications
 * - sendSms.ts/.js - Handled sending SMS through AWS SNS
 * 
 * These features were deprecated for the following reasons:
 * 1. Cost concerns with SMS notifications
 * 2. Implementation complexity
 * 3. Limited usage by users
 * 4. Alternative notification methods are more cost-effective
 * 
 * While the Lambda functions have been removed, the DynamoDB table
 * for storing phone numbers has been retained for historical data.
 * 
 * See docs/deprecated-features.md for more information.
 */

// This file is for documentation purposes only and is not used in the application. 