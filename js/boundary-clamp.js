// Applies circular borders to the player so they can't leave the scene area.
// Usage: boundary-clamp="radius: 28"
function registerBoundaryClamp() {
  AFRAME.registerComponent('boundary-clamp', {
    schema: {
      radius: { type: 'number', default: 47 }
    },

    init: function () {
      this.prevX = this.el.object3D.position.x;
      this.prevZ = this.el.object3D.position.z;
    },

    tick: function () {
      const pos = this.el.object3D.position;
      const r   = this.data.radius;

      if (pos.x * pos.x + pos.z * pos.z > r * r) {
        const dx = pos.x - this.prevX;
        const dz = pos.z - this.prevZ;

        const prevLen = Math.sqrt(this.prevX * this.prevX + this.prevZ * this.prevZ);
        if (prevLen > 0.001) {
          const nx = this.prevX / prevLen;
          const nz = this.prevZ / prevLen;

          const tx = -nz;
          const tz =  nx;

          const tangential = dx * tx + dz * tz;
          pos.x = this.prevX + tx * tangential;
          pos.z = this.prevZ + tz * tangential;

          const newDistSq = pos.x * pos.x + pos.z * pos.z;
          if (newDistSq > r * r) {
            const scale = r / Math.sqrt(newDistSq);
            pos.x *= scale;
            pos.z *= scale;
          }
        }
      }

      this.prevX = pos.x;
      this.prevZ = pos.z;
    }
  });
}
