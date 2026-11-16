class GameEventBus extends EventTarget {
    emit(eventName: string, detail?: any) {
        this.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}

export const eventBus = new GameEventBus();