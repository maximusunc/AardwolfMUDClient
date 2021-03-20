<script>
  import { gmcp } from './gmcp';
  import { settings } from './settings';
  const { ipcRenderer } = require('electron');
</script>

<style>
  #statsContainer {
    grid-column: span 4;
    grid-row: 3;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0px 10px;
  }
  .meter {
    height: 14%;
    position: relative;
    background: #616E7C;
    -moz-border-radius: 25px;
    -webkit-border-radius: 25px;
    border-radius: 25px;
    padding: 5px;
    box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.3);
  }
  .meter:last-child {
    margin-bottom: 15px;
  }
  .meter > span {
    display: flex;
    align-items: center;
    height: 100%;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    box-shadow: 
      inset 0 2px 9px  rgba(255,255,255,0.3),
      inset 0 -2px 6px rgba(0,0,0,0.4);
    position: relative;
    overflow: hidden;
  }
  .meter > div {
    margin-left: 10px;
    position: absolute;
    top: 9px;
  }
  span.enemy {
    background-color: #efd300;
    background-image: linear-gradient(to bottom, #efd300, #ceb600);
  }
  span.health {
    background-color: #f0a3a3;
    background-image: linear-gradient(to bottom, #f0a3a3, #f42323);
  }
  #userActions > button {
    margin-right: 5px;
  }
</style>

<div id="statsContainer">
  <div id="userActions">
    <p>User actions</p>
    {#each $settings.userActions as action, i}
      <button on:click={() => ipcRenderer.send('msg', action.command)}>{action.label}</button>
    {/each}
  </div>
  <div class="meter">
    {#if $gmcp.vitals.hp}
      <span class="health" style={`width: ${Math.min($gmcp.vitals.hp / $gmcp.vitals.mhp * 100, 100)}%`}></span>
      <div>Health {$gmcp.vitals.hp}/{$gmcp.vitals.mhp}</div>
    {/if}
  </div>
  <div class="meter">
    {#if $gmcp.enemy.name}
      <span class="enemy" style={`width: ${$gmcp.enemy.health}%`}></span>
      <div>{$gmcp.enemy.name} {`${$gmcp.enemy.health}%`}</div>
    {/if}
  </div>
</div>
