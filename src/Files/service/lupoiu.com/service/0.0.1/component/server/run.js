var component=require('./component.json','utf8');

console.log(component);

var zmq = require('zmq');

// socket to talk to clients
var responder = zmq.socket('rep');

responder.on('message', function(request) {
  console.log("Received request: [", request.toString(), "]");

  // do some 'work'
  setTimeout(function() {

    // send reply back to client.
    responder.send("Hello from Server.");
  }, 1000);
});

responder.bind('tcp://*:'+component.params.port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Listening on "+component.params.port+"...");
  }
});

process.on('SIGINT', function() {
  responder.close();
});