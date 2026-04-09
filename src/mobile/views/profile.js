// Mobile Profile View for Mangaka Studio

export function initMobileProfile(container, store) {
    const user = store.user;
    
    const render = () => {
        const accentColors = [
            { name: 'Bleu', hex: '#3b82f6' },
            { name: 'Violet', hex: '#8b5cf6' },
            { name: 'Vert', hex: '#10b981' },
            { name: 'Ambre', hex: '#f59e0b' },
            { name: 'Rose', hex: '#ec4899' },
            { name: 'Onyx', hex: '#1e293b' }
        ];

        container.innerHTML = `
            <div class="mobile-view-header">
                <h1>Mon Profil</h1>
            </div>

            <div class="mobile-card" style="text-align: center; padding: 40px 20px;">
                <div style="width: 120px; height: 120px; border-radius: 50%; background: var(--bg-tertiary); margin: 0 auto 20px auto; overflow: hidden; border: 4px solid var(--mobile-accent); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);">
                    ${user.avatar ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i data-lucide="user" style="width: 48px; color: #475569; margin-top: 30px;"></i>'}
                </div>
                <h2 style="font-family: 'Orbitron', sans-serif; color: white; margin-bottom: 5px;">${user.name || 'Artiste'}</h2>
                <div style="font-size: 0.75rem; color: var(--mobile-accent); font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Mangaka Rank S</div>
                
                <div style="margin-top: 30px; text-align: left; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Ma Bio</div>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 8px; line-height: 1.5;">${user.bio || 'Votre histoire commence ici...'}</p>
                </div>
            </div>

            <div class="mobile-card">
                <h3 style="font-size: 1rem; margin-bottom: 15px; color: #e2e8f0; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="palette" style="color: var(--mobile-accent); width: 18px;"></i> Thème
                </h3>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    ${accentColors.map(c => `
                        <div class="mob-color-swatch ${store.settings.accentColor === c.hex ? 'active' : ''}" 
                             data-color="${c.hex}" 
                             style="width: 40px; height: 40px; border-radius: 10px; background: ${c.hex}; border: 2px solid ${store.settings.accentColor === c.hex ? 'white' : 'transparent'};">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="mobile-card">
                 <h3 style="font-size: 1rem; margin-bottom: 15px; color: #e2e8f0;">Statistiques de carrière</h3>
                 <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                    <div style="padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid #4ade80;">
                        <div style="font-size: 1.2rem; font-weight: 900; color: white;">${store.careerStats.finished}</div>
                        <div style="font-size: 0.6rem; color: #94a3b8; font-weight: 800;">FINIES</div>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid #22d3ee;">
                        <div style="font-size: 1.2rem; font-weight: 900; color: white;">${store.careerStats.inked}</div>
                        <div style="font-size: 0.6rem; color: #94a3b8; font-weight: 800;">ENCRÉES</div>
                    </div>
                 </div>
            </div>

            <button id="mobile-logout-btn" class="studio-btn" style="width: 100%; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; padding: 15px; font-weight: 800; margin-top: 10px;">
                <i data-lucide="log-out" style="width: 18px; margin-right: 8px;"></i> DÉCONNEXION
            </button>

            <div style="height: 40px;"></div>
        `;

        if (window.lucide) window.lucide.createIcons();
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.mob-color-swatch').forEach(swatch => {
            swatch.onclick = () => {
                const color = swatch.dataset.color;
                store.updateSettings({ accentColor: color });
                render();
            };
        });

        document.getElementById('mobile-logout-btn').onclick = () => {
            if (confirm('Se déconnecter ?')) {
                store.logout();
                window.location.reload();
            }
        };
    };

    render();
}
