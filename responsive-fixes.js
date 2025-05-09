document.addEventListener('DOMContentLoaded', function() {
    initializeResponsiveUI();
});

function initializeResponsiveUI() {
    // Responsive elements setup
    setupResponsiveHeaderButtons();
    enhanceWeatherResponsiveness(); // This function might need review based on styles.css
    
    // Listen for window resize events
    window.addEventListener('resize', handleWindowResize);
    
    // Initial call to handle the current window size
    handleWindowResize();
    console.log('Responsive UI initialized from responsive-fixes.js');
}

// This function moves the Add Event and Quick Add buttons to the sidebar on small screens
function setupResponsiveHeaderButtons() {
    const userActions = document.querySelector('.user-actions');
    const addEventBtn = document.getElementById('add-event-btn');
    const nlEventBtn = document.getElementById('nl-event-btn'); // From oneCalendar-enhancements.js
    const sidebar = document.querySelector('.sidebar');
    
    if (!addEventBtn || !sidebar) {
        console.warn('Required elements for responsive header buttons not found.');
        return;
    }

    // Check if sidebar actions container already exists to prevent duplication
    let sidebarActions = document.querySelector('.sidebar-user-actions');
    if (!sidebarActions) {
        sidebarActions = document.createElement('div');
        sidebarActions.className = 'sidebar-user-actions';
        // Initial styles that might be needed before CSS fully loads or if overridden
        sidebarActions.style.display = 'none'; 
        sidebarActions.style.padding = '15px 0'; // Consistent with original
        sidebarActions.style.marginTop = '20px';  // Consistent with original
        sidebarActions.style.borderTop = '1px solid var(--border-color)'; // Consistent with original
        sidebar.appendChild(sidebarActions);
    } else {
        // Clear previous clones if any, to avoid multiple buttons if this function is called again
        sidebarActions.innerHTML = '';
    }
    
    // Clone the buttons for the sidebar
    const cloneAddEventBtn = addEventBtn.cloneNode(true);
    cloneAddEventBtn.id = 'sidebar-add-event-btn'; // Ensure unique ID for cloned button
    
    // Add event listeners to the cloned buttons
    // Ensure openAddEventModal is globally available (from script.js)
    if (typeof openAddEventModal === 'function') {
        cloneAddEventBtn.addEventListener('click', openAddEventModal);
    }
    sidebarActions.appendChild(cloneAddEventBtn);

    if (nlEventBtn) {
        const cloneNlEventBtn = nlEventBtn.cloneNode(true);
        cloneNlEventBtn.id = 'sidebar-nl-event-btn'; // Ensure unique ID
        // Ensure openNaturalLanguageModal is globally available (from oneCalendar-enhancements.js)
        if (typeof openNaturalLanguageModal === 'function') {
            cloneNlEventBtn.addEventListener('click', openNaturalLanguageModal);
        }
        sidebarActions.appendChild(cloneNlEventBtn);
    }
}

// Function to handle weather component responsiveness
// Review if this is still needed or if CSS handles it entirely.
// This JS was primarily creating 'weather-main-info' div. If your CSS can achieve the layout
// without this dynamic DOM manipulation, this function can be simplified or removed.
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

// Main responsive handler that's called on window resize
function handleWindowResize() {
    const windowWidth = window.innerWidth;
    const userActionsInHeader = document.querySelector('header .user-actions');
    const sidebarActions = document.querySelector('.sidebar .sidebar-user-actions');
    const weatherContainer = document.querySelector('.weather-container'); // In header

    const addEventBtnInHeader = userActionsInHeader ? userActionsInHeader.querySelector('#add-event-btn') : null;
    const nlEventBtnInHeader = userActionsInHeader ? userActionsInHeader.querySelector('#nl-event-btn') : null;


    // Handle buttons placement based on screen width
    if (windowWidth <= 768) {
        if (sidebarActions) {
            sidebarActions.style.display = 'flex'; // Make cloned buttons in sidebar visible
            sidebarActions.style.flexDirection = 'column';
            sidebarActions.style.gap = '10px';
        }
        // Hide original buttons in the header
        if (addEventBtnInHeader) addEventBtnInHeader.style.display = 'none';
        if (nlEventBtnInHeader) nlEventBtnInHeader.style.display = 'none';

        // Ensure theme toggle is appropriately aligned if other buttons are hidden
        const themeToggle = userActionsInHeader ? userActionsInHeader.querySelector('#theme-toggle') : null;
        if (themeToggle && userActionsInHeader.children.length > 1) { // If other buttons were present
             // No specific style needed if CSS handles alignment with flexbox correctly
        }

    } else { // Wider screens
        if (sidebarActions) {
            sidebarActions.style.display = 'none'; // Hide cloned buttons in sidebar
        }
        // Show original buttons in the header
        if (addEventBtnInHeader) addEventBtnInHeader.style.display = 'flex'; // or 'inline-flex' or initial value
        if (nlEventBtnInHeader) nlEventBtnInHeader.style.display = 'flex'; // or 'inline-flex' or initial value

        const themeToggle = userActionsInHeader ? userActionsInHeader.querySelector('#theme-toggle') : null;
        if (themeToggle) {
            themeToggle.style.marginLeft = ''; // Reset any specific margin
        }
    }
    
    // Apply/remove special mobile layout class for weather container on very small screens
    // This class should be defined in styles.css
    if (weatherContainer) {
        if (windowWidth <= 480) {
            weatherContainer.classList.add('mobile-weather-layout');
        } else {
            weatherContainer.classList.remove('mobile-weather-layout');
        }
    }
}