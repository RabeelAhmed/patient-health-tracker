/**
 * Charts Module
 * Handles Chart.js initialization and updates
 */

let bpChart = null;
let sugarChart = null;

export const initCharts = () => {
    // BP Chart
    const bpCtx = document.getElementById('bpChart').getContext('2d');
    bpChart = new Chart(bpCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Systolic',
                    data: [],
                    borderColor: 'rgb(239, 68, 68)', // Red-500
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Diastolic',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)', // Blue-500
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Blood Pressure Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 60,
                    suggestedMax: 160
                }
            }
        }
    });

    // Sugar Chart
    const sugarCtx = document.getElementById('sugarChart').getContext('2d');
    sugarChart = new Chart(sugarCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Before Meal',
                    data: [],
                    borderColor: 'rgb(16, 185, 129)', // Green-500
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'After Meal',
                    data: [],
                    borderColor: 'rgb(245, 158, 11)', // Amber-500
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Blood Sugar Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 70,
                    suggestedMax: 200
                }
            }
        }
    });
};

export const updateCharts = (records) => {
    // Sort records by date ascending for charts
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract recent 14 records for cleaner chart (or all if user wants?)
    // Let's show last 30 for now
    const recentRecords = sortedRecords.slice(-30);

    const labels = recentRecords.map(r => r.date);
    
    if (bpChart) {
        bpChart.data.labels = labels;
        bpChart.data.datasets[0].data = recentRecords.map(r => r.systolic);
        bpChart.data.datasets[1].data = recentRecords.map(r => r.diastolic);
        bpChart.update();
    }

    if (sugarChart) {
        sugarChart.data.labels = labels;
        sugarChart.data.datasets[0].data = recentRecords.map(r => r.sugarBefore);
        sugarChart.data.datasets[1].data = recentRecords.map(r => r.sugarAfter);
        sugarChart.update();
    }
};
