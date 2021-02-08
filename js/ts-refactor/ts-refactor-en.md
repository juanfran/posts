# Refactoring Typescript code with ts-morph

Often we find in our projects that we want to refactor our code and we see that the amount of changes required by the task are tedious and repetitive, so much so that discontinuing this process would be advantageous. Many of these refactors can be programmed and this is what we are going to see in this article with 4 examples.

To make things easier we are going to use [ts-morph](https://github.com/dsherret/ts-morph/) which will provide us an API to navigate and modify our Typescript code.

To get started we are going to make a folder with a `package.json` file and then we install `ts-morph`.

```bash
npm install --save-dev ts-morph
```

Also we need to install [ts-node](https://www.npmjs.com/package/ts-node) which will allow us to run Typescript with node.

```bash
npm i --save ts-node
```
We are now ready to start configuring our refactor script.

We can add the path to our `tsconfig.json` with `tsConfigFilePath` but `ts-morph` will use the files in our `tsconfig.json`. A way around this is to use `skipAddingFilesFromTsConfig`.

```ts
import { Project } from 'ts-morph';

const project = new Project({
     tsConfigFilePath: 'path/to/tsconfig.json',
     skipAddingFilesFromTsConfig: true,
});
```

Next, we will indicate in which files we want to run the script. We can bypass this step if we want to use the ones in the `tsconfig.json`.

```ts
 project.addSourceFilesAtPaths('src/**/*.ts');
```

## Example 1: edit an interface

In this first example we want to remove the `_id` property from our interface and add `id`.

This is the file that we want to refactor.

```ts
interface Test1 {
    _id: string;
    name: string;
}
```

The script result will tranform the file content to this:

```ts
interface Test1 {
    id: string;
    name: string;
}
```

Before starting it's recommended to us [ts-ast-viewer](https://ts-ast-viewer.com/) which shows us the code AST that may help when we're using `ts-morph` to understand the structure of the code we're refactoring.

This is the AST code from the previous interface:

![build](https://raw.githubusercontent.com/juanfran/posts/master/js/ts-refactor/assets/ts-ast-viewer.jpg)

We're going to start with the code that will refactor the `Test1` interface.

We create the file `example1.ts`. Next, we configure the project as we have seen and with `getSourceFiles` we go through every file.

```ts
import { Project } from 'ts-morph';

const project = new Project();

project.addSourceFilesAtPaths('src/**/*.ts');

project.getSourceFiles().forEach((sourceFile) => {

});
```

For each file we look for interfaces with `getInterfaces` and we go through them.

```ts
project.getSourceFiles().forEach((sourceFile) => {
  const interfaces = sourceFile.getInterfaces();

  interfaces.forEach((interfaceDeclaration) => {

  });
});
```

We check if the interface contains `_id`, if so we will delete it and add `id`.

```ts
interfaces.forEach((interfaceDeclaration) => {
    // We access the property _id
    const oldId = interfaceDeclaration.getProperty('_id');

    // If it exists we delete it
    if (oldId) {
        oldId.remove();

        // We create a new property in position 0, with the name 'id' and the type 'string'
        interfaceDeclaration.insertProperty(0, {
          name: 'id',
          type: 'string',
        })
    }
});

// We save the file with the changes
sourceFile.save();
```

To start the refactor we run the command `npx ts-node example1.ts`. If everything has gone well we will see that the file has been modified as expected.

[code](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example1.ts)

## Example 2: find and replace a variable

The goal in this example is to modify the content of the `name` variable and add a `console.log`, but we are only going to do it for variables that are inside a constructor in a class inherited from `ParentTest`.

```ts
class Test extends ParentTest {
    name: string;

    constructor() {
        super();

        const name = 'Test';
    }
}
```

After running the script:

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

The first thing we are going to do is look for the constructors that meet this criteria, those that are inside a class inherited from `ParentTest`. To do this, we will use the following code:

```ts
import { Node } from 'ts-morph';

// With forEachDescendant we go through the whole node file tree
const classConstructor = sourceFile.forEachDescendant((node, traversal) => {
    // We check if the node is a class with this `ts-morph` method
    if (Node.isClassDeclaration(node)) {
        const classExtends = node.getExtends();
        // We verify if the class was inherited from `ParentTest`
        if (!classExtends || classExtends.getText() !== 'ParentTest') {
            // If it is not the class we are looking for, we can `skip` this tree branch and continue the search.
            traversal.skip();
        }
    // If it is a constructor we stop searching because thanks to the previous skip we now know that this node is inside a class inherited from ParentTest
    } else if (Node.isConstructorDeclaration(node)) {
        return node;
    }

    return undefined;
});
```

If we have found the constructor that we were looking for and if the `name` variable exists, we will replace its content and add the `console.log`.

```ts
if (classConstructor) {
    // Returns an array of variable declaration
    classConstructor.getVariableDeclarations().forEach((variable) => {
        // Check if the variable name is correct
        if (variable.getName() === 'name') {
            // Replace the variable assigment
            variable.replaceWithText(`name = 'my new test'`);

            // Access the position of the variable relative to the constructor and insert console.log after it
            const index = variable.getVariableStatement().getChildIndex();
            classConstructor.insertStatements(index + 1, 'console.log(name);');
        }
    });
}
```

[Code](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example2.ts)

## Example 3: only allowing one class per file

In the next example, we will search a file to see if it has more than one class and if so we will take any extra classes and move them to different files.

```ts
project.getSourceFiles().forEach((sourceFile) => {
  // We search for all file classes
  const classes = sourceFile.getClasses();

  // If there is more than one we begin the changes
  if (classes.length > 1)  {
    // We get the file directory because we are going to use it to create the new files
    const directory = sourceFile.getDirectory();
    const classesToMove = classes.slice(1);

    // We go class by class creating a file with the name and its content. When finished we delete the class from the original file
    classesToMove.forEach((itClass) => {
      directory.createSourceFile(`${itClass.getName()}.ts`, itClass.getText());
      itClass.remove();
    });

    // We apply the changes to the folder
    directory.save();
  }

  // We save the changes in the original file so that the removed classes disappear
  sourceFile.save();
});
```

[Code](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example3.ts)

## Example 4: rename a class and all its references

For this example we have two files, one with the class `Test` that we want to rename:

```ts
export class Test {
    init() {
        console.log('init');
    }
}
```

And the one where it's kept:

```ts
import { Test } from './example4';

const theTest = new Test();
theTest.init();
```

What we want to do is rename the class `Test` to `Hello` and rename every import. The result should be this:

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

This code will resolve the problem:

```ts
// We look for and go through the file classes
const classes = sourceFile.getClasses();

classes.forEach((itClass) => {
  // We check if it is the class we want to rename
  if (itClass.getName() === 'Test') {
    // We look for the references, in this case it returns an array that contains a `ReferencedSymbol` for each file where `Test` is being used
    const referencedSymbols = itClass.findReferences();

    referencedSymbols.forEach((referenceSymbol) => {
      // In each file we ask for the references
      referenceSymbol.getReferences()
      .forEach((reference) => {
        // We replace the original text with `Hello` and save the file
        reference.getNode().replaceWithText('Hello');
        reference.getSourceFile().save();
      });
    });
  }
});
```

[Complete code](https://github.com/juanfran/posts/blob/master/js/ts-refactor/example/example4.ts)

### Conclusions

With `ts-morph` you can see that it no longer matters how many changes we have to do in a refactor. Thanks to being able to program those changes we will save hours / days of repetitive work. Mastering it is definitely worth it.

Also, although we have not seen it in the examples, we can analyze the code to create our own linters.

More information in the [official documentation](https://ts-morph.com/).