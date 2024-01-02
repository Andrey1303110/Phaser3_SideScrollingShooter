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
        const width = config.width * 0.85;
        const height = config.height * 0.4;
        const x = config.width * 0.5;
        const y = config.height * 0.72;
        this._bg = this._scene.scene.add.rectangle(x, y, width, height, '0x000000', 0.675);
    }

    _createPerson(data) {
        const { image } = data;

        this._person = this._scene.scene.add.sprite(this._bg.x, this._bg.y, image).setAlpha(1).setOrigin(.5);
        this._person.y = this._bg.y - (this._person.height - this._bg.height)/2;
        this._person.x = this._bg.x - this._bg.width/2 + this._person.width/5;
    }

    _createText(data) {
        const { text } = data;

        const fontSize = config.width * .025;
        const vPadding = config.width * .01;
        const gPadding = config.width * .03;

        const personEndPointX = this._person.x + this._person.width/2;
        const bgEndPointX = this._bg.x + this._bg.width/2;

        const content = this._scene.scene.add.text(0, 0, text, { 
            fontFamily: 'Comfortaa-Regular',
            fontSize,
            lineSpacing: fontSize * 0.4,
            color: '#A0A0A0',
            align: 'left',
            wordWrap: { width: (bgEndPointX - personEndPointX) - gPadding } 
        });

        if (content.height + vPadding > this._bg.height) {
            const modifier = (content.height + vPadding) / this._bg.height;
            const oldFontSize = parseFloat(content.style.fontSize);
            const decreasedFontSize = oldFontSize / modifier;
            content.setFontSize(decreasedFontSize);
        }

        content.setPosition(this._bg.x + gPadding + this._person.width * 1/4, this._bg.y);
        content.setOrigin(0.5);

        this._text = content;
    }
}
