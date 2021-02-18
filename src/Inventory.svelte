<script>
    import { captor, output, strip_colors } from './output';
    const { ipcRenderer } = require('electron');
    const handleRefresh = () => {
        Object.keys($output.containers).forEach((containerid) => {
            captor.askForContainer(containerid);
        })
    }
    function openTab(tabName) {
        // show chosen panel
        let panels = document.getElementsByClassName("panel")
        Array.from(panels).forEach(panel => {
            panel.style.display = "none";
        })
        document.getElementById(`${tabName}_panel`).style.display = "block";

        // highlight chosen tab
        let tabs = document.getElementsByClassName("tab")
        Array.from(tabs).forEach(tab => {
            tab.classList.remove("mm_active");
        })
        document.getElementById(`${tabName}_tab`).classList.add("mm_active");
    }
</script>

<div id="inventory">
    <div>
        <ul>
            {#each [...Object.keys($output.containers)].reverse() as containerid}
                <li class="tab" id="{containerid}_tab" >
                    <a on:click={() => {openTab(containerid)}}>{@html containerid.match(/[a-z]/i) ? containerid : strip_colors($output.items.get(containerid).itemname)}</a>
                </li>
            {/each}
            <!-- <li>
                <a class="tab" id="refresh_tab" on:click={handleRefresh}>refresh</a>
            </li> -->
        </ul>
    </div>
    {#each [...Object.keys($output.containers)].reverse() as containerid}
        <div id="{containerid}_panel" class="panel" style="display: none">
            <ul>
                {#each [...$output.containers[containerid]].reverse() as objectid}
                    <li>{@html $output.items.get(objectid).display()}</li>
                {/each}
            </ul>
        </div>
    {/each}
</div>
