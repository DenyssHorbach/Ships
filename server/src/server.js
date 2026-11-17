import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { Room } from './Rooma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_DIST = path.join(__dirname, '../../client/dist');


const server = http.createServer((req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    if (req.url === '/api/rooms' && req.method === 'GET') {
        const roomList = Array.from(rooms.keys());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ rooms: roomList }));
        return;
    }

    if (req.url === '/api/rooms' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { roomName } = JSON.parse(body);
                if (!roomName) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'roomName is required' }));
                    return;
                }
                if (!rooms.has(roomName)) {
                    createRoom(roomName);
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, roomName }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    let filePath = path.join(CLIENT_DIST, req.url === '/' ? 'index.html' : req.url);
    
    if (req.url.includes('..') || !filePath.startsWith(CLIENT_DIST)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access denied');
        return;
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    if (extname === '.js') contentType = 'application/javascript';
    else if (extname === '.css') contentType = 'text/css';
    else if (extname === '.png') contentType = 'image/png';
    else if (extname === '.jpg') contentType = 'image/jpeg';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});




const wss = new WebSocketServer({ server });
const rooms = new Map();

const MAX_MSG_SIZE = 1024 * 5; 
const MAX_MSG_PER_SEC = 20;    
const ALLOWED_TYPES = ['join', 'chat', 'leave'];

function createRoom(roomName) {
    if (!rooms.has(roomName)) {
        const newRoom = new Room(roomName);
        newRoom.on('empty', (name) => {
            rooms.delete(name);
            console.log(`Кімната [${name}] видалена через порожнечу.`);
        });
        rooms.set(roomName, newRoom);
    }
    return rooms.get(roomName);
}

function safeSend(ws, data) {
    if (ws.bufferedAmount > 1024 * 50) return;
    ws.send(JSON.stringify(data));
}

wss.on('connection', (ws) => {
    let joined = false;
    let messageCount = 0;
    let missedPongs = 0;

    const joinTimeout = setTimeout(() => {
        if (!joined) ws.close(1008, 'Join timeout');
    }, 5000);

    const pingInterval = setInterval(() => {
        if (missedPongs >= 2) {
            clearInterval(pingInterval);
            return ws.terminate();
        }
        missedPongs++;
        ws.ping();
    }, 15000);

    ws.on('pong', () => { missedPongs = 0; });

    const rateLimitInterval = setInterval(() => { messageCount = 0; }, 1000);

    ws.on('message', (message) => {
        if (message.length > MAX_MSG_SIZE) return ws.close(1009, 'Message too big');
        messageCount++;
        if (messageCount > MAX_MSG_PER_SEC) return ws.close(1008, 'Rate limit exceeded');

        let data;
        try { data = JSON.parse(message); } 
        catch (err) { return ws.close(1007, 'Invalid JSON format'); }

        if (!data.type || !ALLOWED_TYPES.includes(data.type)) {
            return ws.close(1008, 'Unknown message type');
        }

        if (data.type === 'join' && data.roomName) {
            joined = true;
            clearTimeout(joinTimeout);

            const room = createRoom(data.roomName);
            room.addClient(ws, data.playerName || 'Anonymous');
            safeSend(ws, { type: 'chat', text: `Welcome to ${data.roomName}` });
        }
    });

    ws.on('close', () => {
        clearInterval(pingInterval);
        clearInterval(rateLimitInterval);
        clearTimeout(joinTimeout);
    });
});




server.listen(config.port, () => {
    console.log(`Сервер працює на порту ${config.port}`);
});

const shutdown = () => {
    console.log('\nОтримано сигнал зупинки, завершуємо роботу...');
    for (const client of wss.clients) {
        client.close(1001, 'Server shutting down');
    }
    server.close(() => {
        console.log('Сервер успішно зупинено.');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);