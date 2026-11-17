import { EventEmitter } from 'node:events';
import { MatchLogger } from './logger.js';
import { config } from './config.js';

export class Room extends EventEmitter {
    constructor(name) {
        super();
        const roomTitle = (typeof name === 'object' && name !== null) 
            ? (name.name || name.id || 'default-room') 
            : String(name || 'default-room');

        this.name = roomTitle;
        this.clients = new Set();
        
        const matchId = this.name.replace(/\s+/g, '-').toLowerCase();
        this.logger = new MatchLogger(config.logDir, matchId);
        
        this.logger.init().catch(err => {
            console.error(`[Room ${this.name}] Помилка ініціалізації логера:`, err);
        });

        this.logger.logEvent('ROOM_CREATED', { roomName: this.name });
    }

    addClient(ws, playerName) {
        this.clients.add(ws);
        console.log(`[${this.name}] ${playerName} joined.`);
        
        this.logger.logEvent('PLAYER_JOINED ', {playerName});
        ws.on('close', () => this.removeClient(ws, playerName));
    }

    removeClient(ws, playerName) {
        this.clients.delete(ws);
        console.log(`[${this.name}] ${playerName} left.`);
        this.logger.logEvent('PLAYER_LEFT ', {playerName});

        if (this.clients.size === 0) {
            console.log(`[${this.name}] is empty, emitting 'empty' event.`);
            this.logger.close();
            this.emit('empty', this.name);
        }
    }
}