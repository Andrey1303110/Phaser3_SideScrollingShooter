import { Resolver } from '../Resolver';
import { screenData, tweenPromise } from '../Utils';
import { UI, uiUnit, uiText, createButton } from '../ui';
import { DEPTH_LAYERS } from '../constants';
import { config } from '../main';
import { RoundedRectContainer } from './RoundedRectContainer';

export class DialogBox extends Phaser.GameObjects.Container {
    constructor (scene, dialogueData) {
        super(scene);
        this._scene = scene;

        this._resolver = new Resolver();

        this._createDialog(dialogueData);
        this._setInitPosition();
    }

    showEnter() {
        this._showSkipButton();
        return Promise.all(this._elements.map(element =>
            tweenPromise(this._scene, {
                targets: element,
                x: element.x + config.width,
                ease: 'Cubic.easeOut',
                duration: 625,
            })
        ));
    }

    async showExit() {
        this._hideSkipButton();
        await Promise.all(this._elements.map(element =>
            tweenPromise(this._scene, {
                targets: element,
                x: element.x - config.width,
                ease: 'Cubic.easeIn',
                duration: 425,
            })
        ));
        this._elements.forEach(element => element.destroy());
        this.destroy();
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
        const u = uiUnit();
        const width = screenData.width - 24 * u;
        const height = Math.min(280 * u, screenData.height - 24 * u);
        this._bg = new RoundedRectContainer(this._scene, {
            width, height, radius: UI.panelRadius * u,
            fillColor: UI.colors.panel, fillAlpha: 0.98,
        });
        this._bg.setPosition(screenData.left + 12 * u, screenData.bottom - height - 12 * u)
            .setDepth(DEPTH_LAYERS.DIALOGUES);
    }

    _createSkipButton() {
        const u = uiUnit();
        this._skipControl = createButton(this._scene, {
            x: this._bg.x + this._bg.width - 44 * u,
            y: this._bg.y + this._bg.height - 44 * u,
            width: UI.dialogueButtonSize * u, height: UI.dialogueButtonSize * u,
            text: '', enabled: false, onPress: () => this._skipDialog(),
        });
        this._skipControl.root.add(this._scene.add.image(0, 0, 'next').setDisplaySize(36 * u, 36 * u));
        this._skipButton = this._skipControl.root.setAlpha(0).setDepth(DEPTH_LAYERS.DIALOGUES);
    }

    _createPerson({ image }) {
        const u = uiUnit();
        const size = Math.min(150 * u, this._bg.height - 24 * u);
        this._person = this._scene.add.image(this._bg.x + 16 * u + size / 2,
            this._bg.y + this._bg.height, image).setDisplaySize(size, size)
            .setDepth(DEPTH_LAYERS.DIALOGUES).setOrigin(0.5, 1);
    }

    _createText({ text }) {
        const u = uiUnit();
        const left = this._person.x + this._person.displayWidth / 2 + 12 * u;
        const maxWidth = this._bg.x + this._bg.width - left - 88 * u;
        const content = this._scene.add.text(0, 0, text, {
            ...uiText(UI.type.dialogue), lineSpacing: 5 * u, wordWrap: { width: maxWidth },
        }).setDepth(DEPTH_LAYERS.DIALOGUES);
        while (content.height > this._bg.height - 32 * u && parseFloat(content.style.fontSize) > 20 * u) {
            content.setFontSize(parseFloat(content.style.fontSize) - u);
        }
        const height = Math.min(this._bg.height, Math.max(190 * u, content.height + 32 * u));
        this._bg.removeAll(true);
        this._bg.create({ width: this._bg.width, height, radius: UI.panelRadius * u,
            fillColor: UI.colors.panel, fillAlpha: 0.98 });
        this._bg.y = screenData.bottom - height - 12 * u;
        this._person.y = this._bg.y + height;
        content.setPosition(left, this._bg.y + this._bg.height / 2).setOrigin(0, 0.5);
        this._text = content;
    }

    _showSkipButton() {
        return tweenPromise(this._scene, {
            targets: this._skipButton,
            alpha: 1,
            ease: 'Power1',
            duration: 250,
            onComplete: () => this._skipControl.setEnabled(true)
        });
    }

    _hideSkipButton() {
        this._skipControl.setEnabled(false);
        return tweenPromise(this._scene, {
            targets: this._skipButton,
            alpha: 0,
            ease: 'Power1',
            duration: 150,
            onComplete: () => this._skipButton.destroy()
        });
    }

    _skipDialog() {
        this._resolver.resolve();
        this._scene.sounds.click.play({ volume: 0.2 });
    }

}
