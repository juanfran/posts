 # RxJS Hot vs Cold
 
 ¿Alguna vez te ha pasado con Rx que te suscribes más de una vez a un observable y los observers reciben valores distintos? Bien esto es porque el observable es "cold". Vamos a ver las diferencias entre los observables de tipo cold/hot y cómo podemos tranformar un cold en hot.

```js
const runInterval = interval(2000);

runInterval.subscribe((i) => {
    console.log(`first subscribe: ${i}`);
});

setTimeout(() => {
    runInterval.subscribe((i) => {
        console.log(`second subscribe: ${i}`);
    });
}, 3000);
```

En este primer ejemplo tenemos una constante `runInterval` que lo único que tiene es un intervalo observable de 2 segundos. Inmediatamente despues de crearlo nos suscribimos por primera vez y despues de 3 segundos nos suscribimos por segunda vez. En ambas suscripciones hacemos un `console.log` del número de repetición del intervalo. Veamos el resultado.

```shell
first subscribe: 0
first subscribe: 1
second subscribe: 0
first subscribe: 2
second subscribe: 1
first subscribe: 3
second subscribe: 2
// etc
```

En este ejemplo `interval` es cold por tanto reemite el strem por cada suscripción. Ambas suscripciones reciben los mismos valores pero en momentos distintos por tanto `interval` está volviendo a empezar y no está compartiendo datos.

Veamos otro ejemplo más peligroso.

```js
const source = fromEvent(someButton, 'click')
    .pipe(
        switchMap(() => from(fetch('https://jsonplaceholder.typicode.com/posts')))
    );

source.subscribe(console.log);
source.subscribe(console.log);
```

En este ejemplo queremos que cada vez que se haga click en un botón realize una petición a una url que nos devuelve unos datos que luego vamos a consultar en dos puntos distintos de nuestro código, en este caso por simplificar ponemos dos subscribe juntos. ¿Qué va a pasar cuando el usuario haga click en el botón? pues que nos vamos a encontrar con la petición al servidor repetida y seguramente no queremos eso. Como en el ejemplo anterior cada subscribe produce un nuevo stream de datos.

### Convertir un observable cold en hot

Si en los ejemplos anteriores queremos que la información se comparta entre distintos observadores tenemos que crear un observable hot, así el stream será compartido entre todas las suscripciones.

Para hacerlo solo tenemos que usar el operador `share` que nos devolverá un observable capaz de emitir la misma información a distintos observadores.

```js
const source = fromEvent(someButton, 'click')
    .pipe(
        switchMap(() => from(fetch('https://jsonplaceholder.typicode.com/posts'))),
        share() // Nuevo!
    );

source.subscribe(console.log);
source.subscribe(console.log);
```

Listo, ahora ambas suscripciones reciben los mismos datos cada vez que hay un click y sólo se hace una petición a la url.

Si repetimos el ejemplo del `setInterval`

```js
const runInterval = interval(2000)
                        .pipe(share()); // Nuevo!

runInterval.subscribe((i) => {
    console.log(`first subscribe: ${i}`);
});

setTimeout(() => {
    runInterval.subscribe((i) => {
        console.log(`second subscribe: ${i}`);
    });
}, 3000);
```

```shell
first subscribe: 0
first subscribe: 1
second subscribe: 1
first subscribe: 2
second subscribe: 2
first subscribe: 3
// etc
```

Ahora vemos cómo ambas suscripciones reciben lo mismo, excepto '0' que sólo lo recibe la primera porque en el momento en que interval emite ese valor la segunda suscripción todavía no se ha realizado.

### Hot vs Cold

Al final podemos resumir la diferencía entre hot y cold en que los observables cold sus datos son producidos por el observable en si mismo en cambio los hot los datos son producidos fuera del observable. Esto tiene como consecuencia que un observable hot podría haber emitido valores antes de la suscripción.


```js
const source = fromEvent(document, 'click')
```

Por ejemplo `fromEvent` nos devuelve un observable hot porque los datos del evento click son creados tanto si estamos suscritos como si no, en cambio un cold por cada suscripción empezará un nuevo stream emitiendo diferentes valores como hemos visto por ejemplo con el `interval`.