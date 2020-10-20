const net = require('net');
const fs = require('fs');
// telnet-stream basically strips out all the telnet config messages.
const { TelnetSocket } = require('telnet-stream');

const {
  screen, input, output,
  health, health_label,
  mana, mana_label,
  moves, moves_label,
  badguy, badguy_label,
  next_level, quest_time,
  blessing,
} = require('./components');

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

const now = new Date();
// this is stupid, but it can't be inline
const day = now.getDate();
const timestamp = `${now.getFullYear()}${now.getMonth() + 1}${day}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
const writeStream = fs.createWriteStream(`logs/${timestamp}.log`);

// create the telnet connection
const socket = net.createConnection(23, '23.111.136.202');

// telnet wrapper
const tsock = new TelnetSocket(socket);

const history = [];
let historyInd = 0;
let loggedIn = false;
let dailyBlessingActive = false;

input.on('submit', (msg) => {
  if (msg && loggedIn) {
    historyInd = history.push(msg);
  }
  if (dailyBlessingActive && msg.toLowerCase() === 'daily blessing') {
    dailyBlessingActive = false;
    blessing.setContent('');
  }
  input.clearValue();
  input.focus();
  tsock.write(msg + '\n');
  if (input.secret) {
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
  process.exit();
});

function ingest(message) {
  if (message.includes('Password: ')) {
    input.secret = true;
  } else {
    input.secret = false;
  }
  writeStream.write(String.raw`${message}`);
  const lines = message.split('\n');
  lines.forEach((line) => {
    const hasMap = RegExp(/[a-zA-Z0-9]+/g);
    // "[*Daily Blessing*] [678/678hp 666/666mn 993/993mv 0qt 746tnl] >"
    // "[Fighting: 587/717hp 700/700mn 1025/1025mv 695tnl Enemy: 45% ]>"
    const playerStats = RegExp(/(?<prefix>[\[A-Za-z: ]*)(?<hp>[0-9]+)\/(?<totalhp>[0-9]+)hp (?<mn>[0-9]+)\/(?<totalmn>[0-9]+)mn (?<mv>[0-9]+)\/(?<totalmv>[0-9]+)mv((?<qt> [0-9]+)qt)? (?<tnl>[0-9]+)tnl/g);
    const enemyStats = RegExp(/ Enemy: (?<enemy>[0-9]+)%/g);
    const dailyBlessing = RegExp(/\[.*\*.*Daily Blessing.*\*.*]/);

    const stats = [...line.matchAll(playerStats)];
    const enStats = [...line.matchAll(enemyStats)];
    const haveBlessing = dailyBlessing.test(line);
    if (haveBlessing) {
      blessing.setContent('Ayla wants to bless you.');
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
    } else {
      output.log(line.replace(/\r/g, ''));
    }
    if (enStats.length) {
      const { enemy } = enStats[0].groups;
      badguy.setProgress(enemy);
      badguy_label.setContent(`Baddie at ${enemy}%`);
    }
  });
}

// exit the process when the telnet connection is closed
tsock.on('close', () => {
  writeStream.end();
  return process.exit();
});

// listen to all incoming messages
tsock.on('data', (chunk) => {
  const msg = chunk.toString('utf8');
  // display the message from telnet
  ingest(msg);
  // console.log(out.replace(/\r/g, '**newline**'));
});

input.readInput(() => {});
screen.render();