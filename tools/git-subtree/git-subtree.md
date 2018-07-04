# Tutorial git subtree

En este tutorial vamos a ver como usar `git subtree` con ejemplos. Los subtrees nos permiten usar el código de un repositorio hijo en un repositorio padre al final es una alternativa a los submódulos con un flujo de trabajo distinto. Veamoslo con ejemplos.

Este es el estado inicial de nuestro repositorio padre.
![init-parent](https://raw.githubusercontent.com/juanfran/posts/master/git-subtree/assets/init-parent.png)

En el tenemos una carpeta `vendor` que queremos mover a un repositorio aparte sin perder el histórico.

Lo primero que vamos hacer es sacar el código de vendor a una rama.

```shell
git subtree split --prefix=vendor -b split
```


git subtree add --prefix=vendor/ subtree-child master (--squash hace un squash de los commits del subrepo)
git subtree pull --prefix=vendor/ subtree-child master (--squash hace un squash de los commits del subrepo)