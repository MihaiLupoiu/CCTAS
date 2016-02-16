// Hello World client
// Connects REQ socket to tcp://localhost:8080
// Sends "Hello" to server.

var ep1=function(){
var zmq = require('zmq');

// socket to talk to server
console.log("Connecting to hello world server");
var requester = zmq.socket('req');

var componentName="localhost"
requester.connect("tcp://"+componentName+":5555")
return requester

}

exports.ep1=ep1