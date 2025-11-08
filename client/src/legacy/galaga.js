// Core game variables
window.paused = false;
window.gameStarted = false;
window.betweenRounds = false;
window.globalMousePos = { x: 0, y: 0 };
window.enemyCodex;
window.midPointY = 0;
window.midPointX = 0;
window.scaleWidth = 0;
window.scaleHeight = 0;
window.normalizedHeight = 1080;
window.normalizedWidth = 1920;
window.isMultiplayer = false;
window.isMouseDown = false;
window.lastMousePosition = null;

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
let bulletSpeed = 15; // Increased for better gameplay with angled shots

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
  updatePlayerPosition(isPlayerControlled, playerId);
}

function updatePlayerFace() {
  const player = document.getElementById("player");
  if (!player) return;

  const playerRect = player.getBoundingClientRect();
  const playerCenterX = playerRect.left + playerRect.width / 2;
  const playerCenterY = playerRect.top + playerRect.height / 2;

  const angleRad = Math.atan2(
    globalMousePos.y - playerCenterY,
    globalMousePos.x - playerCenterX
  );
  const angleDeg = (angleRad * 180) / Math.PI + 90;

  player.style.transform = `rotate(${angleDeg}deg)`;
}

function updatePlayerPosition(isPlayerControlled, playerId) {
  if (!paused) {
    if (isPlayerControlled) {
      // Handle keyboard movement
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

      // Handle mouse/trackpad movement if mouse is pressed
      if (isMouseDown && lastMousePosition) {
        const dx = globalMousePos.x - lastMousePosition.x;
        const dy = globalMousePos.y - lastMousePosition.y;
        playerX += dx;
        playerY += dy;
        lastMousePosition = { x: globalMousePos.x, y: globalMousePos.y };
      }

      // Keep player within bounds
      const gameArea = document.getElementById("root");
      const bounds = gameArea.getBoundingClientRect();
      playerX = Math.max(0, Math.min(bounds.width - 40, playerX));
      playerY = Math.max(0, Math.min(bounds.height - 40, playerY));
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

  if (isPlayer) {
    if (isMultiplayer) {
      sendFireEvent();
    }
    const player = document.getElementById("player");
    const playerRect = player.getBoundingClientRect();

    // Get player's current rotation
    const transform = getComputedStyle(player).transform;
    const matrix = new DOMMatrix(transform);
    const angle = Math.atan2(matrix.b, matrix.a);

    // Calculate bullet spawn position at the front of the player
    const centerX = playerX + playerRect.width / 2;
    const centerY = playerY + playerRect.height / 2;
    const spawnDistance = playerRect.height / 2;

    // Calculate spawn position offset based on player's rotation
    const spawnX =
      centerX - bullet.offsetWidth / 2 + Math.sin(angle) * spawnDistance;
    const spawnY =
      centerY - bullet.offsetHeight / 2 - Math.cos(angle) * spawnDistance;

    bullet.style.top = spawnY + "px";
    bullet.style.left = spawnX + "px";
    bullet.style.transform = `rotate(${angle}rad)`;

    // Store velocity components for movement
    bullet.dataset.velocityX = String(Math.sin(angle) * bulletSpeed);
    bullet.dataset.velocityY = String(-Math.cos(angle) * bulletSpeed);
  } else {
    // Enemy bullet logic
    const top = window.innerHeight - opponentY * scaleHeight + "px";
    const left = window.innerWidth - opponentX * scaleWidth + "px";
    bullet.style.top = top;
    bullet.style.left = left;
  }

  playerShotsFired += 1;
  playAudio("shot");
  gameArea.append(bullet);
  const interval = setInterval(
    () => bulletMove(bullet, interval, isPlayer),
    16
  );
}

function playAudio(sound) {
  var audio = new Audio(`${sound}.mp3`);
  audio.play();
}

function bulletMove(bullet, interval, isPlayer) {
  if (!paused) {
    if (isPlayer) {
      const top = parseFloat(getComputedStyle(bullet).top);
      const left = parseFloat(getComputedStyle(bullet).left);
      const velocityX = parseFloat(bullet.dataset.velocityX);
      const velocityY = parseFloat(bullet.dataset.velocityY);

      // Calculate new position
      const newTop = top + velocityY * scaleHeight;
      const newLeft = left + velocityX * scaleWidth;

      // Check if bullet is out of bounds
      if (
        newTop < 0 ||
        newTop > window.innerHeight ||
        newLeft < 0 ||
        newLeft > window.innerWidth
      ) {
        bullet.remove();
        clearInterval(interval);
        return;
      }

      bullet.style.top = newTop + "px";
      bullet.style.left = newLeft + "px";
      checkBulletOverlap(bullet);
    } else {
      const top = parseFloat(getComputedStyle(bullet).top);
      if (top >= normalizedHeight * scaleHeight) {
        bullet.remove();
        clearInterval(interval);
        return;
      }
      bullet.style.top = top + bulletSpeed * scaleHeight + "px";
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
    checkEnemyOverlap(b, bullet);
  }
}

function checkEnemyOverlap(b, bullet) {
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
      playAudio("explosion");
    }
  });

  activeEnemies = activeEnemies.filter((enemy) => !toRemove.includes(enemy.id));

  toRemove.forEach((id) => {
    const enemy = document.getElementById(id);
    if (enemy) enemy.remove();
  });

  if (remainingEnemies === 0 && !betweenRounds) {
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
  const gameUI = document.getElementById("gameUI");

  if (paused) {
    menu.style.display = "flex";
    gameUI.classList.remove("visible");
  } else {
    menu.style.display = "none";
    gameUI.classList.add("visible");
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

function toggleSettings() {
  const settingsMenu = document.getElementById("settingsMenu");
  // If we're coming from pause menu, keep the pause state
  const wasInPauseMenu =
    document.getElementById("pauseMenu").style.display === "flex";

  // Hide other menus
  const pauseMenu = document.getElementById("pauseMenu");
  const mainMenu = document.getElementById("mainMenu");
  mainMenu.style.display = "none";
  pauseMenu.style.display = "none";

  settingsMenu.style.display = "flex";

  if (!wasInPauseMenu) {
    paused = true;
  }
}

function closeSettings() {
  const settingsMenu = document.getElementById("settingsMenu");
  settingsMenu.style.display = "none";

  // If game is running, return to pause menu
  if (gameStarted) {
    const pauseMenu = document.getElementById("pauseMenu");
    pauseMenu.style.display = "flex";
  } else {
    // Otherwise return to main menu
    const mainMenu = document.getElementById("mainMenu");
    mainMenu.style.display = "flex";
    mainMenu.classList.add("fade-in");
    paused = false;
  }
}

function setTheme(theme) {
  const body = document.body;
  body.className = `body-${theme}`;
  localStorage.setItem("theme", theme);

  // Update active state of theme buttons
  const lightButton = document.querySelector(".light-theme");
  const darkButton = document.querySelector(".dark-theme");

  if (theme === "light") {
    lightButton.classList.add("active");
    darkButton.classList.remove("active");
  } else {
    darkButton.classList.add("active");
    lightButton.classList.remove("active");
  }
}

// Audio control
function updateVolume(value) {
  const audioElements = document.querySelectorAll("audio");
  const volume = value / 100;
  audioElements.forEach((audio) => {
    audio.volume = volume;
  });
  localStorage.setItem("volume", value);
}

// Initialize settings on page load
document.addEventListener("DOMContentLoaded", () => {
  // Apply saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  // Apply saved volume
  const volumeControl = document.getElementById("volumeControl");
  const savedVolume = localStorage.getItem("volume") || 100;
  volumeControl.value = savedVolume;
  updateVolume(savedVolume);

  // Add volume change listener
  volumeControl.addEventListener("input", (e) => {
    updateVolume(e.target.value);
  });
});

// Make functions available to the window object
window.toggleSettings = toggleSettings;
window.closeSettings = closeSettings;
window.setTheme = setTheme;
window.updateVolume = updateVolume;
window.cleanupGameplay = cleanupGameplay;

function gameOver() {
  addGameOverMenu();
  gameStarted = false;
  paused = true;
}

// Make core game functions available to other modules
window.play = play;
window.gameOver = gameOver;
window.goToMainMenu = goToMainMenu;
window.cleanupGameplay = cleanupGameplay;
window.hidePauseAndGoToMainMenu = hidePauseAndGoToMainMenu;

// Event handler functions
const keydownHandler = (event) => {
  keysPressed[event.key.toLowerCase()] = true;

  if (event.code === "Space") {
    fire(true);
  }

  if (event.key === "p" && gameStarted) {
    togglePause();
  }
};

const keyupHandler = (event) => {
  keysPressed[event.key.toLowerCase()] = false;
};

const mousemoveHandler = (event) => {
  globalMousePos = { x: event.clientX, y: event.clientY };
  updatePlayerFace();
};

const mousedownHandler = (event) => {
  if (event.button === 0) {
    // Left click
    isMouseDown = true;
    lastMousePosition = { x: event.clientX, y: event.clientY };
  } else if (event.button === 2) {
    // Right click
    fire(true);
  }
};

const mouseupHandler = (event) => {
  if (event.button === 0) {
    // Left click
    isMouseDown = false;
    lastMousePosition = null;
  }
};

function attachGameControls() {
  document.addEventListener("keydown", keydownHandler);
  document.addEventListener("keyup", keyupHandler);
  document.addEventListener("mousemove", mousemoveHandler);
  document.addEventListener("mousedown", mousedownHandler);
  document.addEventListener("mouseup", mouseupHandler);
  // Prevent right-click menu
  document.addEventListener("contextmenu", (e) => e.preventDefault());
}

function removeGameControls() {
  document.removeEventListener("keydown", keydownHandler);
  document.removeEventListener("keyup", keyupHandler);
  document.removeEventListener("mousemove", mousemoveHandler);
  document.removeEventListener("mousedown", mousedownHandler);
  document.removeEventListener("mouseup", mouseupHandler);
  document.removeEventListener("contextmenu", (e) => e.preventDefault());
}

// Make functions available to other modules
window.attachGameControls = attachGameControls;
window.removeGameControls = removeGameControls;

function cleanupGameplay() {
  // Reset game state
  window.paused = false;
  window.gameStarted = false;
  window.betweenRounds = false;

  // Hide menus with proper transitions
  const mpMenu = document.getElementById("mpMenu");
  if (mpMenu) {
    mpMenu.classList.remove("fade-in");
    setTimeout(() => {
      mpMenu.style.display = "none";
    }, 500);
  }

  // Clear all intervals and timeouts
  const highestId = window.setTimeout(() => {}, 0);
  for (let i = highestId; i >= 0; i--) {
    window.clearInterval(i);
    window.clearTimeout(i);
  }

  // Clean up game elements
  removeActiveEnemies();
  removePlayer();

  // Reset UI elements
  const gameUI = document.getElementById("gameUI");
  const roundBanner = document.getElementById("roundBanner");
  const pauseMenu = document.getElementById("pauseMenu");
  const gameOverMenu = document.getElementById("gameOverMenu");

  gameUI.classList.remove("visible");
  roundBanner.style.display = "none";
  pauseMenu.style.display = "none";
  gameOverMenu.style.display = "none";

  // Reset score and health
  const scoreLabel = document.getElementById("score");
  scoreLabel.textContent = "Score: 0";
  const healthBar = document.getElementById("HealthBar");
  healthBar.value = 100;
}

function removePlayer() {
  const player = document.getElementById("player");
  if (player) {
    player.remove();
  }
}

function removeActiveEnemies() {
  // Remove enemy elements from DOM
  activeEnemies.forEach((enemy) => {
    const element = document.getElementById(enemy.id);
    if (element) element.remove();
  });
  // Clear the activeEnemies array
  activeEnemies = [];
  remainingEnemies = 0;
}

// Make functions available to other modules
window.removeActiveEnemies = removeActiveEnemies;

function goToMainMenu() {
  // Clean up gameplay state
  cleanupGameplay();

  // Reset game variables
  window.roundNumber = 1;
  window.score = 0;
  window.enemyNumber = 1;
  window.activeEnemies = [];
  window.remainingEnemies = 0;
  window.playerHealth = 100;

  // Hide all menus first
  const mpMenu = document.getElementById("mpMenu");
  const mainMenu = document.getElementById("mainMenu");
  const landingPage = document.getElementById("landing-page");
  const settingsMenu = document.getElementById("settingsMenu");

  mpMenu.style.display = "none";
  settingsMenu.style.display = "none";

  // Start transition sequence
  landingPage.classList.add("fade-out");
  mainMenu.style.display = "flex";

  setTimeout(() => {
    mainMenu.classList.add("fade-in");
    // Remove landing page after transition
    setTimeout(() => {
      landingPage.style.display = "none";
    }, 500);
  }, 300);
}

function hidePauseAndGoToMainMenu() {
  const pauseMenu = document.getElementById("pauseMenu");
  pauseMenu.style.display = "none";
  paused = false;
  goToMainMenu();
}

//# sourceMappingURL=app.js.map
