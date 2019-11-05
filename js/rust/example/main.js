import * as wasm from "wasm";

// wasm.greet("xx");
const runs = 41;

console.time('fibonacciRust');
console.log(wasm.fib(runs));
console.timeEnd('fibonacciRust');

function fibonacciJS(n) {
    if (n <= 1){
      return 1;
    }
    return fibonacciJS(n - 1) + fibonacciJS (n - 2)
  }

console.time('fibonacciJS');
console.log(fibonacciJS(runs));
console.timeEnd('fibonacciJS');
