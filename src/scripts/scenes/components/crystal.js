const TEXTURE = 'rotating-ruby';
const SIZE = 48;
const FRAMES = 48;

// Bake a rotating brilliant cut once. Each frame projects the same facets
// around the vertical axis, with a fixed light above and to the left.
function buildCrystal(scene) {
    const texture = scene.textures.createCanvas(TEXTURE, SIZE * 8, SIZE * 6);
    const ctx = texture.context;
    const ring = (radius, y, offset) => Array.from({ length: 8 }, (_, i) => {
        const angle = (i + offset) * Math.PI / 4;
        return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
    });
    const crown = ring(0.56, 0.62, 0.5);
    const rim = ring(0.95, 0.20, 0);
    const tip = [0, -0.98, 0];
    const faces = [crown];
    for (let i = 0; i < 8; i++) {
        const j = (i + 1) % 8;
        faces.push([crown[i], rim[i], rim[j]], [crown[i], rim[j], crown[j]], [rim[j], rim[i], tip]);
    }
    for (let frame = 0; frame < FRAMES; frame++) {
        const angle = frame * 2 * Math.PI / FRAMES;
        const left = frame % 8 * SIZE, top = Math.floor(frame / 8) * SIZE;
        const visible = faces.map(face => {
            const points = face.map(([x, y, z]) => {
                const horizontal = x * Math.cos(angle) - z * Math.sin(angle);
                const depth = x * Math.sin(angle) + z * Math.cos(angle);
                return [horizontal, y * 0.96 - depth * 0.28, depth * 0.96 + y * 0.28];
            });
            const [a, b, c] = points;
            const u = b.map((v, i) => v - a[i]), v = c.map((n, i) => n - a[i]);
            const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2];
            const nz = u[0] * v[1] - u[1] * v[0];
            const length = Math.hypot(nx, ny, nz);
            const light = Math.max(0, Math.sign(nz) * (-0.45 * nx + 0.66 * ny + 0.60 * nz) / length);
            return { points, depth: points.reduce((sum, p) => sum + p[2], 0) / points.length, light };
        }).sort((a, b) => a.depth - b.depth);
        for (const { points, light } of visible) {
            ctx.beginPath();
            for (const [i, [x, y]] of points.entries()) {
                const px = left + SIZE / 2 + x * 22, py = top + SIZE / 2 - y * 22;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = 'hsl(348, 88%, ' + (21 + 40 * light + 21 * light ** 9) + '%)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,184,180,0.42)';
            ctx.lineWidth = 0.65;
            ctx.stroke();
        }
        texture.add(String(frame), 0, left, top, SIZE, SIZE);
    }
    texture.refresh();
    scene.anims.create({ key: TEXTURE, frames: scene.anims.generateFrameNames(TEXTURE, { start: 0, end: FRAMES - 1 }),
        frameRate: 20, repeat: -1 });
}

export function createCrystal(scene, x, y, size) {
    if (!scene.textures.exists(TEXTURE)) buildCrystal(scene);
    return scene.add.sprite(x, y, TEXTURE, '0').setDisplaySize(size, size).play(TEXTURE);
}
