import { deepMerge } from '../lib/utils.js';

export function createSettingsSlice(state, notify, syncService) {
    const updateSettings = (newSettings) => {
        state.settings = deepMerge(state.settings, newSettings);
        localStorage.setItem('mangaka_settings', JSON.stringify(state.settings));
        syncService.pushUserData();
        notify();
    };

    const saveCharacters = (characters) => {
        updateSettings({ characters });
    };

    const saveGeminiKey = (key) => {
        updateSettings({ geminiKey: key });
    };

    const saveBrainstormingHistory = (projectId, history) => {
        if (!state.settings.brainstormingHistories) state.settings.brainstormingHistories = {};
        const histories = { ...state.settings.brainstormingHistories };
        histories[projectId] = history;
        updateSettings({ brainstormingHistories: histories });
    };

    return {
        updateSettings,
        saveCharacters,
        saveGeminiKey,
        saveBrainstormingHistory
    };
}
