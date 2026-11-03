import { Entity } from "./entity";
import { Vector2 } from "./vector2";
import type { GameInput } from "./types";
import { Bullet } from "./bullet";
import { World } from "./world";

export class Ship extends Entity{
    #hp: number;
    readonly maxHp: number;
    angle = 0;

    constructor(pos: Vector2, maxHp = 3){
        super('ship', pos, 15);
        this.maxHp = maxHp;
        this.#hp = maxHp;
    }

    get hp(): number{
        return this.#hp;
    }

    takeDamage(amount = 1): void {
        if (!this.alive) return;
        this.#hp = Math.max(0, this.#hp - amount);
        if (this.#hp === 0)
            this.kill();
    }

    heal(amount = 1):void {
        this.#hp = Math.min(this.maxHp, this.#hp + amount);
    }

    fire(world: World): Bullet | null {
        if (!this.alive)
            return null;
        const BULLET_SPEED = 500;
        const noseOffset = Vector2.fromAngle(this.angle, this.radius + 4);
        const spawnPos = this.pos.add(noseOffset);
        const bulletVel = this.vel.add(Vector2.fromAngle(this.angle, BULLET_SPEED));
        console.log('bullet!')
        return world.spawn(new Bullet(spawnPos, bulletVel));
    }


    handleInput(input: GameInput, dt: number): void{
        const ACCEL = 150;
        const ROTATION_SPEED = Math.PI / 1.5;

        if (input.isDown('ArrowLeft') || input.isDown('KeyA')){
            this.angle -= ROTATION_SPEED * dt;
        }else if (input.isDown('ArrowRight') || input.isDown('KeyD')){
            this.angle += ROTATION_SPEED * dt;
        }else if (input.isDown('ArrowUp') || input.isDown('KeyW')){
            const thrust = Vector2.fromAngle(this.angle, ACCEL * dt);
            this.vel = this.vel.add(thrust);
        }

    }

    override update(dt: number): void {
        const FRICTION = 0.98;
        super.update(dt);
        this.vel = this.vel.scale(FRICTION);
    }

}