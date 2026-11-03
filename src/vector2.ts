export class Vector2 {
    readonly x: number;
    readonly y: number;

    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    add(other: Vector2): Vector2{
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    sub(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    scale(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    length(): number{
        return Math.hypot(this.x, this.y);
    }

    normalize(): Vector2{
        const len = this.length();
        if (len === 0)
            return new Vector2 (0, 0);
        return new Vector2 (this.x / len, this.y / len);
    }

    static fromAngle(angle: number, length = 1): Vector2 {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}