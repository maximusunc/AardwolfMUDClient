<script>
    import { output } from './output';
</script>

<style>
    div {
        grid-column: 1;
        grid-row: 2;
    }
</style>

<div>
    {#if $output.stats.tnl}
        <p>Experience to next level: {$output.stats.tnl}</p>
        {#if $output.stats.qt}
            <p>Time until next quest: {$output.stats.qt}</p>
        {:else}
            <p>Go quest!</p>
        {/if}
        {#if $output.stats.blessing}
            <p>Your daily blessing is ready to be received!</p>
        {/if}
    {/if}
</div>
