import { TEXTURE_KEYS } from './identifiers';

// All age forms share this lower-lip anchor in their 306 × 238 atlas frames.
export function dragonMouth(sprite) {
    return {
        x: sprite.x + (261 / 306 - sprite.originX) * sprite.displayWidth,
        y: sprite.y + (122 / 238 - sprite.originY) * sprite.displayHeight,
    };
}

const clamp = value => Math.max(0, Math.min(1, value));

export function skillImage(scene, frame) {
    return scene.add.image(0, 0, TEXTURE_KEYS.SKILL_FX, frame);
}

export function createSkillBeam(scene) {
    return scene.add.container(0, 0, [skillImage(scene, 'beam').setOrigin(0, 0.52), skillImage(scene, 'impact')]);
}

export function poseSkillBeam(beam, x, y, length, width, strength, charge = 0) {
    beam.setPosition(x, y).setVisible(length > 0 && (strength > 0 || charge > 0));
    const [stream, flare] = beam.list;
    stream.setVisible(strength > 0).setDisplaySize(Math.max(1, length), width * (1.1 + 2.1 * strength))
        .setAlpha(Math.sqrt(strength));
    const flash = Math.max(charge * 0.65, strength);
    flare.setDisplaySize(width * (0.3 + 2.6 * flash), width * (0.3 + 2 * flash)).setAlpha(flash);
}

export function poseSkillPulse(sprite, x, y, width, progress) {
    sprite.setVisible(progress >= 0 && progress < 1);
    if (!sprite.visible) return;
    const p = progress;
    const ease = 1 - (1 - p) ** 2;
    const isXp = sprite.frame.name === 'xp';
    const isShatter = sprite.frame.name === 'shatter';
    const size = isXp ? 0.8 + ease * 0.2 : 0.32 + ease * (isShatter ? 1.1 : 0.85);
    sprite.setPosition(x, y - (isXp ? width * 0.4 * ease : 0)).setScale(width * size / sprite.width)
        .setRotation(isShatter ? ease * 0.22 : 0).setAlpha(1 - p * p);
}

function playEffect(scene, effect, duration, paint) {
    const state = { progress: 0 };
    paint(0);
    scene.tweens.add({ targets: state, progress: 1, duration,
        onUpdate: () => paint(state.progress), onComplete: () => effect.destroy() });
    return effect;
}

export function playSkillPulse(scene, frame, x, y, width, duration, depth) {
    const sprite = skillImage(scene, frame).setDepth(depth);
    return playEffect(scene, sprite, duration, progress => poseSkillPulse(sprite, x, y, width, progress));
}

export function createLifeDrain(scene) {
    return scene.add.container(0, 0, [skillImage(scene, 'siphon'),
        skillImage(scene, 'mote'), skillImage(scene, 'mote'), skillImage(scene, 'mote')]);
}

export function poseLifeDrain(effect, fromX, fromY, toX, toY, width, progress) {
    effect.setVisible(progress >= 0 && progress < 1);
    if (!effect.visible) return;
    const [swirl, ...motes] = effect.list;
    const arrival = clamp((progress - 0.30) / 0.70);
    swirl.setPosition(toX, toY).setScale(width * (1.12 - arrival * 0.34) / swirl.width)
        .setRotation(arrival * 1.75).setAlpha(Math.sin(Math.PI * arrival));
    motes.forEach((mote, index) => {
        const t = (progress - index * 0.09) / 0.63;
        mote.setVisible(t >= 0 && t <= 1);
        if (!mote.visible) return;
        const arc = Math.sin(Math.PI * t);
        mote.setPosition(fromX + (toX - fromX) * t, fromY + (toY - fromY) * t - arc * width * (0.23 + index * 0.12))
            .setScale(width * (0.12 + arc * 0.1) / mote.width).setAlpha(0.5 + arc * 0.5);
    });
}

export function playLifeDrain(scene, fromX, fromY, player, duration, depth) {
    const effect = createLifeDrain(scene).setDepth(depth);
    return playEffect(scene, effect, duration, progress => {
        if (player.active) poseLifeDrain(effect, fromX, fromY, player.x, player.y, player.displayWidth * 1.22, progress);
        else effect.setVisible(false);
    });
}
