<script>
  import { gmcp } from './gmcp';
</script>

<style>
  #statsContainer {
    grid-column: span 4;
    grid-row: 3;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
  .meter {
    height: 14%; /* Can be anything */
    position: relative;
    background: #555;
    -moz-border-radius: 25px;
    -webkit-border-radius: 25px;
    border-radius: 25px;
    padding: 5px;
    box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.3);
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
  span.health {
    background-color: #f0a3a3;
    background-image: linear-gradient(to bottom, #f0a3a3, #f42323);
  }
  span.mana {
    background-color: #f1a165;
    background-image: linear-gradient(to bottom, #f1a165, #f36d0a);
  }
  span.moves {
    background-color: rgb(43,194,83);
    background-image: linear-gradient(to bottom,rgb(43,194,83) 37%,rgb(84,240,84) 69%);
  }
  span.enemy {
    background-color: #efd300;
    background-image: linear-gradient(to bottom, #efd300, #ceb600);
  }
</style>

<div id="statsContainer">
  {#if $gmcp.vitals.hp}
    <div class="meter">
      <span class="health" style={`width: ${$gmcp.vitals.hp / $gmcp.vitals.maxhp * 100}%`}></span>
      <div>Health {$gmcp.vitals.hp}/{$gmcp.vitals.maxhp}</div>
    </div>
    <div class="meter">
      <span class="mana" style={`width: ${$gmcp.vitals.mana / $gmcp.vitals.maxmn * 100}%`}></span>
      <div>Mana {$gmcp.vitals.mana}/{$gmcp.vitals.maxmn}</div>
    </div>
    <div class="meter">
      <span class="moves" style={`width: ${$gmcp.vitals.moves / $gmcp.vitals.maxmv * 100}%`}></span>
      <div>Moves {$gmcp.vitals.moves}/{$gmcp.vitals.maxmv}</div>
    </div>
    <div class="meter">
      {#if $gmcp.enemy.name}
        <span class="enemy" style={`width: ${$gmcp.enemy.health}%`}></span>
        <div>{$gmcp.enemy.name} {`${$gmcp.enemy.health}%`}</div>
      {/if}
    </div>
  {/if}
</div>
