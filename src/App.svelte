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

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  let stage = "login"; // login | register | save | brainrot | dungeon
  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let loginError = "";
  let isLoading = false;
  let userId = null;

  let selectedSave = null;
  let brainrotChoices = [];
  let selectedBrainrot = null;

  let pathCount = 1;
  let lastChoice = "";

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const pickRandomBrainrots = (brainrots) => {
    const shuffled = [...brainrots].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const handleLogin = async () => {
    loginError = "";
    if (!username.trim() || !password.trim()) {
      loginError = "Veuillez entrer un login et un mot de passe.";
      return;
    }

    isLoading = true;
    try {
      console.log("Tentative de connexion vers:", `${apiUrl}/api/v1/auth/login`);
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Erreur API:", error);
        loginError = error.message || "Erreur lors de la connexion.";
        return;
      }

      const data = await response.json();
      console.log("Connexion réussie");
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      // Récupérer le profil utilisateur
      const profileResponse = await fetch(`${apiUrl}/api/v1/auth/users/me`, {
        headers: { "Authorization": `Bearer ${data.accessToken}` }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        userId = profileData.id;
        console.log("User ID récupéré:", userId);
      }
      
      stage = "save";
      username = "";
      password = "";
    } catch (err) {
      console.error("Erreur de connexion au serveur:", err);
      loginError = "Erreur de connexion au serveur.";
    } finally {
      isLoading = false;
    }
  };

  const handleRegister = async () => {
    loginError = "";
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      loginError = "Veuillez remplir tous les champs.";
      return;
    }

    if (username.length < 3 || username.length > 20) {
      loginError = "Le nom d'utilisateur doit contenir entre 3 et 20 caractères.";
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      loginError = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores.";
      return;
    }

    if (password !== confirmPassword) {
      loginError = "Les mots de passe ne correspondent pas.";
      return;
    }

    if (password.length < 12) {
      loginError = "Le mot de passe doit contenir au moins 12 caractères.";
      return;
    }

    isLoading = true;
    try {
      console.log("Tentative d'enregistrement vers:", `${apiUrl}/api/v1/auth/register`);
      const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          isSigma: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Erreur API:", error);
        loginError = error.message || "Erreur lors de la création du compte.";
        return;
      }

      console.log("Compte créé avec succès, tentative de connexion automatique");

      // Auto-login après l'enregistrement
      const loginResponse = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log("Auto-connexion réussie");
        localStorage.setItem("accessToken", loginData.accessToken);
        localStorage.setItem("refreshToken", loginData.refreshToken);
        
        // Récupérer le profil utilisateur
        const profileResponse = await fetch(`${apiUrl}/api/v1/auth/users/me`, {
          headers: { "Authorization": `Bearer ${loginData.accessToken}` }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          userId = profileData.id;
          console.log("User ID récupéré:", userId);
        }
        
        stage = "save";
        username = "";
        email = "";
        password = "";
        confirmPassword = "";
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      loginError = "Erreur de connexion au serveur.";
    } finally {
      isLoading = false;
    }
  };

  const handleSelectSave = (save) => {
    selectedSave = save;
    pathCount = randomInt(1, 3);
    brainrotChoices = pickRandomBrainrots();
    stage = "brainrot";
  };

  const handleCreateSave = async () => {
    isLoading = true;
    loginError = "";

    try {
      console.log("Récupération des brainrots...");

      const brainrotsResponse = await fetch(`${apiUrl}/api/v1/brainrot`, {
        headers: { "Content-Type": "application/json" }
      });

      if (!brainrotsResponse.ok) {
        loginError = "Erreur lors de la récupération des brainrots.";
        console.error("Brainrots fetch error:", await brainrotsResponse.json());
        return;
      }

      const brainrots = await brainrotsResponse.json();
      if (!Array.isArray(brainrots) || brainrots.length === 0) {
        loginError = "Aucun brainrot disponible.";
        return;
      }

      brainrotChoices = pickRandomBrainrots(brainrots);
      stage = "brainrot";
    } catch (err) {
      console.error("Erreur lors de la récupération des brainrots:", err);
      loginError = "Erreur de connexion au serveur.";
    } finally {
      isLoading = false;
    }
  };

  const handleSelectBrainrot = async (brainrot) => {
    selectedBrainrot = brainrot;
    isLoading = true;
    loginError = "";

    try {
      console.log("Création du player avec brainrot:", brainrot);

      const playerResponse = await fetch(`${apiUrl}/api/v1/player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: 1,
          gold: 0,
          brainrotId: brainrot.id,
          inventory: {}
        })
      });

      if (!playerResponse.ok) {
        loginError = "Erreur lors de la création du joueur.";
        console.error("Player creation error:", await playerResponse.json());
        return;
      }

      const playerData = await playerResponse.json();
      console.log("Player créé:", playerData);

      console.log("Création d'un donjon...");
      const dungeonResponse = await fetch(`${apiUrl}/api/v1/dungeon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: "easy", size: 10 })
      });

      if (!dungeonResponse.ok) {
        loginError = "Erreur lors de la création du donjon.";
        console.error("Dungeon creation error:", await dungeonResponse.json());
        return;
      }

      const dungeonData = await dungeonResponse.json();
      console.log("Donjon créé:", dungeonData);

      const savePayload = {
        realizedDungeons: [],
        currentDungeonId: dungeonData.id,
        currentFightId: 0,
        playerId: playerData.id
      };
      console.log("Save payload à envoyer:", savePayload);

      const saveResponse = await fetch(`${apiUrl}/api/v1/save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(savePayload)
      });

      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        console.error("Erreur save response:", error);
        loginError = error.message || "Erreur lors de la création de la sauvegarde.";
        return;
      }

      const newSave = await saveResponse.json();
      console.log("Sauvegarde créée:", newSave);

      selectedSave = newSave;
      stage = "dungeon";
      lastChoice = "";
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      loginError = "Erreur de connexion au serveur.";
    } finally {
      isLoading = false;
    }
  };

  const handlePathChoice = (choice) => {
    lastChoice = choice;
  };

  const resetGame = () => {
    stage = "login";
    username = "";
    email = "";
    password = "";
    confirmPassword = "";
    selectedSave = null;
    brainrotChoices = [];
    selectedBrainrot = null;
    lastChoice = "";
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };
</script>

<main class="app">
  <header class="app__header">
    <h1 class="title">
      <span class="title__glow">BRAINROT CHRONICLES</span>
      <span class="title__sub">THE AURA FARMING EXPEDITION</span>
    </h1>
    <p class="app__subtitle">Aura farming intensifies.</p>
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
        <input id="login" type="text" bind:value={username} placeholder="Votre login" disabled={isLoading} />
      </div>
      <div class="field">
        <label for="password">Mot de passe</label>
        <input id="password" type="password" bind:value={password} placeholder="Votre mot de passe" disabled={isLoading} />
      </div>
      {#if loginError}
        <p class="error">{loginError}</p>
      {/if}
      <button class="primary" on:click={handleLogin} disabled={isLoading}>
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
      <button class="ghost" on:click={() => (stage = "register")} disabled={isLoading}>Créer un compte</button>
    </section>
  {:else if stage === "register"}
    <section class="card">
      <div class="title-logo">
        <img src={logoUrl} alt="BRC" class="title-logo__image" />
      </div>
      <h2>Création de compte</h2>
      <div class="field">
        <label for="register-login">Login</label>
        <input id="register-login" type="text" bind:value={username} placeholder="Choisir un login (3-20 caractères)" disabled={isLoading} />
      </div>
      <div class="field">
        <label for="register-email">Email</label>
        <input id="register-email" type="email" bind:value={email} placeholder="Votre email" disabled={isLoading} />
      </div>
      <div class="field">
        <label for="register-password">Mot de passe</label>
        <input id="register-password" type="password" bind:value={password} placeholder="Au moins 12 caractères" disabled={isLoading} />
      </div>
      <div class="field">
        <label for="confirm-password">Confirmer le mot de passe</label>
        <input id="confirm-password" type="password" bind:value={confirmPassword} placeholder="Confirmer votre mot de passe" disabled={isLoading} />
      </div>
      {#if loginError}
        <p class="error">{loginError}</p>
      {/if}
      <button class="primary" on:click={handleRegister} disabled={isLoading}>
        {isLoading ? "Création..." : "Créer un compte"}
      </button>
      <button class="ghost" on:click={() => (stage = "login")} disabled={isLoading}>Retour à la connexion</button>
    </section>
  {:else if stage === "save"}
    <section class="card">
      <h2>Choisir une save</h2>
      <div class="grid">
        <button class="tile tile--new" on:click={handleCreateSave}>
          <strong>Nouvelle save</strong>
          <span>Créer une nouvelle partie</span>
        </button>
      </div>
      {#if loginError}
        <p class="error">{loginError}</p>
      {/if}
      <button class="primary" on:click={handleCreateSave} disabled={isLoading}>
        {isLoading ? "Création..." : "Créer une nouvelle save"}
      </button>
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
        <p><strong>Save :</strong> {selectedSave?.id ?? "N/A"}</p>
        <p><strong>Brainrot :</strong> {selectedBrainrot?.name ?? "N/A"} ({selectedBrainrot?.role ?? "N/A"})</p>
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
