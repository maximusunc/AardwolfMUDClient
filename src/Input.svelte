<script>
    const { ipcRenderer } = require('electron');
    import { onMount } from 'svelte';
    import { output } from './output';
    let command = '';
    let input = null;
    let commandHistory = new Set();
    let historyIndex = 0;
    let groupInterval = null;
    
    const handleKeyPress = () => {
		if (event.code == 'Enter') {
            // send command to telnet
            ipcRenderer.send('msg', command);
            // keep unique ordered list of previous commands
            if (commandHistory.has(command)) {
                // basically move last command to end of set
                commandHistory.delete(command);
            }
            commandHistory.add(command);
            historyIndex = commandHistory.size;
            // clear input
            command = '';
            // scroll output to bottom
            const element = document.getElementById('log');
            element.scrollTop = element.scrollHeight - element.clientHeight;
            if (command.toLowerCase() === 'daily blessing') {
                output.update(output => {
                    output.stats.blessing = false;
                    return output;
                });
            }
            // old group logic
            if (command.toLowerCase().includes('group accept') || command.toLowerCase().includes('group create')) {
                groupInterval = setInterval(() => {
                    ipcRenderer.send('msg', 'group');
                }, 1000 * 10);
            }
            if (command.toLowerCase().includes('group leave')) {
                clearInterval(groupInterval);
                output.update(output => {
                    output.group = {};
                    return output;
                });
            }
        }
        if (event.code === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex -= 1;
            }
            command = [...commandHistory][historyIndex];
        }
        if (event.code === 'ArrowDown') {
            if (historyIndex < commandHistory.size) {
                historyIndex += 1;
                command = [...commandHistory][historyIndex];
            } else {
                // clear input if at the end
                command = '';
            }
        }
    }
    // focus on input when initialized
    onMount(() => input.focus());
</script>

<style>
    input {
        height: 25px;
        width: 100%;
        box-sizing: border-box;
    }
</style>

<input
    type="text"
    bind:value={command}
    bind:this={input}
    on:keyup|preventDefault={handleKeyPress}
    on:blur={() => input.focus()} 
    placeholder="Telnet command..."
>
