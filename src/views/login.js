// Login View Component with Login/Signup Toggle
export function initLogin(container, store) {
    let isLoginMode = true;

    const render = () => {
        container.innerHTML = `
            <div class="login-container">
                <div class="login-card glass">
                    <div class="login-header">
                        <div class="logo-large">
                            <i data-lucide="pen-tool"></i>
                            <span>Studio</span>
                        </div>
                        <h1>Mangaka Studio</h1>
                        <p class="text-secondary">Prêt à créer votre prochain chef-d'œuvre ?</p>
                    </div>

                    <!-- Auth Type Toggle -->
                    <div class="auth-tabs">
                        <button class="tab-btn ${isLoginMode ? 'active' : ''}" id="tab-login">Connexion</button>
                        <button class="tab-btn ${!isLoginMode ? 'active' : ''}" id="tab-signup">Créer un compte</button>
                    </div>

                    <div class="auth-options">
                        <!-- Local Auth Form -->
                        <form id="auth-form" class="auth-form">
                            ${!isLoginMode ? `
                            <div class="form-group">
                                <label for="reg-name">Nom d'Artiste</label>
                                <input type="text" id="reg-name" placeholder="Ex: Jérémy Boulle" required>
                            </div>
                            ` : ''}
                            <div class="form-group">
                                <label for="reg-email">Email</label>
                                <input type="email" id="reg-email" placeholder="artiste@exemple.com" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-pass">Mot de passe</label>
                                <input type="password" id="reg-pass" placeholder="••••••••" required>
                            </div>
                            
                            <div id="auth-error" class="error-text hidden"></div>

                            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1.5rem;">
                                ${isLoginMode ? 'Se connecter' : 'S\'inscrire'}
                            </button>
                        </form>
                    </div>

                    <div class="login-footer">
                        <p class="text-secondary small">
                            ${window.electronAPI ? 'Version Bureau • Connexion sécurisée.' : 'Vos données sont stockées localement dans votre navigateur.'}
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Re-initialize icons
        if (window.lucide) window.lucide.createIcons();

        // Toggle Listeners
        document.getElementById('tab-login').onclick = () => {
            if (!isLoginMode) {
                isLoginMode = true;
                render();
            }
        };
        document.getElementById('tab-signup').onclick = () => {
            if (isLoginMode) {
                isLoginMode = false;
                render();
            }
        };

        // Form Handling
        const form = document.getElementById('auth-form');
        const errorEl = document.getElementById('auth-error');

        form.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-pass').value;
            
            errorEl.classList.add('hidden');
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Chargement...';
            submitBtn.disabled = true;

            try {
                if (isLoginMode) {
                    const result = await window.mangakaAuth.loginLocal(email, password);
                    if (!result.success) {
                        errorEl.textContent = result.message;
                        errorEl.classList.remove('hidden');
                    }
                } else {
                    const name = document.getElementById('reg-name').value;
                    const result = await window.mangakaAuth.signupLocal(name, email, password);
                    if (!result.success) {
                        errorEl.textContent = result.message;
                        errorEl.classList.remove('hidden');
                    }
                }
            } catch (err) {
                errorEl.textContent = "Une erreur est survenue lors de la connexion.";
                errorEl.classList.remove('hidden');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        };
    };

    render();
}
