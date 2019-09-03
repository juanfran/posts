# Pilotando un Drone desde Node

Wifi
UDP

```javascript
const drone = dgram.createSocket('udp4');
drone.bind(PORT);

const droneState = dgram.createSocket('udp4');
droneState.bind(STATE_PORT);

function droneRun(command) {
  console.log('drone command:', command);
  drone.send(command, 0, command.length, PORT, HOST, handleError);

  return new Promise((resolve) => {
    currentPromiseResolver = resolve;
  });
}

drone.on('message', (message) => {
  console.log(`drone : ${message}`);
  currentPromiseResolver(message);
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

async function initDrone() {
  await droneRun('command');
  await droneRun('speed 100');
  await droneRun('streamon');
}

const messageRecived = (data) => {
  console.log('front message:', data);
  if (data === 'photo') {
    photoCount++;
    fs.writeFile(`photo${photoCount}.jpg`, lastImg, (err) => {});
    return Promise.resolve();
  }

  return droneRun(data);
};

function getStats(ws) {
  ws.send(JSON.stringify({
    battery: String(stats.bat || 0).replace('\r\n', ''),
    tof: String(stats.tof || 0).replace('\r\n', ''),
  }));
}
```

https://github.com/dji-sdk/Tello-Python
https://github.com/PIWEEK/drone-vr