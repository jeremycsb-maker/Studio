// Mobile Hygiene View for Mangaka Studio
import { getHygieneAura } from '../../lib/xp-utils.js';

export function initMobileHygiene(container, store) {
    let activeTab = 'routines'; // 'routines', 'stats'
    
    function isMorning() {
        const hour = new Date().getHours();
        return hour >= 4 && hour < 17;
    }

    function render() {
        const hygieneData = store.settings.hygiene || {};
        const todayStr = new Date().toDateString();
        const todayLog = hygieneData.logs?.[todayStr] || { morning: false, evening: false, completedItems: [] };
        const morningActive = isMorning();

        container.innerHTML = `
            <div class="mobile-view-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1>Rituels</h1>
                    <div style="background: linear-gradient(135deg, #0ea5e9, #2dd4bf); padding: 4px 12px; border-radius: 12px; font-weight: 800; font-family: 'Orbitron', sans-serif; font-size: 0.8rem; color: white; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="sparkles" style="width: 12px;"></i> ${hygieneData.streak || 0} Jours
                    </div>
                </div>
            </div>

            <div class="mobile-card ${morningActive ? 'morning-card' : 'evening-card'}" style="padding: 24px; position: relative; overflow: hidden; border: none;">
                <div style="position: relative; z-index: 2;">
                    <div style="font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 2px;">
                        Discipline du ${morningActive ? 'Matin' : 'Soir'}
                    </div>
                    <h2 style="margin: 5px 0 20px 0; font-family: 'Orbitron', sans-serif; color: white;">
                        ${morningActive ? 'Réveil de Fer' : 'Régénération'}
                    </h2>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${(morningActive ? (hygieneData.morningRoutine || []) : (hygieneData.eveningRoutine || [])).map(item => `
                            <div class="mobile-hygiene-item ${todayLog.completedItems.includes(item.id) ? 'done' : ''}" data-id="${item.id}">
                                <div class="mob-check">
                                    ${todayLog.completedItems.includes(item.id) ? '<i data-lucide="check" style="width: 14px;"></i>' : ''}
                                </div>
                                <span style="font-weight: 600; font-size: 0.95rem;">${item.name}</span>
                                ${item.isEssential ? '<i data-lucide="zap" style="width: 12px; color: #f59e0b; margin-left: auto;"></i>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="bg-glow"></div>
            </div>

            <div class="mobile-card">
                 <h3 style="font-size: 1rem; margin-bottom: 15px; color: #e2e8f0; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="award" style="color: #0ea5e9; width: 18px;"></i> Prochain Palier
                 </h3>
                 <p style="color: #94a3b8; font-size: 0.85rem;">Continuez encore ${7 - (hygieneData.streak % 7)} jours pour atteindre l'Aura de <strong>${getHygieneAura(hygieneData.streak + 1).name}</strong>.</p>
            </div>

            <style>
                .morning-card { background: linear-gradient(135deg, #0ea5e9, #2dd4bf); }
                .evening-card { background: linear-gradient(135deg, #6366f1, #a855f7); }
                .bg-glow {
                    position: absolute;
                    top: -50px;
                    right: -50px;
                    width: 200px;
                    height: 200px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    filter: blur(40px);
                }
                .mobile-hygiene-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 16px;
                    color: white;
                    transition: all 0.2s;
                }
                .mobile-hygiene-item.done {
                    background: rgba(255,255,255,0.05);
                    opacity: 0.7;
                }
                .mob-check {
                    width: 24px;
                    height: 24px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mobile-hygiene-item.done .mob-check {
                    background: #2dd4bf;
                    border-color: #2dd4bf;
                }
            </style>
        `;

        attachEvents();
    }

    function attachEvents() {
        container.querySelectorAll('.mobile-hygiene-item').forEach(item => {
            item.onclick = () => {
                const id = item.dataset.id;
                store.toggleHygieneItem(isMorning() ? 'routines' : 'routines', id);
                render();
            };
        });

        if (window.lucide) window.lucide.createIcons();
    }

    render();
}
