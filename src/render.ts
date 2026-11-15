import type { Ship } from './ship';
import type { World } from './world';
import { Bullet } from './bullet';
import { Asteroid } from './asteroid';
import { Particle } from './particle';

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

export function drawShip(ctx: CanvasRenderingContext2D, ship: Ship, shipSprite?: HTMLImageElement): void {
    ctx.save();
    ctx.translate(ship.pos.x, ship.pos.y);
    ctx.rotate(ship.angle);

    // const SPRITE_SIZE = ship.radius * 2.8;

    if (shipSprite && shipSprite.complete && shipSprite.naturalWidth > 0){
        const originWidth = shipSprite.naturalWidth;
        const originHeight = shipSprite.naturalHeight;

        const height = ship.radius * 7;
        const width = height * (originWidth / originHeight);

        ctx.rotate(Math.PI / -2);
        ctx.drawImage(shipSprite, -width / 2, -height / 2, width, height);
    } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
}

export function renderWorld(ctx: CanvasRenderingContext2D, world: World, images: Map<string, HTMLImageElement>): void {
    //water
    const waterSprite = images.get('water');
    if (waterSprite && waterSprite.complete && waterSprite.naturalWidth > 0) {
        const pattern = ctx.createPattern(waterSprite, 'repeat');
        if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, world.width, world.height);
        } else {
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, world.width, world.height);
        }
    } else {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, world.width, world.height);
    }

    //bullets
    const ballSprite = images.get('ball');
    ctx.fillStyle = '#ffcc00';
    for (const bullet of world.ofKind<Bullet>('bullet')) {
        if (ballSprite && ballSprite.complete && ballSprite.naturalWidth > 0) {
            const size = bullet.radius * 4;
            ctx.save();
            ctx.translate(bullet.pos.x, bullet.pos.y);
            ctx.drawImage(ballSprite, -size / 2, -size / 2, size, size);
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(bullet.pos.x, bullet.pos.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    //Icebergs
    const icebergSprite = images.get('iceberg');
    for (const asteroid of world.ofKind<Asteroid>('asteroid')) {
        if (icebergSprite && icebergSprite.complete && icebergSprite.naturalWidth > 0) {
            const origW = icebergSprite.naturalWidth;
            const origH = icebergSprite.naturalHeight;

            const height = asteroid.radius * 2.2;
            const width = height * (origW / origH);

            ctx.drawImage(
                icebergSprite,
                asteroid.pos.x - width / 2,
                asteroid.pos.y - height / 2,
                width,
                height
            );
        } else {
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(asteroid.pos.x, asteroid.pos.y, asteroid.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    //ship
    const shipSprite = images.get('ship');
    for (const ship of world.ofKind<Ship>('ship')) {
        drawShip(ctx, ship, shipSprite);
    }

    //particles
    for (const p of world.ofKind<Particle>('particle')) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}