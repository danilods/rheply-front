// WebSocket client stub for real-time features
// TODO: Implement actual WebSocket connection when backend is ready

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface WebSocketClient {
  connect: (token?: string) => void;
  disconnect: () => void;
  send: (type: string, payload: unknown) => void;
  subscribe: (channel: string, callback: (message: WebSocketMessage) => void) => () => void;
  isConnected: () => boolean;
  on: (event: string, callback: (data: unknown) => void) => () => void;
  off: (event: string, callback: (data: unknown) => void) => void;
  onConnect: (callback: () => void) => () => void;
  onDisconnect: (callback: () => void) => () => void;
}

class MockWebSocketClient implements WebSocketClient {
  private connected = false;
  private subscriptions = new Map<string, Set<(message: WebSocketMessage) => void>>();
  private eventListeners = new Map<string, Set<(data: unknown) => void>>();
  private connectCallbacks = new Set<() => void>();
  private disconnectCallbacks = new Set<() => void>();

  connect(_token?: string) {
    console.log("[WebSocket] Mock connection established");
    this.connected = true;
    this.connectCallbacks.forEach((cb) => cb());
  }

  disconnect() {
    console.log("[WebSocket] Mock connection closed");
    this.connected = false;
    this.disconnectCallbacks.forEach((cb) => cb());
    this.subscriptions.clear();
  }

  onConnect(callback: () => void) {
    this.connectCallbacks.add(callback);
    // If already connected, call immediately
    if (this.connected) {
      callback();
    }
    return () => {
      this.connectCallbacks.delete(callback);
    };
  }

  onDisconnect(callback: () => void) {
    this.disconnectCallbacks.add(callback);
    return () => {
      this.disconnectCallbacks.delete(callback);
    };
  }

  send(type: string, payload: unknown) {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    console.log("[WebSocket] Mock message sent:", message);
  }

  subscribe(channel: string, callback: (message: WebSocketMessage) => void) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscriptions.get(channel)?.delete(callback);
    };
  }

  isConnected() {
    return this.connected;
  }

  on(event: string, callback: (data: unknown) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: (data: unknown) => void) {
    this.eventListeners.get(event)?.delete(callback);
  }

  // For testing: simulate receiving a message
  simulateMessage(channel: string, message: WebSocketMessage) {
    const callbacks = this.subscriptions.get(channel);
    if (callbacks) {
      callbacks.forEach((cb) => cb(message));
    }
  }

  // For testing: emit an event
  emit(event: string, data: unknown) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}

export const wsClient = new MockWebSocketClient();
