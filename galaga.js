var paused = false;
var gameStarted = false;
var betweenRounds = false;
var globalMousePos = { x: 0, y: 0 };
var enemyCodex;
var midPointY = 0;
var midPointX = 0;
var scaleWidth = 0;
var scaleHeight = 0;
var normalizedHeight = 1080;
var normalizedWidth = 1920;
var isMultiplayer = false;

document.addEventListener("DOMContentLoaded", () => {
  spawnClouds();
  loadCodex();
  // Get the current screen width and height
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Calculate the scale factors for width and height
  scaleWidth = screenWidth / normalizedWidth;
  scaleHeight = screenHeight / normalizedHeight;
  midPointY = window.innerHeight / 2;
  midPointX = window.innerWidth / 2;
  console.log(`MidPointY ${midPointY}, midPointX ${midPointX}`);
});

function getScaleFactor() {
  // Get the current screen width and height
  const screenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  const screenHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  // Calculate the scale factors for width and height
  const scaleWidth = screenWidth / 1920;
  const scaleHeight = screenHeight / 1080;

  console.log(`Calculating Scale ${scaleWidth}, ${scaleHeight}`);

  // Return the minimum of the two scale factors to maintain aspect ratio
  return Math.max(scaleWidth, scaleHeight);
}

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
var playerRotation = 0;
const movementSpeed = 5;
const keysPressed = {};

var playerShotsFired = 0;
let bulletSpeed = 10;

function play() {
  isMultiplayer = false;
  hideMainMenu();
  spawnPlayer(true, "player");
  initiateGameLoop();
}

function hideMainMenu() {
  const mainMenu = document.getElementById("mainMenu");
  mainMenu.style.display = "none";
}

