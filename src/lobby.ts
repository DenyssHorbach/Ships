import './lobby.css'

export interface Room {
    id: number | string;
    name: string;
    players: number;
}

export class Lobby extends EventTarget {
    private container: HTMLElement;
    private abortController: AbortController | null = null;
    private selectedRoom: Room | null = null;
    private playerName: string = 'Newbee';

    constructor(containerId: string) {
        super();
        const el = document.getElementById(containerId);
        if (!el) {
            throw new Error(`Lobby container with id "${containerId}" not found!`);
        }
        this.container = el;
    }

    async fetchRooms(): Promise<Room[]> {
        this.abortController = new AbortController();
        try {
            // Використовуємо AbortSignal.timeout (вимога лаби)
            const res = await fetch('/api/rooms', { 
                signal: AbortSignal.timeout(3000) 
            });
            if (!res.ok) throw new Error('Server returned error status');
            return await res.json();
        } catch (err) {
            console.warn('Network request failed or timed out. Using fallback rooms.');
            return [
                { id: 1, name: 'Room', players: 0 },
                { id: 2, name: 'Room1', players: 0 },
                { id: 3, name: 'Room2', players: 0 }
            ];
        }
    }

    async render(): Promise<void> {
        this.container.className = 'lobby-overlay'; // Додаємо клас для загального контейнера
        this.container.style.display = 'flex';
        
        this.container.innerHTML = `
            <div class="lobby-card">
                <h2 class="lobby-title">SHIPS</h2>
                
                <div class="lobby-group">
                    <label class="lobby-label">Enter NickName:</label>
                    <input type="text" id="playerNameInput" class="lobby-input" value="${this.playerName}" />
                </div>

                <div class="lobby-group">
                    <label class="lobby-label">Select Room:</label>
                    <select id="roomSelect" class="lobby-select">
                        <option value="">Loading rooms...</option>
                    </select>
                </div>

                <button id="joinBtn" class="lobby-btn">JOIN GAME</button>
            </div>
        `;

        const select = this.container.querySelector('#roomSelect') as HTMLSelectElement;
        const nameInput = this.container.querySelector('#playerNameInput') as HTMLInputElement;
        const joinBtn = this.container.querySelector('#joinBtn') as HTMLButtonElement;

        const rooms = await this.fetchRooms();
        select.innerHTML = '';
        rooms.forEach(room => {
            const opt = document.createElement('option');
            opt.value = String(room.id);
            opt.textContent = `${room.name} (${room.players} players)`;
            select.appendChild(opt);
        });

        joinBtn.addEventListener('click', () => {
            this.playerName = nameInput.value.trim() || 'Captain';
            const roomId = select.value;
            const roomName = select.selectedOptions[0]?.textContent || 'Default Room';

            this.selectedRoom = { id: roomId, name: roomName, players: 1 };

            this.dispatchEvent(new CustomEvent('join', {
                detail: { playerName: this.playerName, room: this.selectedRoom }
            }));
        });
    }

    destroy() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.container.innerHTML = '';
        this.container.style.display = 'none';
    }
}