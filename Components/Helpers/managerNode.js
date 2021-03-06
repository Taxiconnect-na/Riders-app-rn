/* eslint-disable prettier/prettier */
const io = require('socket.io-client');
import {_MAIN_URL_ENDPOINT} from '@env';

//...
const socket = io('http://taxiconnectna.com:9097', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 100,
  reconnectionDelayMax: 200,
});

export default socket;
