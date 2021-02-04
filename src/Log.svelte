<script>
    import { output } from './output';
    const { ipcRenderer } = require('electron');

    function scrollToBottom() {
        // scroll output to bottom
        const element = document.getElementById('log');
        if (element) {
            element.scrollTop = element.scrollHeight - element.clientHeight;
        }
    }
    // throw scrollToBottom until after new render
    $: setTimeout(() => scrollToBottom($output.log), 10);

    function getInventory(lastLog) {
        if (!lastLog) return;
        if (
            lastLog.indexOf("You drop ") > -1 ||
            lastLog.indexOf("You get ") > -1 ||
            lastLog.indexOf("You put ") > -1 ||
            lastLog.indexOf("You take ") > -1 ||
            lastLog.indexOf("You remove ") > -1 ||
            lastLog.indexOf("You take ") > -1
        ) {
            ipcRenderer.send('msg', 'inv\n');
        }
    }

    // if you get or drop any items, rerequest inventory
    $: getInventory($output.log[$output.log.length - 1]);
</script>

<style>
    div {
        height: calc(100% - 25px);
        width: 100%;
        overflow-y: auto;
        word-wrap: break-word;
    }
    pre {
        margin: 0;
        white-space: pre-wrap;
    }
</style>

<div id="log">
    {#each $output.log as msg, i}
        <pre>{@html msg}</pre>
    {/each}
</div>