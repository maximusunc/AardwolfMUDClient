import { writable } from 'svelte/store';
const AU = require('ansi_up');
const ansiup = new AU.default;

const { subscribe, set, update } = writable({
  log: [],
  map: '',
  inventory: '',
  stats: {},
  group: '',
});

let mapContents = '';
let gettingMap = false;
let gettingInv = false;
let inv = '';

function extractGroup(self, msg) {
  let groupStats = msg.match(/(-+.*\[.*Group:.*\].*-+)(.*)(\d{1,}\/\d{1,} +?\d{1,}. +?\d{1,}.*?\d{1,}.*  Y?)/s);
  if (!groupStats) {
    return msg
  }
  groupStats = groupStats[0];
  const group = ansiup.ansi_to_html(groupStats);
  self.group = group;
  return msg.replace(groupStats, '');
}

function extractMap(self, msg) {
  // Grab map. If it exists, put it in the map box
  const mapStart = msg.match(/(?<=<MAPSTART>)(.*)/s);
  if (!mapStart && !gettingMap) {
    return msg
  }
  gettingMap = true;
  mapContents += mapStart ? mapStart[0] : msg;
  if (mapContents.indexOf('<MAPEND>') > -1) {
    mapContents = mapContents.split('<MAPEND>')[0];
    mapContents = ansiup.ansi_to_html(mapContents);
    self.map = mapContents;
    mapContents = '';
    gettingMap = false;
  }
  // remove from output log
  // This will only replace maps that are in the same message
  return msg.replace(/<MAPSTART>(.*)<MAPEND>/s, '');
}

function extractInventory(self, msg) {
  // Grab inventory. It will likely come as multiple messages, so we need to keep track
  const invStart = msg.match(/(?<={inventory})(.*)/s);
  if (!invStart && !gettingInv) {
    return msg
  }
  gettingInv = true;
  inv += invStart ? invStart[0] : msg;
  // if the inventory has closing tag
  if (inv.indexOf('{/inventory}') > -1) {
    // grab everything before closing tag
    inv = inv.split('{/inventory}')[0];
    // display inventory
    inv = ansiup.ansi_to_html(inv);
    self.inventory = inv;
    // clear inventory for next time
    inv = '';
    gettingInv = false;
  }
  // remove from output log
  return msg.replace(/({inventory})?(.*)({\/inventory})?/s, '');
}

function parseMessage(self, msg) {
  msg = extractGroup(self, msg);
  msg = extractMap(self, msg);
  msg = extractInventory(self, msg);

  const stats = {};
  // "[*Daily Blessing*] [678/678hp 666/666mn 993/993mv 0qt 746tnl] >"
  // const playerStats = RegExp(/(?<prefix>\[[A-Za-z: ]*)(?<hp>[0-9]+)\/(?<totalhp>[0-9]+)hp (?<mn>[0-9]+)\/(?<totalmn>[0-9]+)mn (?<mv>[0-9]+)\/(?<totalmv>[0-9]+)mv((?<qt> [0-9]+)qt)? (?<tnl>[0-9]+)tnl.+?>/g);
  const playerStats = RegExp(/(?<prefix>\[[^\][A-Za-z: ].*?)(?<hp>[0-9]+)\/(?<totalhp>[0-9]+)hp (?<mn>[0-9]+)\/(?<totalmn>[0-9]+)mn (?<mv>[0-9]+)\/(?<totalmv>[0-9]+)mv((?<qt> [0-9]+)qt)? (?<tnl>[0-9]+)tnl.+?>/g);
  // "[Fighting: 587/717hp 700/700mn 1025/1025mv 695tnl Enemy: 45% ]>"
  const enemyStats = RegExp(/ Enemy: (?<enemy>[0-9]+)%/g);
  const dailyBlessing = RegExp(/\[.*\*.*Daily Blessing.*\*.*]/);

  const pStats = [...msg.matchAll(playerStats)];
  const enStats = [...msg.matchAll(enemyStats)];
  const haveBlessing = dailyBlessing.test(msg);
  if (haveBlessing) {
    stats.blessing = true;
    msg = msg.replace(dailyBlessing, '');
  }
  if (pStats.length) {
    const { hp, totalhp, mn, totalmn, mv, totalmv, qt, tnl } = pStats[0].groups;
    stats.currentHealth = hp;
    stats.totalHealth = totalhp;
    stats.currentMana = mn;
    stats.totalMana = totalmn;
    stats.currentMoves = mv;
    stats.totalMoves = totalmv;
    stats.tnl = tnl;
    if (qt) {
      stats.qt = parseInt(qt, 10);
    }
    stats.enemy = 0;
    msg = msg.replace(playerStats, '');
  }
  if (enStats.length) {
    const { enemy } = enStats[0].groups;
    stats.enemy = enemy;
    msg = msg.replace(enemyStats, '');
  }
  self.stats = { ...self.stats, ...stats };
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
}
