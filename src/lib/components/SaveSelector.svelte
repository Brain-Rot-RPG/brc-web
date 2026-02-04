<script>
  import { authStore, gameStore } from "../stores";
  import { fetchAllSaves, fetchBrainrots, pickRandomBrainrots, fetchPlayerById, fetchBrainrotById, fetchDungeonById } from "../api";
  import { onMount } from "svelte";

  let userSaves = [];
  let localError = "";
  let isLoadingSaves = true;

  // Load saves on component mount
  onMount(async () => {
    try {
      const allSaves = await fetchAllSaves();
      console.log("All saves fetched:", allSaves);
      console.log("Current user ID:", $authStore.userId);
      
      // Filter saves belonging to the current user
      console.log(typeof allSaves[0].userid, typeof $authStore.userId);
      userSaves = allSaves.filter(save => save.userid === $authStore.userId);
      console.log("Saves filtered for user:", userSaves);
    } catch (err) {
      console.error("Error loading saves:", err);
      localError = err.message || "Server connection error.";
    } finally {
      isLoadingSaves = false;
    }
  });

  const handleSelectSave = async (save) => {
    try {
      // Fetch the player linked to the save
      const player = await fetchPlayerById(save.playerid || save.playerId);
      // Fetch the brainrot linked to the player
      const brainrot = await fetchBrainrotById(player.brainrotid || player.brainrotId);
      // Fetch the dungeon linked to the save
      const dungeon = await fetchDungeonById(save.currentDungeonId || save.currentdungeonid);
      const currentPosition = save.playerPos || save.playerpos || "start";
      const currentPaths = dungeon?.paths?.[currentPosition];
      const pathCount = Array.isArray(currentPaths) && currentPaths.length > 0 ? currentPaths.length : 1;

      gameStore.update(store => ({
        ...store,
        selectedSave: save,
        selectedPlayer: player,
        selectedBrainrot: brainrot,
        currentDungeon: dungeon,
        pathCount
      }));
      authStore.update(store => ({ ...store, stage: "dungeon" }));
    } catch (err) {
      localError = err.message || "Error loading save data.";
    }
  };

  const handleCreateSave = async () => {
    localError = "";
    authStore.update(store => ({ ...store, isLoading: true }));

    try {
      const brainrots = await fetchBrainrots();
      const brainrotChoices = pickRandomBrainrots(brainrots);

      gameStore.update(store => ({
        ...store,
        brainrotChoices
      }));

      authStore.update(store => ({ ...store, stage: "brainrot", isLoading: false }));
    } catch (err) {
      console.error("Error fetching brainrots:", err);
      localError = err.message || "Server connection error.";
      authStore.update(store => ({ ...store, isLoading: false }));
    }
  };

  const handleBackToLogin = () => {
    authStore.update(store => ({ ...store, stage: "login" }));
  };

  $: localError = $authStore.loginError || localError;
</script>

<section class="card">
  <h2>Choose a save</h2>
  
  {#if isLoadingSaves}
    <p>Loading saves...</p>
  {:else if userSaves && userSaves.length > 0}
    <h3>Your saves</h3>
    <div class="grid">
      {#each userSaves as save (save.id)}
        <button 
          class="tile" 
          on:click={() => handleSelectSave(save)}
          disabled={$authStore.isLoading}
        >
          <strong>Save #{save.id}</strong>
          <span>Dungeons won: {save.realizedDungeons?.length ?? 0}</span>
        </button>
      {/each}
    </div>
  {/if}

  <div class="grid">
    <button class="tile tile--new" on:click={handleCreateSave} disabled={$authStore.isLoading}>
      <strong>New save</strong>
      <span>Create a new game</span>
    </button>
  </div>

  {#if localError}
    <p class="error">{localError}</p>
  {/if}
  
  <button class="primary" on:click={handleCreateSave} disabled={$authStore.isLoading}>
    {$authStore.isLoading ? "Creating..." : "Create a new save"}
  </button>
  <button class="ghost" on:click={handleBackToLogin}>Back</button>
</section>

