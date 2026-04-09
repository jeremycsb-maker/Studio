// Mobile Projects View for Mangaka Studio
import { renderSegmentedProgress } from '../../components/progress_bar.js';

export function initMobileProjects(container, store) {
    const render = () => {
        const projects = store.projects;
        container.innerHTML = `
            <div class="mobile-view-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1>Mes Projets</h1>
                    <button id="mobile-add-project" class="action-btn" style="background: var(--mobile-accent); color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
            </div>

            <div id="mobile-projects-list" style="display: flex; flex-direction: column; gap: 20px;">
                ${projects.length ? projects.map(p => `
                    <div class="mobile-card project-card-mobile" data-id="${p.id}" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                        <div style="height: 180px; width: 100%; position: relative; background: #1e293b;">
                            ${p.cover ? `<img src="${p.cover}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #475569;">
                                    <i data-lucide="image" style="width: 48px;"></i>
                                </div>
                            `}
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(to top, rgba(15,23,42,0.9), transparent);">
                                <h3 style="margin: 0; color: white; font-family: 'Orbitron', sans-serif; font-size: 1.2rem;">${p.title}</h3>
                                <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-top: 4px;">${p.subtitle || 'Volume 01'}</div>
                            </div>
                        </div>
                        <div style="padding: 20px;">
                             ${renderSegmentedProgress(p, 'project')}
                             <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                                <div style="display: flex; gap: 8px;">
                                    <span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800;">${p.volumes?.length || 0} TOMES</span>
                                </div>
                                <div style="display: flex; gap: 15px; color: #94a3b8;">
                                    <i data-lucide="more-vertical"></i>
                                </div>
                             </div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 60px 20px; border: 2px dashed rgba(255,255,255,0.05); border-radius: 24px;">
                        <i data-lucide="book-open" style="width: 48px; color: #475569; margin-bottom: 20px;"></i>
                        <h3 style="color: #94a3b8;">Aucun projet pour le moment</h3>
                        <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">Commencez par créer votre premier manga !</p>
                    </div>
                `}
            </div>

            <div style="height: 30px;"></div>
        `;

        if (window.lucide) window.lucide.createIcons();
        attachEvents();
    };

    const attachEvents = () => {
        // Logic for clicking a project
        container.querySelectorAll('.project-card-mobile').forEach(card => {
            card.onclick = () => {
                // For now, let's keep it simple or redirect to detail
                // window.location.hash = `projects/${card.dataset.id}`;
            };
        });

        // Add project logic (could trigger a mobile-optimized modal or new view)
        document.getElementById('mobile-add-project').onclick = () => {
            // alert('Feature to add project on mobile coming soon');
        };
    };

    render();
}
