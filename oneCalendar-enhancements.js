
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
    const originalFetchWeather = fetchWeather;
    
    // Override the fetchWeather function
    window.fetchWeather = function() {
        // Call the original function
        originalFetchWeather();
        
        // Add forecast API call
        fetchWeatherForecast();
    };
}

// Fetch weather forecast data
function fetchWeatherForecast() {
    // API key for OpenWeatherMap
    const apiKey = 'd785df9562ae054ceb3b8d3812e0c123';
    
    // Forecast endpoint
    let forecastUrl;
    if (userLocation.lat && userLocation.lon) {
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
            const maxTemp = weatherUnit === 'metric' ? 
                Math.floor(Math.random() * 15) + 15 : // 15-30°C
                Math.floor(Math.random() * 30) + 60;  // 60-90°F
                
            const minTemp = weatherUnit === 'metric' ?
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
    iconElement.className = '';
    iconElement.classList.add('fas');
    
    // Map weather codes to Font Awesome icons
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
    
    if (iconMap[weatherCode]) {
        iconElement.classList.add(iconMap[weatherCode]);
    } else {
        // Default icon if weather code not found
        iconElement.classList.add('fa-cloud');
    }
}

// ========== BANGLADESH PUBLIC HOLIDAYS FUNCTIONALITY ==========

// Function to load Bangladesh public holidays
function loadBangladeshHolidays(year = new Date().getFullYear()) {
    // Create a holidays source if it doesn't exist
    const holidaySource = calendarSources.find(source => source.id === 'bd-holidays');
    
    if (!holidaySource) {
        // Add Bangladesh holidays calendar source
        calendarSources.push({
            id: 'bd-holidays',
            name: 'Bangladesh Holidays',
            color: 'event-color-4',
            visible: true,
            type: 'local',
            description: 'Official public holidays in Bangladesh'
        });
        
        // Update the calendar list in sidebar
        updateCalendarList();
    }
    
    // Bangladesh holidays for the year (dates vary by year)
    // This is a static list for demonstration - in production, you should fetch from an API
    const bdHolidays = [
        {
            title: "New Year's Day",
            date: `${year}-01-01`,
            type: "National"
        },
        {
            title: "International Mother Language Day",
            date: `${year}-02-21`,
            type: "National"
        },
        {
            title: "Independence Day",
            date: `${year}-03-26`,
            type: "National"
        },
        {
            title: "Bengali New Year (Pohela Boishakh)",
            date: `${year}-04-14`, // Date may vary slightly
            type: "Cultural"
        },
        {
            title: "Labor Day",
            date: `${year}-05-01`,
            type: "International"
        },
        {
            title: "Buddha Purnima",
            date: calculateBuddhaPurnima(year), // Function to calculate date
            type: "Religious"
        },
        {
            title: "Eid-ul-Fitr", 
            // For Eid and other Islamic holidays, dates vary based on lunar calendar
            // Using placeholder dates for example
            date: `${year}-05-25`, 
            type: "Religious",
            duration: 3 // Multi-day holiday
        },
        {
            title: "Eid-ul-Adha",
            date: `${year}-07-31`,
            type: "Religious",
            duration: 3 // Multi-day holiday
        },
        {
            title: "National Mourning Day",
            date: `${year}-08-15`,
            type: "National"
        },
        {
            title: "Victory Day",
            date: `${year}-12-16`,
            type: "National"
        },
        {
            title: "Christmas Day",
            date: `${year}-12-25`,
            type: "Religious"
        }
    ];
    
    // Create events for each holiday
    bdHolidays.forEach(holiday => {
        const startDate = new Date(holiday.date);
        
        // Create end date (either same day or multi-day)
        const endDate = new Date(startDate);
        if (holiday.duration) {
            endDate.setDate(startDate.getDate() + holiday.duration - 1);
        }
        
        // Set time to full day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        // Create a unique ID for the holiday
        const holidayId = `bd-holiday-${holiday.title.replace(/\s+/g, '-').toLowerCase()}-${year}`;
        
        // Check if this holiday already exists
        const existingEvent = events.find(event => event.id === holidayId);
        
        if (!existingEvent) {
            // Add the holiday as an event
            events.push({
                id: holidayId,
                title: `🇧🇩 ${holiday.title}`,
                startDate: startDate,
                endDate: endDate,
                color: 4, // Using event-color-4 (gold/orange)
                calendar: 'bd-holidays',
                location: 'Bangladesh',
                description: `${holiday.type} holiday in Bangladesh`,
                isHoliday: true,
                notification: 'none',
                repeat: 'yearly'
            });
        }
    });
    
    // Update views to show holidays
    updateCalendarView();
    renderMiniCalendar();
    
    // Show confirmation
    showAlert('Bangladesh holidays added to calendar', 'success');
}

// Helper function to calculate Buddha Purnima date (simplified)
// In a real app, you'd use a more accurate astronomical calculation or API
function calculateBuddhaPurnima(year) {
    // This is a simplified calculation - Buddha Purnima is usually in May
    // Actual date determination would require lunar calendar calculations
    return `${year}-05-15`;
}

// Function to initialize holiday integration
function initializeBangladeshHolidays() {
    // Add a button to the sidebar calendar actions
    const calendarActions = document.querySelector('.calendar-actions');
    
    if (calendarActions) {
        const holidaysBtn = document.createElement('button');
        holidaysBtn.className = 'import-export-btn';
        holidaysBtn.id = 'bd-holidays-btn';
        holidaysBtn.innerHTML = '<i class="fas fa-flag"></i> Show BD Holidays';
        
        holidaysBtn.addEventListener('click', function() {
            loadBangladeshHolidays();
        });
        
        calendarActions.prepend(holidaysBtn);
    }
    
    // Automatically load current year holidays
    loadBangladeshHolidays();
}

// Modified createEventElement function to display holidays with special styling
// Note: This should replace your existing createEventElement function
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `event event-color-${event.color}`;
    
    // Add holiday-specific styling
    if (event.isHoliday) {
        eventElement.classList.add('holiday-event');
    }
    
    eventElement.textContent = event.title;
    eventElement.title = `${event.title} (${formatTime(event.startDate)} - ${formatTime(event.endDate)})`;
    eventElement.setAttribute('data-event-id', event.id);
    
    // Make events draggable (except holidays)
    if (!event.isHoliday) {
        eventElement.draggable = true;
        
        eventElement.addEventListener('dragstart', function(e) {
            draggedEvent = event.id;
            this.classList.add('dragging');
        });
        
        eventElement.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    }
    
    // Add click event to open event details
    eventElement.addEventListener('click', () => {
        openEditEventModal(event.id);
    });
    
    return eventElement;
}

