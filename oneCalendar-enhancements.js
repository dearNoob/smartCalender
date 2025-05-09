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

// ========== BANGLADESH PUBLIC HOLIDAYS FUNCTIONALITY ==========

// Function to load Bangladesh public holidays
function loadBangladeshHolidays(year = new Date().getFullYear()) {
    // Ensure calendarSources and events are defined (likely from script.js)
    if (typeof calendarSources === 'undefined' || typeof events === 'undefined') {
        console.error('calendarSources or events is not defined. BD Holidays cannot be loaded.');
        return;
    }

    // Create a holidays source if it doesn't exist
    const holidaySource = calendarSources.find(source => source.id === 'bd-holidays');
    
    if (!holidaySource) {
        // Add Bangladesh holidays calendar source
        calendarSources.push({
            id: 'bd-holidays',
            name: 'Bangladesh Holidays',
            color: 'event-color-4', // Use a distinct color variable if defined
            visible: true,
            type: 'local',
            description: 'Official public holidays in Bangladesh'
        });
        
        // Update the calendar list in sidebar (ensure updateCalendarList is global or passed)
        if (typeof updateCalendarList === 'function') {
            updateCalendarList();
        }
    }
    
    const bdHolidays = [
        // ... (holiday data remains the same) ...
        { title: "New Year's Day", date: `${year}-01-01`, type: "National" },
        { title: "International Mother Language Day", date: `${year}-02-21`, type: "National" },
        { title: "Independence Day", date: `${year}-03-26`, type: "National" },
        { title: "Bengali New Year (Pohela Boishakh)", date: `${year}-04-14`, type: "Cultural" },
        { title: "Labor Day", date: `${year}-05-01`, type: "International" },
        { title: "Buddha Purnima", date: calculateBuddhaPurnima(year), type: "Religious" },
        { title: "Eid-ul-Fitr", date: `${year}-04-10`, type: "Religious", duration: 3 }, // Approximate for 2024/2025
        { title: "Eid-ul-Adha", date: `${year}-06-17`, type: "Religious", duration: 3 }, // Approximate for 2024/2025
        { title: "National Mourning Day", date: `${year}-08-15`, type: "National" },
        { title: "Victory Day", date: `${year}-12-16`, type: "National" },
        { title: "Christmas Day", date: `${year}-12-25`, type: "Religious" }
    ];
    
    bdHolidays.forEach(holiday => {
        const startDate = new Date(holiday.date + "T00:00:00"); // Ensure it's parsed as local time
        const endDate = new Date(startDate);
        if (holiday.duration) {
            endDate.setDate(startDate.getDate() + holiday.duration - 1);
        }
        endDate.setHours(23, 59, 59, 999);
        
        const holidayId = `bd-holiday-${holiday.title.replace(/\s+/g, '-').toLowerCase()}-${year}`;
        const existingEvent = events.find(event => event.id === holidayId);
        
        if (!existingEvent) {
            events.push({
                id: holidayId,
                title: `🇧🇩 ${holiday.title}`,
                startDate: startDate,
                endDate: endDate,
                color: 4, 
                calendar: 'bd-holidays',
                location: 'Bangladesh',
                description: `${holiday.type} holiday in Bangladesh`,
                isHoliday: true,
                notification: 'none',
                repeat: 'yearly' // Holidays are typically yearly
            });
        }
    });
    
    // Update views (ensure these functions are global or passed)
    if (typeof updateCalendarView === 'function') updateCalendarView();
    if (typeof renderMiniCalendar === 'function') renderMiniCalendar();
    if (typeof showAlert === 'function') showAlert('Bangladesh holidays added to calendar', 'success');
}

function calculateBuddhaPurnima(year) {
    // Simplified calculation (Vesak day - typically May full moon)
    // For 2024 it was May 23rd, for 2025 it's May 12th. This needs a proper library for accuracy.
    if (year === 2024) return `${year}-05-23`;
    if (year === 2025) return `${year}-05-12`;
    return `${year}-05-15`; // Generic placeholder
}

function initializeBangladeshHolidays() {
    const calendarActions = document.querySelector('.calendar-actions');
    if (calendarActions) {
        const holidaysBtn = document.createElement('button');
        holidaysBtn.className = 'import-export-btn'; // Use existing class for styling
        holidaysBtn.id = 'bd-holidays-btn';
        holidaysBtn.innerHTML = '<i class="fas fa-flag"></i> Show BD Holidays';
        
        holidaysBtn.addEventListener('click', function() {
            loadBangladeshHolidays(); // Load for current year
        });
        
        calendarActions.prepend(holidaysBtn); // Add to the top of actions
    }
    loadBangladeshHolidays(); // Optionally load by default for the current year
}

