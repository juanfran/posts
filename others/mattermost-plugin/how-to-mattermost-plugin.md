# Cómo hacer un plugin para Mattermost

// final gif

En este tutorial vamos a crear un sencillo plugin para Mattermost que no servirá de base de conocimiento para desarrollar plugins más complejos.

En el ejemplo que vamos a desarrollar el plugin responderá a un comando con un usuario random conectado al canal.

## Preparación

Para probar el plugin necesitamos tener Mattermost en nuestra máquina, si no es así Mattermost tiene una imagen de Docker muy sencilla de instalar pensada para poder probar Mattermost, no para ser usada en producción.

Para instalarla hay que tener Docker instalado y ejecutar este comando.

```shell
docker run --name mattermost-preview -d --publish 8065:8065 --add-host dockerhost:127.0.0.1 mattermost/mattermost-preview
```

En [este repositorio](https://github.com/mattermost/mattermost-docker-preview) teneis más detalles de la instalación.

Si ha ido bien podeis acceder a la nueva instancia de Mattermost en `http://localhost:8065/`, donde podemos crear nuestro usuario.

Para este plugin, necesitamos tener algunos usuarios extra. Para crear nuevos usuarios vamos al menú principal y seleccionamos "Get Team Invite Link", copiamos la url y la abrimos en un nuevo navegador para crear el usuario, hacemos esto tantas veces como usuario nuevos queramos crear.

![invite-link](https://raw.githubusercontent.com/juanfran/posts/master/others/mattermost-plugin/assets/invite-link.jpg)

Ya tenemos Mattermost instalado con varios usuarios de prueba, vamos a empezar el plugin.

## Plugin de usuario aleatorio

La forma más sencilla de empezar un plugin desde cero es partir de [este template](https://github.com/mattermost/mattermost-plugin-starter-template) que nos da Mattermost.

Primero nos clonamos el template.

```bash
git clone --depth 1 https://github.com/mattermost/mattermost-plugin-starter-template com.example.my-plugin
```

Ahora en el repo que hemos clonado editamos el `plugin.json` donde ponemos el name, id y description que queramos. También podemos quitar `webapp` del json porque nuestra plugin no va a tener front.

```json
{
    "id": "random-user-plugin",
    "name": "Random user plugin",
    "description": "This plugin return a random user in the channel",
    "version": "0.1.0",
    "min_server_version": "5.12.0",
    "server": {
        "executables": {
            "linux-amd64": "server/dist/plugin-linux-amd64",
            "darwin-amd64": "server/dist/plugin-darwin-amd64",
            "windows-amd64": "server/dist/plugin-windows-amd64.exe"
        }
    },
    "settings_schema": {
        "header": "",
        "footer": "",
        "settings": []
    }
}
```

Ahora en la raiz del proyecto ejecutamos `make`.

Si todo ha ido bien vemos este mensaje `plugin built at: dist/random-user-plugin-0.1.0.tar.gz`.

Go to System Console > Plugins > Management upload and enable the plugin.

Para subir un nuevo pu
