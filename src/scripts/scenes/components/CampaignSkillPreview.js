import { FRAME_KEYS, TEXTURE_KEYS } from '../../identifiers';
import { dragonMouth, drawSkillBeam, drawSkillBurst, drawSkillShield } from '../../skillEffects';
import { uiText, uiUnit } from '../../ui';

const ORANGE = 0xffab58;
const GREEN = 0x74dd9a;
const BLUE = 0x77e7ff;
const clamp = value => Math.max(0, Math.min(1, value));

export function coverSkillArt(scene, x, y, width, height) {
    const art = scene.add.image(x + width / 2, y + height / 2, TEXTURE_KEYS.SKILL_PREVIEW_BG);
    const scale = Math.max(width / art.width, height / art.height);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    return art.setScale(scale).setCrop((art.width - cropWidth) / 2, (art.height - cropHeight) / 2, cropWidth, cropHeight);
}

function drawBolt(graphics, x, y, radius, angle, color) {
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    graphics.lineStyle(radius, color, 0.22).lineBetween(x - 5 * dx, y - 5 * dy, x, y);
    graphics.lineStyle(radius * 0.5, color, 0.82).lineBetween(x - 3 * dx, y - 3 * dy, x, y);
    graphics.fillStyle(color, 0.34).fillCircle(x, y, radius);
    graphics.fillStyle(0xffffd8).fillCircle(x, y, radius * 0.48);
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
    const end = 0.91;
    const pathY = (fraction, direction) => mouthY + direction * 0.27 * (fraction - start) / (end - start);
    const placements = isVolley ? [-1, 1].flatMap(direction => {
        const distances = skill === 'DOUBLE_PIERCE' ? [0.55, 0.82] : [0.78];
        return distances.map(fraction => ({ fraction, vertical: pathY(fraction, direction) }));
    }) : isShield ? [] : [{ fraction: 0.79, vertical: mouthY }];
    const targets = placements.map(spot => {
        const jet = scene.add.sprite(px(spot.fraction), py(spot.vertical), TEXTURE_KEYS.JET, '1');
        return { ...spot, jet: jet.setScale(Math.min(scale * 0.34, width * 0.19) / jet.width) };
    });
    const missile = isShield ? scene.add.image(px(end), py(0.55), TEXTURE_KEYS.ROCKET) : null;
    if (missile) missile.setScale(Math.min(width * 0.16, scale * 0.28) / missile.width);
    const fx = scene.add.graphics();
    if (!isShield && !isVampirism) scene.children.moveBelow(fx, dragon);
    const note = isExperience || isVampirism
        ? scene.add.text(px(0.72), py(0.36), '', uiText(15 * textScale, isExperience ? '#ffd58a' : '#96ffba')).setOrigin(0.5)
        : null;
    const state = { time: 0 };
    function render() {
        const time = state.time;
        const dragonY = py(0.55) + Math.sin(time * Math.PI * 8) * scale * 0.022;
        dragon.setY(dragonY).setFrame('dragon' + (1 + Math.floor(time * 24) % 6));
        const emission = dragonMouth(dragon);
        fx.clear();

        if (isVolley) {
            const progress = clamp((time - 0.12) / 0.68);
            const fraction = start + (end - start) * progress;
            if (progress > 0 && progress < 1) {
                for (const direction of [-1, 1]) {
                    const shot = at(fraction, pathY(fraction, direction));
                    drawBolt(fx, shot.x, shot.y, scale * 0.06 * Math.min(1, progress * 10), direction * 0.32, ORANGE);
                }
            }
            for (const target of targets) {
                const hit = 0.12 + (target.fraction - start) / (end - start) * 0.68;
                target.jet.setVisible(time < hit);
                drawSkillBurst(fx, target.jet.x, target.jet.y, scale * 0.12, (time - hit) / 0.22, ORANGE);
            }
        } else if (isBeam) {
            const active = time >= 0.54 && time < 0.82;
            const strength = active ? 1 - (time - 0.54) / 0.28 : 0;
            const target = targets[0].jet;
            target.setVisible(time < 0.54);
            if (time < 0.54) {
                fx.fillStyle(ORANGE, time * 0.9).fillCircle(emission.x, emission.y, scale * (0.02 + time * 0.05));
            }
            drawSkillBeam(fx, emission.x, emission.y, px(end) - emission.x, scale * 0.16, strength);
            drawSkillBurst(fx, target.x, target.y, scale * 0.18, (time - 0.54) / 0.28, ORANGE);
        } else if (isShield) {
            const hit = 0.62;
            const radius = scale * 0.22;
            missile.setVisible(time < hit).setX(px(end - (end - 0.34) * clamp(time / hit)));
            if (time < hit) drawSkillShield(fx, dragon.x, dragonY, dragonWidth * 1.25, radius * 1.85, 0.85);
            drawSkillBurst(fx, px(0.34), dragonY, radius, (time - hit) / 0.34, BLUE);
        } else {
            const hits = isVampirism ? 4 : 1;
            const round = Math.min(hits - 1, Math.floor(time * hits));
            const sub = time * hits - round;
            const hit = round === hits - 1 ? 0.52 : 0.72;
            const target = targets[0].jet;
            target.setVisible(sub < hit).setX(px(0.87 - 0.14 * Math.min(sub, hit)));
            if (sub < hit) drawBolt(fx, px(start + 0.46 * sub / hit), emission.y, scale * 0.055 * Math.min(1, sub * 16), 0, ORANGE);
            drawSkillBurst(fx, target.x, target.y, scale * 0.14, (sub - hit) / 0.45, ORANGE);
            const paid = round === hits - 1 && sub >= hit;
            if (isVampirism) {
                fx.fillStyle(0x102427).fillRoundedRect(px(0.10), py(0.83), width * 0.25, 5 * unit, 2 * unit);
                fx.fillStyle(GREEN).fillRoundedRect(px(0.10), py(0.83),
                    width * (paid ? 0.18 : 0.155), 5 * unit, 2 * unit);
                for (let i = 0; i < hits; i++) {
                    fx.fillStyle(i < round + Number(sub >= hit) ? GREEN : 0x406358)
                        .fillCircle(px(0.58 + i * 0.08), py(0.85), 2.5 * unit);
                }
                if (paid) drawSkillBurst(fx, dragon.x, dragonY, scale * 0.24, (sub - hit) / 0.48, GREEN);
            }
            note.setVisible(paid).setText(isVampirism ? '+10%' : '100 → 200 ' + xpLabel);
        }
        fx.fillStyle(color, 0.78).fillRect(x, y + height - 2 * unit, width * time, 2 * unit);
    }
    render();
    scene.tweens.add({ targets: state, time: 1, duration: isVampirism ? 4400 : 2800,
        repeat: -1, repeatDelay: 240, onUpdate: render });
}
