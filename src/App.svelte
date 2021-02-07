<script>
  import Input from './Input.svelte';
  import Log from './Log.svelte';
  import Map from './Map.svelte';
  import Group from './Group.svelte';
  import Info from './Info.svelte';
  import Inventory from './Inventory.svelte';
  import Stats from './Stats.svelte';
  import { output } from './output';
  import { gmcp } from './gmcp';
  const { ipcRenderer } = require('electron');

  // Tell main.js that UI is running and ready to start telnet communications
  ipcRenderer.send('ui-up');

  // listen for messages from telnet
  ipcRenderer.on('message', (e, msg) => {
    output.ingest(msg);
  });

  ipcRenderer.on('gmcp', (e, msg) => {
    gmcp.ingest(msg);
  });
</script>

<style>
  #root {
    display: flex;
    height: 100%;
  }
  #leftColumn {
    width: 38%;
    min-width: 630px;
    height: 100%;
  }
  #rightColumn {
    width: 62%;
    display: grid;
    grid-template-columns: 30% 20% 25% 25%;
    grid-template-rows: 35% 40% 25%;

  }
</style>

<div id="root">
  <div id="leftColumn">
    <Log />
    <Input />
  </div>
  <div id="rightColumn">
    <Map />
    <Group />
    <Info />
    <Inventory />
    <Stats />
  </div>
</div>