// THIS createEventElement function will override the one in script.js if this file is loaded after script.js
// Ensure this is the intended behavior or consolidate the function.
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `event event-color-${event.color}`;
    
    if (event.isHoliday) {
        eventElement.classList.add('holiday-event');
    }
    
    // Ensure formatTime is available
    const startTime = typeof formatTime === 'function' ? formatTime(event.startDate) : event.startDate.toLocaleTimeString();
    const endTime = typeof formatTime === 'function' ? formatTime(event.endDate) : event.endDate.toLocaleTimeString();

    eventElement.textContent = event.title;
    eventElement.title = `${event.title} (${startTime} - ${endTime})`;
    eventElement.setAttribute('data-event-id', event.id);
    
    if (!event.isHoliday) {
        eventElement.draggable = true;
        eventElement.addEventListener('dragstart', function(e) {
            // Ensure draggedEvent is a global variable or properly scoped
            window.draggedEvent = event.id; // Assuming draggedEvent is global
            this.classList.add('dragging');
        });
        eventElement.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    }
    
    eventElement.addEventListener('click', () => {
        // Ensure openEditEventModal is global or passed
        if (typeof openEditEventModal === 'function') {
            openEditEventModal(event.id);
        }
    });
    return eventElement;
}

// THIS deleteEvent function will override the one in script.js
function deleteEvent() {
    // Ensure editingEventId, events, saveEventsToLocalStorage, closeEventModal, 
    // updateCalendarView, renderMiniCalendar, showAlert are available globally or passed.
    if (typeof editingEventId !== 'undefined' && editingEventId !== null) {
        const event = events.find(e => e.id === editingEventId);
        
        if (event && event.isHoliday) {
            if (typeof showAlert === 'function') {
                showAlert('Holiday events cannot be deleted. You can hide them by disabling the Bangladesh Holidays calendar.', 'info');
            }
            return;
        }
        
        if (confirm('Are you sure you want to delete this event?')) {
            window.events = events.filter(e => e.id !== editingEventId); // Modify global events array
            
            if (typeof saveEventsToLocalStorage === 'function') saveEventsToLocalStorage();
            if (typeof closeEventModal === 'function') closeEventModal();
            if (typeof updateCalendarView === 'function') updateCalendarView();
            if (typeof renderMiniCalendar === 'function') renderMiniCalendar();
            if (typeof showAlert === 'function') showAlert('Event deleted successfully', 'success');
        }
    }
}


// ========== NATURAL LANGUAGE EVENT CREATION FUNCTIONALITY ==========

function initializeNaturalLanguageInput() {
    const addEventBtn = document.getElementById('add-event-btn');
    if (addEventBtn && addEventBtn.parentElement) {
        const parentElement = addEventBtn.parentElement;
        const nlEventBtn = document.createElement('button');
        nlEventBtn.className = 'add-event-btn'; // Use existing class for styling
        nlEventBtn.id = 'nl-event-btn';
        nlEventBtn.innerHTML = '<i class="fas fa-magic"></i> Quick Add';
        
        // Insert Quick Add button before the standard Add Event button
        parentElement.insertBefore(nlEventBtn, addEventBtn); 
        
        nlEventBtn.addEventListener('click', openNaturalLanguageModal);
    }
    createNaturalLanguageModal();
}

