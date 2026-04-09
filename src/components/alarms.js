// Adjustable Alarms Component for Mangaka Studio

export function initAlarms(container, store) {
    let alarms = store.settings.alarms || [];
    let isAdding = false;
    let alarmInterval = null;
    let triggeredAlarms = new Set(); // To avoid triggering multiple times the same minute

    const checkAlarms = () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = (now.getDay() + 6) % 7; // Convert 0-6 (Sun-Sat) to 0-6 (Mon-Sun)
        
        alarms.forEach(alarm => {
            const days = alarm.days || [0,1,2,3,4,5,6];
            if (alarm.active && alarm.time === currentTime && days.includes(currentDay) && !triggeredAlarms.has(alarm.id)) {
                triggerAlarm(alarm);
                triggeredAlarms.add(alarm.id);
                
                // Clear from Set after 61 seconds so it can trigger tomorrow
                setTimeout(() => triggeredAlarms.delete(alarm.id), 61000);
            }
        });
    };

    const triggerAlarm = (alarm) => {
        // Core Notification
        if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
            new Notification(`⏰ Alarme : ${alarm.label || 'Sans titre'}`, {
                body: `Il est ${alarm.time}.`,
            });
        }

        
        // Spotify Interaction
        if (alarm.autoMute) {
            store.setAlarmActive(true);
        }

        // Play Sound
        playAlarmSound(alarm.soundId || 'chime');

        // Screen Alert
        const alertEl = document.createElement('div');
        alertEl.id = `triggered-alarm-${alarm.id}`;
        alertEl.innerHTML = `
            <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000; background: #3b82f6; color: white; padding: 1.25rem 2.5rem; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 1.5rem; animation: slideDownAlarm 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28); border: 2px solid rgba(255,255,255,0.2);">
                <div style="background: rgba(255,255,255,0.2); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="bell" style="width: 28px; height: 28px; animation: ringAlarm 0.5s infinite;"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 1.2rem; letter-spacing: 0.05rem;">${alarm.label || 'ALARME'}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9; font-weight: 500;">Il est précisément ${alarm.time}</div>
                </div>
                <button id="close-alarm-alert-${alarm.id}" style="background: white; border: none; color: #3b82f6; padding: 0.6rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 0.9rem; transition: all 0.2s;">
                    J'ARRIVE !
                </button>
            </div>
            <style>
                @keyframes slideDownAlarm { from { top: -150px; opacity: 0; } to { top: 20px; opacity: 1; } }
                @keyframes ringAlarm { 
                    0%, 100% { transform: rotate(0); } 
                    15% { transform: rotate(20deg); } 
                    45% { transform: rotate(-20deg); } 
                    75% { transform: rotate(10deg); } 
                }
                #close-alarm-alert-${alarm.id}:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(255,255,255,0.3); }
            </style>
        `;
        document.body.appendChild(alertEl);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById(`close-alarm-alert-${alarm.id}`).addEventListener('click', () => {
            alertEl.remove();
            if (alarm.autoMute) store.setAlarmActive(false);
        });
        
        // Auto-remove after 60 seconds if not clicked
        setTimeout(() => { if (alertEl.parentNode) alertEl.remove(); }, 60000);
    };

    const playAlarmSound = (soundId = 'chime') => {
        try {
            let context = store.audioContext;
            
            // If context doesn't exist or is suspended, try to initialize/resume it
            if (!context) {
                store.unlockAudio();
                context = store.audioContext;
            }
            
            if (context.state === 'suspended') {
                context.resume();
            }

            const vol = store.settings.alarmVolume !== undefined ? store.settings.alarmVolume : 0.7;
            
            const playTone = (freq, startTime, duration, type = 'triangle', gainFactor = 0.2) => {
                const osc = context.createOscillator();
                const gain = context.createGain();
                osc.connect(gain);
                gain.connect(context.destination);
                osc.type = type;
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(vol * gainFactor, startTime + 0.05);
                gain.gain.linearRampToValueAtTime(0, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = context.currentTime;

            switch(soundId) {
                case 'digital':
                    for(let i=0; i<6; i++) {
                        playTone(987.77, now + i * 0.2, 0.1, 'square', 0.1); // B5 snappy
                    }
                    break;
                case 'bell':
                    playTone(523.25, now, 1.5, 'sine', 0.4); // C5 long decay
                    playTone(659.25, now + 0.1, 1.4, 'sine', 0.2); // E5
                    break;
                case 'pulse':
                    for(let i=0; i<8; i++) {
                        playTone(440, now + i * 0.25, 0.15, 'sawtooth', 0.1);
                    }
                    break;
                case 'chime':
                default:
                    for(let i=0; i<4; i++) {
                        playTone(880, now + i * 0.5, 0.2, 'triangle', 0.2);
                        playTone(660, now + i * 0.5 + 0.25, 0.2, 'triangle', 0.2);
                    }
                    break;
            }
        } catch (e) {
            console.error("Audio trigger failed:", e);
        }
    };

    const requestPermission = () => {
        if (typeof Notification !== 'undefined' && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };


    const render = () => {
        const currentAlarms = store.settings.alarms || [];
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%;">
                <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                    <button id="prev-month" class="studio-btn studio-btn-secondary" style="padding: 6px; border-radius: 6px;"><i data-lucide="chevron-left" style="width: 16px;"></i></button>
                    <span style="font-weight: 800; font-family: 'Orbitron', sans-serif; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-color);">ALARMES</span>
                    <button id="next-month" class="studio-btn studio-btn-secondary" style="padding: 6px; border-radius: 6px;"><i data-lucide="chevron-right" style="width: 16px;"></i></button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i data-lucide="alarm-clock" style="color: var(--accent-color); width: 24px;"></i>
                        <h3 style="margin: 0; font-size: 1.1rem; font-family: 'Orbitron', sans-serif; font-weight: 950; letter-spacing: 1px;">PROGRAMMATION</h3>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-secondary); padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border-color);">
                            <i data-lucide="volume-2" style="width: 14px; color: var(--text-muted);"></i>
                            <input type="range" id="p-alarm-volume" min="0" max="1" step="0.05" value="${store.settings.alarmVolume || 0.7}" 
                                style="width: 60px; accent-color: var(--accent-color); cursor: pointer;">
                        </div>
                        <button id="p-add-alarm-btn" class="studio-btn studio-btn-primary" style="padding: 10px; border-radius: 50%;" title="Nouvelle alarme">
                            <i data-lucide="plus" style="width: 18px;"></i>
                        </button>
                    </div>
                </div>

                ${isAdding ? `
                    <div style="background: var(--bg-secondary); border: 1px solid var(--accent-color); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; animation: p-fadeIn 0.3s ease-out; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 1.25rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05rem;">Nouvelle alarme studio</div>
                        
                        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                            <div style="display: flex; gap: 1rem;">
                                <div style="flex: 1;">
                                    <label style="display: block; font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 800;">Heure</label>
                                    <input type="time" id="p-new-time" required class="studio-input" style="font-family: 'JetBrains Mono', monospace; font-weight: 950; font-size: 1.2rem;">
                                </div>
                                <div style="flex: 2;">
                                    <label style="display: block; font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 800;">Libellé</label>
                                    <input type="text" id="p-new-label" placeholder="Session de dessin..." class="studio-input" style="font-size: 0.95rem;">
                                </div>
                            </div>

                            <div>
                                <label style="display: block; font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase; font-weight: 700;">Planification hebdomadaire</label>
                                <div style="display: flex; gap: 0.5rem;">
                                    ${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => `
                                        <button class="p-day-btn active" data-day="${i}" style="flex: 1; aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">${d}</button>
                                    `).join('')}
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.25rem;">
                                <div>
                                    <label style="display: block; font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 800;">Mélodie</label>
                                    <select id="p-new-sound" class="studio-input" style="font-size: 0.85rem;">
                                        ${(store.settings.alarmSounds || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 700;">Catégorie</label>
                                    <div style="display: flex; gap: 0.4rem; padding-top: 0.25rem;">
                                        ${['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7'].map((c, i) => `
                                            <div class="p-color-opt ${i===0?'selected':''}" data-color="${c}" style="width: 24px; height: 24px; border-radius: 50%; background: ${c}; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;"></div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-tertiary); padding: 0.75rem 1rem; border-radius: 12px; margin-top: 0.5rem;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <i data-lucide="music" style="width: 16px; color: var(--accent-color);"></i>
                                    <span style="font-size: 0.85rem; font-weight: 600;">Auto-Mute Spotify</span>
                                </div>
                                <div id="p-automute-toggle" class="p-mini-toggle active" style="width: 36px; height: 18px; border-radius: 20px; background: var(--bg-primary); border: 1px solid var(--border-color); cursor: pointer; position: relative;">
                                    <div style="width: 14px; height: 14px; background: var(--text-muted); border-radius: 50%; position: absolute; top: 1px; left: 19px; transition: all 0.2s;"></div>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                                <button id="p-test-sound-btn" class="studio-btn studio-btn-secondary" style="flex: 1; font-size: 0.75rem;">TESTER</button>
                                <button id="p-cancel-btn" class="studio-btn studio-btn-secondary" style="flex: 0.8; font-size: 0.75rem;">Annuler</button>
                                <button id="p-save-btn" class="studio-btn studio-btn-primary" style="flex: 1.5; font-size: 0.85rem; font-weight: 950;">ENREGISTRER</button>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div id="p-alarms-container" style="display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; max-height: 400px; padding-right: 0.5rem;">
                    ${currentAlarms.length === 0 && !isAdding ? `
                        <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem; background: var(--bg-secondary); border-radius: 16px; border: 1px dotted var(--border-color);">
                            <i data-lucide="bell-off" style="width: 32px; height: 32px; opacity: 0.2; margin-bottom: 1rem; display: block; margin-left: auto; margin-right: auto;"></i>
                            <div style="font-size: 0.85rem; font-weight: 500;">Aucune alarme pour le moment.</div>
                        </div>
                    ` : currentAlarms.map(a => `
                        <div class="p-alarm-card" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-left: 6px solid ${a.color || 'var(--accent-color)'}; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28); position: relative;">
                            <div style="display: flex; align-items: center; gap: 1.25rem;">
                                <div style="font-size: 1.8rem; font-weight: 900; color: ${a.active ? 'var(--text-primary)' : 'var(--text-muted)'}; font-family: 'Orbitron', sans-serif; letter-spacing: -2px;">${a.time}</div>
                                <div>
                                    <div style="font-weight: 700; font-size: 0.95rem; color: ${a.active ? 'var(--text-primary)' : 'var(--text-muted)'};">${a.label || 'Alarme'}</div>
                                    <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 0.4rem; text-transform: uppercase;">
                                        <span style="${(a.days || []).length === 7 ? 'color: var(--accent-color);' : ''}">${(a.days || []).length === 7 ? 'Tous les jours' : (a.days || []).map(d => ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][d]).join(', ')}</span>
                                        ${a.autoMute ? `<i data-lucide="music" style="width: 10px; color: var(--accent-color);"></i>` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div class="p-toggle-btn" data-id="${a.id}" style="width: 44px; height: 22px; border-radius: 30px; background: ${a.active ? 'var(--status-finished)' : 'var(--bg-tertiary)'}; border: 1px solid var(--border-color); cursor: pointer; position: relative; transition: all 0.3s ease;">
                                    <div style="width: 14px; height: 14px; background: white; border-radius: 50%; position: absolute; top: 3px; left: ${a.active ? '25px' : '4px'}; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                                </div>
                                <button class="p-delete-btn studio-btn studio-btn-secondary" data-id="${a.id}" style="padding: 6px; border-radius: 6px; color: #ef4444;">
                                    <i data-lucide="trash-2" style="width: 16px;"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <style>
                .p-alarm-card:hover { transform: translateY(-3px) scale(1.01); border-color: var(--accent-color); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
                .p-delete-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                #p-add-alarm-btn:hover { transform: rotate(90deg); filter: brightness(1.1); }
                #p-alarm-volume::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: white; border: 2px solid var(--accent-color); box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.2s; }
                #p-alarm-volume::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 0 10px rgba(59, 130, 246, 0.4); }
                #p-alarms-container::-webkit-scrollbar { width: 5px; }
                #p-alarms-container::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                .calendar-day:hover { background: var(--bg-tertiary); color: var(--accent-color); }
                .calendar-day.today { background: var(--accent-color); color: white; font-weight: 900; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
                .p-day-btn.active { background: var(--accent-color); color: white; border-color: var(--accent-color); box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2); }
                .p-color-opt.selected { transform: scale(1.3); border-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.2); }
                .p-mini-toggle.active { background: var(--accent-color); border-color: var(--accent-color); }
                .p-mini-toggle.active div { left: 19px !important; background: white !important; }
                @keyframes p-fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            </style>
        `;

        // Logic
        document.getElementById('p-global-test-btn').onclick = () => playAlarmSound();
        const volInput = document.getElementById('p-alarm-volume');
        volInput.oninput = (e) => {
            const vol = parseFloat(e.target.value);
            const percent = vol * 100;
            e.target.style.background = `linear-gradient(to right, var(--accent-color) ${percent}%, var(--border-color) ${percent}%)`;
            store.updateSettings({ alarmVolume: vol });
        };
        document.getElementById('p-add-alarm-btn').onclick = () => { isAdding = true; render(); };
        
        if (isAdding) {
            document.getElementById('p-test-sound-btn').onclick = () => {
                const soundId = document.getElementById('p-new-sound').value;
                playAlarmSound(soundId);
            };

            document.querySelectorAll('.p-day-btn').forEach(btn => {
                btn.onclick = () => btn.classList.toggle('active');
            });

            document.querySelectorAll('.p-color-opt').forEach(opt => {
                opt.onclick = () => {
                    document.querySelectorAll('.p-color-opt').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                };
            });

            const muteToggle = document.getElementById('p-automute-toggle');
            muteToggle.onclick = () => muteToggle.classList.toggle('active');

            document.getElementById('p-cancel-btn').onclick = () => { isAdding = false; render(); };
            document.getElementById('p-save-btn').onclick = () => {
                const time = document.getElementById('p-new-time').value;
                const label = document.getElementById('p-new-label').value;
                const days = Array.from(document.querySelectorAll('.p-day-btn.active')).map(b => parseInt(b.dataset.day));
                const color = document.querySelector('.p-color-opt.selected').dataset.color;
                const soundId = document.getElementById('p-new-sound').value;
                const autoMute = muteToggle.classList.contains('active');

                if (time) {
                    const newAlarms = [...currentAlarms, { 
                        id: 'al-' + Date.now(), 
                        time, 
                        label, 
                        active: true,
                        days,
                        color,
                        soundId,
                        autoMute
                    }];
                    store.updateSettings({ alarms: newAlarms });
                    alarms = newAlarms;
                    isAdding = false;
                    render();
                }
            };
        }

        document.querySelectorAll('.p-toggle-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const newAlarms = currentAlarms.map(a => a.id === id ? { ...a, active: !a.active } : a);
                store.updateSettings({ alarms: newAlarms });
                alarms = newAlarms;
                render();
            };
        });

        document.querySelectorAll('.p-delete-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const newAlarms = currentAlarms.filter(a => a.id !== id);
                store.updateSettings({ alarms: newAlarms });
                alarms = newAlarms;
                render();
            };
        });

        if (window.lucide) window.lucide.createIcons();
    };

    requestPermission();
    render();

    alarmInterval = setInterval(checkAlarms, 30000);

    return () => {
        clearInterval(alarmInterval);
    };
}
