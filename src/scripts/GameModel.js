import { StorageService } from "./StorageService";
import { CAMPAIGN_LEVELS, LEVEL_HI_SCORES_SEPARATOR, PLAYER, UPGRADE_MULTIPLIER, WEAPONS } from "./constants";

const ABILITY_PREFIX = 'playerAbilityLevel_';
const CASUALTIES_PREFIX = 'casualties_';

export class GameModel {
    static _instance = null;

    constructor() {
        if (GameModel._instance) {
            return GameModel._instance;
        }

        this.currentLevelScene = StorageService.get('currentLevelScene', 1, Number);
        this.currentLevelPlayer = StorageService.get('currentLevelPlayer', 1, Number);
        this.totalScore = StorageService.get('totalScore', 0, Number);
        this.hiScores = StorageService.get('hiScores', '', String);
        this.unlimHiScores = StorageService.get('unlimHiScores', 0, Number);
        this.money = StorageService.get('money', 0, Number);
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
        
        this.lang = StorageService.get('lang', '', String);
        if (!['eng', 'ukr'].includes(this.lang)) this.lang = '';
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
        StorageService.set('money', this.money);
    }
  
    addTotalScore(amount) {
        this.totalScore += amount;
        this.setTotalScore(this.totalScore);
    }

    setTotalScore(value) {
        this.totalScore = value;
        StorageService.set('totalScore', this.totalScore);
    }

    setHiScores(value) {
        this.hiScores = value;
        StorageService.set('hiScores', this.hiScores);
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
        StorageService.set('unlimHiScores', this.unlimHiScores);
    }

    initSceneLevel() {
        this.currentLevelScene = 1;
        StorageService.set('currentLevelScene', this.currentLevelScene);
    }
  
    increaseSceneLevel() {
        this.currentLevelScene++;
        StorageService.set('currentLevelScene', this.currentLevelScene);
    }

    increasePlayerLevel() {
        this.currentLevelPlayer++;
        StorageService.set('currentLevelPlayer', this.currentLevelPlayer);
    }

    initPlayerLevel() {
        this.currentLevelPlayer = 1;
        StorageService.set('currentLevelPlayer', this.currentLevelPlayer);
    }

    setLang(lang) {
        this.lang = lang;
        StorageService.set('lang', lang);
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
            const base = key === 'health' ? PLAYER.maxHealth : WEAPONS.FIRE[key];
            const multiplier = key === 'reload' ? 1 - UPGRADE_MULTIPLIER : 1 + UPGRADE_MULTIPLIER;
            const value = base * Math.pow(multiplier, level - 1);
            const valid = Number.isFinite(value) && value > 0;
            this.currentUpgradableStats[key] = valid ? level : 1;
            if (key === 'health') this.player.maxHealth = valid ? value : base;
            else this.fireWeapon[key] = valid ? value : base;
        }
        this.fireWeapon.maxSpeed = this.fireWeapon.velocity;
    }

    upgradePlayerAbility(key) {
        switch (key) {
            case 'health':
                this.player.maxHealth += this.player.maxHealth * UPGRADE_MULTIPLIER;
                break;
            case 'reload':
                this.fireWeapon[key] -= this.fireWeapon[key] * UPGRADE_MULTIPLIER;
                break;
            case 'scale':
                this.fireWeapon[key] += this.fireWeapon[key] * UPGRADE_MULTIPLIER;
                break;
            case 'velocity':
                this.fireWeapon[key] += this.fireWeapon[key] * UPGRADE_MULTIPLIER;
                this.fireWeapon.maxSpeed = this.fireWeapon.velocity;
                break;
            default:
                throw new Error('Unknown ability: ' + key);
        }

        this.currentUpgradableStats[key] += 1;
        StorageService.set(`${ABILITY_PREFIX}${key}`, this.currentUpgradableStats[key]);
    }

    increaseCasualties(name) {
        if (!Object.hasOwn(this.casualties, name)) return;
        this.casualties[name] += 1;

        StorageService.set(`${CASUALTIES_PREFIX}${name}`, this.casualties[name]);
    }
}
