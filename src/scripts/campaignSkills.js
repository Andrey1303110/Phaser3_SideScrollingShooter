export const CAMPAIGN_SKILL_MISSIONS = [4, 7, 10];

export const BRANCH = Object.freeze({
    FIRE: 'fire',
    SURVIVAL: 'survival',
});

export const CAMPAIGN_SKILL_BRANCHES = {
    [BRANCH.FIRE]: { title: 'FIRE', color: 0xe99a55, skills: ['DOUBLE_FIRE', 'DOUBLE_PIERCE', 'BEAM'] },
    [BRANCH.SURVIVAL]: { title: 'SURVIVAL', color: 0x83c9a1, skills: ['SHIELD', 'VAMPIRISM', 'DOUBLE_XP'] },
};

export const CAMPAIGN_SKILL_BALANCE = {
    doubleFireScale: 0.75,
    doubleFireAngle: Math.PI / 9,
    piercingTargets: 2,
    beamIntervalMs: 10000,
    beamWidth: 20,
    beamFadeMs: 240,
    healFadeMs: 300,
    vampirismKills: 4,
    vampirismHealFraction: 0.1,
    experienceMultiplier: 2,
};
