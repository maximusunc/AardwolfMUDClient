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
    p {
        margin: 0;
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
    {#if $gmcp.stats.mstr}
        <p>Strength: [{$gmcp.stats.str}/{$gmcp.stats.mstr}]</p>
        <p>Intelligence: [{$gmcp.stats.int}/{$gmcp.stats.mint}]</p>
        <p>Wisdom: [{$gmcp.stats.wis}/{$gmcp.stats.mwis}]</p>
        <p>Dexterity: [{$gmcp.stats.dex}/{$gmcp.stats.mdex}]</p>
        <p>Constitution: [{$gmcp.stats.con}/{$gmcp.stats.mcon}]</p>
        <p>Luck: [{$gmcp.stats.luck}/{$gmcp.stats.mluck}]</p>
    {/if}
    {#if $gmcp.stats.trains || $gmcp.stats.gold || $gmcp.stats.bank}
        <p>Trains: {$gmcp.stats.trains}</p>
        <p>Pracs: {$gmcp.stats.pracs}</p>
        <p>Gold: {$gmcp.stats.gold.toLocaleString()}</p>
        <p>Bank: {$gmcp.stats.bank.toLocaleString()}</p>
        <p>TP: {$gmcp.stats.tp}</p>
        <p>QP: {$gmcp.stats.qp}</p>
    {/if}
</div>
