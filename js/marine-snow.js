// Plankton / marine snow — floating particles in water.
// Uses Three.js Points for performance. Usage: <a-entity marine-snow="speed: 0.1"></a-entity>
function registerMarineSnow() {
AFRAME.registerComponent('marine-snow', {
  schema: {
    count: { type: 'number', default: 400 },
    range: { type: 'number', default: 20 },
    size:  { type: 'number', default: 0.05 },
    speed: { type: 'number', default: 0.15 }
  },

  init: function () {
    const { count, range, size } = this.data;

    this.count  = count;
    this.range  = range;
    this.speed  = this.data.speed;
    this.player = document.querySelector('#player');

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * range * 2;
      positions[i * 3 + 1] = Math.random() * range;
      positions[i * 3 + 2] = (Math.random() - 0.5) * range * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,   'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    g.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);

    const material = new THREE.PointsMaterial({
      color: 0xeaf6ff,
      size: size,
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      alphaTest: 0.01,
      sizeAttenuation: true
    });

    this.points    = new THREE.Points(geometry, material);
    this.positions = positions;
    this.el.setObject3D('mesh', this.points);
  },

  tick: function (time, delta) {
    const dt        = delta / 1000;
    const { count, range, speed } = this;
    const positions = this.positions;

    const camX = this.player ? this.player.object3D.position.x : 0;
    const camZ = this.player ? this.player.object3D.position.z : 0;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      positions[ix + 1] -= speed * dt; 

      const dx = positions[ix + 0] - camX;
      const dz = positions[ix + 2] - camZ;
      if (positions[ix + 1] < 0 || dx * dx + dz * dz > range * range) {
        positions[ix + 0] = camX + (Math.random() - 0.5) * range * 2;
        positions[ix + 1] = range;
        positions[ix + 2] = camZ + (Math.random() - 0.5) * range * 2;
      }
    }

    this.points.geometry.attributes.position.needsUpdate = true;
  }
});
}
