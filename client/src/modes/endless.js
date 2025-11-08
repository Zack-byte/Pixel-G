import { gameState } from "../core/modules/config.js";
import {
  hideMainMenu,
  updateScore,
  hideMultiPlayerMenu,
  showRoundBanner,
  hideRoundBanner,
} from "../core/modules/ui.js";
import { spawnPlayer, updateHealthUI } from "../core/modules/player.js";
import { attachGameControls } from "../core/modules/input.js";

export function play() {
  // Reset game state
  gameState.roundNumber = 1;
  gameState.score = 0;
  gameState.enemyNumber = 1;
  gameState.activeEnemies = [];
  gameState.remainingEnemies = 0;
  gameState.playerHealth = 100;
  gameState.betweenRounds = false;
  gameState.isMultiplayer = false;
  hideMainMenu();
  hideMultiPlayerMenu();
  attachGameControls();
  spawnPlayer(true, "player");

  // Show game UI first
  document.getElementById("gameUI").classList.add("visible");

  // Update score and health display
  const scoreLabel = document.getElementById("score");
  scoreLabel.textContent = "Score: 0";
  updateHealthUI();

  initiateGameLoop();
}

function initiateGameLoop() {
  gameState.paused = false;
  gameState.gameStarted = true;
  gameState.remainingEnemies = getRoundEnemyCount(gameState.roundNumber);
  showRoundBanner(`Round ${gameState.roundNumber}`);

  setTimeout(() => {
    spawnWave();
    hideRoundBanner();
  }, 5000);
}

function getRoundEnemyCount(roundNumber) {
  const baseEnemyCount = 5;
  return baseEnemyCount + roundNumber * 2;
}

function spawnWave() {
  gameState.betweenRounds = false;
  const gameArea = document.getElementById("root");
  const bounds = gameArea.getBoundingClientRect();
  const baseEnemyCount = getRoundEnemyCount(gameState.roundNumber);

  let enemiesSpawned = 0;
  const spawnInterval = setInterval(() => {
    if (enemiesSpawned >= baseEnemyCount || gameState.paused) {
      clearInterval(spawnInterval);
      return;
    }

    const spawnPos = getRandomSpawnPosition(bounds);
    spawnEnemy(spawnPos.left, spawnPos.top, spawnPos.spawnSide);
    enemiesSpawned++;
  }, 500);

  if (baseEnemyCount === 0) {
    gameState.betweenRounds = true;
    endRound();
  }
}

function getRandomSpawnPosition(bounds) {
  const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  const offset = 100; // Increased offset to ensure enemies start fully off-screen
  let left, top;
  const enemyWidth = 40; // Use constant or import from config if needed

  switch (side) {
    case 0: // top
      left = Math.random() * (bounds.width - enemyWidth);
      top = -enemyWidth - offset;
      break;
    case 1: // right
      left = bounds.width + offset;
      top = Math.random() * (bounds.height - enemyWidth);
      break;
    case 2: // bottom
      left = Math.random() * (bounds.width - enemyWidth);
      top = bounds.height + offset;
      break;
    case 3: // left
      left = -enemyWidth - offset;
      top = Math.random() * (bounds.height - enemyWidth);
      break;
  }
  return { left, top, spawnSide: side };
}

function spawnEnemy(left, top, spawnSide) {
  const gameArea = document.getElementById("root");
  const bounds = gameArea.getBoundingClientRect();
  let enemy = document.createElement("div");
  const id = `Enemy${enemyNumber}`;

  enemy.id = id;
  enemy.className = "enemy-ship";
  enemy.style.left = left + "px";
  enemy.style.top = top + "px";

  // Apply proper initial rotation based on spawn side
  let rotation = 0;
  switch (spawnSide) {
    case 0:
      rotation = 180;
      break; // top
    case 1:
      rotation = -90;
      break; // right
    case 2:
      rotation = 0;
      break; // bottom
    case 3:
      rotation = 90;
      break; // left
  }
  enemy.style.transform = `rotate(${rotation}deg)`;

  enemyNumber++;

  activeEnemies.push({
    id: id,
    top: parseFloat(top),
    left: parseFloat(left),
    bottom: parseFloat(top) + enemyWidth,
    right: parseFloat(left) + enemyWidth,
    score: 100 * roundNumber,
    movementType: "chase",
  });

  gameArea.append(enemy);

  const moveInterval = setInterval(
    () => enemyMove(enemy, moveInterval, bounds, id),
    16
  );
}

function enemyMove(enemy, interval, bounds, id) {
  try {
    if (!enemy) {
      clearInterval(interval);
      return;
    }

    const currentLeft = parseFloat(enemy.style.left);
    const currentTop = parseFloat(enemy.style.top);

    // Check if enemy is way out of bounds
    if (
      currentLeft < -200 ||
      currentLeft > bounds.width + 200 ||
      currentTop < -200 ||
      currentTop > bounds.height + 200
    ) {
      clearInterval(interval);
      enemy.remove();
      const index = activeEnemies.findIndex((e) => e.id === id);
      if (index !== -1) {
        activeEnemies.splice(index, 1);
      }
      remainingEnemies--;

      if (remainingEnemies <= 0 && !betweenRounds) {
        betweenRounds = true;
        endRound();
      }
      return;
    }

    if (!paused) {
      const index = activeEnemies.findIndex((item) => item.id === id);
      if (index === -1) return;

      const enemyData = activeEnemies[index];
      const speedMultiplier = 1 + (roundNumber - 1) * 0.2;

      const dx = playerX - currentLeft;
      const dy = playerY - currentTop;
      const distance = Math.hypot(dx, dy);

      const speed = enemyMoveSpeed * speedMultiplier;
      const newLeft = currentLeft + (dx / distance) * speed;
      const newTop = currentTop + (dy / distance) * speed;

      const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

      enemy.style.transition = "transform 0.2s ease-out";
      enemy.style.left = newLeft + "px";
      enemy.style.top = newTop + "px";
      enemy.style.transform = `rotate(${rotation}deg)`;

      enemyData.top = newTop;
      enemyData.left = newLeft;
      enemyData.bottom = newTop + enemyWidth;
      enemyData.right = newLeft + enemyWidth;
    }
  } catch (error) {
    console.error("Error in enemyMove:", error);
    clearInterval(interval);
  }
}

function restart() {
  // Clean up existing game state
  removeActiveEnemies();
  removePlayer();
  removeGameControls();

  // Clear any existing intervals and timeouts
  const highestId = window.setTimeout(() => {}, 0);
  for (let i = highestId; i >= 0; i--) {
    window.clearInterval(i);
    window.clearTimeout(i);
  }

  // Reset game variables
  score = 0;
  roundNumber = 1;
  enemyNumber = 1;
  activeEnemies = [];
  remainingEnemies = 0;
  playerHealth = 100;
  paused = false;
  gameStarted = true;
  betweenRounds = false;

  // Update UI
  updateHealthUI();
  removeGameOverMenu();
  document.getElementById("gameUI").classList.add("visible");
  const scoreLabel = document.getElementById("score");
  scoreLabel.textContent = "Score: 0";

  // Spawn player with controls
  spawnPlayer(true, "player");
  attachGameControls();

  // Start fresh game loop with round banner
  showRoundBanner(`Round ${roundNumber}`);
  setTimeout(() => {
    hideRoundBanner();
    spawnWave();
  }, 5000);
}

// Export functions that need to be accessible from other files
window.play = play;
window.gameOver = gameOver;
window.restart = restart;
window.updateScore = updateScore;
