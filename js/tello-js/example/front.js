const WS_URL = 'ws://0.0.0.0:8080';
const ws = new WebSocket(WS_URL);

function takeOff() {

}

function land() {

}

ws.onopen = () => {
  ws.onmessage = (message) => {
    console.log(message);
  };
};

const keys = new Set();

function dronMove() {
  /* a: left/right
   * b: forward/backward
   * c: up/down
   * d: yaw
   */
  const rc = {
    a: 0,
    b: 0,
    c: 0,
    d: 0
  }
  console.log(keys);

  if (keys.has('ArrowLeft')) {
    rc.a = -1;
  } else if (keys.has('ArrowRight')) {
    rc.a = 1;
  }

  if (keys.has('ArrowUp')) {
    rc.b = -1;
  } else if (keys.has('ArrowDown')) {
    rc.b = 1;
  }

  if (keys.has('w')) {
    rc.c = -1;
  } else if (keys.has('s')) {
    rc.c = 1;
  }

  if (keys.has('a')) {
    rc.d = -1;
  } else if (keys.has('d')) {
    rc.d = 1;
  }

  ws.send(JSON.stringify(rc));
}

document.addEventListener('keydown', (event) => {
  keys.add(event.key);

  dronMove();
});

document.addEventListener('keyup', (event) => {
  keys.delete(event.key);

  dronMove();
});
