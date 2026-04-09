// Main Entry Point for Mangaka Studio
import { createStore } from './src/store.js';
import { initRouter } from './src/router.js';
import { initAuth, updateUserUI } from './src/auth.js';
import { initLogin } from './src/views/login.js';

// Initialize Lucide icons
if (window.lucide) {
    window.lucide.createIcons();
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
}

function updateAccentColor(color) {
    if (!color) return;
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(color));
}

const store = createStore();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Mangaka Studio Initializing...');
    
    const loginScreen = document.getElementById('login-screen');
    const appLayout = document.getElementById('app-layout');

    // Authentication Logic
    const startApp = () => {
        // Unlock audio on first user interaction
        const unlock = () => {
            store.unlockAudio();
            document.removeEventListener('click', unlock);
        };
        document.addEventListener('click', unlock);

        // Mobile Detection
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            document.body.classList.add('is-mobile');
        }

        loginScreen.classList.add('hidden');
        appLayout.classList.remove('hidden');
        
        // Initialize Auth (Google/Local Setup)
        initAuth(store);
        
        // Final UI Updates
        updateUserUI(store.user);
        
        // Initialize Core App Router (Handled differently for mobile soon)
        initRouter(store);

        // Zen Mode Logic
        const zenToggle = document.getElementById('zen-mode-toggle');
        const exitZen = document.getElementById('exit-zen-btn');
        const body = document.body;

        const updateZenUI = (active) => {
            body.classList.toggle('focus-mode-active', active);
            if (zenToggle) zenToggle.classList.toggle('active', active);
            if (window.lucide) window.lucide.createIcons();
        };

        if (zenToggle) {
            zenToggle.onclick = () => {
                const newState = !store.focusMode;
                store.setFocusMode(newState);
            };
        }

        if (exitZen) {
            exitZen.onclick = () => {
                store.setFocusMode(false);
            };
        }

        // Sync UI Update Logic
        const syncStatus = document.getElementById('sync-status');
        const syncText = document.getElementById('sync-text');

        const updateSyncUI = (status, error) => {
            const syncEls = document.querySelectorAll('.sync-status');
            const syncText = document.getElementById('sync-text');

            syncEls.forEach(el => el.classList.remove('pending', 'error'));
            
            if (status === 'pending') {
                syncEls.forEach(el => {
                    el.classList.add('pending');
                    el.title = 'Mise à jour des données avec le cloud...';
                });
                if (syncText) syncText.textContent = 'Synchronisation...';
            } else if (status === 'error') {
                syncEls.forEach(el => {
                    el.classList.add('error');
                    el.title = error || 'Une erreur est survenue lors de la synchronisation.';
                });
                if (syncText) syncText.textContent = 'Erreur Sync';
            } else {
                if (syncText) syncText.textContent = 'Cloud à jour';
                syncEls.forEach(el => {
                    el.title = 'Toutes vos données sont synchronisées.';
                });
            }
        };

        const syncEls = document.querySelectorAll('.sync-status');
        syncEls.forEach(el => {
            el.onclick = () => {
                console.log('[UI] Manual sync requested.');
                store.forceSync();
            };
        });

        // Subscribe to store changes (focus mode, sync status, and accent color)
        store.subscribe((state) => {
            updateZenUI(state.focusMode);
            updateSyncUI(state.lastSyncStatus, state.lastSyncError);
            updateAccentColor(state.settings.accentColor);
        });

        // Initial UI states
        updateZenUI(store.focusMode);
        updateSyncUI(store.lastSyncStatus, store.lastSyncError);
        updateAccentColor(store.settings.accentColor);
    };

    const showLogin = () => {
        loginScreen.classList.remove('hidden');
        appLayout.classList.add('hidden');
        
        // 1. Initialize Auth first to define global window.initGoogleAuth handler
        initAuth(store);

        // 2. Initialize Login View (which creates the container and calls the handler)
        initLogin(loginScreen, store);
        
        // Wait for auth success event (fired from auth.js)
        window.addEventListener('auth-success', () => {
            startApp();
        }, { once: true });
    };

    // Global App Start Logic
    if (store.isAuthenticated) {
        startApp();
    } else {
        showLogin();
    }
});
