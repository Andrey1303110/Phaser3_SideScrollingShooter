import { config, screenEndpoints } from "/src/scripts/main";

export class PauseScene extends Phaser.Scene {
    constructor() {
        super("Pause");
    }

    init(){
        this.game.sound.stopAll();
    }

    create() {
        this.createBG();
        this.createButtons();
        this.toggleMenu();
    }

    createBG() {
        this.black_bg = this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, '0x000000', 0);
        this.sceneBG = this.add.sprite(config.width / 2, config.height * -1, 'pause_bg').setOrigin(.5);

        this.tweens.add({
            targets: this.sceneBG,
            y: config.height/2,
            ease: 'Linear',
            duration: 750,
        })
    }

    createButtons(){
        this.play_button = this.add.sprite(this.sceneBG.x, this.sceneBG.y, 'play')
            .setScale(.8)
            .setAlpha(.85)
            .setOrigin(.5)
            .setInteractive()
            .on('pointerdown', ()=>{this.toggleMenu('resume')}, this)
            .on('pointerover', ()=>{this.play_button.setAlpha(1)})
            .on('pointerout', ()=>{this.play_button.setAlpha(.85)});

        this.restart_button = this.add.sprite(this.sceneBG.x + this.sceneBG.displayWidth * .25, this.sceneBG.y, 'restart')
            .setScale(1.25)
            .setAlpha(.65)
            .setOrigin(.5)
            .setInteractive()
            .on('pointerdown', ()=>{this.toggleMenu('restart')}, this)
            .on('pointerover', ()=>{this.restart_button.setAlpha(1)})
            .on('pointerout', ()=>{this.restart_button.setAlpha(.65)});

        this.return_button = this.add.sprite(this.sceneBG.x - this.sceneBG.displayWidth * .25, this.sceneBG.y, 'return')
            .setScale(1.25)
            .setAlpha(.65)
            .setOrigin(.5)
            .setInteractive()
            .on('pointerdown', ()=>{
                this.toggleMenu('return')
            }, this)
            .on('pointerover', ()=>{this.return_button.setAlpha(1)})
            .on('pointerout', ()=>{this.return_button.setAlpha(.65)});
    }

    toggleMenu(command){
        const tween_duration = 750;
        const y = this.sceneBG.y < 0 ? screenEndpoints.top + this.sceneBG.displayHeight / 2 : config.height * -1;

        this.tweens.add({
            targets: this.sceneBG,
            y: y,
            ease: 'Linear',
            duration: tween_duration,
            onComplete: ()=>{
                switch (command) {
                    case 'resume':
                        this.scene.resume('Game');
                    break;
                    case 'restart':
                        this.scene.start('Game');
                    break;
                    case 'return':
                        this.scene.stop('Game');
                        this.scene.launch('Map');
                    break;
                }
            }
        })
        this.tweens.add({
            targets: [this.play_button, this.restart_button, this.return_button],
            y: y + this.sceneBG.displayHeight * .06085,
            ease: 'Linear',
            duration: tween_duration,
        })
    }
}