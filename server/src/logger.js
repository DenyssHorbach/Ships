import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform, PassThrough } from 'node:stream';

export class MatchLogger {
    constructor(logDir, matchId) {
        this.logPath = path.join(logDir, `match-${matchId}.ndjson`);
        this.fileStream = null;
        this.inputStream = new PassThrough({ objectMode: true });
    }

    async init() {
        // Гарантуємо, що папка для логів існує
        await fs.promises.mkdir(path.dirname(this.logPath), { recursive: true });
        
        // Відкриваємо потік запису у файл
        this.fileStream = fs.createWriteStream(this.logPath, { flags: 'a' });

        // Transform потік: перетворює об'єкт події у JSON-рядок з перенесенням рядка
        const jsonTransformer = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                // Кожна подія перетворюється на рядок NDJSON
                callback(null, JSON.stringify(chunk) + '\n');
            }
        });

        // Використовуємо pipeline для надійного з'єднання потоків з обробкою помилок
        // Він автоматично закриє файлові дескриптори при завершенні
        pipeline(
            this.inputStream,
            jsonTransformer,
            this.fileStream
        ).catch(err => {
            console.error('[Logger Pipeline Error]:', err);
        });
    }

    // Метод для логування нової події гри
    logEvent(eventType, data) {
        this.inputStream.write({
            timestamp: new Date().toISOString(),
            type: eventType,
            ...data
        });
    }

    // Коректне закриття потоку логування
    async close() {
        this.inputStream.end();
        if (this.fileStream) {
            this.fileStream.end();
        }
    }
}