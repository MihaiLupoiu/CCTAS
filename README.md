Cloud Computing: Tecnologías y Arquitectura de Servicios (Cctas)
===================
Master's Degree in Parallel and Distributed Computing at Valencia (UPV)

El propósito de la asignatura es la introducción al Cloud Computing, presentando las problemáticas que plantea y las aproximaciones existentes hoy en día. 
El planteamiento irá enfocado al análisis de los problemas concretos a resolver, y la aplicación práctica de este análisis, mediante la realización de un diseño de alto nivel y la implementación de un proyecto. 

El alumno que curse la asignatura entenderá las problemáticas tras los sistemas Cloud, las aproximaciones adoptadas hoy en día, y estará preparado para un estudio en más profundidad dentro de las otras asignaturas del máster. 

Learning Units:
-------------
> - Introduction to Cloud Computing
 - Introduction and course objectives
 - Distributed systems. Applications vs Services
 - Economics of cloud services
 - Other topics: Legacy, Private Cloud, Hybrid Cloud ...
 - Service models: IaaS, PaaS, SaaS
> - Fundamental problems
 - Reliability
 - Scalability
 - Consistency state
 - Security
 - QoS and SLA
 - Management: Deployment and Maintenance
> - Interaction Models
 - SOA
 - Message queues
 - Asynchronous events: Observable and Promises
> - Project: Implementation of SaaS with shared state
 - Problem definition and requirements
 - Introduction of technologies to be used
 - Structure of a solution
 
# Proyecto Desplegador Docker para la asignatura de Cloud Computing Tecnologías Y Arquitecturas de Servicios.

Este proyecto consiste en crear un desplegador para docker.

Dentro del proyecto están las siguientes carpetas:
	- Pruebas: hay varios ficheros con pruebas realizadas tanto para docker como para 0MQ.
	- Tarea:se encuentra la tarea a entregar durante el curso.
	- src: está todo el código del desplegados.

En la práctica, la única carpeta útil es la de src.

Dentro de la carpeta src están las siguiente carpetas:
	- Capturas: contiene capturas de imagen del servicio en marcha.
	- Clases: contiene el código de ayuda para el proyecto.
		- download.js: código para intentar descargar ficheros desde la red.
		- spec_helper.js: fichero de ayuda para conectar con Docker.

	- DB: contiene los ficheros necesarios para una pequeña base de datos.
		- ComponentURI.json: es una base de datos que tiene la dirección de todos los 
			tar de los componentes conocidos.{componentURI:path}
		- ServicesRuning.json: es una base de datos que tiene el nombre de todos los
			servicios lanzados con un identificador único y su uri.{key:serviceURI}
		- ServiceURI.json: es una base de datos de servicios. En ella se almacena el
			URI del servicio y el lugar donde se puede encontrar los ficheros necesarios
			para su ejecución.{serviceURI:path}

	##########################################################################################
	Como comentario cabe destacar que si esta carpeta y ficheros no existen, el código los
	creará por defecto.
	##########################################################################################

	- Carpeta Files: es la carpeta donde se desplegarán todos los ficheros necesarios del 
		service.son. Internamente se creará una jerarquía de carpetas.
		Por ejemplo: si vamos a lanzar el servicio: service://lupoiu.com/service/0.0.1  
		se va a generar la siguiente carpeta ./Files/service/lupoiu.com/service/0.0.1

		- DockerFiles: es un carpeta donde se pretende crear el Dockerfile para el servidor
			de RunTime.

	- RunTime: es donde se encuentra la programación del RunTime.
		Es donde se ha empezado la programación de un serverRunTime y un runTimeAgent.
		Esta programación no se ha acabado pero si se han realizado pruebas de inyectar
		sockets y recibir información al servidor de los agentes. No se ha podido acabar
		por falta de tiempo. A continuación se explicará en mejoras que se pretendía hacer.

	- Utilidades: es una carpeta de utilidades que se ha ido creado a medida que han surgido 
		problemas.
		- eliminateNetwork.js: es la utilizad más importante. Para todos los componentes 
			arrancados, los elimina y posteriormente elimina la red.
		- stopAllContainers.js: se utiliza dentro de eliminateNetwork.js, y sirve para
			parar e eliminar los contenedores.
	- Deployer.js: es el programa principal para el desplegado.
	- Deployer.json: es el metadata del service.tar.gz que se va a desplegar.
	- service.tar.gz: es el servicio que se quiere desplegar. De momento hace falta que esté en
		la misma carpeta que el Deployer.js

