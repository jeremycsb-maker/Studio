// Moodboard View for Mangaka Studio
import { initProjects } from './projects.js';
import { initProjectDetail } from './project_detail.js';
import { initChapters } from './chapters.js';

export function initMoodboard(container, store, project, targetType, vIdx, cIdx) {
    // targetType: 'project', 'volume' or 'chapter'
    let target;
    if (targetType === 'project') {
        if (!project.moodboard) project.moodboard = [];
        target = project;
    } else if (targetType === 'volume') {
        target = project.volumes[vIdx];
    } else {
        target = project.volumes[vIdx].chapters[cIdx];
    }
    
    if (!target.moodboard) target.moodboard = [];

    const render = () => {
        container.innerHTML = `
            <div class="view-header">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <button id="back-to-parent" class="studio-btn studio-btn-secondary" style="padding: 0.75rem; border-radius: 50%;" title="Retour">
                        <i data-lucide="arrow-left"></i>
                    </button>
                    <div class="view-header-content">
                        <h1 style="margin: 0; font-family: 'Orbitron', sans-serif; font-size: 1.5rem;">Moodboard : ${target.title || (targetType === 'project' ? project.title : (targetType === 'volume' ? `Tome ${vIdx+1}` : `Chapitre ${cIdx+1}`))}</h1>
                        <p>Archives visuelles et inspirations pour <span style="color: var(--accent-color); font-weight: 800; text-transform: uppercase;">${targetType}</span>.</p>
                    </div>
                </div>
                <div class="view-header-actions" style="display: flex; gap: 1rem;">
                    <button id="add-link-btn" class="studio-btn studio-btn-secondary" style="padding: 0.6rem; border-radius: 50%;" title="Ajouter un lien">
                        <i data-lucide="link" style="width: 18px;"></i>
                    </button>
                    <button id="add-img-btn" class="studio-btn studio-btn-primary" style="padding: 0.6rem; border-radius: 50%;" title="Ajouter une image">
                        <i data-lucide="image-plus" style="width: 18px;"></i>
                    </button>
                    <input type="file" id="mood-file-input" style="display: none;" accept="image/*" multiple>
                </div>
            </div>

            <div id="moodboard-grid" class="grid-standard" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); margin-top: 2rem; gap: 1.5rem;">
                ${target.moodboard.map((item, idx) => `
                    <div class="mood-item-card studio-card card-flush" style="aspect-ratio: 1; position: relative; overflow: hidden; background: var(--bg-secondary); padding: 0;">
                        ${item.type === 'image' ? `
                            <img src="${item.content}" style="width: 100%; height: 100%; object-fit: cover;">
                        ` : `
                            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                                    <i data-lucide="external-link" style="width: 24px; color: var(--accent-color);"></i>
                                </div>
                                <span style="font-size: 0.7rem; word-break: break-all; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">${new URL(item.content).hostname}</span>
                                <a href="${item.content}" target="_blank" class="studio-btn studio-btn-primary" style="margin-top: 1.5rem; font-size: 0.65rem; padding: 6px 12px; border-radius: 6px;">OUVRIR</a>
                            </div>
                        `}
                        <div class="card-actions-overlay" style="background: rgba(0,0,0,0.6); opacity: 0; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: var(--transition);">
                            <button class="action-btn delete-mood-item studio-btn" data-idx="${idx}" style="background: #ef4444; color: white; padding: 0.75rem; border-radius: 50%;" title="Supprimer">
                                <i data-lucide="trash-2" style="width: 18px;"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
                ${target.moodboard.length === 0 ? `
                    <div style="grid-column: 1/-1; padding: 6rem 2rem; text-align: center; border: 2px dashed var(--border-color); border-radius: 16px; background: var(--bg-secondary);">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i data-lucide="layout" style="width: 40px; opacity: 0.2;"></i>
                        </div>
                        <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-primary);">Moodboard Vide</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">Archivez vos inspirations visuelles et vos liens de référence ici.</p>
                    </div>
                ` : ''}
            </div>

            <!-- Modal for Link -->
            <div id="link-modal" class="modal-overlay hidden">
                <div class="modal-card" style="max-width: 450px;">
                    <div class="modal-header">
                        <h2>Inspiration Externe</h2>
                    </div>
                    <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">URL de référence (Pinterest, ArtStation...)</label>
                            <input type="url" id="mood-url-input" placeholder="https://..." class="studio-input">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="cancel-link" class="studio-btn studio-btn-secondary">Annuler</button>
                        <button id="save-link" class="studio-btn studio-btn-primary">AJOUTER LE LIEN</button>
                    </div>
                </div>
            </div>

            <style>
                .mood-item-card:hover .card-actions-overlay { opacity: 1; }
                .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; }
            </style>
        `;

        if (window.lucide) window.lucide.createIcons();
        setupListeners();
    };

    const setupListeners = () => {
        document.getElementById('back-to-parent').onclick = () => {
            if (targetType === 'project') {
                initProjects(container, store);
            } else if (targetType === 'volume') {
                initProjectDetail(container, store, project);
            } else {
                initChapters(container, store, project, vIdx);
            }
        };

        // Add Image
        document.getElementById('add-img-btn').onclick = () => document.getElementById('mood-file-input').click();
        document.getElementById('mood-file-input').onchange = async (e) => {
            const files = Array.from(e.target.files);
            for (const file of files) {
                const dataUrl = await readFile(file);
                target.moodboard.push({ type: 'image', content: dataUrl });
            }
            await store.saveProject(project);
            render();
        };

        // Add Link
        document.getElementById('add-link-btn').onclick = () => {
            document.getElementById('link-modal').classList.remove('hidden');
            document.getElementById('mood-url-input').focus();
        };
        const closeLinkModal = () => document.getElementById('link-modal').classList.add('hidden');
        document.getElementById('cancel-link').onclick = closeLinkModal;
        document.getElementById('link-modal').onclick = (e) => { if(e.target.id === 'link-modal') closeLinkModal(); };
        document.getElementById('save-link').onclick = async () => {
            const url = document.getElementById('mood-url-input').value.trim();
            if (url) {
                target.moodboard.push({ type: 'link', content: url });
                await store.saveProject(project);
                closeLinkModal();
                render();
            }
        };

        // Delete
        document.querySelectorAll('.delete-mood-item').forEach(btn => {
            btn.onclick = async () => {
                const idx = parseInt(btn.dataset.idx);
                target.moodboard.splice(idx, 1);
                await store.saveProject(project);
                render();
            };
        });
    };

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };

    render();
}
