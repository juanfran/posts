import { Project, Node } from 'ts-morph';
import * as ts from 'typescript';

const project = new Project();

project.addSourceFilesAtPaths('src/example4*.ts');

project.getSourceFiles().forEach((sourceFile) => {
  const classes = sourceFile.getClasses();

  classes.forEach((itClass) => {
    if (itClass.getName() === 'Test') {
      const referencedSymbols = itClass.findReferences();

      referencedSymbols.forEach((referenceSymbol) => {
        referenceSymbol.getReferences()
        .forEach((reference) => {
          reference.getNode().replaceWithText('Hello');
          reference.getSourceFile().save();
        });
      });
    }
  });
});