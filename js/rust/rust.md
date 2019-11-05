# WebAssembly para desarrolladores JS

## Preparando el entorno

### Instalación (unix)

Lo primero que vamos hacer es intalar `rustup` que es el instalador oficial de Rust, nos permitirá cambiar entre versiones de forma fácil.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Ahora instalamos `wasm-pack`. Esta biblitoca nos permite convertir nuestro código Rust a WebAssembly muy facilmente.

```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### Hola mundo en Rust

Ahora vamos a crear 

```shell
├── Cargo.toml
├── src
    ├── lib.rs
```

#### Cargo.toml

Este es el equivalente al típico `package.json`. Indicamos la información básica nuestra biblioteca de Rust y añadimos como dependencia `wasm-bindgen` que nos permitirá comunicar Javascript y Rust.

Con `wasm-bindgen` importamos a Rust funcionalidades de JS como manipulación del DOM o logging y exportamos funcionalidad que hagamos en Rust a JS. Además si usamos typescript nos generará los `.d.ts`.

Y por último `crate-type = ["cdylib"]` esto le dice a Rust que al hacer el build a haga una versión en `cdylib` de nuestro paquete, osea que genere los .so, .dll.

```toml
[package]
name = "hello_rust"
version = "0.1.0"
authors = ["Blog"]
edition = "2018"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2.50"
```

#### src/lib.rs
En `lib.rs` vamos a meter todo el código de ejemplo de Rust. Si no habeis programado en Rust antes podeis consultar el libro gratuito. [The Rust Programming Language](https://doc.rust-lang.org/book/).

En este ejemplo usamos `wasm-bindgen` para comunicarnos con JS en el `extern` estamos importando el alert de JS y `pub fn greet` estamos creando una función pública que podremos ejecutar desde JS.

```rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
```

Ahora si todo es correcto podemos ejecutar `wasm-pack build` y la primera vez veremos algo como esto.

![build](https://raw.githubusercontent.com/juanfran/posts/master/js/rust/assets/build.png)

Al terminar en el directorio aparecerán los siguientes archivos.

`hello_rust_bg.wasm` Este archivo contiene en binario generado por Rust de nuestro código en ´lib.rs`.

`hello_rust.js` Este archivo es generado por `wasm-bindgen` y actua como puente entre el binario y JS, se encarga de enviarla al binario las funciones de JS que pueda necesitar y la conversión de tipos si es necesaria. Echarle un vistazo porque es bastante interesante.

`hello_rust.d.ts` Contiene la declaración de tipos de Typescript.

`package.json` Información necesaria si queremos publicar nuestro hola mundo como biblioteca.

creamos ficheros de example

wasm-pack build

//meter en package.json
npm install -g webpack-cli

copy-webpack-plugin

webpack new WasmPackPlugin({

Doc
https://rustwasm.github.io/docs.html
https://rustwasm.github.io/docs/wasm-bindgen/examples/console-log.html
https://rustwasm.github.io/docs/book/
https://rustwasm.github.io/docs/book/game-of-life/hello-world.html
https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm