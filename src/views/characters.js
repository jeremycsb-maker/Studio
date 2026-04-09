// Characters View for Mangaka Studio
import { renderDescriptionBlock } from '../components/description.js';

export function initCharacters(container, store) {
    const render = () => {
        const characters = store.settings.characters || [];
        container.innerHTML = `
            <div class="view-header">
                <div class="view-header-back-slot"></div>
                <div class="view-header-content">
                    <h1>Fiches Personnages</h1>
                    <p>Gérez vos designs et références de personnages pour tous vos projets.</p>
                </div>
                <div class="view-header-actions"></div>
            </div>

            <div id="characters-grid" class="grid-standard">
                ${characters.map(c => `
                    <div class="character-wrapper" style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div class="card card-13-18 card-flush character-card" data-id="${c.id}" style="position: relative; cursor: default;">
                            ${c.image ? `<img src="${c.image}" alt="${c.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); color: var(--text-muted);">
                                    <i data-lucide="user" style="width: 48px; height: 48px;"></i>
                                </div>
                            `}
                            
                            <!-- Actions Overlay -->
                            <div class="card-actions-overlay">
                                <div class="action-btn edit-char-trigger" data-id="${c.id}" title="Éditer la fiche">
                                    <i data-lucide="pencil" style="width: 16px;"></i>
                                </div>
                                <div class="action-btn delete-char-btn delete-btn-hover" data-id="${c.id}" title="Supprimer">
                                    <i data-lucide="trash-2" style="width: 16px;"></i>
                                </div>
                            </div>
                        </div>

                        <div class="card-info-header" style="flex-direction: column; align-items: flex-start; gap: 0.5rem; padding: 0.5rem;">
                            <h3 class="card-title-text">${c.name}</h3>
                            <div class="char-palette" style="display: flex; gap: 4px; margin-top: 4px;">
                                ${(c.palette || []).map((color, i) => `
                                    <div class="color-swatch" data-id="${c.id}" data-idx="${i}" title="Cliquer pour changer / Click droit pour supprimer" style="width: 16px; height: 16px; border-radius: 4px; background: ${color}; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"></div>
                                `).join('')}
                                <button class="add-color-btn" data-id="${c.id}" title="Ajouter une couleur" style="width: 16px; height: 16px; border-radius: 4px; border: 1px dashed var(--border-color); background: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px;">+</button>
                            </div>
                            <p class="card-subtitle-text" style="font-style: italic; opacity: 0.7;">${c.desc || 'Pas de description'}</p>
                        </div>
                    </div>
                `).join('')}

                <!-- Ghost Card for New Character -->
                <div class="character-wrapper">
                    <div id="new-character-ghost" class="card card-13-18 ghost-card">
                        <i data-lucide="plus-circle"></i>
                        <span>Nouveau Personnage</span>
                    </div>
                </div>
            </div>

            <!-- Modal for Character (New/Edit) -->
            <div id="char-modal" class="modal" style="display: none;">
                <div class="modal-content card" style="border-radius: 0;">
                    <h2>Nouveau Personnage</h2>
                    <div class="form-group" style="margin: 1.5rem 0;">
                        <label>Nom du personnage</label>
                        <input type="text" id="char-name-input" placeholder="Ex: Protagoniste, Rival...">
                    </div>
                    <div class="form-group" style="margin: 1.5rem 0;">
                        <label>Portrait</label>
                        <div id="char-modal-img-preview" style="width: 100px; height: 140px; background: var(--bg-tertiary); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border-color);">
                            <i data-lucide="user" style="opacity: 0.2;"></i>
                        </div>
                        <input type="file" id="char-modal-img-input" accept="image/*" style="font-size: 0.8rem;">
                    </div>
                    <div class="form-group" style="margin: 1.5rem 0;">
                        <label>Description / Rôle</label>
                        <textarea id="char-desc-input" placeholder="Personnalité, pouvoirs, histoire..." style="width: 100%; height: 80px; background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.75rem; border-radius: 8px; font-family: inherit; resize: none;"></textarea>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button id="cancel-char-modal" class="btn" style="background: var(--bg-tertiary);">Annuler</button>
                        <button id="save-char-modal" class="btn btn-primary">Enregistrer</button>
                    </div>
                </div>
            </div>

            <!-- Modal for Color Picker -->
            <div id="color-modal" class="modal" style="display: none;">
                <div class="modal-content card" style="width: 300px; background: var(--bg-secondary);">
                    <h3>Choisir une couleur</h3>
                    <input type="color" id="color-input" style="width: 100%; height: 50px; margin: 1rem 0; border: none; background: none; cursor: pointer;">
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button id="cancel-color" class="btn">Annuler</button>
                        <button id="save-color" class="btn btn-primary">OK</button>
                    </div>
                </div>
            </div>

            <style>
                .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .modal-content { width: 400px; padding: 2rem; border: 1px solid var(--border-color); background: var(--bg-secondary); }
            </style>
        `;

        if (window.lucide) window.lucide.createIcons();
        setupListeners();
    };

    const setupListeners = () => {
        const characters = store.settings.characters || [];
        let currentEditId = null;
        let tempCharImg = '';

        // New Character Ghost Card
        document.getElementById('new-character-ghost').onclick = () => {
            currentEditId = null;
            tempCharImg = '';
            document.getElementById('char-modal').style.display = 'flex';
            document.getElementById('char-modal').querySelector('h2').innerText = 'Nouveau Personnage';
            document.getElementById('char-name-input').value = '';
            document.getElementById('char-desc-input').value = '';
            document.getElementById('char-modal-img-preview').innerHTML = '<i data-lucide="user" style="opacity: 0.2;"></i>';
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('char-name-input').focus();
        };

        // Edit Icon
        document.querySelectorAll('.edit-char-trigger').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                const char = characters.find(c => c.id === btn.dataset.id);
                if (char) {
                    currentEditId = char.id;
                    tempCharImg = char.image || '';
                    document.getElementById('char-modal').style.display = 'flex';
                    document.getElementById('char-modal').querySelector('h2').innerText = 'Modifier le personnage';
                    document.getElementById('char-name-input').value = char.name;
                    document.getElementById('char-desc-input').value = char.desc || '';
                    if (tempCharImg) {
                        document.getElementById('char-modal-img-preview').innerHTML = `<img src="${tempCharImg}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    } else {
                        document.getElementById('char-modal-img-preview').innerHTML = '<i data-lucide="user" style="opacity: 0.2;"></i>';
                    }
                    if (window.lucide) window.lucide.createIcons();
                    document.getElementById('char-name-input').focus();
                }
            };
        });

        document.getElementById('char-modal-img-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tempCharImg = event.target.result;
                    document.getElementById('char-modal-img-preview').innerHTML = `<img src="${tempCharImg}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            }
        };

        document.getElementById('cancel-char-modal').onclick = () => document.getElementById('char-modal').style.display = 'none';

        document.getElementById('save-char-modal').onclick = () => {
            const name = document.getElementById('char-name-input').value.trim();
            const desc = document.getElementById('char-desc-input').value.trim();
            if (name) {
                if (currentEditId) {
                    const idx = characters.findIndex(c => c.id === currentEditId);
                    if (idx !== -1) {
                        characters[idx].name = name;
                        characters[idx].desc = desc;
                        characters[idx].image = tempCharImg;
                    }
                } else {
                    characters.push({
                        id: 'ch-' + Date.now(),
                        name,
                        desc,
                        image: tempCharImg,
                        palette: ['#ffffff', '#000000']
                    });
                }
                store.saveCharacters([...characters]);
                document.getElementById('char-modal').style.display = 'none';
                render();
            }
        };

        // Delete
        document.querySelectorAll('.delete-char-btn').forEach(btn => {
            btn.onclick = () => {
                if (confirm('Supprimer ce personnage ?')) {
                    store.saveCharacters(characters.filter(c => c.id !== btn.dataset.id));
                    render();
                }
            };
        });

        // Palette logic (keeping as is since it's already working via modals)
        let activeCharId = null;
        let activeColorIdx = -1;

        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.onclick = () => {
                activeCharId = swatch.dataset.id;
                activeColorIdx = parseInt(swatch.dataset.idx);
                const char = characters.find(c => c.id === activeCharId);
                document.getElementById('color-input').value = char.palette[activeColorIdx];
                document.getElementById('color-modal').style.display = 'flex';
            };
            swatch.oncontextmenu = (e) => {
                e.preventDefault();
                if (confirm('Supprimer cette couleur ?')) {
                    const char = characters.find(c => c.id === swatch.dataset.id);
                    char.palette.splice(parseInt(swatch.dataset.idx), 1);
                    store.saveCharacters(characters);
                    render();
                }
            };
        });

        document.getElementById('cancel-color').onclick = () => { document.getElementById('color-modal').style.display = 'none'; };
        document.getElementById('save-color').onclick = () => {
            const newColor = document.getElementById('color-input').value;
            const char = characters.find(c => c.id === activeCharId);
            if (char) {
                if (activeColorIdx === -1) char.palette.push(newColor);
                else char.palette[activeColorIdx] = newColor;
                store.saveCharacters(characters);
                document.getElementById('color-modal').style.display = 'none';
                render();
            }
        };

        document.querySelectorAll('.add-color-btn').forEach(btn => {
            btn.onclick = () => { activeCharId = btn.dataset.id; activeColorIdx = -1; document.getElementById('color-modal').style.display = 'flex'; };
        });
    };

    const unsubscribe = store.subscribe(() => {
        const grid = document.getElementById('characters-grid');
        if (grid) {
            render();
        } else {
            unsubscribe();
        }
    });

    render();
}
