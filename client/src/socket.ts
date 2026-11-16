export class ClientSocket {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectDelay: number = 1000;
    private maxReconnectDelay: number = 16000;
    private sendQueue: string[] = [];
    public onMessage: ((data: any) => void) | null = null;

    constructor(url: string) {
        this.url = url;
    }

    connect() {
        console.log(`[Socket] Підключення до ${this.url}...`);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('[Socket] З\'єднання встановлено!');
            this.reconnectDelay = 1000;
            this.flushQueue();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (this.onMessage) this.onMessage(data);
            } catch (err) {
                console.error('[Socket] Помилка парсингу повідомлення', err);
            }
        };

        this.ws.onclose = (event) => {
            console.warn(`[Socket] З'єднання закрито (Код: ${event.code}). Причина: ${event.reason}`);
            this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('[Socket] Помилка з\'єднання:', error);
        };
    }

    send(data: any) {
        const message = JSON.stringify(data);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.warn(`[Socket] Офлайн. Повідомлення додано в чергу.`);
            this.sendQueue.push(message);
        }
    }

    private flushQueue() {
        while (this.sendQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
            const message = this.sendQueue.shift();
            if (message) this.ws.send(message);
        }
    }

    private scheduleReconnect() {
        console.log(`[Socket] Спроба перепідключення через ${this.reconnectDelay / 1000} секунд...`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);

        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }
}