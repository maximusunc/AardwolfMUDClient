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

<link rel="stylesheet" href="https://unpkg.com/purecss@2.0.5/build/pure-min.css" integrity="sha384-LTIDeidl25h2dPxrB2Ekgc9c7sEC3CWGM6HeFmuDNUjX76Ert4Z4IY714dhZHPLd" crossorigin="anonymous">

<div id="inventory">
    <div class="pure-menu pure-menu-horizontal">
        <ul class="pure-menu-list">
            {#each [...Object.keys($output.containers)].reverse() as containerid}
                <li class="pure-menu-item tab" id="{containerid}_tab" >
                    <a class="pure-menu-link" on:click={() => {openTab(containerid)}}>{@html containerid.match(/[a-z]/i) ? containerid : strip_colors($output.items.get(containerid).itemname)}</a>
                </li>
            {/each}
            <!-- <li class="pure-menu-item">
                <a class="pure-menu-link tab" id="refresh_tab" on:click={handleRefresh}>refresh</a>
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
