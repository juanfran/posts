# Refactorizar código Typescript con ts-morph

Muchas veces en los proyectos nos encontramos con que queremos refactorizar código y vemos que por la cantidad de cambios que habría que hacer se convierte en una tarea tediosa y repetitiva que incluso podríamos descartar por la cantidad de tiempo que tendríamos que invertir. Muchos de estos refactors pueden ser programados y es lo que vamos a ver en este artículo con 4 ejemplos.

Para facilitar las cosas vamos a usar [ts-morph](https://github.com/dsherret/ts-morph/) que nos proporciona una API más sencilla para navegar y modificar código Typescript.

Para empezar, creamos una carpeta con su `package.json` e instalamos `ts-morph`.

```bash
npm install --save-dev ts-morph
```

También instalamos [ts-node](https://www.npmjs.com/package/ts-node) que nos permite ejecutar Typescript con node.

```bash
npm i --save ts-node
```

Ya estamos listos para comenzar a configurar nuestro script de refactor.

Podemos añadir la ruta a nuestro `tsconfig.json` con `tsConfigFilePath` pero `ts-morph` usará los mismo ficheros que nuestro `tsconfig.json` para evitarlo podemos usar `skipAddingFilesFromTsConfig`.

```ts
import { Project } from 'ts-morph';

const project = new Project({
     tsConfigFilePath: 'path/to/tsconfig.json',
     skipAddingFilesFromTsConfig: true,
});
```

A continuación, indicaremos en qué ficheros queremos ejecutar el script sino estamos usando los del `tsconfig.json`.

```ts
 project.addSourceFilesAtPaths('src/**/*.ts');
 ```

## Ejemplo 1: edición de una interfaz

En este primer ejemplo queremos quitar de nuestra interfaz la propiedad `_id` para añadir `id`.

Fichero que queremos refactorizar:

```ts
interface Test1 {
    _id: string;
    name: string;
}
```

El resultado del script tiene tranformar el contenido del fichero a esto:

```ts
interface Test1 {
    id: string;
    name: string;
}
```

Antes de empezar es recomendable utilizar [ts-ast-viewer](https://ts-ast-viewer.com/) que nos muestra el AST del código que no sirve de gran ayuda a la hora de usar `ts-morph` para comprender la estructura del código a refactorizar.

Este es el AST de la interfaz anterior:

![build](https://raw.githubusercontent.com/juanfran/posts/master/js/ts-refactor/assets/ts-ast-viewer.jpg)

Comencemos con el código que refactoriza nuestra primera interfaz.

Creamos el fichero `example1.ts`. Configuramos el proyecto como hemos visto y con `getSourceFiles` recorremos todos los ficheros.

```ts
import { Project } from 'ts-morph';

const project = new Project();

project.addSourceFilesAtPaths('src/**/*.ts');

project.getSourceFiles().forEach((sourceFile) => {

});
```

Por cada fichero buscamos las interfaces que contiene con `getInterfaces` y las recorremos.

```ts
project.getSourceFiles().forEach((sourceFile) => {
  const interfaces = sourceFile.getInterfaces();

  interfaces.forEach((interfaceDeclaration) => {

  });
});
```

Comprobamos si la interfaz contiene `_id`, si es así lo borraremos y añadiremos `id`.

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

Para iniciar el refactor ejecutamos el comando `npx ts-node example1.ts`. Si todo ha ido bien veremos que el fichero ha sido modificado con los cambios indicados.

[Código completo](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example1.ts)

## Ejemplo 2: buscar y manipular una variable

El objetivo en este ejemplo es modificar el contenido de la variable `name` y añadir un `console.log`, pero solo vamos a hacerlo para las variables que están dentro de un constructor en una clase que herede de `ParentTest`.

```ts
class Test extends ParentTest {
    name: string;

    constructor() {
        super();

        const name = 'Test';
    }
}
```

Depués del script:

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

Lo primero que vamos hacer es buscar los constructores que cumplan este criterio, es decir, aquellos que estén dentro de un clase que herede de `ParentTest`. Para ello, usaremos el siguiente código:

```ts
import { Node } from 'ts-morph';

// Con forEachDescendant recorremos todo el arbol de nodos de un fichero
const classConstructor = sourceFile.forEachDescendant((node, traversal) => {
    // Comprobamos si el nodo es una clase con la ayuda de este método de `ts-morph`
    if (Node.isClassDeclaration(node)) {
        const classExtends = node.getExtends();
        // Accedemos a la clase de la que extiende y comprobamos si es `ParentTest`
        if (!classExtends || classExtends.getText() !== 'ParentTest') {
            // Si no se trata de la clase que estamos buscando hacemos un `skip` de esta rama del arbol porque ya sabemos que su constructor no nos interesa
            traversal.skip();
        }
    // Si es un constructor terminamos la búsqueda porque gracias al skip anterior sabemos que está dentro de una clase que tiene lo que buscamos
    } else if (Node.isConstructorDeclaration(node)) {
        return node;
    }

    return undefined;
});
```

Si hemos encontrado el constructor que vamos a buscar y si existe la variable `name`, reemplazaremos su contenido y añadiremos el `console.log`.

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

## Ejemplo 3: sólo permitir una clase por fichero

En el ejemplo, buscarremos en un fichero si tiene más de una clase y si fuese así vamos a coger las sobrantes y las vamos a mover a ficheros diferentes.

```ts
project.getSourceFiles().forEach((sourceFile) => {
  // Buscamos todas las clases de un fichero
  const classes = sourceFile.getClasses();

  // Si hay más de una iniciamos los cambios
  if (classes.length > 1)  {
    // Cogemos el directorio del fichero porque lo vamos a usar para crear los nuevos archivos
    const directory = sourceFile.getDirectory();
    const classesToMove = classes.slice(1);

    // Vamos clase por clase creando un fichero con el nombre y el contenido de la misma, al terminar borramos la clase del fichero original
    classesToMove.forEach((itClass) => {
      directory.createSourceFile(`${itClass.getName()}.ts`, itClass.getText());
      itClass.remove();
    });

    // Aplicamos los cambios en el directorio, es decir se crean todos los ficheros que hayamos indicados
    directory.save();
  }

  // Guardamos los cambios en el fichero original para que desaparezcan las clases sobrantes.
  sourceFile.save();
});
```

[Código completo](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example3.ts)

## Ejemplo 4: renombrar una clase y todas sus referencias

Para este ejemplo tenemos dos ficheros, el de la clase `Test` que queremos renombrar:

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

Lo que queremos hacer es renombrar la clase `Test` a `Hello` y que nada se rompa. El resultado tendría que ser este:

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
    // Buscamos las referencias, en este caso nos devulve un array que contiene un `ReferencedSymbol` por cada fichero donde se esté usando `Test`
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

Con `ts-morph` podéis ver que ya no importa la cantidad de cambios que tengamos que hacer en un refactor gracias a poder programar esos cambios ahorraremos horas/días de trabajo repetitivo. Dominarlo merece mucho la pena.

También, aunque no lo hemos visto en los ejemplos podemos analizar el código para crear nuestros propios linters.

Más información en la [documentación oficial](https://ts-morph.com/).