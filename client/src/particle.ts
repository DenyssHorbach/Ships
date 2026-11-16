import { Entity } from './entity';
import { Vector2 } from './vector2';
import type { World } from './world';

export class Particle extends Entity {
    ttl: number;
    readonly maxTtl: number;
    readonly color: string;

    constructor(pos: Vector2, vel: Vector2, ttl: number, color = '#ff8800') {
        super('particle', pos, 2, vel);
        this.ttl = ttl;
        this.maxTtl = ttl;
        this.color = color;
    }

    get alpha(): number {
        return Math.max(0, this.ttl / this.maxTtl);
    }

    override update(dt: number): void {
        super.update(dt);
        this.vel = this.vel.scale(0.95);
        this.ttl -= dt;
        if (this.ttl <= 0) {
            this.kill();
        }
    }

    static spawnExplosion(world: World, pos: Vector2, color = '#ff8800', count = 20): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 160;
            const ttl = 0.3 + Math.random() * 0.5;
            world.spawn(new Particle(pos, Vector2.fromAngle(angle, speed), ttl, color));
        }
    }
}