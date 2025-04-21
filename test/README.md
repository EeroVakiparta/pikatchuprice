# Test Suite for PikatchuPrice Project

This directory contains tests for the PikatchuPrice project.

## Test Files

- **pikatchuprice.test.ts**: Tests for the CDK stack infrastructure
- **fetchFuelPrices.test.ts**: Tests for the fuel prices Lambda function (currently skipped)
- **fetchPrices.test.ts**: Tests for the electricity prices Lambda function (currently skipped)

## Test Strategy

### Infrastructure Tests

The infrastructure tests verify that the CDK stack creates the expected resources:
- Lambda functions with correct handlers
- API Gateway endpoints
- S3 bucket for the website

These tests use the AWS CDK assertions library to verify the resources and their properties.

### Lambda Function Tests

The Lambda function tests verify the behavior of the Lambda functions. They use Jest to mock external dependencies like AWS services and HTTP requests.

Currently, the Lambda function tests are skipped as they require more complex mocking of external APIs. To run these tests, you would need to:

1. Set up proper mocking for the APIs
2. Remove the `.skip` from the test suite
3. Run the tests with `npm test`

## Running Tests

To run all the tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- test/pikatchuprice.test.ts
```

## Future Test Improvements

1. **Complete Lambda function mocking**: Implement more robust mocking for the external APIs used by the Lambda functions
2. **Integration tests**: Add integration tests that test the entire application flow
3. **End-to-end tests**: Consider adding end-to-end tests that test the application in a real environment
4. **Test coverage reporting**: Add coverage reporting to track test coverage

## Contributing New Tests

When adding new tests:

1. Follow the existing patterns and naming conventions
2. Ensure tests are isolated and don't depend on external resources
3. Use meaningful test names that describe what is being tested
4. Include both positive and negative test cases
5. Mock external dependencies 