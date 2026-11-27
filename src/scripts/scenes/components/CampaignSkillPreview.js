import { FRAME_KEYS, TEXTURE_KEYS } from '../../identifiers';
import { CAMPAIGN_SKILL_BALANCE } from '../../campaignSkills';
import { WEAPONS } from '../../constants';
import { createLifeDrain, createSkillBeam, dragonMouth, poseLifeDrain, poseSkillBeam, poseSkillPulse, skillImage } from '../../skillEffects';
import { uiText, uiUnit } from '../../ui';

const GREEN = 0x74dd9a;
const clamp = value => Math.max(0, Math.min(1, value));

export function coverSkillArt(scene, x, y, width, height) {
    const art = scene.add.image(x + width / 2, y + height / 2, TEXTURE_KEYS.SKILL_PREVIEW_BG);
    const scale = Math.max(width / art.width, height / art.height);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    return art.setScale(scale).setCrop((art.width - cropWidth) / 2, (art.height - cropHeight) / 2, cropWidth, cropHeight);
}

export function renderCampaignSkillPreview(scene, { x, y, width, height, skill, color, label, xpLabel, unit }) {
    if (height < 26 * unit) return;
    coverSkillArt(scene, x, y, width, height);
    const shade = scene.add.graphics();
    const textScale = unit / uiUnit();
    shade.fillStyle(0x091619, 0.16).fillRect(x, y, width, height);
    shade.fillStyle(0x091619, 0.6).fillRect(x, y, width, 20 * unit);
    shade.lineStyle(unit, color, 0.58).strokeRect(x, y, width, height);
    scene.add.text(x + 7 * unit, y + 3 * unit, label, uiText(12 * textScale, '#e3d8bd'));

    const px = value => x + width * value;
    const py = value => y + height * value;
    const scale = Math.min(height, width * 0.45);
    const dragon = scene.add.sprite(px(0.19), py(0.55), TEXTURE_KEYS.DRAGON, FRAME_KEYS.DRAGON1);
    const dragonWidth = Math.min(width * 0.25, height * 0.55);
    dragon.setScale(dragonWidth / dragon.width);
    const at = (fraction, vertical) => ({ x: px(fraction), y: py(vertical) });
    const isVolley = skill === 'DOUBLE_FIRE' || skill === 'DOUBLE_PIERCE';
    const isShield = skill === 'SHIELD';
    const isVampirism = skill === 'VAMPIRISM';
    const isExperience = skill === 'DOUBLE_XP';
    const isBeam = skill === 'BEAM';
    const mouth = dragonMouth(dragon);
    const start = (mouth.x - x) / width;
    const mouthY = (mouth.y - y) / height;
    const slope = Math.tan(CAMPAIGN_SKILL_BALANCE.doubleFireAngle) * width / height;
    const end = isVolley ? Math.min(0.91, start + 0.30 / slope) : 0.91;
    const pathY = (fraction, direction) => mouthY + direction * slope * (fraction - start);
    const placements = isVolley ? [-1, 1].flatMap(direction => {
        const distances = skill === 'DOUBLE_PIERCE' ? [0.55, 0.82] : [0.78];
        return distances.map(distance => {
            const fraction = start + (end - start) * distance;
            return { fraction, vertical: pathY(fraction, direction) };
        });
    }) : isShield ? [] : [{ fraction: 0.79, vertical: mouthY }];
    const targets = placements.map(spot => {
        const jet = scene.add.sprite(px(spot.fraction), py(spot.vertical), TEXTURE_KEYS.JET, '1');
        jet.setScale(Math.min(scale * 0.34, width * 0.19) / jet.width);
        return { ...spot, jet, impact: skillImage(scene, 'impact') };
    });
    const missile = isShield ? scene.add.image(px(end), py(0.55), TEXTURE_KEYS.ROCKET) : null;
    if (missile) missile.setScale(Math.min(width * 0.16, scale * 0.28) / missile.width);
    const bolts = isVolley ? [-1, 1].map(direction => {
        const image = skillImage(scene, skill === 'DOUBLE_PIERCE' ? 'pierce' : 'volley').setOrigin(0.82, 0.5)
            .setRotation(direction * CAMPAIGN_SKILL_BALANCE.doubleFireAngle);
        scene.children.moveBelow(image, dragon);
        return { image, direction };
    }) : [];
    const beam = isBeam ? createSkillBeam(scene) : null;
    if (beam) scene.children.moveBelow(beam, dragon);
    const shield = isShield ? skillImage(scene, 'shield').setDisplaySize(dragonWidth * 1.35, dragonWidth * 1.1) : null;
    const shards = isShield ? skillImage(scene, 'shatter') : null;
    const drain = isVampirism ? createLifeDrain(scene) : null;
    const xp = isExperience ? skillImage(scene, 'xp') : null;
    const single = isVolley || isVampirism || isExperience ? scene.add.image(0, 0, TEXTURE_KEYS.FIRE) : null;
    const trail = single ? scene.add.particles(0, 0, TEXTURE_KEYS.EXPLOSION_PARTICLE, {
        ...WEAPONS.FIRE.particlesSetting, emitting: false, lifespan: { min: 60, max: 180 },
        speedX: { min: -scale * 0.32, max: 0 }, speedY: { min: -scale * 0.09, max: scale * 0.09 },
        scale: { start: scale * 0.11 / scene.textures.getFrame(TEXTURE_KEYS.EXPLOSION_PARTICLE).width, end: 0 },
    }) : null;
    if (single) {
        scene.children.moveBelow(trail, dragon);
        scene.children.moveBelow(single, dragon);
        single.setScale(scale * 0.09 / single.width);
    }
    const fx = scene.add.graphics();
    const note = isExperience || isVampirism
        ? scene.add.text(px(0.72), py(0.36), '', uiText(15 * textScale, isExperience ? '#ffd58a' : '#96ffba')).setOrigin(0.5)
        : null;
    const state = { time: 0 };
    function render() {
        const time = state.time;
        const dragonY = py(0.55) + Math.sin(time * Math.PI * 8) * scale * 0.022;
        dragon.setY(dragonY).setFrame('dragon' + (1 + Math.floor(time * 48) % 12));
        const emission = dragonMouth(dragon);
        fx.clear();

        if (isVolley) {
            const straight = clamp((time - 0.04) / 0.36);
            single.setVisible(straight > 0 && straight < 1).setPosition(px(start + (0.93 - start) * straight), py(mouthY));
            if (single.visible) trail.emitParticleAt(single.x, single.y, 2);
            const progress = clamp((time - 0.49) / 0.40);
            const fraction = start + (end - start) * progress;
            for (const { image, direction } of bolts) {
                const shot = at(fraction, pathY(fraction, direction));
                image.setVisible(progress > 0 && progress < 1).setPosition(shot.x, shot.y)
                    .setScale(scale * 0.40 * Math.min(1, progress * 10) / image.width);
            }
            for (const target of targets) {
                const hit = 0.49 + (target.fraction - start) / (end - start) * 0.40;
                target.jet.setVisible(time < hit);
                poseSkillPulse(target.impact, target.jet.x, target.jet.y, scale * 0.32, (time - hit) / 0.22);
            }
        } else if (isBeam) {
            const active = time >= 0.54 && time < 0.82;
            const strength = active ? 1 - (time - 0.54) / 0.28 : 0;
            const target = targets[0].jet;
            target.setVisible(time < 0.54);
            poseSkillBeam(beam, emission.x, emission.y, px(end) - emission.x, scale * 0.12, strength, time < 0.54 ? time / 0.54 : 0);
            poseSkillPulse(targets[0].impact, target.x, target.y, scale * 0.46, (time - 0.54) / 0.28);
        } else if (isShield) {
            const hit = 0.62;
            const rim = dragon.x + shield.displayWidth * 0.42;
            missile.setVisible(time < hit).setX(px(end) + (rim - px(end)) * clamp(time / hit));
            shield.setVisible(time < hit).setPosition(dragon.x, dragonY).setAlpha(0.88 + 0.1 * Math.sin(time * Math.PI * 4));
            poseSkillPulse(shards, dragon.x, dragonY, shield.displayWidth, (time - hit) / 0.34);
        } else {
            const hits = isVampirism ? 4 : 1;
            const round = Math.min(hits - 1, Math.floor(time * hits));
            const sub = time * hits - round;
            const hit = round === hits - 1 ? 0.52 : 0.72;
            const target = targets[0].jet;
            target.setVisible(sub < hit).setX(px(0.87 - 0.14 * Math.min(sub, hit)));
            const progress = clamp(sub / hit);
            const distance = progress * (0.3 + 0.7 * progress);
            single.setVisible(sub < hit).setPosition(emission.x + (target.x - emission.x) * distance,
                emission.y + (target.y - emission.y) * distance).setAlpha(Math.min(1, progress * 8));
            if (single.visible && progress > 0) trail.emitParticleAt(single.x, single.y, 2);
            poseSkillPulse(targets[0].impact, target.x, target.y, scale * 0.32, (sub - hit) / 0.45);
            const paid = round === hits - 1 && sub >= hit;
            if (isVampirism) {
                fx.fillStyle(0x102427).fillRoundedRect(px(0.10), py(0.83), width * 0.25, 5 * unit, 2 * unit);
                fx.fillStyle(GREEN).fillRoundedRect(px(0.10), py(0.83),
                    width * (paid ? 0.18 : 0.155), 5 * unit, 2 * unit);
                for (let i = 0; i < hits; i++) {
                    fx.fillStyle(i < round + Number(sub >= hit) ? GREEN : 0x406358)
                        .fillCircle(px(0.58 + i * 0.08), py(0.85), 2.5 * unit);
                }
                poseLifeDrain(drain, target.x, target.y, dragon.x, dragonY, dragonWidth * 1.18, paid ? (sub - hit) / 0.48 : -1);
            }
            if (isExperience) poseSkillPulse(xp, px(0.58), py(0.58), scale * 0.3, (sub - hit) / 0.48);
            note.setVisible(paid).setText(isVampirism ? '+10%' : '100 → 200 ' + xpLabel);
        }
        fx.fillStyle(color, 0.78).fillRect(x, y + height - 2 * unit, width * time, 2 * unit);
    }
    render();
    scene.tweens.add({ targets: state, time: 1, duration: isVampirism ? 4400 : 2800,
        repeat: -1, repeatDelay: 240, onUpdate: render });
}
