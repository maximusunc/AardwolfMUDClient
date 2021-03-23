# Node.js Aardwolf MUD Client
*Requires node version >= 12.0.0*
## Getting started
```bash
npm install
npm start
```
If you want the old terminal client, run:
```bash
npm run start-old
```

## Inside the game
Regex can be a pain, so Aardwolf put in some helpful tags you can enable.

This client requires that you enable this tags manually for it to parse out map and inventory data.

Once in game, send these two commands:
```
invmon
tags map on
```

## Building an installer
```bash
npm run package
```