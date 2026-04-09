/**
 * Gemini AI Service for Mangaka Studio
 * Using Gemini 3.1 Flash / Pro
 */

export async function callGemini(apiKey, model, messages, systemInstruction = "") {
    if (!apiKey) {
        throw new Error("Clé API Gemini manquante. Veuillez la configurer dans l'onglet Brainstorming.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Format messages for Gemini API
    const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const body = {
        contents: contents,
        systemInstruction: systemInstruction ? {
            parts: [{ text: systemInstruction }]
        } : undefined,
        generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        }
    };

    try {
        console.log(`[Gemini API] Requête vers ${model}...`);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[Gemini API] Erreur HTTP:", response.status, data);
            
            // Handle specific status codes
            if (response.status === 401 || response.status === 403) {
                throw new Error("Clé API invalide ou non autorisée. Vérifiez votre clé dans les paramètres.");
            }
            if (response.status === 429) {
                throw new Error("Limite de requêtes atteinte (Quotas). Réessayez dans une minute.");
            }
            if (response.status === 404) {
                throw new Error(`Modèle '${model}' introuvable. Essayez un autre modèle dans les paramètres.`);
            }

            throw new Error(data.error?.message || `Erreur API (${response.status})`);
        }

        if (!data.candidates || data.candidates.length === 0) {
            console.error("[Gemini API] Aucune réponse générée (Safety filter?)", data);
            throw new Error("L'IA n'a pas pu générer de réponse (possible filtre de sécurité).");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("[Gemini Service] Erreur:", error);
        throw error;
    }
}

/**
 * Builds the system instruction based on the project context
 */
export function buildSystemContext(project, characters) {
    let context = `Tu es l'Assistant Brainstorming de Mangaka Studio. Ton but est d'aider l'auteur à développer son univers, ses personnages et son intrigue.
    
TRAVAILLE SUR LE PROJET : "${project.title}"
SYNOPSIS : ${project.description || "Pas de synopsis défini."}
`;

    if (characters && characters.length > 0) {
        context += `\nPERSONNAGES CLÉS :\n`;
        characters.forEach(char => {
            context += `- ${char.name} : ${char.role || 'Rôle inconnu'}. Description : ${char.description || 'N/A'}\n`;
        });
    }

    context += `\nINSTRUCTIONS :
- Sois créatif, encourageant et pertinent par rapport à l'univers du manga.
- Si l'auteur demande des idées de scènes, propose des variantes visuelles (découpage, ambiance).
- Rappelle-toi des détails fournis dans le synopsis pour rester cohérent.
- Réponds en français de manière professionnelle mais passionnée par le manga.`;

    return context;
}
