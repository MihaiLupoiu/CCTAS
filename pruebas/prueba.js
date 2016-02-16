var docker = require('./../Clases/spec_helper').docker;

var testImage = 'ubuntu';

function handler(err, data, container) {
  if(err)
    console.log(err);
  
  //container is created
  //console.log(container);
/*
  container.remove(function(err, data) {
    if(err)
      console.log(err);
  });
*/
}

//var ee = docker.run(testImage,[ "env" ], process.stdout, 
  var ee = docker.run(testImage,[ "/bin/bash" ], process.stdout, 
      {name:"patata",
      "Env": [
           "NETWORK_ID=0376f0426000fe6041e5240302bf27b9d3fa6fa884c28332938e95d9aba48a62",
           "CONTAINER_NAME=patata-0-0376f0426000fe6041e5240302bf27b9d3fa6fa884c28332938e95d9aba48a62",
           "RUNETIME_SERVER=dirección del runtime server para inyectar los sockets"
      ],
      "ExposedPorts":{
        "22/tcp":{}
      },
      "PortBindings": { 
          "22/tcp": [
          {
           "HostPort": "11022" 
         }]
      } 
    }, handler);

  ee.on('container', function(container) {
    //console.log(container);
  });
  ee.on('stream', function(stream) {
    //console.log(stream);
  });
  ee.on('data', function(data) {
    console.log(data.StatusCode);
});