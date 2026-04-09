import { supabase } from '../lib/supabase.js';
import { saveProject as dbSaveProject } from '../db.js';
import { sanitize, deepMerge } from '../lib/utils.js';

export function createSyncService(state, notify) {
    let isDataLoaded = false;

    const fetchUserData = async (initialMetadata = null, logoutCallback) => {
        if (!state.user?.id) {
            isDataLoaded = true; 
            return;
        }
        
        state.isSyncing = true;
        state.lastSyncStatus = 'pending';
        notify();

        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('*')
                .eq('id', state.user.id)
                .single();

            if (error) {
                console.error('[Sync] Supabase fetch error details:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                
                if (error.code === 'PGRST116') {
                    console.log('[Sync] No existing cloud data found for this user.');
                    state.lastSyncStatus = 'synced';
                    state.lastSyncError = null;

                    if (initialMetadata) {
                        isDataLoaded = true; 
                        await pushUserData();
                    }
                } else {
                    state.lastSyncStatus = 'error';
                    state.lastSyncError = error.message;
                    
                    if (error.message.includes('JWT') || error.code === '401' || error.message.includes('Unauthorized')) {
                        console.warn('[Sync] Auth error detected. Forcing logout...');
                        if (logoutCallback) logoutCallback();
                    }
                }
            } else if (data) {
                state.stats = data.stats || state.stats || { daily: {}, history: [] };
                state.settings = deepMerge(state.settings, data.settings || {});
                state.projects = data.projects || state.projects || [];
                
                localStorage.setItem('mangaka_settings', JSON.stringify(state.settings));
                localStorage.setItem('mangaka_stats', JSON.stringify(state.stats));
                
                if (data.profile) {
                    // This will be handled by userStore update profile signal or similar
                    state.user = {
                        ...state.user,
                        name: sanitize(data.profile.name, state.user.name || 'Artiste'),
                        avatar: sanitize(data.profile.avatar, state.user.avatar || ''),
                        bio: sanitize(data.profile.bio, state.user.bio || '')
                    };
                }
                
                state.lastSyncStatus = 'synced';
                state.lastSyncError = null;
            }

            if (initialMetadata) {
                state.user = {
                    ...state.user,
                    name: sanitize(state.user.name || initialMetadata.name, 'Artiste'),
                    avatar: sanitize(state.user.avatar || initialMetadata.avatar, ''),
                    bio: sanitize(state.user.bio || initialMetadata.bio, '')
                };
            }

            localStorage.setItem('mangaka_user', JSON.stringify(state.user));
            
            if (state.projects) {
                for (const p of state.projects) {
                    await dbSaveProject(p, state.user.email);
                }
            }
        } catch (err) {
            console.error('[Sync] Unexpected fetch error:', err);
            state.lastSyncStatus = 'error';
            state.lastSyncError = "Erreur inattendue lors de la synchronisation.";
        } finally {
            state.isSyncing = false;
            isDataLoaded = true; 
            notify();
        }
    };

    const pushUserData = async () => {
        if (!state.user?.id || !isDataLoaded) return; 

        try {
            const { error } = await supabase
                .from('user_data')
                .upsert({
                    id: state.user.id,
                    projects: state.projects,
                    stats: state.stats,
                    settings: state.settings,
                    profile: {
                        name: state.user.name,
                        avatar: state.user.avatar,
                        bio: state.user.bio
                    },
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('[Sync] Supabase push error details:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                state.lastSyncStatus = 'error';
                state.lastSyncError = error.message;
            } else {
                state.lastSyncStatus = 'synced';
                state.lastSyncError = null;
            }
        } catch (err) {
            console.error('[Sync] Unexpected push error:', err);
            state.lastSyncStatus = 'error';
            state.lastSyncError = "Erreur lors de l'envoi des données.";
        }
        notify();
    };

    return {
        fetchUserData,
        pushUserData,
        getIsDataLoaded: () => isDataLoaded,
        setIsDataLoaded: (val) => { isDataLoaded = val; }
    };
}
