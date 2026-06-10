function registerSoundPlayer() {
  AFRAME.registerComponent('sound-player', {
    schema: {
      button: { type: 'selector', default: '#soundToggle' },
      vrButton: { type: 'selector', default: '#soundToggleIcon' }
    },

    init: function () {
      this.button = this.data.button;
      this.vrButton = this.data.vrButton;
      this.updateButton = this.updateButton.bind(this);
      this.toggleSound = this.toggleSound.bind(this);
      this.isPlayngSound = false;

      if (this.button) {
        this.button.addEventListener('click', this.toggleSound);
      }

      if (this.vrButton) {
        this.vrButton.addEventListener('click', this.toggleSound);
        this.vrButton.addEventListener('triggerdown', this.toggleSound);
      }

      if (this.el.sceneEl) {
        this.el.sceneEl.addEventListener('loaded', this.updateButton);
      }
      // Unlock browser audio on first user interaction
      const context = THREE.AudioContext.getContext();

      this.updateButton();
    },

    updateButton: function () {
      const icon = this.isPlayngSound ? 'assets/images/soundoff.svg' : 'assets/images/soundon.svg';
      const label = this.isPlayngSound ? 'Mute sound' : 'Enable sound';

      if (this.button) {
        this.button.innerHTML = `<img src="${icon}" alt="${label}">`;
        this.button.setAttribute('aria-label', label);
        this.button.title = label;
      }

      if (this.vrButton) {
        const assetId = this.isPlayngSound ? '#soundOffIcon' : '#soundOnIcon';
        this.vrButton.setAttribute('src', assetId);
        this.vrButton.setAttribute('data-label', label);
      }
    },

    toggleSound: function (event) {
      this.isPlayngSound = !this.isPlayngSound;
      event.preventDefault();
      event.stopPropagation();

      const sound = this.el.components?.sound;
      if (!sound) {
        return;
      }

      if (this.isPlayngSound) {
        sound.playSound();
      } else {
        sound.pauseSound();
      }

      setTimeout(() => this.updateButton(), 100);
    },

    remove: function () {
      if (this.button) {
        this.button.removeEventListener('click', this.toggleSound);
      }

      if (this.vrButton) {
        this.vrButton.removeEventListener('click', this.toggleSound);
        this.vrButton.removeEventListener('triggerdown', this.toggleSound);
      }

      if (this.el.sceneEl) {
        this.el.sceneEl.removeEventListener('loaded', this.updateButton);
      }
    }
  });
}
