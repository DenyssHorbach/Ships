export function playSound(audioBuffers: Map<string, ArrayBuffer>, key: string, volume = 0.4) {
    const buffer = audioBuffers.get(key);
    if (!buffer) return;
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    const sound = new Audio(URL.createObjectURL(blob));
    sound.volume = volume;
    sound.play().catch(() => {});
    return sound;
}