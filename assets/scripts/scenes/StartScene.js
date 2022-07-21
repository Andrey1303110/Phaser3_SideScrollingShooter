class StartScene extends Phaser.Scene {
    constructor() {
        super("Start");
    }

    create(data) {
        this.createBG(data);
        this.createStartText();
        if (data.score !== undefined) {
            this.createStats(data);
        }
    }

    createBG(data) {
        this.sceneBG = this.add.sprite(0, 0, 'scene_bg_0').setOrigin(0).setInteractive();
        this.sceneBG.on('pointerdown', () => {
            this.scene.start('Game', data);
        }, this);
    }

    createStats(data) {
        this.add.graphics()
            .fillStyle('#000', 0.5)
            .fillRoundedRect(config.width / 2 - config.width * .15, config.height / 2 - config.height * .25, config.width * .3, config.height * .5, config.width*.03);

        const textTitle = data.completed ? 'Level completed!' : 'Game over';
        const textScore = `Score: ${data.score}`;
        const textStyle = {
            font: `${config.width*.03}px DishOut`,
            fill: '#f0f0f0',
        };

        this.add.text(config.width / 2, config.height / 2 - config.height * .125, textTitle, textStyle).setOrigin(0.5);
        this.add.text(config.width / 2, config.height / 2 + config.height * .125, textScore, textStyle).setOrigin(0.5);
    }

    createStartText() {
        this.startText = this.add.text(config.width / 2, screenEndpoints.bottom - config.height * .05, 'Tap to start', {
            font: `${config.width*.04}px DishOut`,
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