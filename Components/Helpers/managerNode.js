/* eslint-disable prettier/prettier */
import io from 'socket.io-client';
//const nodeURL = 'http://taxiconnectna.com:7005/'; //Local
const nodeURL = 'http://localhost:9097/';
//...
const socket = io(nodeURL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 2000,
});

export default socket;
