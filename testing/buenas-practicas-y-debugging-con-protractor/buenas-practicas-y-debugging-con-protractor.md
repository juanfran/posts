# Buenas prácticas y debugging con Protractor

Vamos a repasar una serie de consejos y funcionalidades para hacer nuestros tests de e2e con Protractor más fáciles de mantener y debuggear.

## Queries específicas de e2e

No es bueno usar las mismas clases para tus estilos y tu js que para tus test e2e. Es muy fácil que cuando estamos modificando el html borremos alguna clase que sea clave para que nuestros test e2e se ejecuten. Una forma de prevenirlo es añadir clases que solo se usen en los test e2e con un prefijo específico.

```html
<button class="btn-submit e2e-submit" (click)="onSubmit()">Enviar</button>
```

Estas clases podemos borrarlas al generar el código de producción, por ejemplo con webpack podemos hacerlo con `string-replace-loader`.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'string-replace-loader',
            options: {
              search: 'e2e-([a-z\-]+)',
              replace: '',
              flags: 'g'
            }
          }
        ]
      }
    ]
  }
};
```

## Usar asyn/await

A veces en nuestros test queremos esperar a tener un resultado específico, antes de continuar podemos esperar a que se resuelva la promesa con `.then`, pero nuestros test van a ser difíciles de entender o leer. 

```js
browser.getCurrentUrl().then((url) => {
  element(by.css('.e2e-posts')).count().then((postsCount) => {
    expect(postsCount).toEqual(10);
    expect(url).toEqual('www.kaleidos.net');
    done();
  });
});

```

Con asyn/await es mucho más legible.

```js
const url = await browser.getCurrentUrl();
const postsCount = await element(by.css('.e2e-posts')).count();

expect(postsCount).toEqual(10);
expect(url).toEqual('www.kaleidos.net');
```

Si empezamos a usar async/await podemos desactivar Selenium promise manager en nuestro protractor.conf.js

```js
exports.config = {
  SELENIUM_PROMISE_MANAGER: false,
};
```

## Añadir mensajes de error en browser.wait

Si tenemos muchos `browser.wait` puede llegar a ser difícil identificar cuál falla pero si le indicamos en su tercer parámetro un mensaje si ese wait expira sin cumplir la condición nos dará el mensaje anterior.

```js
browser.wait(() => {
  return false;
});

// x segundos después
// Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.
```

```js
browser.wait(() => {
  return false;
}, 1000, 'custom message');

// Failed: custom message
// Wait timed out after 1000ms
```

## Expected conditions

Con protractor y selenium tenemos una serie de condiciones muy útiles por las que podemos esperar en nuestros `browser.wait`. Veamos algunos ejemplos.

```js
// Esperando que el botón sea clickable
browser.get(URL);
const button = element(by.css('.e2e-button'))
const isClickable = EC.elementToBeClickable(button);	

await browser.wait(isClickable, 5000, 'the button is not clickable');
button.click();
```

```js
const button = element(by.css('.e2e-button'));
const list = element(by.css('.e2e-list-items'));

// este botón lanza una petición que rellena e2e-list-items
button.click();

const isVisible = EC.visibilityOf(list);						
await browser.wait(isVisible, 5000, 'the list is not visible');

// aquí ya podemos interacturar con e2e-list-items porque es visible
```

```js
// podemos combinar expected conditions
const urlChanged = async function() {
  const url = await browser.getCurrentUrl();

  return url === 'www.kaleidos.net';
};

const posts = element(by.css('.e2e-posts'));

// esperamos que la url haya cambiado y los posts sean visibles
const condition = EC.and(urlChanged, EC.visibilityOf(posts));
browser.get(URL);

await browser.wait(condition, 5000);
```

```js
const button = element(by.css('.e2e-button'))
const isClickable = EC.elementToBeClickable(button);						
await browser.wait(isClickable, 5000);
button.click();

// esperamos a que en el texto aparezca la palabra "delete"
await browser.wait(EC.textToBePresentInElement(button, 'delete'), 5000);
```

## Component Objects

Lo mejor que podemos hacer por la legibilidad de nuestros test es crear objetos que manejen partes específicas de la página. Estos objetos podrian manejar un componente muy concreto o una página entera. Veamos primero un ejemplo escrito sin objetos.

```js
describe('Posts', () => {
  it('publish', () => {
    // contamos los post al principio
    const oldPosts = element.all(by.css('.e2e-posts')).count();

    // rellenamos el campo de titulo
    element(by.css('.e2e-title')).sendKeys('title post');

    // enviamos el formulario
    element(by.css('.e2e-form-submit')).click();

    // esperamos que nos salga el mensaje de éxito
    browser.wait(() => {
      return element(by.css('.e2e-success')).isPresent();
    });

    // vemos si hay más posts que antes
    const newPosts = element.all(by.css('.e2e-posts')).count();
    expect(newPosts).toBeGreaterThan(oldPosts);
  });
});
```

Este test sin los comentarios sin ser un test complejo no es muy fácil de leer, además si un query selector cambia es muy posible que tengamos que cambiarlo en varios tests. Veamos ahora el mismo ejemplo usando una clase para manejar nuestra página de enviar posts.

```js
describe('Posts', () => {
  it('publish', () => {
    const postPage = new PostPage();

    const oldPosts = postPage.posts().count();

    const postForm = new PostForm();

    postForm.title('title post');
    postForm.submit();

    const newPosts = postPage.posts().count();
    expect(newPosts).toBeGreaterThan(oldPosts);
  });
});
```

Es exactamente lo mismo que lo anterior pero mucho más legible ¿verdad?, vemos ahora el código de nuestras dos clases PostPage  y PostForm.


```js
export class PostPage {
  public el: ElementFinder = null;
  
