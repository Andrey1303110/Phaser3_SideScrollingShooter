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

    backgroundColor: 'black',
    parent: 'gameDiv',
    orientation: Phaser.Scale.LANDSCAPE,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [BootScene, PreloadScene, StartScene, GameScene],
};

var game = new Phaser.Game(config);

var screenEndpoints = {};
(function setEndpoints() {
    if (document.body.clientWidth >= document.body.clientHeight) {
        if (document.body.clientWidth / document.body.clientHeight < 16 / 9) {
            screenEndpoints = {
                left: (config.width / 2) - document.body.clientWidth / 2 * (config.height / document.body.clientHeight) + (document.body.clientWidth * .1),
                right: (config.width / 2) + document.body.clientWidth / 2 * (config.height / document.body.clientHeight) - (document.body.clientWidth * .1),
                no_margin_left: (config.width / 2) - (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
                no_margin_right: (config.width / 2) + (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
            };
        }
        else {
            screenEndpoints = {
                left: (config.width * .075),
                right: config.width - (config.width * .075),
                no_margin_left: 0,
                no_margin_right: config.width,
            };
        }
        screenEndpoints.top = 0;
        screenEndpoints.bottom = config.height;
    }
    else {
        screenEndpoints = {
            left: (config.width / 2) - document.body.clientWidth / 2 * (config.height / document.body.clientHeight) + (document.body.clientWidth * .1),
            right: (config.width / 2) + document.body.clientWidth / 2 * (config.height / document.body.clientHeight) - (document.body.clientWidth * .1),
            no_margin_left: (config.width / 2) - (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
            no_margin_right: (config.width / 2) + (((config.height / document.body.clientHeight) * document.body.clientWidth) / 2),
            top: ((config.width / config.width) / (document.body.clientWidth / document.body.clientHeight) * config.height) / 2,
            bottom: config.height - (((config.width / config.width) / (document.body.clientWidth / document.body.clientHeight) * config.height) / 2),
        };
    }
}());
