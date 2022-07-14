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
    orientation: Phaser.Scale.PORTRAIT,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [BootScene, PreloadScene, StartScene, GameScene],
};
var game = new Phaser.Game(config);