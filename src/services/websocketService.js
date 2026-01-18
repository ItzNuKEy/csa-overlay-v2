let WebSocketClass;

if (typeof window === "undefined") {
  // Node.js
  const wsModule = await import("ws");
  WebSocketClass = wsModule.default;
} else {
  // Browser
  WebSocketClass = WebSocket;
}

export const WebsocketService = {
    __subscribers: {},
    websocket: undefined,
    webSocketConnected: false,

    // ✅ NEW
    status: "down", // "down" | "connecting" | "up"
    lastError: "",
    reconnectTimer: null,
    reconnectDelayMs: 1000,
    port: 49322,
    debug: false,
    debugFilters: undefined,

    registerQueue: [],
    init: function (port, debug, debugFilters) {
        WebsocketService.port = port || 49322;
        WebsocketService.debug = debug || false;
        WebsocketService.debugFilters = debugFilters;

        // ✅ start first connection
        WebsocketService.connect();
    },

    connect: function () {
        // clear any old timer
        if (WebsocketService.reconnectTimer) {
            clearTimeout(WebsocketService.reconnectTimer);
            WebsocketService.reconnectTimer = null;
        }

        WebsocketService.status = "connecting";
        WebsocketService.triggerSubscribers("ws", "status", {
            status: WebsocketService.status,
            lastError: WebsocketService.lastError,
        });

        const url = `ws://localhost:${WebsocketService.port}`;
        try {
            WebsocketService.webSocket = new WebSocketClass(url);
        } catch (e) {
            WebsocketService.lastError = `Failed to create WebSocket: ${e?.message ?? e}`;
            WebsocketService.webSocketConnected = false;
            WebsocketService.status = "connecting";
            WebsocketService.scheduleReconnect();
            return;
        }

        WebsocketService.webSocket.onmessage = async function (event) {
            let raw = event.data;
            let text;

            try {
                if (typeof raw === "string") {
                    // normal case
                    text = raw;
                } else if (typeof Blob !== "undefined" && raw instanceof Blob) {
                    // browser Blob
                    text = await raw.text();
                } else if (raw instanceof ArrayBuffer) {
                    // browser binary
                    text = new TextDecoder("utf-8").decode(raw);
                } else if (typeof Buffer !== "undefined" && raw instanceof Buffer) {
                    // Node ws buffer
                    text = raw.toString("utf8");
                } else {
                    console.warn("[WebsocketService] Unknown message type from ws:", raw);
                    return;
                }
            } catch (e) {
                console.error("[WebsocketService] Failed to read WS message", e, raw);
                return;
            }

            let jEvent;
            try {
                jEvent = JSON.parse(text);
            } catch (e) {
                console.error("[WebsocketService] Failed to parse WS JSON:", text, e);
                return;
            }

            if (!jEvent || !jEvent.hasOwnProperty("event")) return;

            // ✅ If we're receiving messages, we are truly "up"
            if (WebsocketService.status !== "up") {
                WebsocketService.status = "up";
                WebsocketService.triggerSubscribers("ws", "status", {
                    status: WebsocketService.status,
                    lastError: WebsocketService.lastError,
                });
            }

            const eventSplit = jEvent.event.split(":");
            const channel = eventSplit[0];
            const event_event = eventSplit[1];

            if (WebsocketService.debug) {
                const filters = WebsocketService.debugFilters;
                if (!filters) console.log(channel, event_event, jEvent);
                else if (filters.indexOf(jEvent.event) < 0) console.log(channel, event_event, jEvent);
            }

            WebsocketService.triggerSubscribers(channel, event_event, jEvent.data);
        };

        WebsocketService.webSocket.onopen = function () {
            WebsocketService.triggerSubscribers("ws", "open");
            WebsocketService.webSocketConnected = true;

            // ✅ Connected at socket-level: "connecting" -> "up" (or keep "connecting" until first message if you prefer)
            WebsocketService.status = "up";
            WebsocketService.lastError = "";
            WebsocketService.triggerSubscribers("ws", "status", {
                status: WebsocketService.status,
                lastError: WebsocketService.lastError,
            });

            WebsocketService.registerQueue.forEach((r) => {
                WebsocketService.send("wsRelay", "register", r);
            });
            WebsocketService.registerQueue = [];
        };

        WebsocketService.webSocket.onerror = function (err) {
            WebsocketService.triggerSubscribers("ws", "error", err);
            WebsocketService.webSocketConnected = false;
            WebsocketService.status = "connecting"; // ✅ yellow
            WebsocketService.lastError = "Socket error";
            WebsocketService.triggerSubscribers("ws", "status", {
                status: WebsocketService.status,
                lastError: WebsocketService.lastError,
            });
        };

        WebsocketService.webSocket.onclose = function () {
            WebsocketService.triggerSubscribers("ws", "close");
            WebsocketService.webSocketConnected = false;
            WebsocketService.status = "connecting"; // ✅ yellow while retrying
            WebsocketService.triggerSubscribers("ws", "status", {
                status: WebsocketService.status,
                lastError: WebsocketService.lastError,
            });

            WebsocketService.scheduleReconnect();
        };
    },

    scheduleReconnect: function () {
        if (WebsocketService.reconnectTimer) return;

        WebsocketService.reconnectTimer = setTimeout(() => {
            WebsocketService.reconnectTimer = null;
            WebsocketService.connect();
        }, WebsocketService.reconnectDelayMs);
    },

    /**
     * Add callbacks for when certain events are thrown
     * Execution is guaranteed to be in First In First Out order
     * @param channels
     * @param events
     * @param callback
     */
    subscribe: function(channels, events, callback) {
        if (typeof channels === "string") {
            let channel = channels;
            channels = [];
            channels.push(channel);
        }
        if (typeof events === "string") {
            let event = events;
            events = [];
            events.push(event);
        }
        channels.forEach(function(c) {
            events.forEach(function (e) {
                if (!WebsocketService.__subscribers.hasOwnProperty(c)) {
                    WebsocketService.__subscribers[c] = {};
                }
                if (!WebsocketService.__subscribers[c].hasOwnProperty(e)) {
                    WebsocketService.__subscribers[c][e] = [];
                    if (WebsocketService.webSocketConnected) {
                        WebsocketService.send("wsRelay", "register", `${c}:${e}`);
                    } else {
                        WebsocketService.registerQueue.push(`${c}:${e}`);
                    }
                }
                WebsocketService.__subscribers[c][e].push(callback);
            });
        })
    },
    clearEventCallbacks: function (channel, event) {
        if (WebsocketService.__subscribers.hasOwnProperty(channel) && WebsocketService.__subscribers[channel].hasOwnProperty(event)) {
            WebsocketService.__subscribers[channel] = {};
        }
    },
    triggerSubscribers: function (channel, event, data) {
        if (WebsocketService.__subscribers.hasOwnProperty(channel) && WebsocketService.__subscribers[channel].hasOwnProperty(event)) {
            WebsocketService.__subscribers[channel][event].forEach(function(callback) {
                if (callback instanceof Function) {
                    callback(data);
                }
            });
        }
    },
    send: function (channel, event, data) {
        if (typeof channel !== 'string') {
            console.error("Channel must be a string");
            return;
        }
        if (typeof event !== 'string') {
            console.error("Event must be a string");
            return;
        }
        if (channel === 'local') {
            this.triggerSubscribers(channel, event, data);
        } else {
            let cEvent = channel + ":" + event;
            WebsocketService.webSocket.send(JSON.stringify({
                'event': cEvent,
                'data': data
            }));
        }
    }
};
