# Refactorizar código Typescript

Muchas veces en los proyectos nos entontramos con que queremos cambiar algo de nuestro código y en ocasines se puede convertir en una tarea tediosa y repetitiva. Muchos de estos refactors pueder ser automatizados y es lo que vamos a ver en este artículos con algunos ejemplos.

Para facilitar las cosas recomiendo usar [ts-morph](https://github.com/dsherret/ts-morph/) que nos proporciona un API que nos permite navegar y modificar nuestro código Typescript.

Empezamos preparando el proyecto para los ejemplos. En la carpeta donde decidamos trabajar instalamos `ts-morph`.

```bash
npm install --save-dev ts-morph
```

Instalamos [ts-node](https://www.npmjs.com/package/ts-node) que nos permite ejecutar Typescript con node.

```bash
npm i --save typescript
```

Vamos ahora a preparar nuestro script, en este primer ejemplo vamos a poner a tener un `.ts` en el que algunos nombres de variables tienen la primera letra mayúscula y las queremos poner en minúscula.

Por ejemplo:

```ts
const HelloWorld = 'Hello world';

const HelloObj = {};

function main() {
    const Hi = 'Hi!';

    console.log(Hi);
}
```

Queremos que nuestro script tranforme el contenido del fichero a esto:

```ts
const helloWorld = 'Hello world';

const helloObj = {};

function main() {
    const hi = 'Hi!';

    console.log(hi);
}
```

Empezamos a configurar nuestro script de refactor.

```ts
import { Project } from "ts-morph";

const project = new Project({
     tsConfigFilePath: "path/to/tsconfig.json",
});
```

Si tenemos un `tsconfig.json` que queremos usar podemos indicarlo como en el ejemplo. Por defecto `ts-morph` usará los mimos ficheros que hayamso indicado en el `tsconfig.json` podemos evitarlo añadiendo `skipAddingFilesFromTsConfig`.

```ts
import { Project } from "ts-morph";

const project = new Project({
     tsConfigFilePath: "path/to/tsconfig.json",
     skipAddingFilesFromTsConfig: true,
});
```

EL siguiene paso es indicar en que ficheros queremos ejecutar el script si no estamos usando los del `tsconfig.json`.

```ts
 project.addSourceFilesAtPaths('src/**/*.ts');
 ```

 En el ejemplo vamos a crear un directorio `src` crearemos un fichero donde meteremos el código de ejemplo que hemos visto anteriormente y queremos refactorizar.