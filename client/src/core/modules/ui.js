import { gameState, config, ships } from "./config.js";

export function toggleSettings() {
  const settingsMenu = document.getElementById("settingsMenu");
  const wasInPauseMenu =
    document.getElementById("pauseMenu").style.display === "flex";

  hideMenus();
  settingsMenu.style.display = "flex";

  // Initialize slider values
  const enemySpeedSlider = document.getElementById("enemySpeedControl");
  const enemySpeedValue = document.getElementById("enemySpeedValue");
  if (enemySpeedSlider && enemySpeedValue) {
    enemySpeedSlider.value = config.enemyMoveSpeed;
    enemySpeedValue.textContent = config.enemyMoveSpeed;
  }

  const playerSpeedSlider = document.getElementById("playerSpeedControl");
  const playerSpeedValue = document.getElementById("playerSpeedValue");
  if (playerSpeedSlider && playerSpeedValue) {
    playerSpeedSlider.value = config.movementSpeed;
    playerSpeedValue.textContent = config.movementSpeed;
  }

  if (!wasInPauseMenu) {
    gameState.paused = true;
  }
}

export function closeSettings() {
  const settingsMenu = document.getElementById("settingsMenu");
  settingsMenu.style.display = "none";

  if (gameState.gameStarted) {
    const pauseMenu = document.getElementById("pauseMenu");
    pauseMenu.style.display = "flex";
  } else {
    const mainMenu = document.getElementById("mainMenu");
    mainMenu.style.display = "flex";
    mainMenu.classList.add("fade-in");
    gameState.paused = false;
  }
}

export function togglePause() {
  gameState.paused = !gameState.paused;
  const menu = document.getElementById("pauseMenu");
  const gameUI = document.getElementById("gameUI");

  if (gameState.paused) {
    menu.style.display = "flex";
    gameUI.classList.remove("visible");
  } else {
    menu.style.display = "none";
    gameUI.classList.add("visible");
  }
}

export function showRoundBanner(text) {
  const roundBanner = document.getElementById("roundBanner");
  const roundText = document.getElementById("roundText");

  roundText.textContent = text;
  roundBanner.style.display = "flex";
}

export function hideRoundBanner() {
  const roundBanner = document.getElementById("roundBanner");
  roundBanner.style.display = "none";
}

export function updateScore(points) {
  gameState.score += points;
  const scoreLabel = document.getElementById("score");
  scoreLabel.textContent = `Score: ${gameState.score}`;
}

export function hideMainMenu() {
  const mainMenu = document.getElementById("mainMenu");
  mainMenu.style.display = "none";
}

function hideMenus() {
  const pauseMenu = document.getElementById("pauseMenu");
  const mainMenu = document.getElementById("mainMenu");
  const hangerMenu = document.getElementById("hangerMenu");
  mainMenu.style.display = "none";
  pauseMenu.style.display = "none";
  hangerMenu.style.display = "none";
}

export function goToMainMenu() {
  // Clean up gameplay state
  window.cleanupGameplay();

  // Reset game variables
  resetGameState();

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
    setTimeout(() => {
      landingPage.style.display = "none";
    }, 500);
  }, 300);
}

export function goToLandingPage() {
  // Hide main menu
  const mainMenu = document.getElementById("mainMenu");
  const landingPage = document.getElementById("landing-page");

  mainMenu.classList.remove("fade-in");

  setTimeout(() => {
    mainMenu.style.display = "none";
    landingPage.style.display = "flex";
    landingPage.classList.remove("fade-out");
  }, 300);
}

export function hidePauseAndGoToMainMenu() {
  const pauseMenu = document.getElementById("pauseMenu");
  pauseMenu.style.display = "none";
  gameState.paused = false;
  goToMainMenu();
}

function resetGameState() {
  gameState.roundNumber = 1;
  gameState.score = 0;
  gameState.enemyNumber = 1;
  gameState.activeEnemies = [];
  gameState.remainingEnemies = 0;
  gameState.playerHealth = 100;
}

export function showMultiPlayerMenu() {
  const menu = document.getElementById("mpMenu");
  menu.style.display = "flex";
  // Small delay to trigger fade animation
  setTimeout(() => {
    menu.classList.add("fade-in");
  }, 50);
}

export function hideMultiPlayerMenu() {
  const menu = document.getElementById("mpMenu");
  menu.classList.remove("fade-in");
  // Wait for fade out animation before hiding
  setTimeout(() => {
    menu.style.display = "none";
  }, 500);
}