Formato de los JSONs:
Deployer.json:
{
	"ServiceURI":"service://lupoiu.com/service/0.0.1", //URI del servicio
	"serviceURL" : "./service.tar.gz", //Dirección de donde se encuentra localmente el service.
	"cardinality" : { //Número de instancias de cada servicio
		"server" : 1,
		"client" : 2	
	},
	"configuration":{
		"port" : 8000, //Puerto para hacer la conexión entre server/client
				//Lo que que pretende es que ese valor se cambie para que sea 
				//Por donde se va a realizar el exposed.
		"param2" : "valor" //Varios parámetros más que puedan surgir en el futuro y sean necesarios
	},
	"dependency":{ // Instalar dependencias en el sistema.
		"system" : ["build-essential","libzmq-dev","python"], //apt-get install -y nombre
		"npm" : ["zmq"] // npm install nombre
	} //Este apartado no está implementado aún. Se comentará en el apartado de mejoras.
}

service.json:
{
    "uri":"service://lupoiu.com/service/0.0.1", //URI del servicio.
    "components":{ // Componentes que se van a utilizar.
        "server":{ 
            "uri": "component://lupou.com/component/server/0.0.1", URI del componente.
            "url": "./component/server/component.tar.gz" //Donde path local del componente.
            },
     "client":{ 
        "uri": "component://lupou.com/component/client/0.0.1",
        "url": "./component/client/component.tar.gz" } 
    },
    "graph" : [ //Grafo de dependencias entre los componentes.
        {
            "source":{ // es el componente que hará el bind
                "component":"server", //nombre del componente.
                "endpoint":"ip1" //nombre del socket.
            },
            "target":{ // componente que hará el connect.
                "component":"client", // nombre del componente.
                "endpoint":"ep1" // nombre del socket.
            },
            "channel":"Point-to-Point" // Tipo de conexión
        } //Este apartado se comentará también en el apartado de mejoras.
    ],
    "entrypoint":{ //Si se desea hacer exposed de alguna máquina se tiene que indicar
        "component":"server", //componente que realizará el exposed
        "endpoint":"extraCom", // por donde se realizará el exposed
        "ExposedPortNumber":5555, // puerto del componente de exposed
        "ExposedPortType":"tcp", // tipo de conexión tcp/udp
        "HostPortNumber":3333 // puerto del host por donde se realizará el exposed
    },
    "params" : {
        "port" : 8080, // parámetros de conexión del cliente servidor.
        "param2" : "value 2" // otros posibles parámetros necesarios.
    }
}

Server component.json:
{
	"uri":"component://lupoiu.com/component/server/0.0.1", //URI del componente.
	"channels": {
        "inputs":{ // canales de entrada por el bind
            "ip1":"routing" //socket:tipo
        },
        "output":{ // canales de salida por el connect
            "ep1":"routing" // socket tipo
        }
    },
    "params": {
        "port" : 8080, // puerto de conexión por donde se realizará en este caso bind.
        "p2" : null,
        "p3" : null
    },
    "entrypoint”:”./run.js" //ejecutable que se tiene que arrancar. // se explicará en el apartado
									// de mejoras.
}

Client component.json:
{
	"uri":"component://lupoiu.com/component/client/0.0.1",
	"channels": {
        "inputs":{
            "ip1":"routing"
        },
        "output":{
            "ep1":"routing"
        }
    },
    "params": {
        "connect" : "server-0", //la única diferencia en este caso es que el cliente tiene que
				// saber a quien va a conectarse.
        "port" : 8080,
        "p3" : null
    },
    "entrypoint”:”./run.js"
}

