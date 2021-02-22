<script>
    import { captor, output, strip_colors } from './output';
    const { ipcRenderer } = require('electron');
    let openTab = "inventory";
</script>

<style>
    #inventory {
        grid-column: 2 / span 3;
        grid-row: 2;
        height: 100%;
    }
    #inventory .tabs {
        height: 20%;
        overflow-y: auto;
    }
    #inventory .contents {
        height: 80%;
        overflow-y: auto;
    }
</style>

<div id="inventory">
    <div class="tabs">
        <ul>
            {#each [...Object.keys($output.containers)].reverse() as containerid}
                <li class="tab" id="{containerid}_tab" >
                    <button on:click={() => {openTab = containerid;}}>{@html containerid.match(/[a-z]/i) ? containerid : strip_colors($output.items.get(containerid).itemname)}</button>
                </li>
            {/each}
        </ul>
    </div>
    <div class="contents">
        {#if openTab in $output.containers}
            <ul>
                {#each [...$output.containers[openTab]].reverse() as objectid}
                    <li>
                        {@html $output.items.get(objectid).display()}
                        {#if openTab === "inventory"}
                            {#each $output.items.get(objectid).invactions() as action}
                                <button on:click={() => {ipcRenderer.send('msg', `${action.command} ${objectid}`);}}>{@html action.label}</button>
                            {/each}
                        {:else if openTab === "equipment"}
                            <button on:click={() => {ipcRenderer.send('msg', `remove ${objectid}`);}}>remove</button>
                        {:else}
                            <button on:click={() => {ipcRenderer.send('msg', `take ${objectid} ${openTab}`);}}>take</button>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>
