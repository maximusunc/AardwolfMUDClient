<script>
    export let id = "inventory";
    import { output } from './output';
    const { ipcRenderer } = require('electron');
    import ActionButton from './components/ActionButton.svelte';
    let stackedInventory = {};
    let nonstackedContainers = {};

    $: {
        stackedInventory = {};
        nonstackedContainers = {};
        $output.containers[id].forEach((objectId) => {
            const item = $output.items.get(objectId);
            let display = item.display();
            if (item.type === '12' || item.type === '11') {
                // is a container, don't stack
                if (display in nonstackedContainers) {
                    nonstackedContainers[display].push(objectId);
                    display = `${nonstackedContainers[display].length}. ${display}`;
                } else {
                    nonstackedContainers[display] = [objectId];
                }
            }
            if (display in stackedInventory) {
                stackedInventory[display].push(objectId);
            } else {
                stackedInventory[display] = [objectId];
            }
        });
    }
</script>

<style>
    .contentItem {
        padding: 2px;
    }
    span {
        display: inline-block;
        width: 40px;
        text-align: center;
        color: limegreen;
    }
</style>

<div>
    {#each Object.entries(stackedInventory).reverse() as [display, objectIds]}
        <div class="contentItem">
            <span>{objectIds.length > 1 ? `(${objectIds.length})` : ''}</span>
            {@html display}
            {#if id === "inventory"}
                <ActionButton
                    onClick={() => {ipcRenderer.send('msg', `id ${objectIds[objectIds.length - 1]}`);}}
                >
                    details
                </ActionButton>
                {#each $output.items.get(objectIds[objectIds.length - 1]).invactions() as action}
                    <ActionButton
                        onClick={() => {
                            let command = action.command(objectIds[objectIds.length - 1]);
                            ipcRenderer.send('msg', command);
                        }}
                    >
                        {action.label}
                    </ActionButton>
                {/each}
            {:else}
                <ActionButton
                    onClick={() => {ipcRenderer.send('msg', `take ${objectIds[objectIds.length - 1]} ${id}`);}}
                >
                    take
                </ActionButton>
            {/if}
        </div>
    {/each}
</div>
