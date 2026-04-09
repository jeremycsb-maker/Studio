import { callGemini } from './gemini.js';
import { calculateLevel, determineClass } from './xp-utils.js';

export async function analyzeFitnessData(store) {
    const fitnessData = store.settings.fitness || {};
    const musculationSessions = fitnessData.musculationSessions || [];
    const cardioSessions = fitnessData.cardioSessions || [];
    const measurements = fitnessData.measurements || [];
    
    if (musculationSessions.length === 0 && cardioSessions.length === 0) {
        return "Je manque encore de données pour vous donner un avis éclairé. Enregistrez quelques séances et je reviendrai vers vous avec une analyse complète !";
    }

    const systemInstruction = `Tu es le "Coach Studio", un assistant expert en préparation physique pour créatifs et artistes.
    Ton but est d'analyser les données d'entraînement de l'utilisateur et de lui donner des conseils motivationnels et techniques concrets pour progresser.
    
    INSTRUCTIONS :
    - Sois encourageant mais professionnel.
    - Utilise des métaphores liées à la création (manga, art) si pertinent.
    - Analyse le volume total, la régularité (streaks) et l'équilibre entre musculation et cardio.
    - Suggère des ajustements de charge ou de repos si tu détectes un plateau ou une surchauffe.
    - Réponds en français de manière concise.`;

    const level = calculateLevel(fitnessData.xp || 0);
    const userClass = determineClass(musculationSessions.length, cardioSessions.length);

    const userContext = `Voici mes données récentes :
    - Niveau actuel : ${level} (${fitnessData.xp || 0} XP).
    - Classe : ${userClass.name} (${userClass.desc}).
    - Séances Musculation : ${musculationSessions.length} enregistrées. Dernière séance : ${musculationSessions.slice(-1)[0]?.name || 'N/A'}. 
    - Volume total de la dernière séance : ${Math.round(musculationSessions.slice(-1)[0]?.totalVolume || 0)} kg.
    - Sessions Cardio : ${cardioSessions.length} enregistrées.
    - Série actuelle : ${fitnessData.streak || 0} jours consécutifs.
    - Poids actuel : ${measurements.slice(-1)[0]?.weight || 'N/A'} kg.
    
    Analyse ma progression actuelle au regard de ma classe "${userClass.name}" et donne-moi 3 points d'amélioration ou encouragements.`;

    const messages = [{ role: 'user', content: userContext }];

    try {
        return await callGemini(
            store.settings.geminiKey,
            store.settings.geminiModel,
            messages,
            systemInstruction
        );
    } catch (error) {
        console.error("[Fitness AI] Analysis error:", error);
        throw new Error("Désolé, je n'ai pas pu joindre le coach. Vérifiez votre clé API dans l'onglet Brainstorming.");
    }
}
