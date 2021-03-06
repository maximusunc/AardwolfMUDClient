<script>
    import { output } from './output';
    const { ipcRenderer } = require('electron');
    const wearLocs = {
        0:  "light",    // [ Used as light       ]:            light
        1:  "head",     // [ Worn on head        ]:             head
        2:  "eyes",     // [ Worn on eyes        ]:             eyes
        3:  "lear",     // [ Worn on left ear    ]:              ear
        4:  "rear",     // [ Worn on right ear   ]:              ear
        5:  "neck1",    // [ Worn around neck    ]:             neck
        6:  "neck2",    // [ Worn around neck    ]:             neck
        7:  "back",     // [ Worn on back        ]:             back
        8:  "medal1",   // [ Pinned to chest1    ]:            medal
        9:  "medal2",   // [ Pinned to chest2    ]:            medal
        10: "medal3",   // [ Pinned to chest3    ]:            medal
        11: "medal4",   // [ Pinned to chest4    ]:            medal
        12: "torso",    // [ Worn on torso       ]:            torso
        13: "body",     // [ Worn around body    ]:             body
        14: "waist",    // [ Worn about waist    ]:            waist
        15: "arms",     // [ Worn on arms        ]:             arms
        16: "lwrist",   // [ Worn on left wrist  ]:            wrist
        17: "rwrist",   // [ Worn on right wrist ]:            wrist
        18: "hands",    // [ Worn on hands       ]:            hands
        19: "lfinger",  // [ Worn on left finger ]:           finger
        20: "rfinger",  // [ Worn on right finger]:           finger
        21: "legs",     // [ Worn on legs        ]:             legs
        22: "feet",     // [ Worn on feet        ]:             feet
        23: "shield",   // [ Worn as shield      ]:           shield
        24: "wielded",  // [ Primary Weapon      ]:            wield
        25: "second",   // [ Off-Hand Weapon     ]:            wield
        26: "hold",     // [ Held                ]:             hold
        27: "float",    // [ Floating nearby     ]:            float
        30: "above",    // [ Floating above      ]:            above
        32: "sleeping", // [ Sleeping            ]:         sleeping
    }
    let equipment;
    $: {
        equipment = {};
        [...$output.containers["equipment"]].forEach((objectid) => {
            const item = $output.items.get(objectid);
            equipment[wearLocs[item.wear_loc]] = objectid;
        });
    }
</script>


<ul>
    {#each Object.values(wearLocs).map((wearLoc) => [wearLoc, equipment[wearLoc]]) as [wearLoc, objectid]}
        <li>
            {@html wearLoc}:
            {#if $output.items.has(objectid)}
                {@html $output.items.get(objectid).display()}
                <button on:click={() => {ipcRenderer.send('msg', `id worn ${objectid}`);}}>details</button>
                <button on:click={() => {ipcRenderer.send('msg', `remove ${objectid}`);}}>remove</button>
            {:else}
                empty
            {/if}
        </li>
    {/each}
</ul>
