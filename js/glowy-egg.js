// Glowy, clickable egg component for the orca
function registerGlowyEgg() {
  AFRAME.registerComponent("glowy-egg", {
    schema: {
      glowColor: { type: "color", default: "#00ffff" },
      glowIntensity: { type: "number", default: 1.5 },
      pulseSpeed: { type: "number", default: 1.5 },
      scale: { type: "number", default: 1.5 },
      clickRadius: { type: "number", default: 2.0 },
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
      this.el.object3D.add(eggContainer);

      eggContainer.scale.multiplyScalar(this.data.scale);

      eggContainer.position.set(0, 0, 0);

      this.el.addEventListener("click", (evt) => {
        this.onEggClicked(evt);
      });

      // Add hover effects
      this.el.addEventListener("mouseenter", () => {
        this.isHovered = true;
        document.body.style.cursor = "pointer";
      });

      this.el.addEventListener("mouseleave", () => {
        this.isHovered = false;
        document.body.style.cursor = "default";
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
        this.eggContainer.scale.multiplyScalar(1 + bounce * 0.01);
      }
    },

    onEggClicked: function (evt) {
      console.log("Orca egg clicked!");
      this.material.emissiveIntensity = this.baseEmissiveIntensity * 3;
      const originalScale = this.data.scale;
      const pulse = setInterval(() => {
        this.eggContainer.scale.multiplyScalar(1.05);
        setTimeout(() => {
          this.eggContainer.scale.multiplyScalar(0.95);
        }, 50);
      }, 100);

      setTimeout(() => {
        clearInterval(pulse);
        this.eggContainer.scale.multiplyScalar(
          1 / (originalScale / this.data.scale),
        );
        this.material.emissiveIntensity = this.baseEmissiveIntensity;
      }, 300);

      this.el.emit("egg-clicked", { target: this.el });
    },
  });
}
