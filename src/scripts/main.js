import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameTypeSelect } from './scenes/GameTypeSelect';
import { CampaignScene } from './scenes/CampaignScene';
import { PauseScene } from './scenes/PauseScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SetLanguageScene } from './scenes/SetLanguageScene';
import { CAMPAIGN_LEVELS, FIRE_WEAPON_DEFAULT_SCALE, PLAYER, UPGRADE_MULTIPLIER, WEAPONS } from './constants';

export const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    input: {
		activePointers: 5,
	},
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },

    backgroundColor: '#F3F3F3',
    orientation: Phaser.Scale.LANDSCAPE,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'gameDiv',
    },

    scene: [BootScene, SetLanguageScene, PreloadScene, GameTypeSelect, CampaignScene, GameScene, PauseScene, UpgradeScene],

    lang: '',

    fonts: {
        eng: 'DishOut',
        ukr: 'Pangolin',
    },

    // TODO replace to separate property
    currentLevelScene: getLocalStorageItem('currentLevelScene', Number) ?? 1,
    currentLevelPlayer: getLocalStorageItem('currentLevelPlayer', Number) ?? 1,
    totalScore: getLocalStorageItem('totalScore', Number) ?? 0,
    money: getLocalStorageItem('money', Number) ?? 0,

    casualties: {
        jet: getLocalStorageItem('casualties_jet', Number) ?? 0,
        helicopter: getLocalStorageItem('casualties_helicopter', Number) ?? 0,
        rocket: getLocalStorageItem('casualties_rocket', Number) ?? 0,
        missile: getLocalStorageItem('casualties_missile', Number) ?? 0
    },

    player: { ...PLAYER },

    currentUpgradableStats: {
        health: 1,
        reload: 1,
        velocity: 1,
        scale: 1,
    },
};

export const game = new Phaser.Game(config);

export const screenData = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
};

export function setEndpoints() {
    const aspectRatio = document.body.clientWidth / document.body.clientHeight;
    const targetAspectRatio = 16 / 9;

    if (aspectRatio === targetAspectRatio) {
        screenData.left = 0;
        screenData.right = config.width;
        screenData.top = 0;
        screenData.bottom = config.height;
    } else if (aspectRatio < targetAspectRatio) {
        const newWidth = config.height * aspectRatio;
        screenData.left = (config.width - newWidth) * 0.5;
        screenData.right = screenData.left + newWidth;
        screenData.top = 0;
        screenData.bottom = config.height;
    } else {
        const newHeight = config.width / aspectRatio;
        screenData.left = 0;
        screenData.right = config.width;
        screenData.top = (config.height - newHeight) * 0.5;
        screenData.bottom = screenData.top + newHeight;
    }

    screenData.width = screenData.right - screenData.left;
    screenData.height = screenData.bottom - screenData.top;
}

function initHiScores() {
    const arr = Array(CAMPAIGN_LEVELS.length).fill(0);

    localStorage.setItem('hiScores', arr);
    localStorage.setItem('totalScore', 0);
    localStorage.setItem('unlimHiScores', 0);
};

function initCasualties() {
    Object.keys(config.casualties).forEach(name => {
        localStorage.setItem(`casualties_${name}`, 0);
    });
};

function initUpgradeLevels() {
    const stats = Object.keys(config.currentUpgradableStats);

    for (let i = 0; i < stats.length; i++) {
        const key = stats[i];
        localStorage.setItem(`playerAbilityLevel_${key}`, 1);
    }
};

function initAbilitiesByLevel() {
    const stats = Object.keys(config.currentUpgradableStats);

    for (let i = 0; i < stats.length; i++) {
        const key = stats[i];
        const level = getLocalStorageItem(`playerAbilityLevel_${key}`, Number);

        for (let j = 1; j < level; j++) {
            getPlayerAbilities(key);
        }
    }
}

export function getPlayerAbilities(key) {
    // TODO set by player weapon

    switch (key) {
        case 'health':
            config.player.maxHealth += config.player.maxHealth * UPGRADE_MULTIPLIER;
            return config.player.maxHealth;
        case 'reload':
            WEAPONS.FIRE[key] -= WEAPONS.FIRE[key] * UPGRADE_MULTIPLIER;
            return WEAPONS.FIRE[key];
        case 'scale':
            WEAPONS.FIRE[key] += WEAPONS.FIRE[key] * UPGRADE_MULTIPLIER;
            return WEAPONS.FIRE[key] * FIRE_WEAPON_DEFAULT_SCALE;
        case 'velocity':
            WEAPONS.FIRE[key] += WEAPONS.FIRE[key] * UPGRADE_MULTIPLIER;
            return WEAPONS.FIRE[key];
        default:
            throw new Error('Unknown ability upgrade');
    }
}

export function getLocalStorageItem(key, type = String) {
    const value = localStorage.getItem(key);
    if (!value) {
        return undefined;
    }

    if (!type) {
        return value;
    }

    return type(value);
}

export function setLang(lang) {
    config.lang = lang;
    localStorage.setItem('lang', lang);
}

export function getSceneTexts(scene) {
    return scene.cache.json.get('texts')[scene.name];
}

export function rgbToHex(colors) {
    return '0x' + ((1 << 24) + (colors.r << 16) + (colors.g << 8) + colors.b).toString(16).slice(1);
}

export const delayInMSec = (context, duration) => {
    const scene = context?.time ? context : context.scene;

    return new Promise(resolve => {
        scene.time.delayedCall(duration, resolve);
    });
};

export function getFontName() {
    return config.fonts[config.lang];
}

function initLang() {
    config.lang = getLocalStorageItem('lang');
}

function initGameData() {
    if (getLocalStorageItem('totalScore', Number)) {
        return;
    }

    if (getLocalStorageItem('totalScore', Number) === 0) {
        return;
    }

    initHiScores();
    initCasualties();
    initUpgradeLevels();
    initLocalStorageItems();
}

function initLocalStorageItems() {
    localStorage.setItem('currentLevelScene', config.currentLevelScene);
    localStorage.setItem('currentLevelPlayer', config.currentLevelPlayer);
    localStorage.setItem('currentPlayerWeapon', 'FIRE'); // todo fix
    localStorage.setItem('money', config.money);
}

initGameData();
initLang();
initAbilitiesByLevel();
