// Register fish components once AFRAME is available
function registerFishSchool() {
  // 1. Core swimming behavior component
  AFRAME.registerComponent("fish-swim", {
    schema: {
      speed: { type: "number", default: 1.5 },
      boundary: { type: "number", default: 26 },
    },

    init: function () {
      this.direction = new THREE.Vector3(
        Math.random() - 0.5,
        (Math.random() - 0.5) * 0.1,
        Math.random() - 0.5,
      ).normalize();

      this.speed = this.data.speed * (0.8 + Math.random() * 0.4);
      this.time = Math.random() * 100;
      this.targetDirection = this.direction.clone();
      this.steerTime = 0;
    },

    tick: function (time, delta) {
      const dt = delta / 1000;
      if (dt <= 0) return;

      this.time += dt;
      this.steerTime -= dt;

      const pos = this.el.object3D.position;
      const r = this.data.boundary;

      // Check boundary
      const distSq = pos.x * pos.x + pos.z * pos.z;
      if (distSq > r * r) {
        this.targetDirection.set(-pos.x, 0, -pos.z).normalize();
      } else if (this.steerTime <= 0) {
        this.targetDirection
          .set(
            this.direction.x + (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.1,
            this.direction.z + (Math.random() - 0.5) * 0.4,
          )
          .normalize();
        this.steerTime = 3 + Math.random() * 4;
      }

      this.direction.lerp(this.targetDirection, dt * 1.5).normalize();
      pos.addScaledVector(this.direction, this.speed * dt);

      if (pos.y < 0.5) pos.y = 0.5;
      if (pos.y > 9.5) pos.y = 9.5;

      // Rotate fish toward movement direction
      const lookTarget = new THREE.Vector3().copy(pos).add(this.direction);
      this.el.object3D.lookAt(lookTarget);

      // Tail wiggle (only applicable to procedural custom-built fish)
      const tail = this.el.querySelector(".fish-tail");
      if (tail) {
        const wiggle = Math.sin(this.time * 2.5 * Math.PI * 2) * 0.2;
        tail.object3D.rotation.y = wiggle;
      }
    },
  });

  // 2. Masking component to isolate a single fish mesh in each cloned instance
  AFRAME.registerComponent("isolate-fish", {
    schema: {
      index: { type: "number", default: 0 },
    },
    init: function () {
      this.el.addEventListener("model-loaded", () => {
        const model = this.el.getObject3D("mesh");
        if (!model) return;

        const root = model.children[0] || model;
        const children = root.children;

        if (children.length === 0) return;

        const targetIndex = Math.min(this.data.index, children.length - 1);
        const targetFish = children[targetIndex];

        // Compute the 3D bounding box center while all meshes are still visible
        const box = new THREE.Box3().setFromObject(targetFish);
        const center = new THREE.Vector3();
        box.getCenter(center);

        if (targetFish.parent) {
          targetFish.parent.worldToLocal(center);
        }

        // Reposition to local coordinates (0, 0, 0) so the fish rotates on its own center
        targetFish.position.sub(center);

        // Hide every other sibling fish mesh in this particular clone
        for (let i = 0; i < children.length; i++) {
          if (i !== targetIndex) {
            children[i].visible = false;
          }
        }
      });
    },
  });

  // 3. School splitter with built-in multiplier to easily scale up separated fish quantity
  AFRAME.registerComponent("school-splitter", {
    schema: {
      model: { type: "selector" }, // Selector pointing to #fish-school
      boundary: { type: "number", default: 24 },
      minSpeed: { type: "number", default: 1.5 },
      maxSpeed: { type: "number", default: 4.0 },
      scale: { type: "number", default: 1.0 },
      multiplier: { type: "number", default: 3 }, // Multiplies the number of separated fish clones spawned
    },

    init: function () {
      if (!this.data.model) {
        console.warn("school-splitter: No model specified.");
        return;
      }

      const modelSrc = this.data.model.getAttribute("src");

      // Spawn a temporary inspection model to read the internal mesh count
      const tempModel = document.createElement("a-gltf-model");
      tempModel.setAttribute("src", modelSrc);
      tempModel.setAttribute("visible", "false");

      tempModel.addEventListener("model-loaded", () => {
        const model = tempModel.getObject3D("mesh");
        if (!model) return;

        const root = model.children[0] || model;
        const fishCount = root.children.length;

        // Loop using the multiplier to populate the environment with independent fish clones
        for (let m = 0; m < this.data.multiplier; m++) {
          for (let i = 0; i < fishCount; i++) {
            const fishParent = document.createElement("a-entity");

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (this.data.boundary - 4);
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            const y = 1.0 + Math.random() * 8.0;

            fishParent.setAttribute("position", { x, y, z });

            const speed =
              this.data.minSpeed +
              Math.random() * (this.data.maxSpeed - this.data.minSpeed);
            fishParent.setAttribute("fish-swim", {
              speed: speed,
              boundary: this.data.boundary,
            });

            // Randomize individual sizing slightly for natural variety
            const scaleVariation = 0.8 + Math.random() * 0.4;
            const finalScale = this.data.scale * scaleVariation;
            fishParent.setAttribute("scale", {
              x: finalScale,
              y: finalScale,
              z: finalScale,
            });

            const gltfModel = document.createElement("a-gltf-model");
            gltfModel.setAttribute("src", modelSrc);
            gltfModel.setAttribute("animation-mixer", "clip: *; loop: repeat");
            gltfModel.setAttribute("isolate-fish", { index: i });

            fishParent.appendChild(gltfModel);
            this.el.appendChild(fishParent);
          }
        }

        // Clean up the temporary structural inspector model
        tempModel.parentNode.removeChild(tempModel);
      });

      this.el.appendChild(tempModel);
    },
  });

  // 4. General GLTF fish spawner for individual models (e.g. emperor-fish, manta-ray, orca)
  AFRAME.registerComponent("gltf-fish-spawner", {
    schema: {
      model: { type: "selector" },
      count: { type: "number", default: 15 },
      boundary: { type: "number", default: 26 },
      minSpeed: { type: "number", default: 1.5 },
      maxSpeed: { type: "number", default: 3.5 },
      scale: { type: "number", default: 1.0 },
    },

    init: function () {
      if (!this.data.model) {
        console.warn("gltf-fish-spawner: No GLTF model selector provided.");
        return;
      }

      const modelSrc = this.data.model.getAttribute("src");

      for (let i = 0; i < this.data.count; i++) {
        const fishParent = document.createElement("a-entity");

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (this.data.boundary - 4);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = 1.0 + Math.random() * 7.0;

        fishParent.setAttribute("position", { x, y, z });

        const finalScale = this.data.scale * (0.8 + Math.random() * 0.4);
        fishParent.setAttribute("scale", {
          x: finalScale,
          y: finalScale,
          z: finalScale,
        });

        const randomSpeed =
          this.data.minSpeed +
          Math.random() * (this.data.maxSpeed - this.data.minSpeed);
        fishParent.setAttribute("fish-swim", {
          speed: randomSpeed,
          boundary: this.data.boundary,
        });

        const gltfModel = document.createElement("a-gltf-model");
        gltfModel.setAttribute("src", modelSrc);
        gltfModel.setAttribute("animation-mixer", "clip: *; loop: repeat");

        fishParent.appendChild(gltfModel);

        // GLOWING ORCA GLASS EGG DESIGN
        if (
          modelSrc === "assets/models/female_orca.glb" ||
          modelSrc === "#orca"
        ) {
          // Create the egg shell wrapper
          const eggShell = document.createElement("a-entity");
          eggShell.setAttribute("glowy-egg", {
            glowColor: "#00ffd5",
            glowIntensity: 2.0,
            pulseSpeed: 1.2,
            scale: 2.2,
          });

          // ADD THIS LINE
          eggShell.setAttribute("class", "clickable");

          eggShell.setAttribute("orca-info-popup", "");
          eggShell.setAttribute("position", "0 0.5 0");

          eggShell.setAttribute("material", {
            shader: "standard",
            color: "#d9a1ff", // Soft lavender base
            emissive: "#ff0077", // Intense neon magenta glow
            emissiveIntensity: 0.6, // Stronger glow to cut through the dark water
            transparent: true,
            opacity: 0.5, // Balanced transparency
            roughness: 0.05, // High-gloss crystal polish
            metalness: 0.3,
            side: "double",
          });

          // Smooth pulsing glow effect mimicking breathing meditation
          eggShell.setAttribute("animation", {
            property: "components.material.material.emissiveIntensity",
            from: 0.3,
            to: 0.7,
            dir: "alternate",
            dur: 2200,
            loop: true,
            easing: "easeInOutSine",
          });

          fishParent.appendChild(eggShell);

          // Internal point light to project light outwards and illuminate the internal orca
          const interiorLight = document.createElement("a-entity");
          interiorLight.setAttribute("light", {
            type: "point",
            color: "#6effeb",
            intensity: 2.5,
            distance: 35,
          });
          fishParent.appendChild(interiorLight);

          // Inject custom emissive material settings directly onto the orca model once loaded
          gltfModel.addEventListener("model-loaded", () => {
            const mesh3D = gltfModel.getObject3D("mesh");
            if (mesh3D) {
              mesh3D.traverse((node) => {
                if (node.isMesh && node.material) {
                  node.material.emissive = new THREE.Color("#00ffd5");
                  node.material.emissiveIntensity = 0.4; // Radiates light through the texture
                }
              });
            }
          });
        }
        // GLOWING MANTA RAY GLASS EGG DESIGN
        if (
          modelSrc === "assets/models/manta_ray_birostris_animated.glb" ||
          modelSrc === "#manta-ray"
        ) {
          // 1. Enable raycast collisions directly on the Manta Ray 3D body
          gltfModel.setAttribute("class", "clickable");

          // 2. Attach the popup component to the parent container
          // so it listens for bubbling clicks from BOTH the body and the egg
          fishParent.setAttribute("manta-info-popup", "");

          // Create the egg shell wrapper
          const eggShell = document.createElement("a-entity");
          eggShell.setAttribute("glowy-egg", {
            glowColor: "#00bfff", // Majestic deep sky blue glow
            glowIntensity: 2.2,
            pulseSpeed: 1.0,
            scale: 3.2,
          });

          // Mark egg as interactive for raycasting pointer tracking
          eggShell.setAttribute("class", "clickable");
          eggShell.setAttribute("position", "0 0 0");

          eggShell.setAttribute("material", {
            shader: "standard",
            color: "#7fd3ff",
            emissive: "#0055ff",
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.45,
            roughness: 0.08,
            metalness: 0.2,
            side: "double",
          });

          // Smooth pulsing glow effect
          eggShell.setAttribute("animation", {
            property: "components.material.material.emissiveIntensity",
            from: 0.2,
            to: 0.8,
            dir: "alternate",
            dur: 2800,
            loop: true,
            easing: "easeInOutSine",
          });

          fishParent.appendChild(eggShell);

          // Internal point light to project ambient underwater blue light
          const interiorLight = document.createElement("a-entity");
          interiorLight.setAttribute("light", {
            type: "point",
            color: "#00e1ff",
            intensity: 2.2,
            distance: 30,
          });
          fishParent.appendChild(interiorLight);
        }

        this.el.appendChild(fishParent);
      }
    },
  });

  // Procedural spawner kept for compatibility
  AFRAME.registerComponent("fish-spawner", {
    schema: {
      count: { type: "number", default: 20 },
      boundary: { type: "number", default: 26 },
    },
    init: function () {},
  });
}
