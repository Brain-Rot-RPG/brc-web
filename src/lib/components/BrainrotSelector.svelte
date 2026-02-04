<script>
  import { authStore, gameStore } from "../stores";
  import { createPlayer, createDungeon, createSave } from "../api";

  let localError = "";

  const handleSelectBrainrot = async (brainrot) => {
    localError = "";
    gameStore.update(store => ({
      ...store,
      selectedBrainrot: brainrot
    }));

    authStore.update(store => ({ ...store, isLoading: true }));

    try {
      // Create the player
      const playerData = await createPlayer({
        level: 1,
        gold: 0,
        brainrotId: brainrot.id,
        inventory: []
      });
      console.log("Player created with ID:", playerData.id);

      // Create the dungeon
      const dungeonData = await createDungeon("easy", 10);
      const startPaths = dungeonData?.paths?.start;
      const pathCount = Array.isArray(startPaths) && startPaths.length > 0 ? startPaths.length : 1;


      // Filter brainrots to exclude bosses
      let filteredBrainrots = $gameStore.brainrotChoices.filter(b => !b.isBoss);

      // Create the save
      const savePayload = {
        realizedDungeons: [],
        currentDungeonId: dungeonData.id,
        currentFightId: 0,
        playerId: playerData.id,
        userId: $authStore.userId
      };
      console.log("User ID:", $authStore.userId);
      console.log("Save payload:", savePayload);

      const newSave = await createSave(savePayload, $authStore.accessToken);

      gameStore.update(store => ({
        ...store,
        selectedSave: newSave,
        selectedPlayer: playerData,
        currentDungeon: dungeonData,
        pathCount
      }));

      authStore.update(store => ({
        ...store,
        stage: "dungeon",
        isLoading: false
      }));
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      localError = err.message || "Server connection error.";
      authStore.update(store => ({ ...store, isLoading: false }));
    }
  };

  const handleBackToSave = () => {
    authStore.update(store => ({ ...store, stage: "save" }));
  };

  $: localError = $authStore.loginError;
</script>

<section class="card">
  <h2>Brainrot selection</h2>
  <p>A new dungeon is generated. Choose your brainrot from 3 random options.</p>
  <div class="grid">
    {#each $gameStore.brainrotChoices as brainrot}
      <button 
        class="tile" 
        on:click={() => handleSelectBrainrot(brainrot)}
        disabled={$authStore.isLoading}
      >
        <strong>{brainrot.name}</strong>
        <span>HP: {brainrot.baseHP}</span>
        <span>Aura: {brainrot.baseAttack}</span>
      </button>
    {/each}
  </div>
  {#if localError}
    <p class="error">{localError}</p>
  {/if}
  <button class="ghost" on:click={handleBackToSave} disabled={$authStore.isLoading}>
    Change save
  </button>
</section>
