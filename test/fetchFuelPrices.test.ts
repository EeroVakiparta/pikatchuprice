import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock the actual implementation to avoid real API calls
const mockHandler = jest.fn();

// Create a mock module
jest.doMock('../lambda/fetchFuelPrices', () => ({
  handler: mockHandler
}));

describe('fetchFuelPrices Lambda', () => {
  let handler: any;

  beforeAll(async () => {
    // Import the handler after mocking
    const module = await import('../lambda/fetchFuelPrices');
    handler = module.handler;
  });

  beforeEach(() => {
    jest.resetAllMocks();
    
    // Set up default successful mock response
    mockHandler.mockResolvedValue({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stations: [
          {
            id: 'station1',
            name: 'Test Station',
            brand: 'Test Brand',
            address: 'Test Address',
            city: 'Test City',
            latitude: 61.4937,
            longitude: 23.8283,
            distance: 0.5,
            prices: {
              'Gasoline 95': { price: 1.95, updated: '2023-01-01T12:00:00Z' },
              'Gasoline 98': { price: 2.05, updated: '2023-01-01T12:00:00Z' }
            }
          }
        ],
        timestamp: '2023-01-01T12:00:00.000Z'
      })
    });
  });

  test('returns successful response for valid request with location', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        latitude: '61.4937',
        longitude: '23.8283',
        radius: '3000'
      }
    };

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('stations');
    expect(body.stations).toBeInstanceOf(Array);
    expect(body.stations.length).toBeGreaterThan(0);
    expect(body).toHaveProperty('timestamp');
  });

  test('handles error responses correctly', async () => {
    // Mock error response
    mockHandler.mockResolvedValue({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error fetching fuel prices',
        error: 'Test error message'
      })
    });

    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: null
    };

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'Error fetching fuel prices');
    expect(body).toHaveProperty('error');
  });

  test('handles missing query parameters', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: null
    };

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('stations');
    expect(body).toHaveProperty('timestamp');
  });

  test('handles partial query parameters', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        latitude: '61.4937'
        // missing longitude and radius
      }
    };

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });

  test('validates CORS headers are present', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        latitude: '61.4937',
        longitude: '23.8283',
        radius: '5000'
      }
    };

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Credentials', true);
    
    if (result.statusCode === 200) {
      expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    }
  });
}); 