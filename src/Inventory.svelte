<script>
    import Container from './Container.svelte';
    import Equipment from './Equipment.svelte';
    import { output, fix_colors } from './output';
    let openTab = "inventory";
</script>

<style>
    #inventory {
        grid-column: 2 / span 3;
        grid-row: 2;
        height: 100%;
    }
    .tabs {
        height: 30px;
    }
    .tab {
        border: none;
        outline: none;
        background: #9AA5B1;
        margin: 0;
        height: 30px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
    }
    .tab.active {
        background: #CBD2D9;
    }
    .tab:hover {
        background: #E4E7EB;
    }
    .contents {
        height: calc(100% - 30px);
        overflow-y: auto;
    }
</style>

<div id="inventory">
    <div class="tabs">
        {#each [...Object.keys($output.containers)].reverse() as containerid}
            <button
                on:click={() => {openTab = containerid;}}
                class={`tab${openTab === containerid ? ' active' : ''}`}
            >
                {@html containerid.match(/[a-z]/i) ? containerid : fix_colors($output.items.get(containerid).itemname)}
            </button>
        {/each}
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
