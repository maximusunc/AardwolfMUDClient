<script>
    export let id = "inventory";
    import { output } from './output';
    const { ipcRenderer } = require('electron');
</script>

<style>
    .contentItem {
        padding: 2px;
    }
    .contentItem > button {
        margin-left: 5px;
    }
</style>

<div>
    {#each [...$output.containers[id]].reverse() as objectid}
        <div class="contentItem">
            {@html $output.items.get(objectid).display()}
            {#if id === "inventory"}
                <button on:click={() => {ipcRenderer.send('msg', `id ${objectid}`);}}>details</button>
                {#each $output.items.get(objectid).invactions() as action}
                    <button on:click={() => {ipcRenderer.send('msg', `${action.command} ${objectid}`);}}>{@html action.label}</button>
                {/each}
            {:else}
                <button on:click={() => {ipcRenderer.send('msg', `take ${objectid} ${id}`);}}>take</button>
            {/if}
        </div>
    {/each}
</div>
