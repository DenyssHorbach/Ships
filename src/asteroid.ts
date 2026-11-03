import { Entity } from './entity';
import { Vector2 } from './vector2';

export class Asteroid extends Entity {
    constructor(pos: Vector2, vel: Vector2, radius = 28) {
        super('asteroid', pos, radius, vel);
    }

    static spawnRandom(width: number, height: number): Asteroid {
        const pos = new Vector2(Math.random() * width, Math.random() * height);
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 80;
        const radius = 18 + Math.random() * 20;
        return new Asteroid(pos, Vector2.fromAngle(angle, speed), radius);
    }
}