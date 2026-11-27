// Art tooling only. Run with Node and sharp available, from any directory.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '../../..');
const sprites = path.join(root, 'src/assets/sprites');
const icons = path.join(root, 'src/assets/icons');
const lip = { x: 261, y: 122 };
const scale = 3; // Supersample the moving contours before packing at game resolution.

// Landmarks on flight-parts.png, measured in source pixels. Register the lip,
// tail and soles separately so that the stronger forms occupy the same space.
const forms = [
    { crop: [145, 42, 493, 342], lip: [458, 169], tail: 166, sole: 329 },
    { crop: [726, 18, 1112, 342], lip: [1076, 162], tail: 743, sole: 332 },
    { crop: [145, 350, 553, 715], lip: [521, 496], tail: 161, sole: 701 },
    { crop: [700, 343, 1165, 719], lip: [1130, 496], tail: 718, sole: 711 },
    { crop: [100, 719, 615, 1196], lip: [581, 890], tail: 115, sole: 1181 },
];

// Wrist and outer wing tip, relative to the shoulder in each animation frame.
// The tips lag on the power stroke and the sail folds on the way back up.
const beats = [
    { wrist: [-35, -101], tip: [-137, -88], bow: -3, tail: 3 },
    { wrist: [-43, -78],  tip: [-148, -50], bow: -7, tail: 6 },
    { wrist: [-51, 34],   tip: [-150, 8],   bow: -8, tail: 2 },
    { wrist: [-38, 59],   tip: [-125, 56],  bow: 5,  tail: -5 },
    { wrist: [-46, 39],   tip: [-137, 46],  bow: 8,  tail: -6 },
    { wrist: [-50, -54],  tip: [-141, -21], bow: 6,  tail: -2 },
];

const wingCrop = [635, 768, 1222, 1180];
const wingRoot = [1189, 1147];
const wingWrist = [1086, 858];
const wingTip = [652, 858];
const clamp = value => Math.min(1, Math.max(0, value));

function elderPigment(source, width) {
    const pixels = Buffer.from(source);
    const [left, top, right, bottom] = forms[4].crop;
    for (let y = top; y < bottom; y++) {
        for (let x = left; x < right; x++) {
            const i = (y * width + x) * 4;
            const [r, g, b] = pixels.subarray(i, i + 3);
            // Gold picks out the raised edges of jade armor. Shadowed scales
            // stay deep jade, preserving the painted planes and the outline.
            const jade = clamp((g - r - 12) / 46) * clamp((g - 64) / 95);
            const ridge = clamp((g - 100) / 95);
            pixels[i]     = Math.min(255, r + jade * (35 + 150 * ridge));
            pixels[i + 1] = Math.min(255, g + jade * (14 - 23 * ridge));
            pixels[i + 2] = b * (1 - jade * (0.28 + 0.56 * ridge));
        }
    }
    return pixels;
}

