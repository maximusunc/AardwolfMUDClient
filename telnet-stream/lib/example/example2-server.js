// Generated by CoffeeScript 2.0.2
(function() {
  // example2-server.coffee
  // Just an example for README.md
  //----------------------------------------------------------------------

  // Negotiate About Window Size -- See RFC 1073
  var NAWS, TelnetSocket, net, server;

  NAWS = 31;

  // get references to the required stuff
  net = require("net");

  ({TelnetSocket} = require("../telnetStream"));

  // create a service to listen for incoming connections
  server = net.createServer(function(socket) {
    var tSocket;
    // wrap the socket as a TelnetSocket
    tSocket = new TelnetSocket(socket);
    // if we get any data, display it to the console
    tSocket.on("data", function(buffer) {
      return process.stdout.write(buffer.toString("utf8"));
    });
    // if they send us a subnegotiation
    tSocket.on("sub", function(option, buffer) {
      var height, width;
      // if they are telling us their window size
      if (option === NAWS) {
        // display it to the console
        width = buffer.readInt16BE(0);
        height = buffer.readInt16BE(2);
        return process.stdout.write(`Client window: ${width}x${height}\n`);
      }
    });
    // tell the client to send window size subnegotiations
    return tSocket.writeDo(NAWS);
  });

  // start our server listening on port 3000
  server.listen(3000);

  //----------------------------------------------------------------------------
// end of example2-server.coffee

}).call(this);
