export interface GamificationStats {
    xp: number;
    level: number;
    credibility_score: number;
}

export const LEVEL_THRESHOLDS = [
    { level: 1, minXp: 0 },
    { level: 2, minXp: 501 },
    { level: 3, minXp: 1501 },
    { level: 4, minXp: 3001 },
    { level: 5, minXp: 6001 },
];

export function calculateLevel(xp: number): number {
    let level = 1;
    for (const threshold of LEVEL_THRESHOLDS) {
        if (xp >= threshold.minXp) {
            level = threshold.level;
        } else {
            break;
        }
    }
    return level;
}

export function getXpForNextLevel(level: number): number | null {
    const nextLevel = LEVEL_THRESHOLDS.find(t => t.level === level + 1);
    return nextLevel ? nextLevel.minXp : null;
}

export function getXpProgress(xp: number, level: number): number {
    const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === level)?.minXp || 0;
    const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1)?.minXp;

    if (!nextThreshold) return 100;

    const range = nextThreshold - currentThreshold;
    const progress = xp - currentThreshold;
    return Math.max(0, Math.min(100, (progress / range) * 100));
}
