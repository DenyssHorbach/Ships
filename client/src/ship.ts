import { Entity } from "./entity";
import { Vector2 } from "./vector2";
import type { GameInput } from "./types";
import { Bullet } from "./bullet";
import { World } from "./world";
import {playSound} from "./playSound";
import { loadAssets } from "./loader";

const manifestUrl = '/assets/manifest.json';
const assets = await loadAssets(manifestUrl);

export class Ship extends Entity{
    #hp: number;
    readonly maxHp: number;
    angle = 0;
    private lastShotTime = 0;
    private shootCooldown = 2.7;

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
        if (this.#hp === 0) {
            this.kill();
            playSound(assets.audioBuffers, 'death', 0.9);
        }

    }

    heal(amount = 1):void {
        this.#hp = Math.min(this.maxHp, this.#hp + amount);
    }

    fire(world: World): Bullet | null {
        const currentTime = performance.now() / 1000;

        if (currentTime - this.lastShotTime < this.shootCooldown){
            return null;
        }
        this.lastShotTime = currentTime;
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
        const ACCEL = 100;
        const ROTATION_SPEED = Math.PI * 0.4;

        const isTurningLeft = input.isDown('ArrowLeft') || input.isDown('KeyA');
        const isTurningRight = input.isDown('ArrowRight') || input.isDown('KeyD');
        const isMovingForward = input.isDown('ArrowUp') || input.isDown('KeyW');

        if (isTurningLeft && !isTurningRight){
            this.angle -= ROTATION_SPEED * dt;
        }
        if (isTurningRight && !isTurningLeft){
            this.angle += ROTATION_SPEED * dt;
        }

        if (isMovingForward){
            const forwardDir = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
            const isTurningBoost = (isTurningLeft || isTurningRight) ? 1.35 : 1;
            const effectiveAccel = ACCEL * isTurningBoost;
            this.vel = this.vel.add(forwardDir.scale(effectiveAccel * dt));
        }

        const MAX_SPEED = 300;
        if (this.vel.length() > MAX_SPEED){
            this.vel = this.vel.normalize().scale(MAX_SPEED);
        }
    }

    override update(dt: number): void {
        const FRICTION = 0.98;
        super.update(dt);
        this.vel = this.vel.scale(FRICTION);
    }

}