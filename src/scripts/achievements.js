import { CAMPAIGN_LEVELS } from './constants';
import { CAMPAIGN_SKILL_MISSIONS } from './campaignSkills';
import { STORAGE_KEYS, TEXTURE_KEYS } from './identifiers';
import { StorageService } from './StorageService';

const series = (group, metric, goals, rewards, firstFrame) => goals.map((goal, index) => ({
    id: `${metric}_${goal}`, group, metric, goal, reward: rewards[index], frame: firstFrame + index,
}));
const interceptions = [20, 50, 100, 500];
const finale = CAMPAIGN_LEVELS.length;

export const ACHIEVEMENTS = [
    ...series('flight', 'level', [20, 50, 100], [2, 5, 9], 0),
    ...series('flight', 'lastBreath', [1], [4], 3),
    ...series('campaign', 'mission', [4, 8, 12, 14, finale], [1, 3, 5, 7, 10], 15).map(entry => ({
        ...entry, frame: 15, location: entry.goal === finale ? null : entry.goal,
    })),
    ...series('endless', 'aircraft', interceptions, [1, 2, 4, 8], 4),
    ...series('workshop', 'branch', [CAMPAIGN_SKILL_MISSIONS.length], [4], 8),
    ...series('workshop', 'oneSkill', [10, 20, 40], [1, 3, 6], 9),
    ...series('workshop', 'allSkills', [10, 20, 40], [3, 5, 9], 12),
    ...series('intercepts', TEXTURE_KEYS.ROCKET, interceptions, [1, 2, 3, 6], 16),
    ...series('intercepts', TEXTURE_KEYS.MISSILE, interceptions, [1, 2, 4, 7], 20),
    ...series('intercepts', TEXTURE_KEYS.MISSILE_2, interceptions, [2, 3, 5, 8], 24),
];

const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;

export class AchievementBook {
    constructor(model) {
        this.model = model;
        this.pending = [];
        let saved;
        try {
            saved = JSON.parse(StorageService.get(STORAGE_KEYS.ACHIEVEMENTS, 'null'));
        } catch {
            // A damaged medal record can still be rebuilt from campaign and upgrade data.
        }
        this.unlocked = new Set(ACHIEVEMENTS.filter(a => Array.isArray(saved?.unlocked)
            && saved.unlocked.includes(a.id)).map(a => a.id));
        this.counts = {
            aircraft: count(saved?.aircraft),
            lastBreath: count(saved?.lastBreath),
            // Older saves combined both jet missile types but tracked helicopter rockets separately.
            rocket: count(saved?.rocket ?? model.casualties.rocket),
            missile: count(saved?.missile),
            missile_2: count(saved?.missile_2),
        };
    }

    progress({ id, metric, goal }) {
        if (this.unlocked.has(id)) return 1;
        const model = this.model;
        let value;
        switch (metric) {
            case 'level': value = model.currentLevelPlayer; break;
            case 'mission': value = model.currentLevelScene - 1; break;
            case 'branch': value = model.campaignSkillBranch ? model.campaignSkillTier : 0; break;
            case 'oneSkill': value = Math.max(...Object.values(model.currentUpgradableStats)); break;
            case 'allSkills': {
                const levels = Object.values(model.currentUpgradableStats);
                value = levels.reduce((sum, level) => sum + Math.min(level, goal), 0) / levels.length;
                break;
            }
            default: value = this.counts[metric];
        }
        return Math.max(0, Math.min(1, value / goal));
    }

    refresh({ notify = true, saveCounts = false } = {}) {
        let changed = false;
        for (const entry of ACHIEVEMENTS) {
            if (this.unlocked.has(entry.id) || this.progress(entry) < 1) continue;
            this.unlocked.add(entry.id);
            if (notify) this.pending.push(entry);
            changed = true;
        }
        if (changed || saveCounts) this.save();
    }

    recordHit(texture, isAircraft, isEndless) {
        if (isAircraft && !isEndless) return;
        const metric = isAircraft ? 'aircraft' : texture;
        if (!Object.hasOwn(this.counts, metric)) return;
        this.counts[metric]++;
        this.refresh({ saveCounts: true });
    }

    recordVictory(health, maximum) {
        if (this.counts.lastBreath || health <= 0 || health >= maximum * 0.05) return;
        this.counts.lastBreath = 1;
        this.refresh({ saveCounts: true });
    }

    reset() {
        this.unlocked.clear();
        this.pending.length = 0;
        for (const metric of Object.keys(this.counts)) this.counts[metric] = 0;
        this.save();
    }

    save() {
        StorageService.set(STORAGE_KEYS.ACHIEVEMENTS,
            JSON.stringify({ ...this.counts, unlocked: [...this.unlocked] }));
    }
}
