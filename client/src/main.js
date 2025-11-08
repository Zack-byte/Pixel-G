import { gameState, config } from "./core/modules/config.js";
import { spawnPlayer, updateHealthUI } from "./core/modules/player.js";
import { removeAllEnemies } from "./core/modules/enemy.js";
import { initAudio } from "./core/modules/audio.js";
import {
  toggleSettings,
  closeSettings,
  togglePause,
  hideMainMenu,
  goToMainMenu,
  hidePauseAndGoToMainMenu,
} from "./core/modules/ui.js";
import { initiateGameLoop, loadCodex } from "./core/modules/gameLoop.js";
import { attachGameControls, removeGameControls } from "./core/modules/input.js";

// Initialize clouds on page load
document.addEventListener("DOMContentLoaded", () => {
  spawnClouds();
  loadCodex();
  initializeGameDimensions();
  initializeSettings();
});

function initializeGameDimensions() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  gameState.scaleWidth = screenWidth / config.normalizedWidth;
  gameState.scaleHeight = screenHeight / config.normalizedHeight;
  gameState.midPointY = window.innerHeight / 2;
  gameState.midPointX = window.innerWidth / 2;
}

function initializeSettings() {
  // Apply saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
  initAudio();
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

function spawnClouds() {
  const rootElement = document.getElementById("root");

  function createCloud() {
    if (!gameState.paused) {
      const cloud = document.createElement("div");
      cloud.classList.add("cloud");
      const randomLeft = Math.random() * rootElement.offsetWidth;
      cloud.style.left = randomLeft + "px";
      rootElement.appendChild(cloud);

      let topPosition = 0;

      const moveCloud = () => {
        if (!gameState.paused) {
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

  setInterval(createCloud, 1000);
}

function cleanupGameplay() {
  // Reset game state
  gameState.paused = false;
  gameState.gameStarted = false;
  gameState.betweenRounds = false;

  // Clear all intervals and timeouts
  const highestId = window.setTimeout(() => {}, 0);
  for (let i = highestId; i >= 0; i--) {
    window.clearInterval(i);
    window.clearTimeout(i);
  }

  // Clean up game elements
  removeAllEnemies();
  removePlayer();
  resetUIElements();
}

function removePlayer() {
  const player = document.getElementById("player");
  if (player) {
    player.remove();
  }
}

function resetUIElements() {
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
  updateHealthUI();
}

export function play() {
  gameState.isMultiplayer = false;
  hideMainMenu();
  spawnPlayer(true, "player");
  initiateGameLoop();
}

export function gameOver() {
  addGameOverMenu();
  gameState.gameStarted = false;
  gameState.paused = true;
}

// Make functions available to window object
window.toggleSettings = toggleSettings;
window.closeSettings = closeSettings;
window.setTheme = setTheme;
window.cleanupGameplay = cleanupGameplay;
window.play = play;
window.gameOver = gameOver;
window.goToMainMenu = goToMainMenu;
window.hidePauseAndGoToMainMenu = hidePauseAndGoToMainMenu;
window.attachGameControls = attachGameControls;
window.removeGameControls = removeGameControls;
