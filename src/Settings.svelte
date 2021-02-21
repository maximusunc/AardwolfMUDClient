<script>
    import { settings, open } from './settings';
    import { gmcp } from './gmcp';
</script>

<style>
    #settingsContainer {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0, 0, 0, 0.5);
    }
    #settings {
        width: 50%;
        height: 50%;
        background: white;
        color: black;
        border-radius: 15px;
    }
    h1 {
        text-align: center;
    }
    input {
        display: block;
    }
</style>

{#if $open}
    <div id="settingsContainer">
        <div id="settings">
            <button on:click={() => open.set(false)}>X</button>
            <h1>Settings</h1>
            <label for="username">Username</label>
            <input type="text" id="username" bind:value={$settings.user.username} />
            <label for="password">Password</label>
            <input type="password" id="password" bind:value={$settings.user.password} />
            <label for="autologin">Auto login</label>
            <input type="checkbox" id="checkbox" bind:checked={$settings.user.autoLogin} />
            {#if $gmcp.group.members}
                {#each $gmcp.group.members as member, i}
                    <p>{member.name}</p>
                    {#if $settings.groupActions[member.name]}
                        {#each $settings.groupActions[member.name] as action, i}
                            <input type="text" bind:value={action.label} />
                            <input type="text" bind:value={action.command} />
                            <button on:click={() => settings.removeGroupAction(member.name, i)}>Remove Action</button>
                        {/each}
                    {/if}
                    <button on:click={() => settings.addGroupAction(member.name)}>Add Action</button>
                {/each}
            {/if}
            <!-- stuff updates for the current session, but you need to save to persist -->
            <button on:click={() => settings.save($settings)}>Save</button>
        </div>
    </div>
{/if}
