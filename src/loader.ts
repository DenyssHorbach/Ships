export async function loadJson<T>(url: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

export async function loadImage(url: string, signal?: AbortSignal): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        if (signal) {
            signal.addEventListener('abort', () => reject(new Error('Aborted')));
        }
        img.onload = () => resolve(img);
        img.onerror = (err) => {
            console.error(`Помилка завантаження зображення за шляхом: ${url}`);
        }
        img.src = url;
    });
}

export interface AssetManifest {
    images: Record<string, string>;
    audio: Record<string, string>;
}

export async function loadAssets(
    manifestUrl: string, 
    onProgress?: (loaded: number, total: number) => void
): Promise<{ images: Map<string, HTMLImageElement>, audioBuffers: Map<string, ArrayBuffer> }> {
    
    const manifest = await loadJson<AssetManifest>(manifestUrl);
    
    const imageEntries = Object.entries(manifest.images);
    const audioEntries = Object.entries(manifest.audio);
    const totalAssets = imageEntries.length + audioEntries.length;
    let loadedCount = 0;

    const images = new Map<string, HTMLImageElement>();
    const audioBuffers = new Map<string, ArrayBuffer>();

    const imagePromises = imageEntries.map(async ([key, path]) => {
        const img = await loadImage(path);
        images.set(key, img);
        loadedCount++;
        onProgress?.(loadedCount, totalAssets);
    });

    const audioPromises = audioEntries.map(async ([key, path]) => {
        const res = await fetch(path);
        const buffer = await res.arrayBuffer();
        audioBuffers.set(key, buffer);
        loadedCount++;
        onProgress?.(loadedCount, totalAssets);
    });

    await Promise.all([...imagePromises, ...audioPromises]);

    return { images, audioBuffers };
}