function paintFrame(source, width, frame, form, beat) {
    const outWidth = frame.w * scale;
    const outHeight = frame.h * scale;
    const out = Buffer.alloc(outWidth * outHeight * 4);
    const sx = 188 / (form.lip[0] - form.tail);
    const sy = 100 / (form.sole - form.lip[1]);

    function paint(x, y, u, v, crop, shade, opacity) {
        if (u < crop[0] || v < crop[1] || u >= crop[2] || v >= crop[3]) return;
        const from = (Math.floor(v) * width + Math.floor(u)) * 4;
        const alpha = source[from + 3] / 255 * opacity;
        if (alpha < 0.02) return;
        const to = (y * outWidth + x) * 4;
        const under = out[to + 3] / 255 * (1 - alpha);
        const total = alpha + under;
        for (let channel = 0; channel < 3; channel++) {
            out[to + channel] = (source[from + channel] * shade * alpha + out[to + channel] * under) / total;
        }
        out[to + 3] = Math.round(total * 255);
    }

    function drawWing(far) {
        // Shared shoulder pivots keep the wingspan consistent across upgrades.
        const ox = far ? 176 : 165;
        const oy = far ? 138 : 143;
        const span = far ? 0.78 : 1;
        const wx = beat.wrist[0] * span, tx = beat.tip[0] * span;
        const wy = beat.wrist[1] * (far ? 0.90 : 1) - (far ? 8 : 0);
        const ty = beat.tip[1] * (far ? 0.92 : 1) - (far ? 12 : 0);
        const det = wx * ty - wy * tx;
        for (let x = 0; x < outWidth; x++) {
            const dx = (x + 0.5) / scale - ox;
            const camber = beat.bow * Math.sin(Math.PI * clamp(dx / tx));
            for (let y = 0; y < outHeight; y++) {
                const dy = (y + 0.5) / scale - oy - camber;
                const wristWeight = (dx * ty - dy * tx) / det;
                const tipWeight = (wx * dy - wy * dx) / det;
                const u = wingRoot[0] + wristWeight * (wingWrist[0] - wingRoot[0]) + tipWeight * (wingTip[0] - wingRoot[0]);
                const v = wingRoot[1] + wristWeight * (wingWrist[1] - wingRoot[1]) + tipWeight * (wingTip[1] - wingRoot[1]);
                // The painted wing root tapers into the shoulder scales.
                const opacity = clamp(0.45 + (wingRoot[0] - u + wingRoot[1] - v) / 35);
                paint(x, y, u, v, wingCrop, far ? 0.69 : (wy > 0 ? 0.88 : 1), opacity);
            }
        }
    }

    drawWing(true);
    for (let x = 0; x < outWidth; x++) {
        const dx = (x + 0.5) / scale - lip.x;
        const tailWeight = clamp((-dx - 99) / 89);
        const follow = beat.tail * tailWeight * tailWeight;
        const u = form.lip[0] + dx / sx;
        for (let y = 0; y < outHeight; y++) {
            const v = form.lip[1] + ((y + 0.5) / scale - lip.y - follow) / sy;
            paint(x, y, u, v, form.crop, 1, 1);
        }
    }
    drawWing(false);
    return sharp(out, { raw: { width: outWidth, height: outHeight, channels: 4 } })
        .resize(frame.w, frame.h).png().toBuffer();
}

async function packFlight() {
    const atlas = JSON.parse(await fs.readFile(path.join(sprites, 'dragon.json'), 'utf8'));
    const { data, info } = await sharp(path.join(__dirname, 'flight-parts.png')).raw().toBuffer({ resolveWithObject: true });
    const elder = elderPigment(data, info.width);
    const layers = [];
    for (const { filename, frame } of atlas.frames) {
        const [, row, column] = /^age(\d+)-(\d+)$/.exec(filename);
        const age = Number(row);
        const isElder = age === forms.length;
        const input = await paintFrame(isElder ? elder : data, info.width, frame,
            forms[isElder ? age - 1 : age], beats[Number(column) - 1]);
        layers.push({ input, left: frame.x, top: frame.y });
    }
    await sharp({ create: { width: atlas.meta.size.w, height: atlas.meta.size.h,
        channels: 4, background: '#00000000' } })
        .composite(layers).png({ palette: true, quality: 97, effort: 9, dither: 0.32 }).toFile(path.join(sprites, 'dragon.png'));
}

// ICO directory followed by a PNG for each resolution.
function ico(sizes, images) {
    const header = Buffer.alloc(6 + 16 * sizes.length);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(sizes.length, 4);
    let offset = header.length;
    sizes.forEach((size, i) => {
        const entry = 6 + i * 16;
        header[entry] = header[entry + 1] = size;
        header.writeUInt16LE(1, entry + 4);
        header.writeUInt16LE(32, entry + 6);
        header.writeUInt32LE(images[i].length, entry + 8);
        header.writeUInt32LE(offset, entry + 12);
        offset += images[i].length;
    });
    return Buffer.concat([header, ...images]);
}

async function packIcons() {
    const master = path.join(__dirname, 'icon-master.png');
    function render(size) {
        return sharp(master).resize(size, size).withIccProfile('srgb').ensureAlpha()
            .png({ compressionLevel: 9 }).toBuffer();
    }
    for (const file of await fs.readdir(icons)) {
        const match = /-(\d+)x\1\.png$/.exec(file);
        if (match) await fs.writeFile(path.join(icons, file), await render(Number(match[1])));
    }
    await fs.writeFile(path.join(icons, 'google-play-512.png'), await render(512));
    const sizes = [16, 32, 48];
    await fs.writeFile(path.join(root, 'favicon.ico'), ico(sizes, await Promise.all(sizes.map(render))));
}

Promise.all([packFlight(), packIcons()]).catch(error => { console.error(error); process.exitCode = 1; });
