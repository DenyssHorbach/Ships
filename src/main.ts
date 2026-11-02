import { createLoop } from './loop';
import { createInput } from './input';
import { integrate, wrapScreen } from './physics';
import { setupCanvas, drawShip } from './render';
import type { Ship } from './types';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const hud = document.getElementById('hud') as HTMLElement;

const { ctx, width, height } = setupCanvas(canvas);
const input = createInput();

const ship: Ship = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    angle: 0
};

const loop = createLoop({
    update(dt) {
        integrate(ship, input, dt);
        wrapScreen(ship, width, height);
    },
    render(_alpha) {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, width, height);
        drawShip(ctx, ship);
    },
    onFpsUpdate({ steps, frames, frameTime }) {
        hud.innerText = `Steps/s: ${steps} | Frames/s: ${frames} | Frame Time: ${frameTime} ms`;
    }
});

loop.start();