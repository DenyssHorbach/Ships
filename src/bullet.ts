import { Entity } from "./entity";
import { Vector2 } from "./vector2";

export class Bullet extends Entity{
    ttl: number;

    constructor(pos: Vector2, vel: Vector2, ttl = 1.5){
        super('bullet', pos, 3, vel)
        this.ttl = ttl;
    }

    override update(dt: number): void{
        super.update(dt);
        this.ttl -= dt;
        if (this.ttl <= 0){
            this.kill();
        }
    }
}