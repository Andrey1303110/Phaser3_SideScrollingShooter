import { TEXTURE_KEYS } from './identifiers';

const ADULT = 4;
const BEATS = 12;

// Every scene animates the same flight frames. Replace only their pixels when the
// youngest skill crosses a five-level milestone, keeping the animation phase and physics body.
export function refreshDragonAppearance(scene) {
    const age = scene.model.dragonAge;
    const forms = scene.textures.get(TEXTURE_KEYS.DRAGON_FORMS);
    const image = forms.getSourceImage();
    const first = forms.get('age0-1');
    let flight;
    if (scene.textures.exists(TEXTURE_KEYS.DRAGON)) {
        flight = scene.textures.get(TEXTURE_KEYS.DRAGON);
        if (flight.dragonAge === age) return;
    } else {
        flight = scene.textures.createCanvas(TEXTURE_KEYS.DRAGON, image.width, first.cutHeight + 2);
        for (let beat = 1; beat <= BEATS; beat++) {
            const frame = forms.get(`age0-${beat}`);
            flight.add(`dragon${beat}`, 0, frame.cutX, 1, frame.cutWidth, frame.cutHeight);
        }
    }

    const ctx = flight.context;
    function drawRow(row) {
        const y = forms.get(`age${row}-1`).cutY;
        ctx.drawImage(image, 0, y, image.width, first.cutHeight, 0, 1, image.width, first.cutHeight);
    }
    ctx.clearRect(0, 0, flight.width, flight.height);
    drawRow(Math.min(age, ADULT));
    if (age > ADULT) {
        // The elder pigment shares the adult silhouette. Each subsequent milestone
        // brings out more gold on the crest and more rings on the horns.
        const elderStages = age - ADULT;
        ctx.globalAlpha = elderStages / (elderStages + 3);
        drawRow(ADULT + 1);
        ctx.globalAlpha = 1;
    }
    flight.refresh();
    flight.dragonAge = age;
}
