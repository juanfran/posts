# Buenas practicas y debugging con protractor

## Queries específicas de e2e

No usar las mismas clases para tus estilos y tu js que para tus test e2e. Es muy fácil que cuando estamos modificando el html borremos alguna clase que sea clave para que nuestros test e2e se ejecuten. Una forma de prevenirlo es añadir clases que solo se usen en los test e2e con un prefijo especifico.

```html
    <button class="btn-submit e2e-submit" (click)="onSubmit()">Enviar</button>
```

Estas clases podemos borrarlas al generar el código de producción por ejemplo con webpack podemos hacerlo con `string-replace-loader`.

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

## Usar asyn await

A veces en nuestros test queremos esperar a tener un resultado específico antes de continuar podemos usar promesa con then pero muy facilmente nuestros test se van a volver dificiles de leer. 

```js
browser.getCurrentUrl().then(function(url) {
  expect(url).toEqual('www.kaleidos.net');
  done();
});

```

```js
const url = await browser.getCurrentUrl();

expect(url).toEqual('www.kaleidos.net');
```

Si empezamos a usar async await podemos desativar Selenium promise manager en nuestro protractor.conf.

```js
exports.config = {
  SELENIUM_PROMISE_MANAGER: false,
};
```

## Añadir mensajes de error a los browser.wait

Si tenemos muchos `browser.wait` puede llegar a ser dificil identificar cual falla pero si le indicamos en su tercer parámetro un string si ese wait expira sin cumplir la condición nos dará el mensaje que le hemos dado.

```js
browser.wait(() => {
  return false;
});

// x segundos despues
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
const browser.get(URL);
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

// aquí ya podemos interactura con e2e-list-items porque es visible
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

Lo mejor que podemos hacer por la legibilidad de nuestros test es crear objectos que manejen partes especificas de la página. Estos objetos podría manejar un componente muy concreto o una página entera. Veamos primero un ejemplo escrito sin objectos.

```js
describe('Posts', () => {
  it('publish', () => {
    // contamos los post al principio
    const oldPosts = element.all(by.css('.e2e-posts')).count();

    // rellenamos el campo de titulo
    element(by.css('.e2e-title')).sendKeys('title post');

    // enviamos el formulario
    element(by.css('.e2e-form-submit')).click();

    // esperamos que nos salga el mensaje de exito
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

Ahora tenemos toda la funcionalidad en pequeñas funciones que indican claramente a qué se dedican y además hemos añadido algo que no teneiamos antes, en el contructor de cada objeto nos aseguramos que el componente con el que queremos interactuar está listo.

## Hightlight clicks

Empezamos con el debugging, a veces si estamos debuggeando un test e2e queremos saber al detalle qué está pasando por ejemplo queremos ir viendo donde está protractor haciendo click, para ello siemplemente tenemos que activarlo en nuestro protractor.conf y ahora nos relatará el elemento justo antes de hacer click en él.

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

Para hacerlo funcionar tenemos que desabilitar antes el `directConnect` y activar `useBlockingProxy`, entonces podremos poner en `highlightDelay` cuanto queremos que esté el elemento seleccionado antes de hacer click.

![hightlight](https://raw.githubusercontent.com/juanfran/posts/master/testing/h1.gif)

Como vemos en el gif antes de hacer click en el element vemos el foco.

## Logs

También podemos almanzenar logs de todo lo que hace protractor.

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

![logs](https://raw.githubusercontent.com/juanfran/posts/master/testing/s2.jpg)

En la imagén podemos ver qué elementos ha buscado y donde ha hecho click, muy util si queremos averiguar dónde esta fallando nuestro test.

## Debugging con chrome

Podemos ejecutar el debugger de chrome como en cualquier otra parte de nuestra app, para ello ponemos `debugger;` donde queremos que pare. 
Ahora lanzamos nuestros test de una forma algo distinta.

```shell
node --inspect-brk node_modules/.bin/protractor protractor.conf.js
```

Ahora en chome entramos en chrome://inspect/#devices, le damos a Inspect en protractor y listo, nuestro test avanzará hasta encontrarse con el debugger y podemos usar toda la potencía de devtools en nuestros tests.

## Pause (node 7)

Si usamos node 7 (en node 8 en adelante por ahora no se puede), podemos poner en nuestro test `browser.pause()` para que el navegador se pare en ese punto. Si escribemos 'c' en el terminal el test continuará.

## Explore (node 7)

El explore es parecido al pause salvo que en terminal podemos escribir comandos de protractor, muy útil si por ejemplo tenemos una query que no funciona y no sabemos por qué, pues podemos parar el navegador en ese punto e ir ejecutando queries u otros comandos de protactor para averiguar qué está pasando.

## Debugger (node 7)
