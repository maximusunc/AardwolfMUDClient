<script>
    import { output } from './output';
</script>

<style>
    div {
        grid-column: 1;
        grid-row: 1;
        border: 1px solid;
    }
</style>

<div>
    <pre>{@html $output.map}</pre>
</div>
