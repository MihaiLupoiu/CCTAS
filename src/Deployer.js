var util = require('util');

//Open targz to untar. //npm install tar.gz
var fs = require('fs');
var targz = require('tar.gz');
var tar = require('tar-fs');
// El tar.gz que se añada tiene que tener el service.json y los componentes.
// Sin ningúna carpeta raiz antes.


// Bases de datos a comprobar de service y component
var ServiceURI_DB = check_DB('./DB/ServiceURI.json');
var ComponentURI_DB = check_DB('./DB/ComponentURI.json');
var ServicesRuning_DB = check_DB('./DB/ServicesRuning.json');

//Comprueba la existencia de los ficheros de la base de datos.
//Si no existen los crea.
function check_DB(fileToRead){

	var dir = "./DB";

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir,0744);
	}

	if (!fs.existsSync(fileToRead)) {
		console.log("CreandoBase de datos.");
		var dataBase = {};
		fs.writeFileSync(fileToRead, JSON.stringify(dataBase) , 'utf-8');
	}
	return require(fileToRead);
}

// Open Docker //npm install dockerode docker-modem
// Para conectar con Docker
var docker = require('./Clases/spec_helper').docker;

// Json del deployer
var deployment = require('./Deployer.json');
//console.log(deployment);

// Servicio qus se va a lanzar
var service;
// Nombre el el servicio tiene
var ServiceIDName;


//////////////////////////////
//////////// Main ////////////
//////////////////////////////
check_service_uri();
//////////////////////////////



// Comprueba el URI del servicio si ya existe en la base de datos.
// Si existe se lee directamente desde donde está almacenado.
// Si no existe, de entiende que se ha adjuntado un tar.gz 
// 		en la misma carpeta que el ejecutable del deployer.
//		El ejecutable extrae los datos y los almacena y
//		Se añade a la base de datos de servicios su URI:pathLocal.
// Si el serviceURL es una dirección web, dará un error.
function check_service_uri(){

	if(deployment.ServiceURI in ServiceURI_DB){
		console.log("Service in Data Base.");

		// Lee el json del servicio
		read_Service_Json();

	}else{ // Guarda la dirección del servicio en la base de datos 
		   // Despliega el service.tar.gz en la carpeta ./Files.
		   // y luego lee el servicio.
		console.log("Service not in Data Base.");
		var pathLocal = deployment.ServiceURI
		pathLocal = pathLocal.replace(':/','');
		
		ServiceURI_DB[deployment.ServiceURI]='./Files/'+pathLocal;
		var substring = "http";
		if(deployment.serviceURL.indexOf(substring) <= -1){
			console.log("Extracting service.tar.gz");
			targz().extract(deployment.serviceURL, ServiceURI_DB[deployment.ServiceURI], function(err){
				if(err)
					console.log('Something is wrong ', err.stack);

				setTimeout(function() {
				  	console.log('File extracted.');
				
					fs.writeFileSync('./DB/ServiceURI.json', JSON.stringify(ServiceURI_DB) , 'utf-8');
					
					//Lee el json del servicio
					read_Service_Json();
				}, 2000);

			});

		}else{
			console.log("Service URL is a web url, not a local URL");
			process.exit(1);
		}		
	}

}

// Lee el service.json y comprueba si hay errores los parametros de Deployer.json 
// con los de Service.json. Posteriormente se almacena el servicio si no existia
// o se añade en el caso contrario.
function read_Service_Json(){
	service = require(ServiceURI_DB[deployment.ServiceURI]+"/service.json");
	
	// Comprueba los parametros del deployer
	check_Deployer_Parametres();

	// Comprueba si existenlos componentes
	check_component_uri();

	//Comprueba si el servicio se ha ejecutado alguna vez.
	check_Service_Runing_DB(deployment.ServiceURI);

	//create_DockerFile();
	//create_image();
	
	//Crea la red con un nombre identificativo unico.
	create_network(ServiceIDName);
}

// Comprueba los parametros del deployer.json y del service.json son correctos.
// No tiene que haber parametros de más en el deployer.params y tampoco a null.
function check_Deployer_Parametres(){

	for(var i in deployment.configuration) {
		if(i in service.params){
			service.params[i]=deployment.configuration[i];		
			if(service.params[i] == null){
				console.log("Service parameter "+i+" is null!");
				process.exit(1);
			}		
		}else{
			console.log("Deployer parameter "+i+" dose not exist in Service!");
			process.exit(1);
		}
	}	
}

