// ========== NOTIFICATION ALARM FUNCTIONALITY ==========

// Initialize alarm notification functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add audio element for notification sound if not already present
    if (!document.getElementById('notification-sound')) {
        const audioElement = document.createElement('audio');
        audioElement.id = 'notification-sound';
        audioElement.preload = 'auto';
        
        // Add multiple sources for better browser compatibility
        const source1 = document.createElement('source');
        source1.src = 'https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/bell_ring.mp3';
        source1.type = 'audio/mpeg';
        
        const source2 = document.createElement('source');
        source2.src = 'https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/water_droplet.mp3';
        source2.type = 'audio/mpeg';
        
        audioElement.appendChild(source1);
        audioElement.appendChild(source2);
        document.body.appendChild(audioElement);
        
        console.log('Notification sound element added to page');
    }
    
    // Add alarm settings to account modal
    addAlarmSettings();
    
    // Override the showEventNotification function to include sound
    overrideNotificationFunction();
    
    console.log('Notification alarm functionality initialized');
});

// Add alarm settings to the account modal
function addAlarmSettings() {
    // Find the notification settings section
    const notificationSection = document.querySelector('.account-section:nth-of-type(4)');
    if (!notificationSection) return;
    
    // Only add if it doesn't already exist
    if (document.getElementById('sound-notifications')) return;
    
    // Create settings elements
    const soundOption = document.createElement('div');
    soundOption.className = 'reminder-option';
    soundOption.innerHTML = `
        <input type="checkbox" id="sound-notifications" class="reminder-checkbox" checked>
        <label for="sound-notifications">Play alarm sound with notifications</label>
    `;
    
    const volumeControl = document.createElement('div');
    volumeControl.className = 'form-group sound-settings';
    volumeControl.style.marginLeft = '25px';
    volumeControl.innerHTML = `
        <label for="sound-volume">Alarm volume</label>
        <div style="display: flex; align-items: center;">
            <i class="fas fa-volume-down" style="margin-right: 10px;"></i>
            <input type="range" id="sound-volume" min="0" max="100" value="70" style="width: 100px;">
            <i class="fas fa-volume-up" style="margin-left: 10px;"></i>
            <button class="btn btn-sm" id="test-sound" style="margin-left: 15px;">Test Sound</button>
        </div>
    `;
    
    // Add them to the notification section
    const firstChild = notificationSection.querySelector('.reminder-option');
    if (firstChild) {
        notificationSection.insertBefore(soundOption, firstChild);
        notificationSection.insertBefore(volumeControl, firstChild.nextSibling);
    } else {
        notificationSection.appendChild(soundOption);
        notificationSection.appendChild(volumeControl);
    }
    
    // Add event listeners
    document.getElementById('test-sound').addEventListener('click', function(e) {
        e.preventDefault();
        testNotificationSound();
    });
    
    document.getElementById('sound-notifications').addEventListener('change', function() {
        document.querySelector('.sound-settings').style.display = 
            this.checked ? 'block' : 'none';
    });
    
    // Initialize state from settings
    if (userSettings && userSettings.soundNotifications !== undefined) {
        document.getElementById('sound-notifications').checked = userSettings.soundNotifications;
        document.querySelector('.sound-settings').style.display = 
            userSettings.soundNotifications ? 'block' : 'none';
    }
    
    if (userSettings && userSettings.soundVolume !== undefined) {
        document.getElementById('sound-volume').value = userSettings.soundVolume;
    }
    
    // Add to save settings function
    const originalSaveUserSettings = window.saveUserSettings;
    if (originalSaveUserSettings) {
        window.saveUserSettings = function() {
            // Check if the sound settings exist before trying to access them
            if (document.getElementById('sound-notifications') && document.getElementById('sound-volume')) {
                // Add sound settings to userSettings
                userSettings.soundNotifications = document.getElementById('sound-notifications').checked;
                userSettings.soundVolume = parseInt(document.getElementById('sound-volume').value);
            }
            
            // Call the original function
            originalSaveUserSettings.call(this);
        };
    }
}

// Test notification sound
function testNotificationSound() {
    const notificationSound = document.getElementById('notification-sound');
    if (notificationSound) {
        notificationSound.currentTime = 0;
        notificationSound.volume = getNotificationVolume();
        
        // Play the sound
        const playPromise = notificationSound.play();
        
        // Handle browsers that don't allow autoplay
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Error playing test sound:", error);
                showAlert('Error playing sound. This browser may require user interaction before playing audio.', 'error');
            });
        }
    } else {
        console.error("Notification sound element not found");
        showAlert('Error: Audio element not found', 'error');
    }
}

// Get notification volume from settings
function getNotificationVolume() {
    const volumeSlider = document.getElementById('sound-volume');
    if (volumeSlider) {
        return volumeSlider.value / 100; // Convert to 0-1 range
    }
    return 0.7; // Default volume
}

// Override the default notification function
function overrideNotificationFunction() {
    // Store reference to original function
    const originalShowEventNotification = window.showEventNotification;
    
    // Create enhanced version
    window.showEventNotification = function(event) {
        // Get notification sound element
        const notificationSound = document.getElementById('notification-sound');
        
        // Check if sound should be played based on user settings
        const shouldPlaySound = userSettings && 
                               userSettings.soundNotifications !== false && 
                               notificationSound;
        
        // Set volume if applicable
        if (shouldPlaySound && userSettings.soundVolume !== undefined) {
            notificationSound.volume = userSettings.soundVolume / 100;
        }
        
        // Call original function to handle notifications
        if (originalShowEventNotification) {
            originalShowEventNotification.call(this, event);
        } else {
            // Fallback implementation if original function is not available
            if (Notification.permission === "granted") {
                const notification = new Notification("Event Reminder", {
                    body: `${event.title} - Starts at ${formatTime(event.startDate)}`,
                    icon: "/favicon.ico"
                });
                
                setTimeout(() => {
                    notification.close();
                }, 10000);
            }
            
            // Show in-app notification
            if (typeof showAlert === 'function') {
                showAlert(`Upcoming event: ${event.title} at ${formatTime(event.startDate)}`, 'info');
            }
        }
        
        // Play sound if enabled
        if (shouldPlaySound) {
            notificationSound.currentTime = 0; // Reset to beginning
            
            const playPromise = notificationSound.play();
            
            // Handle potential autoplay restrictions
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Error playing notification sound:", error);
                });
            }
        }
    };
}