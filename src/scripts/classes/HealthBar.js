import { TIMING } from '../timing';
import { TEXTURE_KEYS } from '../identifiers';
import { tweenPromise } from "../Utils";

const DEFAULT_SCALE = 0.44;

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
        this._pendingCutWidth = cutWidth;

        if (isForce) {
            return this._onUpdateComplete(cutWidth);
        }

        return this._tweenUpdate();
    }

    _onUpdateComplete(cutWidth) {
        this._healthBarFill.setCrop(0, 0, cutWidth, this._healthBarFill.height);
    }

    async _tweenUpdate() {
        const duration = TIMING.HEALTH_BAR.TWEEN_UPDATE_DURATION_MS;
        const increaseValue = 1.15;

        await tweenPromise(this._scene, {
            targets: this,
            scale: DEFAULT_SCALE * increaseValue,
            ease: 'Power2.in',
            duration,
        });
        this._onUpdateComplete(this._pendingCutWidth);

        await tweenPromise(this._scene, {
            targets: this,
            scale: DEFAULT_SCALE,
            ease: 'Power2.out',
            duration: duration * TIMING.HEALTH_BAR.TWEEN_UPDATE_DURATION_FACTOR,
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
        this._healthBar = this._scene.add.sprite(0, 0, TEXTURE_KEYS.HEALTH_BAR_EMPTY)
            .setAlpha(0.95);
        this._healthBarFill = this._scene.add.sprite(this._healthBar.x - this._healthBar.width * 0.0185, this._healthBar.y, TEXTURE_KEYS.HEALTH_BAR_FILL)
            .setAlpha(0.95);

        this.updateHealthBar(true);
    }

    _createHeartIcon(){
        this._heartIcon = this._scene.add.sprite(this._healthBar.x - this._healthBar.width * 0.53, this._healthBar.y, TEXTURE_KEYS.LIFE_ICON)
            .setAlpha(0.95);
    }
}
