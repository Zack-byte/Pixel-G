// Initialize all event listeners
import { play } from "../modes/endless.js";
import { mpInit } from "../modes/multiplayer.js";
import { toggleSettings, goToMainMenu } from "../core/modules/ui.js";

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
