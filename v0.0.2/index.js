const net = require('net');
// telnet-stream basically strips out all the telnet config messages.
const { TelnetSocket } = require('telnet-stream');
const GUI = require('./gui');

// create the telnet connection
const socket = net.createConnection(23, '23.111.136.202');

// telnet wrapper
const tsock = new TelnetSocket(socket);
const gui = new GUI();

// exit the process when the telnet connection is closed
tsock.on('close', () => {
  return process.exit();
});

// listen to all incoming messages
tsock.on('data', (chunk) => {
  const msg = chunk.toString('utf8');

  // display the message from telnet
  gui.ingest(msg);
  // console.log(out.replace(/\r/g, '**newline**'));
});

process.stdin.on('data', (buf) => {
  return tsock.write(buf.toString('utf8'));
});
