<script>
    import { captor, output, strip_colors } from './output';
    const { ipcRenderer } = require('electron');
    let openTab = "inventory";
    const handleRefresh = () => {
        Object.keys($output.containers).forEach((containerid) => {
            captor.askForContainer(containerid);
        })
    }
</script>

<style>
    #inventory {
        grid-column: 2 / span 3;
        grid-row: 2;
        height: 100%;
        overflow-y: auto;
        background-color: #fff;
        color: #000;
    }
</style>

<div id="inventory">
    <div>
        <ul>
            {#each [...Object.keys($output.containers)].reverse() as containerid}
                <li class="tab" id="{containerid}_tab" >
                    <a on:click={() => {openTab = containerid;}}>{@html containerid.match(/[a-z]/i) ? containerid : strip_colors($output.items.get(containerid).itemname)}</a>
                </li>
            {/each}
            <!-- <li>
                <a class="tab" id="refresh_tab" on:click={handleRefresh}>refresh</a>
            </li> -->
        </ul>
    </div>
    {#if openTab in $output.containers}
        <ul>
            {#each [...$output.containers[openTab]].reverse() as objectid}
                <li>
                    {@html $output.items.get(objectid).display()}
                    {#if openTab === "inventory"}
                        {#each $output.items.get(objectid).invactions() as action}
                            <a on:click={() => {ipcRenderer.send('msg', `${action.command} ${objectid}`);}}>{@html action.label}</a>
                        {/each}
                    {:else if openTab === "equipment"}
                        <a on:click={() => {ipcRenderer.send('msg', `remove ${objectid}`);}}>remove</a>
                    {:else}
                        <a on:click={() => {ipcRenderer.send('msg', `take ${objectid} ${openTab}`);}}>take</a>
                    {/if}
                </li>
            {/each}
        </ul>
    {/if}
</div>
