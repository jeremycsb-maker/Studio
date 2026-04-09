// Mobile Dashboard View for Mangaka Studio
import { calculateKPIs } from '../../lib/stats-utils.js';

export function initMobileDashboard(container, store) {
    const stats = calculateKPIs(store);
    
    container.innerHTML = `
        <div class="mobile-view-header">
            <h1>Salut, ${store.user.name || 'Artiste'} 👋</h1>
            <p style="color: #94a3b8; font-size: 0.9rem;">Prêt à créer votre prochain chef-d'œuvre ?</p>
        </div>

        <!-- Aura & XP Summary Card -->
        <div class="mobile-card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 40px; background: var(--mobile-accent); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="zap" style="color: white; width: 20px;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Aura Actuelle</div>
                        <div style="font-size: 1.2rem; font-weight: 800; color: white;">Niveau ${store.aura?.level || 1}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.2rem; font-weight: 900; color: var(--mobile-accent);">${store.aura?.xp || 0} XP</div>
                </div>
            </div>
            <div class="mobile-progress-pill">
                <div class="mobile-progress-fill" style="width: ${store.aura?.progress || 30}%"></div>
            </div>
        </div>

        <!-- Quick Actions -->
        <h2 style="font-size: 1rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Actions Rapides</h2>
        <div class="mobile-actions-grid">
            <a href="#projects" class="action-tile" data-view="projects">
                <i data-lucide="plus-circle"></i>
                <span>Nouveau Projet</span>
            </a>
            <a href="#fitness" class="action-tile" data-view="fitness">
                <i data-lucide="activity"></i>
                <span>Log Fitness</span>
            </a>
            <a href="#hygiene" class="action-tile" data-view="hygiene">
                <i data-lucide="sparkles"></i>
                <span>Rituel Hygiène</span>
            </a>
            <a href="#brainstorming" class="action-tile" data-view="brainstorming">
                <i data-lucide="lightbulb"></i>
                <span>Brainstorming</span>
            </a>
        </div>

        <!-- Today's Productivity -->
        <div class="mobile-card" style="margin-top: 2rem;">
            <h3 style="margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="trending-up" style="color: #4ade80; width: 18px;"></i>
                Productivité du jour
            </h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0; font-size: 0.9rem;">Storyboard</span>
                    <span style="color: #60a5fa; font-weight: 800;">${stats.realAvgs.storyboard} p/j</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #e2e8f0; font-size: 0.9rem;">Encrage</span>
                    <span style="color: #2dd4bf; font-weight: 800;">${stats.realAvgs.inked} p/j</span>
                </div>
            </div>
        </div>

        <div style="height: 40px;"></div> <!-- Spacer -->
    `;

    // Refresh icons
    if (window.lucide) window.lucide.createIcons();

    // Re-attach navigation events to action tiles
    container.querySelectorAll('.action-tile').forEach(tile => {
        tile.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = tile.getAttribute('data-view');
            window.location.hash = viewId;
        });
    });
}