// Prevent users from deleting holiday events
// Note: This should replace your existing deleteEvent function
function deleteEvent() {
    if (editingEventId !== null) {
        const event = events.find(e => e.id === editingEventId);
        
        // Check if it's a holiday event
        if (event && event.isHoliday) {
            showAlert('Holiday events cannot be deleted. You can hide them by disabling the Bangladesh Holidays calendar.', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to delete this event?')) {
            events = events.filter(e => e.id !== editingEventId);
            
            // Save events to localStorage
            saveEventsToLocalStorage();
            
            closeEventModal();
            updateCalendarView();
            renderMiniCalendar();
            
            showAlert('Event deleted successfully', 'success');
        }
    }
}

// ========== NATURAL LANGUAGE EVENT CREATION FUNCTIONALITY ==========

// Initialize the natural language input functionality
function initializeNaturalLanguageInput() {
    // Add a new button to the header next to the regular add event button
    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn) {
        const parentElement = addEventBtn.parentElement;
        
        const nlEventBtn = document.createElement('button');
        nlEventBtn.className = 'add-event-btn';
        nlEventBtn.id = 'nl-event-btn';
        nlEventBtn.innerHTML = '<i class="fas fa-magic"></i> Quick Add';
        
        parentElement.insertBefore(nlEventBtn, addEventBtn);
        
        // Add click event to open natural language modal
        nlEventBtn.addEventListener('click', openNaturalLanguageModal);
    }
    
    // Create the natural language input modal
    createNaturalLanguageModal();
}

// Create the natural language modal
function createNaturalLanguageModal() {
    // Create modal element if it doesn't exist
    if (!document.getElementById('nl-event-modal')) {
        const modalHTML = `
        <div class="modal-backdrop" id="nl-event-modal">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <div class="modal-title">Quick Add Event</div>
                    <button class="close-btn" id="close-nl-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Type your event in natural language, for example:</p>
                    <ul style="margin-bottom: 15px; color: #666; font-size: 14px;">
                        <li>Meeting with Sarah tomorrow at 3pm</li>
                        <li>Doctor appointment on Friday at 10:30am</li>
                        <li>Lunch with team next Monday at 1pm at Cafe Bistro</li>
                    </ul>
                    <div class="form-group">
                        <input type="text" id="nl-event-input" placeholder="Describe your event..." class="nl-input">
                    </div>
                    <div id="nl-event-preview" class="nl-preview">
                        <!-- Preview will be shown here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-nl-event">Cancel</button>
                    <button class="btn btn-primary" id="create-nl-event" disabled>Create Event</button>
                </div>
            </div>
        </div>
        `;
        
        // Add the modal to the body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstChild);
        
        // Add event listeners
        document.getElementById('close-nl-modal').addEventListener('click', closeNaturalLanguageModal);
        document.getElementById('cancel-nl-event').addEventListener('click', closeNaturalLanguageModal);
        document.getElementById('create-nl-event').addEventListener('click', createEventFromNaturalLanguage);
        
        // Add input event listener for real-time parsing
        const nlInput = document.getElementById('nl-event-input');
        nlInput.addEventListener('input', parseNaturalLanguageInput);
        
        // Add enter key listener
        nlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const createBtn = document.getElementById('create-nl-event');
                if (!createBtn.disabled) {
                    createEventFromNaturalLanguage();
                }
            }
        });
    }
}

