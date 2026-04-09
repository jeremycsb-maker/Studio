import { supabase } from './lib/supabase.js';
import { getAllProjects } from './db.js';
import { deepMerge } from './lib/utils.js';
import { createSyncService } from './store/sync.js';
import { createUserSlice } from './store/user.js';
import { createProjectsSlice } from './store/projects.js';
import { createSettingsSlice } from './store/settings.js';
import { createStatsSlice } from './store/stats.js';
import { createFitnessSlice } from './store/fitness.js';
import { createHygieneSlice } from './store/hygiene.js';

export function createStore() {
    // --- Initial State Hydration ---
    let currentUser = null;
    let cachedSettings = null;
    let cachedStats = null;

    try {
        const stored = localStorage.getItem('mangaka_user');
        if (stored && stored !== 'undefined') {
            currentUser = JSON.parse(stored);
        }
        
        const storedSettings = localStorage.getItem('mangaka_settings');
        if (storedSettings) cachedSettings = JSON.parse(storedSettings);
        
        const storedStats = localStorage.getItem('mangaka_stats');
        if (storedStats) cachedStats = JSON.parse(storedStats);
    } catch (e) {
        console.error('Failed to parse data from localStorage', e);
    }

    const defaultSettings = {
        pomodoro: {
            work: 25,
            shortBreak: 5,
            longBreak: 15,
            soundId: 'chime',
            presets: [
                { id: 'p1', name: 'Standard', work: 25, break: 5 },
                { id: 'p2', name: 'Focus Long', work: 50, break: 10 },
                { id: 'p3', name: 'Sprint', work: 15, break: 3 }
            ]
        },
        spotify: {
            presets: [
                { id: 'lofi', name: 'Lofi Focus', url: 'https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM', icon: 'coffee' },
                { id: 'japan', name: 'Japan Focus', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Ueb99sM30a', icon: 'music' },
                { id: 'synth', name: 'Synthwave', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7Spsv1S', icon: 'zap' }
            ]
        },
        alarmVolume: 0.7,
        alarmSounds: [
            { id: 'chime', name: 'Chime (Doux)' },
            { id: 'digital', name: 'Digital (Bip)' },
            { id: 'bell', name: 'Bell (Résonnant)' },
            { id: 'pulse', name: 'Pulse (Rythmé)' }
        ],
        alarms: [],
        characters: [],
        goals: {
            storyboard: 4,
            penciled: 3,
            inked: 3,
            finished: 2
        },
        geminiKey: '',
        geminiModel: 'gemini-1.5-flash',
        brainstormingHistories: {},
        accentColor: '#3b82f6',
        fitness: {
            program: [
                { day: 0, type: 'rest', name: 'Repos' },
                { day: 1, type: 'musculation', name: 'Full Body A' },
                { day: 2, type: 'cardio', name: 'Cardio' },
                { day: 3, type: 'musculation', name: 'Full Body B' },
                { day: 4, type: 'cardio', name: 'Cardio' },
                { day: 5, type: 'musculation', name: 'Full Body C' },
                { day: 6, type: 'rest', name: 'Repos' }
            ],
            exercises: {
                'Full Body A': [
                    { name: 'Squat', sets: 3 },
                    { name: 'Développé Couché', sets: 3 },
                    { name: 'Tirage Buste (Rows)', sets: 3 },
                    { name: 'Élévations Latérales', sets: 3 },
                    { name: 'Face Pulls', sets: 3 }
                ],
                'Full Body B': [
                    { name: 'Soulevé de Terre (Deadlift)', sets: 3 },
                    { name: 'Développé Militaire', sets: 3 },
                    { name: 'Tirage Vertical (Lat Pulldown)', sets: 3 },
                    { name: 'Leg Curls', sets: 3 },
                    { name: 'Curl Biceps', sets: 3 }
                ],
                'Full Body C': [
                    { name: 'Fentes', sets: 3 },
                    { name: 'Développé Incliné', sets: 3 },
                    { name: 'Tirage Horizontal (Cable Row)', sets: 3 },
                    { name: 'Extensions Triceps', sets: 4 },
                    { name: 'Abs / Gainage', sets: 3 }
                ]
            },
            musculationSessions: [],
            cardioSessions: [],
            measurements: [],
            hydration: {}, // { "DateString": liters }
            nutrition: {},  // { "DateString": { protein, calories... } }
            streak: 0,
            waterGoal: 2.5, // Liters
            proteinGoal: 150 // Grams
        },
        hygiene: {
            activeCycle: 'normal', // 'normal', 'rush', 'repos'
            morningRoutine: [
                { id: 'm1', name: 'Se brosser les dents', icon: 'zap', isEssential: true },
                { id: 'm2', name: 'Laver le visage', icon: 'droplet', isEssential: true },
                { id: 'm3', name: 'Hydrater la peau', icon: 'sparkles', isEssential: false }
            ],
            eveningRoutine: [
                { id: 'e1', name: 'Se brosser les dents', icon: 'zap', isEssential: true },
                { id: 'e2', name: 'Douche', icon: 'droplet', isEssential: true },
                { id: 'e3', name: 'Soins visage soir', icon: 'moon', isEssential: false }
            ],
            logs: {}, // { "DateString": { morning: boolean, evening: boolean, completedItems: [] } }
            streak: 0
        }
    };

    const state = {
        user: currentUser || null,
        isAuthenticated: !!currentUser,
        projects: [],
        stats: cachedStats || { daily: {}, history: [], streaks: { current: 0, best: 0 } },
        settings: cachedSettings ? deepMerge(defaultSettings, cachedSettings) : defaultSettings,
        alarmActive: false,
        focusMode: false,
        silentMode: false,
        isSyncing: false,
        lastSyncStatus: 'synced',
        lastSyncError: null,
        audioContext: null
    };

    // --- Core Infrastructure ---
    const listeners = [];
    const subscribe = (listener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    };

    const notify = () => {
        listeners.forEach(l => l(state));
    };

    // --- Sub-modules Initialization ---
    const syncService = createSyncService(state, notify);
    const userSlice = createUserSlice(state, notify, syncService, defaultSettings);
    const projectsSlice = createProjectsSlice(state, notify, syncService);
    const settingsSlice = createSettingsSlice(state, notify, syncService);
    const statsSlice = createStatsSlice(state, notify, syncService);
    const fitnessSlice = createFitnessSlice(state, notify, syncService);
    const hygieneSlice = createHygieneSlice(state, notify, syncService);

    // --- Global Actions & Utilities ---
    const unlockAudio = () => {
        if (!state.audioContext) {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (state.audioContext.state === 'suspended') {
            state.audioContext.resume();
        }
    };

    const toggleSilentMode = () => {
        state.silentMode = !state.silentMode;
        notify();
    };

    const setAlarmActive = (active) => {
        state.alarmActive = active;
        notify();
    };

    const setFocusMode = (active) => {
        state.focusMode = active;
        notify();
    };

    // --- Initial Load ---
    if (state.isAuthenticated) {
        getAllProjects(state.user.email).then(localProjects => {
            if (localProjects.length > 0 && state.projects.length === 0) {
                state.projects = localProjects;
                notify();
            }
            syncService.fetchUserData();
        });
    }

    // --- Public API (Backward Compatible) ---
    return {
        // State getters
        get user() { return state.user; },
        get projects() { return state.projects; },
        get stats() { return state.stats; },
        get settings() { return state.settings; },
        get isAuthenticated() { return state.isAuthenticated; },
        get isSyncing() { return state.isSyncing; },
        get lastSyncStatus() { return state.lastSyncStatus; },
        get lastSyncError() { return state.lastSyncError; },
        get audioContext() { return state.audioContext; },
        get careerStats() { return statsSlice.getCareerStats(); },

        // Core methods
        subscribe,
        forceSync: () => syncService.fetchUserData(),
        
        // User actions
        setUser: userSlice.setUser,
        updateProfile: userSlice.updateProfile,
        logout: userSlice.logout,

        // Projects actions
        saveProject: projectsSlice.saveProject,
        deleteProject: projectsSlice.deleteProject,
        setProjects: projectsSlice.setProjects,

        // Settings actions
        updateSettings: settingsSlice.updateSettings,
        saveCharacters: settingsSlice.saveCharacters,
        saveGeminiKey: settingsSlice.saveGeminiKey,
        saveBrainstormingHistory: settingsSlice.saveBrainstormingHistory,

        // Stats actions
        logActivity: statsSlice.logActivity,
        clearTodayStats: statsSlice.clearTodayStats,

        // Fitness actions
        logWorkout: fitnessSlice.logWorkout,
        logCardio: fitnessSlice.logCardio,
        logHydration: fitnessSlice.logHydration,
        resetHydration: fitnessSlice.resetHydration,
        logNutrition: fitnessSlice.logNutrition,
        logMeasurement: fitnessSlice.logMeasurement,
        deleteMeasurement: fitnessSlice.deleteMeasurement,
        updateExercises: fitnessSlice.updateExercises,
        updateProgram: fitnessSlice.updateProgram,
        updateFitnessSettings: fitnessSlice.updateFitnessSettings,
        
        // Hygiene actions
        toggleHygieneItem: hygieneSlice.toggleRoutineItem,
        updateHygieneSettings: hygieneSlice.updateHygieneSettings,
        
        // UI/Env actions
        unlockAudio,
        toggleSilentMode,
        setAlarmActive,
        setFocusMode,

        // Supabase pass-through (used by components)
        supabase: supabase
    };
}
