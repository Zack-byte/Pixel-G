// Initialize all event listeners
import { play } from "./endless.js";
import { mpInit } from "./multiplayer.js";
import { toggleSettings, goToMainMenu } from "./src/modules/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  // Start button
  document
    .getElementById("startButton")
    .addEventListener("click", goToMainMenu);
  // Main menu buttons
  document.getElementById("playEndless").addEventListener("click", play);
  document.getElementById("playMultiplayer").addEventListener("click", mpInit);
  document
    .getElementById("openSettings")
    .addEventListener("click", toggleSettings);
});
