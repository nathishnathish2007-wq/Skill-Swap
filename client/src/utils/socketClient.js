import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

export function createSocket(token) {
  return io(SOCKET_URL, {
    autoConnect: Boolean(token),
    auth: { token },
    transports: ['websocket', 'polling']
  });
}
