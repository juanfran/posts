# Tutorial git subtree

En este tutorial vamos a ver como usar `git subtree`. Los subtrees nos permiten usar el código de un repositorio hijo en un repositorio padre. Es una alternativa a los submódulos con un flujo de trabajo distinto. Veamoslo con ejemplos.

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

Como tenemos el contenido de vendor en el repositorio hijo ya podemos eliminarlo de master.

```shell
git rm -r vendor
git commit -m "removing vendor folder"
```

Ahora queremos que nuestro repositorio padre tenga el código del respositorio hijo.

Primero creamos el subtree.

```shell
git subtree add --prefix=vendor/ subtree-child master --squash
git push
```

Ahora nuestro repositorio padre está así.

![master-squash](https://raw.githubusercontent.com/juanfran/posts/master/tools/git-subtree/assets/master-squash.png)

Como podeis ver volvemos a tener la carpeta vendor con `lib.js` dentro. Esta carpeta no es ninguna referencia ni nada parecido a nuestro repositorio hijo. Es una copia de la rama master.

Ahora veamos el log.

![commits-squash](https://raw.githubusercontent.com/juanfran/posts/master/tools/git-subtree/assets/commits-squash.png)

Añadir el subtree nos ha creado 2 commits, uno con el merge y otro con el siguiente mensaje `Squashed 'vendor/' content from commit` cuando hemos añadido el repositorio lo hemos hecho con el flag `squash` con esto hemos dicho que se traiga el contido del repositorio hijo pero que no conserve el historico del hijo en el padre osea que nos lo deje en un solo commit.




git subtree pull --prefix=vendor/ subtree-child master (--squash hace un squash de los commits del subrepo)