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
      // 1. Safeguard against tab-switching / heavy frame lag spikes
      let dt = delta / 1000;
      if (dt <= 0) return;
      if (dt > 0.1) dt = 0.1; // Caps calculation to max 100ms per frame to prevent hyper-teleportation

      this.time += dt;
      this.steerTime -= dt;

      const pos = this.el.object3D.position;
      const r = this.data.boundary;

      // 2. Horizontal Boundary Check (Cylinder radius check)
      const distSq = pos.x * pos.x + pos.z * pos.z;
      const currentDist = Math.sqrt(distSq);

      if (currentDist > r) {
       
        this.targetDirection.set(-pos.x, 0, -pos.z).normalize();

        
        if (currentDist > r + 1.5) {
          pos.x = (pos.x / currentDist) * r;
          pos.z = (pos.z / currentDist) * r;
          this.direction.set(-pos.x, 0, -pos.z).normalize();
        }
      } else if (this.steerTime <= 0) {
       
        this.targetDirection
          .set(
            Math.random() - 0.5,
            (Math.random() - 0.5) * 0.1,
            Math.random() - 0.5,
          )
          .normalize();
        this.steerTime = 2 + Math.random() * 3; 
      }

      // 3. Vertical Depth Safety Net & Hard Ceiling/Floor Caps
      if (pos.y > 2) {
        this.targetDirection.y = -0.3; 
        if (pos.y > 4) pos.y = 2; 
      } else if (pos.y < -12) {
        this.targetDirection.y = 0.3; 
        if (pos.y < -14) pos.y = -12; 
      }

      this.targetDirection.normalize();

      const lerpAlpha = Math.min(dt * 1.5, 1.0);
      this.direction.lerp(this.targetDirection, lerpAlpha);

      if (this.direction.lengthSq() < 0.0001) {
        this.direction.set(Math.random() - 0.5, 0.05, Math.random() - 0.5);
      }
      this.direction.normalize();

      // 5. Apply step movement safely
      pos.addScaledVector(this.direction, this.speed * dt);

      // 6. Orient the 3D model look direction
      const lookTarget = new THREE.Vector3().copy(pos).add(this.direction);
      this.el.object3D.lookAt(lookTarget);

      // 7. Procedural Tail Wiggle (Kept if you built compound primitive fish shapes)
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

        const box = new THREE.Box3().setFromObject(targetFish);
        const center = new THREE.Vector3();
        box.getCenter(center);

        if (targetFish.parent) {
          targetFish.parent.worldToLocal(center);
        }

        targetFish.position.sub(center);

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
      model: { type: "selector" }, 
      boundary: { type: "number", default: 24 },
      minSpeed: { type: "number", default: 1.5 },
      maxSpeed: { type: "number", default: 4.0 },
      scale: { type: "number", default: 1.0 },
      multiplier: { type: "number", default: 3 }, 
    },

    init: function () {
      if (!this.data.model) {
        console.warn("school-splitter: No model specified.");
        return;
      }

      const modelSrc = this.data.model.getAttribute("src");

      const tempModel = document.createElement("a-gltf-model");
      tempModel.setAttribute("src", modelSrc);
      tempModel.setAttribute("visible", "false");

      tempModel.addEventListener("model-loaded", () => {
        const model = tempModel.getObject3D("mesh");
        if (!model) return;

        const root = model.children[0] || model;
        const fishCount = root.children.length;

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

        if (
          modelSrc === "assets/models/female_orca.glb" ||
          modelSrc === "#orca"
        ) {
          fishParent.setAttribute("orca-info-popup", "");

          gltfModel.setAttribute("class", "clickable");

          const eggShell = document.createElement("a-entity");
          eggShell.setAttribute("glowy-egg", {
            glowColor: "#00ffd5",
            glowIntensity: 2.0,
            pulseSpeed: 1.2,
            scale: 2.2,
          });

          eggShell.setAttribute("class", "clickable");
          eggShell.setAttribute("position", "0 0.5 0");

          eggShell.setAttribute("material", {
            shader: "standard",
            color: "#d9a1ff",
            emissive: "#ff0077",
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.5,
            roughness: 0.05,
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

          gltfModel.addEventListener("model-loaded", () => {
            const mesh3D = gltfModel.getObject3D("mesh");
            if (mesh3D) {
              mesh3D.traverse((node) => {
                if (node.isMesh && node.material) {
                  node.material.emissive = new THREE.Color("#00ffd5");
                  node.material.emissiveIntensity = 0.4;
                }
              });
            }
          });
        }
        if (
          modelSrc === "assets/models/manta_ray_birostris_animated.glb" ||
          modelSrc === "#manta-ray"
        ) {
          // 1. Enable raycast collisions directly on the Manta Ray 3D body
          gltfModel.setAttribute("class", "clickable");

          // 2. Attach the popup component to the parent container
          fishParent.setAttribute("manta-info-popup", "");
          const eggShell = document.createElement("a-entity");
          eggShell.setAttribute("glowy-egg", {
            glowColor: "#00bfff", // Majestic deep sky blue glow
            glowIntensity: 2.2,
            pulseSpeed: 1.0,
            scale: 3.2,
          });

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

  AFRAME.registerComponent("fish-spawner", {
    schema: {
      count: { type: "number", default: 20 },
      boundary: { type: "number", default: 26 },
    },
    init: function () {},
  });
}
