En este tutorial vamos hacer un programa muy sencillo que vamos a ejecutar en un ordenador cuántico (en serio!).

Para empezar necesitamos tener instalado python >= 3.5 y pip. Ahora instalamos `qiskit`.

```shell
pip install qiskit
```

[Qiskit](https://github.com/QISKit), es un framework en python desarrollado por IBM que nos permite trabajar con ordenadores cuánticos, también nos permite simularlos para los que justo ahora no tengais  un ordenador cuántico en casa. Empezamos.

Primero, vamos a inicializar nuestra aplicación.

```python
import qiskit as qk

qr = qk.QuantumRegister(2)
cr = qk.ClassicalRegister(2)
qc = qk.QuantumCircuit(qr, cr)
```

Empezamos usando qiskit para llamar a QuantumRegister, aquí le estamos piendo al framework que nos inicialice un registro con 2 qubits. 

Bien y antes de continuar vamos a explicar muy por encima que es un qubit. Los quibits son el equivalente cuántico a los bits de los ordenadores convencionales. Los qubits también tiene dos posibles estados 0 y 1 pero con algunas particuladidades que vamos a ver más adelante.

La siguiente que hacemos es llamar a ClassicalRegister que nos crea un registro con 2 bits convecionales donde iremos mentiendo el resultado los qubits.

Y por último creamos un circuito virtual donde añadiremos nuestros bits y qubits.

Ahora vamos a medir el valor de nuestros qubits.

```pythons
qc.measure(qr[0],cr[0])
qc.measure(qr[1],cr[1]))
```

Aquí estamos pidiendo al circuito dos mediciones, le peditos que lea el valor del qubit `qr[0]` y lo meta en el bit `cr[0]` y hacemos lo mismo con el qubit y el bit 1.

Por último vamos a instanciar el simulador quántico y pedirle que ejecute el circuito `qc` 1000 veces y pintamos el resultado.

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

Esto quiere decir que nuestros que al consultar el valor de nuestros dos qubits ambos a devuelto cero 1000 veces.

#### Superposición

Bueno como veis nuestro programa cúantico no hace nada muy cuántico pero ahora empieza lo divertido

Añadimos la siguiente linea a nuestro código justo antes del primer `measure`.

```python
qc.h(qr[0]) 
```

Con esta simple línea estamos diciendo al circuito `qc` que añada una [puerta lógica cuántica](https://en.wikipedia.org/wiki/Quantum_logic_gate) al qubit que hay en la posición 0 de nuestro array de qubits (`qr`), osea es el equivalente a los AND, OR, XOR etc. Con `qc.h` estamos añadiendo al qubit la puerta de Hadamard.

La puerta de Hadamard nos permite añadir [superposición](https://es.wikipedia.org/wiki/Superposici%C3%B3n_cu%C3%A1ntica) a nuestro qubit. Simplificando mucho esto quiere decir que nuestro qubit entre medición y medición va a estar entre 0 y 1 al mismo tiempo aun que suena muy contra intuitivo.

Si nos imaginamos una esfera donde el polo superior es 0 y el inferior es 1, la superposición son todos los otros puntos posibles en la superficie.

[![Esfera de Bloch](https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bloch_sphere.svg/800px-Bloch_sphere.svg.png)](https://es.wikipedia.org/wiki/C%C3%BAbit#/media/File:Bloch_sphere.svg)https://es.wikipedia.org/wiki/C%C3%BAbit#/media/File:Bloch_sphere.svg

Pero cuando medimos nuestro qubit le "obligamos" a decantarse por 0 o por 1.

Si volvemos a ejecutar el código veremos algo así.

```shell
{'00': 508, '01': 492}
```

En este ejemplo el qubit que hemos puesto en superposición ha sido "1" 492 veces de las 1000 que lo hemos medido, el otro qubit que todavía no lo hemos tocado sigue siendo 0 siempre.

#### Entrelazamiento

Ahora vamos a desecadenar un [entrelazamiento](https://en.wikipedia.org/wiki/Bell_state) que es incluso más raro que la superposición. Cuando entrelazamos 2 qubits estos se influencian independientemente de a la distacia que se encuentren.

Para enlazar nuestros dos qubits añadimos esta linea a continuación de la superposición.

```python
qc.cx(qr[0], qr[1])
```

Aquí estamos añadiendo la puerta de control [CNOT](https://en.wikipedia.org/wiki/Controlled_NOT_gate) que se encarga de entrelazar nuestros dos qubits, esto quiere decir que cuando midamos `qr[0]` automáticamente `qr[1]` se volteará solo si `qr[0]` es 1.

Si ejecutamos ahora el código el siguiente resultado.

```shell
{'00': 496, '11': 504}
```

Como vemos tanto `qr[0]` como `qr[1]` siempre dan el mismo resultado cuando los medimos.

#### Circuito

Este es el estado final de nuestro circuito que podeis ver con `print(qc.draw())`.

![circuit](https://raw.githubusercontent.com/juanfran/posts/master/others/quantum-programming/assets/circuit.png)

`q0_0` y `q0_1` son los dos qubits, con la H podemos dondemo hemos aplicado la puerta de Hadamard, con la X vemos que `q0_1` ahora está entrelazado con `q0_0` y por último M son las mediciones.

------------------------------------
IBM 16 qubits
- exponential growth (1, 2, 4, 8, 16, 32... 2048, 4096, 8192), si lo multiplimas 31 veces salen x millones

51 (17 x 3)

- superposition and entanglement 

superposición 

en un ordenador convencional tenemos un bit que puede ser 0 o 1

un qbit puede ser 0 o 1 o estar en un estado de superposición que puede ser cualquier punto de la superficie de la esfera, al medir seguirla siendo 0 o 1 pero la probabilidad cambia en función del estado de qbit

pero en un qbit cuando lo midamos será 0 o 1 como un bit normal
pero antes de medir puede estar en 0 y 1 al mismo tiempo.

Entanglement

https://github.com/Qiskit/ibmqx-user-guides/blob/master/rst/beginners-guide/007-Entanglement/001-Entanglement.rst

si tienes dos electrones entrelazados si giras uno hacia arriba
el otro girará hacia abajo independienteme de a que distancia esten.

Osea en el momento que medimos el primero electro si está hacia arriba sabemos que el otro está hacia abajo

hadamard gate


python3




crear cuenta https://quantumexperience.ng.bluemix.net/qx/account/advanced