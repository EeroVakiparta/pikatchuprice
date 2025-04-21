import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as https from 'https';
import { URL } from 'url';

interface TankillePrice {
  _id: string;
  tag: string;
  price: number;
  updated: string;
  delta: number;
  reporter: string;
}

interface TankilleStation {
  _id: string;
  name: string;
  brand: string;
  chain?: string;
  address?: string;
  city?: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  fuels: string[];
  price: TankillePrice[];
}

interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  prices: {
    [fuelType: string]: {
      price: number;
      updated: string;
    };
  };
}

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  data?: any;
}

interface FetchResponse {
  data: any;
  status: number;
  headers: any;
}

// Map of fuel types from API to display names
const fuelTypeMapping: Record<string, string> = {
  '95': '95E10',
  '98': '98E5',
  'dsl': 'Diesel',
  'dsl+': 'Diesel Plus'
};

/**
 * Simple fetch implementation using native Node.js https
 */
async function fetchAPI(url: string, options: FetchOptions = {}): Promise<FetchResponse> {
  return new Promise((resolve, reject) => {
    const { method = 'GET', headers = {}, data } = options;
    
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers,
    };
    
    const req = https.request(reqOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(responseData);
            resolve({
              data: parsedData,
              status: res.statusCode,
              headers: res.headers
            });
          } catch (e: any) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject({
            status: res.statusCode,
            data: responseData,
            message: `Request failed with status code ${res.statusCode}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      const postData = typeof data === 'string' ? data : JSON.stringify(data);
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * Get authentication token for Tankille API
 */
async function getAuthToken(): Promise<string> {
  try {
    // Step 1: Login to get refresh token
    console.log('Authenticating with Tankille API...');
    
    // Define headers explicitly
    const headers = {
      'user-agent': 'FuelFellow/3.7.1 (Galaxy S7; Android 11)',
      'accept-language': 'en',
      'content-type': 'application/json'
    };
    
    console.log('Using headers:', headers);
    
    const loginResponse = await fetchAPI('https://api.tankille.fi/auth/login', {
      method: 'POST',
      headers: headers,
      data: {
        email: process.env.TANKILLE_EMAIL || 'tossrozz@gmail.com',
        password: process.env.TANKILLE_PASSWORD || 'PikatchuPrice404',
        device: 'Galaxy S7 (785ebf402803354c)',
      }
    });
    
    console.log('Login successful, received refresh token');
    const refreshToken = loginResponse.data.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token in login response');
    }
    
    // Step 2: Use refresh token to get access token
    const refreshResponse = await fetchAPI('https://api.tankille.fi/auth/refresh', {
      method: 'POST',
      headers: headers,
      data: {
        token: refreshToken
      }
    });
    
    const accessToken = refreshResponse.data.accessToken;
    if (!accessToken) {
      throw new Error('No access token in refresh response');
    }
    
    return accessToken;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Failed to authenticate with Tankille API');
  }
}

/**
 * Get stations and apply filtering if requested
 */
async function getStations(
  token: string,
  latitude?: string, 
  longitude?: string, 
  radius?: string
): Promise<FuelStation[]> {
  try {
    // Get all stations from API
    const stationsResponse = await fetchAPI('https://api.tankille.fi/stations', {
      method: 'GET',
      headers: {
        'x-access-token': token,
        'user-agent': 'FuelFellow/3.7.1 (Galaxy S7; Android 11)',
        'accept-language': 'en'
      }
    });
    
    console.log(`Received ${stationsResponse.data?.length || 0} stations from API`);
    
    if (!Array.isArray(stationsResponse.data)) {
      throw new Error('Invalid response format from API');
    }
    
    // Process stations
    let stations: FuelStation[] = stationsResponse.data.map((station: TankilleStation) => {
      // Extract coordinates from the nested location structure
      const hasLocation = station.location && Array.isArray(station.location.coordinates);
      const longitude = hasLocation ? station.location.coordinates[0] : undefined;
      const latitude = hasLocation ? station.location.coordinates[1] : undefined;
      
      // Create the transformed station object
      const transformedStation: FuelStation = {
        id: station._id,
        name: station.name || 'Unknown',
        brand: station.brand || 'Unknown',
        address: station.address || '',
        city: station.city || '',
        latitude: latitude,
        longitude: longitude,
        // Distance will be calculated if filtering by location
        distance: 0,
        prices: {},
      };
      
      // Map the fuel prices to the desired structure
      if (Array.isArray(station.price)) {
        for (const priceInfo of station.price) {
          const displayName = fuelTypeMapping[priceInfo.tag] || priceInfo.tag;
          transformedStation.prices[displayName] = {
            price: priceInfo.price,
            updated: priceInfo.updated
          };
        }
      }
      
      return transformedStation;
    });
    
    console.log(`Transformed ${stations.length} stations`);
    
    // Filter and sort by location if coordinates are provided
    if (latitude && longitude && radius && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const maxDistance = parseFloat(radius) / 1000; // Convert to kilometers
      
      // Filter stations with coordinates and calculate distance
      stations = stations
        .filter(station => station.latitude !== undefined && station.longitude !== undefined)
        .map(station => {
          // Calculate distance using Haversine formula
          const stationLat = station.latitude as number;
          const stationLon = station.longitude as number;
          
          const distance = calculateDistance(userLat, userLon, stationLat, stationLon);
          return {
            ...station,
            distance: distance
          };
        })
        .filter(station => station.distance <= maxDistance)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      console.log(`Filtered to ${stations.length} stations within ${maxDistance}km`);
    }
    
    return stations;
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw new Error('Failed to fetch fuel stations');
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Starting fetchFuelPrices lambda with event:', JSON.stringify(event, null, 2));
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    const latitude = queryParams.latitude;
    const longitude = queryParams.longitude;
    const radius = queryParams.radius || '5000'; // Default 5km radius
    
    if (latitude || longitude) {
      console.log(`Using parameters: lat=${latitude}, lon=${longitude}, radius=${radius}`);
    } else {
      console.log('No location parameters provided, returning all stations');
    }
    
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json',
    };
    
    // Get auth token and fetch stations
    const token = await getAuthToken();
    const stations = await getStations(token, latitude, longitude, radius);
    
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
    
    // Error details
    let errorMessage = 'Failed to fetch nearby fuel stations';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
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