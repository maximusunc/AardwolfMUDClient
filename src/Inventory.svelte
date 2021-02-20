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
                <li>{@html $output.items.get(objectid).display()}</li>
            {/each}
        </ul>
    {/if}
</div>
