// Mobile Fitness View for Mangaka Studio
import { calculateLevel, getProgressToNextLevel, determineClass } from '../../lib/xp-utils.js';

export function initMobileFitness(container, store) {
    let activeTab = 'workouts'; // 'workouts', 'nutrition', 'athlete'
    
    function render() {
        const fitnessData = store.settings.fitness || {};
        const today = new Date().getDay();
        const todayPlan = (fitnessData.program || []).find(p => p.day === today) || { type: 'rest', name: 'Repos' };
        
        container.innerHTML = `
            <div class="mobile-view-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1>Fitness</h1>
                    <div style="background: var(--mobile-accent); padding: 4px 12px; border-radius: 12px; font-weight: 800; font-family: 'Orbitron', sans-serif; font-size: 0.8rem; color: white;">
                        NIV. ${calculateLevel(fitnessData.xp || 0)}
                    </div>
                </div>
            </div>

            <div class="mobile-tabs" style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="mobile-tab-btn ${activeTab === 'workouts' ? 'active' : ''}" data-tab="workouts">SÉANCE</button>
                <button class="mobile-tab-btn ${activeTab === 'nutrition' ? 'active' : ''}" data-tab="nutrition">EAU</button>
                <button class="mobile-tab-btn ${activeTab === 'athlete' ? 'active' : ''}" data-tab="athlete">PROFIL</button>
            </div>

            <div id="mobile-fitness-content">
                ${renderTabContent(activeTab, fitnessData, todayPlan)}
            </div>

            <style>
                .mobile-tab-btn {
                    flex: 1;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 15px;
                    color: #94a3b8;
                    font-weight: 700;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mobile-tab-btn.active {
                    background: var(--mobile-accent);
                    color: white;
                    border-color: var(--mobile-accent);
                }
            </style>
        `;

        attachEvents();
    }

    function renderTabContent(tab, data, plan) {
        if (tab === 'workouts') {
            return `
                <div class="mobile-card" style="border-left: 6px solid ${getPlanColor(plan.type)};">
                    <div style="font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Aujourd'hui</div>
                    <h2 style="margin: 5px 0; font-family: 'Orbitron', sans-serif;">${plan.name}</h2>
                    <p style="color: #94a3b8; font-size: 0.9rem;">${plan.type === 'rest' ? 'Récupération active' : 'Préparez votre équipement !'}</p>
                    
                    ${plan.type !== 'rest' ? `
                        <button class="studio-btn studio-btn-primary" style="width: 100%; margin-top: 20px; border-radius: 15px; padding: 15px;">
                            COMMENCER LA SÉANCE
                        </button>
                    ` : ''}
                </div>

                <div class="mobile-card">
                    <h3 style="font-size: 1rem; margin-bottom: 15px; color: #e2e8f0;">Programme de la semaine</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${(data.program || []).map(p => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 10px; ${p.day === new Date().getDay() ? 'border: 1px solid var(--mobile-accent);' : ''}">
                                <span style="font-weight: 800; font-size: 0.75rem; color: #94a3b8; width: 40px;">${getDayName(p.day)}</span>
                                <span style="font-size: 0.85rem; flex: 1; color: white;">${p.name}</span>
                                <i data-lucide="${getPlanIcon(p.type)}" style="width: 14px; color: ${getPlanColor(p.type)};"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (tab === 'nutrition') {
            const todayStr = new Date().toDateString();
            const waterL = (data.hydration || {})[todayStr] || 0;
            const waterGoal = data.waterGoal || 2.5;
            const pct = Math.min(100, (waterL / waterGoal) * 100);

            return `
                <div class="mobile-card" style="text-align: center; padding: 40px 20px;">
                    <div style="position: relative; width: 180px; height: 180px; margin: 0 auto 30px auto;">
                        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--mobile-accent)" stroke-width="8" 
                                stroke-dasharray="282.7" stroke-dashoffset="${282.7 - (282.7 * pct / 100)}" 
                                style="transition: stroke-dashoffset 0.5s ease;" />
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <div style="font-size: 2.5rem; font-weight: 900; color: white;">${waterL.toFixed(1)}</div>
                            <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 800;">LITRES / ${waterGoal}</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <button class="add-water-btn" data-amount="0.25">+0.25L</button>
                        <button class="add-water-btn" data-amount="0.5">+0.5L</button>
                        <button class="add-water-btn" data-amount="1.0">+1.0L</button>
                    </div>
                </div>

                <style>
                    .add-water-btn {
                        padding: 15px 5px;
                        background: rgba(59, 130, 246, 0.1);
                        border: 1px solid rgba(59, 130, 246, 0.2);
                        border-radius: 12px;
                        color: #3b82f6;
                        font-weight: 800;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 0.75rem;
                        cursor: pointer;
                    }
                    .add-water-btn:active { transform: scale(0.95); background: rgba(59, 130, 246, 0.2); }
                </style>
            `;
        }

        if (tab === 'athlete') {
            const xp = data.xp || 0;
            const level = calculateLevel(xp);
            const progress = getProgressToNextLevel(xp);
            const userClass = determineClass((data.musculationSessions || []).length, (data.cardioSessions || []).length);

            return `
                <div class="mobile-card" style="background: linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.1), rgba(139, 92, 246, 0.1));">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 70px; height: 70px; background: ${userClass.color}; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px ${userClass.color}40;">
                            <i data-lucide="${userClass.icon}" style="width: 35px; color: white;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h2 style="margin: 0; font-family: 'Orbitron', sans-serif; font-size: 1.1rem; color: white;">${userClass.name.toUpperCase()}</h2>
                            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">XP: ${xp}</div>
                            <div class="mobile-progress-pill" style="height: 4px; margin-top: 10px;">
                                <div class="mobile-progress-fill" style="width: ${progress}%; background: ${userClass.color};"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mobile-card">
                    <h3 style="font-size: 1rem; margin-bottom: 20px; color: #e2e8f0; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="award" style="color: #f59e0b; width: 18px;"></i> Succès
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div class="mobile-badge active"><i data-lucide="zap"></i></div>
                        <div class="mobile-badge active"><i data-lucide="flame"></i></div>
                        <div class="mobile-badge"><i data-lucide="shield"></i></div>
                    </div>
                </div>

                <style>
                    .mobile-badge {
                        aspect-ratio: 1;
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.05);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #475569;
                    }
                    .mobile-badge.active { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                </style>
            `;
        }

        return '';
    }

    function attachEvents() {
        container.querySelectorAll('.mobile-tab-btn').forEach(btn => {
            btn.onclick = () => {
                activeTab = btn.dataset.tab;
                render();
            };
        });

        const addWaterBtns = container.querySelectorAll('.add-water-btn');
        addWaterBtns.forEach(btn => {
            btn.onclick = () => {
                const amount = parseFloat(btn.dataset.amount);
                store.addHydration(amount);
                render();
            };
        });

        if (window.lucide) window.lucide.createIcons();
    }

    // Helper functions
    function getPlanColor(type) {
        if (type === 'musculation') return '#8b5cf6';
        if (type === 'cardio') return '#06b6d4';
        return '#94a3b8';
    }

    function getPlanIcon(type) {
        if (type === 'musculation') return 'dumbbell';
        if (type === 'cardio') return 'zap';
        return 'coffee';
    }

    function getDayName(day) {
        return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][day];
    }

    render();
}
