var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },

    backgroundColor: '#F3F3F3',
    parent: 'gameDiv',
    orientation: Phaser.Scale.LANDSCAPE,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [BootScene, PreloadScene, GameTypeSelect, MapScene, StartScene, GameScene],

    currentLevel: localStorage.getItem('currentLevel') ?? 1,

    Player: {
        velocity: 500,
    },

    Enemies: {
        names: ['jet', 'helicopter'],
        helicopter: {
            velocity: 175,
            weapon: 'rocket',
        },
        jet: {
            velocity: 325,
            weapon: 'missile',
        },
    },

    Weapons: {
        fire: {
            reload: 425,
            velocity: 750,
            scale: 0.5,
        },
        rocket: {
            reload: 1950,
            velocity: 415 * -1,
            scale: 0.35,
        },
        missile: {
            reload: 2550,
            velocity: 575 * -1,
            scale: 0.45,
        }
    },

    reward: {
        jet: 350,
        helicopter: 250,
        missile: 125,
        rocket: 75,
    },

    Levels: [
        {
            level: 1,
            name: 'Kyiv Pechersk',
            x: 485,
            y: 175,
            enemies: 3,
            enemiesDelay: 2500,
            velocity: 250,
        },
        {
            level: 2,
            name: 'Odesa',
            x: 506,
            y: 490,
            enemies: 6,
            enemiesDelay: 2250,
            velocity: 265,
        },
        {
            level: 3,
            name: 'Kharkiv',
            x: 758,
            y: 179,
            enemies: 9,
            enemiesDelay: 2150,
            velocity: 285,
        },
        {
            level: 4,
            name: 'Kyiv Podil',
            x: 430,
            y: 135,
            enemies: 14,
            enemiesDelay: 2050,
            velocity: 315,
        },
        {
            level: 5,
            name: 'Mariupol Azovstal',
            x: 890,
            y: 397,
            enemies: 20,
            enemiesDelay: 2025,
            velocity: 340,
        },
        {
            level: 6,
            name: 'Vinnitsia Soborna',
            x: 353,
            y: 287,
            enemies: 27,
            enemiesDelay: 2025,
            velocity: 340,
        },
        {
            level: 7,
            name: 'Kyiv Voskresenka',
            x: 435,
            y: 195,
            enemies: 35,
            enemiesDelay: 2020,
            velocity: 340,
        },
        {
            level: 8,
            name: 'Lviv Plocha Runok',
            x: 105,
            y: 248,
            enemies: 43,
            enemiesDelay: 2010,
            velocity: 340,
        },
        {
            level: 9,
            name: 'Dnipro',
            x: 720,
            y: 311,
            enemies: 52,
            enemiesDelay: 2000,
            velocity: 340,
        },
        {
            level: 10,
            name: 'Genichesk',
            x: 732,
            y: 509,
            enemies: 62,
            enemiesDelay: 1990,
            velocity: 340,
        },
        {
            level: 11,
            name: 'Donetsk',
            x: 874,
            y: 333,
            enemies: 73,
            enemiesDelay: 1980,
            velocity: 340,
        },
        {
            level: 12,
            name: 'Zaporizha',
            x: 735,
            y: 366,
            enemies: 85,
            enemiesDelay: 1970,
            velocity: 340,
        },
        {
            level: 13,
            name: 'Sevastopol Balaklava',
            x: 676,
            y: 640,
            enemies: 98,
            enemiesDelay: 1960,
            velocity: 340,
        },
        {
            level: 14,
            name: 'Lugansk',
            x: 956,
            y: 261,
            enemies: 112,
            enemiesDelay: 1950,
            velocity: 340,
        },

    ]
};

var game = new Phaser.Game(config);

var screenEndpoints = {};
function setEndpoints() {
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

function initHiScores(){
    let arr = [];
    for (let i = 0; i < Object.keys(config.Levels).length; i++) {
        arr[i] = 0;
    }
    localStorage.setItem('hiScores', arr);
};

if (!localStorage.getItem('hiScores')) {
    initHiScores();
}
