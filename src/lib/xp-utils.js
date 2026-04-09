/**
 * Logique de Gamification pour Mangaka Studio Fitness
 */

export const CLASSES = {
    SAMURAI: { name: 'Samouraï', icon: 'shield', color: '#3b82f6', desc: 'Équilibre parfait Force/Cardio' },
    TITAN: { name: 'Titan', icon: 'dumbbell', color: '#8b5cf6', desc: 'Dominance Force & Volume' },
    NINJA: { name: 'Ninja', icon: 'zap', color: '#0ea5e9', desc: 'Dominance Cardio & Agilité' },
    ERMITE: { name: 'Ermite', icon: 'mountain', color: '#94a3b8', desc: 'Voie de la tempérance (débutant)' }
};

export function calculateLevel(xp) {
    if (!xp || xp < 0) return 0;
    // Formule : xp = 100 * level^2 => level = sqrt(xp / 100)
    return Math.floor(Math.sqrt(xp / 100));
}

export function getXPForLevel(level) {
    return 100 * Math.pow(level, 2);
}

export function getProgressToNextLevel(xp) {
    const currentLevel = calculateLevel(xp);
    const currentLevelXP = getXPForLevel(currentLevel);
    const nextLevelXP = getXPForLevel(currentLevel + 1);
    
    const progress = xp - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    
    return Math.min(100, Math.round((progress / required) * 100));
}

export function determineClass(musculationCount, cardioCount) {
    const total = musculationCount + cardioCount;
    if (total < 5) return CLASSES.ERMITE;
    
    const muscuRatio = musculationCount / total;
    const cardioRatio = cardioCount / total;
    
    if (muscuRatio > 0.7) return CLASSES.TITAN;
    if (cardioRatio > 0.7) return CLASSES.NINJA;
    if (Math.abs(muscuRatio - cardioRatio) < 0.3) return CLASSES.SAMURAI;
    
    return CLASSES.SAMURAI; // Default to Samurai for mixed builds
}

export function calculateSessionXP(session, type) {
    let xp = 0;
    if (type === 'musculation') {
        // 1 XP par 100kg de volume, min 10 XP
        xp = Math.max(10, Math.floor((session.totalVolume || 0) / 100));
    } else if (type === 'cardio') {
        // 1 XP par minute, min 20 XP
        xp = Math.max(20, parseInt(session.duration) || 0);
    }
    return xp;
}

export function getHygieneAura(streak) {
    if (!streak || streak < 3) return { id: 'none', name: 'Aucune', color: 'transparent', bonus: 0 };
    if (streak < 7) return { id: 'bronze', name: 'Aura de Bronze', color: '#cd7f32', bonus: 10 };
    if (streak < 15) return { id: 'silver', name: "Aura d'Argent", color: '#c0c0c0', bonus: 15 };
    if (streak < 30) return { id: 'gold', name: "Aura d'Or", color: '#ffd700', bonus: 20 };
    return { id: 'crystal', name: 'Aura de Cristal', color: '#e0f2fe', bonus: 35 };
}

export function calculateGlobalXP(fitnessData) {
    let totalXP = 0;
    
    // XP des sessions
    (fitnessData.musculationSessions || []).forEach(s => {
        totalXP += calculateSessionXP(s, 'musculation');
    });
    
    (fitnessData.cardioSessions || []).forEach(s => {
        totalXP += calculateSessionXP(s, 'cardio');
    });
    
    // Bonus Hydratation (historique)
    const hydration = fitnessData.hydration || {};
    Object.values(hydration).forEach(amount => {
        if (amount >= (fitnessData.waterGoal || 2.5)) totalXP += 10;
    });
    
    // Bonus Streak Fitness
    totalXP += (fitnessData.streak || 0) * 5;

    // Hygiene XP
    const hygiene = fitnessData.hygiene || {};
    const hygieneLogs = hygiene.logs || {};
    Object.values(hygieneLogs).forEach(log => {
        if (log.morning) totalXP += 10;
        if (log.evening) totalXP += 10;
    });
    
    // Bonus Streak Hygiene (Dynamic based on Aura)
    const streak = hygiene.streak || 0;
    const aura = getHygieneAura(streak);
    
    // Base streak XP + Aura bonus
    totalXP += streak * 5; 
    if (aura.id !== 'none') {
        totalXP += (streak * aura.bonus); // High rewarding system for discipline
    }
    
    return totalXP;
}
