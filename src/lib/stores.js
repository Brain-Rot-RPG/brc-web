import { writable } from 'svelte/store';

// État de l'authentification
export const authStore = writable({
  stage: 'login', // login | register | save | brainrot | dungeon
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  loginError: '',
  isLoading: false,
  userId: null,
  accessToken: null,
  refreshToken: null
});

// État du jeu
export const gameStore = writable({
  selectedSave: null,
  brainrotChoices: [],
  selectedBrainrot: null,
  currentDungeon: null,
  pathCount: 1,
  lastChoice: ''
});

// Reset complet de l'état
export const resetStores = () => {
  authStore.set({
    stage: 'login',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    loginError: '',
    isLoading: false,
    userId: null,
    accessToken: null,
    refreshToken: null
  });

  gameStore.set({
    selectedSave: null,
    brainrotChoices: [],
    selectedBrainrot: null,
    currentDungeon: null,
    pathCount: 1,
    lastChoice: ''
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
