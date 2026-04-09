// Dashboard View for Mangaka Studio
import { initPomodoro } from '../components/pomodoro.js';
import { initCalendar } from '../components/calendar.js';
import { initTaskboard } from '../components/taskboard.js';
import { initSpotify } from '../components/spotify.js';
import { initAlarms } from '../components/alarms.js';
import { calculateKPIs } from '../lib/stats-utils.js';


export function initDashboard(container, store) {
    const stats = calculateKPIs(store);
    
    container.innerHTML = `
        <div class="view-header">
            <div class="view-header-content">
                <h1>Tableau de Bord</h1>
                <p>Content de vous revoir, <span id="welcome-name" style="color: var(--accent-color); font-weight: 800; font-family: 'Orbitron', sans-serif;">${store.user.name || 'Artiste'}</span>. Votre empire créatif vous attend.</p>
            </div>
        </div>
        
        <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 2.5rem; margin-top: 1rem;">
            <!-- Production Stats & Predictions -->
            <div class="studio-card" id="stats-summary" style="display: flex; flex-direction: column; gap: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-family: 'Orbitron', sans-serif; display: flex; align-items: center; gap: 0.75rem;">
                        <i data-lucide="trending-up" style="color: var(--accent-color);"></i>
                        Progression & Flux
                    </h3>
                    <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border-color);">RÉEL (7J)</span>
                </div>

                <div class="stats-averages-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div class="avg-stat-item" style="padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid #60a5fa; transition: var(--transition);">
                        <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Storyboard</div>
                        <div style="font-size: 1.5rem; font-weight: 950; color: #60a5fa; font-family: 'JetBrains Mono', monospace;">${stats.realAvgs.storyboard} <small style="font-size: 0.8rem; font-weight: 500; opacity: 0.7;">p/j</small></div>
                    </div>
                    <div class="avg-stat-item" style="padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid #22d3ee; transition: var(--transition);">
                        <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Crayonné</div>
                        <div style="font-size: 1.5rem; font-weight: 950; color: #22d3ee; font-family: 'JetBrains Mono', monospace;">${stats.realAvgs.penciled} <small style="font-size: 0.8rem; font-weight: 500; opacity: 0.7;">p/j</small></div>
                    </div>
                    <div class="avg-stat-item" style="padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid #2dd4bf; transition: var(--transition);">
                        <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Encrage</div>
                        <div style="font-size: 1.5rem; font-weight: 950; color: #2dd4bf; font-family: 'JetBrains Mono', monospace;">${stats.realAvgs.inked} <small style="font-size: 0.8rem; font-weight: 500; opacity: 0.7;">p/j</small></div>
                    </div>
                    <div class="avg-stat-item" style="padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border-left: 4px solid #4ade80; transition: var(--transition);">
                        <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Finition</div>
                        <div style="font-size: 1.5rem; font-weight: 950; color: #4ade80; font-family: 'JetBrains Mono', monospace;">${stats.realAvgs.finished} <small style="font-size: 0.8rem; font-weight: 500; opacity: 0.7;">p/j</small></div>
                    </div>
                </div>

                <div class="forecasts-section" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; margin-top: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.25rem;">
                        <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Atterrissages Prévus</span>
                        <span style="font-size: 0.8rem; color: var(--accent-color); font-weight: 900; font-family: 'Orbitron', sans-serif;">${stats.prediction.projectTitle}</span>
                    </div>
                    <div class="forecast-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        ${stats.prediction.details.map(d => `
                            <div style="display: flex; flex-direction: column; gap: 4px; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px;">
                                <span style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800;">${d.label}</span>
                                <span style="font-size: 0.9rem; color: ${d.color}; font-weight: 900; font-family: 'JetBrains Mono', monospace;">${d.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Pomodoro Widget -->
            <div class="studio-card" id="pomodoro-container">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                    <i data-lucide="timer" style="color: var(--accent-color);"></i>
                    <h3 style="margin: 0; font-family: 'Orbitron', sans-serif;">Zen Pomodoro</h3>
                </div>
                <div id="pomodoro-root"></div>
            </div>

            <!-- Calendar Widget -->
            <div class="studio-card" id="calendar-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 style="margin: 0; font-family: 'Orbitron', sans-serif;">Évènements</h3>
                    <i data-lucide="calendar" style="color: var(--accent-color);"></i>
                </div>
                <div id="calendar-root"></div>
            </div>

            <!-- Taskboard Widget -->
            <div class="studio-card" id="taskboard-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 style="margin: 0; font-family: 'Orbitron', sans-serif;">Tâches Prioritaires</h3>
                    <i data-lucide="check-square" style="color: var(--accent-color);"></i>
                </div>
                <div id="taskboard-root"></div>
            </div>

            <!-- Spotify Widget -->
            <div id="spotify-root"></div>

            <!-- Alarms Widget -->
            <div class="studio-card" id="alarms-container">
                <div id="alarms-root"></div>
            </div>
        </div>

    `;

    // Initialize sub-components
    initPomodoro(document.getElementById('pomodoro-root'), store);
    initCalendar(document.getElementById('calendar-root'), store);
    initTaskboard(document.getElementById('taskboard-root'), store);
    initSpotify(document.getElementById('spotify-root'), store);
    initAlarms(document.getElementById('alarms-root'), store);


    // Refresh icons
    if (window.lucide) window.lucide.createIcons();
}