export function addGameOverMenu() {
  const gameOverMenu = document.getElementById("gameOverMenu");
  const gameOverScore = document.getElementById("gameOverScore");
  const gameUI = document.getElementById("gameUI");

  // Update the score display
  gameOverScore.textContent = `Score: ${gameState.score}`;

  // Hide game UI and show game over menu
  gameUI.classList.remove("visible");
  gameOverMenu.style.display = "flex";
}

export function removeGameOverMenu() {
  const gameOverMenu = document.getElementById("gameOverMenu");
  if (gameOverMenu) {
    gameOverMenu.style.display = "none";
  }
}

export function updateEnemySpeed(value) {
  config.enemyMoveSpeed = parseInt(value);
  const speedValue = document.getElementById("enemySpeedValue");
  if (speedValue) {
    speedValue.textContent = value;
  }
}

export function updatePlayerSpeed(value) {
  config.movementSpeed = parseInt(value);
  const speedValue = document.getElementById("playerSpeedValue");
  if (speedValue) {
    speedValue.textContent = value;
  }
}

export function toggleHanger() {
  const hangerMenu = document.getElementById("hangerMenu");
  const wasInPauseMenu = document.getElementById("pauseMenu").style.display === "flex";

  hideMenus();
  hangerMenu.style.display = "flex";

  // Initialize ship selection UI
  updateShipSelectionUI();

  if (!wasInPauseMenu) {
    gameState.paused = true;
  }
}

export function closeHanger() {
  const hangerMenu = document.getElementById("hangerMenu");
  hangerMenu.style.display = "none";

  if (gameState.gameStarted) {
    const pauseMenu = document.getElementById("pauseMenu");
    pauseMenu.style.display = "flex";
  } else {
    const mainMenu = document.getElementById("mainMenu");
    mainMenu.style.display = "flex";
    mainMenu.classList.add("fade-in");
    gameState.paused = false;
  }
}

export function previousShip() {
  gameState.selectedShipIndex = (gameState.selectedShipIndex - 1 + ships.length) % ships.length;
  updateShipSelectionUI();
  saveSelectedShip();
}

export function nextShip() {
  gameState.selectedShipIndex = (gameState.selectedShipIndex + 1) % ships.length;
  updateShipSelectionUI();
  saveSelectedShip();
}

function updateShipSelectionUI() {
  updateAllShipDisplays();
}

function saveSelectedShip() {
  localStorage.setItem("selectedShipIndex", gameState.selectedShipIndex.toString());
}

export function loadSelectedShip() {
  const savedShipIndex = localStorage.getItem("selectedShipIndex");
  if (savedShipIndex !== null) {
    const index = parseInt(savedShipIndex);
    if (index >= 0 && index < ships.length) {
      gameState.selectedShipIndex = index;
    }
  }
  // Update all ship displays after loading
  updateAllShipDisplays();
}

export function getSelectedShip() {
  return ships[gameState.selectedShipIndex];
}

function updateAllShipDisplays() {
  const selectedShip = ships[gameState.selectedShipIndex];

  // Update landing page ship
  const landingShip = document.querySelector(".landing-page .player-scale-large");
  if (landingShip) {
    landingShip.src = selectedShip.image;
    landingShip.alt = selectedShip.name;
  }

  // Update hanger preview (if hanger is open)
  const shipPreviewImage = document.getElementById("shipPreviewImage");
  if (shipPreviewImage) {
    shipPreviewImage.src = selectedShip.image;
    shipPreviewImage.alt = selectedShip.name;
  }

  // Update hanger ship name (if hanger is open)
  const shipNameElement = document.getElementById("selectedShipName");
  if (shipNameElement) {
    shipNameElement.textContent = selectedShip.name;
  }
}

// Expose functions to global window object
window.togglePause = togglePause;
window.toggleSettings = toggleSettings;
window.closeSettings = closeSettings;
window.goToMainMenu = goToMainMenu;
window.goToLandingPage = goToLandingPage;
window.hidePauseAndGoToMainMenu = hidePauseAndGoToMainMenu;
window.updateEnemySpeed = updateEnemySpeed;
window.updatePlayerSpeed = updatePlayerSpeed;
window.toggleHanger = toggleHanger;
window.closeHanger = closeHanger;
window.previousShip = previousShip;
window.nextShip = nextShip;
