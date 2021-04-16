<script>
  import { gmcp } from './gmcp';
  import { settings } from './settings';
  const { ipcRenderer } = require('electron');
  import ActionButton from './components/ActionButton.svelte';
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
  }
  .meter:last-child {
    margin-bottom: 15px;
  }
  .meter > div {
    margin-left: 10px;
    position: absolute;
    top: 9px;
  }
</style>

<div id="statsContainer">
  <div id="userActions">
    <p>User actions</p>
    {#each $settings.userActions as action, i}
      <ActionButton
        onClick={() => ipcRenderer.send('msg', action.command)}
      >
        {action.label}
      </ActionButton>
    {/each}
  </div>
  <div class="meter">
    {#if $gmcp.vitals.hp}
      <span class="healthBar" style={`width: ${Math.min($gmcp.vitals.hp / $gmcp.vitals.mhp * 100, 100)}%`}></span>
      <div>Health {$gmcp.vitals.hp}/{$gmcp.vitals.mhp}</div>
    {/if}
  </div>
  <div class="meter">
    {#if $gmcp.vitals.mmn}
      <span class="manaBar" style={`width: ${Math.min($gmcp.vitals.mn / $gmcp.vitals.mmn * 100, 100)}%`}></span>
      <div>Mana {$gmcp.vitals.mn}/{$gmcp.vitals.mmn}</div>
    {/if}
  </div>
  <div class="meter">
    {#if $gmcp.vitals.mmv}
      <span class="movesBar" style={`width: ${Math.min($gmcp.vitals.mv / $gmcp.vitals.mmv * 100, 100)}%`}></span>
      <div>Moves {$gmcp.vitals.mv}/{$gmcp.vitals.mmv}</div>
    {/if}
  </div>
  <div class="meter">
    {#if $gmcp.enemy.name}
      <span class="enemyBar" style={`width: ${$gmcp.enemy.health}%`}></span>
      <div>{$gmcp.enemy.name} {`${$gmcp.enemy.health}%`}</div>
    {/if}
  </div>
</div>
