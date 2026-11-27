// Offline art tooling. Run with Node and sharp available.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

// Source crop, destination position and size on the shared texture.
const parts = {
    volley:  [[0, 52, 537, 264],    [3, 3, 160, 64]],
    pierce:  [[540, 75, 546, 208],  [168, 3, 160, 64]],
    beam:    [[23, 377, 590, 182],  [3, 72, 500, 116]],
    impact:  [[636, 298, 400, 310], [333, 193, 160, 136]],
    shield:  [[60, 593, 455, 450],  [3, 193, 220, 220]],
    shatter: [[557, 594, 516, 425], [228, 334, 180, 154]],
    siphon:  [[24, 1030, 504, 407], [3, 418, 210, 178]],
    xp:      [[621, 1053, 375, 301], [228, 493, 112, 92]],
    mote:    [[151, 1052, 46, 44],  [345, 493, 28, 28]],
};

const clamp = x => Math.min(1, Math.max(0, x));
async function pack() {
    const layers = [];
    const frames = {};
    for (const [name, [crop, destination]] of Object.entries(parts)) {
        const [left, top, width, height] = crop;
        const [x, y, w, h] = destination;
        const pixels = await sharp(path.join(__dirname, 'effects.png'))
            .extract({ left, top, width, height }).resize(w, h, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                // Roll off painted glows before the edge of each atlas frame.
                const edge = Math.min(col, w - col - 1, row, h - row - 1);
                let opacity = clamp(edge / Math.max(2, Math.min(w, h) * 0.095));
                if (name === 'shield') {
                    const radius = Math.hypot((col / w - 0.49) * 2, (row / h - 0.50) * 2);
                    opacity *= 0.10 + 0.90 * clamp((radius - 0.43) / 0.36);
                }
                if (name === 'mote') {
                    opacity *= clamp(1 - Math.hypot(col / (w - 1) - 0.5, row / (h - 1) - 0.5) * 2);
                }
                pixels[(row * w + col) * 4 + 3] *= opacity;
            }
        }
        layers.push({ input: await sharp(pixels, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer(), left: x, top: y });
        frames[name] = { frame: { x, y, w, h }, rotated: false, trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w, h }, sourceSize: { w, h } };
    }
    const folder = path.resolve(__dirname, '../../../src/assets/sprites');
    await sharp({ create: { width: 508, height: 600, channels: 4, background: '#00000000' } })
        .composite(layers).png({ compressionLevel: 9 }).toFile(path.join(folder, 'skill_fx.png'));
    await fs.writeFile(path.join(folder, 'skill_fx.json'), JSON.stringify({ frames }, null, 2) + '\n');
}

pack().catch(error => { console.error(error); process.exitCode = 1; });
