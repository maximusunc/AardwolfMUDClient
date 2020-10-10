// blessed is for all the gui
const blessed = require('blessed');

const history = [];
let historyInd = 0;

class BlessedGui {
  constructor(tsock) {
    // how we send messages back
    this.tsock = tsock;
    this.msg = '';
    // Initialize a blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      cursor: {
        blink: true,
        shape: 'block',
      },
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

    this.screen.title = 'Aardwolf!';
    this.input.readInput(() => {});
    this.screen.render();

    this.input.key('enter', () => {
      this.msg = this.input.value;
      if (this.msg) {
        historyInd = history.push(this.msg);
      }
      // this.tsock.write(this.msg);
      this.screen.render();
      this.msg = '';
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
    this.input.key('enter', () => {
      this.input.clearValue();
      this.input.readInput(() => {});
    })
    this.screen.key('C-c', () => {
      this.tsock.write('quit');
      this.screen.render();
    });
    this.tsock.write('quit');
    this.output.log(tsock);
    this.screen.render();
  }

  ingest(message) {
    const lines = message.split('\rfds');
    lines.forEach((line) => {
      const map = RegExp(/[a-zA-Z0-9]+/g);

      // if (RegExp("(?P<prefix>[\[A-Za-z: ]*)(?P<hp>[0-9]+)/(?P<totalhp>[0-9]+)hp (?P<mn>[0-9]+)/(?P<totalmn>[0-9]+)mn (?P<mv>[0-9]+)/(?P<totalmv>[0-9]+)mv( [0-9]+qt)? (?P<tnl>[0-9]+)tnl").test(message)) {
      //   this.output.pushLine('we have player stats');
      // }
      if (!map.test(message)) {
        this.map.setContent(message);
      } else {
        this.output.log(message);
      }
    });
    this.screen.render();
  }
}

module.exports = BlessedGui;
