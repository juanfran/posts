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

#[wasm_bindgen(start)]
pub fn init() -> Result<(), JsValue> {
  let window = web_sys::window().expect("window not found");
  let document = window.document().expect("document not found");
  let body = document.body().expect("body not found");

  let val = document.create_element("h1")?;
  val.set_inner_html("Hello JS");

  body.append_child(&val)?;

  Ok(())
}
