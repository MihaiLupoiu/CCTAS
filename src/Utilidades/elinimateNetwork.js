var ServicesRuning_DB = require('../DB/ServicesRuning.json');
var docker = require('../Clases/spec_helper').docker;
var fs = require('fs');
var util = require('util');
var containersHelp = require ('./stopAllContainers.js');

containersHelp.stopAndEliminateContainers();

function handler(err, data) {

	for(var i = 0; i<data.length; i++){
	
		if(data[i].Name in ServicesRuning_DB){
			var network = docker.getNetwork(data[i].Id);
			console.log(network);
			network.remove(function(err, result) {
				if (err) console.log(err);
				console.log("Elininada la red: "+data[i].Name);

				// mejorar esta parte para que se elimine de la base de datos despues
				//delete ServicesRuning_DB[data[i].Name];
				//console.log(ServicesRuning_DB);
			});
		}
	}
}

docker.listNetworks({}, handler);
//Poner la base de datos a 0
setTimeout(function() {
  	ServicesRuning_DB={};
  	fs.writeFileSync('../DB/ServicesRuning.json', JSON.stringify(ServicesRuning_DB) , 'utf-8');
}, 2000);