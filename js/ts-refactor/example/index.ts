import { Project } from 'ts-morph';
import * as ts from 'typescript';

const project = new Project();

project.addSourceFilesAtPaths('src/**/*.ts');

/* project.getSourceFiles().forEach((sourceFile) => {
    sourceFile.forEachDescendant((node) => {
      if (node.getKind() === ts.SyntaxKind.Identifier && ) {
        const oldText = node.getText();
        node.replaceWithText(
          oldText.charAt(0).toLocaleLowerCase() + oldText.slice(1)
        );
      }
    });

    sourceFile.save();
  }); */

  // project.getSourceFiles().forEach((sourceFile) => {
  //   const variables = sourceFile.getVariableStatements();

  //   variables.forEach((variable) => {
  //     variable.
  //   })

  //   sourceFile.save();
  // });

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