import { gameState, config } from "./config.js";
import { playAudio } from "./audio.js";
import { endRound } from "./gameLoop.js";
import { playerX, playerY, playerRotation } from "./player.js";

export function fire(isPlayer) {
  const gameArea = document.getElementById("root");
  const bullet = document.createElement("div");
  const bulletNumber = `playerbullet${gameState.playerShotsFired}`;

  bullet.id = bulletNumber;
  bullet.className = isPlayer ? "player-bullet" : "enemy-bullet";
  bullet.style.width = 3 * gameState.scaleWidth + "px";
  bullet.style.height = 20 * gameState.scaleHeight + "px";

  if (isPlayer) {
    if (gameState.isMultiplayer) {
      window.sendFireEvent();
    }
    setupPlayerBullet(bullet);
  } else {
    setupEnemyBullet(bullet);
  }

  gameState.playerShotsFired += 1;
  playAudio("shot");
  gameArea.append(bullet);
  const interval = setInterval(
    () => bulletMove(bullet, interval, isPlayer),
    16
  );
}

function setupPlayerBullet(bullet) {
  const player = document.getElementById("player");
  const playerRect = player.getBoundingClientRect();

  const transform = getComputedStyle(player).transform;
  const matrix = new DOMMatrix(transform);
  const angle = Math.atan2(matrix.b, matrix.a);

  const centerX = playerX + playerRect.width / 2;
  const centerY = playerY + playerRect.height / 2;
  const spawnDistance = playerRect.height / 2;

  const spawnX =
    centerX - bullet.offsetWidth / 2 + Math.sin(angle) * spawnDistance;
  const spawnY =
    centerY - bullet.offsetHeight / 2 - Math.cos(angle) * spawnDistance;

  bullet.style.top = spawnY + "px";
  bullet.style.left = spawnX + "px";
  bullet.style.transform = `rotate(${angle}rad)`;

  bullet.dataset.velocityX = String(Math.sin(angle) * config.bulletSpeed);
  bullet.dataset.velocityY = String(-Math.cos(angle) * config.bulletSpeed);
}

function setupEnemyBullet(bullet) {
  const top = window.innerHeight - opponentY * gameState.scaleHeight + "px";
  const left = window.innerWidth - opponentX * gameState.scaleWidth + "px";
  bullet.style.top = top;
  bullet.style.left = left;
}

export function bulletMove(bullet, interval, isPlayer) {
  if (!gameState.paused) {
    if (isPlayer) {
      movePlayerBullet(bullet, interval);
    } else {
      moveEnemyBullet(bullet, interval);
    }
  }
}

function movePlayerBullet(bullet, interval) {
  const top = parseFloat(getComputedStyle(bullet).top);
  const left = parseFloat(getComputedStyle(bullet).left);
  const velocityX = parseFloat(bullet.dataset.velocityX);
  const velocityY = parseFloat(bullet.dataset.velocityY);

  const newTop = top + velocityY * gameState.scaleHeight;
  const newLeft = left + velocityX * gameState.scaleWidth;

  if (isOutOfBounds(newTop, newLeft)) {
    bullet.remove();
    clearInterval(interval);
    return;
  }

  bullet.style.top = newTop + "px";
  bullet.style.left = newLeft + "px";
  checkBulletOverlap(bullet);
}

function moveEnemyBullet(bullet, interval) {
  const top = parseFloat(getComputedStyle(bullet).top);
  if (top >= config.normalizedHeight * gameState.scaleHeight) {
    bullet.remove();
    clearInterval(interval);
    return;
  }
  bullet.style.top = top + config.bulletSpeed * gameState.scaleHeight + "px";
  checkBulletOverlap(bullet);
}

function isOutOfBounds(top, left) {
  return (
    top < 0 || top > window.innerHeight || left < 0 || left > window.innerWidth
  );
}

export function checkBulletOverlap(bullet) {
  const b = bullet.getBoundingClientRect();
  if (!gameState.isMultiplayer) {
    checkEnemyOverlap(b, bullet);
  }
}

function checkEnemyOverlap(b, bullet) {
  const toRemove = [];
  gameState.activeEnemies.forEach((e) => {
    if (isOverlapping(b, e)) {
      updateScore(e.score);
      toRemove.push(e.id);
      gameState.remainingEnemies -= 1;
      bullet.remove();
      playAudio("explosion");
    }
  });

  gameState.activeEnemies = gameState.activeEnemies.filter(
    (enemy) => !toRemove.includes(enemy.id)
  );

  toRemove.forEach((id) => {
    const enemy = document.getElementById(id);
    if (enemy) enemy.remove();
  });

  if (gameState.remainingEnemies === 0 && !gameState.betweenRounds) {
    gameState.betweenRounds = true;
    endRound();
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
