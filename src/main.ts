import { createLoop } from './loop';
import { createInput } from './input';
import { setupCanvas, renderWorld } from './render';
import { Ship } from './ship';
import { World } from './world';
import { Vector2 } from './vector2';
import { Asteroid } from './asteroid';
import soundtrackSrc from './assets/soundtrack.mp3';

const soundtrack = new Audio(soundtrackSrc);
soundtrack.loop = true;
soundtrack.volume = 0.25;

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const hud = document.getElementById('hud') as HTMLElement;

const { ctx, width, height } = setupCanvas(canvas);
const input = createInput();
const world = new World(width, height);

function startMusicOnInteraction() {
    soundtrack.play().catch(() => {
    });
}

window.addEventListener('keydown', startMusicOnInteraction, { once: true });
window.addEventListener('pointerdown', startMusicOnInteraction, { once: true });

let ship = world.spawn(new Ship(new Vector2(width / 2, height / 2)));
let respawnTimer = 0;

for (let i = 0; i < 6; i++){
    world.spawn(Asteroid.spawnRandom(width, height));
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
        const b = ship.fire(world);
    }
});

const loop = createLoop({
    update(dt) {
        if (ship.alive){
            ship.handleInput(input, dt);
        } else {
            if (respawnTimer <= 0){
                respawnTimer = 2.0;
            } else{
                respawnTimer -= dt;
                if (respawnTimer <= 0){
                    ship = world.spawn(new Ship(new Vector2(width / 2, height / 2)));
                }
            }
        }
        world.step(dt);
    },
    render(_alpha){
        renderWorld(ctx, world);
    },
    onFpsUpdate({ steps, frames, frameTime}) {
        hud.innerText = `HP: ${ship.hp} | Steps/s: ${steps} | FPS: ${frames} | Frame: ${frameTime} ms`;
    }
});

loop.start();