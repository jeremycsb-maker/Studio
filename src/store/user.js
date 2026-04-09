import { supabase } from '../lib/supabase.js';
import { sanitize } from '../lib/utils.js';

export function createUserSlice(state, notify, syncService, defaultSettings) {
    const updateUserState = (newUserData) => {
        if (!newUserData) return;
        
        const cleanedData = {
            ...newUserData,
            name: sanitize(newUserData.name, state.user?.name || 'Artiste'),
            avatar: sanitize(newUserData.avatar, state.user?.avatar || ''),
            bio: sanitize(newUserData.bio, state.user?.bio || '')
        };

        state.user = { 
            ...(state.user || {}), 
            ...cleanedData 
        };
        
        state.isAuthenticated = !!state.user?.id;
        localStorage.setItem('mangaka_user', JSON.stringify(state.user));
        notify();
    };

    const setUser = async (sessionUser, providerMetadata = null) => {
        if (sessionUser) {
            const prevUser = state.user;
            const isSameUser = prevUser && prevUser.id === sessionUser.id;
            
            updateUserState({ 
                id: sessionUser.id, 
                email: sessionUser.email,
                ...(providerMetadata || {})
            });
            
            if (!isSameUser) syncService.setIsDataLoaded(false);
            await syncService.fetchUserData(providerMetadata, logout); 
        } else {
            await logout();
        }
        notify();
    };

    const updateProfile = async (profileData) => {
        if (!state.user) return { success: false, message: 'Not authenticated' };

        updateUserState(profileData);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    name: state.user.name,
                    avatar_url: state.user.avatar,
                    bio: state.user.bio
                }
            });

            if (error) throw error;
            await syncService.pushUserData();
            return { success: true };
        } catch (err) {
            console.error('Error updating profile in Supabase:', err);
            return { success: false, message: err.message };
        }
    };

    const logout = async () => {
        console.log('[Store] Logging out...');
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Supabase sign out error (ignoring):', err);
        } finally {
            state.user = null;
            state.isAuthenticated = false;
            state.projects = [];
            state.stats = { daily: {}, history: [], streaks: { current: 0, best: 0 } };
            state.settings = defaultSettings;
            syncService.setIsDataLoaded(false);
            state.lastSyncStatus = 'synced';
            state.lastSyncError = null;
            localStorage.removeItem('mangaka_user');
            localStorage.removeItem('mangaka_settings');
            localStorage.removeItem('mangaka_stats');
            notify();
            console.log('[Store] Local state cleared.');
        }
    };

    return {
        setUser,
        updateProfile,
        logout,
        updateUserState // Exported if needed by other slices
    };
}
