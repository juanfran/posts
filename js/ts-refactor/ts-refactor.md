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

Empezamos con las modificaciones a la interfaz.  Vamos a buscar las interfaces que necesitamos, borrar `_id` y añadir `id`.

```ts
interfaces.forEach((interfaceDeclaration) => {
    // Accedemos a la propiedad _id
    const oldId = interfaceDeclaration.getProperty('_id');

    // Si existe la borramos
    if (oldId) {
        oldId.remove();

        // Creamos una nueva propiedad en la posición 0, con el nombre 'id' y el tipo 'string'
        interfaceDeclaration.insertProperty(0, {
          name: 'id',
          type: 'string',
        })
    }
});

// Guardamos los cambios realizados al fichero
sourceFile.save();
```

Para inicial el refactor ejecutamos el comando `npx ts-node example1.ts`.

[Código completo](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example1.ts)

## Ejemplo 2, buscar y manipular una variable

Este ejemplo vamos a buscar la variable `name` que está dentro del constructor de las clases que heredan de `ParentTest` queremos modificar su contenido y poner un `console.log` a continuación como vemos en el ejemplo:

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

Para hacer esto lo primero que vamos hacer es buscar los constructores que cumplan el criterio, es decir que esten dentro de un clase que herede de `ParentTest`, para ello usamos el siguiente código:

```ts
import { Node } from 'ts-morph';

// Con forEachDescendant recorremos todo el arbol de nodos de un fichero
const classConstructor = sourceFile.forEachDescendant((node, traversal) => {
    // Comprobamos si el nodo es una clase con la ayuda de este método de `ts-morph`
    if (Node.isClassDeclaration(node)) {
        const classExtends = node.getExtends();
        // Accedemos a las clases de las que extiende nuestra clase y comprobamos si alguna de ellas es `ParentTest`
        if (!classExtends || classExtends.getText() !== 'ParentTest') {
            // Si no se trata de la clase que estamos buscando hacemos un `skip` de esta rama del arbol porque ya sabemos que son custructor no nos interesa
            traversal.skip();
        }
    // Si es un constructor devolvemos el nodo porque gracias al skip anterior sabemos que está dentro de una clase que tiene lo que buscamos
    } else if (Node.isConstructorDeclaration(node)) {
        return node;
    }

    return undefined;
});
```

A continuación si hemos encontrado el constructor vamos a buscar si existen la variable `name` y si existe remplazar su contenido y añadir el `console.log`.

```ts
if (classConstructor) {
    // Nos devuelve un array de declaración de variables
    classConstructor.getVariableDeclarations().forEach((variable) => {
        // Comprobamos si es la que buscamos
        if (variable.getName() === 'name') {
            // La remplazamos
            variable.replaceWithText(`name = 'my new test'`);

            // Accedemos a la posición de la variable relativa al constructor e insertamos el console.log a continuación de la misma
            const index = variable.getVariableStatement().getChildIndex();
            classConstructor.insertStatements(index + 1, 'console.log(name);');
        }
    });
}
```

[Código completo](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example2.ts)

## Ejemplo 3, solo permitir una clase por fichero

En el ejemplo 3 vamos a buscar en un fichero si tiene más de una clase y si fuese así vamos a coger las sobrantes y las vamos a mover a ficheros diferentes.

```ts
project.getSourceFiles().forEach((sourceFile) => {
  // Buscamos todas las clases de un fichero
  const classes = sourceFile.getClasses();

  // Si hay más de una iniciamos los cambios
  if (classes.length > 1)  {
    // Cogemos el directorio del fichero porque lo vamos a usar para crear los nuevos archivos
    const directory = sourceFile.getDirectory();
    const classesToMove = classes.slice(1);

    // Vamos clase por clase creando un fichero con el nombre de clase y el cotenido de la misma, al terminar borramos la clase del fichero original
    classesToMove.forEach((itClass) => {
      directory.createSourceFile(`${itClass.getName()}.ts`, itClass.getText());
      itClass.remove();
    });

    // aplicamos los cambios en el directorio, es decir se crean todos los ficheros que hayamos indicados
    directory.save();
  }

  // Guardamos los cambios en el fichero original para que desaparezcan las clases sobrantes.
  sourceFile.save();
});
```

[Código completo](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example3.ts)

## Ejemplo 4, renombrar una clase y todas sus referencias

Para este ejemplo tenemos dos ficheros, el de la clase que queremos renombrar:

```ts
export class Test {
    init() {
        console.log('init');
    }
}
```

Y en el que se usa:

```ts
import { Test } from './example4';

const theTest = new Test();
theTest.init();
```

Lo que queremos hacer es renombrar la clase `Test` a `Hello` y que nada se rompa, el resultado tendría que ser este:

```ts
export class Hello {
    init() {
        console.log('init');
    }
}
```

```ts
import { Hello } from './example4';

const theTest = new Hello();
theTest.init();
```

Con este código lo resolvemos:

```ts
// Buscamos y recorremos las clases del fichero
const classes = sourceFile.getClasses();

classes.forEach((itClass) => {
  // Comprobamos si es la clase que queremos renombrar
  if (itClass.getName() === 'Test') {
    // Buscamos las referencias, en este caso nos devulve un array de `ReferencedSymbol` por cada fichero donde se esté usando `Test`
    const referencedSymbols = itClass.findReferences();

    referencedSymbols.forEach((referenceSymbol) => {
      // En cada fichero pedimos la referencias
      referenceSymbol.getReferences()
      .forEach((reference) => {
        // Remplazamos el texto original por `Hello` y guardamos
        reference.getNode().replaceWithText('Hello');
        reference.getSourceFile().save();
      });
    });
  }
});
```

[Código completo](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example4.ts)


### Conclusiones