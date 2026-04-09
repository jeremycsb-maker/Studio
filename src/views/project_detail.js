// Tome Selection View for Mangaka Studio
import { initProjects } from './projects.js';
import { initChapters } from './chapters.js';
import { initMoodboard } from './moodboards.js';
import { renderDescriptionBlock } from '../components/description.js';
import { renderSegmentedProgress } from '../components/progress_bar.js';
import { openTeaserModal } from '../components/teaser_generator.js';

export function initProjectDetail(container, store, project) {
    const render = () => {
        // Use a persistent wrapper for the grid to avoid flickering the whole view
        container.innerHTML = `
            <div class="view-header">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <button id="back-to-projects" class="studio-btn studio-btn-secondary" style="padding: 0.75rem; border-radius: 50%;" title="Retour à la bibliothèque">
                        <i data-lucide="arrow-left"></i>
                    </button>
                    <div class="view-header-content">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <h1 id="global-project-title" style="margin: 0;">${project.title}</h1>
                            <button id="edit-project-title-btn" class="studio-btn studio-btn-secondary" style="padding: 4px; border-radius: 6px;" title="Modifier les infos">
                                <i data-lucide="edit-2" style="width: 14px;"></i>
                            </button>
                        </div>
                        <p>${project.subtitle || 'Série Originale'} • <span style="color: var(--accent-color); font-weight: 800;">${project.volumes?.length || 0} Tomes</span></p>
                    </div>
                </div>
            </div>

            ${renderDescriptionBlock(project.description || '', "Synopsis global, univers, thèmes et arcs narratifs de la série...", async (newDesc) => {
                project.description = newDesc;
                await store.saveProject(project);
            })}

            <div class="volumes-grid grid-standard" style="margin-top: 2rem;">
                ${(project.volumes || []).map((vol, vIdx) => `
                    <div class="volume-wrapper" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="studio-card card-flush volume-card" data-vidx="${vIdx}" style="cursor: pointer; position: relative; overflow: hidden; height: auto;">
                            <div class="card-13-18" style="overflow: hidden; background: var(--bg-tertiary);">
                                ${vol.cover ? `<img src="${vol.cover}" alt="${vol.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">` : `
                                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                                        <i data-lucide="book" style="width: 48px; opacity: 0.3;"></i>
                                    </div>
                                `}
                            </div>
                            
                            <!-- Actions Overlay -->
                            <div class="card-actions-overlay" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2rem; gap: 0.75rem; transition: var(--transition);">
                                <div class="action-btn edit-vol-trigger studio-btn studio-btn-primary" data-vidx="${vIdx}" style="padding: 0.6rem; border-radius: 50%;" title="Éditer">
                                    <i data-lucide="pencil" style="width: 16px;"></i>
                                </div>
                                <div class="action-btn overlay-moodboard-vol studio-btn studio-btn-secondary" data-vidx="${vIdx}" style="padding: 0.6rem; border-radius: 50%;" title="Moodboard">
                                    <i data-lucide="palette" style="width: 16px;"></i>
                                </div>
                                <div class="action-btn share-vol-btn studio-btn studio-btn-secondary" data-vidx="${vIdx}" style="padding: 0.6rem; border-radius: 50%;" title="Teaser">
                                    <i data-lucide="share-2" style="width: 16px;"></i>
                                </div>
                                <div class="action-btn delete-vol-btn studio-btn studio-btn-secondary" data-vidx="${vIdx}" style="padding: 0.6rem; border-radius: 50%; color: #ef4444;" title="Supprimer">
                                    <i data-lucide="trash-2" style="width: 16px;"></i>
                                </div>
                            </div>
                        </div>

                        <div style="padding: 0 0.5rem;">
                            <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${vol.title || `Tome ${vIdx + 1}`}</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-color); text-transform: uppercase;">${vol.subtitle || `Volume ${vIdx + 1}`}</span>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">${vol.chapters?.length || 0} Chapitres</span>
                            </div>
                            ${renderSegmentedProgress(vol, 'volume')}
                        </div>
                    </div>
                `).join('')}

                <div class="volume-wrapper">
                    <div id="new-volume-ghost" class="studio-card card-13-18" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; border: 2px dashed var(--border-color); background: var(--bg-secondary); cursor: pointer; opacity: 0.6; transition: var(--transition); height: 100%;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="plus" style="width: 32px; color: var(--accent-color);"></i>
                        </div>
                        <span style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: 800; letter-spacing: 1px; color: var(--text-muted);">NOUVEAU TOME</span>
                    </div>
                </div>
            </div>

            <!-- Modal for New/Edit Volume -->
            <div id="volume-modal" class="modal-overlay hidden">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2 id="vol-modal-title">Nouveau Tome</h2>
                    </div>
                    
                    <div class="modal-body" style="display: grid; grid-template-columns: 200px 1fr; gap: 2rem;">
                        <div class="modal-sidebar">
                            <div class="modal-cover-upload studio-card" id="vol-modal-cover-trigger" style="aspect-ratio: 13/18; display: flex; align-items: center; justify-content: center; cursor: pointer; background: var(--bg-tertiary); overflow: hidden; border: 2px dashed var(--border-color);">
                                <div id="vol-modal-cover-preview-content" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; padding: 1rem;">
                                    <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">COUVERTURE</span>
                                </div>
                                <input type="file" id="vol-modal-cover-input" accept="image/*" style="display: none;">
                            </div>
                        </div>

                        <div class="modal-main" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Titre du tome</label>
                                <input type="text" id="vol-title-input" placeholder="Ex: Tome 1, Arc de la Forêt..." class="studio-input">
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Sous-titre (Optionnel)</label>
                                <input type="text" id="vol-subtitle-input" placeholder="Ex: Le Commencement..." class="studio-input">
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Note / Résumé</label>
                                <textarea id="vol-desc-input" placeholder="Notes pour ce tome..." class="studio-input" style="min-height: 120px; resize: none;"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button id="cancel-vol-modal" class="studio-btn studio-btn-secondary">Annuler</button>
                        <button id="save-vol-modal" class="studio-btn studio-btn-primary">ENREGISTRER LE TOME</button>
                    </div>
                </div>
            </div>

            <!-- Modal for Renaming Project -->
            <div id="project-rename-modal" class="modal-overlay hidden">
                <div class="modal-card" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Éditer le projet</h2>
                    </div>
                    <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Titre de la série</label>
                            <input type="text" id="project-rename-input" class="studio-input">
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Sous-titre / Slogan</label>
                            <input type="text" id="project-subtitle-rename-input" class="studio-input">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-rename" class="studio-btn studio-btn-secondary">Annuler</button>
                        <button id="save-rename" class="studio-btn studio-btn-primary">SAUVEGARDER</button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        setupListeners();
    };

    // Keep track of current project state to avoid redundant renders
    let lastStateString = JSON.stringify(project);

    const setupListeners = () => {
        // ... (existing setupListeners logic)
        let currentVolIdx = null;
        let tempVolCover = '';

        // Project Rename Logic
        document.getElementById('edit-project-title-btn').onclick = () => {
            document.getElementById('project-rename-modal').classList.remove('hidden');
            document.getElementById('project-rename-input').value = project.title;
            document.getElementById('project-subtitle-rename-input').value = project.subtitle || '';
            document.getElementById('project-rename-input').focus();
        };

        const closeProjModal = () => document.getElementById('project-rename-modal').classList.add('hidden');
        document.getElementById('cancel-rename').onclick = closeProjModal;
        document.getElementById('project-rename-modal').onclick = (e) => { if(e.target.id === 'project-rename-modal') closeProjModal(); };

        document.getElementById('save-rename').onclick = async () => {
            project.title = document.getElementById('project-rename-input').value.trim();
            project.subtitle = document.getElementById('project-subtitle-rename-input').value.trim();
            if (project.title) {
                await store.saveProject(project);
                closeProjModal();
                lastStateString = JSON.stringify(project); // Update baseline
                render();
            }
        };

        // Volume Logic
        document.getElementById('new-volume-ghost').onclick = () => {
            currentVolIdx = null;
            tempVolCover = '';
            document.getElementById('volume-modal').classList.remove('hidden');
            document.getElementById('vol-modal-title').innerText = 'Nouveau Tome';
            document.getElementById('vol-title-input').value = `Tome ${(project.volumes?.length || 0) + 1}`;
            document.getElementById('vol-subtitle-input').value = '';
            document.getElementById('vol-desc-input').value = '';
            document.getElementById('vol-modal-cover-preview-content').innerHTML = `
                <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">COUVERTURE</span>
            `;
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('vol-title-input').focus();
        };

        // Volume Edit Logic
        document.querySelectorAll('.edit-vol-trigger').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                const vIdx = parseInt(btn.dataset.vidx);
                const vol = project.volumes[vIdx];
                if (vol) {
                    currentVolIdx = vIdx;
                    tempVolCover = vol.cover || '';
                    document.getElementById('volume-modal').classList.remove('hidden');
                    document.getElementById('vol-modal-title').innerText = 'Éditer le tome';
                    document.getElementById('vol-title-input').value = vol.title;
                    document.getElementById('vol-subtitle-input').value = vol.subtitle || '';
                    document.getElementById('vol-desc-input').value = vol.description || '';
                    if (tempVolCover) {
                        document.getElementById('vol-modal-cover-preview-content').innerHTML = `<img src="${tempVolCover}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    } else {
                        document.getElementById('vol-modal-cover-preview-content').innerHTML = `
                            <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">COUVERTURE</span>
                        `;
                    }
                    if (window.lucide) window.lucide.createIcons();
                    document.getElementById('vol-title-input').focus();
                }
            };
        });

        document.getElementById('vol-modal-cover-trigger').onclick = () => {
            document.getElementById('vol-modal-cover-input').click();
        };

        document.getElementById('vol-modal-cover-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tempVolCover = event.target.result;
                    document.getElementById('vol-modal-cover-preview-content').innerHTML = `<img src="${tempVolCover}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        };

        const closeVolModal = () => {
            document.getElementById('volume-modal').classList.add('hidden');
        };

        document.getElementById('cancel-vol-modal').onclick = closeVolModal;
        document.getElementById('volume-modal').onclick = (e) => { if(e.target.id === 'volume-modal') closeVolModal(); };

        document.getElementById('save-vol-modal').onclick = async () => {
            const title = document.getElementById('vol-title-input').value.trim();
            const subtitle = document.getElementById('vol-subtitle-input').value.trim();
            const description = document.getElementById('vol-desc-input').value.trim();
            if (title) {
                if (!project.volumes) project.volumes = [];
                const volData = {
                    title,
                    subtitle,
                    description,
                    cover: tempVolCover,
                    chapters: currentVolIdx !== null ? project.volumes[currentVolIdx].chapters : []
                };
                if (currentVolIdx !== null) {
                    project.volumes[currentVolIdx] = volData;
                } else {
                    project.volumes.push(volData);
                }
                await store.saveProject(project);
                closeVolModal();
                lastStateString = JSON.stringify(project); // Update baseline
                render();
            }
        };

        // Navigation & Actions
        document.getElementById('back-to-projects').onclick = () => initProjects(container, store);

        document.querySelectorAll('.delete-vol-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                if(confirm('Supprimer ce tome et tout son contenu ?')) {
                    project.volumes.splice(btn.dataset.vidx, 1);
                    await store.saveProject(project);
                    lastStateString = JSON.stringify(project); // Update baseline
                    render();
                }
            };
        });

        document.querySelectorAll('.volume-card').forEach(card => {
            card.onclick = (e) => {
                if (e.target.closest('.action-btn')) return;
                initChapters(container, store, project, card.dataset.vidx);
            };
        });

        document.querySelectorAll('.overlay-moodboard-vol').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); initMoodboard(container, store, project, 'volume', btn.dataset.vidx); };
        });

        document.querySelectorAll('.share-vol-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const vIdx = btn.dataset.vidx;
                openTeaserModal(project.volumes[vIdx], 'volume', project.title);
            };
        });
    };

    const unsubscribe = store.subscribe((state) => {
        const grid = document.querySelector('.volumes-grid');
        if (grid) {
            // Find the updated project in the store to see if it changed
            const updatedProject = state.projects.find(p => p.id === project.id);
            if (updatedProject) {
                const newStateString = JSON.stringify(updatedProject);
                if (newStateString !== lastStateString) {
                    lastStateString = newStateString;
                    // Important: update the local project reference
                    Object.assign(project, updatedProject);
                    render();
                }
            }
        } else {
            unsubscribe();
        }
    });

    render();
}
