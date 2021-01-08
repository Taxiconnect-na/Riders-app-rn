/* eslint-disable prettier/prettier */
import io from 'socket.io-client';
//const nodeURL = 'http://taxiconnectna.com:7005/'; //Local
const nodeURL = 'http://192.168.43.44:9097/';
//...
const socket = io(nodeURL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 100,
  reconnectionDelayMax: 900,
});

export default socket;
