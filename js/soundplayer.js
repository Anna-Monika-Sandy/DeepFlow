function registerSoundPlayer() {
  AFRAME.registerComponent('sound-player', {
    schema: {
      button: { type: 'selector', default: '#soundToggle' }
    },

    init: function () {
      this.button = this.data.button;
      this.updateButton = this.updateButton.bind(this);
      this.toggleSound = this.toggleSound.bind(this);
      this.clearAutoplayBlock = this.clearAutoplayBlock.bind(this);

      if (!this.button) {
        return;
      }

      this.button.addEventListener('click', this.toggleSound);
      window.addEventListener('click', this.clearAutoplayBlock, { once: true });

      if (this.el.sceneEl) {
        this.el.sceneEl.addEventListener('loaded', this.updateButton);
      }

      this.updateButton();
    },

    updateButton: function () {
      const isPlaying = this.el.components?.sound?.isPlaying;
      this.button.textContent = isPlaying ? 'Sound: On' : 'Sound: Off';
    },

    toggleSound: function (event) {
      event.stopPropagation();
      if (!this.el.components?.sound) {
        return;
      }

      if (this.el.components.sound.isPlaying) {
        this.el.components.sound.pauseSound();
      } else {
        this.el.components.sound.playSound();
      }

      this.updateButton();
    },

    clearAutoplayBlock: function () {
      if (this.el.components?.sound && !this.el.components.sound.isPlaying) {
        this.el.components.sound.playSound();
        this.updateButton();
      }
    },

    remove: function () {
      if (this.button) {
        this.button.removeEventListener('click', this.toggleSound);
      }
      window.removeEventListener('click', this.clearAutoplayBlock);
      if (this.el.sceneEl) {
        this.el.sceneEl.removeEventListener('loaded', this.updateButton);
      }
    }
  });
}
