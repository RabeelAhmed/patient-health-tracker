/**
 * Storage Module
 * Handles all interactions with LocalStorage
 */

const STORAGE_KEY = 'patient_health_data';

// Helper to get all data
export const getRecords = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

// Helper to save all data
const saveAllRecords = (records) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

/**
 * Saves or Updates a record
 * Implements "Partial Entry" logic:
 * If a record for the given date exists, it merges the new non-empty values.
 * @param {Object} newRecord 
 */
export const saveRecord = (newRecord) => {
    const records = getRecords();
    const existingIndex = records.findIndex(r => r.date === newRecord.date);

    if (existingIndex >= 0) {
        // Merge existing record with new data
        // Only overwrite if new data is provided/valid (not null/undefined)
        // Actually, requirement says "Empty fields should be stored as null or empty string"
        // But for partial updates, we probably want to keep existing values if the user left the field blank in the UPDATE form?
        // Wait, the requirement says "Allow updating the same date later with new values (e.g., add after-meal sugar later)"
        // This implies if I enter just BP now, and later enter Sugar, the BP should remain.
        
        const existing = records[existingIndex];
        
        // We merge: if newRecord has a value, use it. If it's null/empty, keep existing? 
        // Or does the form send everything?
        // Let's assume the form sends what the user inputs.
        // A safe merge strategy for "adding later" is:
        // If new value is truthy (or 0), update. If empty string/null, keep old value UNLESS user explicitly cleared it?
        // Simpler approach for now:
        // The form will load existing data if date matches? No, that's complex validation.
        // Let's implement a merge that favors non-empty new values, or overwrites if we edit.
        // For "Partial Entry": 
        // User enters Date + BP. Save. -> Record: {date, bp, sugar:null}
        // User enters Date + Sugar. Save. -> Should we fetch existing first?
        // If we don't fetch existing, we might overwrite BP with null.
        // So yes, we merge.
        
        const mergedRecord = { ...existing, ...newRecord };
        
        // However, if we want to allow "editing/clearing", we need to know if it's an "add" or "edit" action.
        // But for "adding later" simple merge of non-nulls is best. 
        // Let's filter newRecord to remove empty strings/nulls before merging?
        // Actually, let's keep it simple: The UI should probably handle loading existing data if we want full editing control.
        // IMPORTANT: The requirement says "Allow updating the same date later".
        // Let's assume we implement a smart merge in the storage.
        
        // Iterate over keys in newRecord
        Object.keys(newRecord).forEach(key => {
            if (newRecord[key] !== "" && newRecord[key] !== null && newRecord[key] !== undefined) {
                mergedRecord[key] = newRecord[key];
            }
        });
        
        records[existingIndex] = mergedRecord;
    } else {
        records.push(newRecord);
    }
    
    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    saveAllRecords(records);
    return true;
};

export const deleteRecord = (date) => {
    const records = getRecords();
    const filtered = records.filter(r => r.date !== date);
    saveAllRecords(filtered);
};

export const clearAllRecords = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getRecordByDate = (date) => {
    const records = getRecords();
    return records.find(r => r.date === date);
};

export const calculateStats = (records) => {
    if (!records || records.length === 0) return null;

    let sysSum = 0, sysCount = 0;
    let diaSum = 0, diaCount = 0;
    let sugarBeforeSum = 0, sugarBeforeCount = 0;
    let sugarAfterSum = 0, sugarAfterCount = 0;

    records.forEach(r => {
        if (r.systolic) { sysSum += r.systolic; sysCount++; }
        if (r.diastolic) { diaSum += r.diastolic; diaCount++; }
        if (r.sugarBefore) { sugarBeforeSum += r.sugarBefore; sugarBeforeCount++; }
        if (r.sugarAfter) { sugarAfterSum += r.sugarAfter; sugarAfterCount++; }
    });

    return {
        avgSys: sysCount ? Math.round(sysSum / sysCount) : 0,
        avgDia: diaCount ? Math.round(diaSum / diaCount) : 0,
        avgSugarBefore: sugarBeforeCount ? Math.round(sugarBeforeSum / sugarBeforeCount) : 0,
        avgSugarAfter: sugarAfterCount ? Math.round(sugarAfterSum / sugarAfterCount) : 0
    };
};

// Export all data as JSON string
export const exportRecords = () => {
    return JSON.stringify(getRecords(), null, 2);
};

// Import data from JSON string
export const importRecords = (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: Expected an array of records.');
        }
        
        // Validate records structure roughly? 
        // For now, assume compliant if it's an array, but let's be safe and merge/save
        // We will overwrite implementation: Clear + Save All, OR Merge?
        // User requesting persistence suggests SAFETY.
        // Merging is safer than overwriting if they import a partial backup.
        // However, "Restore" usually implies returning to a state.
        // Let's implement a merge strategy: 
        // For each record in import, saveRecord(r), which handles updates/adds.
        
        let count = 0;
        data.forEach(record => {
            if (record.date) { // minimal validation
                // We'll reimplement safe saving logic or reuse saveRecord
                // Note: saveRecord reads/writes to storage every time. Ideally we do batch.
                // But for client side with <1000 records, it's fine.
                saveRecord(record); 
                count++;
            }
        });
        
        return { success: true, count };
    } catch (e) {
        console.error("Import Error:", e);
        return { success: false, error: e.message };
    }
};
