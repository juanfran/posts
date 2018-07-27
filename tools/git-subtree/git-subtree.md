# Tutorial git subtree

En este tutorial vamos a ver cómo usar `git subtree`. Los subtrees nos permiten usar el código de un repositorio hijo en un repositorio padre. Es una alternativa a los submódulos con un flujo de trabajo distinto. Veámoslo con ejemplos.

Este es el estado inicial de nuestro repositorio padre.

![init-parent](https://raw.githubusercontent.com/juanfran/posts/master/tools/git-subtree/assets/init-parent.png)

En el tenemos una carpeta `vendor` que queremos mover a un repositorio aparte sin perder el histórico.

Lo primero que vamos hacer es sacar el código de vendor a una rama.

```shell
git subtree split --prefix=vendor -b split
```

Ya tenemos el código de vendor en una rama que hemos llamado split.

![parent-split-branch](https://raw.githubusercontent.com/juanfran/posts/master/tools/git-subtree/assets/parent-split-branch.png)

Ahora queremos pushear esta rama en el repo hijo.

Añadimos un nuevo repositorio remoto con nombre `subtree-child` y la url del repositorio hijo.

```shell
git remote add subtree-child git@github.com:juanfran/subtree-child.git
```

Y hacemos push de la rama split en master del repositorio hijo.

```shell
git push subtree-child split:master
```

Listo, ya tenemos vendor en un nuevo repositio y ahora podemos eliminarlo de master de nuestro repositorio padre.

```shell
git rm -r vendor
git commit -m "removing vendor folder"
```

Ahora queremos que nuestro repositorio padre vuelva a tener el código de vendor pero esta vez usando el respositorio hijo.

Primero creamos el subtree.

```shell
git subtree add --prefix=vendor/ subtree-child master --squash
git push
```

Ahora nuestro repositorio padre está así.

![master-squash](https://raw.githubusercontent.com/juanfran/posts/master/tools/git-subtree/assets/master-squash.png)

Como podeis ver volvemos a tener la carpeta vendor con `lib.js` dentro. Esta carpeta no es ninguna referencia ni nada parecido a nuestro repositorio hijo. Es una copia de la rama master del repositorio subtree-child.

Ahora veamos el log.

![commits-squash](https://raw.githubusercontent.com/juanfran/posts/master/tools/git-subtree/assets/commits-squash.png)

Añadir el subtree nos ha creado 2 commits, uno con el merge y otro con el siguiente mensaje `Squashed 'vendor/' content from commit` cuando hemos añadido el repositorio lo hemos hecho con el flag `squash` con esto hemos dicho que se traiga el contido del repositorio hijo pero que no conserve el historico del hijo en el padre osea que nos lo deje en un solo commit.

Bien ya tenemos nuestro repositorio con un subtree listo, ahora veamos cómo podemos trabajar con él.

Primero vamos a modificar un archivo en el repositorio padre. Modificamos `vendor/lib.js`, commit y push. Si ahora vamos al repositorio hijo no veremos el cambio. ¿Cómo lo actualizo con los últimos cambios del repositorio padre?

```shell
git subtree push --prefix=vendor/ subtree-child master
```

Si ahora comprobamos el histórico del repositorio hijo veremos el commit que hemos hecho en el padre.

![child-after-push](https://raw.githubusercontent.com/juanfran/posts/master/tools/git-subtree/assets/child-after-push.png)

git subtree irá commit por commit solo cogiendo los cambios que afecten al subtree, por tanto podemos meter tranquilamente en un solo commit cambios que afecten tanto al subtree como al repositorio padre y git se encargará de filtrar.

Ahora vamos a traernos cambios del repositorio hijo al padre. Vamos al hijo y volvemos hacer un cambio en `lib.js`, commit y push. Igual que en el caso anterior si nos vamos al padre no veremos los cambios del repositorio hijo, para actualizar tendremos que hacer pull del subtree.

```shell
git subtree pull --prefix=vendor/ subtree-child master --squash
```

Exactamente igual que con el `git add subtree` veremos el squash (si lo hemos indicado con el flag) y el merge del repositorio hijo.

### Conclusiones

Con algunos flujos de trabajo los subtrees pueden tener ventajas sobre los submodulos, como tenemos una copia del código en el repositorio padre no require que cambiemos nuestro flujo de trabajo, trataremos al código del subtree igual que al resto de ficheros de nuestro proyecto. Por otro lado tenemos que recordar hacer pull/push del repositorio hijo y tener cuidado con los rebases, si hacemos pull del hijo en una rama y luego rebasamos master acabaremos con el historico bastante liado, para ello mejor hacer pull directamente en master y luego rebasarlo a nuestra rama.
