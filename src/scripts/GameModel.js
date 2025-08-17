import { StorageService } from "./StorageService";
import { CAMPAIGN_LEVELS, LEVEL_HI_SCORES_SEPARATOR, PLAYER, UPGRADE_MULTIPLIER, WEAPONS } from "./constants";

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
        this.currentUpgradableStats = { 
            health: StorageService.get('playerAbilityLevel_health', 1, Number),
            reload: StorageService.get('playerAbilityLevel_reload', 1, Number),
            velocity: StorageService.get('playerAbilityLevel_velocity', 1, Number),
            scale: StorageService.get('playerAbilityLevel_scale', 1, Number),
        };
        this.casualties = { 
            jet: StorageService.get('casualties_jet', 0, Number),
            helicopter: StorageService.get('casualties_helicopter', 0, Number),
            rocket: StorageService.get('casualties_rocket', 0, Number),
            missile: StorageService.get('casualties_missile', 0, Number),
        };
        
        this.lang = StorageService.get('lang', '', String);
    }

    static getInstance() {
        if (!GameModel._instance) {
            GameModel._instance = new GameModel();
        }
        return GameModel._instance;
    }

    initGameData() {
        if (this.totalScore !== 0) {
            this.initAbilitiesByLevel(); // todo
            return;
        }

        this.initCasualties();
        this.initHiScores();
        this.initUpgradeLevels();
        this.initSceneLevel();
        this.initPlayerLevel();
        this.initMoney();
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
        if (this.money <= 0) {
            return;
        }

        this.money -= value;
        this.setMoney(this.money);
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
        if (!this.hiScores || !this.hiScores.length) {
            return 0;
        }

        const scores = this.hiScores.split(LEVEL_HI_SCORES_SEPARATOR).map(Number);
        return scores[level - 1];
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
            StorageService.set(`casualties_${name}`, 0);
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
            StorageService.set(`playerAbilityLevel_${key}`, 1);
        }
    };

    initAbilitiesByLevel() {
        const stats = Object.keys(this.currentUpgradableStats);
    
        for (let i = 0; i < stats.length; i++) {
            const key = stats[i];
            const level = StorageService.get(`playerAbilityLevel_${key}`, 1, Number);
    
            for (let j = 1; j < level; j++) {
                this.upgradePlayerAbility(key);
            }
        }
    }

    upgradePlayerAbility(key) {
        switch (key) {
            case 'health':
                this.player.maxHealth += this.player.maxHealth * UPGRADE_MULTIPLIER;
                break;
            case 'reload':
                WEAPONS.FIRE[key] -= WEAPONS.FIRE[key] * UPGRADE_MULTIPLIER;
                break;
            case 'scale':
                WEAPONS.FIRE[key] += WEAPONS.FIRE[key] * UPGRADE_MULTIPLIER;
                break;
            case 'velocity':
                WEAPONS.FIRE[key] += WEAPONS.FIRE[key] * UPGRADE_MULTIPLIER;
                break;
            default:
                throw new Error('Unknown ability: ' + key);
        }

        this.currentUpgradableStats[key] += 1;
        StorageService.set(`playerAbilityLevel_${key}`, this.currentUpgradableStats[key]);
    }

    increaseCasualties(name) {
        this.casualties[name] += 1;

        switch (name) {
            case 'jet':
                StorageService.set('casualties_jet', this.casualties[name]);
                break;
            case 'helicopter':
                StorageService.set('casualties_helicopter', this.casualties[name]);
                break;
            case 'rocket':
                StorageService.set('casualties_rocket', this.casualties[name]);
                break;
            case 'missile':
                StorageService.set('casualties_missile', this.casualties[name]);
                break;
        }
    }
}
  