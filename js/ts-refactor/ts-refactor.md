# Automatizar el refactorizar de código Typescript

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

Ya estamo listos para empezar a configurar nuestro script de refactor.

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

## Ejemplo 1, edición de una interfaz

En este primer ejemplo queremos quitar de nuestra interfaces la propiedad `_id` para añadir `id`.

Ejemplo de fichero que queremos refactorizar:

```ts
interface Test1 {
    _id: string;
    name: string;
}
```

Queremos que nuestro script tranforme el contenido del fichero a esto:

```ts
interface Test1 {
    id: string;
    name: string;
}
```

Creamos el fichero `example1.ts`. Configuramos el proyecto como hemos visto y con `getSourceFiles` recorremos todos los ficheros.

```ts
import { Project } from 'ts-morph';

const project = new Project();

project.addSourceFilesAtPaths('src/**/*.ts');

project.getSourceFiles().forEach((sourceFile) => {

});
```

Ahora por cada fichero buscamos todas las interfaces con `getInterfaces` y las recorremos.

```ts
project.getSourceFiles().forEach((sourceFile) => {
  const interfaces = sourceFile.getInterfaces();

  interfaces.forEach((interfaceDeclaration) => {

  });
});
```

Empezamos con las modificaciones a la interfaz. Buscamos si tiene la pripidad `_id` con `getProperty` y si la tuviese la borramos. También insertamos una nueva propiedad en la posición, con el nombre `id` y el tipo string.

```ts
interfaces.forEach((interfaceDeclaration) => {
    const oldId = interfaceDeclaration.getProperty('_id');

    if (oldId) {
        oldId.remove();
    }

    interfaceDeclaration.insertProperty(0, {
        name: 'id',
        type: 'string',
    })
});
```

Para inicial el refactor ejecutamos el comando `npx ts-node example1.ts`.

Código completo:

```ts
import { Project } from 'ts-morph';

const project = new Project();

project.addSourceFilesAtPaths('src/**/*.ts');

project.getSourceFiles().forEach((sourceFile) => {
  const interfaces = sourceFile.getInterfaces();

  interfaces.forEach((interfaceDeclaration) => {
    const oldId = interfaceDeclaration.getProperty('_id');

    if (oldId) {
      oldId.remove();
    }

    interfaceDeclaration.insertProperty(0, {
      name: 'id',
      type: 'string',
    })
  });

  sourceFile.save();
});
```

## Ejemplo 2, TODO
```ts
class Test extends ParentTest {
    name: string;

    constructor() {
        super();

        const name = 'Test';
    }
}
```

```ts
class Test extends ParentTest {
    name: string;

    constructor() {
        super();

        const name = 'my new test';
        console.log(this.name);
    }
}
```

sourceFile.insertStatements(3, "console.log(5);\nconsole.log(6);");
https://ts-morph.com/manipulation/transforms

## Ejemplo 3, TODO

Mover ficheros
# https://ts-morph.com/navigation/directories

2 clases en un mismo fichero, seprar una a otro fichero

## Ejemplo 4, TODO

referencias

https://ts-morph.com/navigation/finding-references