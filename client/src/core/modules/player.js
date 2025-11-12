import { gameState, config, ships } from "./config.js";
import { playAudio } from "./audio.js";
import { checkPlayerOverlap } from "./enemy.js";

// Player state
export let playerX = 0;
export let playerY = 0;
export let playerRotation = 0;
export const keysPressed = {};

// Velocity for inertia
let playerVelocityX = 0;
let playerVelocityY = 0;
const friction = 0.85; // How quickly the player slows down (0 = instant stop, 1 = no friction)
const acceleration = 0.8; // How quickly the player accelerates

export function spawnPlayer(isPlayerControlled = true, playerId) {
  const gameArea = document.getElementById("root");
  const player = document.createElement("div");
  const bounds = gameArea.getBoundingClientRect();

  player.id = playerId;
  player.className = "player";
  // Use viewport-based sizing to match loading screen (8vw, max 100px)
  const baseVwSize = isPlayerControlled ? 8 : 10; // Player 2 gets 10vw for larger size
  const maxSize = isPlayerControlled ? 100 : 125; // Player 2 gets larger max size
  const viewportSize = Math.min(window.innerWidth * (baseVwSize / 100), maxSize);

  player.style.width = viewportSize + "px";
  player.style.height = viewportSize + "px";

  // Set the background image to the selected ship
  // Use different ships for player 1 vs player 2
  const shipIndex = isPlayerControlled ? gameState.selectedShipIndex : 1;
  const selectedShip = ships[shipIndex];
  player.style.backgroundImage = `url('${selectedShip.image}')`;
  player.style.backgroundSize = "100% 100%";
  player.style.backgroundPosition = "center center";
  player.style.backgroundRepeat = "no-repeat";

  if (isPlayerControlled) {
    playerX = bounds.width / 2;
    playerY = bounds.height - 50;
  }

  gameArea.appendChild(player);
  updatePlayerPosition(isPlayerControlled, playerId);
}

export function updatePlayerPosition(isPlayerControlled, playerId) {
  if (!gameState.paused) {
    handlePlayerMovement(isPlayerControlled);
    updatePlayerVisuals(playerId, isPlayerControlled);
    checkPlayerOverlap(document.getElementById(playerId));
  }

  requestAnimationFrame(() =>
    updatePlayerPosition(isPlayerControlled, playerId)
  );
}

export function getPlayerPosition() {
  const player = document.getElementById("player");
  if (!player) return null;
  return { x: playerX, y: playerY };
}

export function updatePlayerFace() {
  const player = document.getElementById("player");
  if (!player) return;

  const playerRect = player.getBoundingClientRect();
  const playerCenterX = playerRect.left + playerRect.width / 2;
  const playerCenterY = playerRect.top + playerRect.height / 2;

  const angleRad = Math.atan2(
    gameState.globalMousePos.y - playerCenterY,
    gameState.globalMousePos.x - playerCenterX
  );
  playerRotation = (angleRad * 180) / Math.PI + 90;
}

function handlePlayerMovement(isPlayerControlled) {
  if (!isPlayerControlled) return;

  // Calculate target velocity based on input
  let targetVelocityX = 0;
  let targetVelocityY = 0;

  // Keyboard movement - apply acceleration toward target velocity
  if (keysPressed["w"]) targetVelocityY = -config.movementSpeed * gameState.scaleHeight;
  if (keysPressed["s"]) targetVelocityY = config.movementSpeed * gameState.scaleHeight;
  if (keysPressed["a"]) targetVelocityX = -config.movementSpeed * gameState.scaleWidth;
  if (keysPressed["d"]) targetVelocityX = config.movementSpeed * gameState.scaleWidth;

  // Apply acceleration toward target velocity
  playerVelocityX += (targetVelocityX - playerVelocityX) * acceleration;
  playerVelocityY += (targetVelocityY - playerVelocityY) * acceleration;

  // Apply friction when no input is pressed
  if (targetVelocityX === 0) playerVelocityX *= friction;
  if (targetVelocityY === 0) playerVelocityY *= friction;

  // Mouse movement (instant, no inertia for precision)
  if (gameState.isMouseDown && gameState.lastMousePosition) {
    const dx = gameState.globalMousePos.x - gameState.lastMousePosition.x;
    const dy = gameState.globalMousePos.y - gameState.lastMousePosition.y;
    playerX += dx;
    playerY += dy;
  }

  // Apply velocity to position
  playerX += playerVelocityX;
  playerY += playerVelocityY;

  // Boundary checking - use viewport-based size for player 1 (controlled player)
  const gameArea = document.getElementById("root");
  const bounds = gameArea.getBoundingClientRect();
  const playerSize = Math.min(window.innerWidth * 0.08, 100); // 8vw max 100px like loading screen

  // Stop velocity if hitting boundaries
  if (playerX < 0) {
    playerX = 0;
    playerVelocityX = 0;
  } else if (playerX > bounds.width - playerSize) {
    playerX = bounds.width - playerSize;
    playerVelocityX = 0;
  }

  if (playerY < 0) {
    playerY = 0;
    playerVelocityY = 0;
  } else if (playerY > bounds.height - playerSize) {
    playerY = bounds.height - playerSize;
    playerVelocityY = 0;
  }
}

export function playerHit(hitNumber) {
  gameState.playerHealth -= hitNumber;
  updateHealthUI();
  return gameState.playerHealth <= 0;
}

export function updateHealthUI() {
  let health = document.getElementById("HealthBar");
  health.value = gameState.playerHealth;
}

function updatePlayerVisuals(playerId, isPlayerControlled) {
  const player = document.getElementById(playerId);
  if (!player) return;

  let top = "";
  let left = "";
  let rotation = 0;

  if (isPlayerControlled) {
    top = playerY + "px";
    left = playerX + "px";
    rotation = playerRotation;
  } else {
    top = window.innerHeight - opponentY * gameState.scaleHeight + "px";
    left = window.innerWidth - opponentX * gameState.scaleWidth + "px";
    rotation = opponentRotation + 180;
  }

  player.style.top = top;
  player.style.left = left;
  player.style.transform = `rotate(${rotation}deg)`;
}
