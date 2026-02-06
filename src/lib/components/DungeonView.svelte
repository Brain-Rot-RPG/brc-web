<script>
  import { authStore, gameStore, resetStores } from "../stores";
  import { updateSave, fetchItemById, addItemToInventory } from "../api";
  import oneWayImg from "../../assets/one-way.webp";
  import twoWayImg from "../../assets/two-way.webp";
  import threeWayImg from "../../assets/three-way.png";

  let itemDetailsCache = {};

  const getAvailablePaths = (dungeon, position) => {
    const paths = dungeon?.paths?.[position];
    return Array.isArray(paths) ? paths : [];
  };

  const loadItemDetails = async (inventory) => {
    if (!Array.isArray(inventory)) return;
    
    const uniqueIds = [...new Set(inventory)];
    for (const itemId of uniqueIds) {
      if (!itemDetailsCache[itemId]) {
        try {
          const item = await fetchItemById(itemId);
          itemDetailsCache[itemId] = item;
        } catch (err) {
          console.error(`Failed to load item ${itemId}:`, err);
        }
      }
    }
  };

  $: if ($gameStore.selectedPlayer?.inventory) {
    loadItemDetails($gameStore.selectedPlayer.inventory);
  }

  const getInventoryDisplay = (inventory, cache) => {
    if (!Array.isArray(inventory) || inventory.length === 0) {
      return [];
    }

    const counts = {};
    inventory.forEach(itemId => {
      counts[itemId] = (counts[itemId] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([itemId, count]) => {
        const name = itemDetailsCache[itemId]?.name || `Item ${itemId}`;
        return `${name} : ${count}`;
      });
  };

  const getChoiceIndex = (choice, pathCount) => {
    if (pathCount === 1) return 0;
    if (pathCount === 2) return choice === "Left" ? 0 : 1;
    if (pathCount === 3) {
      if (choice === "Left") return 0;
      if (choice === "Forward") return 1;
      return 2;
    }
    return 0;
  };

  let itemNotice = "";

  const findItemsAtPosition = (dungeon, position) => {
    const items = dungeon?.items || {};
    return Object.entries(items)
      .filter(([, positions]) => Array.isArray(positions) && positions.includes(position))
      .map(([itemId]) => itemId);
  };

  const handlePathChoice = async (choice) => {
    const save = $gameStore.selectedSave;
    const dungeon = $gameStore.currentDungeon;
    if (!save || !dungeon) return;

    const currentPosition = save.playerPos || save.playerpos || "start";
    const availablePaths = getAvailablePaths(dungeon, currentPosition);
    if (availablePaths.length === 0) return;

    const choiceIndex = getChoiceIndex(choice, availablePaths.length);
    const nextPosition = availablePaths[choiceIndex] || availablePaths[0];
    const nextPaths = getAvailablePaths(dungeon, nextPosition);
    const nextPathCount = nextPaths.length > 0 ? nextPaths.length : 1;
    try {
      itemNotice = "";
      const payload = {
        realizedDungeons: save.realizedDungeons ?? save.realizeddungeons ?? [],
        currentDungeonId: save.currentDungeonId ?? save.currentdungeonid ?? null,
        currentFightId: save.currentFightId ?? save.currentfightid ?? 0,
        playerId: save.playerId ?? save.playerid ?? null,
        userId: save.userId ?? save.userid ?? null,
        playerPos: nextPosition
      };

      const updated = await updateSave(
        save.id,
        payload,
        $authStore.accessToken
      );

      const player = $gameStore.selectedPlayer;
      if (player?.id) {
        const itemIds = findItemsAtPosition(dungeon, nextPosition);
        if (itemIds.length > 0) {
          const itemDetails = await Promise.all(
            itemIds.map(async (itemId) => {
              const updatedPlayer = await addItemToInventory(player.id, itemId);
              const item = await fetchItemById(itemId);
              itemDetailsCache[itemId] = item;
              return { item, updatedPlayer };
            })
          );

          const lastUpdate = itemDetails[itemDetails.length - 1];
          const itemNames = itemDetails.map(({ item }) => item.name).join(", ");
          const inventory = Array.isArray(lastUpdate.updatedPlayer.inventory)
            ? lastUpdate.updatedPlayer.inventory
            : [];

          itemNotice = `You obtained: ${itemNames}`;
          gameStore.update(store => ({
            ...store,
            selectedPlayer: {
              ...store.selectedPlayer,
              inventory
            }
          }));
        }
      }

      // Update save in store
      gameStore.update(store => ({
        ...store,
        selectedSave: updated,
        lastChoice: nextPosition,
        pathCount: nextPathCount
      }));
    } catch (err) {
      console.error("Error updating save:", err);
    }
  };

  const handleRestart = () => {
    resetStores();
  };

  function getChoiceOption(position) {
    const enemies = findEnemiesAtPosition(position);
    if (enemies.length > 0) {
        startBattle(enemies);
    } else {
        handlePathChoice(position);
    }
}

function findEnemiesAtPosition(position) {
    // TODO: Implement logic to find enemies at the specified position
    return [];
}

function handleBattleOutcome(outcome) {
    if (outcome === 'win') {
    } else if (outcome === 'lose') {
    }
}
</script>
<section class="card" style="display: flex; flex-direction: row; align-items: center;">
  
  <div class="summary" style="background: #1116; padding: 1rem 2rem; border-radius: 1rem; box-shadow: 0 0 16px #0008; max-width: 300px; margin-right: 2rem;">
    <p><strong>Brainrot:</strong> {$gameStore.selectedBrainrot?.name ?? "N/A"}</p>
    <img src={`http://localhost:3000/api/v1/images/${$gameStore.selectedBrainrot?.image}`} alt={$gameStore.selectedBrainrot?.name} style="width: 100%; max-width: 200px; border-radius: 0.5rem; margin-bottom: 1rem;" />
    <p><strong>Level:</strong> {$gameStore.selectedPlayer?.level ?? "N/A"}</p>
    <p><strong> HP:</strong> {$gameStore.selectedBrainrot?.baseHP ?? "N/A"}</p>
    <p><strong> Inventory:</strong>
        {#if $gameStore.selectedPlayer?.inventory && $gameStore.selectedPlayer.inventory.length > 0}
            {getInventoryDisplay($gameStore.selectedPlayer.inventory, itemDetailsCache).join(", ")}
        {:else}
            Empty
        {/if}
    </p>
  </div>

  <div style="flex: 1;">
        <h2>Dungeon Path Selection</h2>
        <p>Choose your path through the dungeon:</p>

        <div class="dungeon-img-container">
            {#if $gameStore.pathCount === 1}
            <img src={oneWayImg} alt="One path" class="dungeon-img" />
            {:else if $gameStore.pathCount === 2}
            <img src={twoWayImg} alt="Two paths" class="dungeon-img" />
            {:else}
            <img src={threeWayImg} alt="Three paths" class="dungeon-img" />
            {/if}
        </div>

        <div class="paths-flex">
            {#if $gameStore.pathCount === 1}
            <button class="primary" on:click={() => handlePathChoice("Forward")}>Go forward</button>
            {:else if $gameStore.pathCount === 2}
            <button class="primary" on:click={() => handlePathChoice("Left")}>Go left</button>
            <button class="primary" on:click={() => handlePathChoice("Right")}>Go right</button>
            {:else if $gameStore.pathCount === 3}
            <button class="primary" on:click={() => handlePathChoice("Left")}>Go left</button>
            <button class="primary" on:click={() => handlePathChoice("Forward")}>Go forward</button>
            <button class="primary" on:click={() => handlePathChoice("Right")}>Go right</button>
            {:else if $gameStore.pathCount === 0}
            <p>No available paths. You might be at the end of the dungeon.</p>
            {/if}
        </div>
    </div>
</section>

{#if $gameStore.lastChoice}
  <p class="choice">Last choice: {$gameStore.lastChoice}</p>
{/if}
{#if itemNotice}
  <p class="choice">{itemNotice}</p>
{/if}

<style>
  .dungeon-img-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem 0 1rem 0;
  }
  .dungeon-img {
    max-width: 100%;
    width: 500px;
    height: auto;
    object-fit: contain;
    box-shadow: 0 0 16px #0006;
    border-radius: 1rem;
    background: #222;
  }
  .paths-flex {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
</style>
<button class="ghost" on:click={handleRestart}>Log out</button>