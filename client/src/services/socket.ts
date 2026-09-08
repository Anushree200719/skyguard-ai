import { io } from 'socket.io-client';

const PRODUCTION_SOCKET_URL = 'https://skyguard-aii.onrender.com';

const getSocketUrl = (): string => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl && typeof socketUrl === 'string' && socketUrl.trim() !== '') {
    return socketUrl.trim();
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && typeof apiUrl === 'string' && apiUrl.trim() !== '') {
    return apiUrl.trim().replace(/\/api\/?$/, '');
  }
  return PRODUCTION_SOCKET_URL;
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  secure: true
});
