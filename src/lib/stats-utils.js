/**
 * Utility functions for calculating production statistics and project completion forecasts.
 */

export function calculateKPIs(store, customAvgs = null) {
    const dailyStats = store.stats.daily || {};
    let totalFinishedAllTime = 0;
    
    // Cumulative Totals (All Time)
    Object.values(dailyStats).forEach(day => {
        totalFinishedAllTime += (day.finished || 0);
    });

    // 7-day Window Calculations
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });

    const last7Breakdown = {
        storyboard: { total: 0, workedDays: 0 },
        penciled: { total: 0, workedDays: 0 },
        inked: { total: 0, workedDays: 0 },
        finished: { total: 0, workedDays: 0 }
    };

    let workedDaysGlobal = 0;

    last7Days.forEach(d => {
        const day = dailyStats[d] || {};
        let hasAnyActivity = false;
        
        ['storyboard', 'penciled', 'inked', 'finished'].forEach(cat => {
            if (day[cat] > 0) {
                last7Breakdown[cat].total += day[cat];
                last7Breakdown[cat].workedDays++;
                hasAnyActivity = true;
            }
        });
        
        if (hasAnyActivity) workedDaysGlobal++;
    });

    const defaults = {
        storyboard: 4,
        penciled: 3,
        inked: 3,
        finished: 2
    };

    const realAvgs = {};
    ['storyboard', 'penciled', 'inked', 'finished'].forEach(cat => {
        const data = last7Breakdown[cat];
        realAvgs[cat] = data.workedDays > 0 ? (data.total / data.workedDays).toFixed(1) : defaults[cat].toString();
    });

    const weeklyAvgs = {};
    ['storyboard', 'penciled', 'inked', 'finished'].forEach(cat => {
        weeklyAvgs[cat] = (customAvgs && customAvgs[cat]) ? customAvgs[cat].toString() : realAvgs[cat];
    });

    const globalWeeklyAvg = workedDaysGlobal > 0 ? (last7Breakdown.finished.total / workedDaysGlobal).toFixed(1) : defaults.finished.toString();
    const globalSimAvg = (customAvgs?.finished || globalWeeklyAvg).toString();

    const projects = store.projects || [];
    const activeProject = projects[0];
    const realPrediction = calculatePrediction(realAvgs, activeProject);
    const simPrediction = calculatePrediction(weeklyAvgs, activeProject);

    return {
        total: totalFinishedAllTime,
        globalWeeklyAvg,
        realAvgs,
        weeklyAvgs,
        workedDaysGlobal,
        streak: store.stats.streaks?.current || 0,
        bestStreak: store.stats.streaks?.best || 0,
        prediction: realPrediction,
        simPrediction
    };
}

export function calculatePrediction(avgs, activeProject) {
    if (!activeProject) return { date: 'N/A', days: 0, projectTitle: 'Aucun', details: [] };

    let remaining = { storyboard: 0, penciled: 0, inked: 0, finished: 0 };
    
    activeProject.volumes?.forEach(v => {
        v.chapters?.forEach(c => {
            c.pages?.forEach(p => {
                const s = p.status || 0;
                if (s < 1) remaining.storyboard++;
                if (s < 2) remaining.penciled++;
                if (s < 3) remaining.inked++;
                if (s < 4) remaining.finished++;
            });
        });
    });

    const getPrediction = (totalDaysFromNow, label, color) => {
        const days = Math.ceil(totalDaysFromNow);
        if (days <= 0) return { label, date: 'Terminé !', color, days: 0 };
        const date = new Date();
        date.setDate(date.getDate() + days);
        return {
            label,
            date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            days,
            color
        };
    };

    const daysSB = remaining.storyboard / Math.max(0.1, parseFloat(avgs.storyboard));
    const daysPencil = daysSB + (remaining.penciled / Math.max(0.1, parseFloat(avgs.penciled)));
    const daysInk = daysPencil + (remaining.inked / Math.max(0.1, parseFloat(avgs.inked)));
    const daysFinish = daysInk + (remaining.finished / Math.max(0.1, parseFloat(avgs.finished)));

    const details = [
        getPrediction(daysSB, 'Storyboard', '#60a5fa'),
        getPrediction(daysPencil, 'Crayonné', '#22d3ee'),
        getPrediction(daysInk, 'Encrage', '#2dd4bf'),
        getPrediction(daysFinish, 'Finition', '#4ade80')
    ];

    const finishPred = details[3];

    return {
        date: remaining.finished > 0 ? new Date(Date.now() + finishPred.days * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Terminé !',
        days: finishPred.days || 0,
        projectTitle: activeProject.title,
        details
    };
}