// Open the natural language modal
function openNaturalLanguageModal() {
    document.getElementById('nl-event-modal').style.display = 'flex';
    document.getElementById('nl-event-input').focus();
}

// Close the natural language modal
function closeNaturalLanguageModal() {
    document.getElementById('nl-event-modal').style.display = 'none';
    document.getElementById('nl-event-input').value = '';
    document.getElementById('nl-event-preview').innerHTML = '';
    document.getElementById('nl-event-preview').classList.remove('active');
    document.getElementById('create-nl-event').disabled = true;
}

// Parse natural language input and show preview
function parseNaturalLanguageInput() {
    const input = document.getElementById('nl-event-input').value.trim();
    const preview = document.getElementById('nl-event-preview');
    const createBtn = document.getElementById('create-nl-event');
    
    // Reset preview
    preview.innerHTML = '';
    
    // If input is too short, hide preview
    if (input.length < 3) {
        preview.classList.remove('active');
        createBtn.disabled = true;
        return;
    }
    
    // Parse the input
    const parsed = parseEventText(input);
    
    // If we got a valid title at minimum, show preview
    if (parsed.title) {
        // Create preview HTML
        let previewHTML = '';
        
        // Title field
        previewHTML += createPreviewField('Title', parsed.title);
        
        // Date field
        if (parsed.date) {
            previewHTML += createPreviewField('Date', formatFullDate(parsed.date));
        } else {
            previewHTML += createPreviewField('Date', 'Today', true);
        }
        
        // Time field
        if (parsed.time) {
            const timeStr = formatTime(parsed.time);
            previewHTML += createPreviewField('Time', timeStr);
            
            // End time (default to 1 hour later)
            const endTime = new Date(parsed.time);
            endTime.setHours(endTime.getHours() + 1);
            previewHTML += createPreviewField('End', formatTime(endTime));
        } else {
            previewHTML += createPreviewField('Time', 'Not specified', true);
        }
        
        // Location field
        if (parsed.location) {
            previewHTML += createPreviewField('Location', parsed.location);
        }
        
        // Calendar field
        if (parsed.calendar) {
            previewHTML += createPreviewField('Calendar', parsed.calendar);
        } else {
            previewHTML += createPreviewField('Calendar', 'Default (Personal)', true);
        }
        
        // Update preview and enable create button
        preview.innerHTML = previewHTML;
        preview.classList.add('active');
        createBtn.disabled = false;
    } else {
        preview.classList.remove('active');
        createBtn.disabled = true;
    }
}

// Helper to create preview field HTML
function createPreviewField(label, value, isUncertain = false) {
    return `
    <div class="preview-field">
        <div class="preview-label">${label}:</div>
        <div class="preview-value ${isUncertain ? 'preview-uncertain' : ''}">${value}</div>
    </div>
    `;
}

// Create event from the parsed natural language
function createEventFromNaturalLanguage() {
    const input = document.getElementById('nl-event-input').value.trim();
    const parsed = parseEventText(input);
    
    if (parsed.title) {
        // Determine start date/time
        const startDate = parsed.date || new Date();
        
        if (parsed.time) {
            // If time was specified, use it
            startDate.setHours(parsed.time.getHours(), parsed.time.getMinutes(), 0, 0);
        } else {
            // Default to current time + 1 hour, rounded to nearest half hour
            const now = new Date();
            const minutes = now.getMinutes();
            const roundedMinutes = minutes < 30 ? 30 : 0;
            const hours = minutes < 30 ? now.getHours() : now.getHours() + 1;
            
            startDate.setHours(hours, roundedMinutes, 0, 0);
        }
        
        // Create end date (1 hour after start by default)
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
        
        // Determine calendar
        let calendar = 'personal'; // Default calendar
        if (parsed.calendar) {
            // Find matching calendar
            const matchedCalendar = calendarSources.find(cal => 
                cal.name.toLowerCase() === parsed.calendar.toLowerCase()
            );
            
            if (matchedCalendar) {
                calendar = matchedCalendar.id;
            }
        }
        
        // Determine color based on calendar
        const calendarObj = calendarSources.find(cal => cal.id === calendar);
        let color = 2; // Default to personal color
        
        if (calendarObj && calendarObj.color) {
            // Extract color number from "event-color-X"
            const colorMatch = calendarObj.color.match(/event-color-(\d+)/);
            if (colorMatch && colorMatch[1]) {
                color = parseInt(colorMatch[1]);
            }
        }
        
        // Create new event
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        
        const newEvent = {
            id: newId,
            title: parsed.title,
            startDate: startDate,
            endDate: endDate,
            color: color,
            calendar: calendar,
            location: parsed.location || '',
            description: `Created from: "${input}"`,
            guests: '',
            notification: userSettings.defaultReminder || '30',
            repeat: 'none'
        };
        
        // Add event
        events.push(newEvent);
        
        // Save to localStorage
        saveEventsToLocalStorage();
        
        // Close modal and show confirmation
        closeNaturalLanguageModal();
        updateCalendarView();
        renderMiniCalendar();
        
        showAlert('Event created successfully', 'success');
    }
}

