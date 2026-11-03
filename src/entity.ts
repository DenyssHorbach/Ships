import { Vector2 } from "./vector2";

export type EntityKind = 'ship' | 'bullet' | 'asteroid' | 'particle' | 'pickup';

export class Entity{
    static #nextId = 1;

    #id: number;
    pos: Vector2;
    vel: Vector2;
    radius: number;
    readonly kind: EntityKind;
    alive = true;

    constructor (kind: EntityKind, pos: Vector2, radius: number, vel = new Vector2() ){
        this.#id = Entity.#nextId++;
        this.kind = kind;
        this.pos = pos;
        this.radius = radius;
        this.vel = vel;
    }

    get id(): number{
        return this.#id;
    }

    update(dt: number): void{
        this.pos = this.pos.add(this.vel.scale(dt));
    }

    kill(): void {
        this.alive = false;
    }
}