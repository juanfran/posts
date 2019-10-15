const WS_URL = 'ws://0.0.0.0:8080';
const ws = new WebSocket(WS_URL);

function takeOff() {

}

funcion land() {

}

ws.onopen = () => {
  ws.onmessage = (message) => {
    console.log(message);
  };

  ws.send('test');
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
}

function dronMove() {
  console.log(keys);
}

document.addEventListener('keydown', (event) => {
  if (keys[event.key] !== undefined) {
    keys[event.key] = true;
  }

  dronMove();
});

document.addEventListener('keyup', (event) => {
  if (keys[event.key] !== undefined) {
    keys[event.key] = false;
  }

  dronMove();
});
