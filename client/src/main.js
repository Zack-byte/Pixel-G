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
  addGameOverMenu,
  updateEnemySpeed,
  updatePlayerSpeed,
  loadSelectedShip,
  toggleHanger,
  closeHanger,
  previousShip,
  nextShip,
  showMultiPlayerMenu,
} from "./core/modules/ui.js";
import { initiateGameLoop, loadCodex } from "./core/modules/gameLoop.js";
import {
  attachGameControls,
  removeGameControls,
  stopContinuousFiring,
} from "./core/modules/input.js";
import {
  initializeEventHandlers,
  addHoverSoundsToNewButtons,
} from "./core/modules/eventHandlers.js";
import { play as playEndless, restart } from "./modes/endless.js";
import { initiateSearch } from "./modes/multiplayer.js";

// Make functions available to window object BEFORE DOM loads
window.toggleSettings = toggleSettings;
window.closeSettings = closeSettings;
window.setTheme = setTheme;
window.toggleClouds = toggleClouds;
window.cleanupGameplay = cleanupGameplay;
window.play = play;
window.gameOver = gameOver;
window.goToMainMenu = goToMainMenu;
window.showMainMenu = goToMainMenu; // Alias for start button
window.hidePauseAndGoToMainMenu = hidePauseAndGoToMainMenu;
window.attachGameControls = attachGameControls;
window.removeGameControls = removeGameControls;
window.updateEnemySpeed = updateEnemySpeed;
window.updatePlayerSpeed = updatePlayerSpeed;
window.toggleHanger = toggleHanger;
window.closeHanger = closeHanger;
window.previousShip = previousShip;
window.nextShip = nextShip;
window.addHoverSoundsToNewButtons = addHoverSoundsToNewButtons;

// Game mode functions
window.startEndlessMode = playEndless;
window.restart = restart;
window.showMPMenu = showMultiPlayerMenu;
window.initiateSearch = initiateSearch;

// Initialize clouds on page load
document.addEventListener("DOMContentLoaded", () => {
  spawnClouds();
  loadCodex();
  initializeGameDimensions();
  initializeSettings();
  initializeTitleCarousel();
  loadSelectedShip();
  initializeEventHandlers();
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

  // Apply saved cloud setting
  const savedCloudSetting = localStorage.getItem("showClouds");
  const showClouds =
    savedCloudSetting === null ? true : savedCloudSetting === "true";
  setClouds(showClouds);

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

function setClouds(enabled) {
  gameState.cloudsEnabled = enabled;
  localStorage.setItem("showClouds", enabled);

  // Update active state of cloud buttons
  const enabledButton = document.getElementById("cloudEnabled");
  const disabledButton = document.getElementById("cloudDisabled");

  if (enabledButton && disabledButton) {
    if (enabled) {
      enabledButton.classList.add("active");
      disabledButton.classList.remove("active");
    } else {
      disabledButton.classList.add("active");
      enabledButton.classList.remove("active");
    }
  }
}

function toggleClouds(enabled) {
  setClouds(enabled);
}

function spawnClouds() {
  const rootElement = document.getElementById("root");

  function createCloud() {
    if (!gameState.paused && gameState.cloudsEnabled) {
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
  // Stop any continuous firing
  stopContinuousFiring();

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

  // Stop title carousel
  if (window.stopTitleCarousel) {
    window.stopTitleCarousel();
  }
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

function initializeTitleCarousel() {
  const fontData = [
    { font: "Orbitron", text: "Pixel G" },
    { font: "Orbit", text: "ピクセルファイター" },
    { font: "WDXL Lubrifont SC", text: "픽셀 파이터" },
  ];
  let currentFontIndex = 0;
  let carouselInterval;

  function rotateFonts() {
    const currentTitle = document.querySelector(".title-text");
    if (!currentTitle) return;

    // Reset all animation classes and hide current item instantly
    currentTitle.classList.remove("slide-in-center", "slide-in-from-left");
    currentTitle.classList.add("hidden");

    setTimeout(() => {
      // Move to next font
      currentFontIndex = (currentFontIndex + 1) % fontData.length;
      const newFontData = fontData[currentFontIndex];

      // Update font attribute, text content, and reset position
      currentTitle.setAttribute("data-font", newFontData.font);
      currentTitle.textContent = newFontData.text;
      currentTitle.classList.remove("hidden");
      currentTitle.classList.add("slide-in-from-left");

      // Animate to center
      setTimeout(() => {
        currentTitle.classList.remove("slide-in-from-left");
        currentTitle.classList.add("slide-in-center");
      }, 50);
    }, 300);
  }

  function startCarousel() {
    if (!carouselInterval) {
      carouselInterval = setInterval(rotateFonts, 4000);
    }
  }

  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  // Monitor landing page visibility
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        const landingPage = document.getElementById("landing-page");
        if (landingPage) {
          const isHidden =
            landingPage.style.display === "none" ||
            landingPage.classList.contains("fade-out");
          if (isHidden) {
            stopCarousel();
          } else {
            startCarousel();
          }
        }
      }
    });
  });

  const landingPage = document.getElementById("landing-page");
  if (landingPage) {
    observer.observe(landingPage, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Initialize first title with proper animation class
    const initialTitle = document.querySelector(".title-text");
    if (initialTitle) {
      initialTitle.classList.add("slide-in-center");
    }

    // Start immediately since landing page is visible by default
    startCarousel();
  }

  // Expose stop function for cleanup
  window.stopTitleCarousel = stopCarousel;
}

// Window functions already assigned at top of file
