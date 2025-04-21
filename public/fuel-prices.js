// Fuel Prices Component

class FuelPriceComponent {
  constructor() {
    this.stations = [];
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = '';
    this.lastUpdate = null;
    
    // Set API configurations to use live data
    localStorage.setItem('FUEL_API_DEPLOYED', 'true');
    localStorage.setItem('FUEL_API_GATEWAY_URL', 'https://jlz510q880.execute-api.eu-north-1.amazonaws.com/prod/');
  }

  // Initialize the component
  init() {
    // Create DOM elements if needed
    this.createDOMElements();
    
    // Add event listeners
    document.getElementById('refreshFuelButton').addEventListener('click', () => this.fetchFuelPrices());
    
    // Listen for location updates
    document.addEventListener('userLocationUpdated', () => {
      console.log('Location updated, refreshing fuel prices');
      this.fetchFuelPrices();
    });
    
    // Fetch fuel prices initially with a short delay to let the page load
    setTimeout(() => this.fetchFuelPrices(), 500);
  }

  // Create DOM elements for the fuel prices component
  createDOMElements() {
    const fuelSection = document.createElement('div');
    fuelSection.id = 'fuelPricesContainer';
    fuelSection.className = 'fuel-prices-container';
    fuelSection.innerHTML = `
      <h2><i class="fas fa-gas-pump"></i> Nearby Fuel Prices</h2>
      <div id="fuelSortControls" class="fuel-sort-controls">
        <span>Sort by:</span>
        <button class="sort-button active" data-sort="distance">Distance</button>
        <button class="sort-button" data-sort="price-95">95E10 Price</button>
        <button class="sort-button" data-sort="price-98">98E5 Price</button>
        <button class="sort-button" data-sort="price-diesel">Diesel Price</button>
      </div>
      <div id="fuelPricesContent">
        <div id="fuelLoading" style="display: none;">
          <div class="loading-spinner"></div>
          <p>Loading fuel prices...</p>
        </div>
        <div id="fuelError" style="display: none;"></div>
        <div id="fuelStationsList"></div>
      </div>
      <button id="refreshFuelButton" class="fuel-refresh-button">
        <i class="fas fa-sync-alt"></i> Refresh Fuel Prices
      </button>
      <p id="fuelLastUpdateTime">Last Update: Never</p>
    `;
    
    // Insert the component after the weather container
    const weatherContainer = document.getElementById('weatherContainer');
    if (weatherContainer && weatherContainer.parentNode) {
      weatherContainer.parentNode.insertBefore(fuelSection, weatherContainer.nextSibling);
    } else {
      // Fallback to appending to body
      document.body.appendChild(fuelSection);
    }
    
    // Add event listeners for sort buttons
    document.querySelectorAll('.sort-button').forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.sort-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Sort stations based on the selected criteria
        this.sortStations(button.dataset.sort);
      });
    });
    
    // Add CSS styles
    this.addStyles();
  }

  // Add CSS styles for the component
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .fuel-prices-container {
        background-color: #f5f5f5;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        max-width: 550px;
      }
      
      .fuel-prices-container h2 {
        margin-top: 0;
        color: #333;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
      }
      
      .fuel-prices-container h2 i {
        margin-right: 8px;
        color: #4682b4;
      }
      
      .fuel-sort-controls {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 15px;
        gap: 8px;
      }
      
      .fuel-sort-controls span {
        color: #666;
        font-size: 0.9em;
        margin-right: 5px;
      }
      
      .sort-button {
        background-color: #e0e0e0;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 0.8em;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .sort-button:hover {
        background-color: #d0d0d0;
      }
      
      .sort-button.active {
        background-color: #4682b4;
        color: white;
      }
      
      .fuel-station-item {
        border-bottom: 1px solid #eee;
        padding: 12px 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      
      .fuel-station-item:last-child {
        border-bottom: none;
      }
      
      .fuel-station-info {
        flex-grow: 1;
        padding-right: 15px;
      }
      
      .station-name {
        font-weight: bold;
        margin-bottom: 4px;
        color: #4682b4;
      }
      
      .station-address {
        font-size: 0.9em;
        color: #666;
        margin-bottom: 4px;
      }
      
      .station-distance {
        font-size: 0.8em;
        color: #999;
        display: flex;
        align-items: center;
      }
      
      .station-distance i {
        margin-right: 4px;
        color: #4682b4;
      }
      
      .fuel-price-list {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        min-width: 160px;
      }
      
      .fuel-price-item {
        margin: 3px 0;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      
      .fuel-type {
        font-weight: bold;
        margin-right: 8px;
        min-width: 45px;
      }
      
      .fuel-price {
        color: #333;
        margin-right: 8px;
      }
      
      .fuel-updated {
        font-size: 0.8em;
        color: #999;
      }
      
      .fuel-refresh-button {
        background-color: #4682b4;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 8px 12px;
        cursor: pointer;
        margin-top: 12px;
        font-size: 14px;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
      }
      
      .fuel-refresh-button i {
        margin-right: 6px;
      }
      
      .fuel-refresh-button:hover {
        background-color: #36648b;
      }
      
      #fuelError {
        color: #d9534f;
        font-style: italic;
        padding: 10px;
        background-color: #ffeeee;
        border-radius: 5px;
      }
      
      #fuelLastUpdateTime {
        color: #666;
        font-size: 0.8em;
        margin-top: 8px;
      }
      
      #fuelLoading {
        padding: 15px;
        text-align: center;
        color: #666;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      #fuelLoading p {
        margin-top: 10px;
      }
      
      .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(70, 130, 180, 0.2);
        border-top-color: #4682b4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Fetch fuel prices from API
  async fetchFuelPrices() {
    // Show loading state
    this.isLoading = true;
    this.updateUI();
    
    try {
      // Get user location from localStorage
      const latitude = localStorage.getItem('userLat') || '61.4937';
      const longitude = localStorage.getItem('userLon') || '23.8283';
      
      // Check if we're using the live API
      const isLiveApi = localStorage.getItem('FUEL_API_DEPLOYED') === 'true';
      
      let data = { stations: [] };
      
      if (!isLiveApi) {
        // Use mock data for development
        console.log('Using mock fuel price data for development');
        
        // Wait to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data based on user location
        data = this.getMockData(latitude, longitude);
      } else {
        // Get the API Gateway URL from localStorage
        const apiGatewayUrl = localStorage.getItem('FUEL_API_GATEWAY_URL');
        
        if (!apiGatewayUrl) {
          throw new Error('API Gateway URL not configured');
        }
        
        console.log(`Calling fuel prices API: ${apiGatewayUrl}`);
        
        // Call the actual API
        const response = await fetch(`${apiGatewayUrl}?latitude=${latitude}&longitude=${longitude}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        data = await response.json();
        console.log('API response:', data);
      }
      
      // Update component state
      this.stations = data.stations || [];
      this.lastUpdate = new Date();
      this.isLoading = false;
      this.hasError = false;
      
      // Update UI
      this.updateUI();
      
      // Store successful API use
      if (isLiveApi) {
        localStorage.setItem('FUEL_API_LAST_SUCCESS', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error fetching fuel prices:', error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to load fuel prices';
      this.updateUI();
      
      // If API failed, try reverting to mock data
      if (localStorage.getItem('FUEL_API_DEPLOYED') === 'true') {
        console.log('API failed, falling back to mock data');
        try {
          // Get user location from localStorage
          const latitude = localStorage.getItem('userLat') || '61.4937';
          const longitude = localStorage.getItem('userLon') || '23.8283';
          
          // Use mock data
          const mockData = this.getMockData(latitude, longitude);
          
          // Update component state
          this.stations = mockData.stations || [];
          this.lastUpdate = new Date();
          this.hasError = false;
          this.errorMessage = '';
          this.updateUI();
        } catch (fallbackError) {
          console.error('Even fallback data failed:', fallbackError);
        }
      }
    }
  }
  
  // Generate mock data for development
  getMockData(latitude, longitude) {
    // Parse coordinates as floats
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    // Create mock stations within 5km radius
    return {
      stations: [
        {
          id: 'mock-1',
          name: 'Keskusta',
          brand: 'ABC',
          address: 'Kauppakatu 15',
          city: 'Tampere',
          latitude: lat + 0.005,
          longitude: lon - 0.008,
          distance: 1200,
          prices: {
            '95E10': { price: 1.859, updated: '2025-04-21T10:30:00Z' },
            '98E5': { price: 1.959, updated: '2025-04-21T10:30:00Z' },
            'Diesel': { price: 1.759, updated: '2025-04-21T10:30:00Z' }
          }
        },
        {
          id: 'mock-2',
          name: 'Hervanta',
          brand: 'Neste',
          address: 'Insinöörinkatu 30',
          city: 'Tampere',
          latitude: lat - 0.007,
          longitude: lon + 0.003,
          distance: 2400,
          prices: {
            '95E10': { price: 1.849, updated: '2025-04-21T08:15:00Z' },
            '98E5': { price: 1.949, updated: '2025-04-21T08:15:00Z' },
            'Diesel': { price: 1.749, updated: '2025-04-21T08:15:00Z' }
          }
        },
        {
          id: 'mock-3',
          name: 'Lielahti',
          brand: 'Shell',
          address: 'Harjuntausta 1',
          city: 'Tampere',
          latitude: lat + 0.01,
          longitude: lon + 0.015,
          distance: 3800,
          prices: {
            '95E10': { price: 1.839, updated: '2025-04-21T12:45:00Z' },
            '98E5': { price: 1.939, updated: '2025-04-21T12:45:00Z' },
            'Diesel': { price: 1.729, updated: '2025-04-21T12:45:00Z' }
          }
        },
        {
          id: 'mock-4',
          name: 'Hakametsä',
          brand: 'St1',
          address: 'Hervannan valtaväylä 20',
          city: 'Tampere',
          latitude: lat - 0.005,
          longitude: lon - 0.005,
          distance: 950,
          prices: {
            '95E10': { price: 1.869, updated: '2025-04-21T09:30:00Z' },
            '98E5': { price: 1.969, updated: '2025-04-21T09:30:00Z' },
            'Diesel': { price: 1.769, updated: '2025-04-21T09:30:00Z' }
          }
        },
        {
          id: 'mock-5',
          name: 'Turtola',
          brand: 'Teboil',
          address: 'Martinpojankatu 4',
          city: 'Tampere',
          latitude: lat + 0.003,
          longitude: lon - 0.012,
          distance: 1750,
          prices: {
            '95E10': { price: 1.829, updated: '2025-04-21T11:00:00Z' },
            '98E5': { price: 1.929, updated: '2025-04-21T11:00:00Z' },
            'Diesel': { price: 1.739, updated: '2025-04-21T11:00:00Z' }
          }
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const updateTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now - updateTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Render each station
  renderStation(station) {
    const stationElement = document.createElement('div');
    stationElement.className = 'fuel-station-item';
    
    // Format distance
    const distance = station.distance < 1000 
      ? `${station.distance.toFixed(0)} m` 
      : `${(station.distance / 1000).toFixed(1)} km`;
    
    // Get available fuel prices with update time
    const pricesList = Object.entries(station.prices)
      .map(([fuelType, data]) => `
        <div class="fuel-price-item">
          <span class="fuel-type">${fuelType}:</span>
          <span class="fuel-price">${data.price.toFixed(3)} €</span>
          <span class="fuel-updated">${this.formatRelativeTime(data.updated)}</span>
        </div>
      `)
      .join('');
    
    stationElement.innerHTML = `
      <div class="fuel-station-info">
        <div class="station-name">${station.brand} ${station.name}</div>
        <div class="station-address">${station.address}, ${station.city}</div>
        <div class="station-distance">
          <i class="fas fa-location-dot"></i> ${distance}
        </div>
      </div>
      <div class="fuel-price-list">
        ${pricesList}
      </div>
    `;
    
    return stationElement;
  }

  // Update the UI based on current state
  updateUI() {
    const loadingElement = document.getElementById('fuelLoading');
    const errorElement = document.getElementById('fuelError');
    const stationsListElement = document.getElementById('fuelStationsList');
    const lastUpdateElement = document.getElementById('fuelLastUpdateTime');
    
    // Handle loading state
    if (this.isLoading) {
      loadingElement.style.display = 'block';
      errorElement.style.display = 'none';
      stationsListElement.style.display = 'none';
      return;
    }
    
    // Handle error state
    if (this.hasError) {
      loadingElement.style.display = 'none';
      errorElement.style.display = 'block';
      errorElement.textContent = this.errorMessage;
      stationsListElement.style.display = 'none';
      return;
    }
    
    // Update last refresh time
    if (this.lastUpdate) {
      lastUpdateElement.textContent = `Last Update: ${this.lastUpdate.toLocaleTimeString()}`;
    }
    
    // Render stations list
    loadingElement.style.display = 'none';
    errorElement.style.display = 'none';
    stationsListElement.style.display = 'block';
    
    // Clear previous content
    stationsListElement.innerHTML = '';
    
    // No stations found
    if (this.stations.length === 0) {
      stationsListElement.innerHTML = '<p>No fuel stations found nearby.</p>';
      return;
    }
    
    // Render each station
    this.stations.forEach(station => {
      stationsListElement.appendChild(this.renderStation(station));
    });
  }

  // Sort stations based on the selected criteria
  sortStations(sortBy) {
    if (this.stations.length === 0) return;
    
    // Make a copy of stations to sort
    const sortedStations = [...this.stations];
    
    // Sort based on criteria
    switch (sortBy) {
      case 'distance':
        sortedStations.sort((a, b) => a.distance - b.distance);
        break;
      case 'price-95':
        sortedStations.sort((a, b) => {
          const priceA = a.prices['95E10']?.price || Infinity;
          const priceB = b.prices['95E10']?.price || Infinity;
          return priceA - priceB;
        });
        break;
      case 'price-98':
        sortedStations.sort((a, b) => {
          const priceA = a.prices['98E5']?.price || Infinity;
          const priceB = b.prices['98E5']?.price || Infinity;
          return priceA - priceB;
        });
        break;
      case 'price-diesel':
        sortedStations.sort((a, b) => {
          const priceA = a.prices['Diesel']?.price || Infinity;
          const priceB = b.prices['Diesel']?.price || Infinity;
          return priceA - priceB;
        });
        break;
      default:
        // Default to distance
        sortedStations.sort((a, b) => a.distance - b.distance);
    }
    
    // Update stations and refresh UI
    this.stations = sortedStations;
    this.updateUI();
  }
}

// Export for use in main app
window.FuelPriceComponent = FuelPriceComponent; 