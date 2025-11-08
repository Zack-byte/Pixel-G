import {
  hideMainMenu,
  showMultiPlayerMenu,
  hideMultiPlayerMenu,
} from "../core/modules/ui.js";

// Multiplayer game logic
var user_id = "";
var opponent_id = "";
var socket;
var opponentY = 0;
var opponentX = 0;
var opponentRotation = 0;

export function mpInit() {
  hideMainMenu();
  showMultiPlayerMenu();
}

function initiateSearch() {
  user_id = getUserId();
  if (!user_id.trim()) {
    return; // Don't proceed if username is empty
  }

  // Disable input and show loading state
  const input = document.getElementById("userId");
  const playButton = input.nextElementSibling;
  input.disabled = true;
  playButton.disabled = true;
  playButton.textContent = "Connecting...";

  initConnection("http://localhost:8000/register")
    .then((data) => {
      openWebSocketConnection(data.url);
    })
    .catch((error) => {
      console.error("Failed to connect:", error);
      // Re-enable input on error
      input.disabled = false;
      playButton.disabled = false;
      playButton.textContent = "Play";
    });
}

function getUserId() {
  return document.getElementById("userId").value;
}

function openWebSocketConnection(url) {
  const playButton = document.getElementById("userId").nextElementSibling;
  playButton.textContent = "Searching...";

  socket = new WebSocket(url);

  socket.onmessage = (event) => {
    handleSocketMessage(event);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    handleConnectionError();
  };

  socket.onclose = () => {
    if (isMultiplayer) {
      // Only handle disconnect if we were already in a game
      handleDisconnect();
    } else {
      handleConnectionError();
    }
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
    hideMultiPlayerMenu(); // Hide the multiplayer menu
    attachGameControls(); // Attach game controls before spawning players
    spawnPlayer(true, user_id);
    spawnPlayer(false, opponent_id);
    hideMpStatus();
    // Show game UI with animation
    const gameUI = document.getElementById("gameUI");
    gameUI.classList.add("visible");
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

function handleConnectionError() {
  // Re-enable input
  const input = document.getElementById("userId");
  const playButton = input.nextElementSibling;
  input.disabled = false;
  playButton.disabled = false;
  playButton.textContent = "Play";
}

function handleDisconnect() {
  // Return to multiplayer menu
  hideMultiPlayerMenu();
  mpInit();
  // Show error state
  const input = document.getElementById("userId");
  const playButton = input.nextElementSibling;
  input.disabled = false;
  playButton.disabled = false;
  playButton.textContent = "Play";
  // Clean up any game state
  removePlayer();
  removeGameControls();
}

// Export functions that need to be accessible from other files
window.mpInit = mpInit;
window.initiateSearch = initiateSearch;
window.sendMpUpdate = sendMpUpdate;
window.sendFireEvent = sendFireEvent;
