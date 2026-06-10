// Entry point — registers all A-Frame components and initializes the scene.
function initializeApp() {
  if (!window.AFRAME) {
    console.warn('AFRAME not available yet — deferring initialization.');
    setTimeout(initializeApp, 100);
    return;
  }

  if (window.__deepflow_initialized) return; // idempotent guard
  window.__deepflow_initialized = true;

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
  });

  window.addEventListener('load', () => {
    const gamepads = navigator.getGamepads?.() || [];
    gamepads.forEach(gamepad => {
      if (gamepad) console.log('Existing gamepad:', gamepad);
    });
  });
}

initializeApp();