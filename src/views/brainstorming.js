import { callGemini, buildSystemContext } from '../lib/gemini.js';

export function initBrainstorming(container, store) {
    let currentProjectId = null;
    let messages = [];
    let isThinking = false;
    let lastLoadedProjectId = null;

    const render = () => {
        const geminiKey = store.settings.geminiKey;
        const projects = store.projects || [];
        const currentProject = projects.find(p => p.id === currentProjectId);
        
        // Sync messages ONLY if project has changed
        if (currentProjectId && currentProjectId !== lastLoadedProjectId) {
            messages = store.settings.brainstormingHistories?.[currentProjectId] || [];
            lastLoadedProjectId = currentProjectId;
        }

        container.innerHTML = `
            <div class="view-header">
                <div class="view-header-content">
                    <h1>Assistant Brainstorming</h1>
                    <p class="text-secondary">Développez votre univers avec l'intelligence artificielle Gemini.</p>
                </div>
                <div class="view-header-actions">
                    <div class="form-group" style="margin: 0; min-width: 200px;">
                        <select id="project-selector" class="input-premium" style="padding: 0.5rem;">
                            <option value="">-- Choisir un projet --</option>
                            ${projects.map(p => `<option value="${p.id}" ${p.id === currentProjectId ? 'selected' : ''}>${p.title}</option>`).join('')}
                        </select>
                    </div>
                    <button id="open-settings-btn" class="btn-icon" title="Paramètres IA"><i data-lucide="settings"></i></button>
                    <button id="clear-chat-btn" class="btn-icon" title="Effacer la discussion"><i data-lucide="trash-2"></i></button>
                </div>
            </div>

            <div class="brainstorming-view">
                <div class="chat-container">
                    ${!geminiKey ? `
                        <div class="api-key-overlay">
                            <div class="card" style="max-width: 400px; text-align: center; display: flex; flex-direction: column; gap: 1.5rem;">
                                <i data-lucide="key" style="width: 48px; height: 48px; margin: 0 auto; color: var(--accent-color);"></i>
                                <h2>Clé API Requise</h2>
                                <p>Pour utiliser l'assistant, vous devez configurer votre clé API Gemini (Google AI Studio).</p>
                                <div class="form-group" style="text-align: left;">
                                    <label>Clé API Gemini</label>
                                    <input type="password" id="gemini-key-input" class="input-premium" placeholder="AIzaSy...">
                                </div>
                                <button id="save-key-btn" class="btn btn-primary">Enregistrer la clé</button>
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" style="font-size: 0.8rem; color: var(--accent-color);">Obtenir une clé gratuite</a>
                            </div>
                        </div>
                    ` : ''}

                    <div class="chat-messages" id="chat-messages">
                        ${!currentProjectId ? `
                            <div class="empty-chat-state">
                                <i data-lucide="message-square-dashed"></i>
                                <h2>Sélectionnez un projet</h2>
                                <p>Choisissez un projet en haut à droite pour que l'IA puisse s'imprégner de votre univers.</p>
                            </div>
                        ` : messages.length === 0 ? `
                            <div class="empty-chat-state">
                                <i data-lucide="sparkles"></i>
                                <h2>Prêt à brainstormer ?</h2>
                                <p>Posez une question sur <b>${currentProject?.title}</b> pour commencer.</p>
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 1rem;">
                                    <button class="btn-ghost quick-prompt" data-prompt="Donne-moi 3 idées de twists pour mon scénario.">💡 Twists</button>
                                    <button class="btn-ghost quick-prompt" data-prompt="Aide-moi à approfondir mes personnages.">👥 Personnages</button>
                                    <button class="btn-ghost quick-prompt" data-prompt="Quelles sont les faiblesses logiques de mon synopsis ?">⚖️ Cohérence</button>
                                </div>
                            </div>
                        ` : messages.map(msg => `
                            <div class="chat-message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}">
                                <div class="message-content">${formatMessage(msg.content)}</div>
                            </div>
                        `).join('')}
                        ${isThinking ? `
                            <div class="chat-message message-assistant">
                                <div class="thinking-indicator">
                                    <div class="dot"></div>
                                    <div class="dot"></div>
                                    <div class="dot"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="chat-input-container">
                        <div class="chat-input-wrapper">
                            <textarea id="chat-input" class="chat-input" placeholder="Décrivez votre idée ou posez une question..." ${!currentProjectId || !geminiKey ? 'disabled' : ''}></textarea>
                        </div>
                        <button id="send-btn" class="btn-send" ${!currentProjectId || !geminiKey || isThinking ? 'disabled' : ''}>
                            <i data-lucide="send"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Settings Modal -->
            <div id="ai-settings-modal" class="modal-overlay" style="display: none;">
                <div class="modal-modern modal-small">
                    <div class="modal-header">
                        <h2>Paramètres IA</h2>
                        <button class="modal-close" id="close-ai-settings"><i data-lucide="x"></i></button>
                    </div>
                    <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
                         <div class="form-group">
                            <label>Modèle Gemini</label>
                            <select id="model-selector" class="input-premium">
                                <option value="gemini-2.5-flash" ${store.settings.geminiModel === 'gemini-2.5-flash' ? 'selected' : ''}>Gemini 2.5 Flash (Recommandé)</option>
                                <option value="gemini-2.5-pro" ${store.settings.geminiModel === 'gemini-2.5-pro' ? 'selected' : ''}>Gemini 2.5 Pro (Réflexion)</option>
                                <option value="gemini-1.5-flash" ${store.settings.geminiModel === 'gemini-1.5-flash' ? 'selected' : ''}>Gemini 1.5 Flash (Legacy)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Clé API Gemini</label>
                            <input type="password" id="gemini-key-settings" class="input-premium" value="${store.settings.geminiKey || ''}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="save-settings-btn" class="btn btn-primary" style="width: 100%;">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
        setupListeners();
        scrollToBottom();
    };

    const formatMessage = (text) => {
        // Simple markdown-ish formatting
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\*(.*?)\*/g, '<i>$1</i>')
            .replace(/- (.*?)(<br>|$)/g, '• $1$2');
    };

    const setupListeners = () => {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const projectSelector = document.getElementById('project-selector');

        if (chatInput) {
            chatInput.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            };
        }

        if (sendBtn) sendBtn.onclick = sendMessage;

        if (projectSelector) {
            projectSelector.onchange = (e) => {
                currentProjectId = e.target.value;
                render();
            };
        }

        const saveKeyBtn = document.getElementById('save-key-btn');
        if (saveKeyBtn) {
            saveKeyBtn.onclick = () => {
                const key = document.getElementById('gemini-key-input').value.trim();
                if (key) {
                    store.saveGeminiKey(key);
                    render();
                }
            };
        }

        document.getElementById('open-settings-btn').onclick = () => {
            document.getElementById('ai-settings-modal').style.display = 'flex';
        };

        document.getElementById('close-ai-settings').onclick = () => {
            document.getElementById('ai-settings-modal').style.display = 'none';
        };

        document.getElementById('save-settings-btn').onclick = () => {
            const key = document.getElementById('gemini-key-settings').value.trim();
            const model = document.getElementById('model-selector').value;
            store.updateSettings({ geminiKey: key, geminiModel: model });
            document.getElementById('ai-settings-modal').style.display = 'none';
            render();
        };

        document.getElementById('clear-chat-btn').onclick = () => {
            if (currentProjectId && confirm('Effacer tout l\'historique de ce projet ?')) {
                messages = [];
                store.saveBrainstormingHistory(currentProjectId, []);
                render();
            }
        };

        document.querySelectorAll('.quick-prompt').forEach(btn => {
            btn.onclick = () => {
                chatInput.value = btn.dataset.prompt;
                sendMessage();
            };
        });
    };

    const sendMessage = async () => {
        const chatInput = document.getElementById('chat-input');
        const text = chatInput.value.trim();
        if (!text || isThinking || !currentProjectId) return;

        console.log("[Brainstorming] Saisie utilisateur:", text);

        // Add user message
        const userMsg = { role: 'user', content: text };
        messages.push(userMsg);
        
        // Save immediately to store so it persists even if AI fails or we refresh
        store.saveBrainstormingHistory(currentProjectId, messages);
        
        chatInput.value = '';
        isThinking = true;
        render();

        try {
            const projects = store.projects || [];
            const project = projects.find(p => p.id === currentProjectId);
            const characters = store.settings.characters || [];
            
            console.log("[Brainstorming] Appel Gemini avec contexte pour:", project?.title);
            const systemInstruction = buildSystemContext(project, characters);
            
            const response = await callGemini(
                store.settings.geminiKey,
                store.settings.geminiModel,
                messages,
                systemInstruction
            );

            console.log("[Brainstorming] Réponse Gemini reçue:", response.substring(0, 50) + "...");
            messages.push({ role: 'assistant', content: response });
            store.saveBrainstormingHistory(currentProjectId, messages);
        } catch (error) {
            console.error("[Brainstorming] Erreur fatale:", error);
            messages.push({ role: 'assistant', content: `❌ Erreur : ${error.message}` });
        } finally {
            isThinking = false;
            render();
        }
    };

    const scrollToBottom = () => {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    };

    render();
}
