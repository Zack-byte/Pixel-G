// Game configuration and state
export const config = {
  normalizedHeight: 1080,
  normalizedWidth: 1920,
  enemyWidth: 40,
  enemyOffset: 40,
  enemyMoveSpeed: 10,
  bulletSpeed: 15,
  movementSpeed: 5,
};

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
};
