var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,

    backgroundColor: 'black',
    parent: 'gameDiv',
    orientation: Phaser.Scale.PORTRAIT,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [BootScene, PreloadScene, GameScene],
};
var game = new Phaser.Game(config);