import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';

interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distance: number;
  prices: {
    [fuelType: string]: {
      price: number;
      updated: string;
    };
  };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    const latitude = queryParams.latitude || process.env.DEFAULT_LATITUDE || '61.4937';
    const longitude = queryParams.longitude || process.env.DEFAULT_LONGITUDE || '23.8283';
    const radius = queryParams.radius || '5000'; // Default 5km radius
    const fuelTypes = queryParams.fuelTypes || '95,98,dsl'; // Default fuel types
    
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json',
    };
    
    // Authenticate with Tankille API
    const authResponse = await axios.post('https://api.tankille.fi/auth/login', {
      email: process.env.TANKILLE_EMAIL,
      password: process.env.TANKILLE_PASSWORD,
    });
    
    const token = authResponse.data.token;
    
    // Fetch stations data
    const stationsResponse = await axios.get('https://api.tankille.fi/stations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        lat: latitude,
        lon: longitude,
        distance: radius,
        fuels: fuelTypes.split(','),
      },
    });
    
    // Process and format the response
    const stations: FuelStation[] = stationsResponse.data.map((station: any) => ({
      id: station.id,
      name: station.name,
      brand: station.brand,
      address: station.address,
      city: station.city,
      latitude: station.latitude,
      longitude: station.longitude,
      distance: station.distance,
      prices: station.prices,
    }));
    
    // Sort by distance
    stations.sort((a, b) => a.distance - b.distance);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        stations,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: unknown) {
    console.error('Error fetching fuel prices:', error);
    
    // Convert error to an object with a message property
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error fetching fuel prices',
        error: errorMessage,
      }),
    };
  }
}; 