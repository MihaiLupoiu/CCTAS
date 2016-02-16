var zmq = require('zmq');
var component=require('./component.json','utf8');

var RUNTIME_SERVER = "localhost";
var RUNTIME_PORT=8080;
var CONTAINER_NAME="client-0-NetworkID"
//console.log(process.env.RUNETIME_SERVER);


// socket to talk to server
console.log("Connecting to Run Time Server "+RUNTIME_SERVER+":"+RUNTIME_PORT+"...");
var requester = zmq.socket('req');



requester.on("message", function(reply) {
  console.log("Received reply", ": [", reply.toString(), ']');
  



});



requester.connect("tcp://"+RUNTIME_SERVER+":"+RUNTIME_PORT);


requester.send("containerID=>"+CONTAINER_NAME+",inputs=>"+JSON.stringify(component.channels.inputs) );

var type;


for( sock in component.channels.inputs){
	type =component.channels.inputs[sock];
	component.channels.inputs[sock] = zmq.socket(type);
}


//var responder = zmq.socket(component.inputs.); // rep cambiar al tipo de conexión

//requester.send("containerID=>"+CONTAINER_NAME+"output=>"+JSON.stringify(component.channels.output));	

  

process.on('SIGINT', function() {
  requester.close();
});