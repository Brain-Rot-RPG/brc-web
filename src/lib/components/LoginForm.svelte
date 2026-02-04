<script>
  import logoUrl from "../../assets/BRC.png";
  import { authStore } from "../stores";
  import { loginUser, getUserProfile } from "../api";

  let localError = "";

  const handleLogin = async () => {
    localError = "";
    
    authStore.update(store => {
      if (!store.username.trim() || !store.password.trim()) {
        localError = "Please enter a username and password.";
        return store;
      }
      return store;
    });

    if (localError) return;

    authStore.update(store => ({ ...store, isLoading: true }));

    try {
      const data = await loginUser($authStore.username, $authStore.password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      const profileData = await getUserProfile(data.accessToken);

      authStore.update(store => ({
        ...store,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: profileData.id,
        stage: "save",
        username: "",
        password: "",
        isLoading: false
      }));
    } catch (err) {
      console.error("Login error:", err);
      authStore.update(store => ({
        ...store,
        loginError: err.message || "Server connection error.",
        isLoading: false
      }));
    }
  };

  const handleRegisterClick = () => {
    authStore.update(store => ({ ...store, stage: "register" }));
  };

  $: localError = $authStore.loginError;
</script>

<section class="card">
  <div class="title-logo">
    <img src={logoUrl} alt="BRC" class="title-logo__image" />
  </div>
  <h2>Login</h2>
  <div class="field">
    <label for="login">Username</label>
    <input
      id="login"
      type="text"
      bind:value={$authStore.username}
      placeholder="Your username"
      disabled={$authStore.isLoading}
    />
  </div>
  <div class="field">
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      bind:value={$authStore.password}
      placeholder="Your password"
      disabled={$authStore.isLoading}
    />
  </div>
  {#if localError}
    <p class="error">{localError}</p>
  {/if}
  <button class="primary" on:click={handleLogin} disabled={$authStore.isLoading}>
    {$authStore.isLoading ? "Logging in..." : "Login"}
  </button>
  <button class="ghost" on:click={handleRegisterClick} disabled={$authStore.isLoading}>
    Create account
  </button>
</section>
