// Chapters Selection View for Mangaka Studio
import { initProduction } from './production.js';
import { initProjectDetail } from './project_detail.js';
import { initMoodboard } from './moodboards.js';
import { renderDescriptionBlock } from '../components/description.js';
import { renderSegmentedProgress } from '../components/progress_bar.js';
import { openTeaserModal } from '../components/teaser_generator.js';

export function initChapters(container, store, project, vIdx) {
    const volume = project.volumes[vIdx];
    
    const render = () => {
        container.innerHTML = `
            <div class="view-header">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <button id="back-to-tomes" class="studio-btn studio-btn-secondary" style="padding: 0.75rem; border-radius: 50%;" title="Retour aux tomes">
                        <i data-lucide="arrow-left"></i>
                    </button>
                    <div class="view-header-content">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <h1 id="global-vol-title" style="margin: 0;">${volume.title || `Tome ${vIdx + 1}`}</h1>
                            <button id="edit-vol-title-btn" class="studio-btn studio-btn-secondary" style="padding: 4px; border-radius: 6px;" title="Modifier le titre">
                                <i data-lucide="edit-2" style="width: 14px;"></i>
                            </button>
                        </div>
                        <p>${project.title} • Volume ${vIdx + 1} • <span style="color: var(--accent-color); font-weight: 800;">${volume.chapters?.length || 0} Chapitres</span></p>
                    </div>
                </div>
            </div>

            ${renderDescriptionBlock(volume.description || '', "Résumé des enjeux et moments clés de ce volume...", async (newDesc) => {
                volume.description = newDesc;
                await store.saveProject(project);
            })}

            <div class="chapters-grid grid-standard" style="margin-top: 2rem;">
                ${(volume.chapters || []).map((ch, cIdx) => `
                    <div class="chapter-wrapper" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="studio-card card-flush chapter-card" data-cidx="${cIdx}" style="cursor: pointer; position: relative; overflow: hidden; height: auto;">
                            <div class="card-13-18" style="overflow: hidden; background: var(--bg-tertiary);">
                                ${ch.cover ? `<img src="${ch.cover}" alt="${ch.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;">` : `
                                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                                        <i data-lucide="file-text" style="width: 48px; opacity: 0.3;"></i>
                                    </div>
                                `}
                            </div>
                            
                            <!-- Actions Overlay -->
                            <div class="card-actions-overlay" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2rem; gap: 0.75rem; transition: var(--transition);">
                                <div class="action-btn edit-chap-trigger studio-btn studio-btn-primary" data-cidx="${cIdx}" style="padding: 0.6rem; border-radius: 50%;" title="Éditer">
                                    <i data-lucide="pencil" style="width: 16px;"></i>
                                </div>
                                <div class="action-btn overlay-moodboard-chap studio-btn studio-btn-secondary" data-cidx="${cIdx}" style="padding: 0.6rem; border-radius: 50%;" title="Moodboard">
                                    <i data-lucide="palette" style="width: 16px;"></i>
                                </div>
                                <div class="action-btn share-chap-btn studio-btn studio-btn-secondary" data-cidx="${cIdx}" style="padding: 0.6rem; border-radius: 50%;" title="Teaser">
                                    <i data-lucide="share-2" style="width: 16px;"></i>
                                </div>
                                <div class="action-btn delete-chap-btn studio-btn studio-btn-secondary" data-cidx="${cIdx}" style="padding: 0.6rem; border-radius: 50%; color: #ef4444;" title="Supprimer">
                                    <i data-lucide="trash-2" style="width: 16px;"></i>
                                </div>
                            </div>
                        </div>

                        <div style="padding: 0 0.5rem;">
                            <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ch.title || `Chapitre ${cIdx + 1}`}</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-color); text-transform: uppercase;">${ch.subtitle || `Chap. ${cIdx + 1}`}</span>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">${ch.pages?.length || 0} Pages</span>
                            </div>
                            ${renderSegmentedProgress(ch, 'chapter')}
                        </div>
                    </div>
                `).join('')}

                <!-- Ghost Card for New Chapter -->
                <div class="chapter-wrapper">
                    <div id="new-chapter-ghost" class="studio-card card-13-18" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; border: 2px dashed var(--border-color); background: var(--bg-secondary); cursor: pointer; opacity: 0.6; transition: var(--transition); height: 100%;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="plus" style="width: 32px; color: var(--accent-color);"></i>
                        </div>
                        <span style="font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: 800; letter-spacing: 1px; color: var(--text-muted);">NOUVEAU CHAPITRE</span>
                    </div>
                </div>
            </div>

            <!-- Modal for Chapter (New/Edit) -->
            <div id="chapter-modal" class="modal-overlay hidden">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2 id="chap-modal-title">Nouveau Chapitre</h2>
                    </div>
                    
                    <div class="modal-body" style="display: grid; grid-template-columns: 200px 1fr; gap: 2rem;">
                        <div class="modal-sidebar">
                            <div class="modal-cover-upload studio-card" id="chap-modal-cover-trigger" style="aspect-ratio: 13/18; display: flex; align-items: center; justify-content: center; cursor: pointer; background: var(--bg-tertiary); overflow: hidden; border: 2px dashed var(--border-color);">
                                <div id="chap-modal-cover-preview-content" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; padding: 1rem;">
                                    <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">KEY ART</span>
                                </div>
                                <input type="file" id="chap-modal-cover-input" accept="image/*" style="display: none;">
                            </div>
                        </div>

                        <div class="modal-main" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Titre du chapitre</label>
                                <input type="text" id="chap-title-input" placeholder="Ex: Premier Sang..." class="studio-input">
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Sous-titre (Optionnel)</label>
                                <input type="text" id="chap-subtitle-input" placeholder="Ex: L'Épert de la destinée..." class="studio-input">
                            </div>
                            <div class="form-group">
                                <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Note de production</label>
                                <textarea id="chap-desc-input" placeholder="Intention de ce chapitre..." class="studio-input" style="min-height: 120px; resize: none;"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button id="cancel-chap-modal" class="studio-btn studio-btn-secondary">Annuler</button>
                        <button id="save-chap-modal" class="studio-btn studio-btn-primary">ENREGISTRER LE CHAPITRE</button>
                    </div>
                </div>
            </div>

            <!-- Modal for Volume Renaming -->
            <div id="vol-rename-modal" class="modal-overlay hidden">
                <div class="modal-card" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>Renommer le tome</h2>
                    </div>
                    <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Titre du tome</label>
                            <input type="text" id="vol-rename-input" class="studio-input">
                        </div>
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Sous-titre</label>
                            <input type="text" id="vol-subtitle-rename-input" class="studio-input">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-vol-rename" class="studio-btn studio-btn-secondary">Annuler</button>
                        <button id="save-vol-rename" class="studio-btn studio-btn-primary">SAUVEGARDER</button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        setupListeners();
    };

    const setupListeners = () => {
        let currentChapIdx = null;
        let tempChapCover = '';

        // Volume Rename Logic
        document.getElementById('edit-vol-title-btn').onclick = () => {
            document.getElementById('vol-rename-modal').classList.remove('hidden');
            document.getElementById('vol-rename-input').value = volume.title;
            document.getElementById('vol-subtitle-rename-input').value = volume.subtitle || '';
            document.getElementById('vol-rename-input').focus();
        };

        const closeVolModal = () => document.getElementById('vol-rename-modal').classList.add('hidden');
        document.getElementById('cancel-vol-rename').onclick = closeVolModal;
        document.getElementById('vol-rename-modal').onclick = (e) => { if(e.target.id === 'vol-rename-modal') closeVolModal(); };
        document.getElementById('save-vol-rename').onclick = async () => {
            volume.title = document.getElementById('vol-rename-input').value.trim();
            volume.subtitle = document.getElementById('vol-subtitle-rename-input').value.trim();
            if (volume.title) {
                await store.saveProject(project);
                closeVolModal();
                render();
            }
        };

        // Ghost Card Logic
        document.getElementById('new-chapter-ghost').onclick = () => {
            currentChapIdx = null;
            tempChapCover = '';
            document.getElementById('chapter-modal').classList.remove('hidden');
            document.getElementById('chap-modal-title').innerText = 'Nouveau Chapitre';
            document.getElementById('chap-title-input').value = `Chapitre ${(volume.chapters?.length || 0) + 1}`;
            document.getElementById('chap-subtitle-input').value = '';
            document.getElementById('chap-desc-input').value = '';
            document.getElementById('chap-modal-cover-preview-content').innerHTML = `
                <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">KEY ART</span>
            `;
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('chap-title-input').focus();
        };

        // Edit Icon logic
        document.querySelectorAll('.edit-chap-trigger').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                const cIdx = parseInt(btn.dataset.cidx);
                const chap = volume.chapters[cIdx];
                if (chap) {
                    currentChapIdx = cIdx;
                    tempChapCover = chap.cover || '';
                    document.getElementById('chapter-modal').classList.remove('hidden');
                    document.getElementById('chap-modal-title').innerText = 'Éditer le chapitre';
                    document.getElementById('chap-title-input').value = chap.title;
                    document.getElementById('chap-subtitle-input').value = chap.subtitle || '';
                    document.getElementById('chap-desc-input').value = chap.description || '';
                    if (tempChapCover) {
                        document.getElementById('chap-modal-cover-preview-content').innerHTML = `<img src="${tempChapCover}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    } else {
                        document.getElementById('chap-modal-cover-preview-content').innerHTML = `
                            <i data-lucide="image" style="width: 32px; opacity: 0.5;"></i>
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">KEY ART</span>
                        `;
                    }
                    if (window.lucide) window.lucide.createIcons();
                    document.getElementById('chap-title-input').focus();
                }
            };
        });

        document.getElementById('chap-modal-cover-trigger').onclick = () => {
            document.getElementById('chap-modal-cover-input').click();
        };

        document.getElementById('chap-modal-cover-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tempChapCover = event.target.result;
                    document.getElementById('chap-modal-cover-preview-content').innerHTML = `<img src="${tempChapCover}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        };

        const closeChapModal = () => {
            document.getElementById('chapter-modal').classList.add('hidden');
        };

        document.getElementById('cancel-chap-modal').onclick = closeChapModal;
        document.getElementById('chapter-modal').onclick = (e) => { if(e.target.id === 'chapter-modal') closeChapModal(); };

        document.getElementById('save-chap-modal').onclick = async () => {
            const title = document.getElementById('chap-title-input').value.trim();
            const subtitle = document.getElementById('chap-subtitle-input').value.trim();
            const description = document.getElementById('chap-desc-input').value.trim();
            if (title) {
                if (!volume.chapters) volume.chapters = [];
                const chapData = {
                    title,
                    subtitle,
                    description,
                    cover: tempChapCover,
                    pages: currentChapIdx !== null ? volume.chapters[currentChapIdx].pages : []
                };
                if (currentChapIdx !== null) {
                    volume.chapters[currentChapIdx] = chapData;
                } else {
                    volume.chapters.push(chapData);
                }
                await store.saveProject(project);
                closeChapModal();
                render();
            }
        };

        // Navigation & Actions
        document.getElementById('back-to-tomes').onclick = () => initProjectDetail(container, store, project);

        document.querySelectorAll('.delete-chap-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                if(confirm('Supprimer ce chapitre ?')) {
                    volume.chapters.splice(btn.dataset.cidx, 1);
                    await store.saveProject(project);
                    render();
                }
            };
        });

        document.querySelectorAll('.chapter-card').forEach(card => {
            card.onclick = (e) => {
                if (e.target.closest('.action-btn')) return;
                initProduction(container, store, project, vIdx, card.dataset.cidx);
            };
        });

        document.querySelectorAll('.overlay-moodboard-chap').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); initMoodboard(container, store, project, 'chapter', vIdx, btn.dataset.cidx); };
        });

        document.querySelectorAll('.share-chap-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const cIdx = btn.dataset.cidx;
                openTeaserModal(volume.chapters[cIdx], 'chapter', project.title);
            };
        });
    };

    const unsubscribe = store.subscribe(() => {
        const grid = document.querySelector('.chapters-grid');
        if (grid) {
            render();
        } else {
            unsubscribe();
        }
    });

    render();
}
