<script>
    import { gmcp } from './gmcp';
    import { settings } from './settings';
    import { output } from './output.js';
    const { ipcRenderer } = require('electron');
</script>

<style>
    #group {
        grid-column: 2 / span 3;
        grid-row: 1;
        height: 100%;
        overflow-y: auto;
    }
    .memberContainer {
        display: flex;
        min-height: 25%;
        border: 1px solid;
        box-sizing: border-box;
    }
    .memberInfo {
        width: 20%;
    }
    h5 {
        margin: 0px;
    }
    .memberStats {
        width: 60%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }
    .memberActions {
        width: 20%;
    }
    .here {
        color: green;
    }
    .meter {
        height: 10%; /* Can be anything */
        position: relative;
        background: #616E7C;
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
        top: 2px;
        font-size: 12px;
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
</style>

<div id="group">
    {#if $gmcp.vitals.hp}
        <div class="memberContainer">
            <div class="memberInfo">
                <!-- Own character will always come first in group section -->
                <!-- will also show even when not in group -->
                <h5>
                    {$gmcp.stats.lvl}: <span class="here">{$gmcp.name}</span>
                </h5>
                <h5>Align: {$gmcp.stats.align}</h5>
                <h5>TNL: {$gmcp.stats.tnl}</h5>
                <h5>Quest: {$output.qt}</h5>
            </div>
            <div class="memberStats">
                <div class="meter">
                    <span class="health" style={`width: ${$gmcp.vitals.hp / $gmcp.vitals.mhp * 100}%`}></span>
                    <div>Health {$gmcp.vitals.hp}/{$gmcp.vitals.mhp}</div>
                </div>
                <div class="meter">
                    <span class="mana" style={`width: ${$gmcp.vitals.mn / $gmcp.vitals.mmn * 100}%`}></span>
                    <div>Mana {$gmcp.vitals.mn}/{$gmcp.vitals.mmn}</div>
                </div>
                <div class="meter">
                    <span class="moves" style={`width: ${$gmcp.vitals.mv / $gmcp.vitals.mmv * 100}%`}></span>
                    <div>Moves {$gmcp.vitals.mv}/{$gmcp.vitals.mmv}</div>
                </div>
            </div>
            <div class="memberActions">
                {#each $settings.groupActions as action, i}
                    <button on:click={() => ipcRenderer.send('msg', `${action.command} ${$gmcp.name}`)}>{action.label}</button>
                {/each}
            </div>
        </div>
    {/if}
    {#if $gmcp.group.members}
        {#each $gmcp.group.members as member, i}
            {#if member.name !== $gmcp.name}
            <div class="memberContainer">
                <div class="memberInfo">
                    <h5>
                        {member.info.lvl}: <span class={member.info.here ? 'here' : ''}>{member.name}</span>
                    </h5>
                    <h5>Align: {member.info.align}</h5>
                    <h5>TNL: {member.info.tnl}</h5>
                    <h5>Quest: {member.info.qt}{member.info.qs === 1 ? '*' : ''}</h5>
                </div>
                <div class="memberStats">
                    <div class="meter">
                        <span class="health" style={`width: ${member.info.hp / member.info.mhp * 100}%`}></span>
                        <div>Health {member.info.hp}/{member.info.mhp}</div>
                    </div>
                    <div class="meter">
                        <span class="mana" style={`width: ${member.info.mn / member.info.mmn * 100}%`}></span>
                        <div>Mana {member.info.mn}/{member.info.mmn}</div>
                    </div>
                    <div class="meter">
                        <span class="moves" style={`width: ${member.info.mv / member.info.mmv * 100}%`}></span>
                        <div>Moves {member.info.mv}/{member.info.mmv}</div>
                    </div>
                </div>
                <div class="memberActions">
                    {#if $settings.groupActions[member.name]}
                        {#each $settings.groupActions[member.name] as action, i}
                            <button on:click={() => ipcRenderer.send('msg', action.command)}>{action.label}</button>
                        {/each}
                    {/if}
                </div>
            </div>
        {/each}
    {/if}
</div>
