import {ElevenLabsClient} from '@elevenlabs/elevenlabs-js';

export function getElevenLabsClient() {
    return new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
    });
}

/**
 * Creates a browser-compatible WebSocket factory for ElevenLabs Conversational AI.
 * The SDK defaults to Node.js `ws` which doesn't work in the browser, so we provide
 * a factory that uses the native browser WebSocket object instead.
 *
 * The returned object acts as both a WebSocket and an EventEmitter, matching the
 * shape of Node's `ws` module which extends `events.EventEmitter`.
 */
export function createBrowserWebSocketFactory() {
    return {
        create: (url: string, _options?: any) => {
            const ws = new WebSocket(url);
            const eventListeners = new Map<string, Function[]>();

            // Helper to get or create listener array for an event
            const getListeners = (event: string) => {
                if (!eventListeners.has(event)) {
                    eventListeners.set(event, []);
                }
                return eventListeners.get(event)!;
            };

            // The interface object that will be returned - it IS the emitter
            const interfaceObj: any = {
                get readyState() { return ws.readyState; },
                send: (data: string) => ws.send(data),
                close: () => ws.close(),
            };

            // --- EventEmitter methods (all return `this` = interfaceObj where applicable) ---

            const on = (event: string, callback: Function) => {
                getListeners(event).push(callback);
                return interfaceObj;
            };

            interfaceObj.on = on;
            interfaceObj.addListener = on;

            interfaceObj.off = (event: string, callback: Function) => {
                const cbs = eventListeners.get(event);
                if (cbs) {
                    eventListeners.set(event, cbs.filter(cb => cb !== callback));
                }
                return interfaceObj;
            };
            interfaceObj.removeListener = interfaceObj.off;

            interfaceObj.once = (event: string, callback: Function) => {
                const onceFn = (...args: any[]) => {
                    callback(...args);
                    interfaceObj.off(event, onceFn);
                };
                return on(event, onceFn);
            };

            interfaceObj.prependListener = (event: string, callback: Function) => {
                getListeners(event).unshift(callback);
                return interfaceObj;
            };

            interfaceObj.prependOnceListener = (event: string, callback: Function) => {
                const onceFn = (...args: any[]) => {
                    callback(...args);
                    interfaceObj.off(event, onceFn);
                };
                getListeners(event).unshift(onceFn);
                return interfaceObj;
            };

            interfaceObj.emit = (event: string, ...args: any[]) => {
                const cbs = eventListeners.get(event);
                if (cbs) {
                    const snapshot = cbs.slice();
                    snapshot.forEach(cb => cb(...args));
                }
                return true;
            };

            interfaceObj.removeAllListeners = (event?: string) => {
                if (event) {
                    eventListeners.delete(event);
                } else {
                    eventListeners.clear();
                }
                return interfaceObj;
            };

            interfaceObj.setMaxListeners = () => interfaceObj;

            // --- Query methods (return values, not `this`) ---

            interfaceObj.listeners = (event: string) => {
                return eventListeners.get(event)?.slice() || [];
            };
            interfaceObj.rawListeners = interfaceObj.listeners;

            interfaceObj.listenerCount = (event: string) => {
                return eventListeners.get(event)?.length || 0;
            };

            interfaceObj.getMaxListeners = () => 10;

            interfaceObj.eventNames = () => {
                return Array.from(eventListeners.keys());
            };

            // Forward native WebSocket events to our emitter
            ws.addEventListener('open', () => {
                console.log('[ElevenLabs WS] Connection opened');
                interfaceObj.emit('open');
            });
            ws.addEventListener('message', (e: MessageEvent) => {
                console.log('[ElevenLabs WS] Received message:', typeof e.data === 'string' ? e.data.substring(0, 100) : '[binary]');
                interfaceObj.emit('message', e.data);
            });
            ws.addEventListener('close', (e: CloseEvent) => {
                console.log('[ElevenLabs WS] Connection closed:', e.code, e.reason);
                interfaceObj.emit('close', e.code, e.reason);
            });
            ws.addEventListener('error', (e: Event) => {
                console.error('[ElevenLabs WS] Connection error:', e);
                interfaceObj.emit('error', e);
            });

            return interfaceObj;
        },
    };
}
