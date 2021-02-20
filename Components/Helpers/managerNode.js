/* eslint-disable prettier/prettier */
const io = require('socket.io-client');
const nodeURL = 'http://192.168.43.44:9097';
//...
const socket = io(nodeURL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 900,
  reconnectionDelayMax: 100,
  'force new connection': true,
});

export default socket;
