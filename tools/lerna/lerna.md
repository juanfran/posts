
├── lerna.json
├── package.json
└── packages
    ├── test1
    │   ├── index.js
    │   └── package.json
    ├── test2
    │   ├── index.js
    │   └── package.json
    └── test3
        ├── index.js
        └── package.json


si hacemos node test3/index.js falla

lerna bootstrap

lerna notice cli v3.4.3
lerna info Bootstrapping 3 packages
lerna info Symlinking packages and binaries
lerna success Bootstrapped 3 packages

funciona

tree

├── lerna.json
├── package.json
└── packages
    ├── test1
    │   ├── index.js
    │   └── package.json
    ├── test2
    │   ├── index.js
    │   └── package.json
    └── test3
        ├── index.js
        ├── node_modules
        │   ├── test1 -> ../../test1
        │   └── test2 -> ../../test2
        └── package.json

enlaces simbólicos en node_modules a test1 y test2

`lerna changed`

lerna notice cli v3.4.3
lerna info Looking for changed packages since initial commit.
test1
test2
test3
lerna success found 3 packages ready to publish


`lerna add babel-core`

añade babel-core a todos los paquetes

`lerna add module-1 --scope=module-2`

Si cambio solo test1 y hago lerna changed

lerna notice cli v3.4.3
lerna info Looking for changed packages since v1.1.0
test1
test3
lerna success found 2 packages ready to publish

luego hago lerna version

lerna notice cli v3.4.3
lerna info current version 1.1.0
lerna info Looking for changed packages since v1.1.0
? Select a new version (currently 1.1.0) Minor (1.2.0)

Changes:
 - test1: 1.1.0 => 1.2.0
 - test3: 1.1.0 => 1.2.0

? Are you sure you want to create these versions? (ynH) 


`lerna version`


how? 
https://github.com/facebook/react/tree/master/packages
https://github.com/babel/babel/blob/master/doc/design/monorepo.md