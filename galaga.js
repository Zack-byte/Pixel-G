var paused = false;
var gameStarted = false;
var betweenRounds = false;
var enemyCodex;

document.addEventListener("DOMContentLoaded", () => {
  spawnClouds();
  loadCodex();
});

function loadCodex() {
  fetch("./enemy-layout.json")
    .then((result) => result.json())
    .then((result) => {
      this.enemyCodex = result;
    });
}

function spawnClouds() {
  const rootElement = document.getElementById("root");

  function createCloud() {
    if (!paused) {
      const cloud = document.createElement("div");
      cloud.classList.add("cloud");
      const randomLeft = Math.random() * rootElement.offsetWidth;
      cloud.style.left = randomLeft + "px";
      rootElement.appendChild(cloud);

      let topPosition = 0;

      const moveCloud = () => {
        if (!paused) {
          topPosition += 1;
          cloud.style.top = topPosition + "px";
        }

        if (topPosition < window.innerHeight) {
          requestAnimationFrame(moveCloud);
        } else {
          cloud.remove();
        }
      };

      requestAnimationFrame(moveCloud);
    }
  }

  setInterval(createCloud, 1000); // Create a new cloud every 3 seconds
}

var playerX = 0;
var playerY = 0;
const movementSpeed = 5;
const keysPressed = {};

var playerShotsFired = 0;
let bulletSpeed = 10;

function play() {
  const mainMenu = document.getElementById("mainMenu");
  mainMenu.style.display = "none";

  spawnPlayer();
  initiateGameLoop();
}

function spawnPlayer() {
  const gameArea = document.getElementById("root");
  const player = document.createElement("div");
  const bounds = gameArea.getBoundingClientRect();

  player.id = "player";
  player.className = "player";
  playerX = bounds.width / 2;
  playerY = bounds.height - 50;

  gameArea.appendChild(player);

  // Start the continuous update loop
  updatePlayerPosition(); // To track which keys are pressed
  document.addEventListener("keydown", (event) => {
    keysPressed[event.key.toLowerCase()] = true;

    if (!paused) {
      if (event.code === "Space") {
        fire();
      }
    }
    if (event.key === "p" && gameStarted) {
      togglePause();
    }
  });

  document.addEventListener("keyup", (event) => {
    keysPressed[event.key.toLowerCase()] = false;
  });
}

function updatePlayerPosition() {
  if (!paused) {
    if (keysPressed["w"]) {
      playerY -= movementSpeed;
    }
    if (keysPressed["s"]) {
      playerY += movementSpeed;
    }
    if (keysPressed["a"]) {
      playerX -= movementSpeed;
    }
    if (keysPressed["d"]) {
      playerX += movementSpeed;
    }

    const player = document.getElementById("player");

    player.style.top = playerY + "px";
    player.style.left = playerX + "px";
  }

  requestAnimationFrame(updatePlayerPosition);
}

function fire() {
  const gameArea = document.getElementById("root");
  const bullet = document.createElement("div");
  const bulletNumber = `playerbullet${playerShotsFired}`;

  bullet.id = bulletNumber;
  bullet.className = "player-bullet";
  bullet.style.top = playerY + "px";
  bullet.style.left = playerX + "px";

  playerShotsFired += 1;

  gameArea.append(bullet);
  const interval = setInterval(() => bulletMove(bullet, interval), 10);
}

function bulletMove(bullet, interval) {
  const top = getComputedStyle(bullet).top;
  const bulletTop = parseFloat(top);

  if (bulletTop <= 0) {
    bullet.remove();
    clearInterval(interval);
    return;
  } else if (!paused) {
    bullet.style.top = bulletTop - bulletSpeed + "px";
    checkBulletOverlap(bullet);
  }
}

// This is the Start of the game play loop
var roundNumber = 1;
var score = 0;
var enemyNumber = 1;
var activeEnemies = [];
var remainingEnemies = 0;
var enemyWidth = 40;
var enemyOffset = 40;
var enemyMoveSpeed = 10;

