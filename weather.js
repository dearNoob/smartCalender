// ========== WEATHER FUNCTIONALITY ==========

// Weather and location-related global variables
// These should be declared in your main script.js file but referenced here
// let userLocation = { 
//     city: 'London', 
//     lat: 51.5074, 
//     lon: -0.1278 
// };
// let weatherUnit = 'metric';

// Initialize weather location edit functionality
function initializeWeatherLocationEdit() {
    const locationElement = document.getElementById('weather-location');
    const locationEditContainer = document.getElementById('weather-location-edit');
    const locationInput = document.getElementById('weather-location-input');
    const locationSubmit = document.getElementById('weather-location-submit');
    
    if (!locationElement || !locationEditContainer || !locationInput || !locationSubmit) {
        console.error('Weather location edit elements not found');
        return;
    }
    
    // Show edit input when clicking on location
    locationElement.addEventListener('click', function() {
        // Pre-fill input with current location
        locationInput.value = userLocation.city;
        // Show edit container
        locationEditContainer.classList.add('active');
        // Focus on input
        locationInput.focus();
    });
    
    // Handle location submission
    locationSubmit.addEventListener('click', submitWeatherLocation);
    
    // Allow pressing Enter to submit
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitWeatherLocation();
        }
    });
    
    // Hide edit container when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.weather-location-container') && 
            locationEditContainer.classList.contains('active')) {
            locationEditContainer.classList.remove('active');
        }
    });
}

// Submit location and update weather
function submitWeatherLocation() {
    const locationInput = document.getElementById('weather-location-input');
    const locationEditContainer = document.getElementById('weather-location-edit');
    const newLocation = locationInput.value.trim();
    
    if (newLocation) {
        // Update user location
        userLocation.city = newLocation;
        // Reset coordinates to ensure city name is used in API call
        userLocation.lat = null;
        userLocation.lon = null;
        
        // Update display
        document.getElementById('weather-location').textContent = newLocation;
        
        // Hide edit container
        locationEditContainer.classList.remove('active');
        
        // Fetch weather with the new location
        fetchWeather();
        
        // Save to user settings
        userSettings.location = userLocation;
        localStorage.setItem('oneCalendarSettings', JSON.stringify(userSettings));
        
        // Show confirmation
        showAlert(`Weather location updated to ${newLocation}`, 'success');
    } else {
        showAlert('Please enter a valid location', 'error');
    }
}

// Fetch weather data
function fetchWeather() {
    // Add a spinning effect to the refresh button while loading
    const refreshButton = document.getElementById('refresh-weather');
    refreshButton.style.transform = 'rotate(360deg)';
    refreshButton.disabled = true;
    
    // Weather loading state
    document.querySelector('.weather-temp').textContent = '--°C';
    document.querySelector('.weather-desc').textContent = 'Fetching weather...';
    document.querySelector('.weather-humidity').textContent = 'Humidity --%';
    document.querySelector('.weather-wind').textContent = 'Wind -- km/h';
    
    // API key for OpenWeatherMap
    const apiKey = 'd785df9562ae054ceb3b8d3812e0c123';
    
    // Make the actual API call to OpenWeatherMap
    let apiUrl;
    if (userLocation.lat && userLocation.lon) {
        // If we have coordinates, use them
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&units=${weatherUnit}&appid=${apiKey}`;
    } else {
        // Otherwise use city name
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(userLocation.city)}&units=${weatherUnit}&appid=${apiKey}`;
    }
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Store latitude and longitude for future use
            if (data.coord) {
                userLocation.lat = data.coord.lat;
                userLocation.lon = data.coord.lon;
            }
            
            // Log the complete weather data to ensure humidity and wind are present
            console.log('Weather data received:', data);
            
            updateWeatherDisplay(data);
            refreshButton.style.transform = 'none';
            refreshButton.disabled = false;
            
            // Show success message
            showAlert('Weather updated successfully', 'success');
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            document.querySelector('.weather-temp').textContent = '--';
            document.querySelector('.weather-desc').textContent = 'Weather unavailable';
            document.querySelector('.weather-humidity').textContent = 'Humidity --%';
            document.querySelector('.weather-wind').textContent = 'Wind -- km/h';
            refreshButton.style.transform = 'none';
            refreshButton.disabled = false;
            
            // Show error message
            showAlert('Could not fetch weather data. Please try again later.', 'error');
            
            // Fall back to simulated weather as a backup
            const weatherData = simulateWeatherData(userLocation, weatherUnit);
            updateWeatherDisplay(weatherData);
        });
}

