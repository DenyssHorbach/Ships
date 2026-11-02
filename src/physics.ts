import type { Ship, GameInput } from './types';

export function integrate(ship: Ship, input: GameInput, dt: number): void {
    const ACCEL = 1000;
    const ROTATION_SPEED = Math.PI * 1.5;
    const FRICTION = 0.98;

    if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
        ship.angle -= ROTATION_SPEED * dt;
    }
    if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
        ship.angle += ROTATION_SPEED * dt;
    }

    if (input.isDown('ArrowUp') || input.isDown('KeyW')) {
        ship.vx += Math.cos(ship.angle) * ACCEL * dt;
        ship.vy += Math.sin(ship.angle) * ACCEL * dt;
    }

    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;

    ship.vx *= FRICTION;
    ship.vy *= FRICTION;
}

export function wrapScreen(ship: Ship, width: number, height: number): void {
    if (ship.x < 0) ship.x = width;
    if (ship.x > width) ship.x = 0;
    if (ship.y < 0) ship.y = height;
    if (ship.y > height) ship.y = 0;
}