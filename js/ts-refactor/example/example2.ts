import { Node, Project } from 'ts-morph';
import { SyntaxKind } from 'typescript';

const project = new Project();

project.addSourceFilesAtPaths('src/example2.ts');

project.getSourceFiles().forEach((sourceFile) => {
    const classConstructor = sourceFile.forEachDescendant((node, traversal) => {
        if (Node.isClassDeclaration(node)) {
            const classExtends = node.getExtends();

            if (!classExtends || classExtends.getText() !== 'ParentTest') {
                traversal.skip();
            }
        } else if (Node.isConstructorDeclaration(node)) {
            return node;
        }

        return undefined;
    });

    if (classConstructor) {
        classConstructor.getVariableDeclarations().forEach((variable) => {
            if (variable.getName() === 'name') {
                variable.replaceWithText(`name = 'my new test'`);
                const index = variable.getVariableStatement().getChildIndex();
                classConstructor.insertStatements(index + 1, 'console.log(name);');
            }
        });
    }

    sourceFile.save();
});
