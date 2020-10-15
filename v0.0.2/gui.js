// blessed is for all the gui
const blessed = require('neo-blessed');

const history = [];
let historyInd = 0;

class GUI {
  constructor() {
    // Initialize a blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      cursor: {
        blink: true,
        shape: 'block',
      },
      title: 'Aardwolf!',
    });

    this.map = blessed.box({
      parent: this.screen,
      width: '25%',
      height: '50%',
      right: 25,
      top: 0,
      border: 'line',
      focusable: false,
      mouse: false,
    });
    this.stats = null;
    this.output = blessed.log({
      parent: this.screen,
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
    this.input = blessed.textbox({
      parent: this.screen,
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

    this.input.on('submit', (msg) => {
      // output.log(msg);
      if (msg) {
        historyInd = history.push(msg);
      }
      this.input.clearValue();
      this.input.readInput(() => {});
      this.screen.render();
    });
    this.input.key('up', () => {
      // this will stop at 0 or null
      if (historyInd) {
        historyInd -= 1;
        this.input.setValue(history[historyInd]);
      }
      this.screen.render();
    });
    this.input.key('down', () => {
      // stop if we're at the end
      if (historyInd < history.length - 1) {
        historyInd += 1;
        this.input.setValue(history[historyInd]);
      } else {
        this.input.setValue('');
      }
      this.screen.render();
    });
    this.input.key('C-c', () => {
      // tsock.write('quit');
      this.screen.render();
      process.exit();
    });

    this.input.readInput(() => {});
    this.screen.render();
  }

  ingest(message) {
    const lines = message.split('\r\r');
    lines.forEach((line) => {
      const hasMap = RegExp(/[a-zA-Z0-9]+/g);
  
      // if (RegExp("(?P<prefix>[\[A-Za-z: ]*)(?P<hp>[0-9]+)/(?P<totalhp>[0-9]+)hp (?P<mn>[0-9]+)/(?P<totalmn>[0-9]+)mn (?P<mv>[0-9]+)/(?P<totalmv>[0-9]+)mv( [0-9]+qt)? (?P<tnl>[0-9]+)tnl").test(message)) {
      //   output.pushLine('we have player stats');
      // }
      if (line.includes('Password: ')) {
        this.input.censor = true;
        this.screen.render();
      } else {
        this.input.censor = false;
      }
      if (!hasMap.test(line)) {
        this.map.setContent(line);
      } else {
        this.output.log(line);
      }
    });
    this.screen.render();
  }
}

module.exports = GUI;
