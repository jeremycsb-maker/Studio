/**
 * Spotify Widget Component for Mangaka Studio
 * Provides a searchable Icon Explorer with access to the FULL Lucide library (~1900+ icons).
 */

export function initSpotify(container, store) {
    let isConfiguring = false;
    let currentPlaylistIdx = 0;
    let iconPickerState = { isOpen: false, targetIdx: -1, searchQuery: '' };
    let alarmActive = false;

    store.subscribe((state) => {
        if (state.alarmActive !== alarmActive) {
            alarmActive = state.alarmActive;
            render();
        }
    });

    function render() {
        if (iconPickerState.isOpen) {
            renderIconPicker();
            return;
        }

        const presets = store.settings.spotify?.presets || [];
        if (isConfiguring) {
            renderConfig(presets);
        } else {
            renderPlayer(presets);
        }

        if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 2.5 } });
    }

    function renderPlayer(presets) {
        const current = presets[currentPlaylistIdx] || { name: 'Aucune', url: '', icon: 'music' };
        
        container.innerHTML = `
            <div class="spotify-card">
                <div class="spotify-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div class="spotify-logo-container" style="display: flex; align-items: center; gap: 0.75rem;">
                        <i data-lucide="music-2" style="width: 20px; color: var(--accent-color);"></i>
                        <h3 style="margin: 0; font-family: 'Orbitron', sans-serif; font-size: 1rem;">Studio Sound</h3>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button class="studio-btn studio-btn-secondary" id="spotify-settings-btn" style="padding: 6px; border-radius: 6px;" title="Paramètres audio"><i data-lucide="sliders" style="width: 14px;"></i></button>
                    </div>
                </div>
                <div class="spotify-player-container">
                    ${alarmActive ? `
                        <div style="height:152px; background: rgba(59, 130, 246, 0.05); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.75rem; border-radius:12px; border: 2px dashed var(--accent-color); animation: pulse-border 2s infinite; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%); background-size: 200% 200%; animation: shimmer 3s infinite linear;"></div>
                            <i data-lucide="bell" style="width:36px; color:var(--accent-color); animation: ring 0.5s infinite; filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.4));"></i>
                            <div style="display: flex; flex-direction: column; align-items: center; z-index: 1;">
                                <div style="font-weight:900; font-size:0.8rem; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.15rem; margin-bottom: 0.25rem;">STUDIO : PAUSE ALARME</div>
                                <div style="font-size:0.7rem; color:var(--text-muted); font-weight: 500;">La musique reprendra après l'alerte</div>
                            </div>
                        </div>
                    ` : (current.url ? `<iframe src="${current.url}" width="100%" height="152" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
                      : `<div style="height:152px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); flex-direction:column; gap:1rem; background:var(--bg-tertiary);">
                            <i data-lucide="music" style="width:32px; opacity:0.3;"></i>Configurez une playlist</div>`)}
                </div>
                <div class="spotify-quick-access" style="display: flex; gap: 0.5rem; overflow-x: auto; padding-top: 1rem; border-top: 1px solid var(--border-color); ${alarmActive ? 'opacity:0.3; pointer-events:none;' : ''}">
                    ${presets.map((pl, index) => `<button class="studio-btn ${index === currentPlaylistIdx ? 'studio-btn-primary' : 'studio-btn-secondary'} spotify-btn" data-idx="${index}" style="font-size: 0.7rem; padding: 6px 12px; font-weight: 800; white-space: nowrap;">
                        <i data-lucide="${pl.icon || 'music'}" style="width: 14px;"></i>${pl.name.toUpperCase()}</button>`).join('')}
                </div>
            </div>
            <style>
                @keyframes pulse-border { 0% { border-color: var(--accent-color); } 50% { border-color: transparent; } 100% { border-color: var(--accent-color); } }
                @keyframes ring { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            </style>
        `;

        container.querySelectorAll('.spotify-btn').forEach(btn => btn.onclick = () => { currentPlaylistIdx = parseInt(btn.dataset.idx); render(); });
        document.getElementById('spotify-settings-btn').onclick = () => { isConfiguring = true; render(); };
    }

    function renderConfig(presets) {
        container.innerHTML = `
            <div class="spotify-card studio-card" style="min-height: 420px; display: flex; flex-direction: column; border: none; background: transparent;">
                <div class="spotify-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;"><i data-lucide="sliders" style="width: 20px; color: var(--accent-color);"></i><h3 style="margin:0; font-size:1rem; font-family: 'Orbitron', sans-serif;">SOUNDS</h3></div>
                    <button id="add-spotify-preset" class="studio-btn studio-btn-primary" style="padding: 0.5rem 1rem; font-size: 0.75rem;">+ AJOUTER</button>
                </div>
                <div id="spotify-presets-list" style="flex:1; overflow-y:auto; padding-right:5px; display: flex; flex-direction:column; gap:0.75rem;">
                    ${presets.map((p, index) => `
                        <div class="spotify-preset-card studio-card" data-index="${index}" style="background: var(--bg-secondary); padding: 1rem; border-radius: 12px;">
                            <div style="display: grid; grid-template-columns: 48px 1fr 40px; gap: 1rem; align-items: center;">
                                <div class="icon-picker-trigger studio-btn studio-btn-secondary" data-index="${index}" title="Changer d'icône" style="width: 48px; height: 48px; padding: 0; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="${p.icon || 'music'}" style="width: 24px;"></i>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                                    <div>
                                        <label style="font-size: 0.6rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">Nom</label>
                                        <input type="text" class="p-name studio-input" value="${p.name}" style="font-size: 0.8rem; padding: 4px 0;">
                                    </div>
                                    <div>
                                        <label style="font-size: 0.6rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">Icône</label>
                                        <input type="text" class="p-icon studio-input" value="${p.icon || 'music'}" style="font-size: 0.8rem; padding: 4px 0;">
                                    </div>
                                </div>
                                <button class="delete-p studio-btn studio-btn-secondary" data-index="${index}" style="padding: 8px; color: #ef4444;"><i data-lucide="trash-2" style="width: 16px;"></i></button>
                            </div>
                            <div style="margin-top:0.75rem;">
                                <label style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">URL Spotify (Lien de partage)</label>
                                <input type="text" class="p-url studio-input" value="${p.url}" style="font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; padding: 4px 0;">
                            </div>
                        </div>`).join('')}
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--border-color); margin-top: auto;">
                    <button id="spotify-cfg-cancel" class="studio-btn studio-btn-secondary">Annuler</button>
                    <button id="spotify-cfg-save" class="studio-btn studio-btn-primary">SAUVEGARDER</button>
                </div>
            </div>
        `;

        document.getElementById('add-spotify-preset').onclick = () => { saveTemporary([...presets, { id: 'sp-' + Date.now(), name: 'Nouveau', url: '', icon: 'music' }]); };
        container.querySelectorAll('.delete-p').forEach(btn => btn.onclick = () => { if (confirm("Supprimer ?")) saveTemporary(presets.filter((_, i) => i !== parseInt(btn.dataset.index))); });
        container.querySelectorAll('.icon-picker-trigger').forEach(trigger => trigger.onclick = () => { iconPickerState.isOpen = true; iconPickerState.targetIdx = parseInt(trigger.dataset.index); render(); });
        document.getElementById('spotify-cfg-cancel').onclick = () => { isConfiguring = false; render(); };
        document.getElementById('spotify-cfg-save').onclick = () => { saveAllPresets(); };
    }

    function renderIconPicker() {
        // Fetch ALL available Lucide icons dynamically from the global object
        const allIcons = window.lucide ? Object.keys(window.lucide.icons || {}) : [];
        const query = iconPickerState.searchQuery.toLowerCase();
        
        // Limit results to 150 for performance, but show all if query is empty (first 150)
        const filtered = allIcons.filter(name => name.toLowerCase().includes(query)).slice(0, 150);
        
        const existingInput = document.getElementById('icon-search-input');
        
        if (!existingInput) {
            container.innerHTML = `
                <div class="spotify-card studio-card" style="min-height: 420px; display: flex; flex-direction: column; border: none; background: transparent;">
                    <div class="spotify-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;"><i data-lucide="search" style="width: 18px; color: var(--accent-color);"></i><h3 style="margin:0; font-size:0.9rem; font-family: 'Orbitron', sans-serif;">ICONS (${allIcons.length})</h3></div>
                        <button id="close-icon-picker" class="studio-btn studio-btn-secondary" style="padding: 6px; border-radius: 6px;"><i data-lucide="arrow-left" style="width:14px;"></i></button>
                    </div>
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <input type="text" id="icon-search-input" value="${iconPickerState.searchQuery}" placeholder="Ex: coffee, music, heart..." autofocus class="studio-input" style="padding-left: 1rem;">
                    </div>
                    <div id="icon-results" style="flex:1; overflow-y:auto; display:grid; grid-template-columns: repeat(auto-fill, minmax(48px, 1fr)); gap:0.5rem; padding-right:5px;">
                    </div>
                </div>
            `;
            document.getElementById('close-icon-picker').onclick = () => { iconPickerState.isOpen = false; render(); };
            const input = document.getElementById('icon-search-input');
            input.oninput = (e) => { iconPickerState.searchQuery = e.target.value; renderIconPicker(); };
        }

        const resultsGrid = document.getElementById('icon-results');
        resultsGrid.innerHTML = `
            ${filtered.map(name => `
                <div class="icon-result-item studio-btn studio-btn-secondary" data-name="${name}" title="${name}" style="aspect-ratio:1/1; padding:0; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="${name}" style="width:18px;"></i>
                </div>`).join('')}
            ${filtered.length === 0 ? '<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted); font-size: 0.8rem; font-weight: 800;">AUCUNE ICÔNE TROUVÉE</div>' : ''}
        `;
        
        if (window.lucide) window.lucide.createIcons();

        resultsGrid.querySelectorAll('.icon-result-item').forEach(item => {
            item.onclick = () => {
                const name = item.dataset.name;
                const presets = store.settings.spotify?.presets || [];
                presets[iconPickerState.targetIdx].icon = name;
                store.updateSettings({ spotify: { presets } });
                iconPickerState.isOpen = false;
                iconPickerState.searchQuery = '';
                render();
            };
        });
    }

    function saveAllPresets() {
        const updated = [];
        container.querySelectorAll('.spotify-preset-card').forEach(card => {
            const name = card.querySelector('.p-name').value.trim();
            const icon = card.querySelector('.p-icon').value.trim();
            let url = card.querySelector('.p-url').value.trim();
            if (name && url) {
                if (url.includes('open.spotify.com/') && !url.includes('/embed')) url = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
                url = url.split('?')[0];
                updated.push({ id: 'sp-' + Date.now() + Math.random(), name, icon, url });
            }
        });
        store.updateSettings({ spotify: { presets: updated } });
        isConfiguring = false;
        currentPlaylistIdx = 0;
        render();
    }

    function saveTemporary(newPresets) {
        store.updateSettings({ spotify: { presets: newPresets } });
        render();
    }

    render();
}
