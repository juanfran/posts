# Tutorial monorepos con Lerna

En este tutorial vamos a ver cómo gestionar un monorepo con varios paquetes npm gracias a [Lerna](https://github.com/lerna/lerna). 

Lerna es una herramienta que mejora el flujo de trabajo con multiples paquetes de npm en un sólo repositorio. Tener un monorepo nos facilita  coordinar cambios entre múltiples paquetes y la configuración de entornos.

#### ¿Esto lo usa alguien?

Pues tenemos muchos proyectos importantes usando monorepos, Angular, o React y muchos con Lerna, entre ellos [Babel](https://github.com/babel/babel/blob/master/doc/design/monorepo.md), [Apollo](https://github.com/apollographql) o [Jest](https://github.com/facebook/jest)

Vamos ahora a montar un pequeño proyecto para que lo veamos en funcionamiento.

Instalamos Lerna en global.
```shell
npm i -g lerna
```

Creamos nuestro repo de pruebas.
```shell
mkdir lerna-example
cd lerna-example
git init
```

Y ahora lo convertimos en un reposotorio compatible con Lerna.
```shell
lerna init
```

```shell
├── lerna.json
├── package.json
└── packages
```

Y este es el resultado, tenemos el `package.json` habitual, una carpeta `packages` donde meteremos todos los paquetes y por último el `lerna.json` que contiene la configuración de Lerna que ahora mismo sólo contiene el path a la carpeta donde vamos a introducir los paquetes y el número de versión.

A continuación vamos a crear la siguiente estructura de proyectos, vamos a dividir nuestra app en 3 partes.

```shell
├── lerna.json
├── package.json
└── packages
    ├── test1
    │   ├── index.js
    │   └── package.json
    ├── test2
    │   ├── index.js
    │   └── package.json
    └── test3
        ├── index.js
        └── package.json
```

En cada una de las carpetas (test1, test2, test3) hacemos un `npm init` con los valores por defecto.

Ahora vamos con los index.js, lo que vamos hacer es que test1 y test2 sean independinetes y que test3 tenga de dependencia a ambos.

```js
// packages/test1/index.js

module.exports = 'Test1';
```

```js
// packages/test2/index.js

module.exports = 'Test2';
```

```js
// packages/test2/index.js
const test1 = require('test1');
const test2 = require('test2');

console.log(`Test3: ${test1}, ${test2}`); // output: Test3: Test1, Test2
```

Si ahora intentamos ejecutar test3 por supuesto falla porque test3 todavía dónde encontrar test1 y test2.

```shell
node packages/test3/index.js

Error: Cannot find module 'test1'
...
```

Para arreglarlo tenemos que irnos al `package.json` de test3 y añadir como dependencias test1 y test2.

```json
{
  "name": "test3",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "test1": "^1.0.0",
    "test2": "^1.0.0" 
  }
}
```

Ahora ejecutamos `lerna bootstrap` que va a instalar las dependencias de nuestros paquetes y los va a enlazar entre ellos.

![lerna-bootstrap](https://raw.githubusercontent.com/juanfran/posts/master/tools/lerna/assets/lerna-bootstrap.png)

Si miramos ahora la estructura de directorios vemos que ha aparecido `node_modules` dentro de test3 con enlazes simbólicos a test1 y test2.

```shell
├── lerna.json
├── package.json
└── packages
    ├── test1
    │   ├── index.js
    │   └── package.json
    ├── test2
    │   ├── index.js
    │   └── package.json
    └── test3
        ├── index.js
        ├── node_modules
        │   ├── test1 -> ../../test1
        │   └── test2 -> ../../test2
        └── package.json
```

Si ejecutamos ahora `node packages/test3/index.js` funcionará correctamente.

```shell
node packages/test3/index.js
Test3: Test1 Test2
```

Ya estamos listos para publicar la primera versión, pero antes de continuar tenemos que añadir un repo remoto (`git remote add...`) comiteamos y hacemos push.

Ejecutamos `lerna changed` que nos informa que los paquetes test1, test2 y test3 estan listos para publicarse.

![lerna-changed](https://raw.githubusercontent.com/juanfran/posts/master/tools/lerna/assets/lerna-changed.png)

Ahora publicamos, para ello ejcutamos `lerna version`.

![lerna-version](https://raw.githubusercontent.com/juanfran/posts/master/tools/lerna/assets/lerna-version.png)

Lo primero que hace es decirnos que tipo de versión queremos lanzar (patch, minor, major etc), en nuestro caso elegimos major la 1.0.0 pero como es el valor por defecto del `npm init` los `package.json` no son modificados. A continuación lerna nos crear el tag 1.0.0 y hace push en nuetro repo.

Existe una alternativa a `lerna version` que es `lerna publish` que ademas de actualizar nuestro repo actualizará las biblotecas en npm.

Bien ahora vamos hacer cambios en nuestras dependencias para ver cómo lo maneja Lerna.

Vamos a actualizar la test1 con el siguiente contenido.

```js
// packages/test1/index.js

module.exports = 'Test1 v2';
```

Hacemos commit, push y volvemos a ejecutar `lerna changed`.

![lerna-changed2](https://raw.githubusercontent.com/juanfran/posts/master/tools/lerna/assets/lerna-changed2.png)

Ahora vemos que Lerna nos informa que tenemos cambios en test1 y test3, de test2 no porque no depende de test1 pero test3 sí y lerna nos informa que si vamos a publicar una nueva versión podemos hacerlo también de test3.

Publicamos la nueva versión con `lerna version`, esta vez como una minor.

![lerna-version2](https://raw.githubusercontent.com/juanfran/posts/master/tools/lerna/assets/lerna-version2.png)

Lerna ha actualizado la versión de los `package.json` de los repos afectados y ha hecho commit y push del nuevo tag `1.1.0`.

Este es el ´git diff´ del último commit.

![git-diff](https://raw.githubusercontent.com/juanfran/posts/master/tools/lerna/assets/git-diff.png)

Por último, otro comando muy práctico es `lerna add` que nos permite añadir dependencias en uno o varios de nuestros paquetes. 
Por ejemplo si ejecutamos `lerna add babel-core` nos añadirá babel-core en nuestro test paquetes pero si solo queremos hacerlo en uno podemos indicarle un scope `lerna add babel-core --scope=test2`.

