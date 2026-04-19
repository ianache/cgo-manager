# Goal:

Crear nueva microui "protocols" que permitirá gestionar fabricantes, marcas y modelos de dispositivos GPS y los protocolos de telemetria para dispositivos GPS.

# Requirements

- Crear una nueva microui "protocols" para gestionar los protocolos de telemetria para dispositivos GPS (se tiene fabricantes (id, nombre, website, logo), marca del dispositivo (id, nombre, descripcion, imagen, etiquetas para anotar informacion adicional) y modelo (id, nombre, descripcion, etiquetas para anotar informacion adicional). 
- Cada protocolo (id, nombre) se vincula a una o varias marcas y modelos de dispositivos GPS. 
- La especificación de cada protocolo de telemetria se realizará a través de un diseñador visual bajo una dinamica de Drag & Drop desde una paleta de herramientas, con un editor de propiedades de cada nodo del diagrama que permitirá conectar nodo origen con nodo destino. 
- Los nodos serán para modelar los siguientes conceptos visuales: Root (trama raiz), Service (solo recibe conexión desde Root), Frame / Subframe y Field (nodo terminar). 

# Use Cases / User Stories

- Como administrador de la plataforma (role ADMIN) quiero poder gestionar fabricantes (crear nuevo fabricante, editar datos del fabricante, eliminar frabricante siempre que no tenga marcas y modelos asociados)
- Como administrador de la plataforma (role ADMIN) quiero poder gestionar marcas de equipos GPS fabricados por el fabricante (crear nueva marca, editar los datos de la marca, y eliminar una marca siempre que esta no tenga modelos asociados)
- Como administrador de la plataforma (role ADMIN) quiere poder gestionar los modelos de dispositivos GPS asociados a una marca especifica (crear un modelo desde una marca, editar los datos del modelo, y eliminar un modelo siempre que este no tenga protocolos asociados)
- Como Administrador de la Plataforma (role ADMIN) o Usuario diseñador de protocolos (role PROTOCOL_DESIGNER) quiero poder diseñar y gestionar protocolos de telemetria y sus versiones para dispositivos GPS. Los protocolos tienen versiones (id, nombre, descripcion, version, fecha de creacion, fecha de actualizacion, estado: DRAFT, APPROVED y PUBLISHED)
-  Como Diseñador de protocolos (role PROTOCOL_DESIGNER) quiero para los nodos Frame y Service debe habilitarse un botón en la barra principal usando icon apropiado para "Ejecutar" y que permitirá probar la definición de la trama para el caso ejemplo. Al presionarlo debe mostrarse un popup que muestre la trama exemplo y un visor de JSON que muestre el resultado.
- Como Diseñador de Protocolos quiero que los nodos de tipo "Frame", debe tener un pequeño icon a la izquierda de "x" que permita ocular la visualizacion de los nodos hijos o mostrar.

# Acceptances Criteria

- Dado un fabricante, quiero poder ver todas sus marcas y modelos asociados.
- Dado una marca, quiero poder ver todos sus modelos asociados.
- Dado un modelo, quiero poder ver todos sus protocolos asociados.
- Dado un protocolo, quiero poder ver todas sus marcas y modelos asociados.
- Dado un protocolo, quiero poder ver todas sus versiones.
- Dado un protocolo, quiero poder crear una nueva versión.
- Dado un protocolo, quiero poder editar una versión.
- Dado un protocolo, quiero poder eliminar una versión.
- Dado un protocolo, quiero poder publicar una versión.
- Dado un protocolo, quiero poder archivar una versión.
- Dado un protocolo, quiero poder ver el diseñador visual de una versión.
- Dado un protocolo, quiero poder editar el diseñador visual de una versión.
- Dado un protocolo cuando se ha realizado cualquier cambio en el Diseñador Visual del protocolo se deberá mostrar un badget con el texto "MODIFIED" en la barra principal del diseñador visual y se activa el boton de "Save" también ubicado en la barra principal del diseñador visual. Al presionar el boton "Save" se guardará el diseñador visual y se desactivará el badget "MODIFIED" y el boton "Save".
- Dado un protocolo cuando se ha realizado cualquier cambio en el Diseñador Visual del protocolos y el usuario decide abandonar el Diseñador sin guardar los cambios, se le deberá mostrar un mensaje de confirmación preguntando si desea guardar los cambios o abandonar el diseñador. Si el usuario decide abandonar el diseñador sin guardar los cambios, se deberá mostrar un mensaje de confirmación preguntando si desea guardar los cambios o abandonar el diseñador.