import type { GameInput } from './types';

export function createInput(): GameInput {
    const keys: Record<string, boolean> = {};

    window.addEventListener('keydown', (e: KeyboardEvent) => {
        keys[e.code] = true;
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
        keys[e.code] = false;
    });

    return {
        isDown(code: string): boolean {
            return !!keys[code];
        }
    };
}