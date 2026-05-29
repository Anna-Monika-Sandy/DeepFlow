// Wobbling effect for swimming player
function registerSwimBob() {
  AFRAME.registerComponent('swim-bob', {
    schema: {
      amplitude: { type: 'number', default: 0.06 },
      frequency: { type: 'number', default: 0.4 }
    },

    init: function () {
      this.time = 0;
      this.prevOffset = 0;
    },

    tick: function (time, delta) {
      this.time += delta / 1000;
      const offset = Math.sin(this.time * Math.PI * 2 * this.data.frequency) * this.data.amplitude;
      this.el.object3D.position.y += offset - this.prevOffset;
      this.prevOffset = offset;
    }
  });
}
