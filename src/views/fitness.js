
import Chart from 'chart.js/auto';
import { analyzeFitnessData } from '../lib/fitness-ai.js';
import { exportFitnessToCSV } from '../lib/export-utils.js';
import { calculateLevel, getProgressToNextLevel, determineClass, CLASSES } from '../lib/xp-utils.js';

export function initFitness(container, store) {
    let activeTab = 'workouts'; // 'workouts', 'body', 'nutrition', 'coach', 'athlete'
    let isAnalyzing = false;

    function render(isPartial = false) {
        const fitnessData = store.settings.fitness || {};
        const today = new Date().getDay();
        const todayPlan = (fitnessData.program || []).find(p => p.day === today) || { type: 'rest', name: 'Repos' };

        const shellExists = !!container.querySelector('.fitness-view-container');

        if (!shellExists || !isPartial) {
            container.innerHTML = `
                <div class="fitness-view-container">
                    <div class="view-header">
                        <div class="view-header-content">
                            <h1>Vitalité & Performance</h1>
                            <p>Optimisez votre physiologie pour maximiser votre créativité.</p>
                        </div>
                        <div class="view-header-actions">
                            <button class="studio-btn studio-btn-secondary" id="export-data-btn">
                                <i data-lucide="download"></i> Exporter
                            </button>
                            <button class="studio-btn studio-btn-primary" id="edit-program-btn">
                                <i data-lucide="settings"></i> Configuration
                            </button>
                        </div>
                    </div>

                    <div class="fitness-tabs-container">
                        <div class="fitness-tabs">
                            <button class="tab-link" data-tab="workouts">
                                <i data-lucide="dumbbell"></i> SÉANCES
                            </button>
                            <button class="tab-link" data-tab="body">
                                <i data-lucide="ruler"></i> BIOMÉTRIE
                            </button>
                            <button class="tab-link" data-tab="nutrition">
                                <i data-lucide="droplet"></i> NUTRITION
                            </button>
                            <button class="tab-link" data-tab="coach">
                                <i data-lucide="brain"></i> COACH IA
                            </button>
                            <button class="tab-link" data-tab="athlete">
                                <i data-lucide="award"></i> ATHLÈTE
                            </button>
                        </div>
                    </div>

                    <div id="tab-content-container">
                        ${renderActiveTab(activeTab, fitnessData, todayPlan)}
                    </div>
                </div>

                <div id="fitness-config-modal" class="modal-overlay hidden">
                    <div class="modal-card">
                        <div class="modal-header">
                            <h2>Configuration Globale</h2>
                            <button class="modal-close" id="close-modal"><i data-lucide="x"></i></button>
                        </div>
                        <div class="modal-body">
                             <p class="text-secondary" style="margin-bottom: 1.5rem;">Ajustez vos paramètres et objectifs de santé.</p>
                             <div id="config-content">${renderConfig(fitnessData)}</div>
                        </div>
                    </div>
                </div>

                <div id="exercise-guide-modal" class="modal hidden">
                    <div class="modal-content glass" style="max-width: 500px; text-align: center;">
                        <div id="guide-content"></div>
                        <button class="btn-primary" style="margin-top: 2rem; width: 100%;" onclick="document.getElementById('exercise-guide-modal').classList.add('hidden')">Fermer</button>
                    </div>
                </div>
            `;
            attachShellEvents();
        } else {
            const contentContainer = document.getElementById('tab-content-container');
            if (contentContainer) {
                contentContainer.innerHTML = renderActiveTab(activeTab, fitnessData, todayPlan);
            }
        }

        // Always update tab styles
        document.querySelectorAll('.tab-link').forEach(link => {
            link.classList.toggle('active', link.dataset.tab === activeTab);
        });

        requestAnimationFrame(() => {
            if (activeTab === 'workouts') renderWorkoutsCharts(fitnessData);
            if (activeTab === 'body') renderBodyCharts(fitnessData, window._lastBodyMetric || 'weight');
            if (activeTab === 'athlete') renderAthleteCharts(fitnessData);
            attachContentEvents();
            if (window.lucide) window.lucide.createIcons();
        });
    }

    function renderActiveTab(tab, data, plan) {
        switch (tab) {
            case 'workouts': return renderWorkoutsTab(data, plan);
            case 'body': return renderBodyTab(data);
            case 'nutrition': return renderNutritionTab(data);
            case 'coach': return renderCoachTab(data);
            case 'athlete': return renderAthleteTab(data);
            default: return '';
        }
    }

    function renderAthleteTab(data) {
        const xp = data.xp || 0;
        const level = calculateLevel(xp);
        const progress = getProgressToNextLevel(xp);
        const userClass = determineClass((data.musculationSessions || []).length, (data.cardioSessions || []).length);

        return `
            <div class="fitness-layout-grid">
                <div class="fitness-main-content">
                    <div class="studio-card" style="background: linear-gradient(135deg, var(--bg-primary), rgba(var(--accent-color-rgb), 0.05)); overflow: hidden; position: relative; padding: 2.5rem;">
                        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.1; transform: rotate(15deg);">
                            <i data-lucide="${userClass.icon}" style="width: 200px; height: 200px; color: ${userClass.color};"></i>
                        </div>
                        
                        <div style="display: flex; gap: 2.5rem; align-items: center; position: relative; z-index: 1;">
                            <div class="level-badge-large" style="width: 100px; height: 100px; background: ${userClass.color}; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 10px 25px ${userClass.color}40; border: 4px solid rgba(255,255,255,0.4);">
                                <span style="font-size: 0.7rem; font-weight: 800; color: white; text-transform: uppercase;">NIV</span>
                                <span style="font-size: 3.5rem; font-weight: 900; color: white; line-height: 1; font-family: 'Orbitron', sans-serif;">${level}</span>
                            </div>
                            
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.75rem;">
                                    <h2 style="margin: 0; font-family: 'Orbitron', sans-serif; font-size: 1.5rem;">${userClass.name.toUpperCase()}</h2>
                                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">${userClass.desc}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.85rem; font-weight: 700;">
                                    <span style="color: var(--text-secondary);">${xp} XP</span>
                                    <span style="color: var(--text-muted);">${progress}% vers le Niv. ${level + 1}</span>
                                </div>
                                <div class="progress-container" style="height: 12px; background: var(--bg-tertiary); border-radius: 6px;">
                                    <div class="progress-segment" style="width: ${progress}%; background: linear-gradient(90deg, ${userClass.color}, var(--vibrant-info)); border-radius: 6px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="studio-card">
                        <h3 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; font-family: 'Orbitron', sans-serif; font-size: 1.1rem;">
                            <i data-lucide="flame" style="color: #ef4444;"></i> Fréquence (12 Semaines)
                        </h3>
                        <div id="heatmap-container" style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 8px; background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
                            ${renderHeatmap(data)}
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 1rem; font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">
                            <span>Moins</span>
                            <div style="width: 12px; height: 12px; border-radius: 2px; background: var(--bg-tertiary);"></div>
                            <div style="width: 12px; height: 12px; border-radius: 2px; background: rgba(59, 130, 246, 0.3);"></div>
                            <div style="width: 12px; height: 12px; border-radius: 2px; background: rgba(59, 130, 246, 0.6);"></div>
                            <div style="width: 12px; height: 12px; border-radius: 2px; background: var(--accent-color);"></div>
                            <span>Plus</span>
                        </div>
                    </div>
                </div>

                <div class="fitness-sidebar">
                    <div class="card fitness-card" style="padding: 1rem;">
                        <h3 style="margin-bottom: 1.5rem; font-size: 0.9rem; text-align: center;">BALANCE DU PROFIL</h3>
                        <div style="height: 250px;"><canvas id="athlete-radar-chart"></canvas></div>
                    </div>
                    
                    <div class="card fitness-card" style="background: var(--bg-secondary); border: 1px dashed var(--border-color);">
                        <h4 style="font-size: 0.8rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="award" style="width: 14px; color: var(--vibrant-warning);"></i> Hauts Faits
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <div class="badge-mini active" title="Régulier"><i data-lucide="calendar"></i></div>
                            <div class="badge-mini ${data.streak >= 7 ? 'active' : ''}" title="Semaine de feu"><i data-lucide="flame"></i></div>
                            <div class="badge-mini ${level >= 5 ? 'active' : ''}" title="Initié"><i data-lucide="user-check"></i></div>
                            <div class="badge-mini ${level >= 10 ? 'active' : ''}" title="Expert"><i data-lucide="zap"></i></div>
                            <div class="badge-mini ${(data.musculationSessions || []).length >= 50 ? 'active' : ''}" title="Forgeron"><i data-lucide="anvil"></i></div>
                            <div class="badge-mini ${(data.cardioSessions || []).length >= 50 ? 'active' : ''}" title="Marathonien"><i data-lucide="wind"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderHeatmap(data) {
        const allSessions = [...(data.musculationSessions || []), ...(data.cardioSessions || [])];
        const sessionDates = allSessions.map(s => new Date(s.date).toDateString());

        // Let's build 12 weeks of history
        let html = '';
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - (12 * 7) + 1); // 12 weeks ago

        // Group by weeks for the grid columns
        for (let w = 0; w < 12; w++) {
            html += '<div style="display: grid; grid-template-rows: repeat(7, 1fr); gap: 8px;">';
            for (let d = 0; d < 7; d++) {
                const current = new Date(startDate);
                current.setDate(startDate.getDate() + (w * 7) + d);

                if (current > today) {
                    html += '<div style="width: 100%; aspect-ratio: 1; opacity: 0;"></div>';
                    continue;
                }

                const dateStr = current.toDateString();
                const sessionCount = allSessions.filter(s => new Date(s.date).toDateString() === dateStr).length;

                let opacity = 0;
                let bgColor = 'var(--bg-tertiary)';
                if (sessionCount === 1) { bgColor = 'rgba(59, 130, 246, 0.3)'; }
                else if (sessionCount === 2) { bgColor = 'rgba(59, 130, 246, 0.6)'; }
                else if (sessionCount >= 3) { bgColor = 'var(--accent-color)'; }

                html += `<div class="heatmap-cell" title="${current.toLocaleDateString()} : ${sessionCount} séance(s)" style="width: 100%; aspect-ratio: 1; background: ${bgColor}; border-radius: 2px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>`;
            }
            html += '</div>';
        }
        return html;
    }

    function renderAthleteCharts(data) {
        const ctx = document.getElementById('athlete-radar-chart')?.getContext('2d');
        if (!ctx) return;

        // Calculate metrics for radar (0-100 scale)
        const muscuCount = (data.musculationSessions || []).length;
        const cardioCount = (data.cardioSessions || []).length;
        const streak = data.streak || 0;
        const waterL = (data.hydration || {})[new Date().toDateString()] || 0;

        const force = Math.min(100, (muscuCount / 20) * 100);
        const endurance = Math.min(100, (cardioCount / 20) * 100);
        const hydratation = Math.min(100, (waterL / (data.waterGoal || 2.5)) * 100);
        const constance = Math.min(100, (streak / 7) * 100);
        const variete = Math.min(100, (muscuCount > 0 && cardioCount > 0 ? 100 : 50));

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Force', 'Endurance', 'Hydratation', 'Constance', 'Variété'],
                datasets: [{
                    data: [force, endurance, hydratation, constance, variete],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'var(--accent-color)',
                    borderWidth: 2,
                    pointBackgroundColor: 'var(--accent-color)',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: 'var(--text-secondary)', font: { size: 10, weight: 'bold' } },
                        ticks: { display: false, stepSize: 20 },
                        min: 0,
                        max: 100
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    function renderWorkoutsTab(data, plan) {
        return `
            <div class="fitness-layout-grid">
                <div class="fitness-main-content">
                    <div class="studio-card streak-card" style="display: flex; align-items: center; gap: 2.5rem; background: linear-gradient(90deg, rgba(139, 92, 246, 0.08), rgba(var(--accent-color-rgb), 0.04));">
                        <div class="streak-badge" style="display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Série Actuelle</span>
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem;">
                                <i data-lucide="flame" style="color: #ef4444; width: 28px; height: 28px;"></i>
                                <span style="font-size: 2.5rem; font-weight: 900; font-family: 'Orbitron', sans-serif; color: var(--text-primary); line-height: 1;">${data.streak || 0}</span>
                            </div>
                        </div>
                        <div style="width: 1px; height: 50px; background: var(--border-color); opacity: 0.6;"></div>
                        <div class="badges-row" style="display: flex; gap: 1.25rem;">
                            <div class="badge-item active" title="Régulier"><i data-lucide="award"></i></div>
                            <div class="badge-item ${data.musculationSessions?.length > 5 ? 'active' : ''}" title="Force"><i data-lucide="zap"></i></div>
                            <div class="badge-item ${data.cardioSessions?.length > 5 ? 'active' : ''}" title="Endurance"><i data-lucide="heart"></i></div>
                        </div>
                    </div>

                    <div id="active-session-container">${renderActiveSession(plan, data)}</div>
                </div>

                <div class="fitness-sidebar">
                    <div class="studio-card today-status-card" style="border-left: 6px solid ${getPlanColor(plan.type)};">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Aujourd'hui</span>
                                <h2 style="margin: 0.25rem 0 0 0; font-size: 1.5rem; font-family: 'Orbitron', sans-serif;">${plan.name}</h2>
                                <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.9rem; font-weight: 500;">
                                    ${plan.type === 'musculation' ? 'Force & Volume' : plan.type === 'cardio' ? 'Endurance' : 'Récupération'}
                                </p>
                            </div>
                            <div style="color: ${getPlanColor(plan.type)}; opacity: 0.3;"><i data-lucide="${getPlanIcon(plan.type)}" style="width: 40px; height: 40px;"></i></div>
                        </div>
                    </div>

                    <div class="studio-card">
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-family: 'Orbitron', sans-serif; font-size: 1rem;">
                            <i data-lucide="calendar"></i> Cette Semaine
                        </h3>
                        <div class="week-calendar" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${(data.program || []).map(p => `
                                <div class="${p.day === new Date().getDay() ? 'current-day' : ''}" style="padding: 0.75rem 1rem; background: ${p.day === new Date().getDay() ? 'rgba(var(--accent-color-rgb), 0.08)' : 'var(--bg-secondary)'}; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; border: 1px solid ${p.day === new Date().getDay() ? 'rgba(var(--accent-color-rgb), 0.2)' : 'transparent'};">
                                    <span style="font-size: 0.75rem; font-weight: 800; width: 40px; text-transform: uppercase; color: var(--text-muted);">${getDayName(p.day)}</span>
                                    <span style="font-size: 0.9rem; flex: 1; font-weight: 600; color: var(--text-primary);">${p.name}</span>
                                    <i data-lucide="${getPlanIcon(p.type)}" style="width: 14px; height: 14px; color: ${getPlanColor(p.type)};"></i>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderBodyTab(data) {
        const last = (data.measurements || []).slice(-1)[0] || {};
        const { bmi, whr, leanMass } = calculateBodyMetrics(last, data);

        return `
            <div class="fitness-layout-grid">
                <div class="fitness-main-content">
                    <div class="metrics-dashboard" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
                        <div class="studio-card" style="text-align: center; padding: 2rem;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">IMC (BMI)</div>
                            <div style="font-size: 2.25rem; font-weight: 950; color: ${getBMIColor(bmi)}; margin: 0.5rem 0;">${bmi || '--'}</div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">${getBMILabel(bmi)}</div>
                        </div>
                        <div class="studio-card" style="text-align: center; padding: 2rem;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Ratio Tour de Taille / Hanches</div>
                            <div style="font-size: 2.25rem; font-weight: 950; color: var(--vibrant-2); margin: 0.5rem 0;">${whr || '--'}</div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">${getWHRLabel(whr, data.sex)}</div>
                        </div>
                        <div class="studio-card" style="text-align: center; padding: 2rem;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Masse Maigre</div>
                            <div style="font-size: 2.25rem; font-weight: 950; color: var(--accent-color); margin: 0.5rem 0;">${leanMass ? leanMass + ' <span style="font-size: 1rem;">kg</span>' : '--'}</div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Force estimée</div>
                        </div>
                    </div>

                    <div class="studio-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-family: 'Orbitron', sans-serif;">
                                <i data-lucide="line-chart"></i> Évolution
                            </h3>
                            <select id="body-metric-selector" class="studio-input" style="width: auto; padding: 6px 12px; font-size: 0.85rem;">
                                <option value="weight">Poids (kg)</option>
                                <option value="fat" ${window._lastBodyMetric === 'fat' ? 'selected' : ''}>Masse Grasse (%)</option>
                                <option value="waist" ${window._lastBodyMetric === 'waist' ? 'selected' : ''}>Tour de Taille (cm)</option>
                                <option value="arm" ${window._lastBodyMetric === 'arm' ? 'selected' : ''}>Bras (cm)</option>
                                <option value="chest" ${window._lastBodyMetric === 'chest' ? 'selected' : ''}>Poitrine (cm)</option>
                                <option value="shoulders" ${window._lastBodyMetric === 'shoulders' ? 'selected' : ''}>Épaules (cm)</option>
                                <option value="hips" ${window._lastBodyMetric === 'hips' ? 'selected' : ''}>Hanches (cm)</option>
                                <option value="thigh" ${window._lastBodyMetric === 'thigh' ? 'selected' : ''}>Cuisses (cm)</option>
                            </select>
                        </div>
                        <div style="height: 350px;"><canvas id="dynamic-body-chart"></canvas></div>
                    </div>

                    <div class="studio-card">
                         <h3 style="margin-bottom: 2rem; font-family: 'Orbitron', sans-serif;">Historique des Mesures</h3>
                         <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${(data.measurements || []).slice(-10).reverse().map(m => `
                                <div style="display: flex; justify-content: space-between; padding: 1.25rem; background: var(--bg-secondary); border-radius: 12px; font-size: 0.9rem; border: 1px solid var(--border-color); align-items: center;">
                                    <div style="display: flex; gap: 2rem; align-items: center;">
                                        <div style="display: flex; flex-direction: column;">
                                            <span style="font-weight: 800; color: var(--text-primary);">${new Date(m.date).toLocaleDateString()}</span>
                                            <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div style="display: flex; gap: 1.5rem; font-weight: 800;">
                                            <span style="color: var(--accent-color);">${m.weight}kg</span>
                                            ${m.fat ? `<span style="color: var(--vibrant-2);">${m.fat}%</span>` : ''}
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 1.5rem; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600;">
                                        ${m.waist ? `<span>T. Taille: ${m.waist}</span>` : ''}
                                        ${m.arm ? `<span>B: ${m.arm}</span>` : ''}
                                        <button class="btn-icon delete-measurement" data-id="${m.id}" style="color: #ef4444;" title="Supprimer">
                                            <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                            ${(data.measurements || []).length === 0 ? '<p style="text-align: center; color: var(--text-muted); padding: 3rem; background: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color);">Aucune donnée enregistrée.</p>' : ''}
                         </div>
                    </div>
                </div>

                <div class="fitness-sidebar">
                    <div class="studio-card" style="border-left: 4px solid var(--vibrant-info); background: rgba(var(--accent-color-rgb), 0.03);">
                        <h3 style="margin-bottom: 1.25rem; color: var(--vibrant-info); display: flex; align-items: center; gap: 0.5rem; font-family: 'Orbitron', sans-serif; font-size: 0.9rem;">
                            <i data-lucide="user-check"></i> Profil Physique
                        </h3>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span style="color: var(--text-muted); font-weight: 600;">Taille (Stature)</span>
                                <span style="font-weight: 800; color: var(--text-primary);">${data.height || 175} cm</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span style="color: var(--text-muted); font-weight: 600;">Âge</span>
                                <span style="font-weight: 800; color: var(--text-primary);">${data.age || 25} ans</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span style="color: var(--text-muted); font-weight: 600;">Sexe</span>
                                <span style="font-weight: 800; color: var(--text-primary);">${data.sex === 'F' ? 'Féminin' : 'Masculin'}</span>
                            </div>
                        </div>
                        <p style="margin-top: 1rem; font-size: 0.7rem; color: var(--text-muted); font-style: italic; border-top: 1px dashed var(--border-color); padding-top: 0.75rem;">
                            * Modifiable dans la Configuration
                        </p>
                    </div>

                    <div class="studio-card" style="border-left: 4px solid var(--accent-color);">
                        <h3 style="margin-bottom: 1.5rem; color: var(--accent-color); display: flex; align-items: center; gap: 0.5rem; font-family: 'Orbitron', sans-serif; font-size: 1rem;">
                            <i data-lucide="activity"></i> Nouvelle Saisie
                        </h3>
                        
                        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <div>
                                <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Composition</span>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
                                    <div class="form-group"><label>Poids (kg)</label><input type="number" id="body-weight" class="studio-input" value="${last.weight || ''}" step="0.1"></div>
                                    <div class="form-group"><label>% Gras (%)</label><input type="number" id="body-fat" class="studio-input" value="${last.fat || ''}" step="0.1"></div>
                                </div>
                            </div>
                            
                            <div>
                                <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Mensurations (cm)</span>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
                                    <div class="form-group"><label>Tour de Taille</label><input type="number" id="body-waist" class="studio-input" value="${last.waist || ''}" step="0.5"></div>
                                    <div class="form-group"><label>Hanches</label><input type="number" id="body-hips" class="studio-input" value="${last.hips || ''}" step="0.5"></div>
                                    <div class="form-group"><label>Poitrine</label><input type="number" id="body-chest" class="studio-input" value="${last.chest || ''}" step="0.5"></div>
                                    <div class="form-group"><label>Épaules</label><input type="number" id="body-shoulders" class="studio-input" value="${last.shoulders || ''}" step="0.5"></div>
                                    <div class="form-group"><label>Bras</label><input type="number" id="body-arm" class="studio-input" value="${last.arm || ''}" step="0.5"></div>
                                    <div class="form-group"><label>Cuisse</label><input type="number" id="body-thigh" class="studio-input" value="${last.thigh || ''}" step="0.5"></div>
                                </div>
                            </div>
                            
                            <button class="studio-btn studio-btn-primary" id="save-body-stats" style="width: 100%; margin-top: 0.5rem; padding: 1rem; font-family: 'Orbitron', sans-serif;">ENREGISTRER</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderNutritionTab(data) {
        const todayStr = new Date().toDateString();
        const waterL = (data.hydration || {})[todayStr] || 0;
        const waterGoal = data.waterGoal || 2.5;
        const waterPct = Math.min(100, (waterL / waterGoal) * 100);

        return `
            <div class="fitness-layout-grid">
                <div class="fitness-main-content">
                    <div class="studio-card water-gauge-container">
                        <div style="position: absolute; top: 1.5rem; right: 1.5rem;">
                            <button class="btn-icon" id="reset-water" title="Réinitialiser" style="color: var(--text-muted);"><i data-lucide="refresh-cw" style="width: 18px;"></i></button>
                        </div>
                        <h3 style="margin-bottom: 0.5rem; font-family: 'Orbitron', sans-serif;">HYDRATATION</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 700;">OBJECTIF : ${waterGoal} LITRES</p>
                        
                        <div id="water-gauge-container" class="water-gauge-pro ${waterPct >= 100 ? 'completed' : ''}" style="position: relative; width: 240px; height: 240px; margin: 2.5rem auto; border: 8px solid var(--bg-secondary); border-radius: 50%; overflow: hidden; box-shadow: inset 0 0 30px rgba(0,0,0,0.05), var(--shadow-md);">
                            <div id="water-fill-level" class="water-fill" style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${waterPct}%; background: linear-gradient(180deg, #60a5fa, var(--accent-color)); transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);">
                            </div>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; text-align: center;">
                                <span id="water-liters-count" style="font-size: 4rem; font-weight: 950; font-family: 'Inter', sans-serif; color: ${waterPct > 45 ? 'white' : 'var(--text-primary)'}; line-height: 1;">${waterL.toFixed(1)}</span>
                                <div id="water-liters-label" style="font-size: 0.85rem; font-weight: 900; color: ${waterPct > 45 ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'}; letter-spacing: 2px; margin-top: 0.25rem;">LITRES</div>
                            </div>
                        </div>

                        <div class="water-controls">
                            <button class="btn-water-quick add-water" data-amount="-0.25" style="border-style: dashed; color: #ef4444;" title="Retirer 0.25L">-</button>
                            <button class="btn-water-quick add-water" data-amount="0.25">+0.25</button>
                            <button class="btn-water-quick add-water" data-amount="0.5">+0.5</button>
                            <button class="btn-water-quick add-water" data-amount="1">+1.0</button>
                        </div>
                    </div>

                    <div class="studio-card">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                            <div>
                                <h3 style="margin: 0; font-family: 'Orbitron', sans-serif;">NUTRITION & MACROS</h3>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">Suivi de votre apport protéique cible.</p>
                            </div>
                        </div>

                        <div style="padding: 2rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 2.5rem;">
                             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Objectif Journalier</span>
                                    <span style="font-weight: 950; color: var(--vibrant-2); font-size: 2rem;">${data.proteinGoal || 150}g</span>
                                </div>
                                <i data-lucide="beef" style="width: 48px; height: 48px; color: var(--vibrant-2); opacity: 0.2;"></i>
                             </div>
                             <div class="progress-container" style="height: 14px; background: var(--bg-tertiary);">
                                <div class="progress-segment" style="width: 65%; background: linear-gradient(90deg, var(--vibrant-2), var(--vibrant-3)); border-radius: 7px;"></div>
                             </div>
                             <p style="margin-top: 1.25rem; font-size: 0.9rem; color: var(--text-secondary); font-weight: 500;">
                                <i data-lucide="info" style="width: 16px; margin-right: 6px; vertical-align: text-bottom;"></i>
                                Cible calculée pour préserver votre masse musculaire actuelle.
                             </p>
                        </div>

                        <div class="protein-calculator-section">
                            <h4 style="margin: 0 0 1.5rem 0; font-family: 'Orbitron', sans-serif; font-size: 1rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 1px;">Calculateur Intelligent</h4>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                                <div class="form-group">
                                    <label style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted);">Niveau d'Activité</label>
                                    <select id="calc-activity" class="studio-input" style="margin-top: 0.5rem;">
                                        <option value="1.2" ${data.activityLevel === '1.2' ? 'selected' : ''}>Sédentaire (Bureau / Pas de sport)</option>
                                        <option value="1.4" ${data.activityLevel === '1.4' ? 'selected' : '' || !data.activityLevel ? 'selected' : ''}>Légère (1-2 séances/semaine)</option>
                                        <option value="1.6" ${data.activityLevel === '1.6' ? 'selected' : ''}>Modérée (3-4 séances/semaine)</option>
                                        <option value="2.0" ${data.activityLevel === '2.0' ? 'selected' : ''}>Intense (5+ séances/semaine)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted);">Objectif de Shape</label>
                                    <select id="calc-goal" class="studio-input" style="margin-top: 0.5rem;">
                                        <option value="0" ${data.fitnessGoal === '0' ? 'selected' : '' || !data.fitnessGoal ? 'selected' : ''}>Maintenance de Forme</option>
                                        <option value="0.6" ${data.fitnessGoal === '0.6' ? 'selected' : ''}>Sèche (Perte de gras)</option>
                                        <option value="0.4" ${data.fitnessGoal === '0.4' ? 'selected' : ''}>Volume (Prise de muscle)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="protein-recommendation-box">
                                <div style="display: flex; align-items: center; gap: 1.25rem;">
                                    <div style="width: 50px; height: 50px; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
                                        <i data-lucide="check-circle" style="color: var(--vibrant-success);"></i>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Recommandation IA</div>
                                        <div style="font-size: 1.75rem; font-weight: 950; font-family: 'Inter', sans-serif; color: var(--accent-color); line-height: 1;"><span id="recommended-value">--</span> g <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">/ jour</span></div>
                                    </div>
                                </div>
                                <button class="studio-btn studio-btn-primary" id="apply-recommendation" style="font-family: 'Orbitron', sans-serif; padding: 1rem 2rem;">APPLIQUER</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="fitness-sidebar">
                    <div class="studio-card" style="background: var(--bg-secondary);">
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--vibrant-2); font-family: 'Orbitron', sans-serif; font-size: 0.9rem;">
                            <i data-lucide="lightbulb" style="width: 18px;"></i> Focus Nutrition
                        </h3>
                        <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1.5rem;">
                            <li style="display: flex; gap: 1rem;">
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--vibrant-2); margin-top: 6px; flex-shrink: 0;"></div>
                                <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0; line-height: 1.6; font-weight: 500;">Privilégiez les sources de protéines complètes (œufs, poulet, alternatives végétales).</p>
                            </li>
                            <li style="display: flex; gap: 1rem;">
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--vibrant-info); margin-top: 6px; flex-shrink: 0;"></div>
                                <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0; line-height: 1.6; font-weight: 500;">Buvez 500ml d'eau à chaque repas pour faciliter la digestion.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCoachTab(data) {
        return `
            <div class="fitness-layout-grid">
                <div class="fitness-main-content">
                    <div class="card fitness-card coach-main-card" style="min-height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.05), transparent);">
                        <div id="ai-loading-indicator" class="hidden" style="margin-bottom: 2rem;">
                            <div class="thinking-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                            <p style="margin-top: 1rem; font-weight: 700; color: var(--vibrant-2);">Gemini analyse vos séances...</p>
                        </div>
                        
                        <div id="ai-intro-content" style="display: flex; flex-direction: column; align-items: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: rgba(139, 92, 246, 0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 0 30px rgba(139, 92, 246, 0.1);">
                                <i data-lucide="brain-circuit" style="width: 50px; height: 50px; color: var(--vibrant-2);"></i>
                            </div>
                            <h2 style="font-family: 'Orbitron', sans-serif; letter-spacing: 3px; font-weight: 900; text-transform: uppercase; color: var(--text-primary);">Assistant Coach Gemini</h2>
                            <p class="text-secondary" style="max-width: 500px; margin: 1.5rem 0 3rem 0; font-size: 1.05rem; line-height: 1.6; font-weight: 500;">
                                L'IA analyse votre architecture physique, votre volume d'entraînement et votre nutrition pour optimiser votre performance.
                            </p>
                            <button class="btn-primary" id="run-ai-analysis" style="padding: 1.5rem 4rem; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; letter-spacing: 2px; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.2);">DÉMARRER LE SCAN PRÉDICTIF</button>
                        </div>

                        <div id="ai-response-container" class="card hidden" style="margin-top: 2rem; text-align: left; width: 100%; max-width: 850px; padding: 2.5rem; background: var(--bg-primary); border: 1px solid var(--vibrant-2); box-shadow: 0 15px 40px rgba(139, 92, 246, 0.1);"></div>
                    </div>
                </div>

                <div class="fitness-sidebar">
                    <div class="card fitness-card">
                        <h3 style="margin-bottom: 1rem; color: var(--vibrant-2);">Capacités de l'IA</h3>
                        <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem;">
                            <li style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-secondary);">
                                <i data-lucide="check" style="width: 16px; color: var(--vibrant-success);"></i> Détection de stagnation
                            </li>
                            <li style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-secondary);">
                                <i data-lucide="check" style="width: 16px; color: var(--vibrant-success);"></i> Optimisation de volume
                            </li>
                            <li style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-secondary);">
                                <i data-lucide="check" style="width: 16px; color: var(--vibrant-success);"></i> Ajustement calorique
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    function renderActiveSession(plan, data) {
        if (plan.type === 'rest') {
            return `
                <div class="studio-card" style="text-align: center; padding: 4rem 2rem; border-style: dashed; opacity: 0.8;">
                    <div style="width: 80px; height: 80px; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                        <i data-lucide="coffee" style="width: 40px; height: 40px; color: var(--text-muted);"></i>
                    </div>
                    <h2 style="font-family: 'Orbitron', sans-serif; margin-bottom: 0.5rem; font-size: 1.25rem;">RÉCUPÉRATION ACTIVE</h2>
                    <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto; line-height: 1.6;">Profitez de cette journée pour laisser vos muscles se reconstruire. Étirements légers ou marche recommandés.</p>
                </div>
            `;
        }

        if (plan.type === 'musculation') {
            return `
                <div class="studio-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
                        <h3 style="margin: 0; font-family: 'Orbitron', sans-serif; display: flex; align-items: center; gap: 0.75rem;">
                            <i data-lucide="dumbbell" style="color: var(--vibrant-2);"></i> Saisie de Séance
                        </h3>
                        <div id="live-volume-badge" style="background: rgba(var(--accent-color-rgb), 0.1); color: var(--accent-color); padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 950; font-family: 'JetBrains Mono', monospace; border: 1px solid rgba(var(--accent-color-rgb), 0.2);">0 kg</div>
                    </div>
                    
                    <div id="exercise-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        ${plan.exercises ? plan.exercises.map((ex, idx) => `
                            <div class="exercise-row">
                                <div class="exercise-header">
                                    <span class="exercise-title">${ex.name}</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${ex.target}</span>
                                </div>
                                <div class="sets-grid">
                                    ${Array.from({ length: 4 }).map((_, sIdx) => `
                                        <div class="set-input-group">
                                            <span class="set-label">SÉRIE ${sIdx + 1}</span>
                                            <div class="set-inputs">
                                                <input type="number" class="set-input ex-reps-input live-volume-calc" placeholder="reps" data-ex="${idx}" data-set="${sIdx}">
                                                <span class="set-separator">×</span>
                                                <input type="number" class="set-input set-input-weight ex-weight-input live-volume-calc" placeholder="kg" data-ex="${idx}" data-set="${sIdx}">
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('') : '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Aucun exercice configuré.</p>'}
                    </div>

                    <div style="margin-top: 2.5rem; display: flex; justify-content: flex-end;">
                        <button class="studio-btn studio-btn-primary" id="save-workout" style="padding: 1rem 2.5rem; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">VALIDER LA SÉANCE</button>
                    </div>
                </div>
            `;
        }

        if (plan.type === 'cardio') {
            return `
                <div class="studio-card">
                    <h3 style="margin-bottom: 2rem; font-family: 'Orbitron', sans-serif; display: flex; align-items: center; gap: 0.75rem;">
                        <i data-lucide="zap" style="color: var(--vibrant-info);"></i> Session Cardio
                    </h3>
                    <div style="max-width: 500px; display: flex; flex-direction: column; gap: 1.5rem;">
                        <div class="form-group">
                            <label>Type d'activité</label>
                            <input type="text" id="cardio-type-v2" class="studio-input" placeholder="Course, Vélo, Natation..." value="Course">
                        </div>
                        <div class="form-group">
                            <label>Durée (minutes)</label>
                            <input type="number" id="cardio-duration-v2" class="studio-input" placeholder="Ex: 30">
                        </div>
                        <div class="form-group">
                            <label>Notes (optionnel)</label>
                            <textarea id="cardio-notes" class="studio-input" style="min-height: 100px;" placeholder="Comment s'est passée la session ?"></textarea>
                        </div>
                        <button class="studio-btn studio-btn-primary" id="save-cardio-v2" style="margin-top: 1rem;">ENREGISTRER LA SESSION</button>
                    </div>
                </div>
            `;
        }
    }

    function renderConfig(data) {
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
                 <div style="display: flex; flex-direction: column; gap: 2rem;">
                    <div>
                        <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; font-family: 'Orbitron', sans-serif;">
                            <i data-lucide="user" style="width: 18px; color: var(--accent-color);"></i> Profil Anthropométrique
                        </h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Taille (cm)</label>
                                <input type="number" id="cfg-height" class="studio-input" value="${data.height || 175}">
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Âge</label>
                                <input type="number" id="cfg-age" class="studio-input" value="${data.age || 25}">
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 1.25rem;">
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Sexe</label>
                            <select id="cfg-sex" class="studio-input">
                                <option value="M" ${data.sex === 'M' ? 'selected' : '' || !data.sex ? 'selected' : ''}>Masculin</option>
                                <option value="F" ${data.sex === 'F' ? 'selected' : ''}>Féminin</option>
                            </select>
                        </div>
                    </div>

                    <div style="padding: 1.25rem; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color);">
                        <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                            Ces données servent de base au calcul de votre métabolisme de base (BMR) et de vos besoins caloriques théoriques.
                        </p>
                    </div>
                 </div>

                 <div style="display: flex; flex-direction: column; gap: 2rem;">
                    <div>
                        <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.75rem; font-size: 1rem; font-family: 'Orbitron', sans-serif;">
                            <i data-lucide="target" style="width: 18px; color: var(--vibrant-2);"></i> Performance & Vitalité
                        </h3>
                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Objectif Eau (Litres / Jour)</label>
                            <input type="number" id="cfg-water-goal" class="studio-input" value="${data.waterGoal || 2.5}" step="0.5">
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">Cible Protéines (Grammes / Jour)</label>
                            <input type="number" id="cfg-protein-goal" class="studio-input" value="${data.proteinGoal || 150}">
                        </div>
                    </div>
                 </div>
            </div>
            
            <div style="margin-top: 3.5rem; display: flex; gap: 1rem;">
                <button class="studio-btn studio-btn-primary" id="save-fitness-config" style="flex: 1; padding: 1.25rem; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">ENREGISTRER LES PARAMÈTRES</button>
            </div>
        `;
    }

    function updateHydrationUI() {
        const fitnessData = store.settings.fitness || {};
        const todayStr = new Date().toDateString();
        const waterL = (fitnessData.hydration || {})[todayStr] || 0;
        const waterGoal = fitnessData.waterGoal || 2.5;
        const waterPct = Math.min(100, (waterL / waterGoal) * 100);

        const container = document.getElementById('water-gauge-container');
        const fill = document.getElementById('water-fill-level');
        const count = document.getElementById('water-liters-count');
        const label = document.getElementById('water-liters-label');

        if (fill) fill.style.height = `${waterPct}%`;
        if (container) {
            container.classList.toggle('completed', waterPct >= 100);
        }
        if (count) {
            count.textContent = waterL.toFixed(1);
            count.style.color = waterPct > 45 ? 'white' : 'var(--text-primary)';
        }
        if (label) {
            label.style.color = waterPct > 45 ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)';
        }

        // Celebration logic
        if (waterPct >= 100 && !window._celebratedToday) {
            if (typeof confetti === 'function' && container) {
                const rect = container.getBoundingClientRect();
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { 
                        x: (rect.left + rect.width / 2) / window.innerWidth,
                        y: (rect.top + rect.height / 2) / window.innerHeight 
                    },
                    colors: ['#3b82f6', '#22d3ee', '#ffffff', '#8b5cf6']
                });
            }
            window._celebratedToday = true;
        }
    }

    function attachShellEvents() {
        // Tab switching
        document.querySelectorAll('.tab-link').forEach(link => {
            link.onclick = (e) => {
                const target = e.currentTarget;
                activeTab = target.dataset.tab;
                render(true);
            };
        });

        // Config Modal
        const cfgBtn = document.getElementById('edit-program-btn');
        const modal = document.getElementById('fitness-config-modal');
        const closeModal = document.getElementById('close-modal');
        if (cfgBtn) cfgBtn.onclick = () => modal.classList.remove('hidden');
        if (closeModal) closeModal.onclick = () => modal.classList.add('hidden');

        const saveCfgBtn = document.getElementById('save-fitness-config');
        if (saveCfgBtn) saveCfgBtn.onclick = () => {
            const waterGoal = parseFloat(document.getElementById('cfg-water-goal').value);
            const proteinGoal = parseFloat(document.getElementById('cfg-protein-goal').value);
            const height = parseFloat(document.getElementById('cfg-height').value);
            const age = parseInt(document.getElementById('cfg-age').value);
            const sex = document.getElementById('cfg-sex').value;

            store.updateFitnessSettings({ waterGoal, proteinGoal, height, age, sex });

            saveCfgBtn.innerHTML = '<i data-lucide="check"></i> PARAMÈTRES ENREGISTRÉS';
            saveCfgBtn.classList.remove('studio-btn-primary');
            saveCfgBtn.classList.add('studio-btn-secondary');

            setTimeout(() => {
                modal.classList.add('hidden');
                render();
            }, 800);
        };

        // Export
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) exportBtn.onclick = () => exportFitnessToCSV(store.settings.fitness);
    }

    function attachContentEvents() {
        // Hydration
        document.querySelectorAll('.add-water').forEach(btn => {
            btn.onclick = () => {
                store.logHydration(parseFloat(btn.dataset.amount));
                updateHydrationUI();
            };
        });

        const resetWaterBtn = document.getElementById('reset-water');
        if (resetWaterBtn) {
            resetWaterBtn.onclick = () => {
                if (confirm("Réinitialiser l'hydratation du jour ?")) {
                    store.resetHydration();
                    window._celebratedToday = false;
                    updateHydrationUI();
                }
            };
        }

        // Nutrition adjustment button (direct access)
        const nutBtn = document.getElementById('edit-nutrition-btn-direct');
        if (nutBtn) nutBtn.onclick = () => {
            const modal = document.getElementById('fitness-config-modal');
            if (modal) modal.classList.remove('hidden');
        };

        // Protein Calculator Logic
        const calcActivity = document.getElementById('calc-activity');
        const calcGoal = document.getElementById('calc-goal');
        const applyBtn = document.getElementById('apply-recommendation');

        const updateRec = () => {
            const fitnessData = store.settings.fitness || {};
            const weight = (fitnessData.measurements || []).slice(-1)[0]?.weight || 70;
            const activityMultiplier = parseFloat(calcActivity?.value || 1.3);
            const goalAdjustment = parseFloat(calcGoal?.value || 0);
            const total = Math.round(weight * (activityMultiplier + goalAdjustment));
            const recValue = document.getElementById('recommended-value');
            if (recValue) recValue.textContent = total;
            return total;
        };

        if (calcActivity) calcActivity.onchange = updateRec;
        if (calcGoal) calcGoal.onchange = updateRec;
        if (activeTab === 'nutrition') updateRec();

        if (applyBtn) applyBtn.onclick = () => {
            const proteinGoal = updateRec();
            const activityLevel = calcActivity.value;
            const fitnessGoal = calcGoal.value;
            store.updateFitnessSettings({ proteinGoal, activityLevel, fitnessGoal });
            render(true);
        };

        // Body Stats
        const saveBodyBtn = document.getElementById('save-body-stats');
        if (saveBodyBtn) {
            saveBodyBtn.onclick = () => {
                const weight = parseFloat(document.getElementById('body-weight')?.value);
                const fat = parseFloat(document.getElementById('body-fat')?.value);
                const waist = parseFloat(document.getElementById('body-waist')?.value);
                const hips = parseFloat(document.getElementById('body-hips')?.value);
                const arm = parseFloat(document.getElementById('body-arm')?.value);
                const chest = parseFloat(document.getElementById('body-chest')?.value);
                const shoulders = parseFloat(document.getElementById('body-shoulders')?.value);
                const thigh = parseFloat(document.getElementById('body-thigh')?.value);

                if (isNaN(weight)) return alert("Le poids est requis.");
                store.logMeasurement({ weight, fat, waist, hips, arm, chest, shoulders, thigh });
                render(true);
            };
        }

        // Delete measurements
        document.querySelectorAll('.delete-measurement').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                if (confirm("Supprimer cette mesure ?")) {
                    store.deleteMeasurement(btn.dataset.id);
                    render(true);
                }
            };
        });

        const metricSelector = document.getElementById('body-metric-selector');
        if (metricSelector) {
            metricSelector.onchange = (e) => {
                window._lastBodyMetric = e.target.value;
                render(true);
            };
        }

        // Workout Logic
        const saveWorkoutBtn = document.getElementById('save-workout');
        if (saveWorkoutBtn) saveWorkoutBtn.onclick = () => {
            const exRows = document.querySelectorAll('.exercise-row');
            const workoutData = { name: (store.settings.fitness.program.find(p => p.day === new Date().getDay()) || {}).name, exercises: [] };
            exRows.forEach(row => {
                const name = row.querySelector('.exercise-title').textContent;
                const repsInps = row.querySelectorAll('.ex-reps-input');
                const weightsInps = row.querySelectorAll('.ex-weight-input');
                repsInps.forEach((rInp, i) => {
                    const reps = rInp.value;
                    const weight = weightsInps[i].value;
                    if (reps || weight) workoutData.exercises.push({ name, reps, weight });
                });
            });
            if (workoutData.exercises.length === 0) return alert("Saisissez des données !");
            store.logWorkout(workoutData);
            render(true);
        };

        const saveCardioBtn = document.getElementById('save-cardio-v2');
        if (saveCardioBtn) saveCardioBtn.onclick = () => {
            const type = document.getElementById('cardio-type-v2').value;
            const duration = document.getElementById('cardio-duration-v2').value;
            if (!duration) return alert("Saisissez la durée.");
            store.logCardio({ type, duration });
            render(true);
        };

        // Live Volume
        document.querySelectorAll('.live-volume-calc').forEach(inp => {
            inp.oninput = () => {
                let total = 0;
                document.querySelectorAll('.exercise-row').forEach(row => {
                    const reps = row.querySelectorAll('.ex-reps-input');
                    const weights = row.querySelectorAll('.ex-weight-input');
                    reps.forEach((r, i) => {
                        total += (parseFloat(r.value) || 0) * (parseFloat(weights[i].value) || 0);
                    });
                });
                const badge = document.getElementById('live-volume-badge');
                if (badge) badge.textContent = Math.round(total).toLocaleString() + ' kg';
            };
        });

        // AI analysis
        const aiBtn = document.getElementById('run-ai-analysis');
        if (aiBtn) aiBtn.onclick = async () => {
            document.getElementById('ai-intro-content').classList.add('hidden');
            document.getElementById('ai-loading-indicator').classList.remove('hidden');
            try {
                const analysis = await analyzeFitnessData(store);
                const aiContainer = document.getElementById('ai-response-container');
                aiContainer.innerHTML = `<h3 style="color: var(--vibrant-2); margin-bottom: 1rem;"><i data-lucide="sparkles"></i> Rapport Coach Gemini</h3>` + analysis.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                aiContainer.classList.remove('hidden');
                if (window.lucide) window.lucide.createIcons();
            } catch (err) {
                const aiContainer = document.getElementById('ai-response-container');
                aiContainer.innerHTML = `<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 1.5rem; border-radius: 12px; display: flex; align-items: flex-start; gap: 1rem;"><i data-lucide="alert-circle" style="flex-shrink: 0; margin-top: 3px;"></i><div><h4 style="margin: 0 0 0.5rem 0;">Erreur d'Analyse</h4><p style="margin: 0; font-size: 0.9rem; line-height: 1.6;">${err.message}</p></div></div>`;
                aiContainer.classList.remove('hidden');
                document.getElementById('ai-intro-content').classList.remove('hidden');
                if (window.lucide) window.lucide.createIcons();
            } finally {
                document.getElementById('ai-loading-indicator').classList.add('hidden');
            }
        };

        // Guide Modal
        document.querySelectorAll('.show-guide').forEach(btn => {
            btn.onclick = () => {
                const name = btn.dataset.ex;
                const guideModal = document.getElementById('exercise-guide-modal');
                const guideContent = document.getElementById('guide-content');
                const imgPath = getExerciseImage(name);
                guideContent.innerHTML = `<h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">${name}</h2>${imgPath ? `<img src="${imgPath}" style="width: 100%; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: var(--shadow-md);">` : '<div style="background: var(--bg-tertiary); padding: 3rem; border-radius: 12px; margin-bottom: 1rem;">Illustration bientôt disponible.</div>'}<p class="text-secondary" style="font-size: 0.9rem;">Maintenez le dos droit et contrôlez le mouvement. Inspirez à la descente, expirez à l\'effort.</p>`;
                guideModal.classList.remove('hidden');
            };
        });
    }

    function renderWorkoutsCharts(data) {
        const miniCtx = document.getElementById('mini-volume-chart')?.getContext('2d');
        if (!miniCtx) return;
        const sessions = [...(data.musculationSessions || [])].slice(-7);
        if (sessions.length < 1) return;
        new Chart(miniCtx, {
            type: 'line',
            data: { labels: sessions.map(s => new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit' })), datasets: [{ data: sessions.map(s => s.totalVolume), borderColor: '#22d3ee', tension: 0.4, fill: true, backgroundColor: 'rgba(34, 211, 238, 0.05)', borderWidth: 3, pointRadius: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { font: { size: 9 } } } } }
        });
    }

    function renderBodyCharts(data, metric = 'weight') {
        const ctx = document.getElementById('dynamic-body-chart')?.getContext('2d');
        const history = [...(data.measurements || [])].slice(-20);
        if (!ctx || history.length < 2) return;

        const labels = {
            weight: 'Poids (kg)',
            fat: 'Masse Grasse (%)',
            waist: 'Taille (cm)',
            arm: 'Bras (cm)',
            chest: 'Poitrine (cm)',
            shoulders: 'Épaules (cm)',
            hips: 'Hanches (cm)',
            thigh: 'Cuisses (cm)'
        };

        const colors = {
            weight: '#3b82f6',
            fat: '#8b5cf6',
            waist: '#f59e0b',
            arm: '#10b981',
            chest: '#ef4444',
            shoulders: '#ec4899',
            hips: '#6366f1',
            thigh: '#14b8a6'
        };

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(h => new Date(h.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
                datasets: [{
                    label: labels[metric],
                    data: history.map(h => h[metric]),
                    borderColor: colors[metric],
                    backgroundColor: colors[metric] + '10',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: colors[metric]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: false, grid: { borderDash: [5, 5] } }
                }
            }
        });
    }

    function calculateBodyMetrics(m, d) {
        let bmi = null;
        let whr = null;
        let leanMass = null;

        if (m.weight && d.height) {
            bmi = (m.weight / ((d.height / 100) ** 2)).toFixed(1);
        }
        if (m.waist && m.hips) {
            whr = (m.waist / m.hips).toFixed(2);
        }
        if (m.weight && m.fat) {
            leanMass = (m.weight * (1 - (m.fat / 100))).toFixed(1);
        }

        return { bmi, whr, leanMass };
    }

    function getBMIColor(v) {
        if (!v) return 'var(--text-muted)';
        if (v < 18.5) return '#fbbf24'; // Underweight
        if (v < 25) return '#10b981';   // Normal
        if (v < 30) return '#f59e0b';   // Overweight
        return '#ef4444';              // Obese
    }

    function getBMILabel(v) {
        if (!v) return 'Mesure requise';
        if (v < 18.5) return 'Insuffisance';
        if (v < 25) return 'Optimal';
        if (v < 30) return 'Surpoids';
        return 'Obésité';
    }

    function getWHRLabel(v, sex) {
        if (!v) return 'Hanches requises';
        const limit = (sex === 'F') ? 0.85 : 0.90;
        return v <= limit ? 'Excellent' : 'À surveiller';
    }

    function getExerciseImage(name) {
        if (name === 'Squat') return './assets/fitness/squat.png';
        if (name === 'Développé Couché') return './assets/fitness/bench.png';
        return null;
    }

    function getDayName(d) { return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d]; }
    function getPlanIcon(t) { return t === 'musculation' ? 'dumbbell' : t === 'cardio' ? 'zap' : 'coffee'; }
    function getPlanColor(t) { return t === 'musculation' ? 'var(--vibrant-2)' : t === 'cardio' ? 'var(--vibrant-info)' : 'var(--text-muted)'; }

    render();
}