Funcionamiento del programa:

	En el primer paso se va a comprobar si existe la carpeta DB y los ficheros:
		./DB/ServiceURI.json
		./DB/ComponentURI.json
		./DB/ServicesRuning.json
	Si existen, simplemente los abre, sino los crea en un formato JSON vacío.

	El segundo paso consiste en leer el deployer.json. Por el momento el programa no puede
 			descargar el tar.gz desde serviceURL. Tampoco se pueden instalar las dependencias
 			en los dockerfiles. (Tareas pendientes que se explicarán en mejoras).

	Una vez leído el Deployer.json, se comprueba si se ha ejecutado alguna vez el servicio 
		mediante el URI del servicio.

		Si se ha ejecutado alguna vez y está en la base de datos se utilizará el servicio
 			que hay en la base de datos.
		
		Sino, se entiende que se ha adjuntado un tar.gz en la misma carpeta que el
 			ejecutable del deployer. Se extraen todos los ficheros y se almacenan en ./Files.
 			Luego se añade a la base de datos de servicios su URI:pathLocal.
		Detecta si el serviceURL es una dirección web y dará un error.

	El tercer paso es leer el service.son y  comprobar si los parámetros del Deployer.json son
 			correctos. Eso implica que no tiene que tener parámetros de más y  tampoco
 		parámetros a null.

	El cuarto paso es comprobar el URI de los componentes al igual que en service. Si los
 			componentes están en la base de datos utiliza los que tiene almacenados, sino 
		los coge el service.tar.gz y los almacena en ./Files.

	El quinto paso es comprobar si el servicio se ha ejecutado alguna vez. Si no se ha 
		ejecutado nunca, se coge el uri del servicio y se le añade un 0.
		Si se ha iniciado alguna vez el servicio, se le incrementa un número y en ambos
 			casos se guarda en la base de datos ServiceRuning.json

	El sexto paso es crear la red con el nombre de almacenado en el ServiceRuning.json.
	
	El séptimo consiste en crear las imágenes a partir de los componente.tar.gz. Primero se
		comprueba la existencia de la image. Si no existe se crea, en cambio si existe
 			simplemente se utiliza. 

	El octavo paso crea los componentes dependiendo de la dependency que tiene y posteriormente
 		los ejecuta. Dependiendo del tipo de componente, se iniciará con una
 		configuración determinada.
		En este caso si es front end se le realiza un export. En caso contrario no.
	Ejemplo de configuración para el server:
{name:”server-0-”,
      "Env": [
           "NETWORK_ID”=“servicelupoiucomservice0010", //identificador de la red local
           "CONTAINER_NAME”=“server-0-servicelupoiucomservice0010", //nombre del contenedor
           "RUNTIME_SERVER=“runTimeServer-servicelupoiucomservice0010”, //dirección del servidor
	   "RUNTIME_PORT=“4444” //puerto por donde se tiene que conectar.
	
      ],
      "ExposedPorts":{ // exposed del puerto 22 por tcp
        "22/tcp":{}
      },
      "PortBindings": { 
          "22/tcp": [
          {
           "HostPort": "11022" // se realiza por el puerto del host 11022.|| 0.0.0.0:11022->22/tcp
         }]
      } 
    }

	##########################################################################################
	Todo lo que se ha mencionado hasta este punto es funcional.
	A partir de este punto es implementación que hay pendiente de acabar.
	##########################################################################################

