import * as wasm from "wasm";

function fibonacciJS(n) {
  if (n <= 1){
    return 1;
  }

  return fibonacciJS(n - 1) + fibonacciJS (n - 2)
}

// wasm.greet("Rust");
const runs = 40;

console.time('fibonacciRust');
console.log(wasm.fib(runs));
console.timeEnd('fibonacciRust');

console.time('fibonacciJS');
console.log(fibonacciJS(runs));
console.timeEnd('fibonacciJS');

// wasm.init();
