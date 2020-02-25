

https://github.com/GodotVR/godot-vr-common

saber algo de godot requerido

también podemos usar OpenVR

https://github.com/GodotVR/godot_openvr
https://github.com/GodotVR/godot_oculus

steam / https://godotengine.org/
godot 3.2

opengl 3

seleccionamos 3dScene

guardamos la escena

Damos a assetslib y buscamos "oculus" y descargamos "Oculus VR Module" y luego le damos a install
OpenVRModule y VR helper scenes and files

Pinchamos en 3d para salir del asset lib y volver a nuestro area de trabajo

aquí vamos a crear la camara en nuestro Nodo Raiz pulsamos botón derecho y "Instance child scene" ahora tendremos un popup con las instancias que podemos crear, seleccionamos oculus_first_person.tscn y pulsamos Open.

ovr_first_person.tscn

Ahora vemos la camara representada en nuestro mundo 3d

Volvemos a seleccionar el nodo raiz y botón derecho "Attach Script", se abre un popup y pulsamos "Create"

```gd
    # var interface = ARVRServer.find_interface("OpenVR")
    var interface = ARVRServer.find_interface("Oculus")

    if interface and interface.initialize():
        get_viewport().arvr = true
        
        # Si usamos OpenVR
        # get_viewport().hdr = false
          
        OS.vsync_enabled = false
        
        Engine.target_fps = 80
```

Desactivamos vsyn para evitar el capado a 60fps y ponemos el target_fps al número de fps de nuestro dispositivo, en mi caso 80fps porque voy a usar unas Rift S

Guardamos .tscn si no lo hemos hecho ya.

Pulsamos play nos preguntará nuestra escena principal, seleccionamos la única que tenemos hasta ahora.

vemos la escena

botón derecho "Editable Children" y en la mano que queremos añadimo una nueva instacia, esta vez Function_Teleport

if your scene doesn't have a floor yet:

    add a StaticBody node to the scene root
    add a MeshInstance as a child of the StaticBody and set its Mesh to New PlaneMesh
    add a CollisionShape a child of the StaticBody and set its Shape to New PlaneShape
