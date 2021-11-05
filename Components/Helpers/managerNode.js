/* eslint-disable prettier/prettier */
const io = require('socket.io-client');

//...
const socket = io('http://localhost:9999', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 100,
  reconnectionDelayMax: 100,
});

export default socket;
