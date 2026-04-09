import { saveProject as dbSaveProject, deleteProject as dbDeleteProject } from '../db.js';

export function createProjectsSlice(state, notify, syncService) {
    const setProjects = (projects) => {
        state.projects = projects;
        syncService.pushUserData();
        notify();
    };

    const saveProject = async (project) => {
        if (!state.user?.email) return;
        
        const idx = state.projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
            state.projects[idx] = project;
        } else {
            state.projects.push(project);
        }
        
        await dbSaveProject(project, state.user.email);
        
        console.log(`[Store] Saving project ${project.id} locally. Syncing to cloud in background...`);
        syncService.pushUserData().then(() => {
            console.log(`[Store] Cloud sync completed for project ${project.id}`);
        }).catch(err => {
            console.error(`[Store] Cloud sync failed for project ${project.id}:`, err);
        });

        notify();
    };

    const deleteProject = async (id) => {
        if (!state.user?.email) return;
        
        state.projects = state.projects.filter(p => p.id !== id);
        await dbDeleteProject(id);
        await syncService.pushUserData();
        notify();
    };

    return {
        setProjects,
        saveProject,
        deleteProject
    };
}
