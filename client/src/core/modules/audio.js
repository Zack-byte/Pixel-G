export function playAudio(sound) {
  var audio = new Audio(`/audio/${sound}.mp3`);
  audio.play();
}

// Cache for the button hover sound
let cachedHoverSound = null;
let isHoverSoundLoaded = false;

// Preload and cache the button hover sound
export function preloadButtonHoverSound() {
  if (!cachedHoverSound) {
    cachedHoverSound = new Audio("/audio/Menu_Hover_Click.wav");
    cachedHoverSound.preload = "auto";

    cachedHoverSound.addEventListener("canplaythrough", () => {
      isHoverSoundLoaded = true;
    });

    cachedHoverSound.addEventListener("loadeddata", () => {
      isHoverSoundLoaded = true;
    });

    cachedHoverSound.addEventListener("error", (error) => {
      console.log("Could not preload button hover sound:", error);
      isHoverSoundLoaded = false;
    });
  }
}

export function playButtonHoverSound() {
  if (!cachedHoverSound) {
    return; // Don't play if sound isn't loaded yet
  }

  try {
    // Apply current volume setting
    const volumeControl = document.getElementById("volumeControl");
    if (volumeControl) {
      cachedHoverSound.volume = (volumeControl.value / 100) * 0.3; // Reduced to 30% for subtlety
    } else {
      cachedHoverSound.volume = 0.3; // Default to 30% volume
    }

    // Reset audio to beginning for quick successive hovers
    cachedHoverSound.currentTime = 0;

    cachedHoverSound.play().catch((error) => {
      console.log("Could not play button hover sound:", error);
    });
  } catch (error) {
    console.log("Error playing cached button hover sound:", error);
  }
}

// Audio control
export function updateVolume(value) {
  const audioElements = document.querySelectorAll("audio");
  const volume = value / 100;
  audioElements.forEach((audio) => {
    audio.volume = volume;
  });
  localStorage.setItem("volume", value);
}

export function initAudio() {
  const volumeControl = document.getElementById("volumeControl");
  const savedVolume = localStorage.getItem("volume") || 100;
  volumeControl.value = savedVolume;
  updateVolume(savedVolume);

  volumeControl.addEventListener("input", (e) => {
    updateVolume(e.target.value);
  });

  // Preload the button hover sound for better performance
  preloadButtonHoverSound();
}
