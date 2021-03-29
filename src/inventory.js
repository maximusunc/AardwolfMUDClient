import { captor } from './output';
import { fix_colors } from './util'
const { ipcRenderer } = require('electron');

const generalActions = [
  {command: oid => `drop ${oid}`, label: "drop"}
]

const itemActions = {
  1: [{command: oid => `hold ${oid}`, label: "hold"}], // light
  2: [{command: oid => `recite ${oid}`, label: "use (on self)"}], // scroll
  3: [{command: oid => `hold ${oid}`, label: "hold"}], // wand
  4: [{command: oid => `hold ${oid}`, label: "hold"}], // stave
  5: [ // weapon
    {command: oid => `wield ${oid}`, label: "wield"},
    {command: oid => `dual ${oid}`, label: "dual"},
  ],
  6: [], // treasure
  7: [{command: oid => `wear ${oid}`, label: "wear"}], // armor
  8: [{command: oid => `quaff ${oid}`, label: "quaff"}], // potion
  9: [], // furniture
  10: [], // trash
  11: [ // container
    {command: oid => `look in ${oid}`, label: "look"},
    {command: oid => `invdata ${oid} ansi`, label: "monitor"},
  ],
  12: [{command: oid => `drink ${oid}`, label: "drink"}], // drink container
  13: [], // key
  14: [{command: oid => `eat ${oid}`, label: "eat"}], // food
  15: [], // boat
  16: [], // mob corpse
  17: [], // player corpse
  18: [], // fountain
  19: [{command: oid => `eat ${oid}`, label: "eat"}], // pill
  20: [{command: oid => `hold ${oid}`, label: "hold"}], // portal
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
    return `${fix_colors(this.itemname)} (${this.level})`
  }

  invactions() {
    let specificActions = this.type in itemActions ? itemActions[this.type] : []
    return [...specificActions, ...generalActions]
  }
}

/**
 * Add a collection of items to a container.
 * @param {*} self - the svelte state object
 * @param {string} invdata - the contents of an invdata report
 * @param {string} containerid - the container to which to add the items
 */
function addItems(self, invdata = "", containerid = "inventory") {
  self.containers[containerid] = new Set();
  invdata = invdata.trim();
  if (!invdata) {
    return
  }

  let lines = invdata.split("\n");

  lines.reverse().forEach(function (row) {
    let [objectid, properties] = row.split(/,(.+)/);
    self.items.set(objectid, new Item(properties));
    self.containers[containerid].add(objectid);
  });
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
    askForContainer(from, captor);
  }
  // addItem(self, objectid, to);
  if (to in self.containers) {
    self.containers[to].add(objectid);
  }
  if(!(from in self.containers) || !(to in self.containers)) {
    askForContainer(to, captor);
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
    askForContainer(from, captor);
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
    askForContainer(to, captor);
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
  let invmon = msg.match(/(?<=\{invmon\}).*?\n/gm);
  if (!invmon) {
    return msg;
  }
  invmon.forEach((line) => {
    let [action, objectid, containerid, wear_loc] = line.trim().split(',');
    invactions[action](self, objectid, containerid, wear_loc);
  });
  return msg.replace(/\{invmon\}.*?\n/gm, "");
}

/**
 * Extract and handle any invitem reports.
 * @param {*} self - the svelte state object
 * @param {string} msg - a telnet message
 */
function extractInvitem(self, msg) {
  let invitem = msg.match(/(?<=\{invitem\}).*?$/gm);
  if (!invitem) {
    return msg;
  }
  invitem.forEach((line) => {
    // console.log(`invitem: ${line}`);
    let [objectid, properties] = line.split(/,(.+)/)
    self.items.set(objectid, new Item(properties));
    self.containers["inventory"].add(objectid);
  });
  return msg.replace(/\{invitem\}.*?$/gm, "");
}

/**
 * Send a telnet message requesting invdata/eqdata
 * @param {string} containerid - the id of a container to be requested
 */
function askForContainer(containerid, captor) {
  let msg;
  switch (containerid) {
    case "inventory":
      msg = "invdata ansi";
      break
    case "equipment":
      msg = "eqdata ansi";
      break;
    default:
      msg = `invdata ${containerid} ansi`;
  }
  if (!captor.awaiting.has(containerid)) {
    // console.log(`awaiting ${containerid}`);
    captor.awaiting.add(containerid);
    ipcRenderer.send("msg", msg);
  }
}

export { addItems, invactions, extractInvitem, extractInvmon, Item };
