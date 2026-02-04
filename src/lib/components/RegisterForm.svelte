<script>
  import logoUrl from "../../assets/BRC.png";
  import { authStore } from "../stores";
  import { registerUser, loginUser, getUserProfile } from "../api";

  let localError = "";

  const validateForm = () => {
    if (!$authStore.username.trim() || !$authStore.email.trim() || !$authStore.password.trim() || !$authStore.confirmPassword.trim()) {
      return "Please fill in all fields.";
    }

    if ($authStore.username.length < 3 || $authStore.username.length > 20) {
      return "Username must be between 3 and 20 characters.";
    }

    if (!/^[a-zA-Z0-9_]+$/.test($authStore.username)) {
      return "Username can only contain letters, numbers, and underscores.";
    }

    if ($authStore.password !== $authStore.confirmPassword) {
      return "Passwords do not match.";
    }

    if ($authStore.password.length < 12) {
      return "Password must be at least 12 characters long.";
    }

    return "";
  };

  const handleRegister = async () => {
    localError = validateForm();
    if (localError) return;

    authStore.update(store => ({ ...store, isLoading: true }));

    try {
      await registerUser($authStore.username, $authStore.email, $authStore.password);

      // Auto-login après enregistrement
      const loginData = await loginUser($authStore.username, $authStore.password);
      localStorage.setItem("accessToken", loginData.accessToken);
      localStorage.setItem("refreshToken", loginData.refreshToken);

      const profileData = await getUserProfile(loginData.accessToken);

      authStore.update(store => ({
        ...store,
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        userId: profileData.id,
        stage: "save",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        isLoading: false
      }));
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
        localError = err.message || "Server connection error.";
      authStore.update(store => ({ ...store, isLoading: false }));
    }
  };

  const handleBackToLogin = () => {
    authStore.update(store => ({ ...store, stage: "login" }));
  };

  $: localError = $authStore.loginError;
</script>

<section class="card">
  <div class="title-logo">
    <img src={logoUrl} alt="BRC" class="title-logo__image" />
  </div>
  <h2>Création de compte</h2>
    <h2>Create Account</h2>
  <div class="field">
    <label for="register-login">Login</label>
      <input
        id="register-login"
        type="text"
        bind:value={$authStore.username}
        placeholder="Choose a username (3-20 characters)"
        disabled={$authStore.isLoading}
      />
  </div>
  <div class="field">
    <label for="register-email">Email</label>
    <input
      id="register-email"
      type="email"
      bind:value={$authStore.email}
        placeholder="Your email"
      disabled={$authStore.isLoading}
    />
  </div>
  <div class="field">
    <label for="register-password">Mot de passe</label>
    <input
      id="register-password"
      type="password"
      bind:value={$authStore.password}
        placeholder="Your password (12+ characters)"
      disabled={$authStore.isLoading}
    />
  </div>
  <div class="field">
    <label for="confirm-password">Confirmer le mot de passe</label>
    <input
      id="confirm-password"
      type="password"
      bind:value={$authStore.confirmPassword}
        placeholder="Confirm password"
      disabled={$authStore.isLoading}
    />
  </div>
  {#if localError}
    <p class="error">{localError}</p>
  {/if}
  <button class="primary" on:click={handleRegister} disabled={$authStore.isLoading}>
      {$authStore.isLoading ? "Creating..." : "Create account"}
  </button>
  <button class="ghost" on:click={handleBackToLogin} disabled={$authStore.isLoading}>
      Back to login
  </button>
</section>
