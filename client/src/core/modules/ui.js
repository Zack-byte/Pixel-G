import { gameState } from "./config.js";

export function toggleSettings() {
  const settingsMenu = document.getElementById("settingsMenu");
  const wasInPauseMenu =
    document.getElementById("pauseMenu").style.display === "flex";

  hideMenus();
  settingsMenu.style.display = "flex";

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
  mainMenu.style.display = "none";
  pauseMenu.style.display = "none";
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
