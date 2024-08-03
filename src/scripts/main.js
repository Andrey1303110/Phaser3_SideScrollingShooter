import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameTypeSelect } from './scenes/GameTypeSelect';
import { CampaignScene } from './scenes/CampaignScene';
import { PauseScene } from './scenes/PauseScene';
import { UpgradeScene } from './scenes/UpgradeScene';
import { PreloadScene } from './scenes/PreloadScene';

export const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    input: {
		activePointers: 3,
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

    scene: [BootScene, PreloadScene, GameTypeSelect, CampaignScene, GameScene, PauseScene, UpgradeScene],

    lang: '',

    fonts: {
        eng: 'DishOut',
        ukr: 'Pangolin',
    },

    // TODO replace to separate property
    currentLevelScene: localStorage.getItem('currentLevelScene') ?? 1,
    currentLevelPlayer: localStorage.getItem('currentLevelPlayer') ?? 1,
    totalScore: localStorage.getItem('totalScore') ?? 0,
    money: localStorage.getItem('money') ?? 0,

    joystick: {
        radius: 100,
        gap: 35
    },

    level: {
        scoreCof: 1.185,
        levelCof: 1.315,
        score: 500,
    },

    casualties: {
        jet: localStorage.getItem('casualties_jet') ?? 0,
        helicopter: localStorage.getItem('casualties_helicopter') ?? 0,
        rocket: localStorage.getItem('casualties_rocket') ?? 0,
        missile: localStorage.getItem('casualties_missile') ?? 0
    },

    player: {
        maxHealth: 100,
        currentHealth: 100,
        velocity: 350,
        scale: 0.75,
        currentWeapon: localStorage.getItem('currentPlayerWeapon'),
    },

    currentUpgradableStats: {
        health: 1,
        reload: 1,
        velocity: 1,
        scale: 1,
    },

    enemies: {
        helicopter: {
            velocity: 110,
            weapon: 'rocket',
            textureNums: 4,
            scale: 0.75,
        },
        jet: {
            velocity: 250,
            weapon: 'missile',
            textureNums: 4,
            scale: 0.76,
        },
        strategic_jet: {
            velocity: 200,
            weapon: 'missile_2',
            textureNums: 4,
            scale: 0.83,
        },
    },

    weapons: {
        fire: {
            reload: 500,
            velocity: 500,
            scale: 0.4,
        },
        rocket: {
            reload: 1750,
            velocity: 350 * -1,
            scale: 0.3,
            damage: 30,
        },
        missile: {
            reload: 2000,
            velocity: 475 * -1,
            scale: 0.375,
            damage: 45,
        },
        missile_2: {
            reload: 2500,
            velocity: 800 * -1,
            scale: 0.4,
            damage: 70,
        }
    },

    reward: {
        missile_2: 750,
        strategic_jet: 500,
        jet: 375,
        helicopter: 275,
        missile: 150,
        rocket: 100,
    },

    levels: [
        {
            index: 1,
            x: 485,
            y: 175,
            enemies: 5,
            enemiesDelay: 2500,
            velocity: 4,
        },
        {
            index: 2,
            x: 506,
            y: 490,
            enemies: 8,
            enemiesDelay: 2250,
            velocity: 4,
        },
        {
            index: 3,
            x: 758,
            y: 179,
            enemies: 11,
            enemiesDelay: 2000,
            velocity: 4,
        },
        {
            index: 4,
            x: 430,
            y: 135,
            enemies: 15,
            enemiesDelay: 1850,
            velocity: 4,
        },
        {
            index: 5,
            x: 890,
            y: 397,
            enemies: 21,
            enemiesDelay: 1700,
            velocity: 4,
        },
        {
            index: 6,
            x: 353,
            y: 287,
            enemies: 28,
            enemiesDelay: 1550,
            velocity: 4,
        },
        {
            index: 7,
            x: 435,
            y: 195,
            enemies: 39,
            enemiesDelay: 1400,
            velocity: 4,
        },
        {
            index: 8,
            x: 105,
            y: 248,
            enemies: 50,
            enemiesDelay: 1300,
            velocity: 4,
        },
        {
            index: 9,
            x: 720,
            y: 311,
            enemies: 65,
            enemiesDelay: 1200,
            velocity: 4,
        },
        {
            index: 10,
            x: 732,
            y: 509,
            enemies: 82,
            enemiesDelay: 1100,
            velocity: 4,
        },
        {
            index: 11,
            x: 874,
            y: 333,
            enemies: 100,
            enemiesDelay: 1050,
            velocity: 4,
        },
        {
            index: 12,
            x: 735,
            y: 366,
            enemies: 120,
            enemiesDelay: 1000,
            velocity: 4,
        },
        {
            index: 13,
            x: 665,
            y: 435,
            enemies: 145,
            enemiesDelay: 975,
            velocity: 4,
        },
        {
            index: 14,
            x: 676,
            y: 640,
            enemies: 200,
            enemiesDelay: 950,
            velocity: 4,
        },
        {
            index: 15,
            x: 956,
            y: 261,
            enemies: 250,
            enemiesDelay: 925,
            velocity: 4,
        },
    ],

    unlim: {
        unlim: true,
        index: 15,
        enemies: 9999,
        enemiesDelay: 1500
    },

    isFirstTimePlay: localStorage.getItem('isFirstTimePlay') ?? 1,
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
    const arr = Array(config.levels.length).fill(0);

    localStorage.setItem('hiScores', arr);
    localStorage.setItem('unlimHiScores', 0);
};

function initCasualties() {
    Object.keys(config.casualties).forEach(name => {
        localStorage.setItem(`casualties_${name}`, 0);
    });
};

function initUpgardeLevels() {
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
        const level = localStorage.getItem(`playerAbilityLevel_${key}`);

        for (let j = 1; j < level; j++) {
            getPlayerAbilities(key);
        }
    }
}

export function getPlayerAbilities(key) {
    // TODO set by player weapon
    const MULTIPLIER = 0.05;

    switch (key) {
        case 'health':
            config.player.maxHealth += config.player.maxHealth * MULTIPLIER;
            return config.player.maxHealth;
        case 'reload':
            config.weapons.fire[key] -= config.weapons.fire[key] * MULTIPLIER;
            return config.weapons.fire[key];
        case 'scale':
        case 'velocity':
            config.weapons.fire[key] += config.weapons.fire[key] * MULTIPLIER;
            return config.weapons.fire[key];
        default:
            throw new Error('Unknown ability upgrade');
    }
}

function initLang() {
    config.lang = localStorage.getItem('lang');
}

export function setLang(lang) {
    config.lang = lang;
    localStorage.setItem('lang', lang);
}

if (localStorage.getItem('isFirstTimePlay') !== 0) {
    initHiScores();
    initCasualties();
    initUpgardeLevels();
    localStorage.setItem('currentLevelPlayer', config.currentLevelPlayer);
    localStorage.setItem('currentPlayerWeapon', 'fire');
    localStorage.setItem('money', config.money);
}

initLang();
initAbilitiesByLevel();

export function getSceneTexts(scene) {
    return scene.cache.json.get('texts')[scene.name];
}

export function rgbToHex(colors) {
    return '0x' + ((1 << 24) + (colors.r << 16) + (colors.g << 8) + colors.b).toString(16).slice(1);
}

export const delayInMSec = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getFont() {
    return config.fonts[config.lang];
}
