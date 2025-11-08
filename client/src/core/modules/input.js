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
};

export function attachGameControls() {
  document.addEventListener("keydown", inputHandlers.keydownHandler);
  document.addEventListener("keyup", inputHandlers.keyupHandler);
  document.addEventListener("mousemove", inputHandlers.mousemoveHandler);
  document.addEventListener("mousedown", inputHandlers.mousedownHandler);
  document.addEventListener("mouseup", inputHandlers.mouseupHandler);
  document.addEventListener("contextmenu", inputHandlers.contextmenuHandler);
}

export function removeGameControls() {
  document.removeEventListener("keydown", inputHandlers.keydownHandler);
  document.removeEventListener("keyup", inputHandlers.keyupHandler);
  document.removeEventListener("mousemove", inputHandlers.mousemoveHandler);
  document.removeEventListener("mousedown", inputHandlers.mousedownHandler);
  document.removeEventListener("mouseup", inputHandlers.mouseupHandler);
  document.removeEventListener("contextmenu", inputHandlers.contextmenuHandler);
}
