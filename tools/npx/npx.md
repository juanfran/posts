# Introducción a npx

La versión 5.2 de npm trae consigo npx, una herramienta que me parece que ha pasado algo desapercibida a pesar de estar a punto de cumplir un año y que creo que merece la pena conocer. Npx es una herramienta de cli que nos permite ejecutar paquetes de npm de forma mucho más sencilla. Vamos a ver varios ejemplos.

Si, por ejemplo, tenemos en nuestro proyecto ESLint, antes teníamos que buscar el binario en node_modules.

```shell
./node_modules/.bin/eslint yourfile.js
```

Ahora npx lo buscará por nosotros.

```shell
npx eslint yourfile.js
```

Pero npx no solo busca los binarios en nuestro proyecto, también es capaz de ejecutar el paquete indicado sin tenerlo previamente instalado. Por ejemplo, `create-react-app` es un proyecto que no usamos muy a menudo y del que casi siempre queremos ejecutar la última versión.

Antes teníamos que instalarlo en global para poder usarlo.

```shell
npm install -g create-react-app
create-react-app my-app
```

Ahora ya no es necesario, npx se encargará de hacerlo instalándolo temporalmente para ser eliminado una vez termine la ejecución. 

```shell
npx create-react-app my-app
```

Por supuesto también podemos indicar qué versión queremos ejecutar.

```shell
npx eslint@v3.18.0 yourfile.js
```

O podemos ejecutar código de github: de un repo o de un gist.

```shell
npx github:piuccio/cowsay Hi!

npx gist:10d73f81df0773925b633d77a372b4ea
```

Incluso gracias a [este paquete en npm](https://www.npmjs.com/package/node) podemos ejecutar cualquier versión de node.

```shell
npx node@8 myscript.js
```

Para terminar aquí tenéis una colección de paquetes que funcionan especialmente bien con npx: https://github.com/suarasaur/awesome-npx