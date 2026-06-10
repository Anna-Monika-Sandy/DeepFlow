// Entry point — registers all A-Frame components and initializes the scene.
registerSwimBob();
registerMarineSnow();
registerBoundaryClamp();
registerFishSchool();
registerGlowyEgg();
registerInfoPopup();
registerMeditationClick();
registerMeditationAttractor();
registerMeditationMode();
registerBreathingRing();
registerSoundPlayer();
initVideo();

window.addEventListener('gamepadconnected', e => {
  console.log('Gamepad connected:', e.gamepad);
  alert(`Controller detected: ${e.gamepad.id}`);
});

window.addEventListener('load', () => {
  const gamepads = navigator.getGamepads?.() || [];

  gamepads.forEach(gamepad => {
    if (gamepad) {
      console.log('Existing gamepad:', gamepad);
      alert(`Already connected: ${gamepad.id}`);
    }
  });
});