// Activity Tracker for Cybersecurity Work Tracker
// Monitors user activity and automatically logs work time

class ActivityTracker {
    constructor(challengeId) {
        this.challengeId = challengeId;
        this.isActive = false;
        this.isPaused = false;
        this.lastActivity = Date.now();
        this.activityTimeout = null;
        this.trackingInterval = null;
        this.TRACKING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.ACTIVITY_TIMEOUT = 30 * 1000; // 30 seconds of inactivity before considering idle
        
        this.bindEvents();
        this.startTracking();
        
        console.log('🔍 Activity tracking initialized for challenge:', challengeId);
    }
    
    bindEvents() {
        // Track mouse movement
        document.addEventListener('mousemove', () => this.recordActivity());
        
        // Track mouse clicks
        document.addEventListener('click', () => this.recordActivity());
        
        // Track keyboard activity
        document.addEventListener('keypress', () => this.recordActivity());
        document.addEventListener('keydown', () => this.recordActivity());
        
        // Track scroll events
        document.addEventListener('scroll', () => this.recordActivity());
        
        // Track window focus/blur
        window.addEventListener('focus', () => {
            this.recordActivity();
            console.log('👀 Window focused - activity recorded');
        });
        
        window.addEventListener('blur', () => {
            console.log('👁️ Window blurred');
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.recordActivity();
                console.log('👀 Page became visible - activity recorded');
            } else {
                console.log('👁️ Page became hidden');
            }
        });
    }
    
    recordActivity() {
        this.lastActivity = Date.now();
        this.isActive = true;
        
        // Clear the activity timeout and set a new one
        clearTimeout(this.activityTimeout);
        this.activityTimeout = setTimeout(() => {
            this.isActive = false;
            console.log('😴 User appears inactive');
        }, this.ACTIVITY_TIMEOUT);
    }
    
    startTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
        
        // Record initial activity
        this.recordActivity();
        
        // Set up periodic tracking
        this.trackingInterval = setInterval(() => {
            this.checkAndLogActivity();
        }, this.TRACKING_INTERVAL);
        
        console.log('⏱️ Activity tracking started - checking every 5 minutes');
    }
    
    stopTracking() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }
        
        if (this.activityTimeout) {
            clearTimeout(this.activityTimeout);
            this.activityTimeout = null;
        }
        
        console.log('⏹️ Activity tracking stopped');
    }
    
    pauseTracking() {
        this.isPaused = true;
        console.log('⏸️ Activity tracking paused');
        this.updateActivityStatus('paused');
    }
    
    resumeTracking() {
        this.isPaused = false;
        this.recordActivity(); // Record activity when resuming
        console.log('▶️ Activity tracking resumed');
        this.updateActivityStatus('active');
    }
    
    checkAndLogActivity() {
        if (this.isPaused) {
            console.log('⏸️ Tracking paused - skipping activity check');
            return;
        }
        
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;
        
        // Consider user active if they had activity within the last 5 minutes
        const wasActiveInInterval = timeSinceLastActivity < this.TRACKING_INTERVAL;
        
        if (wasActiveInInterval && this.isActive) {
            this.logActivity();
            console.log('✅ User was active - logging 5 minutes of work time');
        } else {
            console.log('❌ User was inactive - skipping time log');
        }
    }
    
    async logActivity() {
        try {
            const response = await fetch('/api/log_activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challenge_id: this.challengeId,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('📊 Activity logged successfully:', result);
                
                // Show toast notification
                this.showActivityToast();
                
                // Update UI elements
                this.updateWorkTimeDisplay();
                
            } else {
                const error = await response.json();
                console.error('❌ Failed to log activity:', error);
                this.showErrorToast('Failed to log activity');
            }
        } catch (error) {
            console.error('❌ Error logging activity:', error);
            this.showErrorToast('Network error while logging activity');
        }
    }
    
    showActivityToast() {
        // Try to use the global toast function first
        if (window.CyberTracker && window.CyberTracker.showToast) {
            window.CyberTracker.showToast('5 minutes added to your work session!', 'success');
            return;
        }
        
        // Fallback to bootstrap toast
        const toastElement = document.getElementById('activityToast');
        if (toastElement) {
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        }
    }
    
    showErrorToast(message) {
        if (window.CyberTracker && window.CyberTracker.showToast) {
            window.CyberTracker.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }
    
    updateActivityStatus(status) {
        const statusElement = document.getElementById('activityStatus');
        if (statusElement) {
            const statusConfig = {
                'active': {
                    icon: 'fas fa-circle text-success',
                    text: 'Tracking Active'
                },
                'paused': {
                    icon: 'fas fa-circle text-warning',
                    text: 'Tracking Paused'
                },
                'inactive': {
                    icon: 'fas fa-circle text-secondary',
                    text: 'Inactive'
                }
            };
            
            const config = statusConfig[status] || statusConfig['inactive'];
            statusElement.innerHTML = `<i class="${config.icon}"></i><span>${config.text}</span>`;
        }
    }
    
    updateWorkTimeDisplay() {
        // This could update any work time displays on the page
        // Implementation depends on the specific page structure
        const workTimeElements = document.querySelectorAll('.work-time-display');
        workTimeElements.forEach(element => {
            // Add a visual indicator that time was updated
            element.classList.add('updated');
            setTimeout(() => {
                element.classList.remove('updated');
            }, 1000);
        });
    }
    
    getActivityStats() {
        return {
            isActive: this.isActive,
            isPaused: this.isPaused,
            lastActivity: this.lastActivity,
            timeSinceLastActivity: Date.now() - this.lastActivity
        };
    }
    
    // Method to manually log activity (for testing or manual triggers)
    forceLogActivity() {
        console.log('🔧 Manually forcing activity log');
        this.recordActivity();
        this.logActivity();
    }
}

