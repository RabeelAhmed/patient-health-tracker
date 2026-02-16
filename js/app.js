/**
 * Main Application Module
 */

import * as Storage from './storage.js';
import * as UI from './ui.js';
import * as Charts from './charts.js';
import { generatePDF } from './report.js';

// DOM Elements
const form = document.getElementById('healthForm');
const cancelBtn = document.getElementById('cancelEdit');

// App Initialization
const init = () => {
    // Init Theme
    UI.initTheme();

    // Initial Render
    refreshUI();
    
    // Setup Backup/Restore
    setupDataPersistence();
    
    // Init Charts
    Charts.initCharts();
    
    // Add Event Listeners
    setupEventListeners();
};

const setupEventListeners = () => {
    form.addEventListener('submit', handleFormSubmit);
    
    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', UI.toggleTheme);

    // Filter Change
    document.getElementById('timeFilter').addEventListener('change', refreshUI);

    // Export PDF
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
             const allRecords = Storage.getRecords();
             const filterValue = document.getElementById('timeFilter').value;
             let filteredRecords = allRecords;
             let periodName = "All_Time";
             
             if (filterValue !== 'all') {
                const now = new Date();
                filteredRecords = allRecords.filter(r => {
                    const recordDate = new Date(r.date);
                    const diffTime = Math.abs(now - recordDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    if (filterValue === 'week') return diffDays <= 7;
                    if (filterValue === 'month') return diffDays <= 30;
                    return true;
                });
                periodName = filterValue === 'week' ? 'Last_7_Days' : 'Last_30_Days';
             }
             
             generatePDF(filteredRecords, periodName);
        });
    }

    // Global Event Delegation for Edit/Delete in Table
    document.getElementById('recordsTableBody').addEventListener('click', (e) => {
        // Handle Edit
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const date = editBtn.dataset.date;
            const record = Storage.getRecordByDate(date);
            if (record) {
                UI.populateForm(record);
                // Optionally change submit button text or add a hidden mode indicator
                // But logic handles by date merging so standard submit works fine
            }
        }

        // Handle Delete
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const date = deleteBtn.dataset.date;
            
            UI.showConfirmModal(
                'Delete Record?', 
                `Are you sure you want to delete the record for ${date}?`
            ).then((confirmed) => {
                if (confirmed) {
                    Storage.deleteRecord(date);
                    refreshUI();
                    UI.showAlert('Record deleted successfully');
                }
            });
        }
    });
};

const handleFormSubmit = (e) => {
    e.preventDefault();

    // Get Values
    const date = document.getElementById('date').value;
    const systolic = document.getElementById('systolic').value;
    const diastolic = document.getElementById('diastolic').value;
    const sugarBefore = document.getElementById('sugarBefore').value;
    const sugarAfter = document.getElementById('sugarAfter').value;
    const notes = document.getElementById('notes').value;

    // Validation
    if (!date) {
        UI.showAlert('Please select a date', 'error');
        return;
    }

    // Check if at least one health metric is provided
    if (!systolic && !diastolic && !sugarBefore && !sugarAfter) {
        UI.showAlert('Please enter at least one health reading (BP or Sugar)', 'error');
        return;
    }

    // Basic Numeric Range Validation (Optional but good)
    if ((systolic && systolic < 0) || (diastolic && diastolic < 0) || 
        (sugarBefore && sugarBefore < 0) || (sugarAfter && sugarAfter < 0)) {
        UI.showAlert('Values cannot be negative', 'error');
        return;
    }

    const record = {
        date,
        systolic: systolic ? parseFloat(systolic) : '',
        diastolic: diastolic ? parseFloat(diastolic) : '',
        sugarBefore: sugarBefore ? parseFloat(sugarBefore) : '',
        sugarAfter: sugarAfter ? parseFloat(sugarAfter) : '',
        notes
    };

    Storage.saveRecord(record);
    
    refreshUI();
    UI.showAlert('Record saved successfully!');
    
    // Reset form
    form.reset();
    // Reset date to today? Maybe
    document.getElementById('date').valueAsDate = new Date();
};

const refreshUI = () => {
    const allRecords = Storage.getRecords();
    const filterValue = document.getElementById('timeFilter').value;
    
    let displayedRecords = allRecords;

    if (filterValue !== 'all') {
        const now = new Date();
        // Reset time part to ensure full day coverage if needed, or just compare timestamps
        // Simple day difference check
        
        displayedRecords = allRecords.filter(r => {
            const recordDate = new Date(r.date);
            const diffTime = Math.abs(now - recordDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (filterValue === 'week') {
                return diffDays <= 7;
            }
            if (filterValue === 'month') {
                return diffDays <= 30;
            }
            return true;
        });
    }

    UI.renderTable(displayedRecords);
    UI.renderSummary(Storage.calculateStats(displayedRecords));
    Charts.updateCharts(displayedRecords);
};

// Backup/Restore Logic
const setupDataPersistence = () => {
    const backupBtn = document.getElementById('backupBtn');
    const restoreBtn = document.getElementById('restoreBtn');
    const restoreInput = document.getElementById('restoreInput');
    
    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            const data = Storage.exportRecords();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `health_data_backup_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            UI.showAlert('Backup downloaded successfully!');
        });
    }
    
    if (restoreBtn && restoreInput) {
        restoreBtn.addEventListener('click', () => {
            restoreInput.click();
        });
        
        restoreInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const json = event.target.result;
                const result = Storage.importRecords(json);
                
                if (result.success) {
                    refreshUI();
                    UI.showAlert(`Successfully restored ${result.count} records!`);
                } else {
                    UI.showAlert('Failed to restore data: ' + result.error, 'error');
                }
                
                // Reset input
                restoreInput.value = '';
            };
            reader.readAsText(file);
        });
    }
};

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', init);
