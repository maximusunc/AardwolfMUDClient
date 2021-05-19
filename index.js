/**
 * Aardwolf MUD client written in Javascript
 * 
 * IMPORTANT: You need to run the following commands to get the map and inventory to work:
 * `tags map on`
 * `tags inv on`
 */
const net = require('net');
const fs = require('fs');
// telnet-stream basically strips out all the telnet config messages.
const { TelnetSocket } = require('./telnet-stream');

const {
  screen, input, output,
  health, health_label,
  mana, mana_label,
  moves, moves_label,
  badguy, badguy_label,
  next_level, quest_time,
  blessing, map,
  group_stats, inventory,
} = require('./components');

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

const now = new Date();
// this is stupid, but it can't be inline
const day = now.getDate();
const timestamp = `${now.getFullYear()}_${now.getMonth() + 1}_${day}_${now.getHours()}_${now.getMinutes()}`;
const writeStream = fs.createWriteStream(`logs/${timestamp}.log`);

// create the telnet connection
const socket = net.createConnection(23, '23.111.136.202');

// telnet wrapper
const tsock = new TelnetSocket(socket);

const GMCP = 201;
const history = [];
let historyInd = 0;
let loggedIn = false;
let dailyBlessingActive = false;
let gettingMap = false;
let mapContents = '';
let gettingInv = false;
let inv = '';
// old group logic
let groupInterval = null;

input.on('submit', (msg) => {
  if (msg && loggedIn) {
    historyInd = history.push(msg);
  }
  if (dailyBlessingActive && msg.toLowerCase() === 'daily blessing') {
    dailyBlessingActive = false;
    blessing.setContent('');
  }
  // old group logic
  if (msg.toLowerCase().includes('group accept') || msg.toLowerCase().includes('group create')) {
    groupInterval = setInterval(() => {
      tsock.write('group\n');
    }, 1000 * 10);
  }
  if (msg.toLowerCase().includes('group leave')) {
    clearInterval(groupInterval);
    group_stats.setContent('');
  }

  input.clearValue();
  input.focus();
  tsock.write(msg + '\n');
  if (input.censor) {
    loggedIn = true;
  }
  screen.render();
});
input.key('up', () => {
  // this will stop at 0 or null
  if (historyInd) {
    historyInd -= 1;
    input.setValue(history[historyInd]);
    screen.render();
  }
});
input.key('down', () => {
  // stop if we're at the end
  if (historyInd < history.length - 1) {
    historyInd += 1;
    input.setValue(history[historyInd]);
  } else {
    historyInd = history.length;
    input.setValue('');
  }
  screen.render();
});
input.key('C-c', () => {
  tsock.write('quit\n');
});

