var Docker = require('dockerode');

var docker = new Docker();

// mostrar información
function handler(err, stream) {
    console.log(err);
    console.log(stream);
}


// listar contenedores que contiene docker.
docker.listContainers({all: true}, function(err, containers) {
  //console.log('ALL: ' + containers.length);
  //print containers info.
  console.log(containers);
  console.log(containers[0].Id);
  console.log(containers[0].Names);
});

docker.listContainers({all: false}, function(err, containers) {
  //console.log('!ALL: ' + containers.length);
});

// info sistem
//docker.info(handler);

//var image = docker.getImage("ubuntu");

// inspect image
//image.inspect(handler);

/* // listo options
image.inspect(function(err, image){
	console.log(image.Id);

});
*/


// get image
//var image = docker.getImage("node");
//image.get(handler);


//list images
docker.listImages(handler);

// pull image
/*






var repoTag="node:latest"

function locateImage(image, callback){

	docker.listImages(function(err,list){
		if(err) return callback(err);

		// search the image in the RepoTags
		var image;
		for (var i =0, len = len = list.length; i < len; i++) {
			if(list[i].RepoTags.indexOf(repoTag) !== -1){
				// ah ha!! repo tags
				return callback(null, docker.getImage(list[i].Id));
			}
		};
		return callback();
	});
}

function handler() {
	locateImage(repoTag, function(err, image) {
		if (err) return done(err);
		console.length(image);
	});
}

docker.pull(repoTag, function(err, stream){
	if (err) return err;
	stream.pipe(process.stdout);
	stream.once('end',handler);
});





*/





// pull image folow progress
/*
docker.pull(repoTag, function(err, stream) {
	if (err) return err;
	docker.modem.followProgress(stream, onFinished, onProgress);

	function onFinished(err, output) {
	  	//ouput is an array of objects, already json parsed.
	  	if (err) return err;
	  	console.log(output);
	}

	function onProgress(event) {
		console.log(event);
	}
});
*/
