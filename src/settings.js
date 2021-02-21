import { writable } from 'svelte/store';
const { ipcRenderer, remote } = require('electron');

const { subscribe, set, update } = writable({
  user: {},
  groupActions: {},
});

function saveSettings(config) {
  console.log(config);
  ipcRenderer.send('config', config);
}

export const open = writable(false);

export const settings = {
  subscribe,
  set,
  update,

  ingest: msg => update(self => {
    self.user = msg.user;
    self.groupActions = msg.groupActions;
    return self;
  }),
  gettingUsername: false,
  gettingPassword: false,
  save: saveSettings,
  saveUser: msg => update(self => {
    if (self.user.autoLogin) return self;
    self.user = { ...self.user, ...msg };
    if (self.user.username && self.user.password) {
      const save = remote.dialog.showMessageBoxSync({
        message: 'Do you want to save these credentials for future logins? You can change this setting by submitting "settings".',
        buttons: ['Yes', 'No'],
      });
      console.log(save);
      if (save === 0) {
        self.user.autoLogin = true;
        saveSettings(self);
      } else {
        self.user.autoLogin = false;
        saveSettings(self);
      }
    }
    return self;
  }),
  addGroupAction: groupMember => update(self => {
    if (!self.groupActions[groupMember]) {
      self.groupActions[groupMember] = [];
    }
    self.groupActions[groupMember].push({ label: '', command: '' });
    return self;
  }),
  removeGroupAction: (groupMember, ind) => update(self => {
    self.groupActions[groupMember].splice(ind, 1);
    return self;
  }),
}

ipcRenderer.on('config', (e, c) => {
  settings.ingest(c);
});
