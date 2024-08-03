import { config } from "../main";

export class HealthBar extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);

        this._scene = scene;

        this._init();
        this._create();
        this._add();
    }

    updateHealthBar(){
        // TODO add tween to update
        let progressValue;

        if (config.Player.currentHealth <= 0) {
            progressValue = 0;
        } else {
            progressValue = config.Player.currentHealth/config.Player.maxHealth;
        }

        let cutWidth = this._healthBarFill.displayWidth * progressValue;

        if (cutWidth < 0 || !cutWidth) {
            cutWidth = this._healthBarFill.displayWidth;
            this.visible = false;
        }

        this._healthBarFill.frame.cutWidth = cutWidth;
        this._healthBarFill.frame.updateUVs();
    }

    _add() {
        this.add([
            this._healthBar,
            this._healthBarFill,
            this._heartIcon,
        ])
    }

    _init() {
        this.setScale(0.4);
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

        this.updateHealthBar();
    }

    _createHeartIcon(){
        this._heartIcon = this._scene.add.sprite(this._healthBar.x - this._healthBar.width * 0.53, this._healthBar.y, 'life_icon')
            .setAlpha(0.95);
    }

    reset() {}
}