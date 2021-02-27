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
        overflow: auto;
        position: relative;
    }
    #close {
        position: absolute;
        right: 0;
        padding: 10px 30px;
        border: none;
        background: none;
        border-bottom-left-radius: 10px;
    }
    #close:hover {
        background: grey;
        color: white;
    }
    h1 {
        text-align: center;
    }
    input {
        display: block;
    }
    .actionRow {
        display: flex;
        align-items: center;
    }
    .actionRow > * {
        padding: 5px 10px;
    }
    #save {
        display: flex;
        justify-content: center;
        padding: 20px 20px 30px 20px;
    }
    #save > button {
        padding: 10px;
        border-radius: 10px;
    }
</style>

{#if $open}
    <div id="settingsContainer">
        <div id="settings">
            <button
                on:click={() => {
                    open.set(false);
                    settings.save($settings);
                }}
                id="close"
            >
                X
            </button>
            <h1>Settings</h1>
            <div class="actionRow">
                <div>
                    <label for="username">Username</label>
                    <input type="text" id="username" bind:value={$settings.user.username} />
                </div>
                <div>
                    <label for="password">Password</label>
                    <input type="password" id="password" bind:value={$settings.user.password} />
                </div>
                <div>
                    <label for="autologin">Auto login</label>
                    <input type="checkbox" id="checkbox" bind:checked={$settings.user.autoLogin} />
                </div>
            </div>
            <h2>Group Actions</h2>
            {#each $settings.groupActions as action, i}
                <div class="actionRow">
                    <div>
                        <label for={`groupLabel${i}`}>Label</label>
                        <input id={`groupLabel${i}`} type="text" bind:value={action.label} />
                    </div>
                    <div>
                        <label for={`groupCommand${i}`}>Command</label>
                        <input id={`groupCommand${i}`} type="text" bind:value={action.command} />
                    </div>
                    <button on:click={() => settings.removeGroupAction(i)}>X</button>
                </div>
            {/each}
            <button on:click={() => settings.addGroupAction()}>Add Group Action</button>
            <h2>User Actions</h2>
            {#each $settings.userActions as action, i}
                <div class="actionRow">
                    <div>
                        <label for={`userLabel${i}`}>Label</label>
                        <input id={`userLabel${i}`} type="text" bind:value={action.label} />
                    </div>
                    <div>
                        <label for={`userCommand${i}`}>Command</label>
                        <input id={`userCommand${i}`} type="text" bind:value={action.command} />
                    </div>
                    <button on:click={() => settings.removeUserAction(i)}>X</button>
                </div>
            {/each}
            <button on:click={() => settings.addUserAction()}>Add User Action</button>
            <!-- stuff updates for the current session, but you need to save to persist -->
            <div id="save">
                <button on:click={() => settings.save($settings)}>Save</button>
            </div>
        </div>
    </div>
{/if}
