<script>
    import { output } from './output';
</script>

<style>
    #inventory {
        grid-column: 2 / span 2;
        grid-row: 2;
        height: 100%;
        overflow-y: auto;
    }
    pre {
        margin: 0;
        white-space: pre-wrap;
    }
</style>

<div id="inventory">
    <pre>{@html $output.inventory}</pre>
</div>
