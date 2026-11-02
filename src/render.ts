import type { Ship } from './types';

export function setupCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
    

        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';

        ctx.scale(dpr, dpr);

        return { ctx, width: displayWidth, height: displayHeight };
    }

    let dimensions = resize();
    return { ctx, width: dimensions.width, height: dimensions.height}
}

export function drawShip(ctx: CanvasRenderingContext2D, ship: Ship): void {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}