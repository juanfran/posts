import { Project } from "ts-morph";

const project = new Project();

project.addSourceFilesAtPaths('src/**/*.ts');


project.getSourceFiles().forEach((sourceFile) => {
    apiCamelCaseReplacements(sourceFile);
    sourceFile.save();
  });