Mejoras:
	
	La Comunicación:

	Una vez creada la red se creará un servidor denominado : runtime-networkID. Este servidor
 			se encargará de analizar el grado de dependencias y especificar a cada componente
 			como tiene que realizar la conexión.

	Por ejemplo:
	En la red: servicelupoiucomservice0010
	Están los componentes:
	
	runtimeserver-servicelupoiucomservice0010
	
	server-0-servicelupoiucomservice0010
	client-0-servicelupoiucomservice0010
	client-1-servicelupoiucomservice0010
	
	Server y clientes internamente tienen dos variables de entorno:
		-"RUNTIME_SERVER=“runtimeserver-servicelupoiucomservice0010”
		-"RUNTIME_PORT=“4444”
	Los contenedores, una vez iniciados, se conectarán al servidor mediante RUNTIME_SERVER:RUNTIME_PORT.
	Runtimeserver les indicará si tienen que conectarse o tienen que hacer bind, con quien y
 		que puerto tiene que conectarse o simplemente el puerto si solo tiene que hacer
		bind.
	Runtimeserver recibirá los inputs del componente y este le responderá con el puerto donde 
		tiene que hacer el bind. Además el runtimeserver se guarda esa configuración para
		indicarla a los componentes que se quieran conectar.
		Luego runtimeserver recibirá los outpus del componente y si los tiene disponibles
		le pasará una lista con la dirección:puerto donde tiene que hacer el connect.
		Si no los tiene esperará un tiempo y volverá a realizar la petición.
		

	Posteriormente los clientes realizarán las operaciones respectivas de bind o connect.


	RuntimeAgent:
	
	Dentro de los componentes en lugar de especificar la comunicación internamente se utilizará
	un runtimeagent que se conectará con el servidor y resolverá las conexiones.
	El código del cliente solo tendrá que tener lo siguiente:
	var connexion=requiere(‘runtime-agent’);

	connexion.start();

	connexion.send(message);
	message= connexion.recive();
	



	La instalación de dependencias:

	En lugar de utilizar un tar.gz directamente con el Dockerfile, el código necesario y el
 		json, se va a utilizar solo un tar con el código necesario y el json. El Dockerfile se
 		generará solo y se creara un tar para su posterior uso.
	
	Esto se realizará antes de crear la imagen para los componentes.
	

Tareas(D: done, P: pending):

D - Crear un deployer.json
D - Crear un service.json 
D - Crear un component.json
D - Crear un codigo Servidor
D - Crear un component.json
D - Crear un codigo Servidor.json de prueba con 0MQ
D - Crear un codigo Client.json de prueba con 0MQ
D - Crear un Dockerfile con los ficheros de Servidor.js/CLiente.js para distintos contenedores
D - Comprimir los ficheros en un tar.gz y lanzar 2 contenedores. Comprobar que funciona desde
	consola.
D - Crear una red desde consola para los contenedores.
D - Leer el deployer.json en node.
D - Comprimir los ficheros service.json, component.json, server.json, client.json, Dockerfile en un
 	solo fichero comprimido service.tar.gz.
D - Descomprimir desde node ese tar.gz.
D - Leer la URI del servicio y hacer una base de datos de si se ha utilizado alguna vez y almacenar
 	los ficheros en un lugar aparte.
D - Crear una base de datos de si se ha ejecutado alguna vez el servicio para guarlarla con un
 	identificador. Esto ayudará para la creación de la red tenga un nombre diferente y aunque
	se ejecute varias veces el mismo servicio, lo hará en redes distintas. Eso hace un poco más
 	seguro su ejecucuón.
D - Leer los component URI para ver si también se disponene y se vuelven a ejecutar o se tienen que
 	descomprimir para su uso posterior. También se almacenará su ruta.
D - El fichero comprimido service.tar.gz siempre se tiene que ejecutar local. Esto se hace por
	falta de tiempo en crear un proceso que compruebe su dirección y se lo descague. Hay muchas
 	mejoras que se pueden aplicar. Se asume que en el fichero service.tar.gz se contiene toda
	la información necesaria y los ficheros de la metadata.
D - Crear la red desde dockerode y con un nombre identificativo.
D - Crear una imagen del componente si este no existe ya.
D - Creado un eliminador de redes desde dockerode para agilizar el borrado tras realizar las 	
	pruebas.
P - Crear un RuntimeServer conteiner donde el resto de contenedores se van a conectar para coger
	las conexiones que le coresponde. En este caso solo se va a centrar en la conexión de punto
 	a punto.
P — Una vez creada la conexión, se ejecutará el código del contenedor, pero dispondrá directamente
 	de la conexión hecha.
P - Instalar en los contenedores las dependencias.
