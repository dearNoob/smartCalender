
// Initialize the app fully with local storage support
function initializeApp() {
    // Load user settings
    const storedSettings = localStorage.getItem('oneCalendarSettings');
    if (storedSettings) {
        try {
            userSettings = JSON.parse(storedSettings);
        } catch (e) {
            console.error('Error parsing user settings:', e);
        }
    }
    
    // Apply dark mode if set in settings
    if (userSettings.defaultDarkMode && !darkMode) {
        toggleTheme();
    }
    
    // Load previously saved calendars
    loadCalendarSourcesFromLocalStorage();
    
    // Load previously saved events
    loadEventsFromLocalStorage();
    
    // If no events were loaded, add sample events
    if (events.length === 0) {
        loadSampleEvents();
    }
    
    // Initialize weather and clock
    initializeWeatherAndClock();

    // Add current time indicator to day and week views
    initializeCurrentTimeIndicator();
    
    // Setup real-time event notifications
    setupEventNotifications();
    
    // Set up periodic sync if online
    if (navigator.onLine) {
        // Sync every 5 minutes
        setInterval(syncWithOnlineCalendars, 5 * 60 * 1000);
    }
    
    // Check if we need to save events
    window.addEventListener('beforeunload', function() {
        saveEventsToLocalStorage();
        saveCalendarSourcesToLocalStorage();
    });
}

// Add current time indicator to day and week views
function initializeCurrentTimeIndicator() {
    // Create the indicator
    function createTimeIndicator() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // Calculate position based on time
        const timePercentage = (hours + minutes/60) / 24 * 100;
        
        // Remove any existing indicators
        document.querySelectorAll('.current-time-indicator').forEach(el => el.remove());
        
        // Add to day view
        const dayView = document.querySelector('.day-view .time-slots');
        if (dayView && currentView === 'day') {
            const indicator = document.createElement('div');
            indicator.className = 'current-time-indicator';
            indicator.style.top = `${timePercentage}%`;
            dayView.appendChild(indicator);
        }
        
        // Add to week view
        const weekView = document.querySelector('.week-view .week-grid');
        if (weekView && currentView === 'week') {
            const todayColumn = Array.from(weekView.querySelectorAll('.week-column')).find(col => {
                const dateStr = col.getAttribute('data-date');
                const colDate = parseDate(dateStr);
                return isSameDay(colDate, now);
            });
            
            if (todayColumn) {
                const indicator = document.createElement('div');
                indicator.className = 'current-time-indicator';
                indicator.style.top = `${timePercentage}%`;
                todayColumn.appendChild(indicator);
            }
        }
    }
    
    // Create initially and update every minute
    createTimeIndicator();
    setInterval(createTimeIndicator, 60000);
}

// Setup real-time event notifications
function setupEventNotifications() {
    // Check for upcoming events every minute
    setInterval(() => {
        const now = new Date();
        
        // Check all events
        events.forEach(event => {
            // Skip if no notification is set
            if (event.notification === 'none') return;
            
            // Calculate notification time
            const notificationTime = new Date(event.startDate);
            notificationTime.setMinutes(notificationTime.getMinutes() - parseInt(event.notification));
            
            // Check if it's time to notify
            const timeDiff = Math.abs(now - notificationTime);
            if (timeDiff < 60000) { // Within the last minute
                showEventNotification(event);
            }
        });
    }, 60000);
}

// Show event notification
function showEventNotification(event) {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications");
        return;
    }
    
    // Show notification if permission is granted
    if (Notification.permission === "granted") {
        const notification = new Notification("Event Reminder", {
            body: `${event.title} - Starts at ${formatTime(event.startDate)}`,
            icon: "/favicon.ico" // You should add a favicon for your app
        });
        
        // Close notification after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);
    } else if (Notification.permission !== "denied") {
        // Request permission if not denied
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showEventNotification(event);
            }
        });
    }
    
    // Also show in-app notification
    showAlert(`Upcoming event: ${event.title} at ${formatTime(event.startDate)}`, 'info');
}

// Function for offline data support
function syncWithOnlineCalendars() {
    // In a real app, this would implement:
    // 1. Check network status
    // 2. If online, sync with connected calendar services using their APIs
    // 3. Handle conflicts between local and remote calendars
    // 4. Update local storage with synced data
    console.log('Syncing with online calendars...');
    
    // Simulate sync process
    const isOnline = navigator.onLine;
    if (isOnline) {
        // Only show alert if we have connected calendars
        const hasConnectedCalendars = calendarSources.some(cal => cal.id.includes('-calendar'));
        
        if (hasConnectedCalendars) {
            showAlert('Syncing calendars...', 'info', 1000); // Short display
            
            // Simulate fetch delay
            setTimeout(() => {
                // Only show success message for actual syncs, not automatic background ones
                if (hasConnectedCalendars) {
                    showAlert('Calendars synced successfully', 'success');
                }
            }, 1500);
        }
    }
}

// Detect network status changes
window.addEventListener('online', () => {
    showAlert('You are back online. Syncing calendars...', 'success');
    syncWithOnlineCalendars();
});

window.addEventListener('offline', () => {
    showAlert('You are now offline. Changes will be saved locally and synced when connectivity returns.', 'info');
});

