import { getHygieneAura } from '../lib/xp-utils.js';

export function initHygiene(container, store) {
    let activeTab = 'dashboard'; 
    let activeTimer = null;
    let timerRemaining = 0;
    let timerTotal = 120; // Default 2 mins
    let timerInterval = null;
    let ambientSound = null;
    let isMuted = false;
    let activeSoundId = 'rain';

    const AMBIENT_URLS = {
        zen: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
        rain: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg',
        focus: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
        forest: 'https://actions.google.com/sounds/v1/ambiences/morning_forest.ogg'
    };

    const MANGAKA_TIPS = [
        "Desserrez votre poigne sur le stylo, votre main vous remerciera.",
        "Regardez un point à 6 mètres pendant 20 secondes toutes les 20 minutes.",
        "Le sang qui circule est de l'encre qui coule. Étirez-vous.",
        "Une posture droite aujourd'hui évite les douleurs de demain.",
        "L'hydratation booste la clarté mentale. Buvez un verre d'eau.",
        "Respirez profondément. Le stress tue la créativité."
    ];

    function isMorning() {
        const hour = new Date().getHours();
        return hour >= 4 && hour < 17;
    }

    function render(isPartial = false) {
        const hygieneData = store.settings.hygiene || {};
        const todayStr = new Date().toDateString();
        const todayLog = hygieneData.logs?.[todayStr] || { morning: false, evening: false, completedItems: [] };

        const shellExists = !!container.querySelector('.hygiene-view-container');

        if (!shellExists || !isPartial) {
            container.innerHTML = `
                <div class="hygiene-view-container">
                    <div class="view-header">
                        <div class="view-header-content">
                            <h1>Pureté & Rituels</h1>
                            <p>L'excellence commence par la discipline de soi.</p>
                        </div>
                        <div class="view-header-actions">
                            <div class="hygiene-streak-card glass" style="padding: 0.5rem 1rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.75rem;">
                                <div class="streak-icon-wrapper" style="width: 32px; height: 32px; background: linear-gradient(135deg, var(--hygiene-m-start), var(--hygiene-m-end)); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
                                    <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i>
                                </div>
                                <div class="streak-info">
                                    <span class="streak-value" style="font-family: 'Orbitron', sans-serif; font-weight: 800; font-size: 1.1rem; line-height: 1;">${hygieneData.streak || 0}</span>
                                    <span class="streak-label" style="font-size: 0.6rem; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; display: block;">JOURS</span>
                                </div>
                            </div>
                            
                            <div class="cycle-selector">
                                <button class="cycle-btn ${hygieneData.activeCycle === 'normal' ? 'active' : ''}" data-cycle="normal">NORMAL</button>
                                <button class="cycle-btn ${hygieneData.activeCycle === 'rush' ? 'active' : ''}" data-cycle="rush">RUSH</button>
                                <button class="cycle-btn ${hygieneData.activeCycle === 'repos' ? 'active' : ''}" data-cycle="repos">REPOS</button>
                            </div>
                        </div>
                    </div>

                    <div class="fitness-tabs-container" style="margin-bottom: 2rem;">
                        <div class="fitness-tabs">
                            <button class="tab-link" data-tab="dashboard">
                                <i data-lucide="layout-grid"></i> VUE D'ENSEMBLE
                            </button>
                            <button class="tab-link" data-tab="routines">
                                <i data-lucide="zap"></i> RITUELS ACTIFS
                            </button>
                            <button class="tab-link" data-tab="config">
                                <i data-lucide="sliders"></i> CONFIGURATION
                            </button>
                        </div>
                    </div>

                    <div id="hygiene-main-content" class="fade-in">
                        ${renderActiveTab(activeTab, hygieneData, todayLog)}
                    </div>
                </div>

                <style>
                    :root {
                        --hygiene-m-start: #0ea5e9;
                        --hygiene-m-end: #2dd4bf;
                        --hygiene-e-start: #6366f1;
                        --hygiene-e-end: #a855f7;
                    }

                    .hygiene-view-container {
                        max-width: 1400px;
                        margin: 0 auto;
                        animation: fadeIn 0.4s ease-out;
                    }

                    .routine-banner::after {
                        content: '';
                        position: absolute;
                        top: -50%;
                        right: -10%;
                        width: 300px;
                        height: 300px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 50%;
                        filter: blur(50px);
                    }

                    .premium-item:hover {
                        transform: translateX(10px);
                        border-color: var(--accent-color) !important;
                        background: var(--bg-primary) !important;
                    }

                    .premium-item.completed {
                        opacity: 0.6;
                        border-color: #2dd4bf !important;
                        background: rgba(45, 212, 191, 0.05) !important;
                    }

                    /* Timer Modal/Overlay */
                    .timer-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(15, 23, 42, 0.95);
                        backdrop-filter: blur(10px);
                        z-index: 100;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        animation: fadeIn 0.3s ease;
                        border-radius: 20px;
                    }

                    .timer-circle {
                        width: 200px;
                        height: 200px;
                        border-radius: 50%;
                        border: 4px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 3rem;
                        font-weight: 800;
                        position: relative;
                        margin-bottom: 2rem;
                        color: white;
                    }

                    .timer-progress-svg {
                        position: absolute;
                        top: -4px;
                        left: -4px;
                        transform: rotate(-90deg);
                    }

                    .timer-progress-svg circle {
                        stroke-dasharray: 616;
                        stroke-dashoffset: 616;
                        transition: stroke-dashoffset 1s linear;
                    }

                    .heatmap-grid {
                        display: grid;
                        grid-template-columns: repeat(30, 1fr);
                        gap: 6px;
                        margin-top: 1.5rem;
                        background: var(--bg-secondary);
                        padding: 1rem;
                        border-radius: var(--radius-md);
                        border: 1px solid var(--border-color);
                    }

                    .heatmap-cell {
                        aspect-ratio: 1;
                        background: var(--bg-tertiary);
                        border-radius: 2px;
                        transition: transform 0.2s;
                    }

                    .heatmap-cell:hover {
                        transform: scale(1.3);
                        z-index: 10;
                    }

                    .heatmap-cell.level-1 { background: rgba(45, 212, 191, 0.3); }
                    .heatmap-cell.level-2 { background: #2dd4bf; box-shadow: 0 0 10px rgba(45, 212, 191, 0.4); }

                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                </style>
            `;
            attachShellEvents();
        } else {
            const mainContent = document.getElementById('hygiene-main-content');
            if (mainContent) {
                mainContent.innerHTML = renderActiveTab(activeTab, hygieneData, todayLog);
            }
            // Update streak in header too
            const streakView = container.querySelector('.streak-value');
            if (streakView) streakView.innerText = hygieneData.streak || 0;
        }

        document.querySelectorAll('.tab-link').forEach(link => {
            link.classList.toggle('active', link.dataset.tab === activeTab);
        });

        if (window.lucide) window.lucide.createIcons();
        attachContentEvents();
    }

    function renderActiveTab(tab, data, log) {
        switch (tab) {
            case 'dashboard': return renderDashboard(data, log);
            case 'routines': return renderRoutines(data, log);
            case 'config': return renderConfig(data);
            default: return '';
        }
    }

    function renderDashboard(data, log) {
        const morningCount = data.morningRoutine?.length || 0;
        const eveningCount = data.eveningRoutine?.length || 0;
        const morningDone = (log.completedItems || []).filter(id => data.morningRoutine?.some(i => i.id === id)).length;
        const eveningDone = (log.completedItems || []).filter(id => data.eveningRoutine?.some(i => i.id === id)).length;

        const mPct = morningCount ? Math.round((morningDone / morningCount) * 100) : 0;
        const ePct = eveningCount ? Math.round((eveningDone / eveningCount) * 100) : 0;

        return `
            <div class="fitness-layout-grid">
                <div class="fitness-main-content">
                    <div class="studio-card" style="padding: 2.5rem; background: linear-gradient(135deg, var(--bg-primary), rgba(var(--accent-color-rgb), 0.03)); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -10px; right: -10px; opacity: 0.05; transform: rotate(15deg);">
                            <i data-lucide="sparkles" style="width: 150px; height: 150px; color: var(--accent-color);"></i>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; position: relative; z-index: 1;">
                            <div>
                                <h3 style="margin: 0; color: var(--text-muted); font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">État de Discipline</h3>
                                <div style="font-size: 4rem; font-family: 'Orbitron', sans-serif; font-weight: 900; color: var(--text-primary); line-height: 1; margin-top: 0.5rem;">${data.streak || 0}</div>
                                <div style="color: #2dd4bf; font-weight: 800; font-size: 0.95rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                    <i data-lucide="shield-check" style="width: 18px;"></i> CONTRAT DE PURETÉ ACTIF
                                </div>
                            </div>
                            <div class="purity-badge glass" style="background: rgba(var(--accent-color-rgb), 0.1); border: 1px solid rgba(var(--accent-color-rgb), 0.2); padding: 1rem 1.5rem; border-radius: 12px; text-align: center;">
                                <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Aura & Gain XP</div>
                                <div style="font-family: 'Orbitron', sans-serif; color: var(--accent-color); font-weight: 900; font-size: 1rem; margin-top: 0.25rem;">
                                    ${getHygieneAura(data.streak).name}
                                </div>
                                <div style="font-family: 'Orbitron', sans-serif; color: var(--status-finished); font-weight: 900; font-size: 1.25rem; margin-top: 0.25rem;">+${getHygieneAura(data.streak).bonus || 5} XP/j</div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; position: relative; z-index: 1;">
                            <div class="progress-box">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-weight: 800; font-size: 0.8rem; color: var(--text-secondary);">
                                    <span>RITUEL MATINAL</span>
                                    <span style="color: var(--hygiene-m-start);">${mPct}%</span>
                                </div>
                                <div class="progress-container" style="height: 10px; background: var(--bg-tertiary); border-radius: 5px;">
                                    <div class="progress-segment" style="width: ${mPct}%; background: linear-gradient(to right, var(--hygiene-m-start), var(--hygiene-m-end)); border-radius: 5px;"></div>
                                </div>
                            </div>
                            <div class="progress-box">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-weight: 800; font-size: 0.8rem; color: var(--text-secondary);">
                                    <span>RITUEL NOCTURNE</span>
                                    <span style="color: var(--hygiene-e-start);">${ePct}%</span>
                                </div>
                                <div class="progress-container" style="height: 10px; background: var(--bg-tertiary); border-radius: 5px;">
                                    <div class="progress-segment" style="width: ${ePct}%; background: linear-gradient(to right, var(--hygiene-e-start), var(--hygiene-e-end)); border-radius: 5px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="studio-card">
                        <h3 style="margin-bottom: 1.5rem; font-family: 'Orbitron', sans-serif; font-size: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                            <i data-lucide="history" style="color: var(--accent-color);"></i> Vigueur Temporelle (30 jours)
                        </h3>
                        <div class="heatmap-grid">
                            ${renderHeatmap(data.logs || {})}
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">
                            <span>Inactif</span>
                            <div style="width: 12px; height: 12px; background: var(--bg-tertiary); border-radius: 2px;"></div>
                            <div style="width: 12px; height: 12px; background: rgba(45, 212, 191, 0.3); border-radius: 2px;"></div>
                            <div style="width: 12px; height: 12px; background: #2dd4bf; border-radius: 2px;"></div>
                            <span>Pur</span>
                        </div>
                    </div>
                </div>

                <div class="fitness-sidebar">
                    <div class="studio-card" style="padding: 1.5rem; background: var(--bg-secondary); border-style: dashed;">
                        <h3 style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                            <i data-lucide="target" style="color: var(--vibrant-4);"></i> Prochain Palier
                        </h3>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 1.5rem;">Atteignez 7 jours consécutifs pour débloquer le badge <strong>"Cristal"</strong>.</p>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${Array.from({length: 7}).map((_, i) => {
                                const isDone = i < (data.streak % 7);
                                return `
                                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: ${isDone ? 'rgba(45, 212, 191, 0.1)' : 'var(--bg-primary)'}; border-radius: 10px; border: 1px solid ${isDone ? '#2dd4bf' : 'var(--border-color)'};">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${isDone ? '#2dd4bf' : 'var(--bg-tertiary)'}; display: flex; align-items: center; justify-content: center; color: white;">
                                            ${isDone ? '<i data-lucide="check" style="width: 14px;"></i>' : `<span style="font-size: 0.7rem; font-weight: 800;">${i+1}</span>`}
                                        </div>
                                        <span style="font-size: 0.8rem; font-weight: 700; color: ${isDone ? 'var(--text-primary)' : 'var(--text-muted)'};">Jour ${i+1}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="studio-card" style="background: linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary));">
                        <h3 style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="award" style="color: var(--vibrant-warning);"></i> Distinctions
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            <div class="badge-mini active" title="Régulier" style="width: 100%; aspect-ratio: 1; background: var(--bg-tertiary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--vibrant-warning);"><i data-lucide="award"></i></div>
                            <div class="badge-mini ${data.streak >= 7 ? 'active' : ''}" style="width: 100%; aspect-ratio: 1; background: var(--bg-tertiary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${data.streak >= 7 ? '#2dd4bf' : 'var(--text-muted)'};" title="Série de 7 jours"><i data-lucide="zap"></i></div>
                            <div class="badge-mini ${data.streak >= 30 ? 'active' : ''}" style="width: 100%; aspect-ratio: 1; background: var(--bg-tertiary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${data.streak >= 30 ? '#a855f7' : 'var(--text-muted)'};" title="Maître de soi"><i data-lucide="crown"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderHeatmap(logs) {
        let html = '';
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toDateString();
            const log = logs[dateStr] || {};
            let level = 0;
            if (log.morning && log.evening) level = 2;
            else if (log.morning || log.evening) level = 1;

            html += `<div class="heatmap-cell level-${level}" title="${dateStr}"></div>`;
        }
        return html;
    }

    function renderRoutines(data, log) {
        const isMorningActive = isMorning();
        const morningItems = data.morningRoutine || [];
        const eveningItems = data.eveningRoutine || [];
        const completed = log.completedItems || [];

        return `
            <div class="fitness-layout-grid">
                <div class="fitness-main-content">
                    <div class="main-routine-card" style="background: var(--bg-primary); border-radius: 20px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: var(--shadow-md);">
                        <div class="routine-banner ${isMorningActive ? 'morning' : 'evening'}" style="padding: 3rem; background: linear-gradient(135deg, ${isMorningActive ? 'var(--hygiene-m-start), var(--hygiene-m-end)' : 'var(--hygiene-e-start), var(--hygiene-e-end)'}); position: relative; overflow: hidden;">
                            <div style="position: relative; z-index: 2;">
                                <div style="display: flex; align-items: center; gap: 1rem; color: rgba(255,255,255,0.9); font-weight: 800; font-size: 0.85rem; letter-spacing: 2px; margin-bottom: 0.75rem;">
                                    <i data-lucide="${isMorningActive ? 'sun' : 'moon'}" style="width: 20px; height: 20px;"></i>
                                    DISCIPLINE DU ${isMorningActive ? 'MATIN' : 'SOIR'}
                                </div>
                                <h2 style="font-family: 'Orbitron', sans-serif; font-size: 2.5rem; margin: 0; color: white; line-height: 1.1; font-weight: 900; text-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                    ${isMorningActive ? 'RÉVEIL DE FER' : 'RÉGÉNÉRATION'}
                                </h2>
                            </div>
                        </div>

                        <div class="routine-items-list" style="padding: 2rem; background: var(--bg-primary);">
                            ${(isMorningActive ? morningItems : eveningItems)
                                .filter(item => {
                                    if (data.activeCycle === 'rush') return item.isEssential;
                                    return true;
                                })
                                .map(item => `
                                <div class="premium-item ${completed.includes(item.id) ? 'completed' : ''}" data-id="${item.id}" style="padding: 1.5rem; border-radius: 16px; margin-bottom: 1rem; border: 1px solid var(--border-color); background: var(--bg-secondary); transition: var(--transition);">
                                    <div style="display: flex; align-items: center; gap: 1.5rem; flex: 1;">
                                        <div class="checkbox-premium" style="width: 32px; height: 32px; border: 2px solid ${completed.includes(item.id) ? '#2dd4bf' : 'var(--border-color)'}; background: ${completed.includes(item.id) ? '#2dd4bf' : 'transparent'}; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white;">
                                            ${completed.includes(item.id) ? '<i data-lucide="check" style="width: 18px; height: 18px;"></i>' : ''}
                                        </div>
                                        <div class="item-content">
                                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                                <div class="item-name-text" style="font-size: 1.1rem; font-weight: 700; color: ${completed.includes(item.id) ? 'var(--text-muted)' : 'var(--text-primary)'};">${item.name}</div>
                                                ${item.isEssential ? '<span class="essential-badge">Essentiel</span>' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    ${!completed.includes(item.id) ? `
                                        <button class="item-timer-trigger studio-btn studio-btn-secondary" data-id="${item.id}" data-duration="120" style="padding: 0.5rem; border-radius: 10px;">
                                            <i data-lucide="timer" style="width: 20px; height: 20px;"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            `).join('')}
                            
                            ${(isMorningActive ? morningItems : eveningItems).length === 0 ? `
                                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                                    <i data-lucide="list-plus" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.3;"></i>
                                    <p>Aucun rituel configuré pour ce cycle.</p>
                                    <button class="studio-btn studio-btn-primary" onclick="activeTab = 'config'; render(true);" style="margin-top: 1rem;">Configurer</button>
                                </div>
                            ` : ''}
                        </div>

                        ${activeTimer ? renderTimerOverlay() : ''}
                    </div>
                </div>

                <div class="fitness-sidebar">
                    <div class="studio-card" style="opacity: 0.8; border-style: dashed; background: var(--bg-secondary);">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                            <i data-lucide="${!isMorningActive ? 'sun' : 'moon'}" style="color: var(--text-muted); width: 18px;"></i>
                            <h4 style="margin: 0; font-size: 0.75rem; color: var(--text-muted); font-weight: 800; letter-spacing: 1px;">PROCHAIN RITUEL</h4>
                        </div>
                        <div style="font-weight: 900; font-family: 'Orbitron', sans-serif; font-size: 1.25rem; margin-bottom: 2rem; color: var(--text-primary);">
                            ${!isMorningActive ? 'CYCLE MATINAL' : 'CYCLE NOCTURNE'}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            ${(!isMorningActive ? morningItems : eveningItems).slice(0, 4).map(it => `
                                <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: var(--bg-primary); border-radius: 8px;">
                                    <div style="width: 6px; height: 6px; background: var(--accent-color); border-radius: 50%;"></div>
                                    <span style="font-weight: 600;">${it.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="studio-card" style="background: linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.05), transparent);">
                        <h3 style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; margin-bottom: 1rem;">Focus Mental</h3>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6;">
                            Chaque rituel complété renforce votre architecture mentale. La répétition est la mère de la maîtrise.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTimerOverlay() {
        const progress = 616 - (timerRemaining / timerTotal) * 616;
        const tip = MANGAKA_TIPS[Math.floor(Date.now() / 10000) % MANGAKA_TIPS.length];
        
        return `
            <div class="timer-overlay-premium">
                <div style="position: absolute; top: 3rem; left: 3rem; display: flex; align-items: center; gap: 1rem; opacity: 0.6;">
                    <i data-lucide="sparkles" style="color: #2dd4bf;"></i>
                    <span style="font-family: 'Orbitron', sans-serif; letter-spacing: 2px; font-size: 0.8rem;">PÉDITOLOGIE DE L'ESPRIT</span>
                </div>

                <h2 style="font-family: 'Orbitron', sans-serif; font-size: 2.5rem; margin-bottom: 4rem; letter-spacing: 4px; font-weight: 900;">FOCUS PUR</h2>

                <div class="breathing-circle">
                    <div class="timer-display-container">
                        <span class="timer-value">${formatTime(timerRemaining)}</span>
                        <svg class="timer-progress-svg" viewBox="0 0 320 320">
                            <circle cx="160" cy="160" r="154" fill="none" class="bg-circle"></circle>
                            <circle cx="160" cy="160" r="154" fill="none" class="progress-circle" style="stroke-dasharray: 968; stroke-dashoffset: ${968 - (timerRemaining / timerTotal) * 968};"></circle>
                        </svg>
                    </div>
                </div>

                <div class="mangaka-tip-container">
                    <p class="mangaka-tip">${tip}</p>
                </div>

                <div style="margin-top: 5rem; display: flex; gap: 2rem; align-items: center;">
                    <div class="studio-card glass" style="display: flex; gap: 1rem; padding: 0.5rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.05);">
                        ${Object.keys(AMBIENT_URLS).map(s => `
                            <button class="sound-select-btn" data-sound="${s}" style="background: ${activeSoundId === s ? 'var(--accent-color)' : 'transparent'}; border: none; color: white; padding: 0.5rem; border-radius: 8px; cursor: pointer;">
                                <i data-lucide="${s === 'rain' ? 'cloud-rain' : s === 'zen' ? 'flower' : s === 'forest' ? 'trees' : 'headphones'}" style="width: 18px;"></i>
                            </button>
                        `).join('')}
                    </div>
                    <button class="studio-btn studio-btn-primary toggle-audio-btn" style="width: 50px; height: 50px; border-radius: 50%;">
                        <i data-lucide="${isMuted ? 'volume-x' : 'volume-2'}"></i>
                    </button>
                    <button class="studio-btn studio-btn-secondary stop-timer-btn" style="border-radius: 30px; padding: 0.75rem 2rem;">ABANDONNER</button>
                </div>
            </div>
        `;
    }

    function renderConfig(data) {
        return `
            <div class="studio-card fade-in" style="padding: 2.5rem;">
                <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; font-family: 'Orbitron', sans-serif; font-size: 1.5rem;">Forge des Rituels</h2>
                        <p style="color: var(--text-secondary); margin-top: 0.5rem; font-weight: 500;">Personnalisez vos protocoles matinaux et nocturnes pour une discipline absolue.</p>
                    </div>
                    <i data-lucide="settings" style="width: 32px; height: 32px; color: var(--text-muted); opacity: 0.5;"></i>
                </div>

                <div class="hygiene-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding: 1rem; background: rgba(14, 165, 233, 0.05); border-radius: 12px; border-left: 4px solid #0ea5e9;">
                            <i data-lucide="sun" style="color: #0ea5e9;"></i>
                            <h4 style="margin: 0; font-family: 'Orbitron', sans-serif; font-size: 0.9rem; letter-spacing: 1px; color: #0ea5e9;">CYCLE MATINAL</h4>
                        </div>
                        <div id="config-m-list" style="display: flex; flex-direction: column; gap: 1rem;">
                            ${(data.morningRoutine || []).map(item => `
                                <div class="config-row glass" style="display: flex; gap: 0.75rem; padding: 0.5rem; border-radius: 12px; border: 1px solid var(--border-color); align-items: center;">
                                    <input type="text" class="studio-input config-m-input" value="${item.name}" data-id="${item.id}" style="flex: 1; border: none; background: transparent; font-weight: 600;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; cursor: pointer;">
                                        <input type="checkbox" class="config-m-essential" ${item.isEssential ? 'checked' : ''}> RUSH
                                    </label>
                                    <button class="btn-icon delete-item" data-id="${item.id}" style="color: #ef4444; background: var(--bg-tertiary);"><i data-lucide="trash-2" style="width: 16px;"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="studio-btn studio-btn-secondary add-config-item" data-type="m" style="width: 100%; margin-top: 1.5rem; padding: 1rem; border-style: dashed; border-width: 2px;">
                            <i data-lucide="plus-circle"></i> AJOUTER ÉTAPE
                        </button>
                    </div>

                    <div>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding: 1rem; background: rgba(99, 102, 241, 0.05); border-radius: 12px; border-left: 4px solid #6366f1;">
                            <i data-lucide="moon" style="color: #6366f1;"></i>
                            <h4 style="margin: 0; font-family: 'Orbitron', sans-serif; font-size: 0.9rem; letter-spacing: 1px; color: #6366f1;">CYCLE NOCTURNE</h4>
                        </div>
                        <div id="config-e-list" style="display: flex; flex-direction: column; gap: 1rem;">
                            ${(data.eveningRoutine || []).map(item => `
                                <div class="config-row glass" style="display: flex; gap: 0.75rem; padding: 0.5rem; border-radius: 12px; border: 1px solid var(--border-color); align-items: center;">
                                    <input type="text" class="studio-input config-e-input" value="${item.name}" data-id="${item.id}" style="flex: 1; border: none; background: transparent; font-weight: 600;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; cursor: pointer;">
                                        <input type="checkbox" class="config-e-essential" ${item.isEssential ? 'checked' : ''}> RUSH
                                    </label>
                                    <button class="btn-icon delete-item" data-id="${item.id}" style="color: #ef4444; background: var(--bg-tertiary);"><i data-lucide="trash-2" style="width: 16px;"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="studio-btn studio-btn-secondary add-config-item" data-type="e" style="width: 100%; margin-top: 1.5rem; padding: 1rem; border-style: dashed; border-width: 2px;">
                            <i data-lucide="plus-circle"></i> AJOUTER ÉTAPE
                        </button>
                    </div>
                </div>

                <div style="margin-top: 4rem; display: flex; justify-content: flex-end; gap: 1.5rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                    <button class="studio-btn studio-btn-secondary" onclick="activeTab = 'dashboard'; render(true);">ANNULER</button>
                    <button class="studio-btn studio-btn-primary" id="save-advanced-config" style="padding: 1rem 2.5rem; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">CRYSTALLISER LA CONFIGURATION</button>
                </div>
            </div>
        `;
    }

    function formatTime(s) {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function attachShellEvents() {
        container.querySelectorAll('.tab-link').forEach(btn => {
            btn.onclick = () => {
                activeTab = btn.dataset.tab;
                render(true);
            };
        });

        container.querySelectorAll('.cycle-btn').forEach(btn => {
            btn.onclick = () => {
                store.setActiveCycle(btn.dataset.cycle);
                render(true);
            };
        });
    }

    function attachContentEvents() {
        // Routine Items Toggle
        container.querySelectorAll('.premium-item').forEach(item => {
            item.onclick = (e) => {
                if (e.target.closest('.item-timer-trigger')) return;
                const id = item.dataset.id;
                store.toggleHygieneItem(activeTab, id);
                render(true);
            };
        });

        // Timer Start
        container.querySelectorAll('.item-timer-trigger').forEach(btn => {
            btn.onclick = () => {
                startTimer(btn.dataset.id, parseInt(btn.dataset.duration));
            };
        });

        // Timer Controls
        const stopBtn = container.querySelector('.stop-timer-btn');
        if (stopBtn) {
            stopBtn.onclick = () => stopTimer();
        }

        const audioBtn = container.querySelector('.toggle-audio-btn');
        if (audioBtn) {
            audioBtn.onclick = () => {
                isMuted = !isMuted;
                if (ambientSound) ambientSound.muted = isMuted;
                render(true);
            };
        }

        container.querySelectorAll('.sound-select-btn').forEach(btn => {
            btn.onclick = () => {
                activeSoundId = btn.dataset.sound;
                playAudio();
                render(true);
            };
        });

        // Config actions
        container.querySelectorAll('.add-config-item').forEach(btn => {
            btn.onclick = () => {
                const type = btn.dataset.type;
                const list = container.querySelector(`#config-${type}-list`);
                const id = type + Date.now();
                const div = document.createElement('div');
                div.className = 'config-row';
                div.style.display = 'flex';
                div.style.gap = '0.5rem';
                div.innerHTML = `
                    <input type="text" class="studio-input config-${type}-input" placeholder="Nouvelle étape..." data-id="${id}" style="flex: 1;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; cursor: pointer;">
                        <input type="checkbox" class="config-${type}-essential"> RUSH
                    </label>
                    <button class="btn-icon delete-item" data-id="${id}" style="color: #ef4444;"><i data-lucide="trash-2"></i></button>
                `;
                list.appendChild(div);
                if (window.lucide) window.lucide.createIcons();
                div.querySelector('.delete-item').onclick = () => div.remove();
            };
        });

        container.querySelectorAll('.delete-item').forEach(btn => {
            btn.onclick = () => btn.closest('.config-row').remove();
        });

        const saveBtn = container.querySelector('#save-advanced-config');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const morning = Array.from(container.querySelectorAll('.config-row:has(.config-m-input)')).map(row => ({
                    id: row.querySelector('.config-m-input').dataset.id,
                    name: row.querySelector('.config-m-input').value,
                    isEssential: row.querySelector('.config-m-essential').checked,
                    icon: 'sun'
                }));
                const evening = Array.from(container.querySelectorAll('.config-row:has(.config-e-input)')).map(row => ({
                    id: row.querySelector('.config-e-input').dataset.id,
                    name: row.querySelector('.config-e-input').value,
                    isEssential: row.querySelector('.config-e-essential').checked,
                    icon: 'moon'
                }));

                store.updateHygieneSettings({
                    morningRoutine: morning,
                    eveningRoutine: evening
                });
                alert('Protocole enregistré avec succès.');
                activeTab = 'dashboard';
                render(true);
            };
        }
    }

    function startTimer(id, duration) {
        activeTimer = id;
        timerRemaining = duration;
        timerTotal = duration;
        
        // Start Audio
        playAudio();

        render(true);

        timerInterval = setInterval(() => {
            timerRemaining--;
            if (timerRemaining <= 0) {
                completeTimer();
            } else {
                updateTimerUI();
            }
        }, 1000);
    }

    function playAudio() {
        if (ambientSound) {
            fadeOutAudio(() => {
                createNewAudio();
            });
        } else {
            createNewAudio();
        }
    }

    function createNewAudio() {
        ambientSound = new Audio(AMBIENT_URLS[activeSoundId]);
        ambientSound.loop = true;
        ambientSound.volume = 0; 
        ambientSound.muted = isMuted;
        ambientSound.play().catch(e => console.warn('Audio play failed', e));
        
        let targetVolume = 0.7;
        let v = 0;
        const fade = setInterval(() => {
            v += 0.07;
            if (v >= targetVolume) {
                ambientSound.volume = targetVolume;
                clearInterval(fade);
            } else {
                ambientSound.volume = v;
            }
        }, 50);
    }

    function fadeOutAudio(callback) {
        if (!ambientSound) {
            if (callback) callback();
            return;
        }
        let v = ambientSound.volume;
        const fade = setInterval(() => {
            v -= 0.05;
            if (v <= 0) {
                ambientSound.pause();
                clearInterval(fade);
                if (callback) callback();
            } else {
                ambientSound.volume = v;
            }
        }, 100);
    }

    function updateTimerUI() {
        const timeVal = container.querySelector('.timer-value');
        const progressCircle = container.querySelector('.progress-circle');
        
        if (timeVal) timeVal.textContent = formatTime(timerRemaining);
        if (progressCircle) {
            const circumference = 2 * Math.PI * 154; // r=154
            const offset = circumference - (timerRemaining / timerTotal) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // Update tip every 10s
        const tipEl = container.querySelector('.mangaka-tip');
        if (tipEl) {
            const tip = MANGAKA_TIPS[Math.floor(Date.now() / 10000) % MANGAKA_TIPS.length];
            if (tipEl.innerText !== tip) tipEl.innerText = tip;
        }
    }

    function completeTimer() {
        fadeOutAudio(() => {
            ambientSound = null;
        });
        clearInterval(timerInterval);
        store.toggleHygieneItem(activeTab, activeTimer);
        activeTimer = null;
        render(true);
        const chime = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        chime.play().catch(() => {});
    }

    function stopTimer() {
        clearInterval(timerInterval);
        
        // Instant UI feedback
        activeTimer = null;
        render(true);

        // Async audio cleanup
        if (ambientSound) {
            fadeOutAudio(() => {
                ambientSound = null;
            });
        }
    }

    render();
}
