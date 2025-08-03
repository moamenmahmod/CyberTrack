// Charts.js for Cybersecurity Work Tracker
// Handles all chart visualizations using Chart.js

// Chart color scheme matching cybersecurity theme
const CHART_COLORS = {
    primary: '#00ff88',
    secondary: '#0088ff', 
    accent: '#ff0088',
    warning: '#ffaa00',
    success: '#28a745',
    danger: '#dc3545',
    info: '#17a2b8',
    dark: '#1a1a1a',
    light: '#ffffff',
    muted: '#888888'
};

// Chart instances storage
const chartInstances = {};

// Default chart configuration
const defaultChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: CHART_COLORS.light,
                font: {
                    family: "'Courier New', monospace"
                }
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: CHART_COLORS.muted,
                font: {
                    family: "'Courier New', monospace"
                }
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        },
        y: {
            ticks: {
                color: CHART_COLORS.muted,
                font: {
                    family: "'Courier New', monospace"
                }
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        }
    }
};

// Initialize all charts
function initializeCharts(workSessionsData, vulnerabilitiesData) {
    try {
        console.log('📊 Initializing charts with data:', { workSessionsData, vulnerabilitiesData });
        
        // Initialize work hours chart
        if (document.getElementById('workHoursChart')) {
            initWorkHoursChart(workSessionsData);
        }
        
        // Initialize severity breakdown chart
        if (document.getElementById('severityChart')) {
            initSeverityChart(vulnerabilitiesData);
        }
        
        // Initialize earnings chart
        if (document.getElementById('earningsChart')) {
            initEarningsChart(vulnerabilitiesData);
        }
        
        console.log('✅ All charts initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
    }
}

// Work Hours Chart (Bar Chart)
function initWorkHoursChart(workSessionsData) {
    const ctx = document.getElementById('workHoursChart');
    if (!ctx || !workSessionsData || workSessionsData.length === 0) {
        console.log('⚠️ No data available for work hours chart');
        showNoDataMessage(ctx, 'No work session data available');
        return;
    }
    
    try {
        // Process data for the last 14 days
        const last14Days = getLast14Days();
        const chartData = processWorkHoursData(workSessionsData, last14Days);
        
        const config = {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Work Hours',
                    data: chartData.hours,
                    backgroundColor: createGradient(ctx, CHART_COLORS.primary),
                    borderColor: CHART_COLORS.primary,
                    borderWidth: 2,
                    borderRadius: 5,
                    borderSkipped: false,
                }]
            },
            options: {
                ...defaultChartConfig,
                plugins: {
                    ...defaultChartConfig.plugins,
                    title: {
                        display: true,
                        text: 'Daily Work Hours (Last 14 Days)',
                        color: CHART_COLORS.primary,
                        font: {
                            family: "'Courier New', monospace",
                            size: 16
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: CHART_COLORS.primary,
                        bodyColor: CHART_COLORS.light,
                        borderColor: CHART_COLORS.primary,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toFixed(1)} hours`;
                            }
                        }
                    }
                },
                scales: {
                    ...defaultChartConfig.scales,
                    y: {
                        ...defaultChartConfig.scales.y,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours',
                            color: CHART_COLORS.muted
                        }
                    },
                    x: {
                        ...defaultChartConfig.scales.x,
                        title: {
                            display: true,
                            text: 'Date',
                            color: CHART_COLORS.muted
                        }
                    }
                }
            }
        };
        
        // Destroy existing chart if it exists
        if (chartInstances.workHours) {
            chartInstances.workHours.destroy();
        }
        
        chartInstances.workHours = new Chart(ctx, config);
        console.log('✅ Work hours chart created successfully');
        
    } catch (error) {
        console.error('❌ Error creating work hours chart:', error);
        showNoDataMessage(ctx, 'Error loading work hours data');
    }
}

// Severity Breakdown Chart (Doughnut Chart)
function initSeverityChart(vulnerabilitiesData) {
    const ctx = document.getElementById('severityChart');
    if (!ctx || !vulnerabilitiesData || vulnerabilitiesData.length === 0) {
        console.log('⚠️ No data available for severity chart');
        showNoDataMessage(ctx, 'No vulnerability data available');
        return;
    }
    
    try {
        const severityData = processSeverityData(vulnerabilitiesData);
        
        const config = {
            type: 'doughnut',
            data: {
                labels: severityData.labels,
                datasets: [{
                    data: severityData.counts,
                    backgroundColor: [
                        CHART_COLORS.danger,   // Critical
                        CHART_COLORS.warning,  // High
                        CHART_COLORS.info,     // Medium
                        CHART_COLORS.muted     // Low
                    ],
                    borderColor: CHART_COLORS.dark,
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                ...defaultChartConfig,
                cutout: '60%',
                plugins: {
                    ...defaultChartConfig.plugins,
                    title: {
                        display: true,
                        text: 'Vulnerability Severity Distribution',
                        color: CHART_COLORS.primary,
                        font: {
                            family: "'Courier New', monospace",
                            size: 14
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: CHART_COLORS.primary,
                        bodyColor: CHART_COLORS.light,
                        borderColor: CHART_COLORS.primary,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
        
        // Destroy existing chart if it exists
        if (chartInstances.severity) {
            chartInstances.severity.destroy();
        }
        
        chartInstances.severity = new Chart(ctx, config);
        console.log('✅ Severity chart created successfully');
        
    } catch (error) {
        console.error('❌ Error creating severity chart:', error);
        showNoDataMessage(ctx, 'Error loading severity data');
    }
}

// Earnings Chart (Line Chart)
function initEarningsChart(vulnerabilitiesData) {
    const ctx = document.getElementById('earningsChart');
    if (!ctx || !vulnerabilitiesData || vulnerabilitiesData.length === 0) {
        console.log('⚠️ No data available for earnings chart');
        showNoDataMessage(ctx, 'No earnings data available');
        return;
    }
    
    try {
        const earningsData = processEarningsData(vulnerabilitiesData);
        
        const config = {
            type: 'line',
            data: {
                labels: earningsData.labels,
                datasets: [{
                    label: 'Cumulative Earnings',
                    data: earningsData.cumulative,
                    borderColor: CHART_COLORS.warning,
                    backgroundColor: createGradient(ctx, CHART_COLORS.warning, true),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: CHART_COLORS.warning,
                    pointBorderColor: CHART_COLORS.dark,
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Daily Earnings',
                    data: earningsData.daily,
                    borderColor: CHART_COLORS.accent,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: CHART_COLORS.accent,
                    pointBorderColor: CHART_COLORS.dark,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...defaultChartConfig,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    ...defaultChartConfig.plugins,
                    title: {
                        display: true,
                        text: 'Earnings Over Time',
                        color: CHART_COLORS.primary,
                        font: {
                            family: "'Courier New', monospace",
                            size: 16
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: CHART_COLORS.primary,
                        bodyColor: CHART_COLORS.light,
                        borderColor: CHART_COLORS.primary,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    ...defaultChartConfig.scales,
                    y: {
                        ...defaultChartConfig.scales.y,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount ($)',
                            color: CHART_COLORS.muted
                        },
                        ticks: {
                            ...defaultChartConfig.scales.y.ticks,
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    },
                    x: {
                        ...defaultChartConfig.scales.x,
                        title: {
                            display: true,
                            text: 'Date',
                            color: CHART_COLORS.muted
                        }
                    }
                }
            }
        };
        
        // Destroy existing chart if it exists
        if (chartInstances.earnings) {
            chartInstances.earnings.destroy();
        }
        
        chartInstances.earnings = new Chart(ctx, config);
        console.log('✅ Earnings chart created successfully');
        
    } catch (error) {
        console.error('❌ Error creating earnings chart:', error);
        showNoDataMessage(ctx, 'Error loading earnings data');
    }
}

// Helper function to create gradients
function createGradient(ctx, color, isArea = false) {
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    
    if (isArea) {
        gradient.addColorStop(0, color + '40'); // 25% opacity
        gradient.addColorStop(1, color + '10'); // 6% opacity
    } else {
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '80'); // 50% opacity
    }
    
    return gradient;
}

// Helper function to get last 14 days
function getLast14Days() {
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// Process work hours data
function processWorkHoursData(workSessions, days) {
    const hoursMap = {};
    
    // Initialize all days with 0 hours
    days.forEach(day => {
        hoursMap[day] = 0;
    });
    
    // Fill in actual work hours
    workSessions.forEach(session => {
        const dateStr = new Date(session.date).toISOString().split('T')[0];
        if (hoursMap.hasOwnProperty(dateStr)) {
            hoursMap[dateStr] = (session.minutes_worked || 0) / 60;
        }
    });
    
    return {
        labels: days.map(day => {
            const date = new Date(day);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        hours: days.map(day => hoursMap[day])
    };
}

// Process severity data
function processSeverityData(vulnerabilities) {
    const severityCounts = {
        'Critical': 0,
        'High': 0,
        'Medium': 0,
        'Low': 0
    };
    
    vulnerabilities.forEach(vuln => {
        if (severityCounts.hasOwnProperty(vuln.severity)) {
            severityCounts[vuln.severity]++;
        }
    });
    
    // Filter out zero counts for cleaner chart
    const filteredData = Object.entries(severityCounts)
        .filter(([_, count]) => count > 0);
    
    return {
        labels: filteredData.map(([severity, _]) => severity),
        counts: filteredData.map(([_, count]) => count)
    };
}

// Process earnings data
function processEarningsData(vulnerabilities) {
    // Sort vulnerabilities by date
    const sortedVulns = [...vulnerabilities].sort((a, b) => 
        new Date(a.reported_date) - new Date(b.reported_date)
    );
    
    const dailyEarnings = {};
    let cumulativeEarnings = 0;
    const cumulativeData = [];
    const dailyData = [];
    const labels = [];
    
    // Group by date and calculate daily earnings
    sortedVulns.forEach(vuln => {
        const dateStr = new Date(vuln.reported_date).toISOString().split('T')[0];
        if (!dailyEarnings[dateStr]) {
            dailyEarnings[dateStr] = 0;
        }
        dailyEarnings[dateStr] += vuln.bounty_amount || 0;
    });
    
    // Create cumulative and daily arrays
    Object.entries(dailyEarnings).sort().forEach(([date, amount]) => {
        cumulativeEarnings += amount;
        
        labels.push(new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }));
        dailyData.push(amount);
        cumulativeData.push(cumulativeEarnings);
    });
    
    return {
        labels,
        daily: dailyData,
        cumulative: cumulativeData
    };
}

// Show no data message
function showNoDataMessage(ctx, message) {
    if (!ctx) return;
    
    const parent = ctx.parentElement;
    if (parent) {
        parent.innerHTML = `
            <div class="text-center py-4">
                <div class="cyber-icon-large text-muted mb-3">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h6 class="text-muted">${message}</h6>
                <p class="small text-muted">Data will appear here as you track your work and log vulnerabilities.</p>
            </div>
        `;
    }
}

// Function to update charts with new data
function updateCharts(workSessionsData, vulnerabilitiesData) {
    console.log('🔄 Updating charts with new data');
    
    // Destroy existing charts
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Reinitialize charts
    initializeCharts(workSessionsData, vulnerabilitiesData);
}

// Function to resize all charts
function resizeCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    setTimeout(resizeCharts, 100);
});

// Export functions for global use
window.ChartManager = {
    initialize: initializeCharts,
    update: updateCharts,
    resize: resizeCharts,
    instances: chartInstances
};

console.log('📊 Charts module loaded successfully');
console.log('🛠️ Chart functions available at window.ChartManager');
