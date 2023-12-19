import { config } from "/src/scripts/main";

export class DialogBox {
    constructor (scene, dialogueData) {
        this._scene = scene;

        this._createDialog(dialogueData);
        this._setInitPosition();
    }

    async showEnter() {
        await new Promise(resolve => {
            this._elements.forEach(element => {
                this._scene.scene.tweens.add({
                    targets: element,
                    x: element.x + config.width,
                    ease: 'Power1',
                    duration: 750,
                    onComplete: () => resolve()
                });
            })
        });
    }

    async showExit() {
        await new Promise(resolve => {
            this._elements.forEach(element => {
                this._scene.scene.tweens.add({
                    targets: element,
                    x: element.x - config.width,
                    ease: 'Power2',
                    duration: 450,
                    onComplete: () => resolve()
                });
            })
        });
    }

    _setInitPosition() {
        this._elements = [ this._bg, this._person, this._text ];
        this._elements.forEach(object => object.x -= config.width);
    }

    _createDialog(dialogueData) {
        this._createBg();
        this._createPerson(dialogueData);
        this._createText(dialogueData);
    }

    _createBg() {
        this._bg = this._scene.scene.add.rectangle(config.width * 0.5, config.height * 0.7, config.width * 0.85, config.height * 0.35, '0x000000', 0.55);
    }

    _createPerson(data) {
        const { image } = data;

        this._person = this._scene.scene.add.sprite(this._bg.x, this._bg.y, image).setAlpha(1).setOrigin(.5);
        this._person.y = this._bg.y - (this._person.height - this._bg.height)/2;
        this._person.x = this._bg.x - this._bg.width/2 + this._person.width/4;
    }

    _createText(data) {
        const { text } = data;

        const fontSize = config.width * .022;
        const speechPadding = fontSize * 1.35;

        const personEndPointX = this._person.x + this._person.width/2;
        const bgEndPointX = this._bg.x + this._bg.width/2;

        const content = this._scene.scene.add.text(0, 0, text, { 
            fontFamily: 'DishOut',
            fontSize,
            lineSpacing: fontSize * 0.45,
            color: '#A0A0A0',
            align: 'left',
            wordWrap: { width: (bgEndPointX - personEndPointX) - speechPadding * 2 } 
        });

        while (content.height + speechPadding > this._bg.height) content.setFontSize(content.style.metrics.fontSize * 0.95);

        content.setPosition(this._bg.x + speechPadding + this._person.width * 1/4, this._bg.y);
        content.setOrigin(0.5);

        this._text = content;
    }
}
