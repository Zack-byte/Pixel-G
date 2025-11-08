import { gameState, config } from "./config.js";
import { playAudio } from "./audio.js";
import { checkPlayerOverlap } from "./enemy.js";

// Player state
export let playerX = 0;
export let playerY = 0;
export let playerRotation = 0;
export const keysPressed = {};

export function spawnPlayer(isPlayerControlled = true, playerId) {
  const gameArea = document.getElementById("root");
  const player = document.createElement("div");
  const bounds = gameArea.getBoundingClientRect();

  player.id = playerId;
  player.className = "player";
  player.style.width = 40 * gameState.scaleWidth + "px";
  player.style.height = 40 * gameState.scaleHeight + "px";

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

  // Keyboard movement
  if (keysPressed["w"]) playerY -= config.movementSpeed * gameState.scaleHeight;
  if (keysPressed["s"]) playerY += config.movementSpeed * gameState.scaleHeight;
  if (keysPressed["a"]) playerX -= config.movementSpeed * gameState.scaleWidth;
  if (keysPressed["d"]) playerX += config.movementSpeed * gameState.scaleWidth;

  // Mouse movement
  if (gameState.isMouseDown && gameState.lastMousePosition) {
    const dx = gameState.globalMousePos.x - gameState.lastMousePosition.x;
    const dy = gameState.globalMousePos.y - gameState.lastMousePosition.y;
    playerX += dx;
    playerY += dy;
  }

  // Boundary checking
  const gameArea = document.getElementById("root");
  const bounds = gameArea.getBoundingClientRect();
  playerX = Math.max(0, Math.min(bounds.width - 40, playerX));
  playerY = Math.max(0, Math.min(bounds.height - 40, playerY));
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
