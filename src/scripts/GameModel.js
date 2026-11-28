import { STORAGE_KEYS, STORAGE_PREFIXES, TEXTURE_KEYS } from './identifiers';
import { StorageService } from "./StorageService";
import { CAMPAIGN_LEVELS, LEVEL_HI_SCORES_SEPARATOR, PLAYER, UPGRADE_MULTIPLIER, WEAPONS } from "./constants";
import { CAMPAIGN_SKILL_BRANCHES, CAMPAIGN_SKILL_MISSIONS } from './campaignSkills';
import { AchievementBook } from './achievements';

const ABILITY_PREFIX = STORAGE_PREFIXES.PLAYER_ABILITY_LEVEL_;
const CASUALTIES_PREFIX = STORAGE_PREFIXES.CASUALTIES_;
const clampOpacity = value => Math.max(0, Math.min(1, value));

export class GameModel {
    static _instance = null;

    constructor() {
        if (GameModel._instance) {
            return GameModel._instance;
        }

        this.currentLevelScene = StorageService.get(STORAGE_KEYS.CURRENT_LEVEL_SCENE, 1, Number);
        this.currentLevelPlayer = StorageService.get(STORAGE_KEYS.CURRENT_LEVEL_PLAYER, 1, Number);
        this.totalScore = StorageService.get(STORAGE_KEYS.TOTAL_SCORE, 0, Number);
        this._campaignExperienceBonus = StorageService.get(STORAGE_KEYS.CAMPAIGN_EXPERIENCE_BONUS, 0, Number);
        const savedBranch = StorageService.get(STORAGE_KEYS.CAMPAIGN_SKILL_BRANCH, '');
        this._campaignSkillBranch = Object.hasOwn(CAMPAIGN_SKILL_BRANCHES, savedBranch) ? savedBranch : '';
        this.hiScores = StorageService.get(STORAGE_KEYS.HI_SCORES, '', String);
        this.unlimHiScores = StorageService.get(STORAGE_KEYS.UNLIM_HI_SCORES, 0, Number);
        // Older saves store just the balance. New wallets keep claims and funds in one write.
        let wallet;
        try {
            wallet = JSON.parse(StorageService.get(STORAGE_KEYS.MONEY, '0'));
        } catch {
            wallet = 0;
        }
        const balance = typeof wallet === 'number' ? wallet : wallet?.balance;
        this.money = Number.isSafeInteger(balance) && balance >= 0 ? balance : 0;
        this.claimedAchievements = new Set(Array.isArray(wallet?.claimed) ? wallet.claimed : []);
        this.player = { ...PLAYER };
        this.fireWeapon = { ...WEAPONS.FIRE };
        this.currentUpgradableStats = { 
            health: 1,
            reload: 1,
            velocity: 1,
            scale: 1,
        };
        this.casualties = { 
            jet: StorageService.get(`${CASUALTIES_PREFIX}jet`, 0, Number),
            helicopter: StorageService.get(`${CASUALTIES_PREFIX}helicopter`, 0, Number),
            rocket: StorageService.get(`${CASUALTIES_PREFIX}rocket`, 0, Number),
            missile: StorageService.get(`${CASUALTIES_PREFIX}missile`, 0, Number),
        };
        
        this.lang = StorageService.get(STORAGE_KEYS.LANG, '', String);
        if (![TEXTURE_KEYS.ENG, TEXTURE_KEYS.UKR].includes(this.lang)) this.lang = '';
        this.soundEnabled = StorageService.get(STORAGE_KEYS.SOUND_ENABLED, true, value => value !== 'false');
        this.showFPS = StorageService.get(STORAGE_KEYS.SHOW_FPS, false, value => value === 'true');
        this.autoFireEnabled = StorageService.get(STORAGE_KEYS.AUTO_FIRE_ENABLED, false, value => value === 'true');
        this.joystickOpacity = clampOpacity(StorageService.get(STORAGE_KEYS.JOYSTICK_OPACITY, 0.75, Number));
        this.fireButtonOpacity = clampOpacity(StorageService.get(STORAGE_KEYS.FIRE_BUTTON_OPACITY, 0.65, Number));
        this.achievements = new AchievementBook(this);
    }

    static getInstance() {
        if (!GameModel._instance) {
            GameModel._instance = new GameModel();
        }
        return GameModel._instance;
    }

    initGameData() {
        // Each field already has a default; a zero score does not mean no save exists.
        this.initAbilitiesByLevel();
        this.achievements.refresh({ notify: false, saveCounts: true });
    }
  
    initMoney() {
        this.money = 0;
        this.setMoney(this.money);
    }

    increaseMoney() {
        this.money++;
        this.setMoney(this.money);
    }

    decreaseMoney(value) {
        if (!Number.isFinite(value) || value < 0 || value > this.money) {
            return false;
        }

        this.money -= value;
        this.setMoney(this.money);
        return true;
    }

