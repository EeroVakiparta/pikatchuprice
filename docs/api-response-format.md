# API Response Format Documentation

This document describes the API response format for the Pikatchuprice application and how it interfaces with external data sources.

## Application API Format

The Pikatchuprice API returns an array of objects with the following structure:

```json
[
  {
    "price": 0.925,
    "priceTime": "2025-04-20T21:00:00.000Z",
    "timestamp": 1745182800000
  },
  {
    "price": 1.06,
    "priceTime": "2025-04-20T20:00:00.000Z",
    "timestamp": 1745179200000
  },
  ...
]
```

### Properties

| Property   | Type    | Description                                  |
|------------|---------|----------------------------------------------|
| price      | number  | The electricity price                        |
| priceTime  | string  | ISO date string for the price period start   |
| timestamp  | number  | Unix timestamp (milliseconds) of priceTime   |

## External API Format (porssisahko.net)

The external API we consume (porssisahko.net) uses a different format with an object containing a `prices` array:

```json
{
  "prices": [
    {
      "price": 0.925,
      "startDate": "2025-04-20T21:00:00.000Z",
      "endDate": "2025-04-20T22:00:00.000Z"
    },
    {
      "price": 1.06,
      "startDate": "2025-04-20T20:00:00.000Z",
      "endDate": "2025-04-20T21:00:00.000Z"
    },
    ...
  ]
}
```

### Properties

| Property   | Type    | Description                                  |
|------------|---------|----------------------------------------------|
| price      | number  | The electricity price                        |
| startDate  | string  | ISO date string for the price period start   |
| endDate    | string  | ISO date string for the price period end     |

## Implementation Details

The Lambda function in `lambda/fetchPrices.ts` handles the transformation from the external API format to our application's format:

1. Fetches data from porssisahko.net API
2. Extracts the prices array from the response
3. Transforms each price object to match our format (mapping startDate to priceTime)
4. Returns the data as an array of price objects

## Frontend Implementation

The frontend application processes the API response:

```javascript
const response = await fetchElectricityPricesFromDB();
if (response === null) return;

const responseData = await response.json();
let pricesData = responseData;

// Process array data format
if (Array.isArray(responseData)) {
    priceTime = pricesData.map(entry => new Date(entry.priceTime));
    prices = pricesData.map(entry => entry.price);
} 
// Handle direct API responses from external sources during development
else if (responseData.prices && Array.isArray(responseData.prices)) {
    pricesData = responseData.prices;
    priceTime = pricesData.map(entry => new Date(entry.startDate));
    prices = pricesData.map(entry => entry.price);
}
```

## Database Schema

The application stores electricity price data in DynamoDB with the following schema:

```
Table: PPElectricityPricesTable
- price (number): The electricity price
- priceTime (string): ISO date string for when the price is valid
- timestamp (number): Unix timestamp in milliseconds
``` 