// Updated function to display humidity and wind data
function updateWeatherDisplay(data) {
    const locationElement = document.querySelector('.weather-location');
    const tempElement = document.querySelector('.weather-temp');
    const descElement = document.querySelector('.weather-desc');
    const iconElement = document.querySelector('.weather-icon i');
    const humidityElement = document.querySelector('.weather-humidity');
    const windElement = document.querySelector('.weather-wind');
    
    // Update location
    locationElement.textContent = data.name;
    
    // Update temperature with unit
    const tempUnit = weatherUnit === 'metric' ? '°C' : '°F';
    tempElement.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    
    // Update humidity (make sure the element exists)
    if (humidityElement && data.main && data.main.humidity !== undefined) {
        humidityElement.textContent = `Humidity ${data.main.humidity}%`;
        humidityElement.style.display = 'block'; // Make sure it's visible
    }
    
    // Update wind (make sure the element exists)
    if (windElement && data.wind && data.wind.speed !== undefined) {
        const windSpeedUnit = weatherUnit === 'metric' ? 'm/s' : 'mph';
        windElement.textContent = `Wind ${Math.round(data.wind.speed)} ${windSpeedUnit}`;
        windElement.style.display = 'block'; // Make sure it's visible
    }
    
    // Update description
    if (data.weather && data.weather.length > 0) {
        descElement.textContent = data.weather[0].description.charAt(0).toUpperCase() + 
                                data.weather[0].description.slice(1);
        
        // Update icon
        iconElement.className = '';
        iconElement.classList.add('fas');
        
        // Map OpenWeatherMap icon codes to Font Awesome icons
        const iconMap = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud',
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-showers-heavy',
            '09n': 'fa-cloud-showers-heavy',
            '10d': 'fa-cloud-rain',
            '10n': 'fa-cloud-rain',
            '11d': 'fa-bolt',
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog'
        };
        
        if (data.weather[0].icon && iconMap[data.weather[0].icon]) {
            iconElement.classList.add(iconMap[data.weather[0].icon]);
        } else if (data.weather[0].icon && data.weather[0].icon.startsWith('fa-')) {
            // If using the simulation as fallback
            iconElement.classList.add(data.weather[0].icon);
        } else {
            // Default icon if no match
            iconElement.classList.add('fa-cloud');
        }
    } else {
        // Handle case where weather data might be incomplete
        descElement.textContent = 'Weather information unavailable';
        iconElement.className = 'fas fa-question-circle';
    }
    
    // Update the weather location in user settings
    if (data.name && data.name !== userLocation.city) {
        userLocation.city = data.name;
        userSettings.location = userLocation;
        // Update the location input if visible
        const locationInput = document.getElementById('location-input');
        if (locationInput) {
            locationInput.value = data.name;
        }
    }
}

