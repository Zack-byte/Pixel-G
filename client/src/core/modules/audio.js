export function playAudio(sound) {
  var audio = new Audio(`../assets/audio/${sound}.mp3`);
  audio.play();
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
}
