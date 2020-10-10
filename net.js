const net = require('net');
const { TelnetSocket } = require('telnet-stream');

const socket = net.createConnection(23, '23.111.136.202');

const tsock = new TelnetSocket(socket);

let password = false;
let pswd = '';

tsock.on('close', () => {
  return process.exit();
});

var BACKSPACE = String.fromCharCode(127);

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

tsock.on('data', (chunk) => {
  const out = chunk.toString('utf8');
  password = false;
  if (out.includes('Password: ')) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    password = true;
  }
  return process.stdout.write(out);
});

process.stdin.on('data', (buffer) => {
  if (password) {
    getPassword(buffer);
  }
  return tsock.write(buffer.toString('utf8'));
});