// Global activity tracker instance
let globalActivityTracker = null;

// Initialize activity tracking
function initializeActivityTracking() {
    // Only initialize if we have a challenge ID
    if (typeof challengeId === 'undefined') {
        console.log('⚠️ No challenge ID found - activity tracking not initialized');
        return;
    }
    
    if (globalActivityTracker) {
        globalActivityTracker.stopTracking();
    }
    
    globalActivityTracker = new ActivityTracker(challengeId);
    
    // Make it globally accessible for debugging
    window.activityTracker = globalActivityTracker;
    
    console.log('🎯 Global activity tracker initialized');
}

// Function to start activity tracking
function startActivityTracking() {
    if (globalActivityTracker) {
        globalActivityTracker.resumeTracking();
    } else {
        initializeActivityTracking();
    }
}

// Function to stop activity tracking
function stopActivityTracking() {
    if (globalActivityTracker) {
        globalActivityTracker.pauseTracking();
    }
}

// Function to get current activity status
function getActivityStatus() {
    if (globalActivityTracker) {
        return globalActivityTracker.getActivityStats();
    }
    return null;
}

// Handle page visibility changes for better tracking
document.addEventListener('visibilitychange', function() {
    if (globalActivityTracker) {
        if (document.hidden) {
            console.log('📱 Page hidden - activity tracking continues in background');
        } else {
            console.log('📱 Page visible - activity tracking active');
            globalActivityTracker.recordActivity();
        }
    }
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', function() {
    if (globalActivityTracker) {
        globalActivityTracker.stopTracking();
    }
});

// Debug functions (available in console)
window.debugActivityTracker = {
    getStatus: getActivityStatus,
    forceLog: () => globalActivityTracker?.forceLogActivity(),
    pause: stopActivityTracking,
    resume: startActivityTracking,
    restart: initializeActivityTracking
};

console.log('🔐 Activity Tracker module loaded');
console.log('🛠️ Debug functions available at window.debugActivityTracker');
