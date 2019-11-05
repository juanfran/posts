use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn fib(n: i32) -> u64 {
  if n <= 1 { return 1 as u64 }
  fib(n - 1) + fib(n - 2)
}