function ingest(message) {
  if (message.includes('Password: ')) {
    input.censor = true;
  } else {
    input.censor = false;
  }
  // All messages seem to have an extra return
  message = message.replace(/\r/g, '');
  writeStream.write(String.raw`${message}`);

  let groupStats = message.match(/(-+.*\[.*Group:.*\].*-+)(.*)(\d{1,}\/\d{1,} +\d{1,}. +\d{1,}.*\d{1,}.*  Y?)/s);
  if (groupStats) {
    groupStats = groupStats[0];
    group_stats.setContent(groupStats);
    message = message.replace(groupStats, '');
  }

  // Grab map. If it exists, put it in the map box
  const mapStart = message.match(/(?<=<MAPSTART>)(.*)/s);
  if (mapStart || gettingMap) {
    gettingMap = true;
    mapContents += mapStart ? mapStart[0] : message;
    if (mapContents.indexOf('<MAPEND>') > -1) {
      mapContents = mapContents.split('<MAPEND>')[0];
      map.setContent(mapContents);
      mapContents = '';
      gettingMap = false;
    }
    // remove from output log
    // This will only replace maps that are in the same message
    message = message.replace(/<MAPSTART>(.*)<MAPEND>/s, '');
  }

  // Grab inventory. It will likely come as multiple messages, so we need to keep track
  const invStart = message.match(/(?<={inventory})(.*)/s);
  if (invStart || gettingInv) {
    gettingInv = true;
    inv += invStart ? invStart[0] : message;
    // if the inventory has closing tag
    if (inv.indexOf('{/inventory}') > -1) {
      // grab everything before closing tag
      inv = inv.split('{/inventory}')[0];
      // display inventory
      inventory.setContent(inv);
      // clear inventory for next time
      inv = '';
      gettingInv = false;
    }
    // remove from output log
    message = message.replace(/({inventory})?(.*)({\/inventory})?/s, '');
  }
  // if you get or drop any items, rerequest inventory
  if (message.indexOf("You drop ") > -1 || message.indexOf("You get ") > -1) {
    tsock.write('inv\n');
  }
  // writeStream.write(String.raw`${message}`);

  // "[*Daily Blessing*] [678/678hp 666/666mn 993/993mv 0qt 746tnl] >"
  const playerStats = RegExp(/(?<prefix>[\[A-Za-z: ]*)(?<hp>[0-9]+)\/(?<totalhp>[0-9]+)hp (?<mn>[0-9]+)\/(?<totalmn>[0-9]+)mn (?<mv>[0-9]+)\/(?<totalmv>[0-9]+)mv((?<qt> [0-9]+)qt)? (?<tnl>[0-9]+)tnl/g);
  // "[Fighting: 587/717hp 700/700mn 1025/1025mv 695tnl Enemy: 45% ]>"
  const enemyStats = RegExp(/ Enemy: (?<enemy>[0-9]+)%/g);
  const dailyBlessing = RegExp(/\[.*\*.*Daily Blessing.*\*.*]/);

  const stats = [...message.matchAll(playerStats)];
  const enStats = [...message.matchAll(enemyStats)];
  const haveBlessing = dailyBlessing.test(message);
  if (haveBlessing) {
    blessing.setContent('| Ayla wants to bless you.');
    dailyBlessingActive = true;
  }
  if (stats.length) {
    const { hp, totalhp, mn, totalmn, mv, totalmv, qt, tnl } = stats[0].groups;
    health.setProgress(hp / totalhp * 100);
    mana.setProgress(mn / totalmn * 100);
    moves.setProgress(mv / totalmv * 100);
    health_label.setContent(`HP ${hp}/${totalhp}`);
    mana_label.setContent(`MN ${mn}/${totalmn}`);
    moves_label.setContent(`MV ${mv}/${totalmv}`);
    next_level.setContent(`${tnl} experience points until you level up!`);
    if (qt) {
      quest_time.setContent(qt.trim() !== '0' ? `${qt} minutes until next quest` : 'Go quest!');
    }
    badguy.setProgress(0);
    badguy_label.setContent('');
  }
  if (enStats.length) {
    const { enemy } = enStats[0].groups;
    badguy.setProgress(enemy);
    badguy_label.setContent(`Baddie at ${enemy}%`);
  }
  // Dump everything into output log
  output.log(message);
}

// exit the process when the telnet connection is closed
tsock.on('close', () => {
  writeStream.end();
  return process.exit();
});

// listen to all incoming messages
tsock.on('data', (chunk) => {
  tsock.writeSub(GMCP, 'request group\n');
  const msg = chunk.toString('utf8');
  // display the message from telnet
  ingest(msg);
});

tsock.on('will', (opt) => {
  if (opt === GMCP) {
    // enable that junk
    tsock.writeDo(GMCP);
    tsock.writeSub(GMCP, 'group on\n');
    tsock.writeSub(GMCP, 'Core.Supports.Set [ "char 1", "comm 1", "room 1", "group 1" ]\n');
  }
});

tsock.on('sub', (opt, buf) => {
  const msg = buf.toString('utf8');
  output.log(msg);
  if (opt === GMCP) {
    // writeStream.write(String.raw`${msg}`);
    // writeStream.write(String.raw`------end of message------`);
  }
})

input.readInput(() => {});
screen.render();
