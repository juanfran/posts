import { Project } from 'ts-morph';

const project = new Project();

project.addSourceFilesAtPaths('src/example3.ts');

project.getSourceFiles().forEach((sourceFile) => {
  const classes = sourceFile.getClasses();

  if (classes.length > 1)  {
    const directory = sourceFile.getDirectory();
    const classesToMove = classes.slice(1);

    classesToMove.forEach((itClass) => {
      directory.createSourceFile(`${itClass.getName()}.ts`, itClass.getText());
      itClass.remove();
    });

    directory.save();
  }

  sourceFile.save();
});