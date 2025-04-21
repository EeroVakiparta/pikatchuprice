import { APIGatewayProxyEvent } from 'aws-lambda';
import axios from 'axios';
import { handler } from '../lambda/fetchFuelPrices';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchFuelPrices Lambda', () => {
  // Save original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    // Set environment variables for testing
    process.env = {
      ...originalEnv,
      TANKILLE_EMAIL: 'test@example.com',
      TANKILLE_PASSWORD: 'password123',
      DEFAULT_LATITUDE: '61.4937',
      DEFAULT_LONGITUDE: '23.8283',
    };

    // Set up the mocks for each test
    mockedAxios.post.mockResolvedValue({
      data: {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 'mock-user-id'
      }
    });
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  test('returns nearby stations when API calls succeed', async () => {
    // Mock successful stations response
    mockedAxios.get.mockResolvedValue({
      data: [
        {
          id: 'station1',
          name: 'Test Station 1',
          brand: 'Test Brand',
          address: 'Test Address 1',
          city: 'Test City',
          latitude: 61.4937,
          longitude: 23.8283,
          distance: 100,
          prices: {
            '95': { price: 1.95, updated: '2023-01-01T12:00:00Z' },
            '98': { price: 2.05, updated: '2023-01-01T12:00:00Z' }
          }
        },
        {
          id: 'station2',
          name: 'Test Station 2',
          brand: 'Test Brand 2',
          address: 'Test Address 2',
          city: 'Test City',
          latitude: 61.4940, 
          longitude: 23.8290,
          distance: 200,
          prices: {
            '95': { price: 1.97, updated: '2023-01-01T12:00:00Z' },
            '98': { price: 2.07, updated: '2023-01-01T12:00:00Z' }
          }
        }
      ]
    });

    // Create mock API Gateway event
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        latitude: '61.4937',
        longitude: '23.8283',
        radius: '3000',
        fuelTypes: '95,98'
      }
    };

    // Call the handler
    const result = await handler(mockEvent as APIGatewayProxyEvent);

    // Verify the result
    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');

    // Parse the response body
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('stations');
    expect(body.stations).toHaveLength(2);
    expect(body.stations[0].id).toBe('station1');
    expect(body.stations[0].prices).toHaveProperty('95E10');
    expect(body.stations[1].id).toBe('station2');
    
    // Verify API calls were made correctly
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.tankille.fi/auth/login',
      { email: 'test@example.com', password: 'password123' }
    );
    
    // Verify the get call
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.tankille.fi/stations',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token'
        }),
        params: expect.objectContaining({
          lat: '61.4937',
          lon: '23.8283',
          distance: '3000',
          fuels: '95,98'
        })
      })
    );
  });

  test('handles authentication errors correctly', async () => {
    // Mock failed authentication
    mockedAxios.post.mockRejectedValueOnce(new Error('Authentication failed'));

    // Create mock API Gateway event
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        latitude: '61.4937',
        longitude: '23.8283'
      }
    };

    // Call the handler
    const result = await handler(mockEvent as APIGatewayProxyEvent);

    // Verify error response
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'Error fetching fuel prices');
    expect(body).toHaveProperty('error', 'Failed to fetch nearby fuel stations');
  });

  test('uses default values when query parameters are not provided', async () => {
    // Mock successful stations response
    mockedAxios.get.mockResolvedValue({
      data: []
    });

    // Create mock API Gateway event with no query parameters
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: null
    };

    // Call the handler
    await handler(mockEvent as APIGatewayProxyEvent);

    // Verify that default values were used in the API call
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.tankille.fi/stations',
      expect.objectContaining({
        params: expect.objectContaining({
          lat: '61.4937',
          lon: '23.8283',
          distance: '5000',
          fuels: '95,98,dsl'
        })
      })
    );
  });
  
  test('returns empty array when no stations found', async () => {
    // Mock empty stations response
    mockedAxios.get.mockResolvedValue({
      data: []
    });

    // Create mock API Gateway event
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        latitude: '61.4937',
        longitude: '23.8283'
      }
    };

    // Call the handler
    const result = await handler(mockEvent as APIGatewayProxyEvent);

    // Verify the result
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.stations).toEqual([]);
  });

  test('handles API errors when fetching stations', async () => {
    // Mock successful authentication but failed station fetch
    mockedAxios.post.mockResolvedValue({
      data: {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 'mock-user-id'
      }
    });
    
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch stations'));

    // Create mock API Gateway event
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {
        latitude: '61.4937',
        longitude: '23.8283'
      }
    };

    // Call the handler
    const result = await handler(mockEvent as APIGatewayProxyEvent);

    // Verify error response
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'Error fetching fuel prices');
    expect(body).toHaveProperty('error', 'Failed to fetch nearby fuel stations');
  });
}); 