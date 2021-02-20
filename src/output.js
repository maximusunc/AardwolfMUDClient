import { writable } from 'svelte/store';
const AU = require('ansi_up');
const ansiup = new AU.default;
const { ipcRenderer } = require('electron');

/**
 * Strip ANSI and Aardwolf-style color tags from a string.
 * @param {string} str - string to be modified
 */
function strip_colors(str) {
  return str.replace(/@./g, "").replace(/\u001B\[\d;\d\dm/g, "")
}

/**
 * Extension of built-in Map to provide a default value.
 */
class DefaultMap extends Map {
  /**
   * Create a DefaultMap
   * @param {*} getDefaultValue - function generating the default value
   * @param  {...any} mapConstructorArgs - standard Map constructor arguments
   */
  constructor(getDefaultValue, ...mapConstructorArgs) {
    super(mapConstructorArgs);

    if (typeof getDefaultValue !== 'function') {
      throw new Error('getDefaultValue must be a function');
    }

    this.getDefaultValue = getDefaultValue;
  }

  /**
   * Get the value associated with a key, or the default value.
   * @param {} key
   */
  get(key) {
    if (!this.has(key)) {
      this.set(key, this.getDefaultValue(key));
    }

    return super.get(key);
  };
};

const generalActions = [
  "drop"
]

const itemActions = {
  1: ["hold"], // light
  2: [], // scroll
  3: ["hold"], // wand
  4: ["hold"], // stave
  5: ["wield"], // weapon
  6: [], // treasure
  7: ["wear"], // armor
  8: ["quaff"], // potion
  9: [], // furniture
  10: [], // trash
  11: ["look in"], // container
  12: ["drink"], // drink container
  13: [], // key
  14: ["eat"], // food
  15: [], // boat
  16: [], // mob corpse
  17: [], // player corpse
  18: [], // fountain
  19: [], // pill
  20: ["hold"], // portal
  21: [], // beacon
  22: [], // gift card
  23: [], // unused
  24: [], // raw material
  25: [], // campfire
  26: [], // forge
  27: [], // runestone
}

/** Class representing a specific item. */
class Item {
  /**
   * Create an item.
   * @param {string} invitem - the contents of an invitem report
   */
  constructor(invitem) {
    if (!invitem) {
      this.flags = "";
      this.itemname = "";
      this.level = "";
      this.type = "";
      this.unique = "";
      this.wear_loc = "";
      this.timer = "";
      return
    }
    let [
      flags, itemname, level,
      type, unique, wear_loc, timer,
    ] = invitem.split(",");
    this.flags = flags;
    this.itemname = itemname;
    this.level = level;
    this.type = type;
    this.unique = unique;
    this.wear_loc = wear_loc;
    this.timer = timer;
  }

  display() {
    return `${strip_colors(this.itemname)} (${this.level})`
  }

  invactions() {
    return [...itemActions[this.type], ...generalActions]
  }
}

/**
 * Add a collection of items to a container.
 * @param {*} self - the svelte state object
 * @param {string} invdata - the contents of an invdata report
 * @param {string} containerid - the container to which to add the items
 */
function addItems(self, invdata = "", containerid = "inventory") {
  if (!invdata) {
    return
  }

  let lines = invdata.split("\n");

  self.containers[containerid] = new Set();
  lines.reverse().forEach(function (row) {
    let [objectid, properties] = row.split(/,(.+)/);
    self.items.set(objectid, new Item(properties));
    self.containers[containerid].add(objectid);
  });
}

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

  /**
   * Send a telnet message requesting invdata/eqdata
   * @param {string} containerid - the id of a container to be requested
   */
  askForContainer(containerid) {
    let msg;
    switch (containerid) {
      case "inventory":
        msg = "invdata";
        break
      case "equipment":
        msg = "eqdata";
        break;
      default:
        msg = `invdata ${containerid}`;
    }
    if (!this.awaiting.has(containerid)) {
      // console.log(`awaiting ${containerid}`);
      this.awaiting.add(containerid);
      ipcRenderer.send("msg", msg);
    }
  }
}

