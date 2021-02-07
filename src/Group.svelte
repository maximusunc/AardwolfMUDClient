<script>
    import { gmcp } from './gmcp';
</script>

<style>
    #group {
        grid-column: 2 / span 3;
        grid-row: 1;
        height: 100%;
        overflow-y: auto;
        display: grid;
        grid-template-columns: 10% 20% 11% 11% 11% 11% 11% 8% 4%;
        grid-template-rows: 25px;
    }
    h5 {
        margin: 10px;
    }
</style>

<div id="group">
    {#if $gmcp.group.members}
        <h5>Level</h5>
        <h5>Name</h5>
        <h5>HP</h5>
        <h5>Mana</h5>
        <h5>Moves</h5>
        <h5>Alignment</h5>
        <h5>TNL</h5>
        <h5>Quest</h5>
        <h5>Here?</h5>
        {#each $gmcp.group.members as member, i}
            <h5>{member.info.lvl}</h5>
            <h5>{member.name}</h5>
            <h5>{member.info.hp}/{member.info.mhp}</h5>
            <h5>{member.info.mn}/{member.info.mmn}</h5>
            <h5>{member.info.mv}/{member.info.mmv}</h5>
            <h5>{member.info.align}</h5>
            <h5>{member.info.tnl}</h5>
            <h5>{member.info.qt}{member.info.qs === 1 ? '*' : ''}</h5>
            <h5>{member.info.here ? 'Y' : ''}</h5>
        {/each}
    {/if}
</div>
