import { writable } from 'svelte/store';

const { subscribe, set, update } = writable({
  stats: {},
  name: '',
  enemy: {},
  sustenance: {},
  vitals: {},
  group: {},
});

function parseGroup(self, gmcpData) {
  const group = JSON.parse(gmcpData);
  self.group = group;
}

function parseStatus(self, gmcpData) {
  const status = JSON.parse(gmcpData);
  self.enemy = { name: status.enemy, health: status.enemypct };
  self.sustenance = { hunger: status.hunger, thirst: status.thirst };
  self.stats.lvl = status.level;
  self.stats.tnl = status.tnl;
  self.stats.align = status.align;
}

function parseStats(self, gmcpData) {
  const stats = JSON.parse(gmcpData);
  self.stats = { ...self.stats, ...stats };
}

function parseVitals(self, gmcpData) {
  const vitals = JSON.parse(gmcpData);
  self.vitals = { ...self.vitals, hp: vitals.hp, mn: vitals.mana, mv: vitals.moves };
}

function parseMaxstats(self, gmcpData) {
  const maxstats = JSON.parse(gmcpData);
  self.vitals = { ...self.vitals, mhp: maxstats.maxhp, mmn: maxstats.maxmana, mmv: maxstats.maxmoves };
  self.stats = {
    ...self.stats,
    mstr: maxstats.maxstr,
    mint: maxstats.maxint,
    mwis: maxstats.maxwis,
    mdex: maxstats.maxdex,
    mcon: maxstats.maxcon,
    mluck: maxstats.maxluck,
  };
}

export const gmcp = {
  subscribe,
  set,
  update,

  ingest: msg => update(self => {
    const msgType = msg.substr(0, msg.indexOf(' '));
    // console.log('gmcp type:', msgType);
    const gmcpData = msg.substr(msg.indexOf(' ') + 1);
    switch (msgType) {
      case 'char.status':
        // { "level": 136, "tnl": 102, "hunger": 100, "thirst": 100, "align": 2360, "state": 9, "pos": "Sleeping" , "enemy": "" }
        parseStatus(self, gmcpData);
        break;
      case 'char.vitals':
        // { "hp": 3880, "mana": 2653, "moves": 4020 }
        parseVitals(self, gmcpData);
        break;
      case 'char.stats':
        // { "str": 130, "int": 95, "wis": 95, "dex": 122, "con": 123, "luck": 131, "hr": 121, "dr": 96, "saves": 0 }
        parseStats(self, gmcpData);
        break;
      case 'char.maxstats':
        // { "maxhp": 3880, "maxmana": 2653, "maxmoves": 4020, "maxstr": 111, "maxint": 88, "maxwis": 90, "maxdex": 108, "maxcon": 111, "maxluck": 127 }
        parseMaxstats(self, gmcpData);
        break;
      case 'char.worth':
        // { "gold": 749755, "bank": 6400010, "qp": 1062, "tp": 4, "trains": 72, "pracs": 569, "qpearned": 1062 }
        parseStats(self, gmcpData);
        break;
      case 'char.base':
        // { "name": "Maximusunc", "class": "Thief", "subclass": "Ninja", "race": "Wolfen", "clan": "", "pretitle": "", "perlevel": 1000, "tier": 0, "remorts": 1, "redos": 0, "classes" : "2", "level": 136, "pups": 0, "totpups": 0 }
        const base = JSON.parse(gmcpData);
        self.name = base.name;
        break;
      case 'comm.quest':
        console.log('quest info:', gmcpData);
        // { "action": "start", "targ": "Tom Thumb", "room": "In A Cottage", "area": "Faerie Tales II", "timer": 55 }
        // { "action": "comp", "qp": 15, "tierqp": 0, "pracs": 0, "hardcore": 0, "opk": 0, "trains": 0, "tp": 0, "mccp": 0, "lucky": 0, "double": 0, "daily": 1, "totqp": 30, "gold": 4306, "completed": 32, "wait": 30 }
        break;
      case 'group':
        parseGroup(self, gmcpData);
        break;
      default:
        // console.log('Unhandled gmcp message type:', msgType);
    }
    return self;
  }),
}
