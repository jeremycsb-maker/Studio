export function createStatsSlice(state, notify, syncService) {
    const calculateStreaks = () => {
        const dates = Object.keys(state.stats.daily).sort();
        if (dates.length === 0) return;

        let currentStreak = 0;
        let bestStreak = state.stats.streaks?.best || 0;
        
        const todayStr = new Date().toISOString().split('T')[0];
        let checkDate = new Date();
        
        while (true) {
            const dStr = checkDate.toISOString().split('T')[0];
            const dayData = state.stats.daily[dStr];
            
            const hasActivity = dayData && (dayData.storyboard > 0 || dayData.penciled > 0 || dayData.inked > 0 || dayData.finished > 0);
            
            if (hasActivity) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (dStr === todayStr) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue;
                }
                break;
            }
        }

        state.stats.streaks = {
            current: currentStreak,
            best: Math.max(bestStreak, currentStreak)
        };
    };

    const logActivity = (newStatus, prevStatus) => {
        if (state.silentMode) return;

        const today = new Date().toISOString().split('T')[0];
        if (!state.stats.daily[today]) {
            state.stats.daily[today] = { storyboard: 0, penciled: 0, inked: 0, finished: 0 };
        }

        const statusMap = [null, 'storyboard', 'penciled', 'inked', 'finished'];
        if (newStatus > prevStatus) {
            const label = statusMap[newStatus];
            if (label) state.stats.daily[today][label]++;
        }
        
        calculateStreaks();
        
        localStorage.setItem('mangaka_stats', JSON.stringify(state.stats));
        syncService.pushUserData();
        notify();
    };

    const clearTodayStats = () => {
        const today = new Date().toISOString().split('T')[0];
        if (state.stats.daily[today]) {
            state.stats.daily[today] = { storyboard: 0, penciled: 0, inked: 0, finished: 0 };
            calculateStreaks();
            localStorage.setItem('mangaka_stats', JSON.stringify(state.stats));
            syncService.pushUserData();
            notify();
        }
    };

    const getCareerStats = () => {
        const totals = { storyboard: 0, penciled: 0, inked: 0, finished: 0 };
        
        (state.projects || []).forEach(project => {
            (project.volumes || []).forEach(volume => {
                (volume.chapters || []).forEach(chapter => {
                    (chapter.pages || []).forEach(page => {
                        const status = parseInt(page.status) || 0;
                        if (status >= 1) totals.storyboard++;
                        if (status >= 2) totals.penciled++;
                        if (status >= 3) totals.inked++;
                        if (status >= 4) totals.finished++;
                    });
                });
            });
        });
        
        return totals;
    };

    return {
        logActivity,
        clearTodayStats,
        getCareerStats,
        calculateStreaks
    };
}
