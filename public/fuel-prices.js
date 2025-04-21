// Fuel Prices Component

class FuelPriceComponent {
  constructor() {
    this.stations = [];
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = '';
    this.lastUpdate = null;
  }

  // Initialize the component
  init() {
    // Create DOM elements if needed
    this.createDOMElements();
    
    // Add event listeners
    document.getElementById('refreshFuelButton').addEventListener('click', () => this.fetchFuelPrices());
  }

  // Create DOM elements for the fuel prices component
  createDOMElements() {
    const fuelSection = document.createElement('div');
    fuelSection.id = 'fuelPricesContainer';
    fuelSection.className = 'fuel-prices-container';
    fuelSection.innerHTML = `
      <h2>Nearby Fuel Prices</h2>
      <div id="fuelPricesContent">
        <div id="fuelLoading" style="display: none;">Loading fuel prices...</div>
        <div id="fuelError" style="display: none;"></div>
        <div id="fuelStationsList"></div>
      </div>
      <button id="refreshFuelButton" class="fuel-refresh-button">Refresh Fuel Prices</button>
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
      }
      
      .fuel-station-item {
        border-bottom: 1px solid #eee;
        padding: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .fuel-station-info {
        flex-grow: 1;
      }
      
      .station-name {
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      .station-address {
        font-size: 0.9em;
        color: #666;
      }
      
      .fuel-price-list {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      
      .fuel-price-item {
        margin: 2px 0;
        font-size: 0.9em;
      }
      
      .fuel-refresh-button {
        background-color: #4682b4;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
        margin-top: 10px;
        font-size: 14px;
      }
      
      .fuel-refresh-button:hover {
        background-color: #36648b;
      }
      
      #fuelError {
        color: #d9534f;
        font-style: italic;
      }
      
      .station-distance {
        font-size: 0.8em;
        color: #999;
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
      
      // Call the API
      const response = await fetch(`https://API_GATEWAY_URL/prod/fuel-prices?latitude=${latitude}&longitude=${longitude}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update component state
      this.stations = data.stations || [];
      this.lastUpdate = new Date();
      this.isLoading = false;
      this.hasError = false;
      
      // Update UI
      this.updateUI();
    } catch (error) {
      console.error('Error fetching fuel prices:', error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to load fuel prices';
      this.updateUI();
    }
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
      const stationElement = document.createElement('div');
      stationElement.className = 'fuel-station-item';
      
      // Format distance
      const distance = station.distance < 1000 
        ? `${station.distance.toFixed(0)} m` 
        : `${(station.distance / 1000).toFixed(1)} km`;
      
      // Get available fuel prices
      const pricesList = Object.entries(station.prices)
        .map(([fuelType, data]) => `<div class="fuel-price-item">${fuelType}: ${data.price.toFixed(3)} €</div>`)
        .join('');
      
      stationElement.innerHTML = `
        <div class="fuel-station-info">
          <div class="station-name">${station.brand} ${station.name}</div>
          <div class="station-address">${station.address}, ${station.city}</div>
          <div class="station-distance">${distance}</div>
        </div>
        <div class="fuel-price-list">
          ${pricesList}
        </div>
      `;
      
      stationsListElement.appendChild(stationElement);
    });
  }
}

// Export for use in main app
window.FuelPriceComponent = FuelPriceComponent; 