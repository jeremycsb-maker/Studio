/**
 * Mobile Interface Shell
 * Manages mobile-specific UI components like the bottom nav and mobile header
 */

export function initMobileShell(store) {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    console.log('[Mobile] Initiating Mobile Shell');
    
    // Any mobile-specific global UI logic goes here
    // For example, managing the "Search" bar or "Notifications" on mobile
}

export function createMobileHeader(title = 'STUDIO', showBack = false) {
    return `
        <header class="mobile-header">
            <div class="mobile-header-left">
                ${showBack ? '<button class="back-btn"><i data-lucide="chevron-left"></i></button>' : ''}
                <div class="logo">
                     <i data-lucide="pen-tool"></i>
                     <span>${title}</span>
                </div>
            </div>
            <div class="mobile-header-actions">
                <div id="mobile-sync-status" class="sync-status">
                    <i data-lucide="cloud"></i>
                </div>
            </div>
        </header>
    `;
}
