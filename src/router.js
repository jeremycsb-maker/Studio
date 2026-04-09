// Simple SPA Router for Mangaka Studio
import { initDashboard } from './views/dashboard.js';
import { initProjects } from './views/projects.js';
import { initStatistics } from './views/statistics.js';
import { initProfile } from './views/profile.js';
import { initCharacters } from './views/characters.js';
import { initBrainstorming } from './views/brainstorming.js';
import { initFitness } from './views/fitness.js';
import { initHygiene } from './views/hygiene.js';

// Mobile Views
import { initMobileDashboard } from './mobile/views/dashboard.js';
import { initMobileFitness } from './mobile/views/fitness.js';
import { initMobileProjects } from './mobile/views/projects.js';
import { initMobileHygiene } from './mobile/views/hygiene.js';
import { initMobileProfile } from './mobile/views/profile.js';

export function initRouter(store) {
    const mainContent = document.getElementById('view-container');
    const navItems = document.querySelectorAll('.nav-item[data-view], .mobile-nav-item[data-view]');

    const isMobile = window.innerWidth <= 768;

    const routes = {
        'dashboard': isMobile ? initMobileDashboard : initDashboard,
        'projects': isMobile ? initMobileProjects : initProjects,
        'statistics': initStatistics,
        'profile': isMobile ? initMobileProfile : initProfile,
        'characters': initCharacters,
        'brainstorming': initBrainstorming,
        'fitness': isMobile ? initMobileFitness : initFitness,
        'hygiene': isMobile ? initMobileHygiene : initHygiene
    };

    let currentViewId = null;
    let isTransitioning = false;

    const navigate = (viewId) => {
        if (isTransitioning || (viewId === currentViewId && window.location.hash === `#${viewId}`)) return;
        
        const isMobile = window.innerWidth <= 768;
        const oldViewId = currentViewId;
        currentViewId = viewId;

        // Update URL hash without reload
        if (window.location.hash !== `#${viewId}`) {
            window.location.hash = `#${viewId}`;
        }
        
        // Update Sidebars & Bottom Nav highlighting
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewId);
        });

        const initView = routes[viewId] || initDashboard;

        if (isMobile && oldViewId) {
            isTransitioning = true;
            
            // 1. Create new view element
            const newView = document.createElement('div');
            newView.className = 'view view-enter';
            initView(newView, store);

            // 2. Get old view
            const oldView = mainContent.querySelector('.view') || mainContent.firstElementChild;
            
            if (oldView) {
                // Wrap old content if it's not already a 'view'
                if (!oldView.classList.contains('view')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'view';
                    while (mainContent.firstChild) wrapper.appendChild(mainContent.firstChild);
                    mainContent.appendChild(wrapper);
                }
                
                const activeOldView = mainContent.querySelector('.view');
                activeOldView.classList.add('view-exit');
                mainContent.appendChild(newView);

                // Force reflow
                newView.offsetHeight;

                // 3. Start animation
                requestAnimationFrame(() => {
                    newView.classList.add('view-enter-active');
                    activeOldView.classList.add('view-exit-active');
                });

                // 4. Cleanup after transition
                setTimeout(() => {
                    if (activeOldView && activeOldView.parentNode) activeOldView.remove();
                    newView.classList.remove('view-enter', 'view-enter-active');
                    isTransitioning = false;
                    // Ensure icons are refreshed if the view didn't do it
                    if (window.lucide) window.lucide.createIcons();
                }, 400);
            } else {
                renderImmediate(initView);
            }
        } else {
            renderImmediate(initView);
        }
    };

    const renderImmediate = (initView) => {
        mainContent.innerHTML = '';
        const viewWrapper = document.createElement('div');
        viewWrapper.className = 'view';
        initView(viewWrapper, store);
        mainContent.appendChild(viewWrapper);
        isTransitioning = false;
        if (window.lucide) window.lucide.createIcons();
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
        if (hash !== currentViewId) {
            navigate(hash);
        }
    });

    // Initial Route
    const initialHash = window.location.hash.slice(1) || 'dashboard';
    navigate(initialHash);
}
