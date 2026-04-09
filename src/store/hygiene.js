
export function createHygieneSlice(state, notify, syncService) {
    const updateHygiene = (data) => {
        if (!state.settings) state.settings = {};
        if (!state.settings.hygiene) state.settings.hygiene = {};
        
        state.settings.hygiene = { ...state.settings.hygiene, ...data };
        
        // Save and Sync
        localStorage.setItem('mangaka_settings', JSON.stringify(state.settings));
        syncService.pushUserData();
        notify();
    };

    const calculateHygieneStreak = (logs) => {
        const sortedDates = Object.keys(logs)
            .filter(date => logs[date].morning && logs[date].evening)
            .sort((a, b) => new Date(b) - new Date(a));

        if (sortedDates.length === 0) return 0;

        let streak = 0;
        let current = new Date();
        const todayStr = current.toDateString();
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        // Check if last complete day was today or yesterday
        if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) return 0;

        for (let i = 0; i < sortedDates.length; i++) {
            const dateStr = new Date(current).toDateString();
            if (logs[dateStr] && logs[dateStr].morning && logs[dateStr].evening) {
                streak++;
                current.setDate(current.getDate() - 1);
            } else if (dateStr === todayStr) {
                // Skip today if not yet complete, but continue checking from yesterday
                current.setDate(current.getDate() - 1);
                continue;
            } else {
                break;
            }
        }
        return streak;
    };

    const toggleRoutineItem = (type, itemId) => {
        const todayStr = new Date().toDateString();
        const hygiene = state.settings.hygiene || {};
        const logs = { ...(hygiene.logs || {}) };
        
        if (!logs[todayStr]) {
            logs[todayStr] = { morning: false, evening: false, completedItems: [] };
        }
        
        const completedItems = [...(logs[todayStr].completedItems || [])];
        const index = completedItems.indexOf(itemId);
        
        if (index > -1) {
            completedItems.splice(index, 1);
        } else {
            completedItems.push(itemId);
        }
        
        logs[todayStr].completedItems = completedItems;

        // Auto-check morning/evening if all items are done
        const morningItems = (hygiene.morningRoutine || []).map(i => i.id);
        const eveningItems = (hygiene.eveningRoutine || []).map(i => i.id);

        logs[todayStr].morning = morningItems.length > 0 && morningItems.every(id => completedItems.includes(id));
        logs[todayStr].evening = eveningItems.length > 0 && eveningItems.every(id => completedItems.includes(id));

        const streak = calculateHygieneStreak(logs);
        updateHygiene({ logs, streak });
    };

    const updateHygieneSettings = (data) => {
        updateHygiene(data);
    };

    const setActiveCycle = (cycle) => {
        updateHygiene({ activeCycle: cycle });
    };

    return {
        toggleRoutineItem,
        updateHygieneSettings,
        setActiveCycle
    };
}
