export function initializeEventHandlers() {
  const startButton = document.getElementById('startButton');
  const playEndless = document.getElementById('playEndless');
  const playMultiplayer = document.getElementById('playMultiplayer');
  const openSettings = document.getElementById('openSettings');
  const volumeControl = document.getElementById('volumeControl');
  const enemySpeedControl = document.getElementById('enemySpeedControl');
  const playerSpeedControl = document.getElementById('playerSpeedControl');

  if (startButton) {
    startButton.addEventListener('click', () => {
      if (window.showMainMenu) {
        window.showMainMenu();
      }
    });
  }

  if (playEndless) {
    playEndless.addEventListener('click', () => {
      if (window.startEndlessMode) window.startEndlessMode();
    });
  }

  if (playMultiplayer) {
    playMultiplayer.addEventListener('click', () => {
      if (window.showMPMenu) window.showMPMenu();
    });
  }

  if (openSettings) {
    openSettings.addEventListener('click', () => {
      if (window.toggleSettings) window.toggleSettings();
    });
  }

  if (volumeControl) {
    volumeControl.addEventListener('input', (e) => {
      document.getElementById('volumeValue').textContent = e.target.value + '%';
      const audio = document.getElementById('audio');
      if (audio) {
        audio.volume = e.target.value / 100;
      }
    });
  }

  if (enemySpeedControl) {
    enemySpeedControl.addEventListener('input', (e) => {
      if (window.updateEnemySpeed) window.updateEnemySpeed(e.target.value);
    });
  }

  if (playerSpeedControl) {
    playerSpeedControl.addEventListener('input', (e) => {
      if (window.updatePlayerSpeed) window.updatePlayerSpeed(e.target.value);
    });
  }

  const pauseMenuButtons = document.querySelectorAll('#pauseMenu button');
  pauseMenuButtons.forEach(button => {
    const text = button.textContent;
    button.addEventListener('click', () => {
      switch(text) {
        case 'Resume':
          if (window.togglePause) window.togglePause();
          break;
        case 'Settings':
          if (window.toggleSettings) window.toggleSettings();
          break;
        case 'Main Menu':
          if (window.hidePauseAndGoToMainMenu) window.hidePauseAndGoToMainMenu();
          break;
        case 'Back':
          if (window.togglePause) window.togglePause();
          break;
      }
    });
  });

  const gameOverButtons = document.querySelectorAll('#gameOverMenu button');
  gameOverButtons.forEach(button => {
    const text = button.textContent;
    button.addEventListener('click', () => {
      switch(text) {
        case 'Play Again':
          if (window.restart) window.restart();
          break;
        case 'Main Menu':
        case 'Back':
          if (window.goToMainMenu) window.goToMainMenu();
          break;
      }
    });
  });

  const mainMenuBackButton = document.querySelector('#mainMenu .breadcrumb');
  if (mainMenuBackButton) {
    mainMenuBackButton.addEventListener('click', () => {
      if (window.goToLandingPage) window.goToLandingPage();
    });
  }

  const mpMenuButtons = document.querySelectorAll('#mpMenu button');
  mpMenuButtons.forEach(button => {
    const text = button.textContent;
    button.addEventListener('click', () => {
      switch(text) {
        case 'Play':
          if (window.initiateSearch) window.initiateSearch();
          break;
        case 'Back':
          if (window.goToMainMenu) window.goToMainMenu();
          break;
      }
    });
  });

  const settingsButtons = document.querySelectorAll('#settingsMenu button');
  settingsButtons.forEach(button => {
    if (button.classList.contains('theme-button')) {
      if (button.classList.contains('light-theme')) {
        button.addEventListener('click', () => {
          if (window.setTheme) window.setTheme('light');
        });
      } else if (button.classList.contains('dark-theme')) {
        button.addEventListener('click', () => {
          if (window.setTheme) window.setTheme('dark');
        });
      }
    } else if (button.id === 'cloudEnabled') {
      button.addEventListener('click', () => {
        if (window.toggleClouds) window.toggleClouds(true);
      });
    } else if (button.id === 'cloudDisabled') {
      button.addEventListener('click', () => {
        if (window.toggleClouds) window.toggleClouds(false);
      });
    } else if (button.classList.contains('back-button') || button.classList.contains('breadcrumb')) {
      button.addEventListener('click', () => {
        if (window.closeSettings) window.closeSettings();
      });
    }
  });

  const hangerButton = document.querySelector('#openHanger');
  if (hangerButton) {
    hangerButton.addEventListener('click', () => {
      if (window.toggleHanger) window.toggleHanger();
    });
  }

  const hangerMenuButtons = document.querySelectorAll('#hangerMenu button');
  hangerMenuButtons.forEach(button => {
    if (button.id === 'prevShipBtn') {
      button.addEventListener('click', () => {
        if (window.previousShip) window.previousShip();
      });
    } else if (button.id === 'nextShipBtn') {
      button.addEventListener('click', () => {
        if (window.nextShip) window.nextShip();
      });
    } else if (button.classList.contains('breadcrumb')) {
      button.addEventListener('click', () => {
        if (window.closeHanger) window.closeHanger();
      });
    }
  });
}