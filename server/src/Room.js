import { EventEmitter } from 'node:events';
import { MatchLogger } from './logger';
import { config } from './config';

export class Room extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.clients = new Set(); // Зберігаємо підключені сокети

        const matchId = name.replace(/\s+/g, '-').toLowerCase();
        this.logger = new MatchLogger(config.logDir, matchId);
        this.logger.init().catch(err => {
            console.error(`[Room ${this.name}] Помилка ініціалізації логера:`, err);
        });
        this.logger.logEvent('ROOM_CREATED', {roomName: this.name});
    }

    addClient(ws, playerName) {
        this.clients.add(ws);
        console.log(`[${this.name}] ${playerName} joined.`);
        
        this.logger.logEvent('PLAYER_JOINED ', {playerName});
        // Коли клієнт відключається, видаляємо його
        ws.on('close', () => this.removeClient(ws, playerName));
    }

    removeClient(ws, playerName) {
        this.clients.delete(ws);
        console.log(`[${this.name}] ${playerName} left.`);
        this.logger.logEvent('PLAYER_LEFT ', {playerName});

        // Порожня кімната видаляється через EventEmitter
        if (this.clients.size === 0) {
            console.log(`[${this.name}] is empty, emitting 'empty' event.`);
            this.logger.close();
            this.emit('empty', this.name);
        }
    }
}