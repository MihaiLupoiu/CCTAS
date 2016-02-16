var docker = require('../Clases/spec_helper').docker;

var exports = module.exports = {};

exports.stopAndEliminateContainers = function(){
	docker.listContainers({all: true}, function(err, containers) {
		console.log('ALL: ' + containers.length);

		function handler(err, data, container) {
			if(err){}
				console.log("Error stoping container:"+err);

			console.log("Container Stopped:"+err);

		}

		for(i in containers){
			var container = docker.getContainer(containers[i].Id);

			container.stop(handler);
			container.remove(function(err, data) {
				if(err){
					console.log("Error removing container: "+err);
				}else{
					console.log("Finished execution and deleted container!");
				}
			});
		}
	});
}

