/**
 * Reusable Progress Bar Component for Mangaka Studio
 * Renders a segmented bar based on status breakdown.
 */

export function getStatusBreakdown(item, type) {
    const stats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, total: 0 };

    const processPages = (pages) => {
        if (!pages) return;
        pages.forEach(p => {
            stats.total++;
            const s = (p.status !== undefined) ? p.status : 0;
            // Cumulative logic: a page at status 2 counts for status 1 and 2
            for (let i = 1; i <= s; i++) {
                if (stats[i] !== undefined) stats[i]++;
            }
        });
    };

    if (type === 'chapter') {
        processPages(item.pages);
    } else if (type === 'volume') {
        item.chapters?.forEach(c => processPages(c.pages));
    } else if (type === 'project') {
        item.volumes?.forEach(v => {
            v.chapters?.forEach(c => processPages(c.pages));
        });
    }

    return stats;
}

export function renderSegmentedProgress(item, type) {
    const stats = getStatusBreakdown(item, type);
    
    const getPerc = (val) => stats.total === 0 ? 0 : Math.round((val / stats.total) * 100);
    const p1 = getPerc(stats[1]);
    const p2 = getPerc(stats[2]);
    const p3 = getPerc(stats[3]);
    const p4 = getPerc(stats[4]);

    const statuses = [
        { icon: 'layout', perc: p1, color: 'var(--status-storyboard)' },
        { icon: 'pencil', perc: p2, color: 'var(--status-penciled)' },
        { icon: 'pen-tool', perc: p3, color: 'var(--status-inked)' },
        { icon: 'check-circle', perc: p4, color: 'var(--status-finished)' }
    ];

    if (stats.total === 0) {
        return `
            <div style="font-size: 0.55rem; color: var(--text-muted); font-weight: 800; letter-spacing: 0.5px; opacity: 0.5;">
                AUCUNE PAGE DANS CE CHAPITRE
            </div>
        `;
    }

    return `
        <div class="multi-status-bars" style="display: flex; flex-direction: column; gap: 6px;">
            ${statuses.map(s => `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="${s.icon}" style="width: 10px; height: 10px; color: var(--text-muted); flex-shrink: 0;"></i>
                    <div style="flex: 1; height: 3px; background: rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden; position: relative;">
                        <div style="height: 100%; width: ${s.perc}%; background: ${s.color}; transition: width 0.3s; border-radius: 10px;"></div>
                    </div>
                    <span style="font-size: 0.55rem; font-weight: 800; color: ${s.perc > 0 ? s.color : 'var(--text-muted)'}; min-width: 26px; text-align: right;">${s.perc}%</span>
                </div>
            `).join('')}
        </div>
    `;
}
