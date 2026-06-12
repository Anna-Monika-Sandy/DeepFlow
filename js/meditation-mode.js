// Guided 1-minute box-breathing meditation with intro and outro.
function registerMeditationMode() {
  AFRAME.registerComponent('meditation-mode', {
    init: function () {
      this.player = document.querySelector('#player');
      this.panel  = document.querySelector('#meditation-panel');
      this.ring   = this.panel.querySelector('.breathing-ring');
      this.exitBtn = this.panel.querySelector('.exit-btn');   // 3D button (VR)
      this.htmlClose = document.querySelector('#meditationClose'); // HTML button (flat screens)
      this.meditationPoint = document.querySelector('#meditation-point');

      this.instructionLabel = this.createFadeLabel(this.panel.querySelector('.instruction-text'));
      this.phaseLabel       = this.createFadeLabel(this.panel.querySelector('.phase-text'));

      this.active = false;
      this.stepIndex = 0;
      this.stepTime = 0;
      this.cycleTime = 0;
      this.startedAt = 0;
      this.savedWasd = this.player.getAttribute('wasd-controls');
      this.hiddenEntities = [];
      this.fadeSpeed = 1.5;

      // Videosphere has a visible seam — turn its clean side toward the
      // player when meditation starts. Tune seamOffset (deg) if needed.
      this.videosphere = document.querySelector('a-videosphere');
      this.seamOffset = 0;
      this.savedSphereRotY = 0;

      // Meditation script
      this.steps = [
        { text: "You're scuba diving,\ndeep beneath the waves", dur: 5,   scaleFrom: 1,   scaleTo: 1   },
        { text: 'To find your calm,\nfollow your breath',       dur: 5,   scaleFrom: 1,   scaleTo: 1   },
        { text: 'Breathe in slowly...',                         dur: 8,   scaleFrom: 1,   scaleTo: 1.6 },
        { text: '...and slowly out',                            dur: 8,   scaleFrom: 1.6, scaleTo: 1   },
        { text: "Let's begin",                                  dur: 3,   scaleFrom: 1,   scaleTo: 1   },
        { type: 'breathing',                                    dur: 60                                },
        { text: 'Well done',                                    dur: 4,   scaleFrom: 1,   scaleTo: 1   }
      ];

      this.meditationPoint.addEventListener('click', () => this.start());
      this.exitBtn.addEventListener('click', () => this.stop());
      this.exitBtn.addEventListener('mouseenter', () => document.body.classList.add('cursor-pointer'));
      this.exitBtn.addEventListener('mouseleave', () => document.body.classList.remove('cursor-pointer'));

      if (this.htmlClose) this.htmlClose.addEventListener('click', () => this.stop());

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.active) this.stop();
      });

      // Swap between the HTML close button (flat) and the 3D one (VR) on mode change.
      this.el.addEventListener('enter-vr', () => this.updateExitButtons());
      this.el.addEventListener('exit-vr', () => this.updateExitButtons());

      // Keep the panel fitted to the viewport (portrait phones are narrow).
      window.addEventListener('resize', () => { if (this.active) this.fitPanel(); });
    },

    // Scale the whole panel so its widest element fits the visible width at the
    // panel's distance. On wide screens scale stays 1; on narrow/portrait phones
    // it shrinks so nothing overflows the edges.
    fitPanel: function () {
      const cam = this.el.camera;
      if (!cam) return;
      const distance = 2;            // panel is at z = -2 from the camera
      const panelWidth = 1.9;        // widest element (instruction text)
      const vFov = THREE.MathUtils.degToRad(cam.fov);
      const visibleW = 2 * distance * Math.tan(vFov / 2) * cam.aspect;
      const s = Math.min(1, (visibleW * 0.85) / panelWidth);
      this.panel.object3D.scale.set(s, s, s);
    },

    createFadeLabel: function (el) {
      return {
        el: el,
        current: '',
        target: '',
        opacity: 0,
        state: 'idle'
      };
    },

    setFadeText: function (label, text) {
      if (text === label.target) return;
      label.target = text;
      if (label.current === '' || text === '') {
        label.current = text;
        label.el.setAttribute('text', 'value', text);
        label.state = text === '' ? 'fading-out' : 'fading-in';
      } else {
        label.state = 'fading-out';
      }
    },

    updateLabelFade: function (label, dt) {
      if (label.state === 'fading-out') {
        label.opacity -= this.fadeSpeed * dt;
        if (label.opacity <= 0) {
          label.opacity = 0;
          if (label.current !== label.target) {
            label.current = label.target;
            label.el.setAttribute('text', 'value', label.current);
            label.state = label.current === '' ? 'idle' : 'fading-in';
          } else {
            label.state = 'idle';
          }
        }
      } else if (label.state === 'fading-in') {
        label.opacity += this.fadeSpeed * dt;
        if (label.opacity >= 1) {
          label.opacity = 1;
          label.state = 'idle';
        }
      }
      label.el.setAttribute('text', 'opacity', label.opacity);
    },

    resetLabels: function () {
      [this.instructionLabel, this.phaseLabel].forEach((label) => {
        label.current = '';
        label.target = '';
        label.opacity = 0;
        label.state = 'idle';
        label.el.setAttribute('text', 'value', '');
        label.el.setAttribute('text', 'opacity', 0);
      });
    },

    hideWorld: function () {
      const selectors = 'a-gltf-model, [marine-snow], [school-splitter], [gltf-fish-spawner], [glowy-egg], .gard-marker, #meditation-point';
      const all = this.el.querySelectorAll(selectors);
      all.forEach((entity) => {
        if (entity.getAttribute('visible') !== false) {
          this.hiddenEntities.push(entity);
          entity.setAttribute('visible', false);
        }
      });
    },

    showWorld: function () {
      this.hiddenEntities.forEach((entity) => entity.setAttribute('visible', true));
      this.hiddenEntities = [];
    },

    start: function () {
      if (this.active) return;
      this.active = true;
      this.startedAt = performance.now();
      this.stepIndex = 0;
      this.stepTime = 0;
      this.cycleTime = 0;
      this.resetLabels();
      this.fitPanel();
      this.updateExitButtons();
      this.player.removeAttribute('wasd-controls');
      this.panel.setAttribute('visible', true);
      this.hideWorld();
      this.faceCleanSide();
    },

    // Rotate the videosphere so its seamless side faces the player's
    // current view, hiding the texture seam during meditation.
    faceCleanSide: function () {
      if (!this.videosphere || !this.el.camera) return;
      this.savedSphereRotY = this.videosphere.object3D.rotation.y;

      const q = new THREE.Quaternion();
      this.el.camera.getWorldQuaternion(q);
      const camYaw = new THREE.Euler().setFromQuaternion(q, 'YXZ').y;

      this.videosphere.object3D.rotation.y = camYaw + THREE.MathUtils.degToRad(this.seamOffset);
    },

    // Show the HTML × on flat screens, the 3D × in VR — only while meditating.
    updateExitButtons: function () {
      const vr = this.el.is('vr-mode');
      if (this.htmlClose) this.htmlClose.style.display = (this.active && !vr) ? 'flex' : 'none';
      if (this.exitBtn) this.exitBtn.setAttribute('visible', this.active && vr);
    },

    stop: function () {
      if (!this.active) return;
      this.active = false;
      this.panel.setAttribute('visible', false);
      this.updateExitButtons();
      this.showWorld();
      this.player.setAttribute('wasd-controls', this.savedWasd);
      document.body.classList.remove('cursor-pointer');
      if (this.videosphere) {
        this.videosphere.object3D.rotation.y = this.savedSphereRotY;
      }
    },

    tick: function (time, delta) {
      if (!this.active) return;
      const dt = delta / 1000;

      this.updateLabelFade(this.instructionLabel, dt);
      this.updateLabelFade(this.phaseLabel, dt);

      if (this.stepIndex >= this.steps.length) {
        this.stop();
        return;
      }

      const step = this.steps[this.stepIndex];
      this.stepTime += dt;

      if (this.stepTime >= step.dur) {
        this.stepIndex++;
        this.stepTime = 0;
        this.cycleTime = 0;
        return;
      }

      if (step.type === 'breathing') {
        this.setFadeText(this.instructionLabel, '');

        this.cycleTime = (this.cycleTime + dt) % 16;
        const t = this.cycleTime;
        let phase, scale;

        if (t < 4)        { phase = 'Inhale'; scale = 1 + (t / 4) * 0.6; }
        else if (t < 8)   { phase = 'Hold';   scale = 1.6;               }
        else if (t < 12)  { phase = 'Exhale'; scale = 1.6 - ((t - 8) / 4) * 0.6; }
        else              { phase = 'Hold';   scale = 1;                 }

        this.ring.object3D.scale.set(scale, scale, 1);
        this.setFadeText(this.phaseLabel, phase);
      } else {
        this.setFadeText(this.phaseLabel, '');

        const t = this.stepTime / step.dur;
        const scale = step.scaleFrom + (step.scaleTo - step.scaleFrom) * t;
        this.ring.object3D.scale.set(scale, scale, 1);
        this.setFadeText(this.instructionLabel, step.text);
      }
    }
  });
}