    setMoney(value) {
        this.money = value;
        StorageService.set(STORAGE_KEYS.MONEY, JSON.stringify({
            balance: this.money, claimed: [...this.claimedAchievements],
        }));
    }
  
    addTotalScore(amount, experienceMultiplier = 1) {
        this.setTotalScore(this.totalScore + amount);
        if (experienceMultiplier > 1) {
            this._campaignExperienceBonus += amount * (experienceMultiplier - 1);
            StorageService.set(STORAGE_KEYS.CAMPAIGN_EXPERIENCE_BONUS, this._campaignExperienceBonus);
        }
    }

    get campaignExperience() {
        return this.totalScore + this._campaignExperienceBonus;
    }

    get dragonAge() {
        return Math.floor(Math.min(...Object.values(this.currentUpgradableStats)) / 5);
    }

    get campaignSkillBranch() {
        return this._campaignSkillBranch;
    }

    get campaignSkillTier() {
        return CAMPAIGN_SKILL_MISSIONS.filter(mission => this.currentLevelScene > mission).length;
    }

    get canChooseCampaignSkillBranch() {
        return this.campaignSkillTier > 0 && !this.campaignSkillBranch;
    }

    chooseCampaignSkillBranch(branch) {
        if (!this.canChooseCampaignSkillBranch || !Object.hasOwn(CAMPAIGN_SKILL_BRANCHES, branch)) return false;
        this._campaignSkillBranch = branch;
        StorageService.set(STORAGE_KEYS.CAMPAIGN_SKILL_BRANCH, branch);
        this.achievements.refresh();
        return true;
    }

    setTotalScore(value) {
        this.totalScore = value;
        StorageService.set(STORAGE_KEYS.TOTAL_SCORE, this.totalScore);
    }

    setHiScores(value) {
        this.hiScores = value;
        StorageService.set(STORAGE_KEYS.HI_SCORES, this.hiScores);
    }

    getLevelHiScore(level) {
        if (!this.hiScores) {
            return 0;
        }

        const scores = this.hiScores.split(LEVEL_HI_SCORES_SEPARATOR).map(Number);
        const score = scores[level - 1];
        return Number.isFinite(score) && score >= 0 ? score : 0;
    }

    setUnlimHiScores(value) {
        this.unlimHiScores = value;
        StorageService.set(STORAGE_KEYS.UNLIM_HI_SCORES, this.unlimHiScores);
    }

    claimAchievement(id) {
        if (!this.achievements.unlocked.has(id) || this.claimedAchievements.has(id)) return false;
        this.claimedAchievements.add(id);
        this.increaseMoney();
        return true;
    }

    getMissionBestKills(level) {
        const total = CAMPAIGN_LEVELS[level - 1].enemies;
        const best = StorageService.get(STORAGE_PREFIXES.MISSION_BEST_KILLS + level, null, Number);
        if (Number.isInteger(best) && best >= 0 && best <= total) return best;
        const remaining = StorageService.get(STORAGE_PREFIXES.MISSION_REMAINING + level, null, Number);
        return Number.isInteger(remaining) && remaining >= 0 && remaining <= total ? total - remaining : 0;
    }

    recordMissionKills(level, kills) {
        if (kills > this.getMissionBestKills(level)) {
            StorageService.set(STORAGE_PREFIXES.MISSION_BEST_KILLS + level, kills);
        }
    }

    initSceneLevel() {
        this.currentLevelScene = 1;
        StorageService.set(STORAGE_KEYS.CURRENT_LEVEL_SCENE, this.currentLevelScene);
    }
  
    increaseSceneLevel() {
        this.currentLevelScene++;
        StorageService.set(STORAGE_KEYS.CURRENT_LEVEL_SCENE, this.currentLevelScene);
        this.achievements.refresh();
    }

    increasePlayerLevel() {
        this.currentLevelPlayer++;
        StorageService.set(STORAGE_KEYS.CURRENT_LEVEL_PLAYER, this.currentLevelPlayer);
        this.achievements.refresh();
    }

    initPlayerLevel() {
        this.currentLevelPlayer = 1;
        StorageService.set(STORAGE_KEYS.CURRENT_LEVEL_PLAYER, this.currentLevelPlayer);
    }

    setLang(lang) {
        this.lang = lang;
        StorageService.set(STORAGE_KEYS.LANG, lang);
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        StorageService.set(STORAGE_KEYS.SOUND_ENABLED, enabled);
    }

    setShowFPS(enabled) {
        this.showFPS = enabled;
        StorageService.set(STORAGE_KEYS.SHOW_FPS, enabled);
    }

    setAutoFireEnabled(enabled) {
        this.autoFireEnabled = enabled;
        StorageService.set(STORAGE_KEYS.AUTO_FIRE_ENABLED, enabled);
    }

