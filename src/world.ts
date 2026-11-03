import { resolveCollisions } from './collisions';
import { Entity } from './entity';
import type { EntityKind } from './entity';
import { Vector2 } from './vector2';

export class World {
    #entities = new Map<number, Entity>();
    width: number;
    height: number;
    score = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    spawn<T extends Entity>(entity: T): T {
        this.#entities.set(entity.id, entity);
        return entity;
    }

    despawn(idOrEntity: number | Entity): void {
        const id = typeof idOrEntity === 'number' ? idOrEntity : idOrEntity.id;
        const entity = this.#entities.get(id);
        if (entity) {
            entity.kill();
        }
    }

    get entities(): IterableIterator<Entity> {
        return this.#entities.values();
    }

    *ofKind<T extends Entity = Entity>(kind: EntityKind): IterableIterator<T> {
        for (const entity of this.#entities.values()) {
            if (entity.alive && entity.kind === kind) {
                yield entity as T;
            }
        }
    }

    step(dt: number): void {
        for (const entity of this.#entities.values()) {
            if (!entity.alive) continue;
            entity.update(dt);
            this.#wrapScreen(entity);
        }

        resolveCollisions(this);

        this.sweep();
    }

    sweep(): void {
        for (const [id, entity] of this.#entities.entries()) {
            if (!entity.alive) {
                this.#entities.delete(id);
            }
        }
    }

    #wrapScreen(entity: Entity): void {
        let { x, y } = entity.pos;
        let wrapped = false;

        if (x < 0) { x = this.width; wrapped = true; }
        else if (x > this.width) { x = 0; wrapped = true; }

        if (y < 0) { y = this.height; wrapped = true; }
        else if (y > this.height) { y = 0; wrapped = true; }

        if (wrapped) {
            entity.pos = new Vector2(x, y);
        }
    }
}