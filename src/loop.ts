import type { LoopOptions } from './types';

export function createLoop({ update, render, onFpsUpdate }: LoopOptions) {
    const FIXED_STEP = 1000 / 60;
    let accumulator = 0;
    let lastTime = performance.now();
    
    let stepsCount = 0;
    let framesCount = 0;
    let lastFpsUpdate = lastTime;

    function frame(currentTime: number) {
        let frameTime = currentTime - lastTime;
        lastTime = currentTime;

        if (frameTime > 250) frameTime = 250;
        accumulator += frameTime;

        while (accumulator >= FIXED_STEP) {
            update(FIXED_STEP / 1000);
            accumulator -= FIXED_STEP;
            stepsCount++;
        }

        const alpha = accumulator / FIXED_STEP;
        render(alpha);
        framesCount++;

        if (currentTime - lastFpsUpdate >= 1000) {
            onFpsUpdate({
                steps: stepsCount,
                frames: framesCount,
                frameTime: frameTime.toFixed(2)
            });
            stepsCount = 0;
            framesCount = 0;
            lastFpsUpdate = currentTime;
        }

        requestAnimationFrame(frame);
    }

    return {
        start() {
            lastTime = performance.now();
            requestAnimationFrame(frame);
        }
    };
}