// Gently pulses the meditation point when the player is nearby — visual "come closer" cue.
function registerMeditationAttractor() {
  AFRAME.registerComponent('meditation-attractor', {
    schema: {
      triggerDistance: { type: 'number', default: 12 },
      hintDistance:    { type: 'number', default: 20 },
      pulseSpeed:      { type: 'number', default: 1.2 },
      pulseAmount:     { type: 'number', default: 0.15 },
      maxOpacity:      { type: 'number', default: 0.15 },
      activationKey:   { type: 'string', default: 'k' }
    },

    init: function () {
      this.player = document.querySelector('#player');
      this.scene = this.el.sceneEl;
      this.time = 0;
      this.currentInfluence = 0;
      this.hintInfluence = 0;
      this.baseScale = this.el.object3D.scale.x;
      this.clickable = this.el.querySelector('.clickable');
      this.hint = this.el.querySelector('.attractor-hint');

      this.onKeyDown = (e) => {
        if (e.key.toLowerCase() === this.data.activationKey && this.hintInfluence > 0.5) {
          this.el.emit('click');
        }
      };
      window.addEventListener('keydown', this.onKeyDown);
    },

    remove: function () {
      window.removeEventListener('keydown', this.onKeyDown);
    },

    tick: function (time, delta) {
      if (!this.player) return;
      const dt = delta / 1000;
      this.time += dt;

      const p = this.player.object3D.position;
      const e = this.el.object3D.position;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dz = p.z - e.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const target = dist < this.data.triggerDistance ? 1 : 0;
      this.currentInfluence += (target - this.currentInfluence) * dt * 2;

      const hintTarget = dist < this.data.hintDistance ? 1 : 0;
      this.hintInfluence += (hintTarget - this.hintInfluence) * dt * 2;

      const pulse = Math.sin(this.time * Math.PI * 2 * this.data.pulseSpeed) * this.data.pulseAmount;
      const scale = this.baseScale * (1 + pulse * this.currentInfluence);

      this.el.object3D.scale.set(scale, scale, scale);

      if (this.clickable) {
        this.clickable.setAttribute('material', 'opacity', this.currentInfluence * this.data.maxOpacity);
        const shouldBeClickable = this.hintInfluence > 0.1;
        const hasClass = this.clickable.classList.contains('clickable');
        if (shouldBeClickable && !hasClass) {
          this.clickable.classList.add('clickable');
        } else if (!shouldBeClickable && hasClass) {
          this.clickable.classList.remove('clickable');
        }
      }

      if (this.hint) {
        const isVR = this.scene && this.scene.is('vr-mode');
        this.hint.setAttribute('text', 'opacity', isVR ? 0 : this.hintInfluence);
        const camera = this.el.sceneEl.camera;
        if (camera) {
          const camPos = new THREE.Vector3();
          camera.getWorldPosition(camPos);
          const hintPos = new THREE.Vector3();
          this.hint.object3D.getWorldPosition(hintPos);
          const angle = Math.atan2(camPos.x - hintPos.x, camPos.z - hintPos.z);
          this.hint.object3D.rotation.y = angle;
        }
      }
    }
  });
}
