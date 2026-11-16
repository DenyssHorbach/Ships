// import { Lobby } from "./lobby";
// import { startGame } from "./main";

// const lobby = new Lobby('lobbyContainer');

// const assets = await loadAssets(manifestUrl, (loaded, total) => {
//             drawLoadingScreen(loaded, total);
//         });

// async function showLobby() {
//     await lobby.render();

//     // Слухач навішується ЗАНОВО кожен раз, коли ми показуємо лоббі
//     lobby.addEventListener('join', ((e: CustomEvent) => {
//         const { playerName, room } = e.detail;
//         console.log(`Player "${playerName}" joined room:`, room);
        
//         lobby.destroy();
        
//         // Запускаємо гру
//         startGame(assets, playerName, room);

//     }) as EventListener, { once: true });
// }