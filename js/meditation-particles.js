// Glowing star particles that rise in a spiral around the meditation point.
function registerMeditationParticles() {
  AFRAME.registerComponent('meditation-particles', {
    schema: {
      count:       { type: 'number', default: 80 },
      radius:      { type: 'number', default: 1.5 },
      height:      { type: 'number', default: 4 },
      spiralSpeed: { type: 'number', default: 0.6 },
      riseSpeed:   { type: 'number', default: 0.4 },
      size:        { type: 'number', default: 0.08 },
      color:       { type: 'color',  default: '#ffffff' }
    },

    init: function () {
      const { count, radius, height } = this.data;

      this.angles = new Float32Array(count);
      this.heights = new Float32Array(count);

      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        this.angles[i] = Math.random() * Math.PI * 2;
        this.heights[i] = Math.random() * height - height / 2;
        positions[i * 3 + 0] = Math.cos(this.angles[i]) * radius;
        positions[i * 3 + 1] = this.heights[i];
        positions[i * 3 + 2] = Math.sin(this.angles[i]) * radius;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0,    'rgba(255,255,255,1)');
      g.addColorStop(0.3,  'rgba(255,255,255,0.8)');
      g.addColorStop(0.7,  'rgba(255,255,255,0.2)');
      g.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);

      const material = new THREE.PointsMaterial({
        color: new THREE.Color(this.data.color),
        size: this.data.size,
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      this.points = new THREE.Points(geometry, material);
      this.positions = positions;
      this.el.setObject3D('mesh', this.points);
    },

    tick: function (time, delta) {
      const dt = delta / 1000;
      if (dt <= 0) return;

      const { count, radius, height, spiralSpeed, riseSpeed } = this.data;
      const positions = this.positions;
      const half = height / 2;

      for (let i = 0; i < count; i++) {
        this.angles[i] += spiralSpeed * dt;
        this.heights[i] += riseSpeed * dt;

        if (this.heights[i] > half) {
          this.heights[i] = -half;
          this.angles[i] = Math.random() * Math.PI * 2;
        }

        const ix = i * 3;
        positions[ix + 0] = Math.cos(this.angles[i]) * radius;
        positions[ix + 1] = this.heights[i];
        positions[ix + 2] = Math.sin(this.angles[i]) * radius;
      }

      this.points.geometry.attributes.position.needsUpdate = true;
    }
  });
}
