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
        await fs.promises.mkdir(path.dirname(this.logPath), { recursive: true });
        
        this.fileStream = fs.createWriteStream(this.logPath, { flags: 'a' });

        const jsonTransformer = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                callback(null, JSON.stringify(chunk) + '\n');
            }
        });

        pipeline(
            this.inputStream,
            jsonTransformer,
            this.fileStream
        ).catch(err => {
            console.error('[Logger Pipeline Error]:', err);
        });
    }

    logEvent(eventType, data) {
        this.inputStream.write({
            timestamp: new Date().toISOString(),
            type: eventType,
            ...data
        });
    }

    async close() {
        this.inputStream.end();
        if (this.fileStream) {
            this.fileStream.end();
        }
    }
}