import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GameTypeSelect } from './scenes/GameTypeSelect';
import { MapScene } from './scenes/MapScene';
import { PauseScene } from './scenes/PauseScene';
import { UpgradeScene } from './scenes/PlayerUpgarde';
import { PreloadScene } from './scenes/PreloadScene';
import { StartScene } from './scenes/StartScene';

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
        width: 1280,
        height: 720,
    },

    scene: [BootScene, PreloadScene, GameTypeSelect, MapScene, StartScene, GameScene, PauseScene, UpgradeScene],

    lang: '',

    fonts: {
        eng: 'DishOut',
        ukr: 'Comfortaa-Regular',
    },

    currentLevelScene: localStorage.getItem('currentLevelScene') ?? 1,
    currentLevelPlayer: localStorage.getItem('currentLevelPlayer') ?? 1,
    totalScore: localStorage.getItem('totalScore') ?? 0,
    money: localStorage.getItem('money') ?? 0,

    joystick: {
        radius: 100,
        gap: 35
    },

    level: {
        scoreCof: 1.2,
        levelCof: 1.3,
        score: 500,
    },

    Losses: {
        jet: localStorage.getItem('losses_jet') ?? 0,
        helicopter: localStorage.getItem('losses_helicopter') ?? 0,
        rocket: localStorage.getItem('losses_rocket') ?? 0,
        missile: localStorage.getItem('losses_missile') ?? 0
    },

    Player: {
        velocity: 350,
        scale: 0.75
    },

    Enemies: {
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
            scale: 0.8,
        },
        strategic_jet: {
            velocity: 200,
            weapon: 'missile_2',
            textureNums: 4,
            scale: 0.95,
        },
    },

    Weapons: {
        fire: {
            reload: 500,
            velocity: 500,
            scale: 0.4,
        },
        rocket: {
            reload: 1750,
            velocity: 350 * -1,
            scale: 0.3,
        },
        missile: {
            reload: 2000,
            velocity: 475 * -1,
            scale: 0.375,
        },
        missile_2: {
            reload: 2500,
            velocity: 800 * -1,
            scale: 0.4,
        }
    },

    weapons_units: {
        reload: 'ms',
        velocity: 'm/s',
        scale: '%',
    },

    upgradeColors: {
        reload: '66E210',
        velocity: 'FF2407',
        scale: '0291F7',
    },

    reward: {
        missile_2: 750,
        strategic_jet: 500,
        jet: 375,
        helicopter: 275,
        missile: 150,
        rocket: 100,
    },

    Levels: [
        {
            level: 1,
            name: 'Kyiv Pechersk',
            x: 485,
            y: 175,
            enemies: 5,
            enemiesDelay: 2500,
            velocity: 4,
        },
        {
            level: 2,
            name: 'Odesa',
            x: 506,
            y: 490,
            enemies: 8,
            enemiesDelay: 2250,
            velocity: 4,
        },
        {
            level: 3,
            name: 'Kharkiv',
            x: 758,
            y: 179,
            enemies: 11,
            enemiesDelay: 2000,
            velocity: 4,
        },
        {
            level: 4,
            name: 'Kyiv Podil',
            x: 430,
            y: 135,
            enemies: 15,
            enemiesDelay: 1850,
            velocity: 4,
        },
        {
            level: 5,
            name: 'Mariupol Azovstal',
            x: 890,
            y: 397,
            enemies: 21,
            enemiesDelay: 1700,
            velocity: 4,
        },
        {
            level: 6,
            name: 'Vinnitsia Tower',
            x: 353,
            y: 287,
            enemies: 28,
            enemiesDelay: 1550,
            velocity: 4,
        },
        {
            level: 7,
            name: 'Kyiv Voskresenka',
            x: 435,
            y: 195,
            enemies: 39,
            enemiesDelay: 1400,
            velocity: 4,
        },
        {
            level: 8,
            name: 'Lviv Plocha Runok',
            x: 105,
            y: 248,
            enemies: 50,
            enemiesDelay: 1300,
            velocity: 4,
        },
        {
            level: 9,
            name: 'Dnipro',
            x: 720,
            y: 311,
            enemies: 65,
            enemiesDelay: 1200,
            velocity: 4,
        },
        {
            level: 10,
            name: 'Genichesk',
            x: 732,
            y: 509,
            enemies: 82,
            enemiesDelay: 1100,
            velocity: 4,
        },
        {
            level: 11,
            name: 'Donetsk',
            x: 874,
            y: 333,
            enemies: 100,
            enemiesDelay: 1050,
            velocity: 4,
        },
        {
            level: 12,
            name: 'Zaporizha',
            x: 735,
            y: 366,
            enemies: 120,
            enemiesDelay: 1000,
            velocity: 4,
        },
        {
            level: 13,
            name: 'Kahovska HPP',
            x: 665,
            y: 435,
            enemies: 145,
            enemiesDelay: 975,
            velocity: 4,
        },
        {
            level: 14,
            name: 'Sevastopol Balaklava',
            x: 676,
            y: 640,
            enemies: 200,
            enemiesDelay: 950,
            velocity: 4,
        },
        {
            level: 15,
            name: 'Luhansk',
            x: 956,
            y: 261,
            enemies: 250,
            enemiesDelay: 925,
            velocity: 4,
        },
    ],

    unlim: {
        unlim: true,
        level: 14,
        enemies: 9999,
        enemiesDelay: 1500
    },

    firstTimePlay: localStorage.getItem('firstTimePlay') ?? '1',
};

