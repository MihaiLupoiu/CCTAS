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

function check_DB(fileToRead){

	var dir = "./DB";

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir,0744);
	}

	if (fs.existsSync(fileToRead)) {
    	console.log("Base de datos existe!!");
	}else{
		console.log("CreandoBase de datos.");
		var dataBase = {};
		fs.writeFileSync(fileToRead, JSON.stringify(dataBase) , 'utf-8');
	}
	return require(fileToRead);
}

console.log(ServiceURI_DB);
console.log(ComponentURI_DB);
console.log(ServicesRuning_DB);