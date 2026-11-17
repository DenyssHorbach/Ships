import { createLoop } from './loop';
import { createInput } from './input';
import { setupCanvas, renderWorld } from './render';
import { Ship } from './ship';
import { World } from './world';
import { Vector2 } from './vector2';
import { Asteroid } from './asteroid';
import { loadAssets } from './loader';
import { Lobby } from './lobby';
import { playSound } from './playSound';
import { ClientSocket } from './socket';

// const gameSocket = new ClientSocket(`ws://${window.location.host}/ws`);
const gameSocket = new ClientSocket('ws://localhost:3000');

const manifestUrl = '/assets/manifest.json';


const lobby = new Lobby('lobbyContainer');
const soundtrack = new Audio('/assets/soundtrack.mp3');
soundtrack.loop = true;
soundtrack.volume = 0.25;

function startMusicOnInteraction() {
    soundtrack.play().catch(() => {});
}

window.addEventListener('keydown', startMusicOnInteraction, { once: true });
window.addEventListener('pointerdown', startMusicOnInteraction, { once: true });

function loadSingleImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

async function showLobby(assets: any) {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (canvas) canvas.style.display = 'none';

    await lobby.render();

    lobby.addEventListener('join', ((e: CustomEvent) => {
        const { playerName, room } = e.detail;
        console.log(`Player "${playerName}" joined room:`, room);

        gameSocket.connect();
        gameSocket.onMessage = (data) => {
            console.log('message from server ', data);
        }
        gameSocket.send({
            type: 'join',
            roomName: room,
            playerName: playerName
        })
        
        lobby.destroy();
        
        startGame(assets, playerName, room);
    }) as EventListener, { once: true });
}

async function initGame() {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    // const hud = document.getElementById('hud') as HTMLElement;
    const { ctx, width, height } = setupCanvas(canvas);

    let loadScreenImg: HTMLImageElement | null = null;
    try {
        loadScreenImg = await loadSingleImage('/assets/loadScreen.png')
    } catch(e) {
        console.warn('Loadscreen image not found')
    }

    const drawLoadingScreen = (_loaded: number, _total: number) => {
        ctx.clearRect(0, 0, width, height);
        if (loadScreenImg && loadScreenImg.complete){
            ctx.drawImage(loadScreenImg, 0, 0, width, height);
        } else {
            ctx.fillStyle = '#0b0f19';
            ctx.fillRect(0, 0, width, height);
        }
    };

    try {
        drawLoadingScreen(0, 1);

        const assets = await loadAssets(manifestUrl, (loaded, total) => {
            drawLoadingScreen(loaded, total);
        });

        console.log('All assets loaded successfully!', assets);

        // const lobby = new Lobby('lobbyContainer');
        showLobby(assets);
    } catch (error) {
        console.error('Failed to load game assets:', error);
        ctx.fillStyle = '#ff0000';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Failed to load assets. Check console.', width / 2, height / 2);
    }
}

function startGame(assets: { images: Map<string, HTMLImageElement>, audioBuffers: Map<string, ArrayBuffer> }, playerName: string, room: any) {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (canvas) canvas.style.display = 'block';

    const hud = document.getElementById('hud') as HTMLElement;
    const { ctx, width, height } = setupCanvas(canvas);
    const abortController = new AbortController();

    const input = createInput();
    const world = new World(width, height);

    let ship = world.spawn(new Ship(new Vector2(width / 2, height / 2)));
    // let respawnTimer = 0;

    for (let i = 0; i < 6; i++) {
        world.spawn(Asteroid.spawnRandom(width, height));
    }

    window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && ship.alive) {
            const bullet = ship.fire(world);
            if (bullet !== null) {
                const shotAudio = playSound(assets.audioBuffers, 'shot', 0.9);
                if (shotAudio){
                    shotAudio.onended = () => {
                        playSound(assets.audioBuffers, 'reload', 0.8);
                    }
                }
            }
        }
    }, { signal: abortController.signal } );

    const loop = createLoop({
        update(dt) {
            if (ship.alive) {
                ship.handleInput(input, dt);
            } else {
                loop.stop();
                showLobby(assets);
            }
            world.step(dt);
        },
        render(_alpha) {
            renderWorld(ctx, world, assets.images);
        },
        onFpsUpdate({ frames }) {
            hud.innerText = `Player: ${playerName} | Room: ${room.name} | HP: ${ship.hp} | FPS: ${frames}`;
        }
    });

    loop.start();
}

initGame();