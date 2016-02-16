var docker = require('./spec_helper').docker;

var ServerName = 'WebServer';
var idContainer;


function handler(err, data) {
	console.log(err);
	console.log(data);
}

function createCont(ServerName) {
	docker.createContainer({
		Image: 'node',
		AttachStdin: false,
		AttachStdout: true,
		AttachStderr: true,
		Tty: true,
		OpenStdin: false,
		StdinOnce: false,
		name:ServerName
		}, function(err, container) {
			if (err) console.log(err);
			idContainer = container.id;
			console.log(idContainer);
			return idContainer;
		}
	);
}

docker.listContainers({all: true}, function(err, containers) {
  	for(var i in containers) {
   		for(var j in containers[i].Names) {
			if( containers[i].Names[j] == ("\/"+ServerName) ){
				console.log("Container already running with the name" + ServerName);
				var idContainer= containers[i].Id;
			}
   		}
	}
	console.log(idContainer);
	if(! idContainer){
	    console.log("Vacio!!");
    	createCont(ServerName);
	};		

	var container = docker.getContainer(idContainer);

	container.start(function (err, data) {
  		console.log(err);
  		console.log(data);
	});

	container.inspect(function (err, data) {
		console.log(data);
	});

});


function handler(err, data, container) {
	expect(err).to.be.null;
	//container is created
	expect(container).to.be.ok;

	container.remove(function(err, data) {
		  expect(err).to.be.null;
	});
}