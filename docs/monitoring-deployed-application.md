# Monitoring Deployed Web Applications

This guide explains best practices for monitoring deployed web applications and checking for console errors, particularly when using AI assistants like Cursor AI.

## Industry Best Practices

### 1. Server-Side Logging

#### CloudWatch Logs

For AWS-based applications like PikatchuPrice:

```bash
# View recent Lambda function logs
aws logs get-log-events --log-group-name /aws/lambda/PikatchupriceStack-fetchPricesFunction --limit 10

# Filter logs for errors
aws logs filter-log-events --log-group-name /aws/lambda/PikatchupriceStack-fetchPricesFunction --filter-pattern "ERROR"
```

### 2. Client-Side Error Capturing

#### Implementing Error Tracking

Add this code to your frontend to capture and report errors:

```javascript
// In public/index.html or main JS file
window.addEventListener('error', function(event) {
  // Log the error
  console.error('Captured error:', event.error);
  
  // Send to backend
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: event.error.message,
      stack: event.error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })
  }).catch(err => console.error('Failed to report error:', err));
});

// For promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  // Similar reporting logic
});
```

#### Error Logging Endpoint

Add an API endpoint to receive and store these errors:

```typescript
// Example Lambda function in lambda/logError.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || '{}');
    
    await dynamoDB.put({
      TableName: process.env.ERROR_LOG_TABLE || 'ErrorLogs',
      Item: {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        ...body,
        userAgent: event.headers['User-Agent'],
        ip: event.requestContext.identity?.sourceIp,
        timestamp: new Date().toISOString()
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Error logged successfully' })
    };
  } catch (error) {
    console.error('Failed to log error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Failed to log error' })
    };
  }
}
```

### 3. Remote Debugging and Testing

#### Headless Browser Testing

Use Puppeteer or Playwright for automated console error checking:

```javascript
// test/console-errors.js
const puppeteer = require('puppeteer');

async function checkForConsoleErrors() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Collect console logs
  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    }
  });
  
  // Visit the page
  await page.goto('https://r8carkxrn0.execute-api.eu-north-1.amazonaws.com/prod/');
  
  // Wait for network idle to ensure everything loaded
  await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});
  
  // Print collected errors
  if (consoleMessages.length > 0) {
    console.log('Found console errors:');
    consoleMessages.forEach(msg => console.log(JSON.stringify(msg)));
    process.exit(1); // Exit with error code
  } else {
    console.log('No console errors detected');
  }
  
  await browser.close();
}

checkForConsoleErrors().catch(console.error);
```

#### Adding to CI/CD

Add this test to your GitHub workflow:

```yaml
# Add to .github/workflows/cdk-deploy.yml
- name: Check for console errors
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: |
    npm install puppeteer
    node test/console-errors.js
```

### 4. Third-Party Error Monitoring Services

Consider implementing one of these services:

- **Sentry**: Captures errors in real-time with detailed stack traces
- **LogRocket**: Records user sessions for debugging
- **New Relic**: Application performance monitoring with error tracking

Basic Sentry integration:

```javascript
// In public/index.html
<script
  src="https://browser.sentry-cdn.com/7.21.1/bundle.min.js"
  integrity="sha384-ySxJB7+jJ8kM0s8aP0v0HLU8aR86Z9TkSv9fz3/UjL0FoD1aAXgOOUcXmQJWxGD"
  crossorigin="anonymous"
></script>

<script>
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: "production",
    release: "pikatchuprice@VERSION" // Use version from version.json
  });
  
  // Load version and set release
  fetch('/version.json')
    .then(response => response.json())
    .then(data => {
      Sentry.configureScope(scope => {
        scope.setTag('version', data.version);
      });
    })
    .catch(console.error);
</script>
```

### 5. AI Agent-Specific Approaches

For Cursor AI or similar AI assistants to check console logs:

1. **Create API Endpoints**: Implement an endpoint that returns recent errors:

```typescript
// lambda/getRecentErrors.ts
export async function handler(): Promise<APIGatewayProxyResult> {
  try {
    const result = await dynamoDB.query({
      TableName: process.env.ERROR_LOG_TABLE || 'ErrorLogs',
      Limit: 10,
      ScanIndexForward: false, // Latest first
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('Failed to retrieve errors:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Failed to retrieve errors' })
    };
  }
}
```

2. **Scripted Health Checks**: Create scripts the AI can run to check application health:

```bash
#!/bin/bash
# health-check.sh

# Check API endpoint
echo "Checking API endpoint..."
API_RESPONSE=$(curl -s https://r8carkxrn0.execute-api.eu-north-1.amazonaws.com/prod/)
if [[ $API_RESPONSE == *"error"* ]]; then
  echo "Error detected in API response:"
  echo $API_RESPONSE
  exit 1
fi

# Check recent logs
echo "Checking recent logs..."
RECENT_LOGS=$(aws logs get-log-events --log-group-name /aws/lambda/PikatchupriceStack-fetchPricesFunction --limit 5)
if [[ $RECENT_LOGS == *"ERROR"* ]]; then
  echo "Error detected in logs:"
  echo $RECENT_LOGS
  exit 1
fi

# Check error database
echo "Checking error database..."
RECENT_ERRORS=$(curl -s https://r8carkxrn0.execute-api.eu-north-1.amazonaws.com/prod/errors)
if [[ $(echo $RECENT_ERRORS | jq length) -gt 0 ]]; then
  echo "Recent errors found:"
  echo $RECENT_ERRORS
  exit 1
fi

echo "All checks passed!"
exit 0
```

## Implementation Plan for PikatchuPrice

1. Add client-side error tracking to `public/index.html`
2. Create an error logging Lambda function and DynamoDB table
3. Set up a health check endpoint that AI agents can query
4. Update the CI/CD pipeline to check for console errors after deployment
5. Consider adding Sentry for comprehensive error monitoring

## Conclusion

Implementing these practices will allow both developers and AI assistants like Cursor AI to effectively monitor for console errors and other issues in the deployed application. The combination of client-side error capturing, server-side logging, and automated testing creates a robust system for maintaining application reliability. 