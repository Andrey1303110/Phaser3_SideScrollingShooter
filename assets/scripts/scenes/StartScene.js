class StartScene extends Phaser.Scene {
    constructor() {
        super("Start");
    }

    create() {
        this.createBG();
        this.createStartText();
    }

    createBG(){
        this.sceneBG = this.add.sprite(config.width / 2, config.height / 2, 'scene_bg').setInteractive();
        this.sceneBG.on('pointerdown', ()=>{
            this.scene.start('Game');
        }, this);
    }

    createStartText(){
        this.startText = this.add.text(config.width / 2, config.height * .85, 'Tap to start', {
            font: '52px HeyComic',
            fill: '#f0f0f0',
        }).setOrigin(0.5);

        let initScale = this.startText.scale;

        let timeline = this.tweens.createTimeline();

        timeline.add({
            targets: this.startText,
            scale: initScale + .18,
            ease: 'Power2',
            duration: 550,
        });
        timeline.add({
            targets: this.startText,
            scale: initScale,
            ease: 'Power2',
            duration: 550,
        });

        timeline.loop = -1;

        timeline.play();
    }
}