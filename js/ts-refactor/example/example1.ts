import { Project } from 'ts-morph';

const project = new Project();

project.addSourceFilesAtPaths('src/example1.ts');

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