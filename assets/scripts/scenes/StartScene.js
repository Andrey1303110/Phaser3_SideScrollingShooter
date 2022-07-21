class StartScene extends Phaser.Scene {
    constructor() {
        super("Start");
    }

    create() {
        this.createBG();
        this.createStartText();
    }

    createBG(){
        this.sceneBG = this.add.sprite(0, 0, 'scene_bg_0').setOrigin(0).setInteractive();
        this.sceneBG.on('pointerdown', ()=>{
            this.scene.start('Game');
        }, this);
    }

    createStartText(){
        this.startText = this.add.text(config.width / 2, screenEndpoints.bottom - config.height * .175, 'Tap to start', {
            font: '42px HeyComic',
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