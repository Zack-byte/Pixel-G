// Game configuration and state
export const config = {
  normalizedHeight: 1080,
  normalizedWidth: 1920,
  enemyWidth: 40,
  enemyOffset: 40,
  enemyMoveSpeed: 2,
  bulletSpeed: 15,
  movementSpeed: 12,
  // Environment variables with fallbacks
  serverHost: import.meta.env.VITE_SERVER_HOST || "localhost",
  serverPort: import.meta.env.VITE_SERVER_PORT || 8080,
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  wsUrl: import.meta.env.VITE_WS_URL || "ws://localhost:3000",
  defaultVolume: parseInt(import.meta.env.VITE_DEFAULT_VOLUME) || 100,
  defaultEnemySpeed: parseInt(import.meta.env.VITE_DEFAULT_ENEMY_SPEED) || 10,
  defaultPlayerSpeed: parseInt(import.meta.env.VITE_DEFAULT_PLAYER_SPEED) || 8,
  enableClouds: import.meta.env.VITE_ENABLE_CLOUDS !== "false",
  defaultTheme: import.meta.env.VITE_DEFAULT_THEME || "light",
  enableMultiplayer: import.meta.env.VITE_ENABLE_MULTIPLAYER !== "false",
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === "true",
};

// Ship configuration
export const ships = [
  {
    id: "player-ship",
    name: "Player Ship",
    image: "/sprites/player-ship.png",
  },
  {
    id: "player-ship-2",
    name: "Player Ship 2",
    image: "/sprites/player-ship-2.png",
  },
  {
    id: "player-ship-3",
    name: "Player Ship 3",
    image: "/sprites/player-ship-3.png",
  },
  {
    id: "player-ship-4",
    name: "Player Ship 4",
    image: "/sprites/player-ship-4.png",
  },
  {
    id: "player-ship-5",
    name: "Player Ship 5",
    image: "/sprites/player-ship-5.png",
  },
];

// Core game state
export const gameState = {
  paused: false,
  gameStarted: false,
  betweenRounds: false,
  isMultiplayer: false,
  isMouseDown: false,
  lastMousePosition: null,
  globalMousePos: { x: 0, y: 0 },
  enemyCodex: null,
  midPointY: 0,
  midPointX: 0,
  scaleWidth: 0,
  scaleHeight: 0,
  roundNumber: 1,
  score: 0,
  enemyNumber: 1,
  activeEnemies: [],
  remainingEnemies: 0,
  playerHealth: 100,
  playerShotsFired: 0,
  cloudsEnabled: true,
  selectedShipIndex: 0,
  // Firing state
  isFiring: false,
  fireInterval: null,
};
