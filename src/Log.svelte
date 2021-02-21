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
    <div id="log">
        {#each $output.log as msg, i}
            <pre>{@html msg}</pre>
        {/each}
    </div>
</div>