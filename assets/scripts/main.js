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

    scene: [BootScene, PreloadScene, StartScene, GameScene],

    Player: {
        velocity: 500,
        fireVelocity: 1250,
        fireReload: 425,
        fireScale: 0.5,
    },

    Enemies: {
        names: ['jet', 'helicopter'],
        helicopter: {
            velocity: 375,
            weapon: 'rocket',
        },
        jet: {
            velocity: 425,
            weapon: 'missile',
        },
    },

    Weapons: {
        fire: {
            reload: 425,
            velocity: 1250,
            scale: 0.35,
        },
        rocket: {
            reward: 75,
            reload: 1250,
            velocity: 415 * -1,
            scale: 0.35,
        },
        missile: {
            reward: 75,
            reload: 1750,
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

    levels: {
        1: {
            enemies: 6,
            enemiesDelay: 1500,
            velocity: 250,
        },
        2: {
            enemies: 10,
            enemiesDelay: 1250,
            velocity: 265,
        },
        3: {
            enemies: 16,
            enemiesDelay: 1050,
            velocity: 285,
        },
        4: {
            enemies: 25,
            enemiesDelay: 900,
            velocity: 315,
        },
        5: {
            enemies: 36,
            enemiesDelay: 775,
            velocity: 340,
        }
    }
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