// Add CSS animation for alert slide out
document.addEventListener('DOMContentLoaded', function() {
    // Add the animation style for alertSlideOut if it doesn't exist yet
    if (!document.querySelector('style#alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes alertSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize the application
    initializeApp();
});// Update the calendar view based on current settings
function updateCalendarView() {
    updateCurrentDateDisplay();
    
    document.querySelectorAll('.calendar-view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show the current view
    if (currentView === 'day') {
        updateDayView();
        document.querySelector('.day-view').classList.remove('hidden');
    } else if (currentView === 'week') {
        updateWeekView();
        document.querySelector('.week-view').classList.remove('hidden');
    } else if (currentView === 'month') {
        updateMonthView();
        document.querySelector('.month-view').classList.remove('hidden');
    } else if (currentView === 'year') {
        updateYearView();
        document.querySelector('.year-view').classList.remove('hidden');
    } else if (currentView === 'list') {
        updateListView();
        document.querySelector('.list-view').classList.remove('hidden');
    }
}

// Update the display of the current date
function updateCurrentDateDisplay() {
    const dateElement = document.getElementById('current-date');
    
    if (currentView === 'day') {
        dateElement.textContent = formatFullDate(currentDate);
        document.getElementById('day-header').textContent = formatFullDate(currentDate);
    } else if (currentView === 'week') {
        const startDate = getStartOfWeek(currentDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        dateElement.textContent = `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}`;
    } else if (currentView === 'month') {
        dateElement.textContent = formatMonthYear(currentDate);
    } else if (currentView === 'year') {
        dateElement.textContent = currentDate.getFullYear().toString();
    } else if (currentView === 'list') {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);
        
        dateElement.textContent = `Next 30 Days`;
    }
}

// Update the day view with events
function updateDayView() {
    // Clear previous events
    document.querySelectorAll('.day-view .slot-content').forEach(slot => {
        slot.innerHTML = '';
    });
    
    // Get visible events for this day
    const dayEvents = events.filter(event => {
        return isSameDay(event.startDate, currentDate) && 
               isCalendarVisible(event.calendar);
    });
    
    // Add events to appropriate time slots
    dayEvents.forEach(event => {
        const hour = event.startDate.getHours();
        const slot = document.querySelector(`.day-view .slot-content[data-hour="${hour}"]`);
        
        if (slot) {
            const eventElement = createEventElement(event);
            slot.appendChild(eventElement);
        }
    });
}

// Update the week view with events
function updateWeekView() {
    // Clear previous events
    document.querySelectorAll('.week-column .slot-content').forEach(slot => {
        slot.innerHTML = '';
    });
    
    // Get visible events for this week
    const startDate = getStartOfWeek(currentDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    
    const weekEvents = events.filter(event => {
        return event.startDate >= startDate && 
               event.startDate < endDate && 
               isCalendarVisible(event.calendar);
    });
    
    // Add events to appropriate time slots
    weekEvents.forEach(event => {
        const date = formatDateAttribute(event.startDate);
        const hour = event.startDate.getHours();
        
        const column = document.querySelector(`.week-column[data-date="${date}"]`);
        if (column) {
            const slot = column.querySelector(`.time-slot[data-hour="${hour}"] .slot-content`);
            
            if (slot) {
                const eventElement = createEventElement(event);
                eventElement.style.width = 'calc(100% - 10px)';
                slot.appendChild(eventElement);
            }
        }
    });
}

// Update the month view with events
function updateMonthView() {
    const monthGrid = document.getElementById('month-grid');
    monthGrid.innerHTML = '';
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get the first day of the week for the first day of the month
    let startDate = new Date(firstDay);
    const dayOfWeek = (startDate.getDay() - userSettings.weekStartsOn + 7) % 7;
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Create 6 weeks (42 days) to ensure we have enough rows
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const day = document.createElement('div');
        day.className = 'month-day';
        
        // Check if day is in current month
        if (date.getMonth() !== currentDate.getMonth()) {
            day.classList.add('other-month');
        }
        
        // Check if day is today
        if (isSameDay(date, new Date())) {
            day.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        
        // Add week number if enabled
        if (userSettings.showWeekNumbers && date.getDay() === userSettings.weekStartsOn) {
            const weekNumber = getWeekNumber(date);
            dayNumber.textContent = `${date.getDate()} (W${weekNumber})`;
        }
        
        day.appendChild(dayNumber);
        day.setAttribute('data-date', formatDateAttribute(date));
        
        // Add drop zone for drag and drop
        day.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (!this.classList.contains('other-month')) {
                this.style.backgroundColor = 'rgba(49, 116, 173, 0.1)';
            }
        });
        
        day.addEventListener('dragleave', function() {
            if (!this.classList.contains('today')) {
                this.style.backgroundColor = '';
            }
        });
        
        day.addEventListener('drop', function(e) {
            e.preventDefault();
            if (!this.classList.contains('today')) {
                this.style.backgroundColor = '';
            }
            
            if (draggedEvent) {
                const dateStr = this.getAttribute('data-date');
                const newDate = parseDate(dateStr);
                
                // Keep the same time, just change the date
                const event = events.find(e => e.id === draggedEvent);
                if (event) {
                    const hour = event.startDate.getHours();
                    const minute = event.startDate.getMinutes();
                    moveEventToNewTime(draggedEvent, newDate, hour, minute);
                }
            }
        });
        
        // Add click event to the day
        day.addEventListener('click', () => {
            currentDate = new Date(date);
            currentView = 'day';
            updateCalendarView();
        });
        
        monthGrid.appendChild(day);
    }
    
    // Add events to the month view
    const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get events for the visible days in the month view
    const visibleStartDate = new Date(startDate);
    const visibleEndDate = new Date(startDate);
    visibleEndDate.setDate(visibleStartDate.getDate() + 42);
    
    const monthEvents = events.filter(event => {
        return event.startDate >= visibleStartDate && 
               event.startDate < visibleEndDate && 
               isCalendarVisible(event.calendar);
    });
    
    // Add events to appropriate days
    monthEvents.forEach(event => {
        const date = formatDateAttribute(event.startDate);
        const day = document.querySelector(`.month-day[data-date="${date}"]`);
        
        if (day) {
            const eventElement = document.createElement('div');
            eventElement.className = `event event-color-${event.color}`;
            eventElement.innerHTML = `${formatTime(event.startDate)} ${event.title}`;
            eventElement.title = event.title;
            eventElement.setAttribute('data-event-id', event.id);
            
            // Make event draggable
            eventElement.draggable = true;
            
            eventElement.addEventListener('dragstart', function(e) {
                draggedEvent = event.id;
                this.classList.add('dragging');
            });
            
            eventElement.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
            
            // Add click event to open event details
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditEventModal(event.id);
            });
            
            day.appendChild(eventElement);
        }
    });
}

