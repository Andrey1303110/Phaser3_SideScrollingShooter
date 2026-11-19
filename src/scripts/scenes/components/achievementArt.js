import { TEXTURE_KEYS, resourceKey } from '../../identifiers';

export function drawAchievementArt(scene, parent, entry, x, y, size) {
    const badge = scene.add.image(x, y, TEXTURE_KEYS.ACHIEVEMENT_PATCHES, entry.frame);
    if (entry.location) {
        const key = resourceKey.background(entry.location);
        const texture = scene.textures.get(key);
        const frame = 'achievement-location';
        if (!texture.has(frame)) {
            const { width, height } = texture.getSourceImage();
            const side = Math.min(width, height);
            texture.add(frame, 0, Math.floor((width - side) / 2), Math.floor((height - side) / 2), side, side);
        }
        parent.add(scene.add.image(x, y, key, frame).setDisplaySize(size, size));
        badge.setPosition(x + size * 0.27, y + size * 0.27);
        size *= 0.44;
    }
    parent.add(badge.setDisplaySize(size, size));
}