/**
 * Move an object from one container to another.
 * @param {*} self - the svelte state object
 * @param {string} objectid - an object id
 * @param {string} from - the id of a container from which to move the object
 * @param {string} to - the id of a container to which to move the object
 */
function moveItem(self, objectid, from, to) {
  // removeItem(self, objectid, from);
  if (from in self.containers) {
    self.containers[from].delete(objectid);
  } else {
    captor.askForContainer(from);
  }
  // addItem(self, objectid, to);
  if (to in self.containers) {
    self.containers[to].add(objectid);
  }
  if(!(from in self.containers) || !(to in self.containers)) {
    captor.askForContainer(to);
  }
}

/**
 * Remove an object from a container.
 * @param {*} self - the svelte state object
 * @param {*} objectid - an object id
 * @param {*} from - the id of a container from which to remove the object
 */
function removeItem(self, objectid, from) {
  if (from in self.containers) {
    self.containers[from].delete(objectid);
  } else {
    captor.askForContainer(from);
  }
}

/**
 * Add an object to a container.
 * @param {*} self - the svelte state object
 * @param {*} objectid - an object id
 * @param {*} to - the id of a container to which to add the object
 */
function addItem(self, objectid, to) {
  if (to in self.containers) {
    self.containers[to].add(objectid);
  } else {
    captor.askForContainer(to);
  }
}

let invactions = {
  "1": function (self, objectid, containerid, wear_loc) {
    // Removed (was worn)
    moveItem(self, objectid, "equipment", "inventory");
    self.items.get(objectid).wear_loc = -1;
  },
  "2": function (self, objectid, containerid, wear_loc) {
    // Worn
    moveItem(self, objectid, "inventory", "equipment");
    self.items.get(objectid).wear_loc = wear_loc;
  },
  "3": function (self, objectid, containerid, wear_loc) {
    // Removed from inventory (given away, dropped)
    removeItem(self, objectid, "inventory");
  },
  "4": function (self, objectid, containerid, wear_loc) {
    // Added to inventory (received, picked up)
    addItem(self, objectid, "inventory");
  },
  "5": function (self, objectid, containerid, wear_loc) {
    // Taken out of container
    moveItem(self, objectid, containerid, "inventory");
  },
  "6": function (self, objectid, containerid, wear_loc) {
    // Put into container
    moveItem(self, objectid, "inventory", containerid);
  },
  "7": function (self, objectid, containerid, wear_loc) {
    // Consumed (quaffed, eaten, rotted)
    removeItem(self, objectid, "inventory");
  },
  "9": function (self, objectid, containerid, wear_loc) {
    // Put into vault
    console.error("Vaults not yet supported.");
  },
  "10": function (self, objectid, containerid, wear_loc) {
    // Removed from vault
    console.error("Vaults not yet supported.");
  },
  "11": function (self, objectid, containerid, wear_loc) {
    // Put into keyring
    moveItem(self, objectid, "inventory", "keyring");
  },
  "12": function (self, objectid, containerid, wear_loc) {
    // Get from keyring
    moveItem(self, objectid, "keyring", "inventory");
  },
}

/**
 * Extract and handle any invmon reports.
 * @param {*} self - the svelte state object
 * @param {string} msg - a telnet message
 */
function extractInvmon(self, msg) {
  let invmon = msg.match(/(?<=\{invmon\}).*/gm);
  if (!invmon) {
    return msg;
  }
  invmon.forEach((line) => {
    let [action, objectid, containerid, wear_loc] = line.split(",");
    invactions[action](self, objectid, containerid, wear_loc);
  });
  return msg;
}

/**
 * Extract and handle any invitem reports.
 * @param {*} self - the svelte state object
 * @param {string} msg - a telnet message
 */
function extractInvitem(self, msg) {
  let invitem = msg.match(/(?<=\{invitem\}).*/g);
  if (!invitem) {
    return msg;
  }
  invitem.forEach((line) => {
    // console.log(`invitem: ${line}`);
    let [objectid, properties] = line.split(/,(.+)/)
    self.items.set(objectid, new Item(properties));
    self.containers["inventory"].add(objectid);
  });
  return msg;
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
 * @param {*} msg - a telnet message
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
