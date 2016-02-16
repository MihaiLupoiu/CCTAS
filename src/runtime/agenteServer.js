var fs = require('fs');

var configuration=require('./RTConfig.json','utf8');
var service=require('./service.json','utf8');

//console.log(configuration);
//console.log("=======================");
//console.log(service);
var INSTANCE_NUMBER = 2; //variable de entorno
var RUNTIME_PORT = 8080; //variable de entorno

var startPortNumber = 2000; //Variable de entorno


var CONECTED = {};


function checkParametersRecibed(recived){

  var parsheRecived=recived.split(",");

  var containerID;
  var inputs;
  var output;

  for(i in parsheRecived){
    localRecuved = parsheRecived[i].split("=>");

    switch (localRecuved[0]) {
      case "containerID":
          containerID=localRecuved[1];
          console.log("Recived containerID: "+ localRecuved[1]);
          break;
      case "inputs":
          console.log("Recived inputs: "+ localRecuved[1]);
          var inputs = JSON.parse(localRecuved[1]); 
          console.log(inputs);
          break;
      case "output":
          console.log("Recived output: "+ localRecuved[1]);
          var output = JSON.parse(localRecuved[1]); 
          console.log(output);
          break;
      default :
          console.log("=======================");
          console.log("No entiendo: "+recived);
          console.log("=======================");
    }
  }

  console.log(containerID+"====="+inputs+"====="+output);
  




  var container = containerID.split("-");
  container = container[0];


  /*
  
  if(typeof CONECTED[container] === 'undefined' ){
    CONECTED[container] = [];
  }
  CONECTED[container].push(containerID);

  */
       //client: { id2: 'IP2.1:port', ip1: 'client-0-NetworkID:2000' } },

  if(typeof configuration.componentsIPs[container] === 'undefined' ){
    console.log("INDEFINIDO!!!");
    configuration.componentsIPs[container] = {}
  }
  
  for(input in inputs){
    configuration.componentsIPs[container][input]=containerID+":"+startPortNumber;
    startPortNumber++;
  }


  console.log(configuration);
  responder.send( JSON.stringify(configuration.componentsIPs[container]) );
/*
  var checkallInstances = function (){
    if(instances != INSTANCE_NUMBER){
      console.log(instances+" of "+INSTANCE_NUMBER);
      setTimeout( checkAllInstances, 1000);
    }else{
      sendInfo();  
    }
  }
*/
/*
  for(i in service.graph){
    if(service.graph[i].source.component === container){
      console.log(container+" tiene que hacer bind!!! y recibe conexión de "+CONECTED[service.graph[i].target.component]+":"+startPortNumber+" en el socker "+service.graph[i].source.endpoint);
      // send info
      responder.send("type=>bind,port=>"+startPortNumber+",sock=>"+service.graph[i].source.endpoint);
    }
    if(service.graph[i].target.component === container){
      console.log(container+" tiene que hacer connet!!! con "+CONECTED[service.graph[i].target.component]+":"+startPortNumber+" en el socket "+service.graph[i].target.endpoint);
      // send info
       responder.send("type=>connet,ip=>"+CONECTED[service.graph[i].target.component]+",port=>"+startPortNumber+",sock=>"+service.graph[i].target.endpoint);

    }
  }
  startPortNumber++;

*/
}



/*function sendInfo(){

}*/

var zmq = require('zmq');

// socket to talk to clients
var responder = zmq.socket('rep');

var instances = 0;

responder.on('message', function(request) {
  
  var recived = request.toString();

  //console.log("Received request: [", recived, "]");
  
  // do some 'work'
  checkParametersRecibed(recived);

});

responder.bind('tcp://*:'+configuration.params.port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening on "+configuration.params.port+" ...");
  }
});

process.on('SIGINT', function() {
  responder.close();
});