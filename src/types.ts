export interface Ship {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
}

export interface GameInput {
    isDown(code: string): boolean;
}

export interface LoopOptions {
    update: (dt: number) => void;
    render: (alpha: number) => void;
    onFpsUpdate: (stats: { steps: number; frames: number; frameTime: string }) => void;
}