// Profile View for Mangaka Studio

export function initProfile(container, store) {
    const user = store.user;

    const render = () => {
        const accentColors = [
            { name: 'Bleu Studio', hex: '#3b82f6' },
            { name: 'Violet Royal', hex: '#8b5cf6' },
            { name: 'Vert Émeraude', hex: '#10b981' },
            { name: 'Or Ambre', hex: '#f59e0b' },
            { name: 'Rose Crimson', hex: '#ec4899' },
            { name: 'Indigo Profond', hex: '#6366f1' },
            { name: 'Noir Onyx', hex: '#1e293b' }
        ];

        container.innerHTML = `
            <div class="view-header">
                <div class="view-header-content">
                    <h1>Profil de l'Artiste</h1>
                    <p>Personnalisez votre studio et vibrez avec vos couleurs préférées.</p>
                </div>
            </div>

            <div class="profile-layout" style="display: grid; grid-template-columns: 320px 1fr; gap: 3rem; margin-top: 1rem;">
                <!-- Left: Profile Card -->
                <div class="studio-card profile-card" style="text-align: center; padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center;">
                    <div class="profile-avatar" style="width: 160px; height: 160px; border-radius: 50%; background: var(--bg-tertiary); margin-bottom: 2rem; overflow: hidden; border: 4px solid var(--accent-color); box-shadow: 0 10px 25px rgba(var(--accent-color-rgb), 0.2); transition: var(--transition);">
                        ${user.avatar ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i data-lucide="user" style="width: 64px; height: 64px; margin-top: 45px; color: var(--text-muted);"></i>'}
                    </div>
                    <h2 id="profile-name" style="font-family: 'Orbitron', sans-serif; margin-bottom: 0.5rem; font-size: 1.5rem;">${user.name || 'Artiste'}</h2>
                    <p style="color: var(--accent-color); font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2.5rem;">Mangaka Rank S</p>
                    
                    <div style="text-align: left; width: 100%; margin-bottom: 2.5rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <label style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Biographie</label>
                        <p id="profile-bio" style="margin-top: 0.75rem; line-height: 1.6; font-size: 0.95rem; color: var(--text-secondary);">${user.bio || 'Votre histoire commence ici...'}</p>
                    </div>

                    <button id="edit-profile-btn" class="studio-btn studio-btn-secondary" style="width: 100%;">
                        <i data-lucide="edit-3"></i> MODIFIER LE PROFIL
                    </button>
                </div>

                <!-- Right Content -->
                <div style="display: flex; flex-direction: column; gap: 3rem;">
                    <!-- Appearance Settings -->
                    <div class="studio-card">
                        <h3 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; font-family: 'Orbitron', sans-serif; font-size: 1.1rem;">
                            <i data-lucide="palette" style="color: var(--accent-color);"></i> Paramètres d'Apparence
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem;">Choisissez votre couleur d'accentuation pour personnaliser l'ensemble du studio.</p>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
                                ${accentColors.map(c => `
                                    <div class="color-swatch ${store.settings.accentColor === c.hex ? 'active' : ''}" 
                                         data-color="${c.hex}" 
                                         title="${c.name}"
                                         style="width: 44px; height: 44px; border-radius: 12px; background: ${c.hex}; cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); position: relative;">
                                         ${store.settings.accentColor === c.hex ? '<i data-lucide="check" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; width: 20px; height: 20px;"></i>' : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Career Stats -->
                    <div>
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; font-family: 'Orbitron', sans-serif; font-size: 1.1rem;">
                            <i data-lucide="line-chart" style="color: var(--accent-color);"></i> Statistiques de Carrière
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
                            <div class="studio-card" style="padding: 1rem; border-left: 4px solid var(--status-finished); display: flex; align-items: center; gap: 1rem;">
                                <div style="background: rgba(74, 222, 128, 0.1); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="check-circle" style="color: var(--status-finished); width: 22px;"></i>
                                </div>
                                <div>
                                    <div style="font-size: 1.5rem; font-weight: 900; line-height: 1;">${store.careerStats.finished}</div>
                                    <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">TERMINÉES</div>
                                </div>
                            </div>
                            <div class="studio-card" style="padding: 1rem; border-left: 4px solid var(--status-inked); display: flex; align-items: center; gap: 1rem;">
                                <div style="background: rgba(45, 212, 191, 0.1); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="pen-tool" style="color: var(--status-inked); width: 22px;"></i>
                                </div>
                                <div>
                                    <div style="font-size: 1.5rem; font-weight: 900; line-height: 1;">${store.careerStats.inked}</div>
                                    <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">ENCRÉES</div>
                                </div>
                            </div>
                            <div class="studio-card" style="padding: 1rem; border-left: 4px solid var(--status-penciled); display: flex; align-items: center; gap: 1rem;">
                                <div style="background: rgba(34, 211, 238, 0.1); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="pencil" style="color: var(--status-penciled); width: 22px;"></i>
                                </div>
                                <div>
                                    <div style="font-size: 1.5rem; font-weight: 900; line-height: 1;">${store.careerStats.penciled}</div>
                                    <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">CRAYONS</div>
                                </div>
                            </div>
                            <div class="studio-card" style="padding: 1rem; border-left: 4px solid var(--accent-color); display: flex; align-items: center; gap: 1rem;">
                                <div style="background: rgba(var(--accent-color-rgb), 0.1); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="folder" style="color: var(--accent-color); width: 22px;"></i>
                                </div>
                                <div>
                                    <div style="font-size: 1.5rem; font-weight: 900; line-height: 1;">${store.projects.length}</div>
                                    <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">PROJETS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Modal -->
            <div id="edit-profile-modal" class="modal-overlay hidden">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2>Modifier le profil</h2>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Avatar Section -->
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Photo de profil</label>
                            <div style="display: flex; align-items: center; gap: 2rem; margin-top: 1rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                                <div id="edit-avatar-preview" style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background: var(--bg-tertiary); border: 3px solid var(--accent-color); flex-shrink: 0;">
                                    <img src="${user.avatar || ''}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <div style="flex: 1; display: flex; flex-direction: column; gap: 0.75rem;">
                                    <input type="file" id="avatar-file-input" accept="image/*" style="display: none;">
                                    <button id="upload-avatar-btn" class="studio-btn studio-btn-secondary" style="width: 100%;">
                                        <i data-lucide="upload"></i> Charger un fichier
                                    </button>
                                    <p class="text-muted" style="font-size: 0.7rem; margin: 0;">JPG, PNG ou GIF. Max 2MB.</p>
                                </div>
                            </div>
                            <div style="margin-top: 1rem;">
                                <input type="text" id="edit-avatar-url" class="studio-input" placeholder="Ou coller une URL d'image...">
                            </div>
                        </div>

                        <!-- Name Section -->
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Nom d'artiste</label>
                            <input type="text" id="edit-name" class="studio-input" value="${user.name || ''}" style="margin-top: 0.5rem;">
                        </div>

                        <!-- Bio Section -->
                        <div class="form-group">
                            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Biographie</label>
                            <textarea id="edit-bio" class="studio-input" placeholder="Parlez-nous de votre style..." style="margin-top: 0.5rem; min-height: 120px; resize: none;">${user.bio || ''}</textarea>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button id="close-edit-modal" class="studio-btn studio-btn-secondary">Annuler</button>
                        <button id="save-profile" class="studio-btn studio-btn-primary">ENREGISTRER</button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('edit-profile-btn').onclick = () => {
            document.getElementById('edit-profile-modal').classList.remove('hidden');
        };

        document.getElementById('close-edit-modal').onclick = () => {
            document.getElementById('edit-profile-modal').classList.add('hidden');
        };

        // Color Swatches
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.onclick = () => {
                const color = swatch.dataset.color;
                store.updateSettings({ accentColor: color });
                render();
            };
        });

        document.getElementById('upload-avatar-btn').addEventListener('click', () => {
            document.getElementById('avatar-file-input').click();
        });

        const compressImage = (base64, maxWidth, maxHeight) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = base64;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            });
        };

        document.getElementById('avatar-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    compressImage(base64, 400, 400).then(compressed => {
                        document.querySelector('#edit-avatar-preview img').src = compressed;
                        document.getElementById('edit-avatar-url').value = ''; 
                    });
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('save-profile').addEventListener('click', () => {
            const name = document.getElementById('edit-name').value;
            const bio = document.getElementById('edit-bio').value;
            const urlAvatar = document.getElementById('edit-avatar-url').value;
            const fileAvatar = document.querySelector('#edit-avatar-preview img').src;
            
            const avatar = urlAvatar || fileAvatar;
            
            const originalText = document.getElementById('save-profile').textContent;
            document.getElementById('save-profile').textContent = 'Enregistrement...';
            document.getElementById('save-profile').disabled = true;

            store.updateProfile({ name, bio, avatar }).then(result => {
                document.getElementById('save-profile').textContent = originalText;
                document.getElementById('save-profile').disabled = false;
                
                if (result.success) {
                    document.getElementById('edit-profile-modal').classList.add('hidden');
                    render();
                } else {
                    alert("Erreur lors de la sauvegarde : " + result.message);
                }
            });
        });
    };

    render();
}
