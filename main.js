const electron = require('electron');
const net = require('net');
const fs = require('fs');
// telnet-stream basically strips out all the telnet config messages.
const { TelnetSocket } = require('telnet-stream');
// Module to control application life.
const { app, BrowserWindow, ipcMain } = electron;

app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');

const path = require('path');

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

function createLogFile() {
  const now = new Date();
  // this is stupid, but it can't be inline
  const day = now.getDate();
  const timestamp = `${now.getFullYear()}_${now.getMonth() + 1}_${day}_${now.getHours()}_${now.getMinutes()}`;
  const writeStream = fs.createWriteStream(`logs/${timestamp}.log`);
  return writeStream;
}

let writeStream;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let developmentMode = false;

function createWindow() {
  const openWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1300,
      height: 1000,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    // mainWindow.once('ready-to-show', () => {
    //   mainWindow.show()
    // });
    mainWindow.maximize();

    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

    // and load the index.html of the app.
    const mode = process.env.NODE_ENV;
    const url = mode !== 'production' ? `file://${path.join(__dirname, './public/index.html')}` : 'http://localhost:5000';
    console.log(url);
    mainWindow.loadURL(url);


    // Open the DevTools if we should - Command line argument
    if (developmentMode) {
      mainWindow.webContents.openDevTools();
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
      installExtension(REACT_DEVELOPER_TOOLS);
    }

    ipcMain.on('ui-up', () => {
      writeStream = createLogFile();
      // create the telnet connection
      const socket = net.createConnection(23, '23.111.136.202');

      // telnet wrapper
      const tsock = new TelnetSocket(socket);

      ipcMain.on('msg', (e, msg) => {
        tsock.write(msg + '\n');
      });

      // listen to all incoming messages
      tsock.on('data', (chunk) => {
        // tsock.writeSub(GMCP, 'request group\n');
        const msg = chunk.toString('utf8');
        // message always has extra returns
        const message = msg.replaceAll('\r', '');
        writeStream.write(String.raw`${message}`);
        // send the message from telnet to UI
        mainWindow.webContents.send('message', message);
      });
      // exit the process when the telnet connection is closed
      tsock.on('close', () => {
        writeStream.end();
        // return process.exit();
        mainWindow.webContents.send('closed');
      });
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      mainWindow = null;
      // On Windows, we have to manually kill the container application, otherwise
      // we will leave one zombie process running.
    });
  };

  openWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
