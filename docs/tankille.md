# Fuel Price Integration Research

## Overview
This document explores the possibility of integrating fuel price data into our PikatchuPrice PWA application. With the addition of user location detection, we can now provide users with information about nearby fuel stations and their current prices, improving the app's utility.

## Data Source: Tankille.fi
Tankille.fi is a Finnish service that provides up-to-date fuel prices from gas stations across Finland. It offers:
- Real-time price updates from user contributions
- Extensive coverage of gas stations throughout Finland
- Multiple fuel types (95E10, 98E5, Diesel, etc.)
- Location-based search capabilities

## Available API Options

### 1. Official Tankille API
- **Repository**: [jesmak/tankille](https://github.com/jesmak/tankille)
- **Documentation**: [Postman Collection](https://www.postman.com/maintenance-geoscientist-9029189/tankille/overview)
- **Authentication**: Requires username/password (stored in our .env file)
- **Features**:
  - Location-based station search
  - Filtering by fuel type
  - Filtering by station chain
  - Price sorting
  - Distance parameters

### 2. Alternative JavaScript Implementation
- **Repository**: [aattola/tankille](https://github.com/aattola/tankille)
- **Implementation**: Node.js library
- **Features**:
  - Similar to official API but wrapped in a JavaScript library
  - Easier integration with our JavaScript-based frontend

## Implementation Approach

### 1. API Integration
We'll need to create a serverless function to:
- Authenticate with Tankille using our credentials
- Accept user coordinates as parameters
- Query nearby stations within a configurable radius
- Return standardized data for the frontend to display

### 2. Frontend Display
Options for displaying the fuel price data:
- **Map View**: Display stations on a map with price markers
- **List View**: Show nearest stations sorted by price or distance
- **Station Detail**: Show full details when a station is selected

### 3. Data Flow
1. User allows location access or sets location manually
2. Location coordinates are sent to our API
3. Our API authenticates with Tankille and requests nearby stations
4. Results are filtered and formatted for display
5. Frontend renders the data in user-friendly format

## Technical Considerations

### Authentication Management
- Store Tankille credentials securely (environment variables)
- Implement token caching to reduce authentication requests
- Handle auth failures gracefully

### Data Freshness
- Implement appropriate caching strategy (30 min to 1 hour)
- Display last update timestamp
- Add manual refresh capability

### Privacy Considerations
- Only send location data when explicitly requested
- Store minimum required data
- Be transparent about data usage

### Error Handling
- Graceful degradation if Tankille API is unavailable
- Fallback display options if location is not available
- Clear error messages for users

## Implementation Plan

### Phase 1: Backend API Setup
- Create AWS Lambda function to proxy Tankille API
- Implement authentication handling
- Add location-based querying
- Add filtering and sorting options

### Phase 2: Frontend Integration
- Add fuel section to the PWA interface
- Implement location-aware requests
- Create basic list view of nearby stations
- Add price comparison features

### Phase 3: Enhanced Features
- Add map view for station locations
- Implement favorites/bookmarks
- Add price trend tracking
- Add notification for price drops at favorite stations

## Required Resources
- Tankille.fi account credentials (already in .env)
- AWS Lambda for API proxy
- API Gateway for endpoint management
- DynamoDB for optional price history/caching
- Frontend components for displaying fuel data

## Conclusion
Integrating fuel prices using the Tankille API is feasible and would add significant value to our PikatchuPrice application. By leveraging our existing user location feature, we can provide personalized, location-aware fuel price information with minimal additional user interaction, maintaining our "one-click daily" experience philosophy.

The implementation can be done incrementally, starting with basic price listings and evolving to more sophisticated features like maps and price alerts over time.