# Primeros pasos en Realidad virtual con Godot

Godot es actualmente uno de los proyectos de software libre más populares que hay para el desarrollo de videojuegos. Sencillo de aprender, intuitivo, con una comunidad que ha crecido muchísimo en los últimos años (tercer engine más usado en el GGJ) y con una documentación estupenda.

## Instalacción

Podeis descargar facilmente Godot [desde su web](https://godotengine.org/) o incluso [desde Steam](https://store.steampowered.com/app/404790/Godot_Engine/). Tenéis versiones para Linux, OS X y Windows. Para este tutorial vamos a usar la versión `standard` que usa un lenguaje propio de Godot, GDScript, muy fácil de aprender si estáis familiarizados con Python. También tienes disponible la versión con C#.

Usaremos para probar unas gafas de realidad virtual con 6DOF, nosotros usaremos unas Oculus Rift S pero funciona perfectamente en unas HTC Vive, para ello usaremos el api de [OpenVR](https://en.wikipedia.org/wiki/OpenVR).

## Proyecto Godot + RV

Vamos a empezar nuestro pequeño proyecto de Godot en el que veremos lo sencillo que es integrar realidad virtual.

Cuando abramos Godot veremos el listado de proyectos en el que seleccionamos `New proyect` y veremos una ventana como esta.

![crear proyecto](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/create-project.png)

Aquí ponemos un nombre a nuestro proyectos, dónde queremos guardarlo y elegimos OpenGL 3 para el render. Pulsamos `Create & Edit`.

Ahora veremos esta ventana, donde nos pregunta el tipo de nodo del root, seleccionamos 3D scene.

![godot-3d-scene](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/godot-3d-scene.png)

Godot funciona con nodos y escenas. Ahora mismo lo que tenemos es una escena 3d con un solo nodo con el nombre `Spatial`. Una escena es básicamente un árbol de nodos y un nodo son los distintos elementos que conforman nuestro juego, pueden ser sonidos, posiciones, objetos 3d, animaciones, cámaras etc. Los nodos son una manera fantástica de organizar nuestro proyecto de forma sencilla.

Ahora vamos a incrustar nuestra cámara y manos en RV. En la parte superior central del editor pulsamos AssetLib para entrar en la biblioteca de plugins con la que cuenta Godot. Aquí buscamos `vr` y veremos varios plugins. Elegimos `OpenVR module` y `VR helper scenes and files` pulsamos `Download` e `Install`. Como veis en la imagen también contamos con `Oculus VR Module` por si queremos hacer nuestro juego usando las apis de Oculus.

![assetlib](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/assetlib.png)

![instalar openvr](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/install-open-vr.png)

![paso 2, instalar open vr](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/install2-open-vr.png)

Ahora que tenemos instalado `OpenVR module` y `VR helper scenes and files` pinchamos en 3D para volver a nuestro espacio de trabajo.

En nuestra escena principal vamos a crear nuestro primer nodo con funcionalidad para ello vamos a instanciar uno que dentro del plugin  `VR helper scenes and files` que nos dá los nodos necesarios para la cámara y los mandos. Para ello hacemos click derecho en el nodo root, pulsamos `Instance child scene` y seleccionamos `ovr_first_person`.

![instance-child-scene](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/instance-openvr.png)

Lo que hemos hecho es crear un nodo que instancia una escena, como hemos dicho una escena es un árbol de nodos si queremos ver los nodos que conforman esta escena pulsamos botón derecho `OVRFirstPerson` y seleccionamos `Editable children`.

Nuestro espacio de trabajo debería tener este aspecto.

![viewport](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/viewport.png)

En el árbol de nodos de nuestra escena vemos que `OVRFirstPerson` que tiene hijos de distintos tipos entre ellos `ARVRCamera` que es un nodo tipo `camera` y los node de las manos de tipo `ARVRController`. También podemos ver que viewport 3D de Godot ha cambiado y podemos ver representados los nuevos nodos. 

Guardamos la escena (CTRL-S) la llamamos `Main.tscn` y pulsamos `Save`.

Vamos a escribir nuestras primeras líneas de `GDScript` para indicarle a Godot que estamos lanzando un juego de realidad virtual. Seleccionamos el nodo raíz, botón derecho, hacemos click en `Attach Script`, se abre un popup y pulsamos `Create`. Ahora estamos en el modo edición, vemos que en el panel izquierdo nos aparece el listado de ficheros que ahora solo contiene el fichero que acabamos de crear `Main.gd`.

Pegamos el siguiente código en la función `_ready` que se ejecutará cuando la escena esté lista.

```gd
    var interface = ARVRServer.find_interface(`OpenVR`)

    if interface and interface.initialize():
        // Activar modo VR
        get_viewport().arvr = true
        
        // OpenVR no soporta HDR
        get_viewport().hdr = false
             
        OS.vsync_enabled = false
        Engine.target_fps = 80
```

En este código buscamos la interfaz `OpenVR` y comprobamos que está inicializada. En las siguientes líneas ponemos el viewport en modo vr, desactivamos `hdr` porque `OpenVR` no lo soporta. A continuación quitamos vsync y ponemos de fps objetivos 80 (el máximo refresco de Rift S).


Bien ya estamos listos para probarlo por primera vez. Pulsamos play en la esquina superior derecha (o F5). Si os poneis vuestras gafas podéis ver que los mandos y la cámara funcionan perfectamente.

![demo](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/demo1.png)

Lo siguiente que vamos hacer es crear un pequeño terreno por el que poder desplazarnos. Pulsamos botón derecho en nuestro nodo raiz (`Spatial`), pulsamos `Add child node` y buscamos [`StaticBody`](https://docs.godotengine.org/en/3.1/classes/class_staticbody.html). Un `StaticBody` es un nodo rígido que está pensado para no moverse, osea ideal para nuestro suelo. Como hijos de `StaticBody` vamos añadir dos nodos más uno de tipo `MeshInstance` y `CollisionShape`.

`MeshInstance` es un nodo que contiene una figura geométrica que usaremos para ver nuestro suelo, al seleccionarlo en la barra de herramientas de la derecha desplegamos el campo `Mesh` y seleccionamos `New CubeMesh`. 

![meshInstance, mesh, newCubeMesh](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/mesh.png)

`CollisionShape` indicamos la zona donde queremos colisión osea la zona por donde podremos andar sin caer al vacío, para ello ahora seleccionamos este nodo y en el campo `Shape` seleccionamos `New BoxShape`.

![CollisionShape shape newBoxShape](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/collision.png)

Ahora querremos cambiar la posición y tamaño del cubo, para ello en el viewport en la parte superior izquierda podemos elegir los siguientes modos Select mode (Q), Move mode (W) y Scale Mode (R). Ahora agrandamos el cubo y lo dejamos plano.

![cambiar tamaño cubo](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/mesh-shape.gif)

Este debería ser el aspecto de nuestra escena.

![Viewport con StaticBody](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/final-static-body.png)

Por último añadiremos el teletransporte habitual en mucho juego de realidad virtual, gracias a los plugins que hemos instalado es muy sencillo.

Seleccionamos el nodo de la mano con la que queramos usar el teletransporte por ejemplo `Right_Hand`, botón derecho, click en `Instance child scene` y elegimos `Function_Teleport`.

![Teleport node](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/function-teleport.png)


Si le damos a play veréis que tenemos el clásico sistema de teletransporte pulsando gatillo, apuntando y soltando.

![Demo teletransporte](https://raw.githubusercontent.com/juanfran/posts/master/godot/getting-started-godot-vr/assets/demo2.gif)

Listo! si quereis seguir profundo os recomiendo seguir el tutorial oficial de la [página de Godot](https://docs.godotengine.org/en/3.1/tutorials/vr/vr_starter_tutorial.html) que nos explicara cosas más complejas como interactuar con objetos.
