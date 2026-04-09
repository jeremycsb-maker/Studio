import html2canvas from 'html2canvas';
import { getStatusBreakdown } from './progress_bar.js';

export function openTeaserModal(target, type, projectTitle) {
    // 0. Injecter les polices Google
    if (!document.getElementById('teaser-fonts')) {
        const link = document.createElement('link');
        link.id = 'teaser-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&family=Playfair+Display:wght@700&family=Montserrat:wght@400;900&family=Outfit:wght@400;900&family=Inter:wght@400;800&display=swap';
        document.head.appendChild(link);
    }

    const stats = getStatusBreakdown(target, type);
    const getPerc = (val) => stats.total === 0 ? 0 : Math.round((val / stats.total) * 100);
    
    const p1 = getPerc(stats[1]);
    const p2 = getPerc(stats[2]);
    const p3 = getPerc(stats[3]);
    const p4 = getPerc(stats[4]);

    const title = type === 'volume' ? (target.title || 'Tome sans titre') : (target.title || 'Chapitre sans titre');
    const subtitle = type === 'volume' ? (target.subtitle || '') : (projectTitle || '');
    const coverUrl = target.cover || target.image || '';

    const modalId = 'teaser-generator-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.style.zIndex = '9999';

    // State object for real-time updates
    const state = {
        title,
        subtitle,
        theme: 'default',
        blur: 20,
        opacity: 40,
        rotateY: -5,
        rotateX: 5,
        font: "'Outfit', sans-serif",
        sticker: 'NOUVEAU',
        showSticker: false
    };

    overlay.innerHTML = `
        <div class="modal-modern" style="max-width: 1000px; width: 95%; height: 90vh; display: flex; flex-direction: row; gap: 0; overflow: hidden; background: var(--bg-primary); border: 1px solid var(--border-color);">
            <!-- Left: Settings -->
            <div class="teaser-controls-panel">
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; font-size: 1.25rem;">Générateur de Teaser</h2>
                    <p class="text-secondary" style="font-size: 0.8rem; margin-top: 0.25rem;">Effets sobres, modernes et élégants.</p>
                </div>

                <div class="control-section">
                    <label>TEXTES</label>
                    <input type="text" id="t-input-title" value="${title}" placeholder="Titre principal" class="input-premium">
                    <input type="text" id="t-input-subtitle" value="${subtitle}" placeholder="Sous-titre" class="input-premium" style="margin-top: 0.5rem;">
                </div>

                <div class="control-section">
                    <label>THÈME PREMIUM</label>
                    <div class="theme-grid">
                        <button class="theme-btn active" data-theme="default">Glow</button>
                        <button class="theme-btn" data-theme="charcoal">Charcoal</button>
                        <button class="theme-btn" data-theme="glass">Glass</button>
                        <button class="theme-btn" data-theme="arctic">Arctic</button>
                        <button class="theme-btn" data-theme="midnight">Midnight</button>
                        <button class="theme-btn" data-theme="neon">Néon</button>
                    </div>
                </div>

                <div class="control-section">
                    <label>TYPOGRAPHIE</label>
                    <select id="t-input-font" class="input-premium">
                        <option value="'Outfit', sans-serif">Modern (Outfit)</option>
                        <option value="'Bebas Neue', cursive">Cinematique (Bebas)</option>
                        <option value="'Permanent Marker', cursive">Handwritten</option>
                        <option value="'Playfair Display', serif">Elegant (Serif)</option>
                        <option value="'Inter', sans-serif">Swiss (Inter)</option>
                    </select>
                </div>

                <div class="control-section">
                    <label>FOND ET EFFETS</label>
                    <div class="range-group">
                        <span>Flou</span>
                        <input type="range" id="t-range-blur" min="0" max="60" value="20">
                    </div>
                    <div class="range-group">
                        <span>Opacité</span>
                        <input type="range" id="t-range-opacity" min="0" max="100" value="40">
                    </div>
                </div>

                <div class="control-section">
                    <label>ROTATION 3D</label>
                    <div class="range-group">
                        <span>Horiz.</span>
                        <input type="range" id="t-range-ry" min="-45" max="45" value="-5">
                    </div>
                    <div class="range-group">
                        <span>Vert.</span>
                        <input type="range" id="t-range-rx" min="-30" max="30" value="5">
                    </div>
                </div>

                <div class="control-section">
                    <label>STICKER BADGE</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="t-input-sticker" value="NOUVEAU" class="input-premium" style="flex: 1;">
                        <button id="t-btn-sticker" class="btn-icon" title="Afficher/Masquer"><i data-lucide="eye-off"></i></button>
                    </div>
                </div>

                <div style="margin-top: auto; display: flex; flex-direction: column; gap: 0.75rem;">
                    <button id="download-teaser-btn" class="btn btn-primary" style="width: 100%; padding: 0.75rem; justify-content: center; font-weight: 800;">
                        <i data-lucide="download" style="margin-right: 0.5rem;"></i> TÉLÉCHARGER PNG
                    </button>
                    <button id="close-teaser-modal" class="btn-ghost" style="width: 100%; padding: 0.5rem; justify-content: center;">ANNULER</button>
                </div>
            </div>

            <!-- Right: Preview -->
            <div id="teaser-preview-container" class="teaser-preview-area">
                <div id="teaser-export-root" class="teaser-canvas-story theme-default">
                    <div class="teaser-background">
                        <div class="bg-image-layer" style="background-image: url('${coverUrl}');"></div>
                        <div class="bg-overlay-layer"></div>
                        <div class="bg-pattern-layer"></div>
                    </div>

                    <div class="teaser-content">
                        <div class="teaser-header">
                            <h1 id="p-title">${title}</h1>
                            <h3 id="p-subtitle">${subtitle}</h3>
                        </div>

                        <div class="teaser-cover-frame">
                            <div class="cover-container-3d">
                                <div class="cover-wrapper">
                                    <div class="cover-face">
                                        ${coverUrl ? `<img src="${coverUrl}" id="p-cover">` : `<div class="cover-placeholder"><i data-lucide="book"></i></div>`}
                                        <div id="p-sticker" class="sticker-badge" style="display: none;">NOUVEAU</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="teaser-stats">
                            <div class="teaser-stat-item">
                                <div class="stat-label">STORYBOARD</div>
                                <div class="stat-bar-container"><div class="stat-bar bar-1" style="width: ${p1}%"></div></div>
                                <div class="stat-value">${p1}%</div>
                            </div>
                            <div class="teaser-stat-item">
                                <div class="stat-label">CRAYONNÉ</div>
                                <div class="stat-bar-container"><div class="stat-bar bar-2" style="width: ${p2}%"></div></div>
                                <div class="stat-value">${p2}%</div>
                            </div>
                            <div class="teaser-stat-item">
                                <div class="stat-label">ENCRAGE</div>
                                <div class="stat-bar-container"><div class="stat-bar bar-3" style="width: ${p3}%"></div></div>
                                <div class="stat-value">${p3}%</div>
                            </div>
                            <div class="teaser-stat-item">
                                <div class="stat-label">FINALISÉ</div>
                                <div class="stat-bar-container"><div class="stat-bar bar-4" style="width: ${p4}%"></div></div>
                                <div class="stat-value">${p4}%</div>
                            </div>
                        </div>

                        <div class="teaser-branding">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .teaser-controls-panel {
                flex: 1; padding: 1.5rem; display: flex; flex-direction: column; 
                border-right: 1px solid var(--border-color); overflow-y: auto; background: var(--bg-secondary);
            }
            .control-section { margin-bottom: 1.25rem; }
            .control-section label { display: block; font-size: 0.65rem; font-weight: 900; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 0.4rem; }
            .theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
            .theme-btn { padding: 0.5rem; font-size: 0.65rem; font-weight: 700; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; color: var(--text-primary); transition: all 0.2s; }
            .theme-btn.active { border-color: var(--accent-color); background: var(--accent-light); color: white; }
            .range-group { display: flex; align-items: center; gap: 10px; margin-bottom: 0.4rem; }
            .range-group span { font-size: 0.65rem; width: 40px; color: var(--text-secondary); }
            .range-group input { flex: 1; cursor: pointer; }

            .teaser-preview-area {
                flex: 1.3; background: #080808; display: flex; align-items: center; justify-content: center; padding: 1.5rem;
            }

            .teaser-canvas-story {
                width: 360px; height: 640px; background: #111; position: relative; overflow: hidden;
                box-shadow: 0 40px 80px rgba(0,0,0,0.8); color: white; font-family: 'Outfit', sans-serif; transition: all 0.5s;
            }

            .teaser-background { position: absolute; inset: 0; z-index: 1; }
            .bg-image-layer { position: absolute; inset: -30px; background-size: cover; background-position: center; transition: all 0.3s; }
            .bg-overlay-layer { position: absolute; inset: 0; background: rgba(0,0,0,0.5); transition: background 0.5s; }
            .bg-pattern-layer { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; transition: opacity 0.5s; }

            .teaser-content { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; padding: 2.2rem 1.8rem; justify-content: space-between; }
            .teaser-header { display: flex; flex-direction: column; align-items: center; text-align: center; }
            .teaser-header h1 { font-size: 2.2rem; font-weight: 900; text-transform: uppercase; line-height: 1; margin: 0; letter-spacing: -1px; }
            .teaser-header h3 { font-size: 0.7rem; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; margin-top: 0.6rem; color: rgba(255,255,255,0.7); }

            .teaser-cover-frame { flex: 1; display: flex; align-items: center; justify-content: center; perspective: 1200px; padding: 1rem 0; }
            .cover-container-3d { width: 72%; aspect-ratio: 13/18; transform-style: preserve-3d; }
            .cover-wrapper { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.2s ease-out; }
            
            .cover-face { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; }
            .cover-face img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; border: 2px solid rgba(255,255,255,1); box-shadow: 10px 10px 30px rgba(0,0,0,0.6); }
            
            .sticker-badge { position: absolute; top: -10px; right: -15px; background: #ff3e3e; color: white; padding: 6px 12px; font-weight: 900; font-size: 0.8rem; transform: rotate(15deg) translateZ(20px); box-shadow: 0 5px 15px rgba(255,62,62,0.5); border-radius: 0; border: 2px solid white; z-index: 50; }

            .teaser-stats { background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); border-radius: 0; padding: 1.4rem; display: flex; flex-direction: column; gap: 0.7rem; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
            .teaser-stat-item { display: grid; grid-template-columns: 85px 1fr 35px; align-items: center; gap: 12px; }
            .stat-label { font-size: 0.55rem; font-weight: 900; color: rgba(255,255,255,0.5); letter-spacing: 0.5px; }
            .stat-bar-container { height: 9px; background: rgba(255,255,255,0.1); border-radius: 0; overflow: hidden; }
            .stat-bar { height: 100%; border-radius: 0; position: relative; }
            .stat-value { font-size: 0.7rem; font-weight: 900; text-align: right; color: rgba(255,255,255,0.9); }

            /* Official Status Colors (Consistent with Project View) */
            .bar-1 { background: #60a5fa; } /* Storyboard - Blue */
            .bar-2 { background: #22d3ee; } /* Penciled - Cyan */
            .bar-3 { background: #2dd4bf; } /* Inked - Teal */
            .bar-4 { background: #4ade80; } /* Finished - Green */

            /* THEMES SÉLECTIONNÉS */
            
            /* 1. CHARCOAL (Sombre Élégant) */
            .theme-charcoal .bg-overlay-layer { background: rgba(20,20,20,0.9); }
            .theme-charcoal .teaser-background { background: #1a1a1a; }
            .theme-charcoal h1 { font-family: 'Playfair Display', serif; letter-spacing: 0; text-transform: none; font-size: 2.5rem; }
            .theme-charcoal .teaser-stats { background: rgba(35,35,35,0.8); border: 1px solid rgba(255,255,255,0.05); }

            /* 2. GLASS (Glassmorphism) */
            .theme-glass .bg-overlay-layer { background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); }
            .theme-glass .bg-pattern-layer { opacity: 0.3; }
            .theme-glass .teaser-stats { background: rgba(255,255,255,0.15); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
            .theme-glass h1 { text-shadow: 0 10px 20px rgba(0,0,0,0.2); }

            /* 3. ARCTIC (Minimalist Light) */
            .theme-arctic { color: #111 !important; }
            .theme-arctic .bg-overlay-layer { background: rgba(248,249,250,0.92); }
            .theme-arctic .bg-pattern-layer { background-image: radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px); }
            .theme-arctic h1 { color: #000; }
            .theme-arctic h3 { color: #666; }
            .theme-arctic .teaser-stats { background: #fff; border: 1px solid #eee; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .theme-arctic .stat-label { color: #888; }
            .theme-arctic .stat-value { color: #222; }
            .theme-arctic .stat-bar-container { background: #eee; }

            /* 4. MIDNIGHT (High Contrast Dark) */
            .theme-midnight .bg-overlay-layer { background: #050505; }
            .theme-midnight .bg-pattern-layer { opacity: 0.1; }
            .theme-midnight .teaser-stats { background: #000; border: 1px solid #222; }
            .theme-midnight h1 { background: linear-gradient(to right, #fff, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

            /* 5. NÉON (Modern Rainbow) */
            .theme-neon .bg-overlay-layer { background: rgba(5,0,15,0.85); }
            .theme-neon h1 { background: linear-gradient(90deg, #ff00ff, #00ffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 12px rgba(0,255,255,0.4)); }
            .theme-neon .stat-bar { box-shadow: 0 0 12px currentColor; }
            .theme-neon .bar-1 { background: #60a5fa; box-shadow: 0 0 10px #60a5fa; }
            .theme-neon .bar-2 { background: #22d3ee; box-shadow: 0 0 10px #22d3ee; }
            .theme-neon .bar-3 { background: #2dd4bf; box-shadow: 0 0 10px #2dd4bf; }
            .theme-neon .bar-4 { background: #4ade80; box-shadow: 0 0 10px #4ade80; }
            
            /* GLOW (Défaut Refined) */
            .theme-default .bg-overlay-layer { background: linear-gradient(135deg, rgba(99, 102, 241, 0.5) 0%, rgba(168, 85, 247, 0.5) 100%); }

            .logo-small { text-align: center; font-size: 0.8rem; font-weight: 900; letter-spacing: 3px; color: white; }
            .logo-small span { color: var(--accent-color); }
        </style>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) window.lucide.createIcons();

    const updatePreview = () => {
        const root = document.getElementById('teaser-export-root');
        const pTitle = document.getElementById('p-title');
        const pSubtitle = document.getElementById('p-subtitle');
        const bgImg = document.querySelector('.bg-image-layer');
        const wrapper = document.querySelector('.cover-wrapper');
        const sticker = document.getElementById('p-sticker');

        // Font
        root.style.fontFamily = state.font;
        
        // Text
        pTitle.innerText = state.title;
        pSubtitle.innerText = state.subtitle;
        
        // Background
        bgImg.style.filter = `blur(${state.blur}px)`;
        bgImg.style.opacity = state.opacity / 100;
        
        // Rotation
        wrapper.style.transform = `rotateY(${state.rotateY}deg) rotateX(${state.rotateX}deg)`;
        
        // Theme
        root.className = `teaser-canvas-story theme-${state.theme}`;
        
        // Sticker
        sticker.innerText = state.sticker;
        sticker.style.display = state.showSticker ? 'block' : 'none';

        // Official Progress Colors
        if (state.theme !== 'neon') {
            document.querySelector('.bar-1').style.background = '#60a5fa';
            document.querySelector('.bar-2').style.background = '#22d3ee';
            document.querySelector('.bar-3').style.background = '#2dd4bf';
            document.querySelector('.bar-4').style.background = '#4ade80';
        }
    };

    // Listeners
    document.getElementById('t-input-title').oninput = (e) => { state.title = e.target.value; updatePreview(); };
    document.getElementById('t-input-subtitle').oninput = (e) => { state.subtitle = e.target.value; updatePreview(); };
    document.getElementById('t-input-font').onchange = (e) => { state.font = e.target.value; updatePreview(); };
    document.getElementById('t-range-blur').oninput = (e) => { state.blur = e.target.value; updatePreview(); };
    document.getElementById('t-range-opacity').oninput = (e) => { state.opacity = e.target.value; updatePreview(); };
    document.getElementById('t-range-ry').oninput = (e) => { state.rotateY = e.target.value; updatePreview(); };
    document.getElementById('t-range-rx').oninput = (e) => { state.rotateX = e.target.value; updatePreview(); };
    document.getElementById('t-input-sticker').oninput = (e) => { state.sticker = e.target.value; updatePreview(); };
    
    document.getElementById('t-btn-sticker').onclick = () => {
        state.showSticker = !state.showSticker;
        const btn = document.getElementById('t-btn-sticker');
        btn.innerHTML = `<i data-lucide="${state.showSticker ? 'eye' : 'eye-off'}"></i>`;
        if (window.lucide) window.lucide.createIcons();
        updatePreview();
    };

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.theme = btn.dataset.theme;
            updatePreview();
        };
    });

    document.getElementById('close-teaser-modal').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    document.getElementById('download-teaser-btn').onclick = async () => {
        const btn = document.getElementById('download-teaser-btn');
        btn.disabled = true;
        btn.innerText = 'GÉNÉRATION...';

        const exportRoot = document.getElementById('teaser-export-root');
        
        try {
            const canvas = await html2canvas(exportRoot, {
                scale: 3, 
                backgroundColor: null,
                useCORS: true,
                logging: false,
                width: 360,
                height: 640
            });

            const link = document.createElement('a');
            link.download = `Teaser_${state.title.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to generate teaser image:', err);
            alert("Erreur lors de la génération de l'image.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="download" style="margin-right: 0.5rem;"></i> TÉLÉCHARGER PNG';
            if (window.lucide) window.lucide.createIcons();
        }
    };

    // Initial render
    updatePreview();
}
