// Récupère un player par son id
export const fetchPlayerById = async (playerId) => {
  const response = await fetch(`${API_URL}/api/v1/player/${playerId}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du joueur.");
  }
  return response.json();
};

// Récupère un brainrot par son id
export const fetchBrainrotById = async (brainrotId) => {
  const response = await fetch(`${API_URL}/api/v1/brainrot/${brainrotId}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du brainrot.");
  }
  return response.json();
};
// Récupère un item par son id
export const fetchItemById = async (itemId) => {
  const response = await fetch(`${API_URL}/api/v1/item/${itemId}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération de l'item.");
  }
  return response.json();
};
// Ajoute un item à l'inventaire d'un player
export const addItemToInventory = async (playerId, itemId) => {
  const response = await fetch(`${API_URL}/api/v1/player/${playerId}/inventory`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de l'ajout de l'item à l'inventaire.");
  }

  return response.json();
};
// Récupère un donjon par son id
export const fetchDungeonById = async (dungeonId) => {
  const response = await fetch(`${API_URL}/api/v1/dungeon/${dungeonId}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du donjon.");
  }
  return response.json();
};
// Met à jour une save existante
export const updateSave = async (saveId, savePayload, accessToken) => {
  const response = await fetch(`${API_URL}/api/v1/save/${saveId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(savePayload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la mise à jour de la sauvegarde.");
  }

  return response.json();
};
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Utilitaires
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const pickRandomBrainrots = (brainrots) => {
  const shuffled = [...brainrots].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

// Fonctions d'authentification
export const loginUser = async (username, password) => {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la connexion.");
  }

  return response.json();
};

export const registerUser = async (username, email, password) => {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
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
    throw new Error(error.message || "Erreur lors de la création du compte.");
  }

  return response.json();
};

export const getUserProfile = async (accessToken) => {
  const response = await fetch(`${API_URL}/api/v1/auth/users/me`, {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du profil.");
  }

  return response.json();
};

// Fonctions pour les brainrots
export const fetchBrainrots = async () => {
  const response = await fetch(`${API_URL}/api/v1/brainrot`, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des brainrots.");
  }

  const brainrots = await response.json();
  if (!Array.isArray(brainrots) || brainrots.length === 0) {
    throw new Error("Aucun brainrot disponible.");
  }

  return brainrots;
};

// Fonctions pour les joueurs
export const createPlayer = async (playerData) => {
  const response = await fetch(`${API_URL}/api/v1/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(playerData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la création du joueur.");
  }

  return response.json();
};

// Fonctions pour les donjons
export const createDungeon = async (difficulty, size) => {
  const response = await fetch(`${API_URL}/api/v1/dungeon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ difficulty, size })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la création du donjon.");
  }

  return response.json();
};

// Fonctions pour les sauvegardes
export const fetchAllSaves = async () => {
  const response = await fetch(`${API_URL}/api/v1/save`, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des sauvegardes.");
  }

  const saves = await response.json();
  if (!Array.isArray(saves)) {
    throw new Error("Format de réponse invalide pour les sauvegardes.");
  }

  return saves;
};

export const createSave = async (savePayload, accessToken) => {
  const response = await fetch(`${API_URL}/api/v1/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(savePayload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la création de la sauvegarde.");
  }

  return response.json();
};