function createNaturalLanguageModal() {
    if (!document.getElementById('nl-event-modal')) {
        const modalHTML = `
        <div class="modal-backdrop" id="nl-event-modal" style="display: none;">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <div class="modal-title">Quick Add Event</div>
                    <button class="close-btn" id="close-nl-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Type your event in natural language, for example:</p>
                    <ul style="margin-bottom: 15px; color: #666; font-size: 14px; padding-left: 20px;">
                        <li>Meeting with Sarah tomorrow at 3pm</li>
                        <li>Doctor appointment on Friday at 10:30am</li>
                        <li>Lunch with team next Monday at 1pm at Cafe Bistro</li>
                    </ul>
                    <div class="form-group">
                        <input type="text" id="nl-event-input" placeholder="Describe your event..." class="nl-input">
                    </div>
                    <div id="nl-event-preview" class="nl-preview" style="display: none;">
                        </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancel-nl-event">Cancel</button>
                    <button class="btn btn-primary" id="create-nl-event" disabled>Create Event</button>
                </div>
            </div>
        </div>`;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild); // Append the modal-backdrop itself
        
        document.getElementById('close-nl-modal').addEventListener('click', closeNaturalLanguageModal);
        document.getElementById('cancel-nl-event').addEventListener('click', closeNaturalLanguageModal);
        document.getElementById('create-nl-event').addEventListener('click', createEventFromNaturalLanguage);
        
        const nlInput = document.getElementById('nl-event-input');
        nlInput.addEventListener('input', parseNaturalLanguageInput);
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

function openNaturalLanguageModal() {
    const modal = document.getElementById('nl-event-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('nl-event-input').focus();
    }
}

function closeNaturalLanguageModal() {
    const modal = document.getElementById('nl-event-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('nl-event-input').value = '';
        const preview = document.getElementById('nl-event-preview');
        preview.innerHTML = '';
        preview.style.display = 'none'; // Use style.display
        preview.classList.remove('active'); // Keep class removal if it affects other styles
        document.getElementById('create-nl-event').disabled = true;
    }
}

function parseNaturalLanguageInput() {
    const input = document.getElementById('nl-event-input').value.trim();
    const preview = document.getElementById('nl-event-preview');
    const createBtn = document.getElementById('create-nl-event');
    
    preview.innerHTML = '';
    if (input.length < 3) {
        preview.style.display = 'none';
        preview.classList.remove('active');
        createBtn.disabled = true;
        return;
    }
    
    const parsed = parseEventText(input); // Ensure parseEventText is robust
    
    if (parsed.title) {
        let previewHTML = createPreviewField('Title', parsed.title);
        previewHTML += createPreviewField('Date', parsed.date ? (typeof formatFullDate === 'function' ? formatFullDate(parsed.date) : parsed.date.toLocaleDateString()) : 'Today', !parsed.date);
        
        const startTime = parsed.time ? (typeof formatTime === 'function' ? formatTime(parsed.time) : parsed.time.toLocaleTimeString()) : 'Not specified';
        previewHTML += createPreviewField('Time', startTime, !parsed.time);

        if (parsed.time) {
            const endTime = new Date(parsed.time);
            endTime.setHours(endTime.getHours() + 1);
            previewHTML += createPreviewField('End', (typeof formatTime === 'function' ? formatTime(endTime) : endTime.toLocaleTimeString()));
        }
        
        if (parsed.location) previewHTML += createPreviewField('Location', parsed.location);
        previewHTML += createPreviewField('Calendar', parsed.calendar || 'Default (Personal)', !parsed.calendar);
        
        preview.innerHTML = previewHTML;
        preview.style.display = 'block';
        preview.classList.add('active');
        createBtn.disabled = false;
    } else {
        preview.style.display = 'none';
        preview.classList.remove('active');
        createBtn.disabled = true;
    }
}

function createPreviewField(label, value, isUncertain = false) {
    return `
    <div class="preview-field">
        <div class="preview-label">${label}:</div>
        <div class="preview-value ${isUncertain ? 'preview-uncertain' : ''}">${value}</div>
    </div>`;
}

function createEventFromNaturalLanguage() {
    const input = document.getElementById('nl-event-input').value.trim();
    const parsed = parseEventText(input);
    
    if (parsed.title) {
        const startDate = parsed.date || new Date(); // Default to today if no date parsed
        if (parsed.time) {
            startDate.setHours(parsed.time.getHours(), parsed.time.getMinutes(), 0, 0);
        } else { // Default to next upcoming hour or 30-min interval
            const now = new Date();
            startDate.setHours(now.getHours() + 1, (now.getMinutes() < 30 ? 30 : 0), 0, 0);
            if (startDate < now) startDate.setHours(startDate.getHours() + 1); // ensure future time
        }
        
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration
        
        let calendarId = 'personal'; // Default
        if (parsed.calendar && typeof calendarSources !== 'undefined') {
            const matchedCalendar = calendarSources.find(cal => cal.name.toLowerCase() === parsed.calendar.toLowerCase());
            if (matchedCalendar) calendarId = matchedCalendar.id;
        }
        
        const calendarObj = typeof calendarSources !== 'undefined' ? calendarSources.find(cal => cal.id === calendarId) : null;
        let color = calendarObj && calendarObj.color ? parseInt(calendarObj.color.match(/event-color-(\d+)/)[1]) : 2;
        
        // Ensure events array and userSettings are available
        const newId = (typeof events !== 'undefined' && events.length > 0) ? Math.max(...events.map(e => e.id)) + 1 : 1;
        const defaultReminder = (typeof userSettings !== 'undefined' && userSettings.defaultReminder) ? userSettings.defaultReminder : '30';

        const newEvent = {
            id: newId,
            title: parsed.title,
            startDate: startDate,
            endDate: endDate,
            color: color,
            calendar: calendarId,
            location: parsed.location || '',
            description: `Created from: "${input}"`,
            guests: '',
            notification: defaultReminder,
            repeat: 'none'
        };
        
        if (typeof events !== 'undefined') events.push(newEvent);
        
        if (typeof saveEventsToLocalStorage === 'function') saveEventsToLocalStorage();
        closeNaturalLanguageModal();
        if (typeof updateCalendarView === 'function') updateCalendarView();
        if (typeof renderMiniCalendar === 'function') renderMiniCalendar();
        if (typeof showAlert === 'function') showAlert('Event created successfully via Quick Add', 'success');
    }
}

function parseEventText(text) {
    const result = { title: null, date: null, time: null, location: null, calendar: null };
    if (!text) return result;

    let remainingText = text;

    // More robust time parsing
    const timeRegex = /\b(?:at\s+|@)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/i;
    const timeMatch = remainingText.match(timeRegex);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0; // Midnight

        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        result.time = time;
        remainingText = remainingText.replace(timeMatch[0], '').trim();
    }

    // Date parsing (simple keywords)
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (/\btomorrow\b/i.test(remainingText)) {
        result.date = tomorrow;
        remainingText = remainingText.replace(/\btomorrow\b/i, '').trim();
    } else if (/\btoday\b/i.test(remainingText)) {
        result.date = today;
        remainingText = remainingText.replace(/\btoday\b/i, '').trim();
    } else {
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const shortDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        for (let i = 0; i < daysOfWeek.length; i++) {
            const dayRegex = new RegExp(`\\b(next\\s+)?(${daysOfWeek[i]}|${shortDays[i]})\\b`, 'i');
            const dayMatch = remainingText.match(dayRegex);
            if (dayMatch) {
                let targetDate = new Date(today);
                let currentDay = targetDate.getDay();
                let distance = (i - currentDay + 7) % 7;
                if (distance === 0 && !dayMatch[1] && !result.time) { // if it's today and no time, assume next week unless "next" is specified
                     // allow if time is specified for today
                } else if (distance === 0 && !dayMatch[1]) {
                     // it's today
                }
                 else {
                    targetDate.setDate(today.getDate() + distance);
                }

                if (dayMatch[1] || targetDate <= today && !(result.time && targetDate.getTime() === today.getTime())) { // "next" or past/today without specific time implies next week
                    targetDate.setDate(targetDate.getDate() + 7);
                }
                result.date = targetDate;
                remainingText = remainingText.replace(dayMatch[0], '').trim();
                break;
            }
        }
    }
    if (!result.date && result.time) result.date = today; // if time is mentioned but no date, assume today

    // Location parsing: "at [Location Name]" or "in [Location Name]"
    const locationRegex = /\b(?:at|in)\s+((?:[a-zA-Z0-9\s]+)(?:\s+[a-zA-Z0-9\s]+)*)(?=\b|$)/i;
    const locationMatch = remainingText.match(locationRegex);
    if (locationMatch && locationMatch[1]) {
        // Avoid matching parts of date/time expressions like "at 3pm" for location
        const potentialLocation = locationMatch[1].trim();
        if (!potentialLocation.match(/^\d{1,2}([:.]\d{2})?(am|pm)?$/i)) { // check if it's not just a time
             result.location = potentialLocation;
             remainingText = remainingText.replace(locationMatch[0], '').trim();
        }
    }
    
    // Calendar parsing
    if (typeof calendarSources !== 'undefined') {
        for (const cal of calendarSources) {
            const calRegex = new RegExp(`\\b(?:in|on|for)\\s+${cal.name}\\b`, 'i');
            if (calRegex.test(remainingText)) {
                result.calendar = cal.name;
                remainingText = remainingText.replace(calRegex, '').trim();
                break;
            }
        }
    }

    result.title = remainingText.replace(/\s+with\s+[A-Za-z]+/i, '').trim(); // Basic removal of "with [Name]"
    if (!result.title && text) result.title = text; // Fallback to full text if parsing fails

    return result;
}


// ========== INITIALIZATION FUNCTION ==========

// Main initialization function to add all new features
function initializeEnhancedFeatures() {
    document.addEventListener('DOMContentLoaded', function() {
        initializeWeatherForecast();
        initializeBangladeshHolidays();
        initializeNaturalLanguageInput();
        
        console.log('Enhanced features initialized successfully');
    });
}

// Call the initialization function
initializeEnhancedFeatures();