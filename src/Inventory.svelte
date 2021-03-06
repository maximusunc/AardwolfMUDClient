<script>
    import Container from './Container.svelte';
    import Equipment from './Equipment.svelte';
    import { output, strip_colors } from './output';
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
            {#if openTab === "equipment"}
                <Equipment />
            {:else}
                <Container id={openTab} />
            {/if}
        {/if}
    </div>
</div>