function spawnPlayer(isPlayerControlled = true, playerId) {
  const gameArea = document.getElementById("root");
  const player = document.createElement("div");
  const bounds = gameArea.getBoundingClientRect();

  player.id = playerId;
  player.className = "player";
  player.style.width = 40 * scaleWidth + "px";
  player.style.height = 40 * scaleHeight + "px";

  if (isPlayerControlled) {
    console.log("Player Bounds", bounds);
    playerX = bounds.width / 2;
    playerY = bounds.height - 50;
  }
  if (!isPlayerControlled) {
    console.log("Opponent Bounds", bounds);
    opponentX = normalizedWidth / 2;
    opponentY = normalizedHeight - 50;
  }

  gameArea.appendChild(player);

  // Start the continuous update loop
  updatePlayerPosition(isPlayerControlled, playerId); // To track which keys are pressed

  if (isPlayerControlled) {
    document.addEventListener("keydown", (event) => {
      keysPressed[event.key.toLowerCase()] = true;

      if (event.code === "Space") {
        fire(true);
      }

      if (event.key === "p" && gameStarted) {
        togglePause();
      }
    });

    document.addEventListener("mousemove", (event) => {
      globalMousePos = { x: event.clientX, y: event.clientY };

      //updatePlayerFace();
    });

    document.addEventListener("mousedown", (event) => {
      fire(true);
    });

    document.addEventListener("keyup", (event) => {
      keysPressed[event.key.toLowerCase()] = false;
    });
  }
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

function updatePlayerPosition(isPlayerControlled, playerId) {
  if (!paused) {
    if (isPlayerControlled) {
      if (keysPressed["w"]) {
        playerY -= movementSpeed * scaleHeight;
      }
      if (keysPressed["s"]) {
        playerY += movementSpeed * scaleHeight;
      }
      if (keysPressed["a"]) {
        playerX -= movementSpeed * scaleWidth;
      }
      if (keysPressed["d"]) {
        playerX += movementSpeed * scaleWidth;
      }
    }

    const player = document.getElementById(playerId);
    let top = "";
    let left = "";
    let rotation = 0;

    if (isPlayerControlled) {
      top = playerY + "px";
      left = playerX + "px";
      rotation = playerRotation;
    }

    if (!isPlayerControlled) {
      top = window.innerHeight - opponentY * scaleHeight + "px";
      left = window.innerWidth - opponentX * scaleWidth + "px";
      rotation = opponentRotation + 180;
    }

    player.style.top = top;
    player.style.left = left;
    player.style.rotate = `${rotation}deg`;

    checkPlayerOverlap(player);
    //updatePlayerFace();
  }

  if (
    isMultiplayer &&
    isPlayerControlled &&
    (keysPressed["w"] ||
      keysPressed["s"] ||
      keysPressed["a"] ||
      keysPressed["d"])
  ) {
    sendMpUpdate();
  }

  requestAnimationFrame(function () {
    updatePlayerPosition(isPlayerControlled, playerId);
  });
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

function fire(isPlayer) {
  const gameArea = document.getElementById("root");
  const bullet = document.createElement("div");
  const bulletNumber = `playerbullet${playerShotsFired}`;

  bullet.id = bulletNumber;
  bullet.className = isPlayer ? "player-bullet" : "enemy-bullet";
  bullet.style.width = 3 * scaleWidth + "px";
  bullet.style.height = 20 * scaleHeight + "px";
  let top = "";
  let left = "";

  if (isPlayer) {
    if (isMultiplayer) {
      sendFireEvent();
    }
    top = playerY + "px";
    left = playerX + "px";
  }

  if (!isPlayer) {
    top = window.innerHeight - opponentY * scaleHeight + "px";
    left = window.innerWidth - opponentX * scaleWidth + "px";
  }

  bullet.style.top = top;
  bullet.style.left = left;

  playerShotsFired += 1;
  playAudio("shot");
  gameArea.append(bullet);
  const interval = setInterval(
    () => bulletMove(bullet, interval, isPlayer),
    10
  );
}

function playAudio(sound) {
  var audio = new Audio(`${sound}.mp3`);
  audio.play();
}

function bulletMove(bullet, interval, isPlayer) {
  const top = getComputedStyle(bullet).top;
  const bulletTop = parseFloat(top);

  if (isPlayer) {
    if (bulletTop <= 0) {
      bullet.remove();
      clearInterval(interval);
      return;
    } else if (!paused) {
      bullet.style.top = bulletTop - bulletSpeed * scaleHeight + "px";
      checkBulletOverlap(bullet);
    }
  } else {
    if (bulletTop >= normalizedHeight * scaleHeight) {
      bullet.remove();
      clearInterval(interval);
      return;
    } else if (!paused) {
      bullet.style.top = bulletTop + bulletSpeed * scaleHeight + "px";
      checkBulletOverlap(bullet);
    }
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
  if (!isMultiplayer) {
    checkEnemyOverlap(b);
  }
}

function checkEnemyOverlap(b) {
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
  spawnPlayer(false, "player");
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
var opponent_id = "";
var socket;
var opponentY = 0;
var opponentX = 0;
var opponentRotation = 0;

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
    openWebSocketConnection(data.url);
  });
}

function getUserId() {
  return document.getElementById("userId").value;
}

function openWebSocketConnection(url) {
  updateMpStatus("Searching For Opponent...");
  socket = new WebSocket(url);
  socket.onmessage = (event) => {
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
  const message = JSON.parse(event.data);
  console.log("Message received", message);

  if (message?.found) {
    handleOpponentFound(message.opponent_id);
  }

  if (message?.player_x) {
    handleGamePacket(message);
  }

  if (message?.bullet_type) {
    fire(false);
  }
}

function handleOpponentFound(id) {
  opponent_id = id;
  isMultiplayer = true;

  setTimeout(() => {
    spawnPlayer(true, user_id);
    spawnPlayer(false, opponent_id);
    hideMpStatus();
  }, 3000);
}

function sendMpUpdate() {
  if (socket) {
    let playerData = {
      opponent_id,
      player_x: playerX / scaleWidth,
      player_y: playerY / scaleHeight,
    };
    socket.send(JSON.stringify(playerData));
  }
}

function sendFireEvent() {
  if (socket) {
    let bulletData = {
      opponent_id,
      bullet_type: "standard",
    };
    socket.send(JSON.stringify(bulletData));
  }
}

function handleGamePacket(packet) {
  opponentX = packet.player_x;
  opponentY = packet.player_y;
  opponentRotation = 0;
}
