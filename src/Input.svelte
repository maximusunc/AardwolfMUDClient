<script>
    const { ipcRenderer } = require('electron');
    import { onMount } from 'svelte';
    import { output } from './output';
    import { settings, open } from './settings';
    let command = '';
    let input = null;
    let commandHistory = new Set();
    let historyIndex = 0;

    const handleKeyPress = () => {
		if (event.code == 'Enter') {
            // all user settings logic
            if (settings.gettingUsername) {
                settings.saveUser({ username: command });
                settings.gettingUsername = false;
            }
            if (settings.gettingPassword) {
                settings.saveUser({ password: command });
                settings.gettingPassword = false;
            }
            if (command === 'settings') {
                open.set(true);
                command = '';
                return;
            }
            // end user settings logic

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

            // keep track of daily blessing
            if (command.toLowerCase() === 'daily blessing') {
                output.update(self => {
                    self.blessing = false;
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
    placeholder="Telnet command..."
>