// Parse event text to extract title, date, time, location, and calendar
function parseEventText(text) {
    const result = {
        title: null,
        date: null,
        time: null,
        location: null,
        calendar: null
    };
    
    // If empty, return empty result
    if (!text) return result;
    
    // Regular expressions for parsing
    const timeRegex = /at\s+(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?/i;
    const dateRegex = /(?:on|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|tomorrow)/i;
    const locationRegex = /(?:at|in)\s+([^,]+)(?:,|$)/i;
    const calendarRegex = /(?:in|for|on)\s+(work|personal|family)/i;
    
    // Extract time if specified
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        let isPM = false;
        
        // Check if AM/PM was specified
        if (timeMatch[3]) {
            isPM = timeMatch[3].toLowerCase() === 'pm';
        } else {
            // If not specified, assume PM for hours 1-11, AM for 12
            isPM = hours >= 1 && hours < 12;
        }
        
        // Create time
        const time = new Date();
        time.setHours(isPM && hours < 12 ? hours + 12 : hours);
        time.setMinutes(minutes);
        time.setSeconds(0);
        time.setMilliseconds(0);
        
        result.time = time;
    }
    
    // Extract date if specified
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
        const day = dateMatch[1].toLowerCase();
        const today = new Date();
        
        if (day === 'tomorrow') {
            // Set date to tomorrow
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            result.date = tomorrow;
        } else {
            // Get day of week (0 = Sunday, 1 = Monday, etc.)
            const daysOfWeek = {
                'sunday': 0, 'sun': 0,
                'monday': 1, 'mon': 1,
                'tuesday': 2, 'tue': 2,
                'wednesday': 3, 'wed': 3,
                'thursday': 4, 'thu': 4,
                'friday': 5, 'fri': 5,
                'saturday': 6, 'sat': 6
            };
            
            const targetDay = daysOfWeek[day];
            const currentDay = today.getDay();
            
            // Calculate days to add
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7; // Next week if today or past
            
            // If "next" was explicitly specified, add a week
            if (dateMatch[0].startsWith('next')) {
                daysToAdd += 7;
            }
            
            // Set date
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysToAdd);
            result.date = targetDate;
        }
    }
    
    // Extract location if specified
    const locationMatch = text.match(locationRegex);
    if (locationMatch && locationMatch[1]) {
        result.location = locationMatch[1].trim();
    }
    
    // Extract calendar if specified
    const calendarMatch = text.match(calendarRegex);
    if (calendarMatch && calendarMatch[1]) {
        result.calendar = calendarMatch[1].trim();
    }
    
    // Title is everything before the first preposition
    // But if no prepositions, use entire text
    const prepositions = ['at', 'on', 'in', 'for', 'with'];
    let titleEnd = text.length;
    
    for (const prep of prepositions) {
        const prepIndex = text.toLowerCase().indexOf(' ' + prep + ' ');
        if (prepIndex !== -1 && prepIndex < titleEnd) {
            titleEnd = prepIndex;
        }
    }
    
    result.title = text.substring(0, titleEnd).trim();
    
    return result;
}

// ========== INITIALIZATION FUNCTION ==========

// Main initialization function to add all new features
function initializeEnhancedFeatures() {
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize weather forecast
        initializeWeatherForecast();
        
        // Initialize Bangladesh holidays
        initializeBangladeshHolidays();
        
        // Initialize natural language input
        initializeNaturalLanguageInput();
        
        console.log('Enhanced features initialized successfully');
    });
}

// Call the initialization function
initializeEnhancedFeatures();