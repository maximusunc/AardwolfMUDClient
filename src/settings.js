import { writable } from 'svelte/store';
const { ipcRenderer, remote } = require('electron');

const { subscribe, set, update } = writable({
  user: {},
  groupActions: {},
});

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
  saveUser: msg => update(self => {
    if (self.user.autoLogin) return self;
    self.user = { ...self.user, ...msg };
    if (self.user.username && self.user.password) {
      const save = remote.dialog.showMessageBoxSync({
        message: 'Do you want to save these credentials for future logins?',
        buttons: ['Yes', 'No'],
      });
      console.log(save);
      if (save === 0) {
        self.user.autoLogin = true;
        ipcRenderer.send('config', self);
      } else {
        self.user.autoLogin = false;
        ipcRenderer.send('config', self);
      }
    }
    return self;
  }),
}

ipcRenderer.on('config', (e, c) => {
  settings.ingest(c);
});