function initiateGameLoop() {
  gameStarted = true;
  remainingEnemies = getRoundEnemyCount(roundNumber);
  showRoundBanner(`Round ${roundNumber}`);

  setTimeout(() => {
    spawnWave();
    hideRoundBanner();
  }, 5000);
}

function getRoundEnemyCount(roundNumber) {
  const matrix = enemyCodex[roundNumber]['enemyLayout'];
  let totalEnemies = 0;
  matrix.forEach((dimension) => (totalEnemies += dimension.length));
  return totalEnemies;
}

function hideRoundBanner() {
  const roundBanner = document.getElementById("roundBanner");

  roundBanner.style.display = "none";
}

function showRoundBanner(text) {
  const roundBanner = document.getElementById("roundBanner");
  const roundText = document.getElementById("roundText");

  roundText.textContent = text;
  roundBanner.style.display = "flex";
}

function spawnWave() {
  betweenRounds = false;
  const enemyMap = enemyCodex[roundNumber]['enemyLayout'];

  for (let r = 0; r < enemyMap.length; r++) {
    for (let i = 0; i < enemyMap[r].length; i++) {
      spawnEnemy(i, r, enemyMap[r][i]);
    }
  }
}

function spawnEnemy(index, row, type) {
  const gameArea = document.getElementById("root");
  const bounds = gameArea.getBoundingClientRect();
  const padding = (bounds.width - (enemyWidth * 5 + enemyOffset * 4)) / 2;
  let enemy = document.createElement("div");
  const id = `Enemy${enemyNumber}`;
  const left = padding + index * 5 + index * enemyOffset;

  const top = row * (-45);

  enemy.id = id;
  enemy.className = "enemy-ship";
  enemy.style.left = left + "px";
  enemy.style.top = top + "px";

  enemyNumber += 1;
  activeEnemies.push({
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

function enemyMoveBasic(enemy, interval, bounds, id) {
  try {
    const top = parseFloat(getComputedStyle(enemy).top);
    const bottom = bounds.height;

    if (top >= bottom) {
      clearInterval(interval);
      enemy.remove();
    } else if (!paused) {
      const index = activeEnemies.findIndex((item) => item.id === id);
      activeEnemies[index].top = top;
      activeEnemies[index].bottom = top + 40;
      enemy.style.top = top + enemyMoveSpeed + "px";
    }
  } catch {
    clearInterval(interval);
  }
}

function checkBulletOverlap(bullet) {
  const b = bullet.getBoundingClientRect();
  const toRemove = [];

  activeEnemies.forEach((e) => {
    if (
      ((e.left <= b.left && b.left <= e.right) ||
        (e.left <= b.right && b.right <= e.right)) &&
      ((e.top <= b.bottom && b.bottom <= e.bottom) ||
        (e.top <= b.top && b.top <= e.bottom))
    ) {
      updateScore(e.score);
      toRemove.push(e.id);
      remainingEnemies -= 1;
      bullet.remove();
    }
  });

  activeEnemies = activeEnemies.filter((enemy) => !toRemove.includes(enemy.id));

  toRemove.forEach((id) => {
    const enemy = document.getElementById(id);
    enemy.remove();
  });

  if (remainingEnemies === 0 && !betweenRounds) {
    bullet.remove();
    betweenRounds = true;
    endRound();
  }
}

function updateScore(points) {
  score += points;
  const scoreLabel = document.getElementById("score");
  scoreLabel.textContent = `Score: ${score}`;
}

function togglePause() {
  paused = !paused;

  const menu = document.getElementById("pauseMenu");
  if (paused) {
    menu.style.display = "flex";
  } else {
    menu.style.display = "none";
  }
}

function endRound() {
  showRoundBanner("Cleared");
  setTimeout(() => {
    roundNumber += 1;
    remainingEnemies = getRoundEnemyCount(roundNumber)
    showRoundBanner(`Round: ${roundNumber}`);
    setTimeout(() => {
      hideRoundBanner();
      spawnWave();
    }, 5000);
  }, 2000);
}

function toggleSettings() {}
