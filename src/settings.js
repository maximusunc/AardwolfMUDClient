import { writable } from 'svelte/store';
const { ipcRenderer, remote } = require('electron');

const { subscribe, set, update } = writable({
  user: {},
  groupActions: [],
  userActions: [],
});

function saveSettings(config) {
  ipcRenderer.send('config', config);
}

export const open = writable(false);

export const settings = {
  subscribe,
  set,
  update,

  ingest: msg => update(self => {
    self.user = msg.user;
    self.groupActions = msg.groupActions || [];
    // backwards compatibility for a groupActions object
    if (!Array.isArray(self.groupActions)) {
      self.groupActions = [];
    }
    self.userActions = msg.userActions || [];
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
  addGroupAction: () => update(self => {
    if (!Array.isArray(self.groupActions)) {
      self.groupActions = [];
    }
    self.groupActions.push({ label: '', command: '' });
    return self;
  }),
  removeGroupAction: (ind) => update(self => {
    self.groupActions.splice(ind, 1);
    return self;
  }),
  addUserAction: () => update(self => {
    if (!Array.isArray(self.userActions)) {
      self.userActions = [];
    }
    self.userActions.push({ label: '', command: '' });
    return self;
  }),
  removeUserAction: (ind) => update(self => {
    self.userActions.splice(ind, 1);
    return self;
  }),
}

ipcRenderer.on('config', (e, c) => {
  settings.ingest(c);
});
