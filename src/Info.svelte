<script>
    import { output } from './output';
    import { gmcp } from './gmcp';
</script>

<style>
    div {
        grid-column: 1;
        grid-row: 2;
        padding: 0px 10px;
    }
</style>

<div>
    {#if $gmcp.stats.tnl}
        <p>Experience to next level: {$gmcp.stats.tnl}</p>
        {#if $output.qt}
            <p>Time until next quest: {$output.qt}</p>
        {:else}
            <p>Go quest!</p>
        {/if}
        <p>Hunger: {$gmcp.sustenance.hunger}</p>
        <p>Thirst: {$gmcp.sustenance.thirst}</p>
        <p>Align: {$gmcp.stats.align}</p>
    {/if}
</div>
