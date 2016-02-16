// Hello World client
// Connects REQ socket to tcp://localhost:8080
// Sends "Hello" to server.

var zmq = require('zmq');
var ep1=require('./agentePrueba.js')
var requester=ep1.ep1()

// socket to talk to server
console.log("Connecting to hello world server");

var x = 0;
requester.on("message", function(reply) {
  console.log("Received reply", x, ": [", reply.toString(), ']');
  x += 1;
  if (x === 10) {
    requester.close();
    process.exit(0);
  }
});

	
for (var i = 0; i < 10; i++) {
	console.log("Sending request", i, '...');
	requester.send("Hello Server");
}

process.on('SIGINT', function() {
	requester.close();
});