export const game = new Phaser.Game(config);

export const screenEndpoints = {};
export function setEndpoints() {
    if ((document.body.clientWidth / document.body.clientHeight) === (16 / 9)) {
        screenEndpoints.left = 0;
        screenEndpoints.right = config.width;
        screenEndpoints.top = 0;
        screenEndpoints.bottom = config.height;
    } else {
        if (document.body.clientWidth >= document.body.clientHeight) {
            if ((document.body.clientWidth / document.body.clientHeight) < (16 / 9)) {
                screenEndpoints.left = (config.width / 2) - (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2);
                screenEndpoints.right = (config.width / 2) + (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2);
                screenEndpoints.top = 0;
                screenEndpoints.bottom = config.height;
            } else {
                screenEndpoints.left = 0;
                screenEndpoints.right = config.width;
                screenEndpoints.top = (config.height - ((config.width / config.height) / (document.body.clientWidth / document.body.clientHeight) * config.height)) / 2;
                screenEndpoints.bottom = config.height - (config.height - ((config.width / config.height) / (document.body.clientWidth / document.body.clientHeight) * config.height)) / 2;
            }

        } else {
            screenEndpoints.left = (config.width / 2) - (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2);
            screenEndpoints.right = (config.width / 2) + (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2);
            screenEndpoints.top = 0;
            screenEndpoints.bottom = config.height;
        }
    }
};

function initHiScores() {
    const arr = Array(config.Levels.length).fill(0);

    localStorage.setItem('hiScores', arr);
    localStorage.setItem('unlimHiScores', 0);
};

function initLosses() {
    Object.keys(config.Losses).forEach(name => {
        localStorage.setItem(`losses_${name}`, 0);
    });
};

function initUpgardeLevels() {
    const weaponStats = Object.keys(config.Weapons.fire);
    for (let i = 0; i < weaponStats.length; i++) {
        const key = weaponStats[i];
        localStorage.setItem(`playerWeapon_${key}`, 1);
    }
};

function initWeaponConfig() {
    const weapons = Object.keys(config.Weapons.fire);

    for (let i = 0; i < weapons.length; i++) {
        const key = weapons[i];
        const level = localStorage.getItem(`playerWeapon_${key}`);

        for (let j = 1; j < level; j++) {
            if (key === 'reload') {
                config.Weapons.fire[key] -= config.Weapons.fire[key] * .05;
            } else {
                config.Weapons.fire[key] += config.Weapons.fire[key] * .05;
            }
        }
    }
}

export function setWeaponConf(data) {
    if (data.key === 'reload') {
        config.Weapons.fire[data.key] -= config.Weapons.fire[data.key] * .05;
    } else {
        config.Weapons.fire[data.key] += config.Weapons.fire[data.key] * .05;
    }

    return config.Weapons.fire[data.key];
}

export function setLang(lang) {
    config.lang = lang;
    localStorage.setItem('lang', lang);
}

if (localStorage.getItem('firstTimePlay') !== '0') {
    initHiScores();
    initLosses();
    initUpgardeLevels();
    localStorage.setItem('currentLevelPlayer', config.currentLevelPlayer);
    localStorage.setItem('money', config.money);
}

initWeaponConfig();

export function rgbToHex(colors) {
    return '0x' + ((1 << 24) + (colors.r << 16) + (colors.g << 8) + colors.b).toString(16).slice(1);
}

export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
