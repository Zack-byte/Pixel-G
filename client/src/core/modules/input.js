import { gameState } from "./config.js";
import { updatePlayerFace, keysPressed } from "./player.js";
import { fire } from "./combat.js";

export const inputHandlers = {
  keydownHandler: (event) => {
    keysPressed[event.key.toLowerCase()] = true;

    if (event.code === "Space") {
      fire(true);
    }

    if (event.key === "p" && gameState.gameStarted) {
      window.togglePause();
    }
  },

  keyupHandler: (event) => {
    keysPressed[event.key.toLowerCase()] = false;
  },

  mousemoveHandler: (event) => {
    gameState.globalMousePos = { x: event.clientX, y: event.clientY };
    updatePlayerFace();
  },

  mousedownHandler: (event) => {
    if (event.button === 0) {
      // Left click
      gameState.isMouseDown = true;
      gameState.lastMousePosition = { x: event.clientX, y: event.clientY };
    } else if (event.button === 2) {
      // Right click
      fire(true);
    }
  },

  mouseupHandler: (event) => {
    if (event.button === 0) {
      // Left click
      gameState.isMouseDown = false;
      gameState.lastMousePosition = null;
    }
  },

  contextmenuHandler: (e) => e.preventDefault(),

  // Touch handlers for trackpad support
  touchstartHandler: (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      gameState.isMouseDown = true;
      gameState.lastMousePosition = { x: touch.clientX, y: touch.clientY };
      gameState.globalMousePos = { x: touch.clientX, y: touch.clientY };
      updatePlayerFace();
    }
  },

  touchmoveHandler: (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      gameState.globalMousePos = { x: touch.clientX, y: touch.clientY };
      updatePlayerFace();
    }
  },

  touchendHandler: (event) => {
    event.preventDefault();
    gameState.isMouseDown = false;
    gameState.lastMousePosition = null;

    // Fire on touch end (like a tap)
    if (event.changedTouches.length === 1) {
      fire(true);
    }
  },
};

export function attachGameControls() {
  document.addEventListener("keydown", inputHandlers.keydownHandler);
  document.addEventListener("keyup", inputHandlers.keyupHandler);
  document.addEventListener("mousemove", inputHandlers.mousemoveHandler);
  document.addEventListener("mousedown", inputHandlers.mousedownHandler);
  document.addEventListener("mouseup", inputHandlers.mouseupHandler);
  document.addEventListener("contextmenu", inputHandlers.contextmenuHandler);
  // Touch events for trackpad support
  document.addEventListener("touchstart", inputHandlers.touchstartHandler);
  document.addEventListener("touchmove", inputHandlers.touchmoveHandler);
  document.addEventListener("touchend", inputHandlers.touchendHandler);
}

export function removeGameControls() {
  document.removeEventListener("keydown", inputHandlers.keydownHandler);
  document.removeEventListener("keyup", inputHandlers.keyupHandler);
  document.removeEventListener("mousemove", inputHandlers.mousemoveHandler);
  document.removeEventListener("mousedown", inputHandlers.mousedownHandler);
  document.removeEventListener("mouseup", inputHandlers.mouseupHandler);
  document.removeEventListener("contextmenu", inputHandlers.contextmenuHandler);
  // Remove touch events
  document.removeEventListener("touchstart", inputHandlers.touchstartHandler);
  document.removeEventListener("touchmove", inputHandlers.touchmoveHandler);
  document.removeEventListener("touchend", inputHandlers.touchendHandler);
}
