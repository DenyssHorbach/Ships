import type { Entity } from './entity';
import type { World } from './world';
import type { Ship } from './ship';
import { Asteroid } from './asteroid';
import { Particle } from './particle';

export function areCirclesColliding(a: Entity, b: Entity): boolean {
    const distance = a.pos.sub(b.pos).length();
    return distance <= a.radius + b.radius;
}

export function resolveCollisions(world: World): void {
    const entities = Array.from(world.entities).filter(
        (e) => e.alive && e.kind !== 'particle'
    );

    for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
            const a = entities[i];
            const b = entities[j];

            if (!a.alive || !b.alive) continue;

            if (areCirclesColliding(a, b)) {
                handlePairCollision(world, a, b);
            }
        }
    }
}

function handlePairCollision(world: World, a: Entity, b: Entity): void {
    if (
        (a.kind === 'bullet' && b.kind === 'asteroid') ||
        (a.kind === 'asteroid' && b.kind === 'bullet')
    ) {
        const bullet = a.kind === 'bullet' ? a : b;
        const asteroid = a.kind === 'asteroid' ? a : b;

        bullet.kill();
        asteroid.kill();
        world.score += 100;

        Particle.spawnExplosion(world, asteroid.pos, '#ffaa00', 20);
        world.spawn(Asteroid.spawnRandom(world.width, world.height));
        return;
    }

    if (
        (a.kind === 'ship' && b.kind === 'asteroid') ||
        (a.kind === 'asteroid' && b.kind === 'ship')
    ) {
        const ship = (a.kind === 'ship' ? a : b) as Ship;
        const asteroid = a.kind === 'asteroid' ? a : b;

        asteroid.kill();
        ship.takeDamage(1);

        Particle.spawnExplosion(world, asteroid.pos, '#ff4444', 25);
        world.spawn(Asteroid.spawnRandom(world.width, world.height));

        if (!ship.alive) {
            Particle.spawnExplosion(world, ship.pos, '#ffffff', 40);
        }
        return;
    }

    if (
        (a.kind === 'bullet' && b.kind === 'ship') ||
        (a.kind === 'ship' && b.kind === 'bullet')
    ) {
        const bullet = a.kind === 'bullet' ? a : b;
        const ship = (a.kind === 'ship' ? a : b) as Ship;

        bullet.kill();
        ship.takeDamage(1);
        Particle.spawnExplosion(world, bullet.pos, '#ff4444', 12);

        if (!ship.alive) {
            Particle.spawnExplosion(world, ship.pos, '#ffffff', 40);
        }
    }
}