import { gameState, config } from "./config.js";
import { playerHit } from "./player.js";
import { playAudio } from "./audio.js";
import { endRound } from "./gameLoop.js";

export function spawnEnemy(index, row, type) {
  const gameArea = document.getElementById("root");
  const bounds = gameArea.getBoundingClientRect();
  const padding =
    (bounds.width - (config.enemyWidth * 5 + config.enemyOffset * 4)) / 2;
  let enemy = document.createElement("div");
  const id = `Enemy${gameState.enemyNumber}`;
  const left = padding + index * 5 + index * config.enemyOffset;
  const top = row * -45;

  enemy.id = id;
  enemy.className = "enemy-ship";
  enemy.style.left = left + "px";
  enemy.style.top = top + "px";

  gameState.enemyNumber += 1;
  gameState.activeEnemies.push({
    id: id,
    top: top,
    left: left,
    bottom: top + 40,
    right: left + 40,
    score: 100,
  });

  gameArea.append(enemy);
  const moveInterval = setInterval(
    () => enemyMoveBasic(enemy, moveInterval, bounds, id),
    500
  );
}

export function enemyMoveBasic(enemy, interval, bounds, id) {
  try {
    const top = parseFloat(getComputedStyle(enemy).top);
    const bottom = bounds.height;

    if (top >= bottom) {
      clearInterval(interval);
      enemy.remove();
      gameState.remainingEnemies -= 1;
    } else if (!gameState.paused) {
      const index = gameState.activeEnemies.findIndex((item) => item.id === id);
      gameState.activeEnemies[index].top = top;
      gameState.activeEnemies[index].bottom = top + 40;
      enemy.style.top = top + config.enemyMoveSpeed + "px";
    }
  } catch {
    clearInterval(interval);
  }
}

// Check if player overlaps with any enemies
export function checkPlayerOverlap(player) {
  const toRemove = [];
  const p = player.getBoundingClientRect();
  gameState.activeEnemies.forEach((e) => {
    if (isOverlapping(p, e)) {
      toRemove.push(e.id);
      gameState.remainingEnemies -= 1;
    }
  });

  if (toRemove.length > 0) {
    const dead = playerHit(25);
    if (dead) {
      window.gameOver();
    }
    removeEnemies(toRemove);

    if (gameState.remainingEnemies === 0 && !gameState.betweenRounds) {
      gameState.betweenRounds = true;
      endRound();
    }
  }
}

function isOverlapping(rect1, rect2) {
  return (
    ((rect2.left <= rect1.left && rect1.left <= rect2.right) ||
      (rect2.left <= rect1.right && rect1.right <= rect2.right)) &&
    ((rect2.top <= rect1.bottom && rect1.bottom <= rect2.bottom) ||
      (rect2.top <= rect1.top && rect1.top <= rect2.bottom))
  );
}

export function removeEnemies(enemyIds) {
  gameState.activeEnemies = gameState.activeEnemies.filter(
    (enemy) => !enemyIds.includes(enemy.id)
  );

  enemyIds.forEach((id) => {
    const enemy = document.getElementById(id);
    if (enemy) enemy.remove();
  });
}

export function removeAllEnemies() {
  // Remove enemy elements from DOM
  gameState.activeEnemies.forEach((enemy) => {
    const element = document.getElementById(enemy.id);
    if (element) element.remove();
  });
  // Clear the activeEnemies array
  gameState.activeEnemies = [];
  gameState.remainingEnemies = 0;
}