// Calculate the week number for a date
function getWeekNumber(date) {
    // Copy date to avoid modifying original
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Update the year view
function updateYearView() {
    const yearView = document.getElementById('year-view');
    yearView.innerHTML = '';
    
    const year = currentDate.getFullYear();
    
    // Create 12 mini months
    for (let month = 0; month < 12; month++) {
        const miniMonth = document.createElement('div');
        miniMonth.className = 'mini-month';
        
        const monthDate = new Date(year, month, 1);
        
        const miniMonthHeader = document.createElement('div');
        miniMonthHeader.className = 'mini-month-header';
        miniMonthHeader.textContent = formatMonthName(monthDate);
        
        const miniMonthGrid = document.createElement('div');
        miniMonthGrid.className = 'mini-month-grid';
        
        // Add day labels (S M T W T F S)
        const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const reorderedDays = [...daysOfWeek];
        
        if (userSettings.weekStartsOn === 1) {
            // If week starts on Monday, rotate the array
            reorderedDays.push(reorderedDays.shift());
        }
        
        reorderedDays.forEach(day => {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'mini-day';
            dayLabel.textContent = day;
            dayLabel.style.fontWeight = 'bold';
            miniMonthGrid.appendChild(dayLabel);
        });
        
        // Get the first day of the month
        const firstDay = new Date(year, month, 1);
        // Get the last day of the month
        const lastDay = new Date(year, month + 1, 0);
        
        // Get the starting day (might be from previous month)
        let startDay = new Date(firstDay);
        const dayOfWeek = (startDay.getDay() - userSettings.weekStartsOn + 7) % 7;
        startDay.setDate(startDay.getDate() - dayOfWeek);
        
        // Create day cells
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDay);
            date.setDate(startDay.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'mini-day';
            dayElement.textContent = date.getDate();
            
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (isSameDay(date, new Date())) {
                dayElement.classList.add('today');
            }
            
            // Add event indicator dot if events exist on this day
            const hasEvents = events.some(event => 
                isSameDay(event.startDate, date) && isCalendarVisible(event.calendar)
            );
            
            if (hasEvents) {
                dayElement.style.fontWeight = 'bold';
                dayElement.style.position = 'relative';
                dayElement.innerHTML += '<div style="position:absolute; bottom:2px; left:50%; transform:translateX(-50%); width:4px; height:4px; background-color:var(--primary-color); border-radius:50%;"></div>';
            }
            
            // Click to switch to month view for this month
            dayElement.addEventListener('click', () => {
                currentDate = new Date(date);
                currentView = 'month';
                updateCalendarView();
            });
            
            miniMonthGrid.appendChild(dayElement);
        }
        
        miniMonth.appendChild(miniMonthHeader);
        miniMonth.appendChild(miniMonthGrid);
        yearView.appendChild(miniMonth);
    }
}

// Update the list view
function updateListView() {
    const listView = document.getElementById('list-view');
    listView.innerHTML = '';
    
    // Get today and 30 days ahead
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    // Get events in this range
    const listEvents = events.filter(event => {
        return event.startDate >= today && 
               event.startDate <= thirtyDaysLater && 
               isCalendarVisible(event.calendar);
    });
    
    // Group events by day
    const eventsByDay = {};
    
    listEvents.forEach(event => {
        const dateKey = formatDateAttribute(event.startDate);
        
        if (!eventsByDay[dateKey]) {
            eventsByDay[dateKey] = [];
        }
        
        eventsByDay[dateKey].push(event);
    });
    
    // Create list items grouped by day
    Object.keys(eventsByDay).sort().forEach(dateKey => {
        const date = parseDate(dateKey);
        const dayEvents = eventsByDay[dateKey];
        
        const listDay = document.createElement('div');
        listDay.className = 'list-day';
        
        const listDayHeader = document.createElement('div');
        listDayHeader.className = 'list-day-header';
        listDayHeader.textContent = formatFullDate(date);
        
        listDay.appendChild(listDayHeader);
        
        // Sort events by time
        dayEvents.sort((a, b) => a.startDate - b.startDate);
        
        // Add events
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event event-color-${event.color}`;
            eventElement.style.display = 'flex';
            eventElement.style.justifyContent = 'space-between';
            eventElement.style.padding = '10px';
            eventElement.style.margin = '5px 0';
            eventElement.style.borderRadius = '4px';
            
            const eventInfo = document.createElement('div');
            eventInfo.innerHTML = `
                <div><strong>${event.title}</strong></div>
                <div>${formatTime(event.startDate)} - ${formatTime(event.endDate)}</div>
                ${event.location ? `<div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ''}
            `;
            
            const calendarLabel = document.createElement('div');
            calendarLabel.textContent = event.calendar;
            calendarLabel.style.fontSize = '12px';
            calendarLabel.style.opacity = '0.7';
            
            eventElement.appendChild(eventInfo);
            eventElement.appendChild(calendarLabel);
            
            // Add click event to open event details
            eventElement.addEventListener('click', () => {
                openEditEventModal(event.id);
            });
            
            listDay.appendChild(eventElement);
        });
        
        listView.appendChild(listDay);
    });
    
    // If no events, show a message
    if (Object.keys(eventsByDay).length === 0) {
        const noEvents = document.createElement('div');
        noEvents.style.padding = '20px';
        noEvents.style.textAlign = 'center';
        noEvents.style.color = '#777';
        noEvents.innerHTML = '<i class="far fa-calendar"></i><br>No events in the next 30 days';
        
        listView.appendChild(noEvents);
    }
}

// Render the mini calendar in the sidebar
function renderMiniCalendar(date = currentDate) {
    const miniCalendarGrid = document.getElementById('mini-calendar-grid');
    const miniCalendarTitle = document.querySelector('.mini-calendar-title');
    
    miniCalendarGrid.innerHTML = '';
    miniCalendarTitle.textContent = formatMonthYear(date);
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Get the first day of the week for the first day of the month
    let startDate = new Date(firstDay);
    const dayOfWeek = (startDate.getDay() - userSettings.weekStartsOn + 7) % 7;
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    // Create day cells (7x6 grid = 42 days)
    for (let i = 0; i < 42; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'mini-calendar-day';
        dayElement.textContent = day.getDate();
        
        // Check if day is in current month
        if (day.getMonth() !== date.getMonth()) {
            dayElement.classList.add('other-month');
        }
        
        // Check if day is today
        if (isSameDay(day, new Date())) {
            dayElement.classList.add('today');
        }
        
        // Check if day is the selected date
        if (isSameDay(day, currentDate)) {
            dayElement.style.backgroundColor = 'rgba(49, 116, 173, 0.2)';
        }
        
        // Check if day has events
        const hasEvents = events.some(event => 
            isSameDay(event.startDate, day) && isCalendarVisible(event.calendar)
        );
        
        if (hasEvents && !dayElement.classList.contains('today')) {
            dayElement.style.fontWeight = 'bold';
        }
        
        // Add click handler to navigate to that day
        dayElement.addEventListener('click', () => {
            currentDate = new Date(day);
            updateCalendarView();
            renderMiniCalendar();
        });
        
        miniCalendarGrid.appendChild(dayElement);
    }
}

// Create an event element for the calendar
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `event event-color-${event.color}`;
    eventElement.textContent = event.title;
    eventElement.title = `${event.title} (${formatTime(event.startDate)} - ${formatTime(event.endDate)})`;
    eventElement.setAttribute('data-event-id', event.id);
    
    // Make events draggable
    eventElement.draggable = true;
    
    eventElement.addEventListener('dragstart', function(e) {
        draggedEvent = event.id;
        this.classList.add('dragging');
    });
    
    eventElement.addEventListener('dragend', function() {
        this.classList.remove('dragging');
    });
    
    // Add click event to open event details
    eventElement.addEventListener('click', () => {
        openEditEventModal(event.id);
    });
    
    return eventElement;
}

