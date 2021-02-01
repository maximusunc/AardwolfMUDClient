<script>
    import { output } from './output';
</script>

<style>
    #group {
        grid-column: 2 / span 3;
        grid-row: 1;
        height: 100%;
        overflow-y: auto;
    }
    pre {
        margin: 10px;
    }
</style>

<div id="group">
    <pre>{@html $output.group}</pre>
</div>