  constructor() {
    this.el = element(by.css('.e2e-posts-page'));
    browser.wait(EC.visibilityOf(this.el), 1000, 'PostPage is not ready');
  }

  posts() {
    // usamos como selector padre el selector del constructor
    return this.el.all(by.css('.e2e-post'));
  }
}

export class PostForm {
  public el: ElementFinder = null;
  
  constructor() {
    this.el = element(by.css('.e2e-posts-form'));
    browser.wait(EC.visibilityOf(this.el), 1000, 'PostForm is not ready');
  }

  title(text) {
    this.el.element(by.css('.e2e-title')).sendKeys(text);
  }

  send(text) {
    this.el.element(by.css('.e2e-submit')).click();

    const successMsg = element.all(by.css('e2e-success'));
                    
    return browser.wait(EC.visibilityOf(successMsg));
  }								
}	
```

Ahora tenemos toda la funcionalidad en pequeñas funciones que indican claramente a qué se dedican y además hemos añadido algo que no teníamos antes, en el constructor de cada objeto nos aseguramos que el componente con el que queremos interactuar está listo.

## Hightlight clicks

Empezamos con el debugging, a veces si estamos debuggeando un test e2e queremos saber al detalle qué está pasando, por ejemplo queremos ir viendo donde está protractor haciendo click, para ello simplemente tenemos que activarlo en nuestro protractor.conf y ahora nos resaltará el elemento justo antes de hacer click en él.

```js
exports.config = {
  //Enabling blocking proxy
  useBlockingProxy: true,
  //Delaying for 3 sec before interacting with element and hightlighting it
  highlightDelay: 3000,
  // disable directConnect
  directConnect: false
  // etc
};
```

Para hacerlo funcionar tenemos que deshabilitar antes el `directConnect` y activar `useBlockingProxy`, entonces podremos poner en `highlightDelay` cuanto queremos que esté el elemento seleccionado antes de hacer click.

![hightlight](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/h1.gif)

Como vemos en el gif antes de hacer click en el element vemos el foco.

## Logs

También podemos almacenar logs de todo lo que hace protractor.

```js
exports.config = {
  baseUrl: 'http://localhost:8000/',
  //Enabling blocking proxy
  useBlockingProxy: true,
  //Set ‘logs’ folder as location to save log file.
  webDriverLogDir: './',
  // disable directConnect
  directConnect: false,
  // etc
};
```

![logs](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/s2.jpg)

En la imagen podemos ver qué elementos ha buscado y donde ha hecho click, muy util si queremos averiguar dónde está fallando nuestro test.

## Debugging con chrome

Podemos ejecutar el debugger de chrome como en cualquier otra parte de nuestra app, para ello ponemos `debugger;` donde queremos que pare. 
Ahora lanzamos nuestros test de una forma algo distinta.

```shell
node --inspect-brk node_modules/.bin/protractor protractor.conf.js
```

Veremos este mensaje de confirmación.
![init](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/d1.png)

A continuación abrimos chrome y entramos en `chrome://inspect/#devices` y le damos a Inspect.
![inspect](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/d12.png)

Ahora nuestro test avanzará hasta que encuentre el `debugger;` y ya podemos usar toda la potencia de devtools en nuestro test.
![debug](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/d2.png)

## Node 8+
Los siguientes métodos de debug no pueden ser usados por Node 8+

## Pause

Podemos poner en nuestro test `browser.pause()` para que el navegador se pare en ese punto. Al ejecutar nuestro test e2e protractor se parará en la línea donde pongamos el pause y el terminal nos pedirá instrucciones.

![pause1](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/pause1.png)

Ahora podemos continuar el test con normalidad con `Ctrl+c` o que avance una tarea escribiendo `c`.

![pause2](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/pause2.png)

## Explore

El `browser.explore()` nos pausa el navegador en el punto elegido y al igual que antes en pause el terminal nos pedirá instrucciones, salvo que aquí en vez de continuar a la siguiente tarea podemos interactuar con protractor al igual que haríamos en nuestro test.

![explore1](https://raw.githubusercontent.com/juanfran/posts/master/testing/buenas-practicas-y-debugging-con-protractor/explore1.png)

## Debugger

`browser.debugger()` es similar a `debugger;` la diferencia es que con uno interactuamos con el terminal y con el otro con devtools. También se comportan algo distinto `browser.debugger()` pausa el navegador después de que la acción anterior haya sido completada en cambio `debugger` lo pausa cuando la acción ha sido programada.

Para lanzarlos ejecutamos el siguiente comando `protractor debug protractor.conf.js`. Ahora en el terminal podemos escribir `c` para que avance hasta el siguiente breakpoint o `n` para ir al siguiente comando.

En el navegador además disponemos de algunas quereis especiales de protractor en `window.clientSideScripts`.