// Function to check if a calendar is currently visible
function isCalendarVisible(calendarId) {
    const calendar = calendarSources.find(cal => cal.id === calendarId);
    return calendar ? calendar.visible : true;
}

// Navigation functions
function navigatePrevious() {
    if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() - 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() - 7);
    } else if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (currentView === 'year') {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
    }
    
    updateCalendarView();
    renderMiniCalendar();
}

function navigateNext() {
    if (currentView === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
    } else if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (currentView === 'year') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
    
    updateCalendarView();
    renderMiniCalendar();
}

function navigateToday() {
    currentDate = new Date();
    updateCalendarView();
    renderMiniCalendar();
}

// Event Modal Functions
function openAddEventModal() {
    // Reset form
    document.getElementById('event-form').reset();
    document.getElementById('event-title').value = '';
    
    // Set default dates
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(now.getHours() + 1, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    document.getElementById('event-start-date').value = formatDateTimeForInput(startDate);
    document.getElementById('event-end-date').value = formatDateTimeForInput(endDate);
    
    // Reset color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.color-option[data-color="1"]`).classList.add('selected');
    selectedColor = 1;
    
    // Set modal title and show
    document.querySelector('.modal-title').textContent = 'Add Event';
    document.getElementById('delete-event').classList.add('hidden');
    editingEventId = null;
    
    document.getElementById('event-modal').style.display = 'flex';
}

function openEditEventModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Fill form with event data
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-start-date').value = formatDateTimeForInput(event.startDate);
    document.getElementById('event-end-date').value = formatDateTimeForInput(event.endDate);
    document.getElementById('event-calendar').value = event.calendar;
    document.getElementById('event-location').value = event.location || '';
    document.getElementById('event-description').value = event.description || '';
    document.getElementById('event-guests').value = event.guests || '';
    document.getElementById('event-notification').value = event.notification || 'none';
    document.getElementById('event-repeat').value = event.repeat || 'none';
    
    // Set color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.color-option[data-color="${event.color}"]`).classList.add('selected');
    selectedColor = event.color;
    
    // Set modal title and show delete button
    document.querySelector('.modal-title').textContent = 'Edit Event';
    document.getElementById('delete-event').classList.remove('hidden');
    editingEventId = eventId;
    
    document.getElementById('event-modal').style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('event-modal').style.display = 'none';
}

function saveEvent() {
    const title = document.getElementById('event-title').value;
    if (!title.trim()) {
        showAlert('Please enter an event title', 'error');
        return;
    }
    
    const startDate = new Date(document.getElementById('event-start-date').value);
    const endDate = new Date(document.getElementById('event-end-date').value);
    
    if (startDate >= endDate) {
        showAlert('End date must be after start date', 'error');
        return;
    }
    
    const calendar = document.getElementById('event-calendar').value;
    const location = document.getElementById('event-location').value;
    const description = document.getElementById('event-description').value;
    const guests = document.getElementById('event-guests').value;
    const notification = document.getElementById('event-notification').value;
    const repeat = document.getElementById('event-repeat').value;
    
    if (editingEventId !== null) {
        // Update existing event
        const eventIndex = events.findIndex(e => e.id === editingEventId);
        if (eventIndex !== -1) {
            events[eventIndex] = {
                id: editingEventId,
                title,
                startDate,
                endDate,
                color: selectedColor,
                calendar,
                location,
                description,
                guests,
                notification,
                repeat
            };
            
            showAlert('Event updated successfully', 'success');
        }
    } else {
        // Create new event
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        
        events.push({
            id: newId,
            title,
            startDate,
            endDate,
            color: selectedColor,
            calendar,
            location,
            description,
            guests,
            notification,
            repeat
        });
        
        showAlert('Event added successfully', 'success');
    }
    
    // Save events to localStorage
    saveEventsToLocalStorage();
    
    // Close modal and update view
    closeEventModal();
    updateCalendarView();
    renderMiniCalendar();
}

function deleteEvent() {
    if (editingEventId !== null) {
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

// Calendar Modal Functions
function openAddCalendarModal() {
    // Reset form
    document.getElementById('calendar-form').reset();
    document.getElementById('external-calendar-fields').classList.add('hidden');
    
    // Reset color selection
    document.querySelectorAll('#calendar-form .color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`#calendar-form .color-option[data-color="1"]`).classList.add('selected');
    selectedColor = 1;
    
    document.getElementById('add-calendar-modal').style.display = 'flex';
}

function closeCalendarModal() {
    document.getElementById('add-calendar-modal').style.display = 'none';
}

function saveCalendar() {
    const name = document.getElementById('calendar-name').value;
    if (!name.trim()) {
        showAlert('Please enter a calendar name', 'error');
        return;
    }
    
    const description = document.getElementById('calendar-description').value;
    const type = document.getElementById('calendar-type').value;
    
    // For external calendars, check required fields
    if (type !== 'local') {
        if (type === 'caldav' && !document.getElementById('calendar-url').value) {
            showAlert('Please enter a calendar URL', 'error');
            return;
        }
        
        if ((type === 'caldav' || type === 'exchange') && 
            (!document.getElementById('calendar-username').value || 
             !document.getElementById('calendar-password').value)) {
            showAlert('Please enter username and password', 'error');
            return;
        }
    }
    
    // Create a unique ID for the calendar
    const newId = `calendar-${Date.now()}`;
    
    // Add to calendar sources
    calendarSources.push({
        id: newId,
        name: name,
        color: `event-color-${selectedColor}`,
        visible: true,
        type: type,
        description: description
    });
    
    // Save calendar sources to localStorage
    saveCalendarSourcesToLocalStorage();
    
    // Update the calendar list in the sidebar
    updateCalendarList();
    
    // Close modal and show confirmation
    closeCalendarModal();
    showAlert('Calendar added successfully', 'success');
}

// Account Modal Functions
function openAccountModal() {
    // Set form values based on current settings
    document.getElementById('dark-mode-pref').checked = darkMode;
    document.getElementById('default-view').value = userSettings.defaultView;
    document.getElementById('week-starts').value = userSettings.weekStartsOn;
    document.getElementById('time-format').value = userSettings.timeFormat;
    document.getElementById('show-week-numbers').checked = userSettings.showWeekNumbers;
    document.getElementById('default-reminder').value = userSettings.defaultReminder;
    
    document.getElementById('account-modal').style.display = 'flex';
}

function closeAccountModal() {
    document.getElementById('account-modal').style.display = 'none';
}

// Theme toggle function
function toggleTheme() {
    darkMode = !darkMode;
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Show alert notification
function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alert-container');
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const alertText = document.createElement('div');
    alertText.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        removeAlert(alert);
    });
    
    alert.appendChild(alertText);
    alert.appendChild(closeBtn);
    alertContainer.appendChild(alert);
    
    // Add entrance animation
    alert.style.animation = 'alertSlideIn 0.5s ease';
    
    // Automatically remove after specified duration
    setTimeout(() => {
        removeAlert(alert);
    }, duration);
    
    return alert; // Return the alert element for potential future reference
}

// Helper function to remove alert with animation
function removeAlert(alert) {
    alert.style.animation = 'alertSlideOut 0.5s ease';
    alert.addEventListener('animationend', () => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    });
}

// Helper Functions
function getStartOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day - userSettings.weekStartsOn + 7) % 7;
    result.setDate(result.getDate() - diff);
    return result;
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function formatHour(hour) {
    if (userSettings.timeFormat === '24') {
        return `${hour}:00`;
    } else {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    }
}

function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    if (userSettings.timeFormat === '24') {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
}

function formatDayHeader(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.getDate()}`;
}

function formatFullDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    
    return `${day}, ${month} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatMonthDay(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatMonthYear(date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMonthName(date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
}

function formatDateAttribute(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function formatDateTimeForInput(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
}

// Local Storage Functions
function saveEventsToLocalStorage() {
    try {
        localStorage.setItem('oneCalendarEvents', JSON.stringify(events.map(event => ({
            ...event,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString()
        }))));
    } catch (error) {
        console.error('Error saving events to localStorage:', error);
        showAlert('Could not save events to local storage. Your browser storage might be full.', 'error');
    }
}

function loadEventsFromLocalStorage() {
    const storedEvents = localStorage.getItem('oneCalendarEvents');
    if (storedEvents) {
        try {
            const parsedEvents = JSON.parse(storedEvents);
            
            // Convert string dates back to Date objects
            events = parsedEvents.map(event => ({
                ...event,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate)
            }));
            
            console.log(`Loaded ${events.length} events from local storage`);
            updateCalendarView();
            renderMiniCalendar();
        } catch (e) {
            console.error('Error parsing stored events:', e);
            showAlert('There was an error loading your saved events.', 'error');
        }
    }
}

function saveCalendarSourcesToLocalStorage() {
    try {
        localStorage.setItem('oneCalendarSources', JSON.stringify(calendarSources));
    } catch (error) {
        console.error('Error saving calendar sources to localStorage:', error);
        showAlert('Could not save calendar settings to local storage.', 'error');
    }
}

function loadCalendarSourcesFromLocalStorage() {
    const storedSources = localStorage.getItem('oneCalendarSources');
    if (storedSources) {
        try {
            calendarSources = JSON.parse(storedSources);
            updateCalendarList();
        } catch (e) {
            console.error('Error parsing calendar sources:', e);
            showAlert('There was an error loading your saved calendars.', 'error');
        }
    }
}

// Weather and Clock Functions
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
}

function updateClock() {
    const clockElement = document.getElementById('clock');
    let now;
    
    if (selectedTimezone === 'local') {
        now = new Date();
    } else {
        // Use Intl.DateTimeFormat to convert time to the selected timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: selectedTimezone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: userSettings.timeFormat === '12'
        });
        
        const formattedTime = formatter.format(new Date());
        clockElement.textContent = formattedTime;
        return; // Skip the rest of the function since we're using the formatter
    }
    
    let hours, minutes, seconds, period;
    
    if (userSettings.timeFormat === '12') {
        hours = now.getHours() % 12 || 12;
        minutes = now.getMinutes().toString().padStart(2, '0');
        seconds = now.getSeconds().toString().padStart(2, '0');
        period = now.getHours() >= 12 ? 'PM' : 'AM';
        clockElement.textContent = `${hours}:${minutes}:${seconds} ${period}`;
    } else {
        hours = now.getHours().toString().padStart(2, '0');
        minutes = now.getMinutes().toString().padStart(2, '0');
        seconds = now.getSeconds().toString().padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Global variables
let currentDate = new Date();
let currentView = 'week';
let events = []; // Will store all events
let editingEventId = null; // To track which event is being edited
let selectedColor = 1; // Default color for new events
let darkMode = false; // Track theme state
let calendarSources = [
    { id: 'work', name: 'Work', color: 'event-color-1', visible: true },
    { id: 'personal', name: 'Personal', color: 'event-color-2', visible: true },
    { id: 'family', name: 'Family', color: 'event-color-3', visible: true }
];
let draggedEvent = null; // Track event being dragged
let userLocation = { 
    city: 'London', 
    lat: 51.5074, 
    lon: -0.1278 
};
let weatherUnit = 'metric';
let selectedTimezone = 'local';
let clockInterval;
let currentTheme = 'theme-default';
let currentBackground = 'none';
let customBackgroundImage = null;
let userSettings = {
    defaultView: 'week',
    weekStartsOn: 0, // 0 = Sunday, 1 = Monday
    timeFormat: '12', // 12 or 24 hour
    showWeekNumbers: false,
    defaultDarkMode: false,
    defaultReminder: '30',
    location: { city: 'London', lat: 51.5074, lon: -0.1278 },
    weatherUnit: 'metric',
    defaultTimezone: 'local',
    theme: 'theme-default',
    background: 'none',
    customBackground: null
};

// Initialize calendar components
// Initialize calendar components
document.addEventListener('DOMContentLoaded', function() {
    loadSampleEvents();
    setupEventListeners();
    initializeCalendarViews();
    updateCalendarView();
    renderMiniCalendar();
    initializeSearchFunction();
    loadUserSettings();
    initializeWeatherAndClock();
    
});

// Load sample events for demonstration
function loadSampleEvents() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    events = [
        {
            id: 1,
            title: 'Team Meeting',
            startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
            endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
            color: 1,
            calendar: 'work',
            location: 'Conference Room B',
            description: 'Weekly team sync meeting',
            guests: 'team@example.com',
            notification: 15,
            repeat: 'weekly'
        },
        {
            id: 2,
            title: 'Lunch with Sarah',
            startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
            endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30),
            color: 2,
            calendar: 'personal',
            location: 'Cafe Bistro',
            description: 'Catch up lunch',
            guests: 'sarah@example.com',
            notification: 30,
            repeat: 'none'
        },
        {
            id: 3,
            title: 'Project Deadline',
            startDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0),
            endDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 30),
            color: 1,
            calendar: 'work',
            location: '',
            description: 'Submit final project deliverables',
            guests: '',
            notification: 1440,
            repeat: 'none'
        },
        {
            id: 4,
            title: 'Family Dinner',
            startDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 19, 0),
            endDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 21, 0),
            color: 3,
            calendar: 'family',
            location: 'Home',
            description: 'Monthly family dinner',
            guests: 'family@example.com',
            notification: 60,
            repeat: 'monthly'
        },
        {
            id: 5,
            title: 'Dentist Appointment',
            startDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 14, 0),
            endDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 15, 0),
            color: 2,
            calendar: 'personal',
            location: 'Dental Clinic',
            description: 'Regular checkup',
            guests: '',
            notification: 60,
            repeat: 'none'
        },
        {
            id: 6,
            title: 'Gym Session',
            startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
            endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0),
            color: 2,
            calendar: 'personal',
            location: 'Fitness Center',
            description: 'Cardio and weights workout',
            guests: '',
            notification: 30,
            repeat: 'daily'
        },
        {
            id: 7,
            title: 'Client Call',
            startDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
            endDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0),
            color: 1,
            calendar: 'work',
            location: 'Zoom Meeting',
            description: 'Discuss project requirements',
            guests: 'client@example.com',
            notification: 15,
            repeat: 'none'
        }
    ];
}

