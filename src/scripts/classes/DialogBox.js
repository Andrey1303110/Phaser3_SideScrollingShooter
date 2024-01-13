import { config, getFont, screenEndpoints } from '../main';

export class DialogBox {
    constructor (scene, dialogueData) {
        this._scene = scene;
        this._isSkiped = false;

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
                    onStart: () => this._showSkipButton(),
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
                    onStart: () => this._hideSkipButton(),
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
        this._createSkipButton();
    }

    _createBg() {
        const x = config.width * 0.5;
        const y = config.height * 0.72;

        this._bg = this._scene.scene.add.sprite(x, y, 'speechBg');
    }

    _createSkipButton() {
        this._skipButton = this._scene.scene.add.sprite(screenEndpoints.right, this._bg.y, 'next')
            .setAlpha(0)
            .setOrigin(1, 0.5)
            .on('pointerdown', () => console.log('click'));
    }

    _createPerson(data) {
        const { image } = data;

        this._person = this._scene.scene.add.sprite(this._bg.x, this._bg.y, image);
        this._person.y = this._bg.y - (this._person.height - this._bg.height) * 0.5;
        this._person.x = this._bg.x - this._bg.width/2 + this._person.width * 0.2;
    }

    _createText(data) {
        const { text } = data;

        const fontSize = config.width * .025;
        const vPadding = config.width * .03;
        const gPadding = config.width * .03;

        const personEndPointX = this._person.x + this._person.width/2;
        const bgEndPointX = this._bg.x + this._bg.width/2;

        let content = this._scene.scene.add.text(0, 0, text, { 
            font: `${fontSize}px ${getFont()}`,
            lineSpacing: fontSize * 0.4,
            color: '#A0A0A0',
            align: 'left',
            wordWrap: { width: (bgEndPointX - personEndPointX) - gPadding } 
        });
        
        content = this._resizeContent(content, vPadding);

        content.setPosition(this._bg.x + gPadding + this._person.width * 1/4, this._bg.y);
        content.setOrigin(0.5);

        this._text = content;
    }

    _showSkipButton() {
        this._scene.scene.tweens.add({
            targets: this._skipButton,
            alpha: 1,
            ease: 'Power1',
            duration: 250,
            onComplete: () => this._skipButton.setInteractive()
        });
    }

    _hideSkipButton() {
        this._scene.scene.tweens.add({
            targets: this._skipButton,
            alpha: 0,
            ease: 'Power1',
            duration: 150,
            onStart: () => this._skipButton.removeInteractive(),
            onComplete: () => this._skipButton.destroy()
        });
    }

    _resizeContent(content, vPadding) {
        const modifier = (content.height + vPadding) / this._bg.height;
        const oldFontSize = parseFloat(content.style.fontSize);
        const decreasedFontSize = oldFontSize / modifier;
        content.setFontSize(decreasedFontSize);

        if (content.height + vPadding > this._bg.height) this._resizeContent(content, vPadding);

        return content;
    }
}
