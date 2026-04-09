// IndexedDB Utility for Mangaka Studio
// Version 2: Added userId indexing for project isolation
const DB_NAME = 'MangakaStudioDB';
const DB_VERSION = 2;

export async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create or upgrade 'projects' store
            let projectStore;
            if (!db.objectStoreNames.contains('projects')) {
                projectStore = db.createObjectStore('projects', { keyPath: 'id' });
            } else {
                projectStore = event.target.transaction.objectStore('projects');
            }
            
            // Add index for userId if it doesn't exist
            if (!projectStore.indexNames.contains('userId')) {
                projectStore.createIndex('userId', 'userId', { unique: false });
            }

            if (!db.objectStoreNames.contains('assets')) {
                db.createObjectStore('assets', { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Saves a project with an associated userId (email)
 */
export async function saveProject(project, userId) {
    if (!userId) {
        console.error("Tentative de sauvegarde d'un projet sans userId !");
        return;
    }
    
    // Inject userId for isolation
    project.userId = userId;
    
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const request = store.put(project);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Retrieves projects ONLY for the specified userId
 */
export async function getAllProjects(userId) {
    if (!userId) return [];
    
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const index = store.index('userId');
        const request = index.getAll(userId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteProject(id) {
    const db = await initDB();
    const transaction = db.transaction(['projects'], 'readwrite');
    transaction.objectStore('projects').delete(id);
}
