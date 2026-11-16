const GOLD = 0xffbd61;
const WHITE = 0xfff3ca;

// Atlas frames are 153 × 119; tuck the emission point inside the lower lip.
export function dragonMouth(sprite) {
    return {
        x: sprite.x + (140 / 153 - sprite.originX) * sprite.displayWidth,
        y: sprite.y + (76 / 119 - sprite.originY) * sprite.displayHeight,
    };
}

export function drawSkillBeam(graphics, x, y, length, width, alpha) {
    if (length <= 0 || alpha <= 0) return;
    const taper = Math.min(length, width * 2.5);
    for (const [color, opacity, radius] of [[0xcb4f1d, 0.22, 0.8], [0xff7b35, 0.67, 0.42], [GOLD, 1, 0.22], [WHITE, 1, 0.09]]) {
        const half = width * radius;
        graphics.fillStyle(color, alpha * opacity).beginPath()
            .moveTo(x, y - half * 0.12)
            .lineTo(x + taper, y - half).lineTo(x + length, y - half)
            .lineTo(x + length, y + half).lineTo(x + taper, y + half)
            .lineTo(x, y + half * 0.12).closePath().fillPath();
    }
}

export function drawSkillShield(graphics, x, y, width, height, alpha) {
    graphics.fillStyle(0x39bce9, alpha * 0.14).fillEllipse(x, y, width, height);
    graphics.lineStyle(width * 0.045, 0x33b8f0, alpha * 0.24).strokeEllipse(x, y, width * 1.05, height * 1.05);
    graphics.lineStyle(width * 0.018, 0x77e7ff, alpha * 0.88).strokeEllipse(x, y, width, height);
    graphics.lineStyle(width * 0.013, 0xd7f9ff, alpha).beginPath()
        .arc(x, y, height / 2, -1.23, -0.53).strokePath();
}

export function drawSkillBurst(graphics, x, y, radius, progress, color) {
    if (progress < 0 || progress >= 1) return;
    const opacity = 1 - progress;
    const expansion = radius * (0.2 + progress * 0.8);
    graphics.fillStyle(color, opacity * 0.27).fillCircle(x, y, expansion * 0.8);
    graphics.lineStyle(Math.max(1, radius * 0.055), color, opacity).strokeCircle(x, y, expansion);
    for (let index = 0; index < 8; index++) {
        const angle = index * Math.PI / 4 + 0.15;
        const dx = Math.cos(angle) * expansion;
        const dy = Math.sin(angle) * expansion;
        graphics.lineStyle(Math.max(1, radius * 0.045), WHITE, opacity * 0.8)
            .lineBetween(x + dx * 0.72, y + dy * 0.72, x + dx * 1.25, y + dy * 1.25);
    }
}

export function animateSkillBurst(scene, x, y, radius, color, duration, depth) {
    const sparks = scene.add.graphics().setDepth(depth);
    const state = { progress: 0 };
    scene.tweens.add({
        targets: state, progress: 1, duration,
        onUpdate: () => drawSkillBurst(sparks.clear(), x, y, radius, state.progress, color),
        onComplete: () => sparks.destroy(),
    });
}
