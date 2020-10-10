const net = require('net');
// telnet-stream basically strips out all the telnet config messages.
const { TelnetSocket } = require('telnet-stream');
const BlessedGUI = require('./gui');

// create the telnet connection
const socket = net.createConnection(23, '23.111.136.202');

// telnet wrapper
const tsock = new TelnetSocket(socket);

let password = false;
let pswd = '';
let loggedIn = false;
let GUI;

// exit the process when the telnet connection is closed
tsock.on('close', () => {
  return process.exit();
});

var BACKSPACE = String.fromCharCode(127);

// replace all password chars with *
function getPassword(ch) {
  ch = ch.toString('utf8');

  switch (ch) {
    case "\n":
    case "\r":
    case "\u0004":
      // They've finished typing their password
      process.stdout.write('\n');
      process.stdin.setRawMode(false);
      process.stdin.resume();
      return tsock.write(pswd);
    case "\u0003":
      // Ctrl-C
      return process.exit();
      break;
    case BACKSPACE:
      // rewrite the line but take off the last character
      pswd = pswd.slice(0, pswd.length - 1);
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write('Password: ');
      process.stdout.write(pswd.split('').map(function () {
        return '*';
      }).join(''));
      break;
    default:
      // More passsword characters
      process.stdout.write('*');
      pswd += ch;
      break;
  }
}

// listen to all incoming messages
tsock.on('data', (chunk) => {
  const out = chunk.toString('utf8');
  // if logged in, forward to the GUI
  if (loggedIn) {
    return GUI.ingest(out);
  }
  password = false;
  if (out.includes('Password: ')) {
    // we want to call password on all new keypresses
    // https://stackoverflow.com/a/12506613/8250415
    process.stdin.setRawMode(true);
    process.stdin.resume();
    password = true;
  }
  // we want to go into GUI mode
  if (out.includes('Last on from')) {
    loggedIn = true;
    GUI = new BlessedGUI(tsock);
    return GUI.ingest(out);
  }
  if (out.includes('Reconnecting')) {
    loggedIn = true;
    GUI = new BlessedGUI(tsock);
    return GUI.ingest(out);
  }
  // console.log(out.replace(/\r/g, '**newline**'));
  // display the message from telnet
  return process.stdout.write(out);
});

process.stdin.on('data', (buffer) => {
  if (password) {
    // hide characters of password
    getPassword(buffer);
  }
  if (!loggedIn) {
    // write message back to telnet
    return tsock.write(buffer.toString('utf8'));
  }
  // return tsock.write(buffer.toString('utf8'));
});
