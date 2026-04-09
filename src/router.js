// Simple SPA Router for Mangaka Studio
import { initDashboard } from './views/dashboard.js';
import { initProjects } from './views/projects.js';
import { initStatistics } from './views/statistics.js';
import { initProfile } from './views/profile.js';
import { initCharacters } from './views/characters.js';
import { initBrainstorming } from './views/brainstorming.js';
import { initFitness } from './views/fitness.js';
import { initHygiene } from './views/hygiene.js';

export function initRouter(store) {
    const mainContent = document.getElementById('view-container');
    const navItems = document.querySelectorAll('.nav-item[data-view]');

    const routes = {
        'dashboard': initDashboard,
        'projects': initProjects,
        'statistics': initStatistics,
        'profile': initProfile,
        'characters': initCharacters,
        'brainstorming': initBrainstorming,
        'fitness': initFitness,
        'hygiene': initHygiene
    };

    const navigate = (viewId) => {
        // Update URL hash without reload
        window.location.hash = `#${viewId}`;
        
        // Update Sidebar highlighting
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewId);
        });

        // Clear and render new view
        mainContent.innerHTML = '';
        const initView = routes[viewId] || initDashboard;
        initView(mainContent, store);
    };

    // Listen for clicks on nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(item.dataset.view);
        });
    });

    // Handle initial load / hash change
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'dashboard';
        navigate(hash);
    });

    // Initial Route
    const initialHash = window.location.hash.slice(1) || 'dashboard';
    navigate(initialHash);
}
