# Hello World cuántico

En este tutorial vamos a crear un programa muy sencillo que primero ejecutaremos en un simulador de ordenador cúantico pero cuando lo tengamos terminado lo haremos en un ordenador cuántico de verdad (en serio!).

Para empezar necesitamos tener instalado python >= 3.5 y pip. Ahora instalamos `qiskit`.

```shell
pip install qiskit
```

[Qiskit](https://github.com/QISKit), es un framework en python desarrollado por IBM que nos permite trabajar con ordenadores cuánticos, también podremos simularlos para los que justo ahora no tengais un ordenador cuántico a mano. Empezamos.

Primero vamos a crear un circuito con dos bits y dos [qubtis](https://es.wikipedia.org/wiki/C%C3%BAbit).

```python
import qiskit as qk

qr = qk.QuantumRegister(2)
cr = qk.ClassicalRegister(2)
qc = qk.QuantumCircuit(qr, cr)
```

Despues de importar qiskit invocamos **QuantumRegister**, aquí le estamos pidiendo al framework que nos inicialice un array con 2 qubits. Los qubits son el equivalente cuántico a los bits de los ordenadores convencionales, tienen también dos posibles estados 0 ó 1 pero con algunas particularidades que vamos a ver más adelante.

La siguiente que hacemos es llamar a **ClassicalRegister** que nos crea un array con 2 bits convencionales donde iremos metiendo el resultado los qubits.

Y por último con **QuantumCircuit** creamos un circuito virtual donde registramos nuestros bits y qubits.

Ahora vamos a leer el valor de nuestros qubits.

```python
qc.measure(qr[0],cr[0])
qc.measure(qr[1],cr[1]))
```

Aquí estamos pidiendo al circuito que lea el valor de los qubits en `qr` y meta el resultado en sus respectivos bits en `cr`.

Por último vamos a instanciar el simulador para hacer las pruebas y le pedimos que ejecute el circuito `qc` 1000 veces.

```python
backend = qk.BasicAer.get_backend('qasm_simulator')
job1 = qk.execute([qc], backend=backend, shots=1000)
result1 = job1.result()

print(result1.get_counts(qc))
```

Si ejecutamos el código veremos lo siguiente.

```shell
{'00': 1000}
```

Esto quiere decir que la consulta del valor de los 2 qubits durante las 1000 ejecuciones simpre ha sido 0.

#### Superposición

Bueno como veis nuestro programa cuántico no hace nada muy cuántico pero ahora empieza lo divertido.

Añadimos la siguiente línea a nuestro código justo antes del primer `measure`.

```python
qc.h(qr[0]) 
```

Con esta simple línea estamos diciendo al circuito `qc` que añada una [puerta lógica cuántica](https://en.wikipedia.org/wiki/Quantum_logic_gate) al qubit que hay en la posición 0 de nuestro array de qubits (`qr`). Es decir `qc.h` es un equivalente cuántico a los AND, OR, XOR etc y con él estamos añadiendo al qubit la puerta de Hadamard.

La puerta de Hadamard nos permite añadir [superposición](https://es.wikipedia.org/wiki/Superposici%C3%B3n_cu%C3%A1ntica) a nuestro qubit. Simplificando mucho esto quiere decir que nuestro qubit entre medición y medición va a estar entre 0 y 1 al mismo tiempo aunque suene muy antiintuitivo.

Si nos imaginamos una esfera donde el polo superior es 0 y el inferior es 1, la superposición son todos los otros puntos posibles en la superficie. En resumen un bit puede contener un valor (0 ó 1) pero un qubit contiene ambos valores (0 y 1). 

[![Esfera de Bloch](https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bloch_sphere.svg/800px-Bloch_sphere.svg.png)](https://es.wikipedia.org/wiki/C%C3%BAbit#/media/File:Bloch_sphere.svg)https://es.wikipedia.org/wiki/C%C3%BAbit#/media/File:Bloch_sphere.svg

Pero cuando medimos nuestro qubit le "obligamos" a decantarse por 0 o por 1.

Si volvemos a ejecutar el código veremos algo así.

```shell
{'00': 508, '01': 492}
```

En este ejemplo el qubit que hemos puesto en superposición ha sido "1" 492 veces de las 1000 que lo hemos medido, el otro qubit que todavía no hemos tocado es 0 siempre.

#### Entrelazamiento

Ahora vamos a desencadenar un [entrelazamiento](https://en.wikipedia.org/wiki/Bell_state) que es incluso más raro que la superposición. Cuando entrelazamos 2 qubits estos se influencian independientemente de la distancia a la que se encuentren. Es como si la información se teleportarse....

Para enlazar nuestros dos qubits añadimos esta línea a continuación de la superposición.

```python
qc.cx(qr[0], qr[1])
```

Aquí estamos añadiendo la puerta [CNOT](https://en.wikipedia.org/wiki/Controlled_NOT_gate) que se encarga de entrelazar nuestros dos qubits, esto quiere decir que cuando midamos `qr[0]` automáticamente `qr[1]` se volteará solo si `qr[0]` es 1.

Si ejecutamos el código obtenemos el siguiente resultado.

```shell
{'00': 496, '11': 504}
```

Como vemos tanto `qr[0]` como `qr[1]` siempre dan el mismo resultado cuando los medimos.

#### Circuito

Este es el estado final de nuestro circuito que podéis ver con `print(qc.draw())`.

![circuit](https://raw.githubusercontent.com/juanfran/posts/master/others/quantum-programming/assets/circuit.png)

`q0_0` y `q0_1` son los dos qubits, con la H podemos ver donde hemos aplicado la puerta de Hadamard, con la X vemos que `q0_1` está entrelazado con `q0_0` y por último M son las mediciones de los qubits que guardan valores en los bits `c0_0` y `c0_1`.

#### Ordenador cuántico real

Ahora que hemos terminado vamos a quitar el simulador y ejecutar el código en un ordenador cuántico real.

Para ello podemos usar uno de los 4 ordenadores cuánticos entre 5 y 16 qubits que IBM ofrece gratuitamente.

Para hacerlo tenemos que registrarnos en IBM Q y generar un token [aquí](https://quantumexperience.ng.bluemix.net/qx/account/advanced).

![token](https://raw.githubusercontent.com/juanfran/posts/master/others/quantum-programming/assets/token.png)

Modifiquemos el código. Primero vamos a poner el token que hemos generado y nos autenticamos.

```python
token = "TOKEN"
qk.IBMQ.save_account(token)
qk.IBMQ.load_accounts()
```

Segundo vamos a usar qiskit para que nos diga el ordenador cuántico menos ocupado para ponernos en la cola de ejecución. Como nuestra app solo necesita 2 qubits nos vale cualquiera.

```python
from qiskit.providers.ibmq import least_busy

#backend=qk.BasicAer.get_backend('qasm_simulator')
backend = least_busy(qk.IBMQ.backends())
```

Y lanzamos nuestro script. Esta vez la respuesta no será inmediata, depende de lo ocupado que esté el ordenador.

```shell
{'11': 345, '10': 102, '00': 489, '01': 64}
```

Como podéis ver mi resultado es diferente al simulador, tenemos una minoría de '10' y '01', eso significa que el entrelazamiento no ha funcionado como se esperaba, esto es normal, estamos usando prototipos de ordenadores cuánticos y todavía no son perfectos.

Esto es todo, ¡enhorabuena! has ejecutado tus primeras líneas de código en un ordenador cuántico real.