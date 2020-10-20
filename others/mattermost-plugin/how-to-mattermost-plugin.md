# Cómo empezar a hacer plugins de Mattermost

![demo](https://raw.githubusercontent.com/juanfran/posts/master/others/mattermost-plugin/assets/demo-random-user.gif)

En este tutorial vamos a crear un sencillo plugin para Mattermost con Go que nos servirá de base de conocimiento para desarrollar plugins más complejos.

En el ejemplo que vamos a desarrollar el plugin responderá a un comando con un usuario random conectado al canal, como podéis ver en el gif de arriba.

## Preparación

Para probar el plugin necesitamos tener Mattermost en nuestra máquina, si no es así Mattermost tiene una imagen de Docker muy sencilla de instalar. Esta imagen está pensada para poder probar Mattermost, no para ser usada en producción.

Para instalarla hay que tener Docker instalado y ejecutar este comando:

```shell
docker run --name mattermost-preview -d --publish 8065:8065 --add-host dockerhost:127.0.0.1 mattermost/mattermost-preview
```

En [este repositorio](https://github.com/mattermost/mattermost-docker-preview) tenéis más detalles de la instalación.

Si ha ido bien podemos acceder a la nueva instancia de Mattermost en `http://localhost:8065/`, donde podemos crear nuestro usuario.

Para este plugin, necesitamos tener algunos usuarios extra. Para crear nuevos usuarios vamos al menú principal y seleccionamos "Get Team Invite Link", copiamos la url y la abrimos en un nuevo navegador. Para crear el usuario hacemos esto tantas veces como usuarios nuevos queramos crear.

![invite-link](https://raw.githubusercontent.com/juanfran/posts/master/others/mattermost-plugin/assets/invite-link.jpg)

Ya tenemos Mattermost instalado con varios usuarios de prueba, vamos a empezar el plugin.

## El Plugin

La forma más sencilla de empezar un plugin desde cero es partir de [este template](https://github.com/mattermost/mattermost-plugin-starter-template) que nos da Mattermost.

Primero nos clonamos el template.

```bash
git clone --depth 1 https://github.com/mattermost/mattermost-plugin-starter-template com.example.my-plugin
```

Ahora en el repo que hemos clonado editamos `plugin.json` donde rellenamos name, id y description. También podemos quitar `webapp` del json porque nuestro plugin no va a tener front.

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

Después de editar el json vamos a la consola y en la raíz del proyecto ejecutamos `make`.

Si todo va bien vemos este mensaje `plugin built at: dist/random-user-plugin-0.1.0.tar.gz`.

Para subir el plugin vamos a System Console > Plugins > Plugin Management > Upload plugin, cuando esté subido lo activamos.

![upload1](https://raw.githubusercontent.com/juanfran/posts/master/others/mattermost-plugin/assets/system-console.jpg)

![upload2](https://raw.githubusercontent.com/juanfran/posts/master/others/mattermost-plugin/assets/upload-plugin.jpg)

Tenemos que seguir estos pasos cada vez que queramos probar nuestro plugin. El que acabamos de subir no tiene nada, así que volvamos al código para empezar a programar.

Abrimos `server/plugin.go`, vamos a empezar añadiendo un hook cuando el plugin se active. En este hook vamos a registrar un bot que devolverá el usuario elegido y el comando a utilizar para que el bot responda.

Primero creamos el hook.

```go
func (p *Plugin) OnActivate() error {

}
```

Ahora registramos el bot dentro de la función `OnActivate`
```go
bot := &model.Bot{
  Username:    "random-user",
  DisplayName: "RandomUser",
}

botUserID, ensureBotErr := p.Helpers.EnsureBot(bot)

if ensureBotErr != nil {
  return ensureBotErr
}

p.botUserID = botUserID
```

En las primeras líneas estamos dando un username y un display name al bot. Para ello, usamos el modelo de Mattermost que podemos importar desde `github.com/mattermost/mattermost-server/v5/model`. 

En la siguientes líneas creamos el bot con `p.Helpers.EnsureBot` y gestionamos el error si hubiese alguno.

Por último, guardamos el id del bot recién creado en el plugin, para ello, tenemos que extender el modelo de plugin que tenemos al inicio del fichero. Lo dejamos así: 

```go
type Plugin struct {
  plugin.MattermostPlugin

  configurationLock sync.RWMutex

  configuration *configuration
    
  // Nuestro bot id
  botUserID string
}
```

Continuamos registrando el comando que tiene que escribir el usuario para que el bot reaccione. Añadimos las siguientes líneas al final de `OnActivate`:

```go
return p.API.RegisterCommand(&model.Command{
  // Comando
  Trigger: "random-user",
  AutoComplete: true,
})
```

`RegisterCommand` tiene muchas más opciones que podemos consultar [aquí](https://pkg.go.dev/github.com/mattermost/mattermost-server/v5/model#Command).

Ahora que hemos registrado nuestro bot y el comando, vamos a escribir el código que se va ejecutar cuando se invoque a `/random-user`.

Primero creamos un nuevo hook que se lanzará cuando se ejecute un comando.

```go
func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
    
}
```

También necesitaremos todos los usuarios del canal actual. Para ello, usaremos `GetUsersInChannel` de la api de Mattermost.

`GetUsersInChannel(channelId, sortBy string, page, perPage int) ([]*model.User, *model.AppError)`

Como veis necesitamos el id del canal que lo tenemos entre los argumentos que recibe `ExecuteCommand`  en `args.ChannelId`. También tenemos que paginar, en este caso le pediremos la página 0 con 1000 usuarios para simplificar. El código quedaría así:

```go
users, _ := p.API.GetUsersInChannel(args.ChannelId, "username", 0, 1000)
```

Ya tenemos todos los usuarios en la variable `users`, pero ,entre ellos, se pueden encontar bots así que vamos a filtrarlos creando una función que se encargue de ellos:

```go
func (p *Plugin) filterBots(users []*model.User) []*model.User {
	var noBots []*model.User

	for _, user := range users {
		if !user.IsBot {
			noBots = append(noBots, user)
		}
	}

	return noBots
}
```

y la usamos:

```go
users, _ := p.API.GetUsersInChannel(args.ChannelId, "username", 0, 1000)
users = p.filterBots(users)
```

En users ya tenemos un listado de usuarios libre de bots, ahora solo tenemos que elegir uno aleatorio y creamos un mensaje para mencionarle.

```go
usersLen := len(users)
// Int, aleatorio entre 0 y el número de usuarios.
userIndex := rand.Intn(usersLen)
// Accedemos al usuario usando el indice aleatorio `users[userIndex]` y nos quedamos con su username
msg := "@" + users[userIndex].Username
```


A continuación, vamos a hacer que el bot escriba el mensaje de respuesta mencionando al usuario seleccionado.

```go
// Rellenamos la información del post, usando los datos del canal actual, el bot id que guardamos anteriormente y el mensaje que acabamos de rellenar con el nombre de usuario.
post := &model.Post{
  UserId:    p.botUserID,
  ChannelId: args.ChannelId,
  RootId:    args.RootId,
  Message:   msg,
}

// Creamos el post
_, createPostError := p.API.CreatePost(post)

if createPostError != nil {
  return nil, model.NewAppError("ExecuteCommand", "error random-user", nil, createPostError.Error(), http.StatusInternalServerError)
}

// Respuesta al comando, en nuestro caso no necesitamos ninguna
return &model.CommandResponse{}, nil
```

También podemos añadir una pantalla de opciones a nuestro plugin.

Abrimos `plugin.json` y añadimos un radiobutton para elegir si queremos añadir `@` en las menciones o no. Podemos ver opciones para los settings [aquí](https://developers.mattermost.com/extend/plugins/manifest-reference/#settings_schema.settings.type)

```json
"settings_schema": {
    "header": "",
    "footer": "",
    "settings": [
        {
            "key": "At",
            "display_name": "Mención con @",
            "type": "bool",
            "default": true
        }
    ]
}
```

Modificamos `plugin.go` para leer la configuración:

```go
config := p.getConfiguration()
at := config.At

usersLen := len(users)
userIndex := rand.Intn(usersLen)
username := users[userIndex].Username

msg := ""

if at {
  msg = "@" + username
} else {
  msg = username
}
```

Y añadimos el nuevo campo al modelo de la configuración en `server/configuration.go`.

```go
type configuration struct {
	At bool
}
```

Cuando subamos el plugin veremos algo así.

![settings](https://raw.githubusercontent.com/juanfran/posts/master/others/mattermost-plugin/assets/settings.jpg)


Ya tenemos el plugin listo, ahora si hacemos `make` y repetimos los pasos anteriores podremos ver el plugin en acción como hemos visto en el gif al inicio del tutorial.

Este es el código completo en `plugin.go`

```go
package main

import (
	"math/rand"
	"sync"

	"github.com/mattermost/mattermost-server/v5/model"
	"github.com/mattermost/mattermost-server/v5/plugin"
)

type Plugin struct {
	plugin.MattermostPlugin

	configurationLock sync.RWMutex

	configuration *configuration

	botUserID string
}

func (p *Plugin) OnActivate() error {
	bot := &model.Bot{
		Username:    "random-user",
		DisplayName: "RandomUser",
	}
	botUserID, ensureBotErr := p.Helpers.EnsureBot(bot)

	if ensureBotErr != nil {
		return ensureBotErr
	}

	p.botUserID = botUserID

	return p.API.RegisterCommand(&model.Command{
		Trigger:      "random-user",
		AutoComplete: true,
	})
}

func (p *Plugin) filterBots(users []*model.User) []*model.User {
	var noBots []*model.User

	for _, user := range users {
		if !user.IsBot {
			noBots = append(noBots, user)
		}
	}

	return noBots
}

func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
  users, _ := p.API.GetUsersInChannel(args.ChannelId, "username", 0, 1000)

  users = p.filterBots(users)

  config := p.getConfiguration()
  at := config.At

  usersLen := len(users)
  userIndex := rand.Intn(usersLen)
  username := users[userIndex].Username

  msg := ""

  if at {
    msg = "@" + username
  } else {
    msg = username
  }

  post := &model.Post{
    UserId:    p.botUserID,
    ChannelId: args.ChannelId,
    RootId:    args.RootId,
    Message:   msg,
  }

  p.API.CreatePost(post)

  return &model.CommandResponse{}, nil
}
```

Para conocer qué más podéis hacer con los plugin de Mattermost os recomiendo que echéis un vistazo a [la referencia de la API](https://developers.mattermost.com/extend/plugins/server/reference/).

Y [aquí](https://developers.mattermost.com/contribute/server/plugins/) teneis un overview general de cómo hacer plugins con Mattermost.

Por último, [aquí](https://github.com/juanfran/mattermost-random-user) tenéis un ejemplo más completo con distintas configuraciones, por ejemplo solo elegir un usuario que esté online, o un listado de usuarios.