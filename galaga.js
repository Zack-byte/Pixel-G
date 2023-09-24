var paused = false;
var gameStarted = false;
var betweenRounds = false;
var globalMousePos = { x: 0, y: 0 };
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
  hideMainMenu();
  spawnPlayer();
  initiateGameLoop();
}

function hideMainMenu() {
  const mainMenu = document.getElementById("mainMenu");
  mainMenu.style.display = "none";
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

    if (event.code === "Space") {
      fire();
    }

    if (event.key === "p" && gameStarted) {
      togglePause();
    }
  });

  document.addEventListener("mousemove", (event) => {
    console.log("Moving");
    globalMousePos = { x: event.clientX, y: event.clientY };

    updatePlayerFace();
  });

  document.addEventListener("mousedown", (event) => {
    fire();
  });

  document.addEventListener("keyup", (event) => {
    keysPressed[event.key.toLowerCase()] = false;
  });
}

function updatePlayerFace() {
  let player = document.getElementById("player");
  const mouseX = globalMousePos.x;
  const mouseY = globalMousePos.y;
  const elementX = player.offsetLeft + player.offsetWidth / 2;
  const elementY = player.offsetTop + player.offsetHeight / 2;

  const angleRad = Math.atan2(mouseY - elementY, mouseX - elementX);
  const angleDeg = (angleRad * 180) / Math.PI + 90;

  player.style.transform = `rotate(${angleDeg}deg)`;
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

    checkPlayerOverlap(player);
    updatePlayerFace();
  }

  requestAnimationFrame(updatePlayerPosition);
}

