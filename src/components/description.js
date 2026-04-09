/**
 * Renders a professional expandable description block with an explicit edit mode.
 * @param {string} description - current description text
 * @param {string} placeholder - text when description is empty
 * @param {Function} onSave - callback(newDescription)
 * @returns {string} HTML string
 */
export function renderDescriptionBlock(description, placeholder = "Cliquez sur l'icône éditer pour ajouter une description...", onSave) {
    const id = 'desc-' + Math.random().toString(36).substr(2, 9);
    let currentDesc = description;
    
    // Defer logic until injected into DOM
    setTimeout(() => {
        const block = document.getElementById(id);
        if (!block) return;
        
        const content = block.querySelector('.description-content');
        const toggle = block.querySelector('.description-toggle');
        const editBtn = block.querySelector('.description-edit-btn');
        const actions = block.querySelector('.description-actions');
        const saveBtn = block.querySelector('.save-desc-btn');
        const cancelBtn = block.querySelector('.cancel-desc-btn');

        const checkOverflow = () => {
            if (content.scrollHeight > content.clientHeight + 5) {
                block.classList.add('has-overflow');
            } else {
                block.classList.remove('has-overflow');
            }
        };

        checkOverflow();
        
        toggle.onclick = () => {
            block.classList.toggle('expanded');
            toggle.innerText = block.classList.contains('expanded') ? 'Voir moins' : 'Voir plus';
        };

        editBtn.onclick = (e) => {
            e.stopPropagation();
            enterEditMode();
        };

        const enterEditMode = () => {
            block.classList.add('is-editing');
            content.contentEditable = "true";
            content.focus();
            
            // If placeholder is active, clear it for actual editing
            if (!currentDesc) {
                content.innerHTML = "";
            }
        };

        const exitEditMode = (save = true) => {
            block.classList.remove('is-editing');
            content.contentEditable = "false";
            
            if (save) {
                const newDesc = content.innerText.trim();
                if (newDesc !== currentDesc) {
                    currentDesc = newDesc;
                    onSave(newDesc);
                }
            } else {
                // Revert
                renderContent();
            }
            checkOverflow();
        };

        const renderContent = () => {
            content.innerHTML = currentDesc ? currentDesc : `<span class="description-placeholder">${placeholder}</span>`;
        };

        saveBtn.onclick = () => exitEditMode(true);
        cancelBtn.onclick = () => exitEditMode(false);

        content.onkeydown = (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                exitEditMode(true);
            }
            if (e.key === 'Escape') {
                exitEditMode(false);
            }
        };
    }, 0);

    return `
        <div id="${id}" class="description-block">
            <div class="description-header-tools">
                <button class="description-edit-btn studio-btn studio-btn-secondary" style="padding: 6px; border-radius: 6px;" title="Modifier la description">
                    <i data-lucide="pencil" style="width: 14px;"></i>
                </button>
            </div>
            
            <div class="description-content" contenteditable="false">
                ${description ? description : `<span class="description-placeholder">${placeholder}</span>`}
            </div>

            <div class="description-footer-row">
                <button class="description-toggle studio-btn studio-btn-secondary" style="font-size: 0.7rem; padding: 4px 8px; font-weight: 800; text-transform: uppercase;">Voir plus</button>
                <div class="description-actions">
                    <button class="studio-btn studio-btn-secondary cancel-desc-btn" style="padding: 6px 12px; font-size: 0.75rem;">Annuler</button>
                    <button class="studio-btn studio-btn-primary save-desc-btn" style="padding: 6px 12px; font-size: 0.75rem; font-weight: 800;">ENREGISTRER</button>
                </div>
            </div>
        </div>
    `;
}