    setJoystickOpacity(value) {
        if (!Number.isFinite(value)) return;
        this.joystickOpacity = clampOpacity(value);
        StorageService.set(STORAGE_KEYS.JOYSTICK_OPACITY, this.joystickOpacity);
    }

    setFireButtonOpacity(value) {
        if (!Number.isFinite(value)) return;
        this.fireButtonOpacity = clampOpacity(value);
        StorageService.set(STORAGE_KEYS.FIRE_BUTTON_OPACITY, this.fireButtonOpacity);
    }

    resetProgress() {
        this.initSceneLevel();
        this.initPlayerLevel();
        this._campaignSkillBranch = '';
        this._campaignExperienceBonus = 0;
        StorageService.set(STORAGE_KEYS.CAMPAIGN_SKILL_BRANCH, '');
        StorageService.set(STORAGE_KEYS.CAMPAIGN_EXPERIENCE_BONUS, 0);
        this.claimedAchievements.clear();
        this.initMoney();
        for (const level of CAMPAIGN_LEVELS) {
            StorageService.remove(STORAGE_PREFIXES.MISSION_REMAINING + level.index);
            StorageService.remove(STORAGE_PREFIXES.MISSION_BEST_KILLS + level.index);
        }
        this.initHiScores();
        this.initCasualties();
        this.initUpgradeLevels();
        this.player = { ...PLAYER };
        this.fireWeapon = { ...WEAPONS.FIRE };
        this._abilitiesInitialized = false;
        this.initAbilitiesByLevel();
        this.achievements.reset();
    }

    initCasualties() {
        Object.keys(this.casualties).forEach(name => {
            this.casualties[name] = 0;
            StorageService.set(`${CASUALTIES_PREFIX}${name}`, 0);
        });
    }

    initHiScores() {
        const stringifiedArr = Array(CAMPAIGN_LEVELS.length).fill(0).join(LEVEL_HI_SCORES_SEPARATOR);
    
        this.setHiScores(stringifiedArr);
        this.setTotalScore(0);
        this.setUnlimHiScores(0);
    };

    initUpgradeLevels() {
        const stats = Object.keys(this.currentUpgradableStats);
    
        for (let i = 0; i < stats.length; i++) {
            const key = stats[i];
            StorageService.set(`${ABILITY_PREFIX}${key}`, 1);
        }
    };

    initAbilitiesByLevel() {
        if (this._abilitiesInitialized) return;
        this._abilitiesInitialized = true;
        const stats = Object.keys(this.currentUpgradableStats);
    
        for (let i = 0; i < stats.length; i++) {
            const key = stats[i];
            const savedLevel = StorageService.get(`${ABILITY_PREFIX}${key}`, 1, Number);
            const level = Number.isSafeInteger(savedLevel) && savedLevel >= 1 ? savedLevel : 1;
            const base = key === TEXTURE_KEYS.HEALTH ? PLAYER.maxHealth : WEAPONS.FIRE[key];
            const multiplier = key === TEXTURE_KEYS.RELOAD ? 1 - UPGRADE_MULTIPLIER : 1 + UPGRADE_MULTIPLIER;
            const value = base * Math.pow(multiplier, level - 1);
            const valid = Number.isFinite(value) && value > 0;
            this.currentUpgradableStats[key] = valid ? level : 1;
            if (key === TEXTURE_KEYS.HEALTH) this.player.maxHealth = valid ? value : base;
            else this.fireWeapon[key] = valid ? value : base;
        }
        this.fireWeapon.maxSpeed = this.fireWeapon.velocity;
    }

    upgradePlayerAbility(key) {
        switch (key) {
            case TEXTURE_KEYS.HEALTH:
                this.player.maxHealth += this.player.maxHealth * UPGRADE_MULTIPLIER;
                break;
            case TEXTURE_KEYS.RELOAD:
                this.fireWeapon[key] -= this.fireWeapon[key] * UPGRADE_MULTIPLIER;
                break;
            case TEXTURE_KEYS.SCALE:
                this.fireWeapon[key] += this.fireWeapon[key] * UPGRADE_MULTIPLIER;
                break;
            case TEXTURE_KEYS.VELOCITY:
                this.fireWeapon[key] += this.fireWeapon[key] * UPGRADE_MULTIPLIER;
                this.fireWeapon.maxSpeed = this.fireWeapon.velocity;
                break;
            default:
                throw new Error('Unknown ability: ' + key);
        }

        this.currentUpgradableStats[key] += 1;
        StorageService.set(`${ABILITY_PREFIX}${key}`, this.currentUpgradableStats[key]);
        this.achievements.refresh();
    }

    increaseCasualties(name) {
        if (!Object.hasOwn(this.casualties, name)) return;
        this.casualties[name] += 1;

        StorageService.set(`${CASUALTIES_PREFIX}${name}`, this.casualties[name]);
    }
}