// Setup all event listeners
function setupEventListeners() {
    // View switching
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentView = this.getAttribute('data-view');
            updateCalendarView();
        });
    });
    
    // Date navigation
    document.getElementById('prev-btn').addEventListener('click', navigatePrevious);
    document.getElementById('next-btn').addEventListener('click', navigateNext);
    document.getElementById('today-btn').addEventListener('click', navigateToday);
    
    // Mini calendar navigation
    document.getElementById('prev-mini-month').addEventListener('click', () => {
        const miniDate = new Date(currentDate);
        miniDate.setMonth(miniDate.getMonth() - 1);
        renderMiniCalendar(miniDate);
    });
    
    document.getElementById('next-mini-month').addEventListener('click', () => {
        const miniDate = new Date(currentDate);
        miniDate.setMonth(miniDate.getMonth() + 1);
        renderMiniCalendar(miniDate);
    });
    
    // Event modal
    document.getElementById('add-event-btn').addEventListener('click', openAddEventModal);
    document.getElementById('close-modal').addEventListener('click', closeEventModal);
    document.getElementById('cancel-event').addEventListener('click', closeEventModal);
    document.getElementById('save-event').addEventListener('click', saveEvent);
    document.getElementById('delete-event').addEventListener('click', deleteEvent);
    
    // Color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Sidebar toggle for mobile
    document.getElementById('show-sidebar').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.add('show');
    });
    
    document.getElementById('close-sidebar').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('show');
    });
    
    // Calendar visibility toggle
    document.querySelectorAll('.calendar-visibility').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const calendarItem = this.closest('.calendar-item');
            const calendarName = calendarItem.querySelector('.calendar-name').textContent.toLowerCase();
            
            // Find the calendar in our sources
            const calendarSource = calendarSources.find(cal => cal.name.toLowerCase() === calendarName);
            if (calendarSource) {
                calendarSource.visible = !calendarSource.visible;
                
                // Update the icon
                if (calendarSource.visible) {
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                } else {
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                }
                
                // Refresh the calendar view
                updateCalendarView();
            }
        });
    });
    
    // Add calendar button
    document.getElementById('add-calendar-btn').addEventListener('click', openAddCalendarModal);
    document.getElementById('close-calendar-modal').addEventListener('click', closeCalendarModal);
    document.getElementById('cancel-calendar').addEventListener('click', closeCalendarModal);
    document.getElementById('save-calendar').addEventListener('click', saveCalendar);
    
    // Calendar type change
    document.getElementById('calendar-type').addEventListener('change', function() {
        const externalFields = document.getElementById('external-calendar-fields');
        if (this.value !== 'local') {
            externalFields.classList.remove('hidden');
        } else {
            externalFields.classList.add('hidden');
        }
    });
    
    // Account settings
    document.getElementById('account-btn').addEventListener('click', openAccountModal);
    document.getElementById('close-account-modal').addEventListener('click', closeAccountModal);
    document.getElementById('close-settings').addEventListener('click', closeAccountModal);
    document.getElementById('save-settings').addEventListener('click', saveUserSettings);
    
    // Connect service buttons
    document.querySelectorAll('.connect-btn').forEach(button => {
        button.addEventListener('click', function() {
            const service = this.getAttribute('data-service');
            connectCalendarService(service);
        });
    });
    
    // Dark mode preference
    document.getElementById('dark-mode-pref').addEventListener('change', function() {
        if (this.checked) {
            if (!darkMode) toggleTheme();
        } else {
            if (darkMode) toggleTheme();
        }
    });
    
    // Import/Export buttons
    document.getElementById('import-calendar-btn').addEventListener('click', importCalendar);
    document.getElementById('export-calendar-btn').addEventListener('click', exportCalendar);
    document.getElementById('calendar-settings-btn').addEventListener('click', openAccountModal);
    
    // Weather and clock event listeners
    document.getElementById('timezone-select').addEventListener('change', function() {
        selectedTimezone = this.value;
        updateClock();
        localStorage.setItem('oneCalendarTimezone', selectedTimezone);
    });

    document.getElementById('location-input').addEventListener('change', function() {
        userLocation.city = this.value;
        fetchWeather();
        saveUserSettings();
    });

    // Theme gallery
    document.querySelectorAll('.theme-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.theme-item').forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            currentTheme = this.getAttribute('data-theme');
            applyTheme(currentTheme);
        });
    });

    // Background gallery
    document.querySelectorAll('.background-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.background-item').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            currentBackground = this.getAttribute('data-bg');
            applyBackground(currentBackground);
        });
    });

    // Custom background
    document.getElementById('custom-background-button').addEventListener('click', function() {
        document.getElementById('custom-background-input').click();
    });

    document.getElementById('custom-background-input').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const imgDataUrl = event.target.result;
                customBackgroundImage = imgDataUrl;
                
                // Show preview
                const preview = document.getElementById('custom-background-preview');
                preview.innerHTML = '';
                const img = document.createElement('img');
                img.src = imgDataUrl;
                preview.appendChild(img);
                
                // Apply custom background
                applyCustomBackground(imgDataUrl);
                
                // Deselect other backgrounds
                document.querySelectorAll('.background-item').forEach(b => b.classList.remove('selected'));
                currentBackground = 'custom';
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// User settings functions
function loadUserSettings() {
    // In a real app, this would load from localStorage or a server
    const storedSettings = localStorage.getItem('oneCalendarSettings');
    if (storedSettings) {
        try {
            userSettings = JSON.parse(storedSettings);
        } catch (e) {
            console.error('Error parsing user settings:', e);
        }
    }
    
    // Apply settings
    applyUserSettings();
}

