<script>
  import logoUrl from "./assets/BRC.png";

  const brainrotPool = [
    { id: 1, name: "Giga Smurf", role: "Tank" },
    { id: 2, name: "Sigma Cat", role: "Assassin" },
    { id: 3, name: "Rizz Wizard", role: "Mage" },
    { id: 4, name: "Chad Turtle", role: "Tank" },
    { id: 5, name: "NPC Slime", role: "Support" },
    { id: 6, name: "Doom Llama", role: "Bruiser" }
  ];

  const saves = [
    { id: 1, name: "Save 1", level: 3 },
    { id: 2, name: "Save 2", level: 7 },
    { id: 3, name: "Save 3", level: 12 }
  ];

  let stage = "login"; // login | save | brainrot | dungeon
  let username = "";
  let password = "";
  let loginError = "";

  let selectedSave = null;
  let brainrotChoices = [];
  let selectedBrainrot = null;

  let pathCount = 1;
  let lastChoice = "";

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const pickRandomBrainrots = () => {
    const shuffled = [...brainrotPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const handleLogin = () => {
    loginError = "";
    if (!username.trim() || !password.trim()) {
      loginError = "Veuillez entrer un login et un mot de passe.";
      return;
    }
    stage = "save";
  };

  const handleSelectSave = (save) => {
    selectedSave = save;
    pathCount = randomInt(1, 3);
    brainrotChoices = pickRandomBrainrots();
    stage = "brainrot";
  };

  const handleSelectBrainrot = (brainrot) => {
    selectedBrainrot = brainrot;
    stage = "dungeon";
    lastChoice = "";
  };

  const handlePathChoice = (choice) => {
    lastChoice = choice;
  };

  const resetGame = () => {
    stage = "login";
    username = "";
    password = "";
    selectedSave = null;
    brainrotChoices = [];
    selectedBrainrot = null;
    lastChoice = "";
  };
</script>

<main class="app">
  <header class="app__header">
    <h1 class="title">
      <span class="title__glow">BRAINROT CHRONICLES</span>
      <span class="title__sub">THE AURA FARMING EXPEDITION</span>
    </h1>
    <p class="app__subtitle">Login → Save → Brainrot → Donjon. Aura farming intensifies.</p>
    <div class="badges">
      <span class="badge">💾 Save Select</span>
      <span class="badge">🧠 Brainrot RNG</span>
      <span class="badge">🗺️ Dungeon Start</span>
    </div>
  </header>

  {#if stage === "login"}
    <section class="card">
      <div class="title-logo">
        <img src={logoUrl} alt="BRC" class="title-logo__image" />
      </div>
      <h2>Connexion</h2>
      <div class="field">
        <label for="login">Login</label>
        <input id="login" type="text" bind:value={username} placeholder="Votre login" />
      </div>
      <div class="field">
        <label for="password">Mot de passe</label>
        <input id="password" type="password" bind:value={password} placeholder="Votre mot de passe" />
      </div>
      {#if loginError}
        <p class="error">{loginError}</p>
      {/if}
      <button class="primary" on:click={handleLogin}>Se connecter</button>
    </section>
  {:else if stage === "save"}
    <section class="card">
      <h2>Choisir une save</h2>
      <div class="grid">
        {#each saves as save}
          <button class="tile" on:click={() => handleSelectSave(save)}>
            <strong>{save.name}</strong>
            <span>Niveau {save.level}</span>
          </button>
        {/each}
      </div>
      <button class="ghost" on:click={resetGame}>Retour</button>
    </section>
  {:else if stage === "brainrot"}
    <section class="card">
      <h2>Sélection du brainrot</h2>
      <p>Un nouveau donjon est généré. Choisis ton brainrot parmi 3 aléatoires.</p>
      <div class="grid">
        {#each brainrotChoices as brainrot}
          <button class="tile" on:click={() => handleSelectBrainrot(brainrot)}>
            <strong>{brainrot.name}</strong>
            <span>{brainrot.role}</span>
          </button>
        {/each}
      </div>
      <button class="ghost" on:click={() => (stage = "save")}>Changer de save</button>
    </section>
  {:else if stage === "dungeon"}
    <section class="card">
      <h2>Donjon - Start</h2>
      <div class="summary">
        <p><strong>Save :</strong> {selectedSave?.name}</p>
        <p><strong>Brainrot :</strong> {selectedBrainrot?.name} ({selectedBrainrot?.role})</p>
        <p><strong>Chemins disponibles :</strong> {pathCount}</p>
      </div>

      <div class="paths">
        {#if pathCount === 1}
          <button class="primary" on:click={() => handlePathChoice("Tout droit")}>Avancer tout droit</button>
        {:else if pathCount === 2}
          <button class="primary" on:click={() => handlePathChoice("Gauche")}>Aller à gauche</button>
          <button class="primary" on:click={() => handlePathChoice("Droite")}>Aller à droite</button>
        {:else}
          <button class="primary" on:click={() => handlePathChoice("Gauche")}>Aller à gauche</button>
          <button class="primary" on:click={() => handlePathChoice("Milieu")}>Aller au milieu</button>
          <button class="primary" on:click={() => handlePathChoice("Droite")}>Aller à droite</button>
        {/if}
      </div>

      {#if lastChoice}
        <p class="choice">Dernier choix: {lastChoice}</p>
      {/if}

      <button class="ghost" on:click={resetGame}>Recommencer</button>
    </section>
  {/if}
</main>
