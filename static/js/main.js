// Main JavaScript file for Cybersecurity Work Tracker

// Global variables
let activityTracker = null;
let isTrackingActive = true;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🔐 Cybersecurity Work Tracker initialized');
    
    // Initialize activity tracking if we're on a challenge page
    if (typeof challengeId !== 'undefined') {
        initializeActivityTracking();
    }
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize toast notifications
    initializeToasts();
    
    // Add fade-in animation to cards
    animateCards();
    
    // Initialize form validations
    initializeFormValidations();
}

function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function initializeToasts() {
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.parentNode.removeChild(alert);
                    }
                }, 500);
            }
        }, 5000);
    });
}

function animateCards() {
    const cards = document.querySelectorAll('.cyber-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function initializeFormValidations() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const iconClass = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-triangle' : 
                     type === 'warning' ? 'fa-exclamation' : 'fa-info-circle';
    
    const toastHTML = `
        <div id="${toastId}" class="toast cyber-toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="fas ${iconClass} text-${type === 'error' ? 'danger' : type} me-2"></i>
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        delay: 3000
    });
    
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    } else {
        const hours = (minutes / 60).toFixed(1);
        return `${hours}h`;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard!', 'success');
    }, function(err) {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy to clipboard', 'error');
    });
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility function to format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Progress calculation utilities
function calculateProgress(current, target) {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
}

function getProgressColor(percentage) {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    if (percentage >= 25) return 'info';
    return 'danger';
}

// Local Storage utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Theme utilities
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    saveToLocalStorage('theme', newTheme);
}

function loadTheme() {
    const savedTheme = loadFromLocalStorage('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Initialize theme on load
loadTheme();

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl+N - New Challenge
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        window.location.href = '/create_challenge';
    }
    
    // Ctrl+V - View Vulnerabilities
    if (event.ctrlKey && event.key === 'v') {
        event.preventDefault();
        window.location.href = '/vulnerabilities';
    }
    
    // Ctrl+A - View Analytics
    if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        window.location.href = '/analytics';
    }
    
    // Escape - Close modals
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
});

// Handle form submissions with loading states
function handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        submitButton.disabled = true;
        
        // Re-enable after 3 seconds in case of no redirect
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 3000);
    }
}

// Add loading state to all forms
document.addEventListener('submit', function(event) {
    const form = event.target;
    if (form.tagName === 'FORM') {
        handleFormSubmission(form);
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', function(event) {
    const target = event.target.closest('a[href^="#"]');
    if (target) {
        event.preventDefault();
        const targetId = target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Auto-refresh challenge data every minute
if (typeof challengeId !== 'undefined') {
    setInterval(function() {
        // Update challenge progress without reloading the page
        updateChallengeProgress();
    }, 60000); // Every minute
}

function updateChallengeProgress() {
    // This would be called to update progress without page reload
    // Implementation depends on specific requirements
    console.log('Updating challenge progress...');
}

// Export useful functions for other scripts
window.CyberTracker = {
    showToast,
    formatTime,
    formatDuration,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    calculateProgress,
    getProgressColor,
    saveToLocalStorage,
    loadFromLocalStorage
};

console.log('🚀 Cybersecurity Work Tracker - Main script loaded');
