/* eslint-disable prettier/prettier */
import io from 'socket.io-client';
const nodeURL = 'http://taxiconnectna.com:9097/';
//...
const socket = io(nodeURL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 100,
  reconnectionDelayMax: 200,
  autoConnect: true,
});

export default socket;
