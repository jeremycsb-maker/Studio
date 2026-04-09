// Taskboard Component for Mangaka Studio

export function initTaskboard(container, store) {
    let tasks = JSON.parse(localStorage.getItem('mangaka_tasks')) || [
        { id: 1, text: 'Finaliser le storyboard ch. 1', completed: false },
        { id: 2, text: 'Importer les références du Tome 1', completed: true }
    ];

    const render = () => {
        container.innerHTML = `
            <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
                <input type="text" id="new-task-input" placeholder="Ajouter une tâche prioritaire..." class="studio-input" style="flex: 1;">
                <button id="add-task-btn" class="studio-btn studio-btn-primary" style="padding: 0 1.25rem;"><i data-lucide="plus"></i></button>
            </div>
            
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
                ${tasks.map(task => `
                    <li class="studio-card" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 12px; transition: var(--transition); ${task.completed ? 'opacity: 0.5;' : ''}">
                        <div class="task-checkbox-wrapper" style="position: relative; width: 20px; height: 20px;">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" class="task-toggle" style="width: 100%; height: 100%; cursor: pointer;">
                        </div>
                        <span style="flex: 1; font-size: 0.9rem; font-weight: 600; ${task.completed ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-primary);'}">${task.text}</span>
                        <button class="delete-task-btn studio-btn studio-btn-secondary" data-id="${task.id}" style="padding: 6px; border-radius: 6px; color: #ef4444;"><i data-lucide="trash-2" style="width: 14px;"></i></button>
                    </li>
                `).join('')}
            </ul>
        `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('add-task-btn').addEventListener('click', addTask);
        document.querySelectorAll('.task-toggle').forEach(chk => {
            chk.addEventListener('change', () => toggleTask(parseInt(chk.dataset.id)));
        });
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteTask(parseInt(btn.dataset.id)));
        });
    };

    const addTask = () => {
        const input = document.getElementById('new-task-input');
        if (input.value.trim()) {
            tasks.push({ id: Date.now(), text: input.value.trim(), completed: false });
            save();
            render();
        }
    };

    const toggleTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) task.completed = !task.completed;
        save();
        render();
    };

    const deleteTask = (id) => {
        tasks = tasks.filter(t => t.id !== id);
        save();
        render();
    };

    const save = () => localStorage.setItem('mangaka_tasks', JSON.stringify(tasks));

    render();
}
