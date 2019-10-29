const WebSocket = require('ws');
const dgram = require('dgram');

const CONFIG = require('./config.json');

const wss = new WebSocket.Server({
  port: 8080
});

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    console.log('msg', msg);
    const controls = JSON.parse(msg);
    const command = `rc ${controls.a * CONFIG.speed} ${controls.b * CONFIG.speed} ${controls.c * CONFIG.speed} ${controls.d * CONFIG.speed}`;
    console.log('command', command);

    ws.send('test back');
  })
});

// Connect Drone
const drone = dgram.createSocket('udp4');
drone.bind(CONFIG.port);

const droneState = dgram.createSocket('udp4');
droneState.bind(CONFIG.statePort);

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
