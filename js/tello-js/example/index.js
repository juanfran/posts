setTimeout(() => {
  console.log('end');
  // process.exit();
}, 10000);

const readline = require('readline');
const Writable = require('stream').Writable;

var mutableStdout = new Writable({
  write: (chunk, encoding, callback) => {
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }

    callback();
  }
});

const dgram = require('dgram');

const CONFIG = require('./config.json');

let SPEED = 100;

// Connect Drone
const drone = dgram.createSocket('udp4');
drone.bind(CONFIG.PORT);

const droneState = dgram.createSocket('udp4');
droneState.bind(CONFIG.STATE_PORT);

// keypress events
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

function runCommand(command) {
  console.log('command', command);
}

console.log('Press any key to take off');
console.log();

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

let takeoff = false;

const onKeypress = (str, key) => {
  if (!takeoff) {
    runCommand('command');
    runCommand(`speed ${SPEED}`);
    runCommand('takeoff');

    takeoff = true;
  } else {
    if (key.ctrl && key.name === 's') {
      process.stdin.setRawMode(false);
      process.stdin.off('keypress', onKeypress);

      const rl = readline.createInterface({
        input: process.stdin,
        output: mutableStdout
      });

      mutableStdout.stdoutMuted = true;

      rl.question(`Set new speed: `, (newSpeed) => {
        SPEED = newSpeed;
        runCommand(`speed ${SPEED}`);

        process.stdin.setRawMode(true);
        process.stdin.on('keypress', onKeypress);

        rl.close();
      });
    } else if (key.ctrl && key.name === 'c') {
      runCommand('land');
      process.exit();
    } else {
      console.log(`You pressed the "${str}" key`);
      console.log(key);
      console.log();
    }
  }
};

const onKeyup = (str, key) => {
  console.log(`You pressed the "${str}" key`);
  console.log(key);
  console.log();
};

process.stdin.on('keypress', onKeypress);


