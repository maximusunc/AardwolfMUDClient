const net = require('telnet2');
// telnet-stream basically strips out all the telnet config messages.
// const { TelnetSocket } = require('telnet-stream');
// blessed is for all the gui
const blessed = require('neo-blessed');

const history = [];
let historyInd = 0;

// create the telnet connection
net.createServer((c) => {
  // Initialize a blessed screen
  const screen = blessed.screen({
    smartCSR: true,
    cursor: {
      blink: true,
      shape: 'block',
    },
    title: 'Aardwolf!',
  });

  const map = blessed.box({
    parent: screen,
    width: '25%',
    height: '50%',
    right: 25,
    top: 0,
    border: 'line',
    focusable: false,
    mouse: false,
  });
  const stats = null;
  const output = blessed.log({
    parent: screen,
    width: '50%',
    height: '100%-4',
    left: 0,
    top: 0,
    border: {
      type: 'line',
    },
    mouse: true,
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
      style: {
        bg: 'yellow',
      },
    },
    content: '',
  });
  const input = blessed.textbox({
    parent: screen,
    cursor: 'block',
    cursorBlink: true,
    width: '50%',
    height: 4,
    left: 0,
    bottom: 0,
    border: 'line',
    focused: true,
    inputOnFocus: true,
    scrollable: false,
    mouse: false,
  });

  // input.on('submit', (msg) => {
  //   // output.log(msg);
  //   if (msg) {
  //     historyInd = history.push(msg);
  //   }
  //   input.clearValue();
  //   input.readInput(() => {});
  //   screen.render();
  //   return tsock.write(msg);
  // });
  input.key('up', () => {
    // this will stop at 0 or null
    if (historyInd) {
      historyInd -= 1;
      input.setValue(history[historyInd]);
    }
    screen.render();
  });
  input.key('down', () => {
    // stop if we're at the end
    if (historyInd < history.length - 1) {
      historyInd += 1;
      input.setValue(history[historyInd]);
    } else {
      input.setValue('');
    }
    screen.render();
  });
  input.key('C-c', () => {
    tsock.write('quit');
    screen.render();
    process.exit();
  });

  function ingest(message) {
    const lines = message.split('\r\r');
    lines.forEach((line) => {
      const hasMap = RegExp(/[a-zA-Z0-9]+/g);

      // if (RegExp("(?P<prefix>[\[A-Za-z: ]*)(?P<hp>[0-9]+)/(?P<totalhp>[0-9]+)hp (?P<mn>[0-9]+)/(?P<totalmn>[0-9]+)mn (?P<mv>[0-9]+)/(?P<totalmv>[0-9]+)mv( [0-9]+qt)? (?P<tnl>[0-9]+)tnl").test(message)) {
      //   output.pushLine('we have player stats');
      // }
      if (!hasMap.test(line)) {
        map.setContent(line);
      } else {
        output.log(line);
      }
    });
    screen.render();
  }

  // exit the process when the telnet connection is closed
  c.on('close', () => {
    return process.exit();
  });

  // listen to all incoming messages
  c.on('data', (chunk) => {
    const msg = chunk.toString('utf8');
    if (msg.includes('Password: ')) {
      input.censor = true;
      screen.render();
    } else {
      input.censor = false;
    }
    // display the message from telnet
    ingest(msg);
    // console.log(out.replace(/\r/g, '**newline**'));
  });

  input.readInput(() => {});
  screen.render();
}).listen(23, '23.111.136.202');
