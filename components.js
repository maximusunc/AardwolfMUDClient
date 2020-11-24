// blessed is for all the gui
const blessed = require('neo-blessed');

// Initialize a blessed screen
const screen = blessed.screen({
  smartCSR: true,
  cursor: {
    blink: true,
    shape: 'block',
  },
  title: 'Aardwolf!',
});

const output = blessed.log({
  parent: screen,
  width: 82,
  height: '100%-3',
  left: 0,
  top: 0,
  border: 'line',
  mouse: true,
  scrollable: true,
  alwaysScroll: true,
  scrollback: 1000,
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
  width: 82,
  height: 3,
  left: 0,
  bottom: 0,
  border: 'line',
  focused: true,
  inputOnFocus: true,
  scrollable: false,
  mouse: false,
});

const map = blessed.box({
  parent: screen,
  width: 32,
  height: 18,
  left: 82,
  top: 0,
  border: 'line',
  focusable: false,
  mouse: false,
});

const filler = blessed.box({
  parent: screen,
  width: '100%-82',
  top: 18,
  left: 82,
  bottom: 16,
  border: 'line',
  focusable: false,
  mouse: false,
});
const group_stats = blessed.box({
  parent: screen,
  width: '100%-114',
  height: 18,
  left: 114,
  border: 'line',
  focusable: false,
  mouse: false,
});

const stats_box = blessed.box({
  parent: screen,
  width: '100%-82',
  height: 16,
  left: 82,
  bottom: 0,
  border: 'line',
  focusable: false,
  mouse: false,
});

const bar_settings = {
  parent: stats_box,
  width: '85%',
  height: 1,
  left: 0,
  pch: '#'
};

const label_settings = {
  parent: stats_box,
  height: 1,
  left: '86%',
  align: 'center',
  content: '',
};

const blessing = blessed.text({
  parent: filler,
  top: 0,
  left: 0,
  content: '',
});

const health = blessed.progressbar({
  bottom: 9,
  barFg: 'red',
  ...bar_settings,
});
const health_label = blessed.text({
  bottom: 9,
  ...label_settings,
});
const mana = blessed.progressbar({
  bottom: 6,
  barFg: 'green',
  ...bar_settings,
});
const mana_label = blessed.text({
  bottom: 6,
  ...label_settings,
});
const moves = blessed.progressbar({
  bottom: 3,
  barFg: 'blue',
  ...bar_settings,
});
const moves_label = blessed.text({
  bottom: 3,
  ...label_settings,
});
const badguy = blessed.progressbar({
  bottom: 0,
  barFg: 'yellow',
  ...bar_settings,
});
const badguy_label = blessed.text({
  bottom: 0,
  ...label_settings,
});

const next_level = blessed.text({
  parent: stats_box,
  top: 0,
  left: 0,
  content: '',
});
const quest_time = blessed.text({
  parent: stats_box,
  top: 2,
  left: 0,
  content: '',
});

module.exports = {
  screen, input, output,
  health, health_label,
  mana, mana_label,
  moves, moves_label,
  badguy, badguy_label,
  next_level, quest_time,
  blessing, map,
  group_stats,
};
