var docker = require('./spec_helper').docker;

function handler(err, data) {
	console.log(err);
	console.log(data);
}

var idContainer;


docker.createContainer({
	Image: 'ubuntu',
	AttachStdin: false,
	AttachStdout: true,
	AttachStderr: true,
	Tty: true,
	Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
	OpenStdin: false,
	StdinOnce: false
	}, function(err, container) {
		if (err) console.log(err);
		idContainer = container.id;
		console.log(idContainer);
		// get container after create
		var container = docker.getContainer(idContainer);
		//inspect container
		container.inspect(
			function (err, data) {
				console.log(err);
				console.log(data.Name);
			}
		);

		//Elimina contenedor
		container.remove(handler);

	});





