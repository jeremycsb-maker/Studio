// Production View (Chapter Workspace) for Mangaka Studio
import { initChapters } from './chapters.js';
import { renderDescriptionBlock } from '../components/description.js';
import { openTeaserModal } from '../components/teaser_generator.js';

export function initProduction(container, store, project, vIdx, cIdx) {
    const chapter = project.volumes[vIdx].chapters[cIdx];
    
    const render = () => {
        container.innerHTML = `
            <div class="view-header">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <button id="back-to-detail" class="studio-btn studio-btn-secondary" style="padding: 0.75rem; border-radius: 50%;" title="Retour aux chapitres">
                        <i data-lucide="arrow-left"></i>
                    </button>
                    <div class="view-header-content">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <h1 id="chapter-title-editable" contenteditable="true" style="outline: none; font-family: 'Orbitron', sans-serif;">${chapter.title}</h1>
                            ${store.silentMode ? '<span style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; font-size: 0.6rem; padding: 4px 10px; border-radius: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(139, 92, 246, 0.2); display: flex; align-items: center; gap: 4px;"><i data-lucide="ghost" style="width: 10px;"></i>MODE FANTÔME</span>' : ''}
                        </div>
                        <p>${project.title} • Tome ${vIdx + 1} • <span style="color: var(--accent-color); font-weight: 800;">Atelier de Production</span></p>
                    </div>
                </div>

                <div class="view-header-actions" style="display: flex; gap: 1rem; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 20px;">
                        <span style="font-size: 0.6rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">Flux Global :</span>
                        <div style="display: flex; gap: 4px;">
                            <button class="bulk-status-btn" data-status="0" title="À faire" style="background: none; border: none; padding: 4px; cursor: pointer; color: var(--status-empty); transition: transform 0.2s;"><i data-lucide="circle" style="width: 14px;"></i></button>
                            <button class="bulk-status-btn" data-status="1" title="Storyboard" style="background: none; border: none; padding: 4px; cursor: pointer; color: var(--status-storyboard); transition: transform 0.2s;"><i data-lucide="layout" style="width: 14px;"></i></button>
                            <button class="bulk-status-btn" data-status="2" title="Crayonné" style="background: none; border: none; padding: 4px; cursor: pointer; color: var(--status-penciled); transition: transform 0.2s;"><i data-lucide="pencil" style="width: 14px;"></i></button>
                            <button class="bulk-status-btn" data-status="3" title="Encrage" style="background: none; border: none; padding: 4px; cursor: pointer; color: var(--status-inked); transition: transform 0.2s;"><i data-lucide="pen-tool" style="width: 14px;"></i></button>
                            <button class="bulk-status-btn" data-status="4" title="Terminé" style="background: none; border: none; padding: 4px; cursor: pointer; color: var(--status-finished); transition: transform 0.2s;"><i data-lucide="check-circle" style="width: 14px;"></i></button>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 20px;">
                        <i data-lucide="layers" style="width: 14px; color: var(--text-muted);"></i>
                        <input type="number" id="page-count-input" value="${chapter.pages?.length || 0}" min="0" max="200" style="width: 40px; background: none; border: none; font-size: 0.75rem; font-weight: 950; color: var(--accent-color); outline: none; text-align: center; font-family: 'JetBrains Mono', monospace;">
                        <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase;">PAGES</span>
                    </div>

                    <div style="height: 24px; width: 1px; background: var(--border-color);"></div>

                    <button id="toggle-silent-mode-btn" class="studio-btn studio-btn-secondary ${store.silentMode ? 'active' : ''}" style="padding: 0.6rem; border-radius: 50%;" title="Mode Fantôme">
                        <i data-lucide="${store.silentMode ? 'ghost' : 'zap'}" style="width: 18px;"></i>
                    </button>
                    <button id="teaser-chapter-btn" class="studio-btn studio-btn-secondary" style="padding: 0.6rem; border-radius: 50%;" title="Générer Teaser">
                        <i data-lucide="share-2" style="width: 18px;"></i>
                    </button>
                    <button id="add-pages-bulk-btn" class="studio-btn studio-btn-primary" style="padding: 0.6rem; border-radius: 50%;" title="Importer images">
                        <i data-lucide="image-plus" style="width: 18px;"></i>
                    </button>
                    <input type="file" id="bulk-file-input" style="display: none;" multiple accept="image/*">
                </div>
            </div>

            ${renderDescriptionBlock(chapter.description || '', "Script, dialogues détaillés ou annotations pour ce chapitre...", async (newDesc) => {
                chapter.description = newDesc;
                await store.saveProject(project);
            })}

            <div class="production-workspace-grid">
                ${renderSpreads()}
            </div>
            
            <style>
                .page-card-compact {
                    width: 200px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .page-thumbnail {
                    width: 100%;
                    aspect-ratio: 13/18;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    overflow: hidden;
                    position: relative;
                    transition: var(--transition);
                }
                .page-thumbnail:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }
                .page-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .inner-dashed-box {
                    position: absolute;
                    inset: 0;
                    border: 2px dashed var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.5;
                    margin: -1px;
                }
                .add-page-placeholder {
                    cursor: pointer;
                }
                .add-page-placeholder .status-icon-bar {
                    opacity: 0.3;
                    pointer-events: none;
                }
                .upload-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    opacity: 0;
                    transition: var(--transition);
                    z-index: 5;
                }
                .page-info {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 24px;
                }
                .status-icon-btn, .status-icon-dummy {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-muted);
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--transition);
                    opacity: 0.4;
                }
                .status-icon-dummy {
                    cursor: default;
                }
                .status-icon-btn:hover {
                    opacity: 1;
                    color: var(--accent-color);
                    transform: scale(1.2);
                }
                .status-icon-btn.active {
                    opacity: 1;
                    color: var(--status-color, var(--accent-color));
                }
                .status-icon-btn i, .status-icon-dummy i {
                    width: 14px;
                    height: 14px;
                }
                .spread-label {
                    margin-top: 0.5rem;
                    font-size: 0.55rem;
                    color: var(--text-muted);
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    text-align: center;
                }
                .page-info span {
                    font-size: 0.75rem !important;
                    font-weight: 800 !important;
                }
                .status-icon-bar i {
                    width: 18px !important;
                    height: 18px !important;
                }
                .status-icon-btn, .status-icon-dummy {
                    padding: 4px !important;
                }
                .btn-icon.active {
                    color: #8b5cf6 !important;
                    background: rgba(139, 92, 246, 0.1) !important;
                }
            </style>
        `;

        if (window.lucide) window.lucide.createIcons();
        setupListeners();
    };

    const renderSpreads = () => {
        const pages = chapter.pages || [];
        const itemsToRender = [...pages, { isPlaceholder: true }];
        
        const spreads = [];
        for (let i = 0; i < itemsToRender.length; i += 2) {
            const pair = [itemsToRender[i]];
            if (itemsToRender[i+1]) pair.push(itemsToRender[i+1]);
            spreads.push(pair);
        }

        return spreads.map((spread, sIdx) => {
            return `
                <div class="spread-row" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="spread-container-compact" style="display: flex; flex-direction: row-reverse; gap: 2rem; justify-content: center;">
                        ${spread.map(page => {
                            const isPlaceholder = page.isPlaceholder;
                            const pIdx = isPlaceholder ? null : pages.indexOf(page);
                            const pageNum = isPlaceholder ? pages.length + 1 : pIdx + 1;
                            
                            return `
                                <div class="page-card-compact ${isPlaceholder ? 'add-page-placeholder' : ''}" style="width: 220px; display: flex; flex-direction: column; gap: 0.75rem;">
                                    <div class="page-info" style="display: flex; justify-content: space-between; align-items: center; padding: 0 0.5rem;">
                                        <span style="font-weight: 900; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--accent-color);">PAGE ${pageNum}</span>
                                        ${!isPlaceholder ? `
                                            <div style="display: flex; gap: 4px;">
                                                <button class="delete-page-btn" data-pidx="${pIdx}" style="background: none; border: none; padding: 2px; cursor: pointer; color: var(--text-muted); opacity: 0.5;"><i data-lucide="trash-2" style="width: 12px;"></i></button>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="studio-card page-thumbnail" ${!isPlaceholder ? `data-pidx="${pIdx}"` : ''} style="aspect-ratio: 13/18; position: relative; cursor: pointer; background: var(--bg-tertiary); overflow: hidden; padding: 0;">
                                        ${isPlaceholder ? `
                                            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; border: 2px dashed var(--border-color); border-radius: inherit;">
                                                <i data-lucide="plus" style="width: 32px; opacity: 0.3;"></i>
                                                <span style="font-size: 0.6rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Ajouter</span>
                                            </div>
                                        ` : `
                                            ${page.image ? `<img src="${page.image}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                                                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.1;">
                                                    <i data-lucide="image" style="width: 48px;"></i>
                                                </div>
                                            `}
                                            <div class="card-actions-overlay" style="background: rgba(0,0,0,0.6); opacity: 0; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: var(--transition);">
                                                <button class="change-page-btn studio-btn studio-btn-primary" data-pidx="${pIdx}" style="padding: 0.75rem; border-radius: 50%;">
                                                    <i data-lucide="camera" style="width: 18px;"></i>
                                                </button>
                                            </div>
                                            <input type="file" id="file-page-${pIdx}" class="page-file-input" style="display: none;" accept="image/*">
                                        `}
                                    </div>
                                    <div class="status-icon-bar" style="display: flex; justify-content: space-between; background: var(--bg-secondary); padding: 4px; border-radius: 8px;">
                                        ${[0, 1, 2, 3, 4].map(s => {
                                            const icons = ['circle', 'layout', 'pencil', 'pen-tool', 'check-circle'];
                                            const labels = ['À faire', 'Storyboard', 'Crayonné', 'Encrage', 'Terminé'];
                                            const colors = ['empty', 'storyboard', 'penciled', 'inked', 'finished'];
                                            
                                            if (isPlaceholder) {
                                                return `<div style="padding: 6px; opacity: 0.2; color: var(--text-muted);"><i data-lucide="${icons[s]}" style="width: 14px;"></i></div>`;
                                            }
                                            return `
                                                <button class="status-icon-btn ${page.status === s ? 'active' : ''}" data-pidx="${pIdx}" data-status="${s}" title="${labels[s]}" style="background: none; border: none; padding: 6px; cursor: pointer; color: ${page.status === s ? `var(--status-${colors[s]})` : 'var(--text-muted)'}; opacity: ${page.status === s ? '1' : '0.3'}; transition: transform 0.2s;">
                                                    <i data-lucide="${icons[s]}" style="width: 16px;"></i>
                                                </button>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div style="text-align: center; font-size: 0.6rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Double Page ${sIdx + 1}</div>
                </div>
            `;
        }).join('');
    };

    const setupListeners = () => {
        document.getElementById('back-to-detail').onclick = () => {
            initChapters(container, store, project, vIdx);
        };

        const silentBtn = document.getElementById('toggle-silent-mode-btn');
        if (silentBtn) {
            silentBtn.onclick = () => {
                store.toggleSilentMode();
                render();
            };
        }

        // Edit Chapter Title
        document.getElementById('chapter-title-editable').onblur = async (e) => {
            chapter.title = e.target.innerText;
            await store.saveProject(project);
        };

        // Edit Page Count
        const countInput = document.getElementById('page-count-input');
        if (countInput) {
            countInput.onchange = async (e) => {
                const newCount = parseInt(countInput.value) || 0;
                const prevCount = chapter.pages?.length || 0;

                if (newCount === prevCount) return;

                if (newCount < prevCount) {
                    if (!confirm(`Redimensionner à ${newCount} pages ? Les ${prevCount - newCount} dernières pages seront supprimées définitivement.`)) {
                        countInput.value = prevCount;
                        return;
                    }
                    chapter.pages = chapter.pages.slice(0, newCount);
                } else {
                    if (!chapter.pages) chapter.pages = [];
                    for (let i = prevCount; i < newCount; i++) {
                        chapter.pages.push({ status: 0, image: '' });
                    }
                }

                await store.saveProject(project);
                render();
            };
        }

        // Bulk Status Change
        document.querySelectorAll('.view-header-actions .bulk-status-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const nextStatus = parseInt(btn.dataset.status);
                const labels = ['À faire', 'Storyboard', 'Crayonné', 'Encrage', 'Terminé'];
                
                if (confirm(`Passer TOUTES les pages (${chapter.pages?.length || 0}) à l'état "${labels[nextStatus]}" ?`)) {
                    if (chapter.pages) {
                        chapter.pages.forEach(p => {
                            p.status = nextStatus;
                        });
                        console.log(`[Production] Bulk update: All pages set to ${labels[nextStatus]}`);
                        await store.saveProject(project);
                        render();
                    }
                }
            };
        });

        // Add Empty Page (Ghost Card)
        const placeholder = document.querySelector('.add-page-placeholder');
        if (placeholder) {
            placeholder.onclick = async () => {
                if (!chapter.pages) chapter.pages = [];
                chapter.pages.push({
                    status: 0,
                    image: ''
                });
                await store.saveProject(project);
                render();
            };
        }
        // Teaser Chapter
        const teaserBtn = document.getElementById('teaser-chapter-btn');
        if (teaserBtn) {
            teaserBtn.onclick = () => {
                openTeaserModal(chapter, 'chapter', project.title);
            };
        }

        // Bulk Import
        const bulkBtn = document.getElementById('add-pages-bulk-btn');
        const bulkInput = document.getElementById('bulk-file-input');
        
        bulkBtn.onclick = () => bulkInput.click();
        
        bulkInput.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            console.log(`[Production] Starting bulk import of ${files.length} files...`);
            files.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'}));

            if (!chapter.pages) chapter.pages = [];
            
            // Batch processing to avoid UI freeze
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`[Production] Importing ${i+1}/${files.length}: ${file.name}`);
                
                const dataUrl = await readFileAsDataURL(file);
                chapter.pages.push({
                    status: 0,
                    image: dataUrl
                });

                // Yield to main thread every few images if needed, 
                // but at least render occasionally if the list is long
                if (i % 5 === 0 && i > 0) {
                    console.log(`[Production] Intermediate save and render at page ${i+1}`);
                    await store.saveProject(project);
                    render();
                }
            }
            
            console.log(`[Production] Bulk import completed.`);
            await store.saveProject(project);
            
            // CRITICAL: Reset input value so same files can be re-imported
            e.target.value = '';
            
            render();
        };

        // Change Page
        document.querySelectorAll('.change-page-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const pIdx = btn.dataset.pidx;
                document.getElementById(`file-page-${pIdx}`).click();
            };
        });

        // Placeholder click
        // Remove the thumbnail sub-trigger as it bubbles up to the parent placeholder click
        // document.querySelectorAll('.add-page-placeholder .page-thumbnail').forEach(thumb => {
        //     thumb.onclick = () => {
        //         document.querySelector('.add-page-placeholder').click();
        //     };
        // });

        document.querySelectorAll('.page-file-input').forEach(input => {
            input.onchange = async (e) => {
                const pIdx = input.id.replace('file-page-', '');
                const file = e.target.files[0];
                if (file) {
                    const imgData = await readFileAsDataURL(file);
                    chapter.pages[pIdx].image = imgData;
                    
                    // Granular update instead of full render()
                    const thumb = document.querySelector(`.page-thumbnail[data-pidx="${pIdx}"]`);
                    if (thumb) {
                        thumb.innerHTML = `<img src="${imgData}">`;
                    }
                    
                    await store.saveProject(project);
                }
            };
        });

        // Status Icon Click (Individual Pages)
        document.querySelectorAll('.status-icon-bar .status-icon-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const pIdx = parseInt(btn.dataset.pidx);
                if (isNaN(pIdx)) return;

                const nextStatus = parseInt(btn.dataset.status);
                const prevStatus = chapter.pages[pIdx].status || 0;

                if (nextStatus !== prevStatus) {
                    chapter.pages[pIdx].status = nextStatus;
                    if (nextStatus > prevStatus) {
                        store.logActivity(nextStatus, prevStatus);
                    }
                    
                    // Granular update instead of full render()
                    const row = btn.closest('.status-icon-bar');
                    if (row) {
                        row.querySelectorAll('.status-icon-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                    
                    await store.saveProject(project);
                }
            };
        });

        // Delete Page
        document.querySelectorAll('.delete-page-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const pIdx = btn.dataset.pidx;
                if(confirm(`Supprimer la page ${parseInt(pIdx)+1} ?`)) {
                    chapter.pages.splice(pIdx, 1);
                    await store.saveProject(project);
                    render();
                }
            };
        });
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };

    render();
}
