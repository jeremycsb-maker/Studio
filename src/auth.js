import { supabase } from './lib/supabase.js';
import { getHygieneAura } from './lib/xp-utils.js';

export function initAuth(store) {
    // Session listener to handle login/logout across all components
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            const user = session.user;
            const metadata = {
                name: user.user_metadata?.name,
                avatar: user.user_metadata?.avatar_url || user.user_metadata?.avatar,
                bio: user.user_metadata?.bio
            };
            store.setUser({ id: user.id, email: user.email }, metadata);
            window.dispatchEvent(new CustomEvent('auth-success'));
        }
    });

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) return { success: false, message: error.message };
        return { success: true };
    };

    const signup = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                    avatar_url: `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`
                }
            }
        });
        if (error) return { success: false, message: error.message };
        return { success: true };
    };

    const logout = async () => {
        // Quick visual feedback: hide the app
        const layout = document.getElementById('app-layout');
        if (layout) layout.style.opacity = '0.5';
        
        try {
            await store.logout();
        } catch (err) {
            console.error('Logout error:', err);
        }
        
        // Use a short delay before reload to ensure state propagation
        setTimeout(() => {
            window.location.hash = ''; // Reset navigation
            window.location.reload();
        }, 100);
    };

    // Expose login methods for the Login View
    window.mangakaAuth = {
        signupLocal: signup,
        loginLocal: login,
        logout: logout
    };

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }

    if (store.isAuthenticated) {
        updateUserUI(store.user, store.settings?.hygiene?.streak);
    }

    // Subscribe to store changes to update UI in real-time
    store.subscribe((state) => {
        updateUserUI(state.user, state.settings?.hygiene?.streak);
    });
}

export function updateUserUI(user, hygieneStreak = 0) {
    if (!user) return;
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const welcomeName = document.getElementById('welcome-name');
    
    // Safety check against the literal string "undefined"
    const displayName = (user.name === 'undefined' || !user.name) ? 'Artiste' : user.name;
    
    if (userName && userName.textContent !== displayName) {
        userName.textContent = displayName;
    }
    
    if (userAvatar) {
        const currentImg = userAvatar.querySelector('img');
        if (!currentImg || currentImg.src !== (user.avatar || '')) {
            userAvatar.innerHTML = `<img src="${user.avatar || ''}" alt="${displayName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0;">`;
        }
        
        // Apply Aura
        const aura = getHygieneAura(hygieneStreak);
        userAvatar.className = 'avatar'; // Reset
        if (aura.id !== 'none') {
            userAvatar.classList.add(`aura-${aura.id}`);
        }
    }
    
    if (welcomeName && welcomeName.textContent !== displayName) {
        welcomeName.textContent = displayName;
    }
}
