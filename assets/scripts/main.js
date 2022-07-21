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
    
    currentLevel: 1,

    Player: {
        velocity: 500,
        fireVelocity: 1000,
        fireReload: 425,
        fireScale: 0.5,
    },

    Enemy: {
        velocity: 1500,
        fireVelocity: 450 * -1,
        fireReload: 1500,
        fireScale: 0.35,
    },

    reward: {
        enemy: 250,
        rocket: 50,
    },

    levels: {
        1: {
            enemies: 8,
            enemiesDelay: 1500,
            enemyVelocity: 250,
        },
        2: {
            enemies: 15,
            enemiesDelay: 1250,
            enemyVelocity: 275,
        },
        3: {
            enemies: 25,
            enemiesDelay: 1050,
            enemyVelocity: 305,
        },
        4: {
            enemies: 40,
            enemiesDelay: 900,
            enemyVelocity: 340,
        },
        5: {
            enemies: 60,
            enemiesDelay: 775,
            enemyVelocity: 370,
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
