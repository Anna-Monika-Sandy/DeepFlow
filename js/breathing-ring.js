// A ring of small glowing particles in sea colors — used for the breathing meditation.
// Scale is controlled externally (by meditation-mode).
function registerBreathingRing() {
  AFRAME.registerComponent('breathing-ring', {
    schema: {
      count:       { type: 'number', default: 120 },
      radius:      { type: 'number', default: 0.26 },
      size:        { type: 'number', default: 0.025 },
      rotateSpeed: { type: 'number', default: 0.3 },
      rings:       { type: 'number', default: 3 },
      ringSpacing: { type: 'number', default: 0.04 }
    },

    init: function () {
      const { count, radius, rings, ringSpacing } = this.data;

      const palette = [
        new THREE.Color('#00d4aa'),
        new THREE.Color('#7eb8f7'),
        new THREE.Color('#66e6ff'),
        new THREE.Color('#ffffff'),
        new THREE.Color('#00bfa5'),
        new THREE.Color('#a8d8ff')
      ];

      const totalCount = count * rings;
      const positions  = new Float32Array(totalCount * 3);
      const colors     = new Float32Array(totalCount * 3);

      const ringOffset = (rings - 1) / 2;

      for (let ring = 0; ring < rings; ring++) {
        const ringRadius = radius + (ring - ringOffset) * ringSpacing;
        const angleOffset = (ring / rings) * (Math.PI * 2 / count);

        for (let i = 0; i < count; i++) {
          const idx = ring * count + i;
          const angle = (i / count) * Math.PI * 2 + angleOffset + (Math.random() - 0.5) * 0.05;
          const r = ringRadius + (Math.random() - 0.5) * 0.01;
          positions[idx * 3 + 0] = Math.cos(angle) * r;
          positions[idx * 3 + 1] = Math.sin(angle) * r;
          positions[idx * 3 + 2] = 0;

          const c = palette[Math.floor(Math.random() * palette.length)];
          colors[idx * 3 + 0] = c.r;
          colors[idx * 3 + 1] = c.g;
          colors[idx * 3 + 2] = c.b;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0,   'rgba(255,255,255,1)');
      g.addColorStop(0.4, 'rgba(255,255,255,0.7)');
      g.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);

      const material = new THREE.PointsMaterial({
        size: this.data.size,
        map: new THREE.CanvasTexture(canvas),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      this.points = new THREE.Points(geometry, material);
      this.el.setObject3D('mesh', this.points);
    },

    tick: function (time, delta) {
      if (!this.points) return;
      this.points.rotation.z += (delta / 1000) * this.data.rotateSpeed;
    }
  });
}
