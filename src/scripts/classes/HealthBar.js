import { tweenPromise } from "../Utils";

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
        this.setVisible(this._scene.player.currentHealth > 0);
        let progressValue;

        if (this._scene.player.currentHealth <= 0) {
            progressValue = 0;
        } else {
            progressValue = this._scene.player.currentHealth/this._scene.player.maxHealth;
        }

        const cutWidth = this._healthBarFill.width * Math.max(0, Math.min(1, progressValue));

        if (isForce) {
            return this._onUpdateComplete(cutWidth);
        }

        return this._tweenUpdate(cutWidth);
    }

    _onUpdateComplete(cutWidth) {
        this._healthBarFill.setCrop(0, 0, cutWidth, this._healthBarFill.height);
    }

    async _tweenUpdate(cutWidth) {
        const duration = 150;
        const increaseValue = 1.15;

        await tweenPromise(this._scene, {
            targets: this,
            scale: DEFAULT_SCALE * increaseValue,
            ease: 'Power2.in',
            duration,
            onComplete: () => this._onUpdateComplete(cutWidth)
        });

        await tweenPromise(this._scene, {
            targets: this,
            scale: DEFAULT_SCALE,
            ease: 'Power2.out',
            duration: duration * 0.75,
        });
    }

    _add() {
        this.add([
            this._healthBar,
            this._healthBarFill,
            this._heartIcon,
        ])
        this._scene.add.existing(this);
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
