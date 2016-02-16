var docker = require('./spec_helper').docker;

var ImageName = "patata";

var image;

function handler(err, stream) {
    console.log("error: "+err);
    stream.pipe(process.stdout, {
          end: true
        });

	stream.on('end', function() {
        console.log("Exito");
        image = docker.getImage(ImageName);
        });
	//console.log(stream);
}
var data = require('fs').createReadStream('./image.tar');

//imagen
docker.buildImage(data, {t: ImageName},handler);


//var image = docker.getImage(ImageName);
console.log(image);
/*
while (!image) {
	image = docker.getImage(ImageName);
}
console.log("Acabado!")
*/