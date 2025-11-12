import { gameState } from "./config.js";
import { spawnEnemy } from "./enemy.js";
import { showRoundBanner, hideRoundBanner } from "./ui.js";
import { playAudio } from "./audio.js";

export function initiateGameLoop() {
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
  const matrix = gameState.enemyCodex[roundNumber]["enemyLayout"];
  let totalEnemies = 0;
  matrix.forEach((dimension) => (totalEnemies += dimension.length));
  return totalEnemies;
}

function spawnWave() {
  gameState.betweenRounds = false;
  const enemyMap = gameState.enemyCodex[gameState.roundNumber]["enemyLayout"];

  for (let r = 0; r < enemyMap.length; r++) {
    for (let i = 0; i < enemyMap[r].length; i++) {
      spawnEnemy(i, r, enemyMap[r][i]);
    }
  }
}

export function endRound() {
  showRoundBanner("Cleared");
  setTimeout(() => {
    gameState.roundNumber += 1;
    gameState.remainingEnemies = getRoundEnemyCount(gameState.roundNumber);
    showRoundBanner(`Round: ${gameState.roundNumber}`);
    setTimeout(() => {
      hideRoundBanner();
      spawnWave();
    }, 5000);
  }, 2000);
}

export function loadCodex() {
  fetch("../assets/data/enemy-layout.json")
    .then((result) => result.json())
    .then((result) => {
      gameState.enemyCodex = result;
    });
}
