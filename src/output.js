import { writable } from 'svelte/store';
import { DefaultMap, strip_colors } from './util';
import { addItems, extractInvitem, extractInvmon, Item } from './inventory'
const AU = require('ansi_up');
const ansiup = new AU.default;

const { subscribe, set, update } = writable({
  log: [],
  map: '',
  qt: null,
  items: new DefaultMap(() => new Item()),
  containers: {},
});

/** Class for capturing tag-delimited reports. */
class Captor {
  /**
   * Create a captor.
   */
  constructor() {
    this.current = "";
    this.buffer = "";
    this.awaiting = new Set();
    this.handlers = {};
  }

  /**
   * Extract tag-delimited reports from a telnet message.
   * @param {*} self - the svelte state object
   * @param {string} msg - a telnet message
   */
  extractBetweenTags(self, msg) {
    // if the message has opening tag
    let precontent = "";
    let content = "";
    let postcontent = "";
    let containerid = "";
    let handler;

    if (this.current) {
      // console.log(`continuing to capture ${this.current}`);
      handler = this.handlers[this.current];
      content = msg;
    } else {
      let key;
      for ([key, handler] of Object.entries(this.handlers)) {
        // console.log(`checking for "${handler.openTag}"`);
        if (msg.match(handler.openTag)) {
          // grab everything after opening tag
          let bits = msg.split(handler.openTag);
          if (bits.length == 3) {
            [precontent, containerid, content] = bits;
          } else {
            [precontent, content] = bits;
          }
          containerid = containerid ? containerid : key;
          this.current = containerid;
          // console.log(`capturing ${this.current}`);
          break
        }
      }
    }
    if (!this.current) {
      return msg;
    }
    // console.log(`checking for "${handler.closeTag}"`);
    let finish = false;
    if (content.indexOf(handler.closeTag) > -1) {
      // grab everything before closing tag
      [content, postcontent] = content.split(handler.closeTag);
      finish = true;
    }
    // save buffer
    this.buffer = this.buffer + content;
    if (finish) {
      // fire callback
      handler.callback(self, this.buffer, this.current)
      // console.log(`got ${this.current}`);

      // reset
      this.awaiting.delete(this.current);
      this.current = "";
      this.buffer = "";
    }
    return precontent + postcontent;
  }
}

let captor = new Captor();
captor.handlers["map"] = {
  "openTag": "<MAPSTART>",
  "closeTag": "<MAPEND>",
  "callback": (self, content) => {
    self.map = ansiup.ansi_to_html(content);
  }
}
captor.handlers["inventory"] = {
  "openTag": /\{invdata(?: (\w+))?\}\n/,
  "closeTag": "\n{/invdata}",
  "callback": (self, content, type) => {
    addItems(self, content, type);
  },
}
captor.handlers["equipment"] = {
  "openTag": "{eqdata}\n",
  "closeTag": "\n{/eqdata}",
  "callback": (self, content) => {
    addItems(self, content, "equipment");
  },
}

/**
 * Parse and handle a telnet message.
 * @param {*} self - the svelte state object
 * @param {string} msg - a telnet message
 */
function parseMessage(self, msg) {
  msg = captor.extractBetweenTags(self, msg);
  msg = extractInvmon(self, msg);
  msg = extractInvitem(self, msg);

  // "[*Daily Blessing*] [678/678hp 666/666mn 993/993mv 0qt 746tnl] >"
  // const playerStats = RegExp(/(?<prefix>\[[A-Za-z: ]*)(?<hp>[0-9]+)\/(?<totalhp>[0-9]+)hp (?<mn>[0-9]+)\/(?<totalmn>[0-9]+)mn (?<mv>[0-9]+)\/(?<totalmv>[0-9]+)mv((?<qt> [0-9]+)qt)? (?<tnl>[0-9]+)tnl.+?>/g);
  const playerStats = RegExp(/(?<prefix>\[[^\][A-Za-z: ].*?)(?<hp>[0-9]+)\/(?<totalhp>[0-9]+)hp (?<mn>[0-9]+)\/(?<totalmn>[0-9]+)mn (?<mv>[0-9]+)\/(?<totalmv>[0-9]+)mv((?<qt> [0-9]+)qt)? (?<tnl>[0-9]+)tnl.+?>/g);
  // "[Fighting: 587/717hp 700/700mn 1025/1025mv 695tnl Enemy: 45% ]>"

  const pStats = [...msg.matchAll(playerStats)];
  if (pStats.length) {
    const { qt } = pStats[0].groups;
    if (qt) {
      self.qt = parseInt(qt, 10);
    }
  }
  return msg;
}

export const output = {
  subscribe,
  set,
  update,

  ingest: newMsg => update(self => {
    const message = parseMessage(self, newMsg);
    let convertedMsg = ansiup.ansi_to_html(message);
    self.log = [...self.log, convertedMsg];
    return self;
  }),
};
export { captor, strip_colors };
