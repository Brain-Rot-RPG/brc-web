<script>
  import { authStore } from "./lib/stores";
  import LoginForm from "./lib/components/LoginForm.svelte";
  import RegisterForm from "./lib/components/RegisterForm.svelte";
  import SaveSelector from "./lib/components/SaveSelector.svelte";
  import BrainrotSelector from "./lib/components/BrainrotSelector.svelte";
  import DungeonView from "./lib/components/DungeonView.svelte";
</script>

<main class="app">
  <header class="app__header">
    <h1 class="title">
      <span class="title__glow">BRAINROT CHRONICLES</span>
      <span class="title__sub">THE AURA FARMING EXPEDITION</span>
    </h1>
    <p class="app__subtitle">Aura farming intensifies.</p>
  </header>

  {#if $authStore.stage === "login"}
    <LoginForm />
  {:else if $authStore.stage === "register"}
    <RegisterForm />
  {:else if $authStore.stage === "save"}
    <SaveSelector />
  {:else if $authStore.stage === "brainrot"}
    <BrainrotSelector />
  {:else if $authStore.stage === "dungeon"}
    <DungeonView />
  {/if}
</main>
