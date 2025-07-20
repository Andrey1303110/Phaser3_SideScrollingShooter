import { config } from "../main";

const DEFAULT_SCALE = 0.37;

export class HealthBar extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);

        this._scene = scene;

        this._init();
        this._create();
        this._add();
    }

    async updateHealthBar(isForce = false){
        let progressValue;

        if (config.player.currentHealth <= 0) {
            progressValue = 0;
        } else {
            progressValue = config.player.currentHealth/config.player.maxHealth;
        }

        let cutWidth = this._healthBarFill.displayWidth * progressValue;

        if (cutWidth < 0 || !cutWidth) {
            cutWidth = this._healthBarFill.displayWidth;
            this.visible = false;
        }

        await this._tweenUpdate(cutWidth, isForce);
    }

    _onUpdateComplete(cutWidth) {
        this._healthBarFill.frame.cutWidth = cutWidth;
        this._healthBarFill.frame.updateUVs();
    }

    async _tweenUpdate(cutWidth, isForce) {
        let duration = isForce ? 0 : 150;

        const increaseValue = 1.15;
    
        await new Promise(resolve => {
            this._scene.tweens.add({
                targets: this,
                scale: DEFAULT_SCALE * increaseValue,
                ease: 'Power2.in',
                duration,
                onComplete: () => {
                    this._onUpdateComplete(cutWidth);
                    resolve();
                }
            });
        });

        await new Promise(resolve => {
            this._scene.tweens.add({
                targets: this,
                scale: DEFAULT_SCALE,
                ease: 'Power2.out',
                duration: duration * 0.75,
                onComplete: () => resolve()
            });
        });

    }

    _add() {
        this.add([
            this._healthBar,
            this._healthBarFill,
            this._heartIcon,
        ])
    }

    _init() {
        this.setScale(DEFAULT_SCALE);
    }

    _create() {
        this._createHealthBar();
        this._createHeartIcon();
    }

    _createHealthBar(){
        this._healthBar = this._scene.add.sprite(0, 0, 'health_bar_empty')
            .setAlpha(0.95);
        this._healthBarFill = this._scene.add.sprite(this._healthBar.x - this._healthBar.width * 0.0185, this._healthBar.y, 'health_bar_fill')
            .setAlpha(0.95);

        this.updateHealthBar(true);
    }

    _createHeartIcon(){
        this._heartIcon = this._scene.add.sprite(this._healthBar.x - this._healthBar.width * 0.53, this._healthBar.y, 'life_icon')
            .setAlpha(0.95);
    }
}