function applyUserSettings() {
    // Apply dark mode if set
    if (userSettings.defaultDarkMode && !darkMode) {
        toggleTheme();
    }
    
    // Set the dark mode checkbox based on current state
    document.getElementById('dark-mode-pref').checked = darkMode;
    
    // Set other form fields to match settings
    document.getElementById('default-view').value = userSettings.defaultView;
    document.getElementById('week-starts').value = userSettings.weekStartsOn;
    document.getElementById('time-format').value = userSettings.timeFormat;
    document.getElementById('show-week-numbers').checked = userSettings.showWeekNumbers;
    document.getElementById('default-reminder').value = userSettings.defaultReminder;
    
    // Set weather unit radio button
    document.querySelector(`input[name="weather-unit"][value="${userSettings.weatherUnit}"]`).checked = true;
    weatherUnit = userSettings.weatherUnit;

    // Set location input
    document.getElementById('location-input').value = userSettings.location.city || 'London';
    userLocation = userSettings.location;

    // Set timezone
    document.getElementById('default-timezone').value = userSettings.defaultTimezone;
    document.getElementById('timezone-select').value = userSettings.defaultTimezone;
    selectedTimezone = userSettings.defaultTimezone;
    
    // Apply theme if set
    if (userSettings.theme) {
        applyTheme(userSettings.theme);
        
        // Update theme gallery selection
        document.querySelectorAll('.theme-item').forEach(item => {
            item.classList.remove('selected');
            if (item.getAttribute('data-theme') === userSettings.theme) {
                item.classList.add('selected');
            }
        });
    }
    
    if (userSettings.background && userSettings.background !== 'none') {
        if (userSettings.background === 'custom' && userSettings.customBackground) {
            applyCustomBackground(userSettings.customBackground);
            
            // Update custom background preview
            const preview = document.getElementById('custom-background-preview');
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = userSettings.customBackground;
            preview.appendChild(img);
        } else {
            applyBackground(userSettings.background);
        }
        
        // Update background gallery selection
        document.querySelectorAll('.background-item').forEach(item => {
            item.classList.remove('selected');
            if (item.getAttribute('data-bg') === userSettings.background) {
                item.classList.add('selected');
            }
        });
    }
    
    // Apply week start setting
    updateCalendarView();
}

function saveUserSettings() {
    weatherUnit = document.querySelector('input[name="weather-unit"]:checked').value;
    const defaultTimezone = document.getElementById('default-timezone').value;
    const locationCity = document.getElementById('location-input').value;
    
    userLocation = {
        ...userLocation,
        city: locationCity
    };
    
    userSettings = {
        defaultView: document.getElementById('default-view').value,
        weekStartsOn: parseInt(document.getElementById('week-starts').value),
        timeFormat: document.getElementById('time-format').value,
        showWeekNumbers: document.getElementById('show-week-numbers').checked,
        defaultDarkMode: document.getElementById('dark-mode-pref').checked,
        defaultReminder: document.getElementById('default-reminder').value,
        location: userLocation,
        weatherUnit: weatherUnit,
        defaultTimezone: defaultTimezone,
        theme: currentTheme,
        background: currentBackground,
        customBackground: customBackgroundImage
    };
    
    // Save to localStorage
    localStorage.setItem('oneCalendarSettings', JSON.stringify(userSettings));
    
    // Apply the settings
    applyUserSettings();
    
    // Close modal and show confirmation
    closeAccountModal();
    showAlert('Settings saved successfully', 'success');
}

// Theme and Background functions
function applyTheme(theme) {
    // Remove any existing theme classes
    document.body.classList.remove('theme-default', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-violet', 'theme-midnight');
    
    // Add the selected theme class
    document.body.classList.add(theme);
    currentTheme = theme;
}

function applyBackground(background) {
    // Remove existing background
    document.body.style.backgroundImage = '';
    document.body.classList.remove('has-bg-image');
    
    if (background === 'none') {
        return;
    }
    
    // Add the selected background
    document.body.classList.add('has-bg-image');
    
    // Map background codes to URLs
    const backgroundMap = {
        'bg-mountains': 'https://source.unsplash.com/featured/1920x1080?mountains',
        'bg-beach': 'https://source.unsplash.com/featured/1920x1080?beach',
        'bg-forest': 'https://source.unsplash.com/featured/1920x1080?forest',
        'bg-city': 'https://source.unsplash.com/featured/1920x1080?city',
        'bg-abstract': 'https://source.unsplash.com/featured/1920x1080?abstract',
        'bg-pattern': 'https://source.unsplash.com/featured/1920x1080?pattern',
        'bg-space': 'https://source.unsplash.com/featured/1920x1080?space',
        'bg-ocean': 'https://source.unsplash.com/featured/1920x1080?ocean'
    };
    
    if (backgroundMap[background]) {
        document.body.style.backgroundImage = `url(${backgroundMap[background]})`;
    }
}

function applyCustomBackground(imageDataUrl) {
    // Remove existing background
    document.body.classList.add('has-bg-image');
    document.body.style.backgroundImage = `url(${imageDataUrl})`;
}

// Initialize search functionality
function initializeSearchFunction() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    searchInput.addEventListener('focus', () => {
        searchResults.style.display = 'block';
    });
    
    searchInput.addEventListener('blur', () => {
        // Delay hiding to allow clicks on results
        setTimeout(() => {
            searchResults.style.display = 'none';
        }, 200);
    });
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        const matchingEvents = events.filter(event => 
            event.title.toLowerCase().includes(query) || 
            (event.description && event.description.toLowerCase().includes(query)) ||
            (event.location && event.location.toLowerCase().includes(query))
        );
        
        if (matchingEvents.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No events found</div>';
        } else {
            matchingEvents.forEach(event => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                
                const resultTitle = document.createElement('div');
                resultTitle.className = 'search-result-title';
                resultTitle.textContent = event.title;
                
                const resultDate = document.createElement('div');
                resultDate.className = 'search-result-date';
                resultDate.textContent = `${formatFullDate(event.startDate)} at ${formatTime(event.startDate)}`;
                
                resultItem.appendChild(resultTitle);
                resultItem.appendChild(resultDate);
                
                resultItem.addEventListener('click', () => {
                    // Navigate to the event's date and open it
                    currentDate = new Date(event.startDate);
                    updateCalendarView();
                    openEditEventModal(event.id);
                });
                
                searchResults.appendChild(resultItem);
            });
        }
        
        searchResults.style.display = 'block';
    });
}

