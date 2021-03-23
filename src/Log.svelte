<script>
    import { output } from './output';
    import { beforeUpdate, afterUpdate } from 'svelte';
    let log;
    let autoscroll;

    beforeUpdate(() => {
        autoscroll = log && log.scrollHeight - log.clientHeight <= log.scrollTop + 10;
    });

    afterUpdate(() => {
        // scroll output to bottom
        if (autoscroll) {
            log.scrollTop = log.scrollHeight - log.clientHeight;
        }
    });
</script>

<style>
    #logContainer {
        height: calc(100% - 25px);
        width: 100%;
        /* background-color: dimgrey; */
        border-right: 1px solid #F5F7FA;
        background: #3E4C59;
        color: #F5F7FA;
    }
    #log {
        padding: 0px 10px;
        height: 100%;
        overflow-y: auto;
        word-wrap: break-word;
    }
    pre {
        margin: 0;
        white-space: pre-wrap;
    }
</style>

<div id="logContainer">
    <div id="log" bind:this={log}>
        {#each $output.log as msg, i}
            <pre>{@html msg}</pre>
        {/each}
    </div>
</div>