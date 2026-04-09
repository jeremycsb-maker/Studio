// Calendar Component for Mangaka Studio

export function initCalendar(container, store) {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const render = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

        container.innerHTML = `
            <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <button id="prev-month" style="background: none; border: none; cursor: pointer;"><i data-lucide="chevron-left"></i></button>
                <span style="font-weight: 600;">${monthNames[currentMonth]} ${currentYear}</span>
                <button id="next-month" style="background: none; border: none; cursor: pointer;"><i data-lucide="chevron-right"></i></button>
            </div>
            
            <div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center;">
                ${['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => `<div style="font-weight: 700; font-size: 0.75rem; color: var(--text-muted);">${d}</div>`).join('')}
                ${Array(firstDay).fill('').map(() => `<div></div>`).join('')}
                ${Array(daysInMonth).fill(0).map((_, i) => {
                    const isToday = today.getDate() === i + 1 && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                    return `
                        <div class="calendar-day ${isToday ? 'today' : ''}" style="padding: 0.5rem; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;">
                            ${i + 1}
                        </div>
                    `;
                }).join('')}
            </div>

            <style>
                .calendar-day:hover { background: var(--bg-tertiary); }
                .calendar-day.today { background: var(--accent-color); color: white; }
            </style>
        `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('prev-month').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            render();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            render();
        });
    };

    render();
}