// Calendar service connection
function connectCalendarService(service) {
    // In a real app, this would open OAuth flow
    // For demo purposes, we'll just simulate success
    
    const button = document.querySelector(`.connect-btn[data-service="${service}"]`);
    const statusElement = button.closest('.service-connection').querySelector('.service-status');
    
    // Simulate connection process
    button.textContent = 'Connecting...';
    button.disabled = true;
    
    setTimeout(() => {
        statusElement.textContent = 'Connected';
        button.textContent = 'Disconnect';
        button.classList.remove('connect-btn');
        button.classList.add('disconnect-btn');
        button.disabled = false;
        
        showAlert(`Successfully connected to ${service.charAt(0).toUpperCase() + service.slice(1)} Calendar`, 'success');
        
        // Add a new calendar source for this service
        const newCalendarId = `${service}-calendar`;
        if (!calendarSources.some(cal => cal.id === newCalendarId)) {
            calendarSources.push({
                id: newCalendarId,
                name: `${service.charAt(0).toUpperCase() + service.slice(1)} Calendar`,
                color: `event-color-${Math.floor(Math.random() * 5) + 1}`,
                visible: true
            });
            
            // Update sidebar calendar list
            updateCalendarList();
        }
    }, 1500);
}

// Update the sidebar calendar list
function updateCalendarList() {
    const calendarList = document.querySelector('.calendar-list');
    const addButton = document.querySelector('.add-calendar-btn');
    
    // Remove all calendar items except the add button
    const calendarItems = calendarList.querySelectorAll('.calendar-item');
    calendarItems.forEach(item => {
        calendarList.removeChild(item);
    });
    
    // Add calendar items from sources
    calendarSources.forEach(calendar => {
        const calendarItem = document.createElement('div');
        calendarItem.className = 'calendar-item';
        
        const calendarColor = document.createElement('div');
        calendarColor.className = 'calendar-color';
        calendarColor.style.backgroundColor = `var(--${calendar.color.replace('event-color', 'event-color')})`;
        
        const calendarName = document.createElement('div');
        calendarName.className = 'calendar-name';
        calendarName.textContent = calendar.name;
        
        const calendarVisibility = document.createElement('div');
        calendarVisibility.className = 'calendar-visibility';
        calendarVisibility.innerHTML = calendar.visible ? 
            '<i class="fas fa-eye"></i>' : 
            '<i class="fas fa-eye-slash"></i>';
        
        calendarItem.appendChild(calendarColor);
        calendarItem.appendChild(calendarName);
        calendarItem.appendChild(calendarVisibility);
        
        // Add click handler for visibility toggle
        calendarVisibility.addEventListener('click', function() {
            calendar.visible = !calendar.visible;
            
            if (calendar.visible) {
                this.innerHTML = '<i class="fas fa-eye"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            }
            
            updateCalendarView();
        });
        
        // Insert before the add button
        calendarList.insertBefore(calendarItem, addButton);
    });
}

// Import/Export functions
function importCalendar() {
    // In a real app, this would open a file picker
    // For demo purposes, we'll just show a confirmation
    showAlert('Calendar import functionality would open a file picker here', 'info');
}

function exportCalendar() {
    // In a real app, this would generate and download an ICS file
    // For demo purposes, we'll just show a confirmation
    showAlert('Calendar export functionality would download an ICS file', 'info');
}

// Initialize calendar views structure
function initializeCalendarViews() {
    // Create day view time slots
    const dayTimeSlots = document.getElementById('day-time-slots');
    dayTimeSlots.innerHTML = '';
    
    for (let hour = 0; hour < 24; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatHour(hour);
        
        const slotContent = document.createElement('div');
        slotContent.className = 'slot-content';
        slotContent.setAttribute('data-hour', hour);
        
        // Add drop zone for drag and drop
        slotContent.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.backgroundColor = 'rgba(49, 116, 173, 0.1)';
        });
        
        slotContent.addEventListener('dragleave', function() {
            this.style.backgroundColor = '';
        });
        
        slotContent.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.backgroundColor = '';
            
            if (draggedEvent) {
                const hour = parseInt(this.getAttribute('data-hour'));
                moveEventToNewTime(draggedEvent, currentDate, hour);
            }
        });
        
        timeSlot.appendChild(timeLabel);
        timeSlot.appendChild(slotContent);
        dayTimeSlots.appendChild(timeSlot);
    }
    
    // Create week view headers and columns
    updateWeekViewStructure();
}

function updateWeekViewStructure() {
    const weekHeader = document.getElementById('week-header');
    const weekGrid = document.getElementById('week-grid');
    weekHeader.innerHTML = '';
    weekGrid.innerHTML = '';
    
    // Get the start of week based on user settings
    const startDate = getStartOfWeek(currentDate);
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const weekday = document.createElement('div');
        weekday.className = 'weekday';
        weekday.textContent = formatDayHeader(date);
        weekHeader.appendChild(weekday);
        
        const column = document.createElement('div');
        column.className = 'week-column';
        column.setAttribute('data-date', formatDateAttribute(date));
        
        // Create time slots inside each column
        for (let hour = 0; hour < 24; hour++) {
            const hourSlot = document.createElement('div');
            hourSlot.className = 'time-slot';
            hourSlot.style.height = '50px';
            hourSlot.setAttribute('data-hour', hour);
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.style.fontSize = '10px';
            timeLabel.textContent = i === 0 ? formatHour(hour) : '';
            
            const slotContent = document.createElement('div');
            slotContent.className = 'slot-content';
            
            // Add drop zone for drag and drop
            slotContent.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(49, 116, 173, 0.1)';
            });
            
            slotContent.addEventListener('dragleave', function() {
                this.style.backgroundColor = '';
            });
            
            slotContent.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '';
                
                if (draggedEvent) {
                    const dateStr = this.closest('.week-column').getAttribute('data-date');
                    const hour = parseInt(this.closest('.time-slot').getAttribute('data-hour'));
                    const newDate = parseDate(dateStr);
                    moveEventToNewTime(draggedEvent, newDate, hour);
                }
            });
            
            hourSlot.appendChild(timeLabel);
            hourSlot.appendChild(slotContent);
            column.appendChild(hourSlot);
        }
        
        weekGrid.appendChild(column);
    }
}

// Function to move an event to a new time/date
function moveEventToNewTime(eventId, newDate, newHour, newMinute = 0) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Calculate the duration of the event
    const duration = event.endDate - event.startDate;
    
    // Create new start date
    const newStartDate = new Date(newDate);
    newStartDate.setHours(newHour, newMinute || 0, 0, 0);
    
    // Create new end date
    const newEndDate = new Date(newStartDate.getTime() + duration);
    
    // Update the event
    event.startDate = newStartDate;
    event.endDate = newEndDate;
    
    // Reset draggedEvent
    draggedEvent = null;
    
    // Update the calendar view
    updateCalendarView();
    
    // Show confirmation
    showAlert('Event moved successfully', 'success');
}