// Comprueba si la uri del componente existe en la base de datos
// Si no existe lo añade y especifica donde lo puede encontrar
function check_component_uri(){
	for(var i in service.components) {

		if(service.components[i].uri in ComponentURI_DB){
			console.log("Component in Data Base.");

		}else{
			console.log("Component not in Data Base.");
			var pathLocal = service.components[i].url
			pathLocal = pathLocal.replace(':/','');
			pathLocal = pathLocal.replace('./','/');

			console.log("Path to component: "+pathLocal);
			
			ComponentURI_DB[service.components[i].uri] = ServiceURI_DB[deployment.ServiceURI] + pathLocal;

			var util = require('util');
			fs.writeFileSync('./DB/ComponentURI.json', JSON.stringify(ComponentURI_DB) , 'utf-8');
		}}

}

// Comprueba si el servicio ya se ha ejecutado.
//		En caso negativo se le inicia con la uri del servicio y se le añade un 0.
// 		En caso afirmativo, se le incrementa un numero.
//		En ambos casos se guarda en la base de datos ServiceRuning.json
function check_Service_Runing_DB(serviceURI){

	ServiceIDName = serviceURI.replace(':/','');
	var arr = ServiceIDName.split("/");
	ServiceIDName = "";
	for(var i=0;i<arr.length;i++) {
    	ServiceIDName+=arr[i].replace('.','');
    	ServiceIDName=ServiceIDName.replace('.','');
	}

	var count = 0;
	var incremented = true;

	while(incremented){
		
		incremented = false;

		for(var i in ServicesRuning_DB) {
			if(i === ServiceIDName+count){
				count++;
				incremented = true;	
			}
		}
	}

	ServicesRuning_DB[ServiceIDName+count]=serviceURI;
	fs.writeFileSync('./DB/ServicesRuning.json', JSON.stringify(ServicesRuning_DB) , 'utf-8');
	ServiceIDName=ServiceIDName+count;
}

// Crea una red con el nombre del servicio.
// Luego crea las Imagenes necesarias
function create_network(networkName){

	var Network = {"Name": networkName};

	docker.createNetwork(Network, function (err, networkResult) {
		if(err)
			console.log("Creating Network Error: "+err);

		var networkID= networkResult.id;
		console.log("Network ID: "+networkID);

		for(var i in deployment.cardinality) {
			image(i,service.components[i].uri,networkName);
		}

	});
};

// Se comprueba si la imagen está ya creada.
//		Si está crea los componentes.
//		Si no está crea la imagen y luego los componentes.
function image(componentType, ComponentURI,networkName){

	console.log("Building Image fom: "+ComponentURI_DB[service.components[componentType].uri]);

	var imageName = ComponentURI.replace(':/','');
	var arr = imageName.split("/");
	imageName = "";
	for(var i=1;i<arr.length;i++) {
    	imageName+=arr[i];
	}

	console.log(imageName);


	function handler(err, data) {
		if(err)
			console.log("Error listing images: "+err);
		var found = false;
		for(var i in data){
			var imageNameStored = data[i].RepoTags[0];
			imageNameStored=imageNameStored.replace(':latest','');
			if(imageNameStored===imageName){
				found = true;
				console.log("Image alredy build: "+imageNameStored);
			}
		}
		if(!found){
			console.log("Image \""+imageName+"\" not found, building it.");
			//Creando imagen
			docker.buildImage(ComponentURI_DB[service.components[componentType].uri], 
				{t:imageName}, function(err, stream) {
				
				if(err){
					console.log("Error building image: "+err);
					return;
				}
				// Es necesario para saber cuando ha acabado y poder empezar a lanzar los contenedores.
				stream.pipe(process.stdout, {end: true});

				stream.on('end', function() {
					console.log("Finished building image "+imageName)
					//iniciar contenedor con imagen
					create_containers(componentType,deployment.cardinality[componentType],imageName,networkName);
				});
			});
		}else{
			//iniciar contenedor con imagen
			create_containers(componentType,deployment.cardinality[componentType],imageName,networkName);
		}
	}
    docker.listImages({all: 0}, handler);
}

function create_containers(componentType, instanceNumber, imageName,networkName){
	//Create containers

	console.log("Componen type: "+ componentType+ " Instance Number: "+instanceNumber+ " Image to use: "+imageName );

	for(var i = 0; i< instanceNumber; i++) {
		var containerName=componentType;
		runContenedor(imageName,containerName,i,networkName);
	}
}

