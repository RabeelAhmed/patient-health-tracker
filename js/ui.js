/**
 * UI Module
 * Handles DOM manipulation and rendering
 */

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

// Check values and return color class
const getValueColor = (value, type) => {
    // Simple thresholds (can be refined based on medical standards)
    // BP Systolic: Normal < 120, Elevated 120-129, High >= 130
    // BP Diastolic: Normal < 80, High >= 80
    // Sugar Before (Fasting): Normal 70-100, Warning 100-125, High >= 126
    // Sugar After: Normal < 140, Warning 140-199, High >= 200
    
    if (!value) return '';
    const num = parseFloat(value);
    
    if (type === 'systolic') {
        if (num < 120) return 'text-green-600 font-medium';
        if (num < 130) return 'text-yellow-600 font-medium';
        return 'text-red-600 font-bold';
    }
    if (type === 'diastolic') {
        if (num < 80) return 'text-green-600 font-medium';
        return 'text-red-600 font-bold';
    }
    if (type === 'sugarValBefore') {
        if (num < 100) return 'text-green-600 font-medium';
        if (num < 126) return 'text-yellow-600 font-medium';
        return 'text-red-600 font-bold';
    }
    if (type === 'sugarValAfter') {
        if (num < 140) return 'text-green-600 font-medium';
        if (num < 200) return 'text-yellow-600 font-medium';
        return 'text-red-600 font-bold';
    }
    return '';
};

export const renderTable = (records) => {
    const tableBody = document.getElementById('recordsTableBody');
    tableBody.innerHTML = '';
    
    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500 italic">
                    No records found. Start by adding one!
                </td>
            </tr>
        `;
        return;
    }

    records.forEach(record => {
        const row = document.createElement('tr');
        row.className = 'bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                ${formatDate(record.date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                ${record.systolic && record.diastolic ? 
                    `<span class="${getValueColor(record.systolic, 'systolic')}">${record.systolic}</span> / 
                     <span class="${getValueColor(record.diastolic, 'diastolic')}">${record.diastolic}</span> mmHg` 
                    : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                ${record.sugarBefore ? 
                    `<span class="${getValueColor(record.sugarBefore, 'sugarValBefore')}">${record.sugarBefore}</span> mg/dL` 
                    : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                ${record.sugarAfter ? 
                    `<span class="${getValueColor(record.sugarAfter, 'sugarValAfter')}">${record.sugarAfter}</span> mg/dL` 
                    : '-'}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title="${record.notes || ''}">
                ${record.notes || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3 edit-btn" data-date="${record.date}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 delete-btn" data-date="${record.date}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

export const showAlert = (message, type = 'success') => {
    // Determine icon and color based on type
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const colorClass = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed bottom-4 right-4 z-50 flex items-center p-4 mb-4 border-l-4 rounded shadow-lg transform transition-all duration-300 translate-y-full opacity-0 ${colorClass}`;
    alertDiv.innerHTML = `
        <i class="fas ${icon} mr-3 text-lg"></i>
        <span class="font-medium">${message}</span>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Animate in
    requestAnimationFrame(() => {
        alertDiv.classList.remove('translate-y-full', 'opacity-0');
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        alertDiv.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 3000);
};

export const populateForm = (record) => {
    document.getElementById('date').value = record.date;
    document.getElementById('systolic').value = record.systolic || '';
    document.getElementById('diastolic').value = record.diastolic || '';
    document.getElementById('sugarBefore').value = record.sugarBefore || '';
    document.getElementById('sugarAfter').value = record.sugarAfter || '';
    document.getElementById('notes').value = record.notes || '';
    
    // Scroll to top/form
    document.getElementById('healthForm').scrollIntoView({ behavior: 'smooth' });
};

// Custom Confirmation Modal
export const showConfirmModal = (title, message) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');
        const backdrop = document.getElementById('modalBackdrop');

        // Set Content
        if(title) modalTitle.textContent = title;
        if(message) modalMessage.textContent = message;

        // Show Modal
        modal.classList.remove('hidden');
        // Small delay for CSS transition
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('div.bg-white').classList.remove('scale-95');
            modal.querySelector('div.bg-white').classList.add('scale-100');
        });

        // Handlers
        const close = (result) => {
            modal.classList.add('opacity-0');
            modal.querySelector('div.bg-white').classList.remove('scale-100');
            modal.querySelector('div.bg-white').classList.add('scale-95');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                resolve(result);
                // Cleanup listeners to avoid dupes if reused without cloning (though simple resolve is fine here)
            }, 300);
        };

        // One-time listeners
        confirmBtn.onclick = () => close(true);
        cancelBtn.onclick = () => close(false);
        backdrop.onclick = () => close(false);
    });
};

export const renderSummary = (stats) => {
    const avgBP = document.getElementById('avgBP');
    const avgSugarBefore = document.getElementById('avgSugarBefore');
    const avgSugarAfter = document.getElementById('avgSugarAfter');

    if (!stats) {
        avgBP.textContent = '-- / --';
        avgSugarBefore.textContent = '--';
        avgSugarAfter.textContent = '--';
        return;
    }

    // Set Text
    avgBP.textContent = `${stats.avgSys || '--'} / ${stats.avgDia || '--'}`;
    avgSugarBefore.textContent = stats.avgSugarBefore || '--';
    avgSugarAfter.textContent = stats.avgSugarAfter || '--';

    // Set Colors (Simple update)
    if (stats.avgSys) avgBP.className = `text-xl font-bold mt-1 ${getValueColor(stats.avgSys, 'systolic').split(' ')[0]}`;
    if (stats.avgSugarBefore) avgSugarBefore.className = `text-xl font-bold mt-1 ${getValueColor(stats.avgSugarBefore, 'sugarValBefore').split(' ')[0]}`;
    if (stats.avgSugarAfter) avgSugarAfter.className = `text-xl font-bold mt-1 ${getValueColor(stats.avgSugarAfter, 'sugarValAfter').split(' ')[0]}`;
};

// Theme Toggling
export const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update UI Elements if needed (Tailwind 'dark:' classes handle most)
    updateThemeIcon(isDark);
};

export const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcon(false);
    }
};

const updateThemeIcon = (isDark) => {
    const btn = document.getElementById('themeToggleBtn');
    if(btn) {
        btn.innerHTML = isDark ? '<i class="fas fa-sun text-yellow-400 text-lg"></i>' : '<i class="fas fa-moon text-gray-500 text-lg"></i>';
    }
};
