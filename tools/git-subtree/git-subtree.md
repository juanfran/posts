# Tutorial git subtree

En este tutorial vamos a ver como usar `git subtree` con ejemplos. Los subtrees nos permiten usar el código de un repositorio hijo en un repositorio padre al final es una alternativa a los submódulos con un flujo de trabajo distinto. Veamoslo con ejemplos.

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

Y hacemos push de la rama split en master del repo hijo.

```
git push subtree-child split:master
```

git push subtree-child split:master

git subtree add --prefix=vendor/ subtree-child master (--squash hace un squash de los commits del subrepo)
git subtree pull --prefix=vendor/ subtree-child master (--squash hace un squash de los commits del subrepo)