// Detect user location for weather
function detectUserLocation() {
    if (navigator.geolocation) {
        document.getElementById('detect-location').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Use OpenWeatherMap API for reverse geocoding to get city name
                const apiKey = 'd785df9562ae054ceb3b8d3812e0c123';
                const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
                
                fetch(reverseGeocodeUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Geocoding API error');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data && data.length > 0) {
                            const cityName = data[0].name;
                            
                            userLocation = {
                                city: cityName,
                                lat: lat,
                                lon: lon
                            };
                            
                            document.getElementById('location-input').value = cityName;
                            document.getElementById('detect-location').innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                            
                            // Save to settings
                            userSettings.location = userLocation;
                            localStorage.setItem('oneCalendarSettings', JSON.stringify(userSettings));
                            
                            // Fetch weather with new location
                            fetchWeather();
                            
                            showAlert('Location detected successfully', 'success');
                        } else {
                            throw new Error('No location data found');
                        }
                    })
                    .catch(error => {
                        console.error('Error getting location name:', error);
                        document.getElementById('detect-location').innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                        
                        // If reverse geocoding fails, still use the coordinates for weather
                        userLocation = {
                            city: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
                            lat: lat,
                            lon: lon
                        };
                        
                        document.getElementById('location-input').value = userLocation.city;
                        
                        // Save to settings
                        userSettings.location = userLocation;
                        localStorage.setItem('oneCalendarSettings', JSON.stringify(userSettings));
                        
                        // Fetch weather with coordinates
                        fetchWeather();
                        
                        showAlert('Location coordinates detected, but city name unavailable', 'info');
                    });
            },
            error => {
                document.getElementById('detect-location').innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                
                let errorMessage = 'Unable to retrieve your location';
                if (error.code === 1) {
                    errorMessage = 'Location access denied. Please check your browser settings.';
                } else if (error.code === 2) {
                    errorMessage = 'Location unavailable. Please try again later.';
                } else if (error.code === 3) {
                    errorMessage = 'Location request timed out. Please try again.';
                }
                
                showAlert(errorMessage, 'error');
            },
            {
                enableHighAccuracy: true, 
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showAlert('Geolocation is not supported by your browser', 'error');
    }
}

// Simulated weather data as fallback for when API fails
function simulateWeatherData(location, unit) {
    // Generate random but realistic weather data
    const temp = unit === 'metric' ? 
        Math.floor(Math.random() * 30) + 5 : // 5 to 35°C
        Math.floor(Math.random() * 55) + 40; // 40 to 95°F
    
    // Random humidity (30-90%)
    const humidity = Math.floor(Math.random() * 60) + 30;
    
    // Random wind speed (1-15 m/s or 2-30 mph)
    const windSpeed = unit === 'metric' ?
        Math.floor(Math.random() * 14) + 1 :  // 1 to 15 m/s
        Math.floor(Math.random() * 28) + 2;   // 2 to 30 mph
    
    // Weather conditions with matching icons
    const weatherTypes = [
        { description: 'clear sky', icon: 'fa-sun' },
        { description: 'few clouds', icon: 'fa-cloud-sun' },
        { description: 'scattered clouds', icon: 'fa-cloud' },
        { description: 'broken clouds', icon: 'fa-cloud' },
        { description: 'shower rain', icon: 'fa-cloud-showers-heavy' },
        { description: 'rain', icon: 'fa-cloud-rain' },
        { description: 'thunderstorm', icon: 'fa-bolt' },
        { description: 'snow', icon: 'fa-snowflake' },
        { description: 'mist', icon: 'fa-smog' }
    ];
    
    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    // Build simulated weather data object with same structure as API response
    return {
        name: location.city,
        main: {
            temp: temp,
            humidity: humidity
        },
        wind: {
            speed: windSpeed
        },
        weather: [
            {
                description: weather.description,
                icon: weather.icon
            }
        ]
    };
}

// ========== WEATHER FORECAST FUNCTIONALITY ==========

// Toggle forecast visibility
function initializeWeatherForecast() {
    // Set up the toggle button listener
    const weatherToggle = document.getElementById('weather-toggle');
    const weatherForecast = document.getElementById('weather-forecast');
    
    if (weatherToggle && weatherForecast) {
        weatherToggle.addEventListener('click', function() {
            weatherForecast.classList.toggle('active');
            weatherToggle.classList.toggle('active');
        });
    }
    
    // Modify the existing fetchWeather function to fetch forecast data
    // This should be integrated with your existing fetchWeather function
    const originalFetchWeather = window.fetchWeather; // Ensure we are getting the global fetchWeather
    
    // Override the fetchWeather function
    window.fetchWeather = function() {
        // Call the original function
        if (typeof originalFetchWeather === 'function') {
            originalFetchWeather();
        }
        
        // Add forecast API call
        fetchWeatherForecast();
    };
}

