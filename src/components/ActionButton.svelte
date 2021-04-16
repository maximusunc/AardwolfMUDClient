<script>
    export let onClick = () => {};
    let ref;

    /**
     * Remove button focus and call onClick prop
     */
    function handleClick() {
        ref.blur();
        onClick();
    }
</script>

<style>
    button {
        margin: 2px;
    }
</style>

<button bind:this={ref} on:click={handleClick}>
    <slot></slot>
</button>