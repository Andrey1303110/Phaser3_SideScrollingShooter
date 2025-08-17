export class RoundedRectContainer extends Phaser.GameObjects.Container {
    constructor(scene, data) {
        super(scene, data.x, data.y);

        this._scene = scene;
        this._width = 0;
        this._height = 0;

        this.create(data);
    }

    create(data) {
        const { width, height, radius, fillColor, fillAlpha } = data;

        this._width = width;
        this._height = height;
        const graphics = this._scene.add.graphics();
        graphics.fillStyle(fillColor, fillAlpha);
        graphics.fillRoundedRect(0, 0, width, height, radius);
        this.add(graphics);
        this._scene.add.existing(this);
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }
}
