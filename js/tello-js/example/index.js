const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dgram = require('dgram');

const CONFIG = require('./config.json');

// Connect Drone
const drone = dgram.createSocket('udp4');
drone.bind(CONFIG.PORT);

const droneState = dgram.createSocket('udp4');
droneState.bind(CONFIG.STATE_PORT);

// keypress events
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(false);

rl.question(`Input?`, (name) => {
  console.log(`-------------> ${name}!`);
  process.stdin.setRawMode(true);

  const onKeypress = (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else {
      console.log(`You pressed the "${str}" key`);
      console.log(key);
      console.log();
    }
  };

  process.stdin.on('keypress', onKeypress);

  setTimeout(() => {
    process.stdin.off('keypress', onKeypress);
  },3000);
});

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
