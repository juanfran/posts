const WebSocket = require('ws');
const dgram = require('dgram');

const CONFIG = require('./config.json');

let SPEED = 100;

const wss = new WebSocket.Server({
  port: 8080
});

wss.on('message', (msg) => {
  console.log(msg);

  wss.send('test back');
})

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    console.log(msg);

    ws.send('test back');
  })
});

// Connect Drone
const drone = dgram.createSocket('udp4');
drone.bind(CONFIG.PORT);

const droneState = dgram.createSocket('udp4');
droneState.bind(CONFIG.STATE_PORT);

function runCommand(command) {
  console.log('command', command);
}

droneState.on('message', (message) => {
  let state = message
  .toString()
  .replace('\r\n', '')
  .split(';')
  .reduce((obj, it) => {
    const stat = it.split(':');

    obj[stat[0]] = stat[1];

    return obj;
  }, {});

  stats = state;
});

drone.on('message', (message) => {
  console.log(`drone : ${message}`);
});
