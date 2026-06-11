// Keeps the player inside a circular area (X/Z) so they can't leave the scene.
// Usage: boundary-clamp="radius: 28"
//
// The clamp runs in BOTH tick and tock: movement-controls (aframe-extras) may
// move the rig in either phase, so clamping in both guarantees the player is
// pulled back to the circle after the movement was applied — no escaping.
function registerBoundaryClamp() {
  AFRAME.registerComponent('boundary-clamp', {
    schema: {
      radius: { type: 'number', default: 47 }
    },

    clamp: function () {
      const pos = this.el.object3D.position;
      const r = this.data.radius;
      const distSq = pos.x * pos.x + pos.z * pos.z;

      if (distSq > r * r) {
        // Scale X/Z back onto the circle. The angle is preserved, so pushing
        // into the wall naturally slides the player along it.
        const scale = r / Math.sqrt(distSq);
        pos.x *= scale;
        pos.z *= scale;
      }
    },

    tick: function () {
      this.clamp();
    },

    tock: function () {
      this.clamp();
    }
  });
}
