import Chart from 'chart.js/auto';
import { calculateKPIs } from '../lib/stats-utils.js';

export function initStatistics(container, store) {
    const dailyStats = store.stats.daily || {};
    
    // Initial simulation values from goals or defaults
    let simulation = {
        storyboard: store.settings.goals?.storyboard || 4,
        penciled: store.settings.goals?.penciled || 3,
        inked: store.settings.goals?.inked || 3,
        finished: store.settings.goals?.finished || 2
    };

    let isSimulating = false;

    const render = () => {
        const stats = calculateKPIs(store, simulation);
        
        container.innerHTML = `
            <div class="view-header">
                <div class="view-header-content">
                    <h1>Analyses de Production</h1>
                    <p>Tableau de bord de performance en temps réel.</p>
                </div>
                <div class="view-header-actions" style="gap: 1.5rem;">
                    <div id="sim-status-indicator" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: var(--accent-color); font-weight: 700; opacity: ${isSimulating ? '1' : '0'}; transition: opacity 0.3s ease;">
                        <i data-lucide="zap" style="width: 14px; height: 14px;"></i>
                        MODE SIMULATION
                    </div>
                    <button id="reset-today-stats-btn" class="btn-secondary btn-sm" style="color: var(--text-muted); border-color: var(--border-color); border: 1px solid var(--border-color); background: none; border-radius: 6px; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; gap: 0.5rem; padding: 6px 12px; transition: var(--transition);">
                        <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
                        Réinitialiser Aujourd'hui
                    </button>
                </div>
            </div>

            <div class="stats-container">
                <div class="stats-summary">
                    <div class="card kpi-card">
                        <span class="kpi-label">Pages Terminées</span>
                        <span class="kpi-value">${stats.total}</span>
                        <span class="kpi-trend trend-up">Pages finalisées</span>
                    </div>
                    <div class="card kpi-card" style="min-width: 250px;">
                        <span class="kpi-label">Moyenne / Jour Travaillé</span>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                            <span class="kpi-value">${stats.globalWeeklyAvg}</span>
                            <small style="font-size: 0.6rem; color: var(--text-muted); font-weight: 500;">pages/j</small>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.25rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem; font-size: 0.65rem; font-family: 'JetBrains Mono', monospace;">
                            <div style="color: #60a5fa; display: flex; justify-content: space-between;">SB: <b>${stats.realAvgs.storyboard}</b></div>
                            <div style="color: #22d3ee; display: flex; justify-content: space-between; padding-left: 8px;">CR: <b>${stats.realAvgs.penciled}</b></div>
                            <div style="color: #2dd4bf; display: flex; justify-content: space-between;">EN: <b>${stats.realAvgs.inked}</b></div>
                            <div style="color: #4ade80; display: flex; justify-content: space-between; padding-left: 8px;">FI: <b>${stats.realAvgs.finished}</b></div>
                        </div>
                        <span class="kpi-trend text-muted" style="margin-top: 0.4rem; font-size: 0.6rem;">Basé sur ${stats.workedDaysGlobal} j. travaillés</span>
                    </div>
                    <div class="card kpi-card">
                        <span class="kpi-label">Série Actuelle</span>
                        <span class="kpi-value">${stats.streak} j</span>
                        <span class="kpi-trend ${stats.streak > 0 ? 'trend-up' : ''}">Record: ${stats.bestStreak} j</span>
                    </div>
                    <div class="card kpi-card" style="border: 1px solid var(--accent-color); background: rgba(59, 130, 246, 0.03); min-width: 280px;">
                        <span class="kpi-label" style="color: var(--accent-color); font-weight: 800;">PRÉVISION FIN</span>
                        <div style="display: flex; flex-direction: column; gap: 0.4rem; margin: 0.5rem 0;">
                            <span class="kpi-value" style="font-size: 1.1rem; margin: 0;">${stats.prediction.date}</span>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; border-top: 1px solid rgba(59, 130, 246, 0.1); padding-top: 0.5rem;">
                                ${stats.prediction.details.map(d => `
                                    <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                                        <span style="font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${d.label}</span>
                                        <span style="font-size: 0.75rem; color: ${d.color}; font-weight: 800; font-family: 'JetBrains Mono', monospace;">${d.date}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <span class="kpi-trend text-muted">${stats.prediction.projectTitle}</span>
                    </div>
                </div>

                <div class="stats-grid-main">
                    <div class="card stats-card">
                        <div class="stats-header">
                            <h3>Progression Hebdomadaire</h3>
                            <p>Activités des 7 derniers jours par étape</p>
                        </div>
                        <div class="stats-chart-wrapper">
                            <canvas id="weekly-chart"></canvas>
                        </div>
                    </div>

                    <div class="stats-grid-side">
                        <div class="card stats-card simulation-card">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h3 style="margin: 0;">Simulateur & Objectifs</h3>
                                    <p style="margin: 0; font-size: 0.75rem;">Ajustez vos moyennes pour prévoir vos sorties.</p>
                                </div>
                                <i data-lucide="calculator" style="color: var(--accent-color); opacity: 0.5;"></i>
                            </div>

                            <div class="sim-grid">
                                <div class="sim-group">
                                    <label>Storyboard</label>
                                    <div class="sim-input-wrapper">
                                        <input type="number" class="sim-input" data-stage="storyboard" value="${simulation.storyboard}" step="0.5" min="0.1">
                                        <span class="sim-unit">p/j</span>
                                    </div>
                                    <span style="font-size: 0.6rem; color: #60a5fa; font-weight: 700; margin-top: 2px;">${stats.simPrediction.details[0]?.date || 'N/A'}</span>
                                </div>
                                <div class="sim-group">
                                    <label>Crayonné</label>
                                    <div class="sim-input-wrapper">
                                        <input type="number" class="sim-input" data-stage="penciled" value="${simulation.penciled}" step="0.5" min="0.1">
                                        <span class="sim-unit">p/j</span>
                                    </div>
                                    <span style="font-size: 0.6rem; color: #22d3ee; font-weight: 700; margin-top: 2px;">${stats.simPrediction.details[1]?.date || 'N/A'}</span>
                                </div>
                                <div class="sim-group">
                                    <label>Encrage</label>
                                    <div class="sim-input-wrapper">
                                        <input type="number" class="sim-input" data-stage="inked" value="${simulation.inked}" step="0.5" min="0.1">
                                        <span class="sim-unit">p/j</span>
                                    </div>
                                    <span style="font-size: 0.6rem; color: #2dd4bf; font-weight: 700; margin-top: 2px;">${stats.simPrediction.details[2]?.date || 'N/A'}</span>
                                </div>
                                <div class="sim-group">
                                    <label>Finition</label>
                                    <div class="sim-input-wrapper">
                                        <input type="number" class="sim-input" data-stage="finished" value="${simulation.finished}" step="0.5" min="0.1">
                                        <span class="sim-unit">p/j</span>
                                    </div>
                                    <span style="font-size: 0.6rem; color: #4ade80; font-weight: 700; margin-top: 2px;">${stats.simPrediction.details[3]?.date || 'N/A'}</span>
                                </div>
                            </div>

                            <div class="sim-actions">
                                <button id="btn-sim-reset" class="btn-sim-reset">Réinitialiser (Réel)</button>
                                <button id="btn-sim-save" class="btn-sim-save">
                                    <i data-lucide="target" style="width: 14px; height: 14px;"></i>
                                    Fixer comme Objectifs
                                </button>
                            </div>
                        </div>

                        <div class="card stats-card">
                            <h3>Répartition Globale</h3>
                            <div class="stats-chart-wrapper">
                                <canvas id="monthly-chart"></canvas>
                            </div>
                        </div>
                        <div class="card stats-card">
                            <h3>Tendance de Production</h3>
                            <div class="stats-chart-wrapper">
                                <canvas id="yearly-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            renderCharts();
            setupListeners();
        });
    };

    const setupListeners = () => {
        // Simulation Inputs
        document.querySelectorAll('.sim-input').forEach(input => {
            input.onchange = (e) => {
                const stage = e.target.dataset.stage;
                const value = parseFloat(e.target.value) || 0.1;
                simulation[stage] = value;
                isSimulating = true;
                
                render(); 
            };
        });

        // Reset to Real Averages
        const resetSimBtn = document.getElementById('btn-sim-reset');
        if (resetSimBtn) {
            resetSimBtn.onclick = () => {
                // To reset to real averages, we need to know what they were.
                // We'll just re-run initStatistics to get a fresh start without simulation overrides
                // Or better: calculate them real-time and swap
                const realStats = calculateKPIs(null); // Passing null to get real data
                simulation = {
                    storyboard: parseFloat(realStats.weeklyAvgs.storyboard),
                    penciled: parseFloat(realStats.weeklyAvgs.penciled),
                    inked: parseFloat(realStats.weeklyAvgs.inked),
                    finished: parseFloat(realStats.weeklyAvgs.finished)
                };
                isSimulating = false;
                render();
            };
        }

        // Save as Goals
        const saveGoalsBtn = document.getElementById('btn-sim-save');
        if (saveGoalsBtn) {
            saveGoalsBtn.onclick = () => {
                store.updateSettings({ goals: { ...simulation } });
                
                const btnContent = saveGoalsBtn.innerHTML;
                saveGoalsBtn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i> Enregistré !';
                saveGoalsBtn.style.background = 'var(--vibrant-success)';
                
                setTimeout(() => {
                    saveGoalsBtn.innerHTML = btnContent;
                    saveGoalsBtn.style.background = '';
                    if (window.lucide) window.lucide.createIcons();
                }, 2000);
                
                if (window.lucide) window.lucide.createIcons();
            };
        }

        const resetBtn = document.getElementById('reset-today-stats-btn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm("Voulez-vous vraiment effacer toute l'activité enregistrée aujourd'hui ? Cette action est irréversible (utile pour corriger un import massif).")) {
                    store.clearTodayStats();
                    initStatistics(container, store);
                }
            };
        }

        if (window.lucide) window.lucide.createIcons();
    };

    const renderCharts = () => {
        const weeklyCtx = document.getElementById('weekly-chart').getContext('2d');
        const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
        const yearlyCtx = document.getElementById('yearly-chart').getContext('2d');

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const labels = last7Days.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        });

        // Weekly Chart
        new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Storyboard', data: last7Days.map(d => dailyStats[d]?.storyboard || 0), backgroundColor: '#60a5fa', borderRadius: 4 },
                    { label: 'Crayonné', data: last7Days.map(d => dailyStats[d]?.penciled || 0), backgroundColor: '#22d3ee', borderRadius: 4 },
                    { label: 'Encré', data: last7Days.map(d => dailyStats[d]?.inked || 0), backgroundColor: '#2dd4bf', borderRadius: 4 },
                    { label: 'Terminé', data: last7Days.map(d => dailyStats[d]?.finished || 0), backgroundColor: '#4ade80', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'top', align: 'end', labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } } }
                },
                scales: {
                    y: { beginAtZero: true, stacked: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                    x: { stacked: true, grid: { display: false }, border: { display: false } }
                }
            }
        });

        // Global Distribution (Doughnut)
        const totals = {
            storyboard: Object.values(dailyStats).reduce((acc, day) => acc + (day.storyboard || 0), 0),
            penciled: Object.values(dailyStats).reduce((acc, day) => acc + (day.penciled || 0), 0),
            inked: Object.values(dailyStats).reduce((acc, day) => acc + (day.inked || 0), 0),
            finished: Object.values(dailyStats).reduce((acc, day) => acc + (day.finished || 0), 0)
        };

        new Chart(monthlyCtx, {
            type: 'doughnut',
            data: {
                labels: ['Storyboard', 'Crayonné', 'Encré', 'Terminé'],
                datasets: [{
                    data: [totals.storyboard || 0, totals.penciled || 0, totals.inked || 0, totals.finished || 0],
                    backgroundColor: ['#60a5fa', '#22d3ee', '#2dd4bf', '#4ade80'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'bottom', labels: { boxWidth: 10, padding: 15, font: { size: 11 } } }
                },
                cutout: '75%'
            }
        });

        // Yearly Trend (Line)
        new Chart(yearlyCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                datasets: [{
                    label: 'Productivité',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#3b82f6',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                        return gradient;
                    },
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { display: false, beginAtZero: true },
                    x: { grid: { display: false }, border: { display: false } }
                }
            }
        });
    };

    render();
}