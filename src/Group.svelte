<script>
    import { gmcp } from './gmcp';
    import { settings } from './settings';
    import { output } from './output.js';
    const { ipcRenderer } = require('electron');
    import ActionButton from './components/ActionButton.svelte';
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
    }
    .meter > div {
        margin-left: 10px;
        position: absolute;
        top: 2px;
        font-size: 12px;
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
                    <span class="healthBar" style={`width: ${Math.min($gmcp.vitals.hp / $gmcp.vitals.mhp * 100, 100)}%`}></span>
                    <div>Health {$gmcp.vitals.hp}/{$gmcp.vitals.mhp}</div>
                </div>
                <div class="meter">
                    <span class="manaBar" style={`width: ${Math.min($gmcp.vitals.mn / $gmcp.vitals.mmn * 100, 100)}%`}></span>
                    <div>Mana {$gmcp.vitals.mn}/{$gmcp.vitals.mmn}</div>
                </div>
                <div class="meter">
                    <span class="movesBar" style={`width: ${Math.min($gmcp.vitals.mv / $gmcp.vitals.mmv * 100, 100)}%`}></span>
                    <div>Moves {$gmcp.vitals.mv}/{$gmcp.vitals.mmv}</div>
                </div>
            </div>
            <div class="memberActions">
                {#each $settings.groupActions as action, i}
                    <ActionButton
                        onClick={() => ipcRenderer.send('msg', `${action.command} ${$gmcp.name}`)}
                    >
                        {action.label}
                    </ActionButton>
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
                            <span class="healthBar" style={`width: ${Math.min(member.info.hp / member.info.mhp * 100, 100)}%`}></span>
                            <div>Health {member.info.hp}/{member.info.mhp}</div>
                        </div>
                        <div class="meter">
                            <span class="manaBar" style={`width: ${Math.min(member.info.mn / member.info.mmn * 100, 100)}%`}></span>
                            <div>Mana {member.info.mn}/{member.info.mmn}</div>
                        </div>
                        <div class="meter">
                            <span class="movesBar" style={`width: ${Math.min(member.info.mv / member.info.mmv * 100, 100)}%`}></span>
                            <div>Moves {member.info.mv}/{member.info.mmv}</div>
                        </div>
                    </div>
                    <div class="memberActions">
                        {#each $settings.groupActions as action, i}
                            <ActionButton
                                onClick={() => ipcRenderer.send('msg', `${action.command} ${member.name}`)}
                            >
                                {action.label}
                            </ActionButton>
                        {/each}
                    </div>
                </div>
            {/if}
        {/each}
    {/if}
</div>
