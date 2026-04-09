import { calculateGlobalXP } from '../lib/xp-utils.js';

export function createFitnessSlice(state, notify, syncService) {
    const updateFitness = (data) => {
        if (!state.settings) state.settings = {};
        if (!state.settings.fitness) state.settings.fitness = {};
        
        state.settings.fitness = { ...state.settings.fitness, ...data };
        
        // Recalculate XP on every change
        state.settings.fitness.xp = calculateGlobalXP(state.settings.fitness);
        
        localStorage.setItem('mangaka_settings', JSON.stringify(state.settings));
        syncService.pushUserData();
        notify();
    };

    const logWorkout = (session) => {
        const fitness = state.settings.fitness || {};
        const musculationSessions = [...(fitness.musculationSessions || [])];
        
        // Calculate session volume
        let totalVolume = 0;
        session.exercises.forEach(ex => {
            totalVolume += (parseFloat(ex.reps) || 0) * (parseFloat(ex.weight) || 0);
        });

        const newSession = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            totalVolume,
            ...session
        };

        musculationSessions.push(newSession);
        
        // Update streaks
        const streak = calculateStreak([...musculationSessions, ...(fitness.cardioSessions || [])]);
        
        updateFitness({ musculationSessions, streak });
    };

    const logCardio = (session) => {
        const fitness = state.settings.fitness || {};
        const cardioSessions = [...(fitness.cardioSessions || [])];
        cardioSessions.push({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...session
        });
        
        // Update streaks
        const streak = calculateStreak([...cardioSessions, ...(fitness.musculationSessions || [])]);
        
        updateFitness({ cardioSessions, streak });
    };

    const calculateStreak = (allSessions) => {
        if (!allSessions || allSessions.length === 0) return 0;
        
        // Sort by date descending
        const sorted = allSessions
            .map(s => new Date(s.date).toDateString())
            .filter((v, i, a) => a.indexOf(v) === i) // Unique dates
            .sort((a, b) => new Date(b) - new Date(a));
            
        let streak = 0;
        let today = new Date();
        let current = today;
        
        // If no session today, check yesterday. If no session yesterday, streak is 0.
        const todayStr = today.toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;
        
        // Reset current to today for counting
        current = new Date();
        for (let i = 0; i < sorted.length; i++) {
            const dateStr = new Date(current).toDateString();
            if (sorted.includes(dateStr)) {
                streak++;
                current.setDate(current.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    const updateExercises = (exercises) => {
        updateFitness({ exercises });
    };

    const updateProgram = (program) => {
        updateFitness({ program });
    };

    const logHydration = (amount) => {
        const todayStr = new Date().toDateString();
        const fitness = state.settings.fitness || {};
        const hydration = { ...(fitness.hydration || {}) };
        hydration[todayStr] = Math.max(0, (hydration[todayStr] || 0) + amount);
        updateFitness({ hydration });
    };

    const resetHydration = () => {
        const todayStr = new Date().toDateString();
        const fitness = state.settings.fitness || {};
        const hydration = { ...(fitness.hydration || {}) };
        hydration[todayStr] = 0;
        updateFitness({ hydration });
    };

    const logNutrition = (data) => {
        const todayStr = new Date().toDateString();
        const fitness = state.settings.fitness || {};
        const nutrition = { ...(fitness.nutrition || {}) };
        nutrition[todayStr] = { ...(nutrition[todayStr] || {}), ...data };
        updateFitness({ nutrition });
    };

    const logMeasurement = (data) => {
        const fitness = state.settings.fitness || {};
        let measurements = [...(fitness.measurements || [])];
        const todayStr = new Date().toDateString();
        
        // Check if there's already a measurement today
        const existingIdx = measurements.findIndex(m => new Date(m.date).toDateString() === todayStr);
        
        if (existingIdx > -1) {
            // Update existing
            measurements[existingIdx] = {
                ...measurements[existingIdx],
                ...data,
                date: new Date().toISOString() // Update time to latest entry
            };
        } else {
            // Add new
            measurements.push({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                ...data
            });
        }
        
        updateFitness({ measurements });
    };

    const deleteMeasurement = (id) => {
        const fitness = state.settings.fitness || {};
        const measurements = (fitness.measurements || []).filter(m => m.id !== id);
        updateFitness({ measurements });
    };

    const updateFitnessSettings = (data) => {
        updateFitness(data);
    };

    return {
        logWorkout,
        logCardio,
        updateExercises,
        updateProgram,
        logHydration,
        resetHydration,
        logNutrition,
        logMeasurement,
        deleteMeasurement,
        updateFitnessSettings
    };
}