// Fetch weather forecast data
function fetchWeatherForecast() {
    // API key for OpenWeatherMap
    const apiKey = 'd785df9562ae054ceb3b8d3812e0c123'; // Consider moving API keys to a config or .env file
    
    // Forecast endpoint
    let forecastUrl;
    // Ensure userLocation and weatherUnit are defined (likely from script.js)
    if (typeof userLocation !== 'undefined' && userLocation.lat && userLocation.lon && typeof weatherUnit !== 'undefined') {
        forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${userLocation.lat}&lon=${userLocation.lon}&exclude=minutely,hourly&units=${weatherUnit}&appid=${apiKey}`;
    } else {
        // If we don't have coordinates, we need to get them first
        // For this demo, we'll use simulated forecast data
        simulateWeatherForecast();
        return;
    }
    
    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather forecast API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Forecast data received:', data);
            
            // Update the forecast display
            if (data.daily && data.daily.length >= 3) {
                updateForecastDisplay(data.daily.slice(1, 4)); // Skip today
            }
        })
        .catch(error => {
            console.error('Error fetching weather forecast:', error);
            
            // Fall back to simulated forecast as a backup
            simulateWeatherForecast();
        });
}

// Update the forecast display with data
function updateForecastDisplay(forecastData) {
    const forecastItems = document.querySelectorAll('.forecast-item');
    
    if (forecastData && forecastData.length >= 3 && forecastItems.length >= 3) {
        for (let i = 0; i < 3; i++) {
            if (forecastData[i]) {
                const item = forecastItems[i];
                const day = item.querySelector('.forecast-day');
                const icon = item.querySelector('.forecast-icon i');
                const temp = item.querySelector('.forecast-temp');
                const desc = item.querySelector('.forecast-desc');
                
                // Set day name
                if (i === 0) {
                    day.textContent = 'Tomorrow';
                } else {
                    const date = new Date();
                    date.setDate(date.getDate() + i + 1);
                    day.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
                }
                
                // Update icon based on weather condition
                updateWeatherIcon(icon, forecastData[i].weather[0].icon);
                
                // Set temperature (high/low)
                temp.textContent = `${Math.round(forecastData[i].temp.max)}°/${Math.round(forecastData[i].temp.min)}°`;
                
                // Set description
                desc.textContent = forecastData[i].weather[0].description;
            }
        }
    }
}

// Simulate weather forecast data for demo purposes
function simulateWeatherForecast() {
    const forecastItems = document.querySelectorAll('.forecast-item');
    
    if (forecastItems.length >= 3) {
        // Weather types for simulation
        const weatherTypes = [
            { desc: 'clear sky', icon: '01d' },
            { desc: 'few clouds', icon: '02d' },
            { desc: 'scattered clouds', icon: '03d' },
            { desc: 'broken clouds', icon: '04d' },
            { desc: 'shower rain', icon: '09d' },
            { desc: 'rain', icon: '10d' },
            { desc: 'thunderstorm', icon: '11d' },
            { desc: 'snow', icon: '13d' },
            { desc: 'mist', icon: '50d' }
        ];
        
        for (let i = 0; i < 3; i++) {
            const item = forecastItems[i];
            const day = item.querySelector('.forecast-day');
            const icon = item.querySelector('.forecast-icon i');
            const temp = item.querySelector('.forecast-temp');
            const desc = item.querySelector('.forecast-desc');
            
            // Set day name
            if (i === 0) {
                day.textContent = 'Tomorrow';
            } else {
                const date = new Date();
                date.setDate(date.getDate() + i + 1);
                day.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
            }
            
            // Random weather type
            const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            
            // Update icon
            updateWeatherIcon(icon, weather.icon);
            
            // Random temperatures based on current unit
            // Ensure weatherUnit is defined
            const currentUnit = typeof weatherUnit !== 'undefined' ? weatherUnit : 'metric';
            const maxTemp = currentUnit === 'metric' ? 
                Math.floor(Math.random() * 15) + 15 : // 15-30°C
                Math.floor(Math.random() * 30) + 60;  // 60-90°F
                
            const minTemp = currentUnit === 'metric' ?
                maxTemp - Math.floor(Math.random() * 8) - 3 : // 3-10° cooler
                maxTemp - Math.floor(Math.random() * 15) - 5; // 5-20° cooler
            
            // Set temperature and description
            temp.textContent = `${maxTemp}°/${minTemp}°`;
            desc.textContent = weather.desc;
        }
    }
}

// Helper function to map weather condition codes to icons
function updateWeatherIcon(iconElement, weatherCode) {
    // Clear existing classes except "fas" or "far"
    iconElement.className = ''; // Reset classes
    iconElement.classList.add('fas'); // Base class for FontAwesome
    
    // Map weather codes to Font Awesome icons
    const iconMap = {
        '01d': 'fa-sun', '01n': 'fa-moon',
        '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud', '03n': 'fa-cloud',
        '04d': 'fa-cloud', '04n': 'fa-cloud', // Typically 'fa-cloud-meatball' or 'fa-smog' for overcast
        '09d': 'fa-cloud-showers-heavy', '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-rain', '10n': 'fa-cloud-rain',
        '11d': 'fa-bolt', '11n': 'fa-bolt', // fa-poo-storm for thunderstorms is also an option
        '13d': 'fa-snowflake', '13n': 'fa-snowflake',
        '50d': 'fa-smog', '50n': 'fa-smog'
    };
    
    if (iconMap[weatherCode]) {
        iconElement.classList.add(iconMap[weatherCode]);
    } else {
        // Default icon if weather code not found
        iconElement.classList.add('fa-question-circle'); // More appropriate default
    }
}

// Function to handle weather component responsiveness
function enhanceWeatherResponsiveness() {
    const weatherDetails = document.querySelector('.weather-details');
    if (!weatherDetails) {
        // console.warn('Weather details element not found for responsive enhancement.');
        return;
    }

    // Check if 'weather-main-info' already exists to prevent re-wrapping
    if (weatherDetails.querySelector('.weather-main-info')) {
        return;
    }

    const weatherTemp = weatherDetails.querySelector('.weather-temp');
    const weatherDesc = weatherDetails.querySelector('.weather-desc');

    if (weatherTemp && weatherDesc) {
        const weatherMainInfo = document.createElement('div');
        weatherMainInfo.className = 'weather-main-info';
        
        // Move temp and desc into the new container
        weatherMainInfo.appendChild(weatherTemp.cloneNode(true)); // Use clones
        weatherMainInfo.appendChild(weatherDesc.cloneNode(true)); // Use clones
        
        // Clear original temp and desc and add the new main info container
        weatherTemp.remove();
        weatherDesc.remove();
        weatherDetails.insertBefore(weatherMainInfo, weatherDetails.firstChild);
    }
}

// Initialize all weather functionality
function initializeWeatherAndClock() {
    // Load saved timezone if any
    const savedTimezone = localStorage.getItem('oneCalendarTimezone');
    if (savedTimezone) {
        selectedTimezone = savedTimezone;
        document.getElementById('timezone-select').value = savedTimezone;
    }
    
    // Start the clock
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
    
    // Set the weather location display
    const locationElement = document.querySelector('.weather-location');
    if (locationElement && userLocation && userLocation.city) {
        locationElement.textContent = userLocation.city;
    }
    
    // Fetch weather on startup
    fetchWeather();
    
    // Initialize weather forecast functionality
    initializeWeatherForecast();
    
    // Initialize weather location edit functionality
    initializeWeatherLocationEdit();
    
    // Initialize responsive weather enhancements
    enhanceWeatherResponsiveness();
    
    // Add event listeners for weather actions
    document.getElementById('refresh-weather').addEventListener('click', fetchWeather);
    document.getElementById('detect-location').addEventListener('click', detectUserLocation);

    // Setup weather unit change listener
    const weatherUnitInputs = document.querySelectorAll('input[name="weather-unit"]');
    if (weatherUnitInputs.length > 0) {
        weatherUnitInputs.forEach(input => {
            input.addEventListener('change', function() {
                if (this.checked) {
                    weatherUnit = this.value;
                    fetchWeather(); // Refresh weather with new unit
                }
            });
        });
    }
}

// Make functions available globally
window.initializeWeatherAndClock = initializeWeatherAndClock;
window.fetchWeather = fetchWeather;
window.detectUserLocation = detectUserLocation;
window.enhanceWeatherResponsiveness = enhanceWeatherResponsiveness;