function checkPlayerOverlap(player) {
  const toRemove = [];
  const p = player.getBoundingClientRect();
  activeEnemies.forEach((e) => {
    if (
      ((e.left <= p.left && p.left <= e.right) ||
        (e.left <= p.right && p.right <= e.right)) &&
      ((e.top <= p.bottom && p.bottom <= e.bottom) ||
        (e.top <= p.top && p.top <= e.bottom))
    ) {
      toRemove.push(e.id);
      remainingEnemies -= 1;
    }
  });

  if (toRemove.length > 0) {
    const dead = playerHit(25);
    if (dead) {
      gameOver();
    }
    activeEnemies = activeEnemies.filter(
      (enemy) => !toRemove.includes(enemy.id)
    );

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
}

function playerHit(hitNumber) {
  playerHealth -= hitNumber;
  updateHealthUI();
  return playerHealth <= 0;
}

function updateHealthUI() {
  let health = document.getElementById("HealthBar");
  health.value = playerHealth;
}

function fire() {
  const gameArea = document.getElementById("root");
  const bullet = document.createElement("div");
  const bulletNumber = `playerbullet${playerShotsFired}`;

  bullet.id = bulletNumber;
  bullet.className = "player-bullet";
  bullet.style.top = playerY + "px";
  bullet.style.left = playerX + "px";

  const x1 = playerX;
  const y1 = playerY;

  const x2 = globalMousePos.x;
  const y2 = globalMousePos.y;

  const slope = (y2 - y1) / (x2 - x1);
  const yintercept = -1 * (slope * x1) + y1;

  const rise = y2 - y1;
  const run = x2 - x1;
  console.log(x1);
  console.log(y1);
  console.log(x2);
  console.log(y2);
  console.log(slope);

  playerShotsFired += 1;

  gameArea.append(bullet);
  playAudio("shot");
  const interval = setInterval(
    () => bulletMove(bullet, interval, slope, yintercept),
    10
  );
}

function playAudio(sound) {
  var audio = new Audio(`${sound}.mp3`);
  audio.play();
}

function bulletMove(bullet, interval, slope, yintercept) {
  const top = getComputedStyle(bullet).top;
  const left = getComputedStyle(bullet).left;
  const bulletTop = parseFloat(top);
  const bulletLeft = parseFloat(left);

  if (bulletTop <= 0) {
    bullet.remove();
    clearInterval(interval);
    return;
  } else if (!paused) {
    const x = bulletLeft + bulletSpeed;
    bullet.style.left = x;
    bullet.style.top = slope * x + yintercept + "px";
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
var playerHealth = 100;

function initiateGameLoop() {
  paused = false;
  gameStarted = true;
  remainingEnemies = getRoundEnemyCount(roundNumber);
  showRoundBanner(`Round ${roundNumber}`);

  setTimeout(() => {
    spawnWave();
    hideRoundBanner();
  }, 5000);
}

function getRoundEnemyCount(roundNumber) {
  const matrix = enemyCodex[roundNumber]["enemyLayout"];
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
  const enemyMap = enemyCodex[roundNumber]["enemyLayout"];

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

  const top = row * -45;

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
      remainingEnemies -= 1;
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
    playAudio("explosion");
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
  playAudio("nootnoot");
  showRoundBanner("Cleared");
  setTimeout(() => {
    roundNumber += 1;
    remainingEnemies = getRoundEnemyCount(roundNumber);
    showRoundBanner(`Round: ${roundNumber}`);
    setTimeout(() => {
      hideRoundBanner();
      spawnWave();
    }, 5000);
  }, 2000);
}

function toggleSettings() {}

function gameOver() {
  addGameOverMenu();
  gameStarted = false;
  paused = true;
}

function addGameOverMenu() {
  const menu = document.getElementById("gameOverMenu");
  const scoreLabel = document.getElementById("gameOverScore");
  scoreLabel.textContent = `Score: ${score}`;
  menu.style.display = "flex";
}

function removeGameOverMenu() {
  const menu = document.getElementById("gameOverMenu");
  menu.style.display = "none";
}

function goToMainMenu() {
  removeActiveEnemies();
  removePlayer();
  const mainMenu = document.getElementById("mainMenu");
  const gameOverMenu = document.getElementById("gameOverMenu");

  gameOverMenu.style.display = "none";
  mainMenu.style.display = "flex";
}

function restart() {
  removeActiveEnemies();
  removePlayer();
  score = 0;
  roundNumber = 1;
  enemyNumber = 1;
  activeEnemies = [];
  remainingEnemies = 0;
  playerHealth = 100;
  updateHealthUI();
  removeGameOverMenu();
  spawnPlayer();
  initiateGameLoop();
}

function removePlayer() {
  document.getElementById("player").remove();
}

function removeActiveEnemies() {
  activeEnemies.forEach((enemy) => {
    const e = document.getElementById(enemy.id);
    e.remove();
  });

  activeEnemies = [];
}

function showMultiPlayerMenu() {
  const menu = document.getElementById("mpMenu");
  menu.style.display = "flex";
}

function hideMultiPlayerMenu() {
  const menu = document.getElementById("mpMenu");
  menu.style.display = "none";
}

function updateMpStatus(status) {
  const label = document.getElementById("mpStatus");
  label.textContent = status;
  label.style.display = "flex";
}

function hideMpStatus() {
  const label = document.getElementById("mpStatus");
  label.style.display = "none";
}

function showUserInput() {
  const input = document.getElementById("inputContainer");
  input.style.display = "block";
}

function hideUserInput() {
  const input = document.getElementById("inputContainer");
  input.style.display = "none";
}

var user_id = "";

// This code marks the beginning of multiplayer server connection orchestration
// CALLED VIA HTML
function mpInit() {
  hideMainMenu();
  showMultiPlayerMenu();
  showUserInput();
}

function initiateSearch() {
  user_id = getUserId();
  hideUserInput();
  updateMpStatus("Connecting...");
  initConnection("http://localhost:8000/register").then((data) => {
    console.log("data", data);
    openWebSocketConnection(data.url);
  });
}

function getUserId() {
  return document.getElementById("userId").value;
}

function openWebSocketConnection(url) {
  updateMpStatus("Searching For Opponent...");
  const socket = new WebSocket(url);
  socket.onmessage = (event) => {
    console.log("Incoming", event);
    handleSocketMessage(event);
  };
}

async function initConnection(url) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ user_id }),
  });
  return response.json();
}

function handleSocketMessage(event) {
  console.log("Socket Event Received", event);
  const message = JSON.parse(event.data);

  if (message?.found) {
    handleOpponentFound(message.opponent_id);
  }
}

function handleOpponentFound(id) {
  updateMpStatus("Opponent Found!");

  setTimeout(() => {
    spawnPlayer();
    hideMpStatus();
  }, 3000);

  spawnPlayer();
}
