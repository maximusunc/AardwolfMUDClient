<script>
    export let id = "inventory";
    import { output } from './output';
    const { ipcRenderer } = require('electron');
    import ActionButton from './components/ActionButton.svelte';
</script>

<style>
    .contentItem {
        padding: 2px;
    }
</style>

<div>
    {#each [...$output.containers[id]].reverse() as objectid}
        <div class="contentItem">
            {@html $output.items.get(objectid).display()}
            {#if id === "inventory"}
                <ActionButton
                    onClick={() => {ipcRenderer.send('msg', `id ${objectid}`);}}
                >
                    details
                </ActionButton>
                {#each $output.items.get(objectid).invactions() as action}
                    <ActionButton
                        onClick={() => {
                            let command = action.command(objectid);
                            ipcRenderer.send('msg', command);
                        }}
                    >
                        {action.label}
                    </ActionButton>
                {/each}
            {:else}
                <ActionButton
                    onClick={() => {ipcRenderer.send('msg', `take ${objectid} ${id}`);}}
                >
                    take
                </ActionButton>
            {/if}
        </div>
    {/each}
</div>