//Ejecuta un contenedor con el nombre containerName-instanceNumber-networkName.
//De esa manera me aseguro que el nombre es único aúnque ejecute dos veces el mismo servicio.
//Se crea el contenedor con la imagen que se especifica y con ciertos parametros de configuración también.
function runContenedor(imageName,containerName,instanceNumber,networkName){
	//Se encarga de eliminar el contenedor una vez acabado su ejecución si puede.
	function handler(err, data, container) {
		if(err)
			console.log(err);

		//container is created and runing.

		//Cuando el contenedor termine la ejecución del código se eliminará.
		container.remove(function(err, data) {
			if(err){
				console.log("Error removing container: "+err);
			}else{
				console.log("Finished execution and deleted container "+containerName);
			}
		});

	}

	var componentName = containerName;
	containerName=containerName+"-"+instanceNumber+"-"+networkName;
	console.log(containerName);
	var options = {
		'Hostname':containerName,
		'name':containerName,
		'HostConfig':{
			'NetworkMode':networkName
		},
		"Env": [
           "NETWORK_ID="+networkName,
           "CONTAINER_NAME="+containerName,
           "RUNTIME_SERVER=dirección del runtime server para inyectar los sockets",
           "RUNTIME_PORT=puerto asignado"
   		]
   	}

	//Se tiene que confirmar que el puerto no se ha repetido.
	// Tengo que investigar porque no me hace el export del hostPort....
	if(service.entrypoint.component === componentName){
		var exposedPort;

		//Se comprueba la existencia de los parametros necesarios para hacer el export.
		if(typeof service.entrypoint.ExposedPortNumber !== 'undefined' && service.entrypoint.ExposedPortNumber &&
			typeof service.entrypoint.ExposedPortType !== 'undefined' && service.entrypoint.ExposedPortType
		 ){
			exposedPort = service.entrypoint.ExposedPortNumber+"/"+service.entrypoint.ExposedPortType;
			options["ExposedPorts".toString()]={};
			options.ExposedPorts[exposedPort]={};

			if(typeof service.entrypoint.HostPortNumber !== 'undefined' && service.entrypoint.HostPortNumber){
				options["PortBindings".toString()]={};
				options.PortBindings[exposedPort]=[];
				options.PortBindings[exposedPort][0]={}
				options.PortBindings[exposedPort][0]["HostPort".toString()]=service.entrypoint.HostPortNumber.toString();
			}
		}
		
/*		
		No importa como se realice la conexión.
		Si los parametros de PortBindings no se pasan a mano,
		en el docker son parametros invalidos. Creo que es problema de dockerode.

		options={
			'Hostname':containerName,
			'name':containerName,
			'HostConfig':{
				'NetworkMode':networkName
			},
			"Env": [
	           "NETWORK_ID="+networkName,
	           "CONTAINER_NAME="+containerName,
	           "RUNETIME_SERVER=dirección del runtime server para inyectar los sockets"
	   		],
       		"ExposedPorts":{
				exposedPort:{}
			},
			"PortBindings": { 
				exposedPort: [
				{
					"HostPort":service.entrypoint.HostPortNumber.toString()
				}]
			}
		};
*/
	}

	//En un principio se pensó utilizar el hash de la red, 
	// pero geenrava una rgumento erroneo, que me lleva a 
	// creer que el nombre o era demasiado grande o algún
	// caracter que no accepta como argumento(Por ejemplo 
	// no acepta como nombre mayusculas).
	var ee = docker.run(imageName,[], process.stdout, options, handler);
}

/*
Crear un dockerfile con las dependencias especificadas.
function create_DockerFile(){

	console.log("Creating DockerFile for Image.")

	var fichero="FROM ubuntu\n";
	fichero+="MAINTAINER DeployerGenerator Mihai Lupoiu\n";
	fichero+="RUN   apt-get update\n";
	fichero+="RUN   apt-get install -y curl\n";
	fichero+="RUN   curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -\n";
	fichero+="RUN   apt-get install -y nodejs\n";

	//console.log(deployment.dependency);

	for(var i in deployment.dependency) {
		if(i==="system"){
			//console.log(deployment.dependency[i].length);
			for(var j in deployment.dependency[i]) {
				fichero+="RUN   apt-get install -y "+deployment.dependency[i][j]+" \n"
			}
		}else{
			if(i==="npm"){
				//console.log(deployment.dependency[i].length);
				for(var j in deployment.dependency[i]) {
					fichero+="RUN   npm install "+deployment.dependency[i][j]+" \n"
				}
			}else{
				console.log("Deployer dependency "+i+" not valid! Only system and npm.");
				process.exit(1);
			}
		}
	}
	//console.log(fichero);	
	fs.writeFileSync('./Files/DockerFiles/Dockerfile',fichero, 'utf-8');

}
*/