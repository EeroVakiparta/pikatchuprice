# Location Data Collection Options for PWA

## Current Implementation
Currently, the app uses hardcoded coordinates for Tampere:
```javascript
const TAMPERE_LAT = 61.4937;
const TAMPERE_LON = 23.8283;
```

This works well for users in Tampere but limits usability for others.

## Options for Location Data Collection

### 1. Geolocation API (Browser-based)
- **How it works**: Uses the browser's Geolocation API to get user's current position
- **Implementation**: 
  ```javascript
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  ```
- **Pros**: 
  - No account needed
  - One-click permission (browser handles consent)
  - Real-time location
- **Cons**:
  - Requires permission each browser session (unless remembered)
  - Some users may reject location sharing

### 2. IP-based Geolocation (Fallback)
- **How it works**: Determines approximate location based on IP address
- **Implementation**: Uses third-party services or APIs
- **Pros**: 
  - No user permission required
  - Works as fallback when Geolocation API fails
- **Cons**:
  - Less accurate (city-level)
  - May be inaccurate with VPNs

### 3. One-time Setup with Local Storage
- **How it works**: Ask for location once, store in browser's localStorage
- **Implementation**:
  ```javascript
  // On first visit or setup
  navigator.geolocation.getCurrentPosition((position) => {
    localStorage.setItem('userLat', position.coords.latitude);
    localStorage.setItem('userLon', position.coords.longitude);
  });
  ```
- **Pros**:
  - One-time setup
  - Persists between sessions
  - No account needed
- **Cons**:
  - Location becomes stale if user moves
  - Cleared if user clears browser data

### 4. Account-based Location Setting
- **How it works**: Users set location during account creation/setup
- **Implementation**: Store location with user profile
- **Pros**:
  - Works across devices
  - User has explicit control
- **Cons**:
  - Requires account creation
  - Multiple clicks for initial setup
  - Manual updates needed when location changes

## Recommended Approach: Tiered Location Strategy

For the best user experience with minimal clicks:

1. **First Visit**: 
   - Prompt for geolocation permission
   - Store in localStorage if granted
   - Offer manual entry if denied
   
2. **Subsequent Visits**:
   - Use localStorage data first (quickest)
   - Periodically (weekly) offer to refresh location data
   - Provide easy way to manually update location

3. **Settings Screen**:
   - Allow manual location entry/update
   - Option to enable/disable automatic location

This approach prioritizes the "one click daily" requirement while handling both first-time setup and ongoing usage scenarios. 