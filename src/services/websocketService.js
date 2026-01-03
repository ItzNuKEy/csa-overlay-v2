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
    registerQueue: [],
    init: function(port, debug, debugFilters) {
        port = port || 49322;
        debug = debug || false;
        if (debug) {
            if (debugFilters !== undefined) {
                console.warn("WebSocket Debug Mode enabled with filtering. Only events not in the filter list will be dumped");
            } else {
                console.warn("WebSocket Debug Mode enabled without filters applied. All events will be dumped to console");
                console.warn("To use filters, pass in an array of 'channel:event' strings to the second parameter of the init function");
            }
        }

        WebsocketService.webSocket = new WebSocketClass("ws://localhost:" + port);
        WebsocketService.webSocket.onmessage = function (event) {
            let jEvent = JSON.parse(event.data);
            if (!jEvent.hasOwnProperty('event')) {
                return;
            }
            let eventSplit = jEvent.event.split(':');
            let channel = eventSplit[0];
            let event_event = eventSplit[1];
            if (debug) {
                if (!debugFilters) {
                    console.log(channel, event_event, jEvent);
                } else if (debugFilters && debugFilters.indexOf(jEvent.event) < 0) {
                    console.log(channel, event_event, jEvent);
                }
            }
            WebsocketService.triggerSubscribers(channel, event_event, jEvent.data);
        };
        WebsocketService.webSocket.onopen = function () {
            WebsocketService.triggerSubscribers("ws", "open");
            WebsocketService.webSocketConnected = true;
            WebsocketService.registerQueue.forEach((r) => {
                WebsocketService.send("wsRelay", "register", r);
            });
            WebsocketService.registerQueue = [];
        };
        WebsocketService.webSocket.onerror = function () {
            WebsocketService.triggerSubscribers("ws", "error");
            WebsocketService.webSocketConnected = false;
        };
        WebsocketService.webSocket.onclose = function () {
            WebsocketService.triggerSubscribers("ws", "close");
            WebsocketService.webSocketConnected = false;
        };
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
