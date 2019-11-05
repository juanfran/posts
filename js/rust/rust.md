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

Primero replicamos la siguiente estructura de archivos.

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

En este ejemplo usamos `wasm-bindgen` para comunicarnos con JS. En `extern` estamos diciendole a Rust que vamos a ejecutar una función definida en otro módulo, wasm-bindgen se encargará de facilitar el `alert` de JS. Y en `pub fn greet` estamos creando una función pública que podremos ejecutar desde JS que lanzara el `alert` con una cadena de texto.

```rust
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

### Hola mundo en JS -> Rust

Ahora en la raiz de nuestro proyecto vamos a crear más archivos para que nos quede la siguiente estructura.

```shell
├── pkg
├── src
    ├── lib.rs
├── Cargo.toml
├── package.json
├── index.html
├── init.js
├── webpack.config.js
├── main.js
```

#### package.json

En este `package.json` hemos instalado varias dependencias `webpack` y `webpack-dev-server` para gestionar los módulos y servir nuestro ejemplo. En `dependencies` creamos el módulo `wasm` que apunta a la carpeta `pkg` creada en el build anterior.

```json
{
  "name": "example",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "dependencies": {
    "wasm": "file:./pkg/"
  },
  "devDependencies": {
    "webpack": "^4.41.2",
    "webpack-cli": "^3.3.10",
    "webpack-dev-server": "^3.9.0"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

#### index.html

Creamos un html básico que simplemente llama a init.js que se encargará de hacer el bootstrap.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hello</title>
  </head>
  <body>
    <script src="./init.js"></script>
  </body>
</html>
```

#### init.js

Aquí simplemente importamos el módulo `main.js` donde estará la lógica principal de JS en este ejemplo.

```js
import('./main.js')
  .catch(e => console.error('Error importing `index.js`:, e));
```

#### webpack.config.js

Configuración básica de webpack, importante indicar en el entry el mismo fichero que en nuestro index.html.

```js
const path = require('path');

module.exports = {
  entry: './init.js',
  mode: 'development'
};
```

#### main.js

```js
import * as wasm from 'wasm';

wasm.greet('Rust');
```

Ya tenemos todo listo, ahora ejecutamos `npx webpack-dev-server` y vamos a http://localhost:8080/

![alert](https://raw.githubusercontent.com/juanfran/posts/master/js/rust/assets/alert.png)

No es muy impresionate pero como veis la comunicación es sencilla. 

### Rendimiento

Una de las ventajas de Rust es el rendimiento y aunque no es un ejemplo muy realista por su sencillez y exigencia vamos a ejecutar fibonacci de forma de recursiva en JS y Rusta para ver las diferencias.

Primero añadimos una nueva función pública a `src/lib.rs` y volvemos a ejecutar `wasm-pack build`.

```rust
#[wasm_bindgen]
pub fn fib(n: i32) -> u64 {
  if n <= 1 { return 1 as u64 }
  fib(n - 1) + fib(n - 2)
}
```

En `main.js` escribimos la función de fibonacci en JS. A continuación ejecutamos y medimos el tiempo de ejecución en Rust y JS con indice 40.

```js
import * as wasm from "wasm";

function fibonacciJS(n) {
  if (n <= 1){
    return 1;
  }

  return fibonacciJS(n - 1) + fibonacciJS (n - 2)
}

console.time('fibonacciRust');
wasm.fib(40);
console.timeEnd('fibonacciRust');

console.time('fibonacciJS');
fibonacciJS(40);
console.timeEnd('fibonacciJS');
```

```shelll
main.js:18 fibonacciRust: 489.605712890625ms
main.js:22 fibonacciJS: 1017.113037109375ms
```

Como veis JS tarda el doble que Rust en hacer la misma operación.

### Debugger

### DOM


### Webpack + Rust
TODO


creamos ficheros de example

wasm-pack build

//meter en package.json
npm install -g webpack-cli

copy-webpack-plugin

webpack new WasmPackPlugin({


### Documentación 
https://doc.rust-lang.org/book/
https://rustwasm.github.io/docs/wasm-bindgen/
https://rustwasm.github.io/docs/book/
https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm

Doc

https://rustwasm.github.io/docs.html
https://rustwasm.github.io/docs/wasm-bindgen/examples/console-log.html
https://rustwasm.github.io/docs/book/
https://rustwasm.github.io/docs/book/game-of-life/hello-world.html
https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm