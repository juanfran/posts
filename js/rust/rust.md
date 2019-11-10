# WebAssembly con Rust para desarrolladores JS

Si eres desarrollador de JavaScript en este tutorial vamos a ver algunos ejemplos básicos de cómo puedes ir empezando a usar [WebAssembly](https://webassembly.org/) escrito en [Rust](https://www.rust-lang.org/) en tus aplicaciones JS.

## Instalación (unix)

Lo primero que vamos hacer es instalar `rustup` que es el instalador oficial de Rust. Esto nos permitirá cambiar entre versiones de forma fácil.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Ahora instalamos `wasm-pack`. Con esta biblioteca podemos convertir nuestro código de Rust a WebAssembly fácilmente.

```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

## Hola mundo en Rust

A continuación, creamos la siguiente estructura de archivos.

```shell
├── Cargo.toml
├── src
    ├── lib.rs
```

#### Cargo.toml

`Cargo.toml` es el equivalente al típico `package.json`. Indicamos la información básica en nuestra biblioteca de Rust y añadimos como dependencia `wasm-bindgen` que nos ayudará a comunicar JavaScript y Rust.

Con `wasm-bindgen` importamos a Rust la manipulación del DOM o logging propias de JS y exportamos a JS la funcionalidad de Rust. Además, si usamos Typescript `wasm-bindgen` nos generará los `.d.ts`.

Por último, añadimos `crate-type = ["cdylib"]`, esto le dice a Rust que al hacer build haga una versión en `cdylib` de nuestro paquete, o sea, que genere los .so, .dll.

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
En `lib.rs` vamos a meter todo el código de ejemplo en Rust. Si no has programado antes en Rust puedes consultar el libro gratuito. [The Rust Programming Language](https://doc.rust-lang.org/book/). Vamos a intentar que los ejemplos sean lo más sencillos posible para que puedas desenvolverte lo suficiente sin entender del todo Rust.

En este código empezamos a usar `wasm-bindgen` para comunicarnos con JS. En `extern` estamos diciéndole a Rust que vamos a ejecutar una función definida en otro módulo, wasm-bindgen se encargará de facilitar el `alert` de JS. Y en `pub fn greet` estamos creando una función pública que podremos ejecutar desde JS y que lanzará el `alert` con una cadena de texto.

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

Ahora si todo es correcto podemos ejecutar `wasm-pack build` y la primera vez veremos algo como esto:

![build](https://raw.githubusercontent.com/juanfran/posts/master/js/rust/assets/build.png)

Al terminar en el directorio aparecerán los siguientes archivos:

`hello_rust_bg.wasm` Este archivo contiene el binario generado por Rust de nuestro código en ´lib.rs`.

`hello_rust.js` Este archivo es generado por `wasm-bindgen` y actúa como puente entre el binario y JS. Se encarga de enviarle al binario las funciones de JS que pueda necesitar y la conversión de tipos si es necesaria. Echale un vistazo porque es bastante interesante.

`hello_rust.d.ts` Contiene la declaración de tipos de Typescript.

`package.json` Información necesaria si queremos publicar como biblioteca.

## Hola mundo en JS -> Rust

Ahora en la raíz de nuestro proyecto vamos a crear más archivos para que nos quede la siguiente estructura:

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

En este `package.json` hemos instalado varias dependencias como `webpack` y `webpack-dev-server` para gestionar los módulos y servir nuestro ejemplo. En `dependencies` creamos el módulo `wasm` que apunta a la carpeta `pkg` creada en el build anterior.

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

Creamos un html básico que simplemente llama a init.js y que se encargará de hacer el bootstrap del ejemplo.

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

Aquí simplemente importamos el módulo `main.js` donde estará la lógica principal de JS.

```js
import('./main.js')
  .catch(e => console.error('Error importing `index.js`:, e));
```

#### webpack.config.js

Esta es la configuración básica de webpack. Es importante indicar en el entry el mismo fichero que en nuestro index.html.

```js
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

Importamos `wasm` tal como hemos indicado en el `package.json` y llamamos a la función definida en Rust de `greet`.

Ya tenemos todo listo, ahora ejecutamos `npx webpack-dev-server` y vamos a http://localhost:8080/

![alert](https://raw.githubusercontent.com/juanfran/posts/master/js/rust/assets/alert.png)

No es muy impresionante, pero como ves la comunicación es muy sencilla.

Si queremos simplificar el proceso podemos instalar el plugin de webpack [wasm-pack-plugin](https://github.com/wasm-tool/wasm-pack-plugin) para no tener que hacer `wasm-pack build` por cada cambio en Rust.

## Rendimiento

Una de las ventajas de Rust vs JS es el rendimiento, aunque no es un ejemplo muy realista por su sencillez y exigencia, vamos a ejecutar Fibonacci de forma recursiva en JS y Rust para ver las diferencias.

Primero añadimos Fibonacci como una nueva función pública en `src/lib.rs` y volvemos a lanzar `wasm-pack build`.

```rust
#[wasm_bindgen]
pub fn fib(n: i32) -> u64 {
  if n <= 1 { return 1 as u64 }
  fib(n - 1) + fib(n - 2)
}
```

En `main.js` escribimos la misma función de Fibonacci en JS. A continuación, vamos a medir el tiempo de ejecución en Rust y JS con índice 40.

```js
import * as wasm from "wasm";

function fibonacciJS(n) {
  if (n <= 1){
    return 1;
  }

  return fibonacciJS(n - 1) + fibonacciJS (n - 2)
}

console.time('FibonacciRust');
wasm.fib(40);
console.timeEnd('FibonacciRust');

console.time('FibonacciJS');
fibonacciJS(40);
console.timeEnd('FibonacciJS');
```

```shell
main.js:18 FibonacciRust: 489.605712890625ms
main.js:22 FibonacciJS: 1017.113037109375ms
```

Como te habrás dado cuenta JS tarda el doble que Rust en hacer la misma operación.

## DOM

Con `wasm-bindgen` también podemos manipular el DOM desde Rust, pero necesitamos una nueva la biblioteca, `web-sys`. Primero la añadimos en el `Cargo.toml` con las features que queramos.

```toml
[dependencies.web-sys]
version = "0.3.30"
features = [
  'Document',
  'Element',
  'HtmlElement',
  'Node',
  'Window',
]
```


Editamos `src/lib.rs` y añadimos la siguiente función:

```rust
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
```

Aquí tenemos unas cuantas cosas nuevas que si no conoces Rust pueden confundirte, vamos a repasar lo básico.

`#[wasm_bindgen(start)]`: Con esto `wasm_bindgen` ejecutará esta función en cuanto sea importando, no vamos a tener que llamar manualmente a `init`.

`web_sys::window().expect("window not found")`: Estamos pidiendo a web_sys el objeto window de JS y el expect es el mensaje de error si no lo encuentra.

`?`: La interrogación es para hacer el control de errores más fácil, es un shortcut de este código.

```rust
let val = match document.create_element("h1") {
  Ok(v) => v,
  Err(e) => return Err(e)
};
```

`&`: Mandamos a `apend_child` la referencia al objeto que hay en `val`.

`Ok(())`: Se espera que la función `init` devuelva un resultado o un error. Con `Ok` estamos diciendo que todo ha ido bien, un resultado vacío.

Si volvemos hacer `wasm-pack build` podemos ver que al cargar tenemos h1 creado en Rust.

![hello](https://raw.githubusercontent.com/juanfran/posts/master/js/rust/assets/hello.png)

## Conclusión 

Hemos podido hacer lo básico para poder ejecutar WebAssemby, escrito en Rust, en JavaScript. Si te interesa seguir aprendiendo aquí tienes los siguientes enlaces. Espero que te haya sido útil.

https://doc.rust-lang.org/book/

https://rustwasm.github.io/docs/wasm-bindgen/

https://rustwasm.github.io/docs/book/

https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm
