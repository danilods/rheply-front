// WebSocket module - re-exports from websocket-client
// This provides a function-based API for getting the WebSocket client

import { wsClient } from './websocket-client';

export function getWebSocketClient() {
  return wsClient;
}

export { wsClient };
