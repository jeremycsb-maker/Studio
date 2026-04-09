// Pomodoro Timer Component for Mangaka Studio

export function initPomodoro(container, store) {
    let presets = store.settings.pomodoro.presets || [];
    let currentPreset = presets[0] || { name: 'Standard', work: 25, break: 5 };
    
    // Core timing State
    let isBreak = false;
    let isRunning = false;
    let isConfiguring = false;
    
    let totalDurationMs = currentPreset.work * 60 * 1000;
    let elapsedMs = 0;
    let sessionStartTime = null;
    let animationId = null;

    const render = () => {
        if (isConfiguring) {
            renderConfig();
        } else {
            renderTimer();
        }
        if (window.lucide) window.lucide.createIcons();
    };

    const updateUI = () => {
        const timerText = document.getElementById('pomo-timer-text');
        const progressBar = document.getElementById('pomo-progress-bar');
        const headerActivity = document.getElementById('pomo-header-activity');
        const headerTitle = document.getElementById('pomo-header-title');
        const toggleBtn = document.getElementById('pomo-timer-toggle');
        const pill = document.getElementById('pomo-pill');

        if (!timerText || !progressBar) return;

        const remainingMs = Math.max(0, totalDurationMs - elapsedMs);
        const totalSeconds = Math.ceil(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const progress = totalDurationMs > 0 ? (elapsedMs / totalDurationMs) * 100 : 0;
        progressBar.style.width = `${Math.min(100, progress)}%`;

        const primaryColor = isBreak ? 'var(--status-finished)' : 'var(--accent-color)';
        const shadowColor = isBreak ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)';
        
        timerText.style.color = primaryColor;
        timerText.style.textShadow = `0 0 20px ${shadowColor}`;
        progressBar.style.background = isBreak ? 'var(--status-finished)' : 'linear-gradient(90deg, var(--accent-color), #a855f7)';
        
        if (pill) pill.style.borderColor = primaryColor;
        if (headerActivity) {
            headerActivity.textContent = isBreak ? '☕ PAUSE' : '🎯 TRAVAIL';
            headerActivity.style.color = primaryColor;
        }
        if (headerTitle) headerTitle.textContent = currentPreset.name;
        if (toggleBtn) {
            toggleBtn.textContent = isRunning ? 'PAUSE' : 'DÉMARRER';
            toggleBtn.style.boxShadow = `0 4px 15px ${shadowColor}`;
        }
    };

    const tick = () => {
        if (!isRunning) return;

        elapsedMs = Date.now() - sessionStartTime;

        if (elapsedMs >= totalDurationMs) {
            // Auto switch
            isBreak = !isBreak;
            
            // Spotify Mute on Break
            if (isBreak) {
                store.setAlarmActive(true);
                showHealthReminder();
            } else {
                store.setAlarmActive(false);
            }

            totalDurationMs = (isBreak ? currentPreset.break : currentPreset.work) * 60 * 1000;
            sessionStartTime = Date.now();
            elapsedMs = 0;
            notifyUser(isBreak ? "Travail terminé !" : "Pause terminée !", isBreak ? "Repos !" : "Dessin !");
            playSessionSound(isBreak);
        }

        updateUI();
        animationId = requestAnimationFrame(tick);
    };

    const renderTimer = () => {
        const currentPresets = store.settings.pomodoro.presets || [];
        
        container.innerHTML = `
            <div style="text-align: center; position: relative;">
                <div style="margin-bottom: 2rem; display: flex; justify-content: center; align-items: center; gap: 0.75rem;">
                    <div id="pomo-pill" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1.25rem; border-radius: 20px; background: var(--bg-secondary); border: 1px solid var(--accent-color); transition: border-color 0.3s ease;">
                        <span id="pomo-header-activity" style="font-size: 0.7rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.15rem; transition: color 0.3s ease;">🎯 TRAVAIL</span>
                        <div style="width: 1px; height: 12px; background: var(--border-color);"></div>
                        <span id="pomo-header-title" style="font-size: 0.7rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.1rem;">${currentPreset.name}</span>
                    </div>
                </div>

                <div id="pomo-timer-text" style="font-size: 5.5rem; font-weight: 950; font-family: 'Orbitron', monospace; margin-bottom: 0.5rem; line-height: 1; letter-spacing: -2px; transition: all 0.3s ease;">00:00</div>

                <div style="width: 100%; height: 8px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 20px; margin: 1.5rem auto 2.5rem auto; overflow: hidden; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                    <div id="pomo-progress-bar" style="width: 0%; height: 100%; transition: none; border-radius: 20px;"></div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center; align-items: center; margin-bottom: 3rem;">
                    <button id="pomo-timer-reset" class="studio-btn studio-btn-secondary" style="padding: 0.8rem; border-radius: 50%;" title="Réinitialiser">
                        <i data-lucide="rotate-ccw" style="width: 20px;"></i>
                    </button>
                    <button id="pomo-timer-toggle" class="studio-btn studio-btn-primary" style="min-width: 160px; padding: 1rem; font-weight: 950; letter-spacing: 1px;">
                        DÉMARRER
                    </button>
                    <button id="pomo-timer-settings-btn" class="studio-btn studio-btn-secondary" style="padding: 0.8rem; border-radius: 50%;" title="Configuration">
                        <i data-lucide="settings" style="width: 20px;"></i>
                    </button>
                </div>

                <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                    ${currentPresets.map((p, i) => `
                        <button class="timer-preset studio-btn studio-btn-secondary" data-index="${i}" style="font-size: 0.7rem; padding: 6px 12px; font-weight: 800; border-radius: 8px;">
                            ${p.name.toUpperCase()} <span style="opacity: 0.4; margin-left: 6px; font-family: 'JetBrains Mono', monospace;">${p.work}:${p.break}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <style>
                .timer-preset:hover {
                    border-color: var(--accent-color) !important;
                    color: var(--accent-color) !important;
                }
            </style>
        `;

        document.getElementById('pomo-timer-toggle').addEventListener('click', toggleTimer);
        document.getElementById('pomo-timer-reset').addEventListener('click', resetTimer);
        document.getElementById('pomo-timer-settings-btn').addEventListener('click', () => {
            isConfiguring = true;
            render();
        });
        
        document.querySelectorAll('.timer-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                currentPreset = currentPresets[index];
                isBreak = false;
                totalDurationMs = currentPreset.work * 60 * 1000;
                elapsedMs = 0;
                if (isRunning) {
                   sessionStartTime = Date.now();
                }
                updateUI();
            });
        });

        updateUI();
    };

    const toggleTimer = () => {
        if (isRunning) {
            isRunning = false;
            cancelAnimationFrame(animationId);
        } else {
            isRunning = true;
            sessionStartTime = Date.now() - elapsedMs;
            animationId = requestAnimationFrame(tick);
        }
        updateUI();
    };

    const resetTimer = () => {
        isRunning = false;
        cancelAnimationFrame(animationId);
        isBreak = false;
        totalDurationMs = currentPreset.work * 60 * 1000;
        elapsedMs = 0;
        updateUI();
    };

    const playSessionSound = (isBreak, overrideSoundId) => {
        const soundId = overrideSoundId || store.settings.pomodoro.soundId || 'chime';
        if (soundId === 'silent') return;

        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            switch (soundId) {
                case 'digital':
                    oscillator.type = 'square';
                    if (isBreak) {
                        oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
                        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
                    } else {
                        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                        oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1);
                    }
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
                    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.2);
                    break;

                case 'bell':
                    oscillator.type = 'sine';
                    // Harmonic bell sound using multiple frequencies (simulated with one for simplicity but with long decay)
                    const freq = isBreak ? 523.25 : 659.25; // C5 or E5
                    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 1.5);
                    break;

                case 'chime':
                default:
                    oscillator.type = 'sine';
                    if (isBreak) {
                        // Calm ascending
                        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);
                    } else {
                        // Bright descending
                        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
                    }
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.4);
                    break;
            }
        } catch (e) {
            console.error("Could not play sound:", e);
        }
    };

    const notifyUser = (title, body) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        } else {
            console.log(`Alert: ${title} - ${body}`);
        }
    };

    const showHealthReminder = () => {
        const reminders = [
            { title: "REPOS VISUEL", body: "Regardez un point au loin (règle 20-20-20) pour soulager vos yeux.", icon: "eye" },
            { title: "ÉTIREMENT", body: "Faites quelques rotations des poignets et étirez vos doigts.", icon: "hand" },
            { title: "POSTURE", body: "Redressez votre dos et relâchez vos épaules.", icon: "accessibility" },
            { title: "HYDRATATION", body: "Prenez une gorgée d'eau !", icon: "droplet" }
        ];
        const reminder = reminders[Math.floor(Math.random() * reminders.length)];

        const alertEl = document.createElement('div');
        alertEl.innerHTML = `
            <div style="position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 10000; background: var(--bg-primary); color: var(--text-primary); padding: 1.5rem 2rem; border-radius: 20px; box-shadow: 0 25px 60px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 1.5rem; animation: slideDownPomo 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28); border: 2px solid var(--status-finished); max-width: 450px; width: 90vw;">
                <div style="background: rgba(34, 197, 94, 0.15); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="${reminder.icon}" style="width: 32px; height: 32px; color: var(--status-finished);"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 0.85rem; letter-spacing: 0.15rem; color: var(--status-finished); margin-bottom: 0.25rem;">RAPPEL SANTÉ</div>
                    <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.35rem;">${reminder.title}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${reminder.body}</div>
                </div>
                <button id="close-health-reminder" class="btn-primary-small" style="background: var(--status-finished); border: none; white-space: nowrap; padding: 0.8rem 1.2rem;">OK !</button>
            </div>
            <style>
                @keyframes slideDownPomo { from { top: -200px; opacity: 0; } to { top: 30px; opacity: 1; } }
            </style>
        `;
        document.body.appendChild(alertEl);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('close-health-reminder').onclick = () => alertEl.remove();
        setTimeout(() => { if (alertEl.parentNode) alertEl.remove(); }, 15000);
    };

    // Re-use existing renderConfig logic but update internal variables
    const renderConfig = () => {
        const presetsList = store.settings.pomodoro.presets || [];
        container.innerHTML = `
            <div style="padding: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h4 style="display: flex; align-items: center; gap: 0.75rem; margin: 0; font-size: 1rem; font-family: 'Orbitron', sans-serif;">
                        <i data-lucide="sliders" style="width: 20px; color: var(--accent-color);"></i> PRESETS
                    </h4>
                    <button id="add-preset" class="studio-btn studio-btn-primary" style="padding: 0.5rem 1rem; font-size: 0.75rem;">
                        + AJOUTER
                    </button>
                </div>
                
                <div id="presets-list-container" style="display: flex; flex-direction: column; gap: 1rem; max-height: 240px; overflow-y: auto; margin-bottom: 2rem; padding-right: 0.5rem;">
                    ${presetsList.map((p, index) => `
                        <div class="preset-item studio-card" style="padding: 1rem; background: var(--bg-secondary); border-radius: 12px;">
                            <div style="display: grid; grid-template-columns: 1fr 40px; gap: 1rem; margin-bottom: 1rem;">
                                <input type="text" class="preset-name studio-input" value="${p.name}" placeholder="Nom du preset" style="font-size: 0.8rem;">
                                <button class="delete-preset studio-btn studio-btn-secondary" data-index="${index}" style="padding: 8px; color: #ef4444;">
                                    <i data-lucide="trash-2" style="width: 14px;"></i>
                                </button>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div style="position: relative;">
                                    <label style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 800; text-transform: uppercase;">Travail (min)</label>
                                    <input type="number" class="preset-work studio-input" value="${p.work}" min="1" style="font-size: 0.85rem; font-family: 'JetBrains Mono', monospace;">
                                </div>
                                <div style="position: relative;">
                                    <label style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 800; text-transform: uppercase;">Break (min)</label>
                                    <input type="number" class="preset-break studio-input" value="${p.break}" min="1" style="font-size: 0.85rem; font-family: 'JetBrains Mono', monospace;">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-bottom: 2rem; padding: 1.25rem; background: var(--bg-tertiary); border-radius: 12px; border: 1px solid var(--border-color);">
                    <label style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); display: block; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">🔔 NOTIFICATION SONORE</label>
                    <div style="display: flex; gap: 0.75rem;">
                        <select id="pomo-sound-select" class="studio-input" style="flex: 1; font-size: 0.8rem; padding: 0.6rem;">
                            <option value="chime" ${store.settings.pomodoro.soundId === 'chime' ? 'selected' : ''}>Chime (Doux)</option>
                            <option value="digital" ${store.settings.pomodoro.soundId === 'digital' ? 'selected' : ''}>Digital (Bip)</option>
                            <option value="bell" ${store.settings.pomodoro.soundId === 'bell' ? 'selected' : ''}>Bell (Résonance)</option>
                            <option value="silent" ${store.settings.pomodoro.soundId === 'silent' ? 'selected' : ''}>Silencieux</option>
                        </select>
                        <button id="pomo-test-sound" class="studio-btn studio-btn-secondary" style="font-size: 0.7rem; font-weight: 800; padding: 0 1rem;">
                            TESTER
                        </button>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                    <button id="cfg-cancel" class="studio-btn studio-btn-secondary">Annuler</button>
                    <button id="cfg-save" class="studio-btn studio-btn-primary">SAUVEGARDER</button>
                </div>
            </div>
            
            <style>
                #presets-list-container::-webkit-scrollbar { width: 4px; }
                #presets-list-container::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
            </style>
        `;

        document.getElementById('add-preset').addEventListener('click', () => {
            const newList = [...presetsList, { id: Date.now().toString(), name: 'Nouveau', work: 25, break: 5 }];
            store.updateSettings({ pomodoro: { ...store.settings.pomodoro, presets: newList } });
            renderConfig();
        });

        document.querySelectorAll('.delete-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const newList = presetsList.filter((_, i) => i !== index);
                store.updateSettings({ pomodoro: { ...store.settings.pomodoro, presets: newList } });
                renderConfig();
            });
        });

        document.getElementById('cfg-cancel').addEventListener('click', () => {
            isConfiguring = false;
            render();
        });

        document.getElementById('pomo-test-sound').addEventListener('click', () => {
            const soundId = document.getElementById('pomo-sound-select').value;
            playSessionSound(true, soundId);
        });

        document.getElementById('cfg-save').addEventListener('click', () => {
            const updatedPresets = [];
            document.querySelectorAll('.preset-item').forEach((item) => {
                const name = item.querySelector('.preset-name').value;
                const work = parseInt(item.querySelector('.preset-work').value);
                const breakVal = parseInt(item.querySelector('.preset-break').value);
                if (name && work && breakVal) {
                    updatedPresets.push({ id: Date.now().toString() + Math.random(), name, work, break: breakVal });
                }
            });

            const soundId = document.getElementById('pomo-sound-select').value;

            store.updateSettings({
                pomodoro: { ...store.settings.pomodoro, presets: updatedPresets, soundId }
            });

            isConfiguring = false;
            if (updatedPresets.length > 0) {
                currentPreset = updatedPresets[0];
                if (!isRunning) {
                   isBreak = false;
                   totalDurationMs = currentPreset.work * 60 * 1000;
                   elapsedMs = 0;
                }
            }
            render();
        });
    };

    render();
}
