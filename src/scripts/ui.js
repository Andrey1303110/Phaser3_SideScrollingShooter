import { screenData } from './Utils';

export const UI = {
    font: 'Arial',
    type: { title: 24, section: 20, body: 17, button: 16, caption: 13, dialogue: 23 },
    dialogueButtonSize: 64,
    buttonHeight: 44,
    gap: 12,
    padding: 16,
    radius: 10,
    panelRadius: 14,
    colors: {
        panel: 0x203a38, border: 0x48635b, primary: 0x367e56, primaryPressed: 0x448e60,
        secondary: 0x27433f, secondaryPressed: 0x345451,
        danger: 0xa34537, dangerPressed: 0xb65546, disabled: 0x2b3e3e,
        text: '#f3eddd', muted: '#adc2b4', disabledText: '#85978e', accent: '#e4c284',
    },
};

export const uiUnit = () => screenData.width / document.body.clientWidth;

export function uiText(size = UI.type.body, color = UI.colors.text) {
    return { fontFamily: UI.font, fontSize: size * uiUnit(), color };
}

export function createButton(scene, { x, y, width, height = UI.buttonHeight * uiUnit(), text,
    onPress, parent, variant = 'secondary', enabled = true, canPress = () => true,
    fontSize = UI.type.button }) {
    const u = uiUnit();
    const root = scene.add.container(x, y);
    if (parent) parent.add(root);
    const background = scene.add.graphics();
    const label = scene.add.text(0, 0, text, uiText(fontSize)).setOrigin(0.5);
    const hitArea = scene.add.zone(0, 0, width, height).setInteractive({ useHandCursor: true });
    root.add([background, label, hitArea]);
    let pointerId = null;
    let selected = false;
    const draw = (pressed = false) => {
        const style = selected ? 'primary' : variant;
        const color = !enabled ? UI.colors.disabled : UI.colors[style + (pressed ? 'Pressed' : '')];
        background.clear().fillStyle(color).lineStyle(u, UI.colors.border, 0.9)
            .fillRoundedRect(-width / 2, -height / 2, width, height, UI.radius * u)
            .strokeRoundedRect(-width / 2, -height / 2, width, height, UI.radius * u);
        label.setColor(enabled ? UI.colors.text : UI.colors.disabledText);
    };
    const fit = () => {
        label.setFontSize(fontSize * u);
        if (label.width > width - 24 * u) label.setFontSize(fontSize * u * (width - 24 * u) / label.width);
    };
    const control = {
        root, background, label, hitArea,
        setEnabled(value) {
            enabled = value;
            pointerId = null;
            hitArea.input.enabled = enabled;
            draw();
            return control;
        },
        setText(value) { label.setText(value); fit(); return control; },
        setSelected(value) { selected = value; draw(); return control; },
    };
    hitArea.on('pointerdown', pointer => {
        if (!enabled || !canPress()) return;
        pointerId = pointer.id;
        draw(true);
    });
    hitArea.on('pointerout', () => { pointerId = null; draw(); });
    hitArea.on('pointerup', pointer => {
        if (pointerId !== pointer.id || !enabled || !canPress()) return;
        pointerId = null;
        draw();
        onPress();
    });
    fit();
    control.setEnabled(enabled);
    return control;
}

export function createBackArrow(scene, { parent, canPress = () => true } = {}) {
    const u = uiUnit();
    const root = scene.add.container(screenData.left + 24 * u, screenData.top + 24 * u);
    if (parent) parent.add(root);
    const icon = scene.add.image(0, 0, 'return');
    icon.setScale(24 * u / icon.height).setAlpha(0.9);
    const hitArea = scene.add.zone(0, 0, 44 * u, 44 * u).setInteractive({ useHandCursor: true });
    root.add([icon, hitArea]);
    let pointerId = null;
    hitArea.on('pointerdown', pointer => { if (canPress()) pointerId = pointer.id; });
    hitArea.on('pointerout', () => { pointerId = null; });
    hitArea.on('pointerup', pointer => {
        if (pointerId !== pointer.id || !canPress()) return;
        pointerId = null;
        scene._onReturnButtonClick();
    });
    return { root, icon, hitArea };
}
