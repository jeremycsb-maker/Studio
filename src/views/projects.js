import { initProjectDetail } from './project_detail.js';
import { initMoodboard } from './moodboards.js';
import { renderDescriptionBlock } from '../components/description.js';
import { renderSegmentedProgress } from '../components/progress_bar.js';

export async function initProjects(container, store) {
    const render = () => {
        const projects = store.projects;
        container.innerHTML = `
            <div class="view-header">
                <div class="view-header-content">
                    <h1>Bibliothèque Studio</h1>
                    <p>Vos univers en expansion. Orchestrez vos séries et vos mondes imaginaires.</p>
                </div>
            </div>

            ${renderDescriptionBlock(store.user.bio || '', "Vision artistique, inspirations et notes générales pour votre studio...", async (newBio) => {
                await store.setUser({ ...store.user, bio: newBio });
            })}

            <div id="projects-grid" class="grid-standard" style="margin-top: 2rem;">
                ${projects.map(p => `
                    <div class="project-wrapper" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="studio-card card-flush project-card" data-id="${p.id}" style="cursor: pointer; position: relative; overflow: hidden; height: auto;">
                            <div class="card-13-18" style="overflow: hidden; background: var(--bg-tertiary);">
                                ${p.cover ? `<img src="${p.cover}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">` : `
                                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                                        <i data-lucide="image" style="width: 48px; opacity: 0.3;"></i>
                                    </div>
                                `}
                            </div>
                            
                            <!-- Actions Overlay -->
                            <div class="card-actions-overlay" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2rem; gap: 1rem; transition: var(--transition);">
                                <div class="action-btn edit-icon-trigger studio-btn studio-btn-primary" style="padding: 0.75rem; border-radius: 50%;" title="Renommer / Éditer">
                                    <i data-lucide="pencil" style="width: 18px;"></i>
                                </div>
                                <div class="action-btn overlay-moodboard-proj studio-btn studio-btn-secondary" data-id="${p.id}" style="padding: 0.75rem; border-radius: 50%;" title="Moodboard">
                                    <i data-lucide="palette" style="width: 18px;"></i>
                                </div>
                                <div class="action-btn delete-proj-btn studio-btn studio-btn-secondary" data-id="${p.id}" style="padding: 0.75rem; border-radius: 50%; color: #ef4444;" title="Supprimer">
                                    <i data-lucide="trash-2" style="width: 18px;"></i>
                                </div>
                            </div>
                        </div>

                        <div style="padding: 0 0.5rem;">
                            <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-color); text-transform: uppercase; letter-spacing: 0.5px;">${p.subtitle || 'Volume 01 Original'}</span>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">${p.volumes?.length || 0} Tome(s)</span>
                            </div>
                            ${renderSegmentedProgress(p, 'project')}
                        </div>
                    </div>
                `).join('')}

                <!-- Ghost Card for New Project -->
                <div class="project-wrapper ghost-project-wrapper">
                    <div id="new-project-ghost" class="studio-card card-13-18" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; border: 2px dashed var(--border-color); background: var(--bg-secondary); cursor: pointer; opacity: 0.6; transition: var(--transition); height: 100%;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="plus" style="width: 32px; color: var(--accent-color);"></i>
                        </div>
                        <span style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: 800; letter-spacing: 1px; color: var(--text-muted);">NOUVEAU PROJET</span>
                    </div>
                </div>
            </div>

            <!-- Modal for New/Edit Project -->
            <div id="project-modal" class="modal-overlay hidden">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2 id="modal-title">Créer un nouveau projet</h2>
                    </div>
                    
                    <div class="modal-body" style="display: grid; grid-template-columns: 200px 1fr; gap: 2rem;">
                        <div class="modal-sidebar">
                            <div class="modal-cover-upload studio-card" id="modal-cover-trigger" style="aspect-ratio: 13/18; display: flex; align-items: center; justify-content: center; cursor: pointer; background: var(--bg-tertiary); overflow: hidden; border: 2px dashed var(--border-color);">
                                <div id="modal-cover-preview-content" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; padding: 1rem;">
                                    <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">COUVERTURE</span>
                                </div>
                                <input type="file" id="modal-cover-input" accept="image/*" style="display: none;">
                            </div>
                        </div>

                        <div class="modal-main" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Titre du manga</label>
                                <input type="text" id="proj-title-input" placeholder="Ex: Horizon Obscur..." class="studio-input">
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Sous-titre (Optionnel)</label>
                                <input type="text" id="proj-subtitle-input" placeholder="Ex: Saga de l'Éveil..." class="studio-input">
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Synopsis</label>
                                <textarea id="proj-desc-input" placeholder="Décrivez votre univers..." class="studio-input" style="min-height: 120px; resize: none;"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button id="cancel-modal" class="studio-btn studio-btn-secondary">Annuler</button>
                        <button id="save-modal" class="studio-btn studio-btn-primary">ENREGISTRER LE PROJET</button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        setupListeners();
    };

    const setupListeners = () => {
        const projects = store.projects;
        let currentEditId = null;
        let tempCover = '';

        // Ghost Card Logic
        document.getElementById('new-project-ghost').onclick = () => {
            currentEditId = null;
            tempCover = '';
            document.getElementById('project-modal').classList.remove('hidden');
            document.getElementById('modal-title').innerText = 'Créer un nouveau projet';
            document.getElementById('proj-title-input').value = '';
            document.getElementById('proj-subtitle-input').value = '';
            document.getElementById('proj-desc-input').value = '';
            document.getElementById('modal-cover-preview-content').innerHTML = `
                <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">COUVERTURE</span>
            `;
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('proj-title-input').focus();
        };

        // Edit Icon Logic
        document.querySelectorAll('.edit-icon-trigger').forEach(icon => {
            icon.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                const wrapper = icon.closest('.project-wrapper');
                const id = wrapper?.querySelector('.project-card')?.dataset.id;
                const project = projects.find(p => p.id === id);
                if (project) {
                    currentEditId = project.id;
                    tempCover = project.cover || '';
                    document.getElementById('project-modal').classList.remove('hidden');
                    document.getElementById('modal-title').innerText = 'Éditer le projet';
                    document.getElementById('proj-title-input').value = project.title;
                    document.getElementById('proj-subtitle-input').value = project.subtitle || '';
                    document.getElementById('proj-desc-input').value = project.description || '';
                    if (tempCover) {
                        document.getElementById('modal-cover-preview-content').innerHTML = `<img src="${tempCover}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    } else {
                        document.getElementById('modal-cover-preview-content').innerHTML = `
                            <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">COUVERTURE</span>
                        `;
                    }
                    if (window.lucide) window.lucide.createIcons();
                    document.getElementById('proj-title-input').focus();
                }
            };
        });

        // Cover Upload Logic
        document.getElementById('modal-cover-trigger').onclick = () => {
            document.getElementById('modal-cover-input').click();
        };

        document.getElementById('modal-cover-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tempCover = event.target.result;
                    document.getElementById('modal-cover-preview-content').innerHTML = `<img src="${tempCover}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        };

        const closeModal = () => {
            document.getElementById('project-modal').classList.add('hidden');
        };

        document.getElementById('cancel-modal').onclick = closeModal;

        // Close on clicking overlay
        document.getElementById('project-modal').onclick = (e) => {
            if (e.target.id === 'project-modal') closeModal();
        };

        document.getElementById('save-modal').onclick = async () => {
            const title = document.getElementById('proj-title-input').value.trim();
            const subtitle = document.getElementById('proj-subtitle-input').value.trim();
            const description = document.getElementById('proj-desc-input').value.trim();
            if (title) {
                const projectData = {
                    id: currentEditId || Date.now().toString(),
                    title,
                    subtitle,
                    description,
                    cover: tempCover,
                    volumes: currentEditId ? projects.find(p => p.id === currentEditId).volumes : []
                };
                await store.saveProject(projectData);
                closeModal();
                render();
            }
        };

        // Navigation
        document.querySelectorAll('.project-card').forEach(card => {
            card.onclick = (e) => {
                if (e.target.closest('.action-btn')) return;
                const project = projects.find(p => p.id === card.dataset.id);
                initProjectDetail(container, store, project);
            };
        });

        document.querySelectorAll('.overlay-moodboard-proj').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                const project = projects.find(p => p.id === btn.dataset.id);
                initMoodboard(container, store, project, 'project');
            };
        });

        // Delete
        document.querySelectorAll('.delete-proj-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                if(confirm('Supprimer ce projet ?')) removeProject(btn.dataset.id);
            };
        });
    };

    const removeProject = async (id) => {
        await store.deleteProject(id);
        render();
    };

    const unsubscribe = store.subscribe(() => {
        const grid = document.getElementById('projects-grid');
        if (grid) {
            render();
        } else {
            unsubscribe();
        }
    });

    render();
}
