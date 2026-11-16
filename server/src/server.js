import http from 'node:http';
import { config } from './config.js';

const server = http.createServer((req, res) => {
    // Відповідаємо на GET /health
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    // Для всіх інших шляхів поки віддаємо 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});

// Обробка завершення процесу (Ctrl+C або команда від ОС)
const shutdown = () => {
    console.log('\nReceived kill signal, shutting down gracefully...');
    
    server.close(() => {
        console.log('Closed out remaining connections.');
        // Тут пізніше додамо закриття сокетів і дописування логів
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);