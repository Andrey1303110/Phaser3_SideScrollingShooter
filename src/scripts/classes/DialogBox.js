import { Resolver } from '../Resolver';
import { DEPTH_LAYERS } from '../constants';
import { config, getFont, screenData } from '../main';
import { RoundedRectContainer } from './RoundedRectContaier';

export class DialogBox {
    constructor (scene, dialogueData) {
        this._scene = scene;

        this._resolver = new Resolver();

        this._createDialog(dialogueData);
        this._setInitPosition();
    }

    async showEnter() {
        await new Promise(resolve => {
            this._elements.forEach(element => {
                this._scene.tweens.add({
                    targets: element,
                    x: element.x + config.width,
                    ease: 'Cubic.easeOut',
                    duration: 625,
                    onStart: () => this._showSkipButton(),
                    onComplete: () => resolve()
                });
            });
        });
    }

    async showExit() {
        await new Promise(resolve => {
            this._elements.forEach(element => {
                this._scene.tweens.add({
                    targets: element,
                    x: element.x - config.width,
                    ease: 'Cubic.easeIn',
                    duration: 425,
                    onStart: () => this._hideSkipButton(),
                    onComplete: () => resolve()
                });
            });
        });
    }

    get resolver() {
        return this._resolver;
    }

    _setInitPosition() {
        this._elements = [this._bg, this._person, this._text];
        this._elements.forEach(object => object.x -= config.width);
    }

    _createDialog(dialogueData) {
        this._createSpeechBg();
        this._createPerson(dialogueData);
        this._createText(dialogueData);
        this._createSkipButton();
    }

    _createSpeechBg() {
        const padding = config.width * 0.08;
        const width = screenData.width - padding * 2;
        const height = config.height * 0.55;
        const x = screenData.left + padding;
        const y = screenData.bottom - height;
        const radius = width * 0.025;
        const fillColor = 0x000000;
        const fillAlpha = 0.6;

        this._bg = new RoundedRectContainer(this._scene, { width, height, radius, fillColor, fillAlpha });
        this._bg.setPosition(x, y);
    }

    _createSkipButton() {
        const y = this._bg.y + this._bg.height * 0.5;

        this._skipButton = this._scene.add.image(screenData.right, y, 'next')
            .setAlpha(0)
            .setOrigin(1, 0.5)
            .setDepth(DEPTH_LAYERS.DIALOGUES)
            .on('pointerdown', () => this._skipDialog());
    }

    _createPerson({ image }) {
        const { width } = this._scene.textures.getFrame('president');
    
        const x = this._bg.x + width * 0.25;
        const y = this._bg.y + this._bg.height;

        this._person = this._scene.add.image(x, y, image).setDepth(DEPTH_LAYERS.DIALOGUES).setOrigin(0.5, 1);
    }

    _createText(data) {
        const { text } = data;

        const fontSize = config.width * .037;
        const vertPadding = config.width * .025;
        const horizPadding = config.width * .02;

        const personEndPointX = this._person.x + this._person.width * 0.5;
        const bgEndPointX = this._bg.x + this._bg.width;
        const wordWrapWidth = (bgEndPointX - personEndPointX) - horizPadding * 2;
        const x = this._bg.x + this._bg.width * 0.5 + this._person.width * 0.5 - horizPadding * 0.5;
        const y = this._bg.y + this._bg.height * 0.5;

        let content = this._scene.add.text(0, 0, text, { 
            font: `${fontSize}px ${getFont()}`,
            lineSpacing: fontSize * 0.5,
            color: '#A0A0A0',
            align: 'left',
        }).setDepth(DEPTH_LAYERS.DIALOGUES).setWordWrapWidth(wordWrapWidth);
        
        content = this._resizeContent(content, horizPadding, vertPadding, wordWrapWidth);

        content.setPosition(x, y);
        content.setOrigin(0.5);

        this._text = content;
    }

    _showSkipButton() {
        this._scene.tweens.add({
            targets: this._skipButton,
            alpha: 1,
            ease: 'Power1',
            duration: 250,
            onComplete: () => this._skipButton.setInteractive()
        });
    }

    _hideSkipButton() {
        this._scene.tweens.add({
            targets: this._skipButton,
            alpha: 0,
            ease: 'Power1',
            duration: 150,
            onStart: () => this._skipButton.removeInteractive(),
            onComplete: () => this._skipButton.destroy()
        });
    }

    _skipDialog() {
        this._resolver.resolve();
        this._scene.sounds.click.play({ volume: .2 });
    }

    _resizeContent(content, horizPadding, vertPadding, maxWidth) {
        const oldFontSize = parseFloat(content.style.fontSize);
        const decreasedFontSize = oldFontSize * 0.93;

        content.setFontSize(decreasedFontSize);
        content.setWordWrapWidth(maxWidth);

        if (content.height > this._bg.height - vertPadding || content.width > maxWidth) {
            return this._resizeContent(content, horizPadding, vertPadding, maxWidth);
        }
    
        return content;
    }
}
