// Glowy, clickable egg component for the orca
function registerGlowyEgg() {
  AFRAME.registerComponent("glowy-egg", {
    schema: {
      glowColor: { type: "color", default: "#00ffff" },
      glowIntensity: { type: "number", default: 1.5 },
      pulseSpeed: { type: "number", default: 1.5 },
      scale: { type: "number", default: 1.5 },
    },

    init: function () {
      this.time = 0;
      this.isHovered = false;

      const geometry = new THREE.IcosahedronGeometry(1, 5);
      geometry.scale(1, 1, 1.4);

      const material = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        emissive: this.data.glowColor,
        emissiveIntensity: this.data.glowIntensity,
        transparent: true,
        opacity: 0.15,
        wireframe: false,
        metalness: 0.2,
        roughness: 0.4,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const eggContainer = new THREE.Group();
      eggContainer.add(mesh);

      this.mesh = mesh;
      this.material = material;
      this.eggContainer = eggContainer;
      this.baseOpacity = 0.15;
      this.baseEmissiveIntensity = this.data.glowIntensity;

      eggContainer.scale.setScalar(this.data.scale);

      // Bind the custom Three.js geometry directly to A-Frame's structural collision system
      this.el.setObject3D("mesh", eggContainer);

      // Simple execution listeners
      this.el.addEventListener("click", (evt) => {
        console.log("🥚 Egg component clicked!");
        // Emits structural click up to orca-info-popup.js without editing any material colors
        this.el.emit("egg-clicked", { target: this.el });
      });

      this.el.addEventListener("mouseenter", () => {
        this.isHovered = true;
      });

      this.el.addEventListener("mouseleave", () => {
        this.isHovered = false;
      });
    },

    tick: function (time, delta) {
      this.time += delta / 1000;
      const pulse =
        Math.sin(this.time * Math.PI * 2 * this.data.pulseSpeed) * 0.5 + 0.5;

      this.material.emissiveIntensity =
        this.baseEmissiveIntensity * (0.6 + pulse * 0.6);
      this.material.opacity = this.baseOpacity + pulse * 0.15;

      this.eggContainer.rotation.y += delta / 5000;

      if (this.isHovered) {
        const bounce = Math.sin(this.time * Math.PI * 4) * 0.1;
        this.eggContainer.scale.setScalar(
          this.data.scale * (1 + bounce * 0.05),
        );
      } else {
        this.eggContainer.scale.setScalar(this.data.scale);
      }
    },
  });
}
