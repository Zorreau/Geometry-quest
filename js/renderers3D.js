/**
 * Armory3DRenderer — Moteur 3D WebGL optimisé & sans fuites de mémoire (Three.js)
 */
class Armory3DRenderer {
  constructor(containerId = "armory-3d-viewport") {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = document.getElementById("armory-3d-canvas");
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(0, 0, 7.5);

    const rendererOptions = { antialias: true, alpha: true };
    if (this.canvas) rendererOptions.canvas = this.canvas;

    this.renderer = new THREE.WebGLRenderer(rendererOptions);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (!this.canvas) {
      this.renderer.setSize(300, 300, true);
      this.container.appendChild(this.renderer.domElement);
      this.canvas = this.renderer.domElement;
    }

    this.itemGroup = new THREE.Group();
    this.scene.add(this.itemGroup);

    this.particlesGroup = new THREE.Group();
    this.scene.add(this.particlesGroup);

    this.setupLights();
    this.initInteraction();

    this.clock = new THREE.Clock();
    this.materialsToPulse = [];

    this.resize();

    this.onWindowResize = () => this.resize();
    window.addEventListener("resize", this.onWindowResize);

    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  resize() {
    if (!this.container || !this.renderer) return;
    const w = Math.max(this.container.clientWidth, 280);
    const h = Math.max(this.container.clientHeight, 220);

    if (w > 0 && h > 0) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, true);
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    this.scene.add(ambientLight);

    this.dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.5);
    this.dirLight1.position.set(5, 5, 5);
    this.scene.add(this.dirLight1);

    this.dirLight2 = new THREE.DirectionalLight(0xff0055, 2.0);
    this.dirLight2.position.set(-5, -5, 3);
    this.scene.add(this.dirLight2);

    this.pointLight = new THREE.PointLight(0x00ff66, 3, 12);
    this.pointLight.position.set(0, 0, 2);
    this.scene.add(this.pointLight);
  }

  initInteraction() {
    if (!this.canvas) return;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    this.onPointerDown = (e) => {
      isDragging = true;
      const touch = e.touches && e.touches.length > 0 ? e.touches[0] : e;
      previousMousePosition = { x: touch.clientX, y: touch.clientY };
    };

    this.onPointerMove = (e) => {
      if (!isDragging || !this.itemGroup) return;
      const touch = e.touches && e.touches.length > 0 ? e.touches[0] : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : null);
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;

      if (clientX === undefined || clientY === undefined) return;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      this.itemGroup.rotation.y += deltaX * 0.015;

      // Verrouillage d'angle vertical (Clamping) pour éviter le renversement du modèle
      const newRotX = this.itemGroup.rotation.x + deltaY * 0.015;
      this.itemGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, newRotX));

      previousMousePosition = { x: clientX, y: clientY };
      if (e.cancelable && e.type.startsWith("touch")) e.preventDefault();
    };

    this.onPointerUp = () => { isDragging = false; };

    this.canvas.addEventListener("mousedown", this.onPointerDown);
    window.addEventListener("mousemove", this.onPointerMove);
    window.addEventListener("mouseup", this.onPointerUp);

    this.canvas.addEventListener("touchstart", this.onPointerDown, { passive: false });
    window.addEventListener("touchmove", this.onPointerMove, { passive: false });
    window.addEventListener("touchend", this.onPointerUp);
  }

  // --- PURGE ET NETTOYAGE RÉCURSIF VRAM SANS FUITE ---
  clearScene() {
    const disposeRecursively = (obj) => {
      if (!obj) return;
      while (obj.children.length > 0) {
        disposeRecursively(obj.children[0]);
        obj.remove(obj.children[0]);
      }
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      }
    };

    disposeRecursively(this.itemGroup);
    disposeRecursively(this.particlesGroup);

    this.itemGroup.rotation.set(0, 0, 0);
    this.materialsToPulse = [];
  }

  // --- DÉSTRUCTION COMPLÈTE À LA FERMETURE DU SHOP ---
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener("resize", this.onWindowResize);

    if (this.canvas) {
      this.canvas.removeEventListener("mousedown", this.onPointerDown);
      this.canvas.removeEventListener("touchstart", this.onPointerDown);
    }
    window.removeEventListener("mousemove", this.onPointerMove);
    window.removeEventListener("mouseup", this.onPointerUp);
    window.removeEventListener("touchmove", this.onPointerMove);
    window.removeEventListener("touchend", this.onPointerUp);

    this.clearScene();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  createParticles(colorHex = 0x00f0ff, count = 80, particleEffect = "sparks") {
    while (this.particlesGroup.children.length > 0) {
      const p = this.particlesGroup.children[0];
      if (p.geometry) p.geometry.dispose();
      if (p.material) p.material.dispose();
      this.particlesGroup.remove(p);
    }

    if (particleEffect === "none") return;

    const color = new THREE.Color(colorHex);

    if (particleEffect === "floatingRings") {
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(2.0 + i * 0.4, 0.015, 12, 48);
        const ringMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.5 - i * 0.1,
          wireframe: true
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3 + i * 0.2;
        ring.rotation.y = i * 0.4;
        this.particlesGroup.add(ring);
      }
    } else if (particleEffect === "laserRays") {
      const lineCount = 16;
      const positions = new Float32Array(lineCount * 6);
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const r1 = 0.5;
        const r2 = 2.8;
        positions[i * 6] = Math.cos(angle) * r1;
        positions[i * 6 + 1] = Math.sin(angle) * r1;
        positions[i * 6 + 2] = (Math.random() - 0.5) * 0.5;
        positions[i * 6 + 3] = Math.cos(angle) * r2;
        positions[i * 6 + 4] = Math.sin(angle) * r2;
        positions[i * 6 + 5] = (Math.random() - 0.5) * 0.5;
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const rays = new THREE.LineSegments(lineGeo, lineMat);
      this.particlesGroup.add(rays);
    } else {
      // "sparks"
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: color,
        size: 0.07,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      const particles = new THREE.Points(geometry, material);
      this.particlesGroup.add(particles);
    }
  }

  // --- MAPPER DE MODÈLES 3D SPÉCIFIQUES ---
  // --- MAPPER DE MODÈLES 3D SPÉCIFIQUES ---
  loadItem(meshType, colorHex = "#00f0ff", skinConfig = null) {
    this.clearScene();

    const config = skinConfig || {};
    const mainColor = config.colorMain ? new THREE.Color(config.colorMain) : new THREE.Color(colorHex);
    const emissiveColor = config.colorGlow ? new THREE.Color(config.colorGlow) : mainColor.clone().multiplyScalar(0.8);
    const accentColor = config.colorAccent ? new THREE.Color(config.colorAccent) : new THREE.Color(0xffffff);
    this.pointLight.color = mainColor;

    switch (meshType) {
      // 1. THÈMES XP / ORBES
      case "xpOrb3d":
        this.buildXpOrb(mainColor, emissiveColor);
        break;

      // 2. AVATARS / PIÈCES / BADGES / MASQUES SPÉCIFIQUES
      case "gamerCoin3d":
      case "avatarCoin3d":
        this.buildGamerCoin3d(mainColor, emissiveColor);
        break;

      case "voxelMaster3d":
      case "voxelCube3d":
        this.buildVoxelMaster3d(mainColor, emissiveColor);
        break;

      case "slayerSkull3d":
      case "skull3d":
        this.buildSlayerSkull3d(mainColor, emissiveColor);
        break;

      case "motorfestHelmet3d":
        this.buildMotorfestHelmet3d(mainColor, emissiveColor);
        break;

      case "raptorVisor3d":
      case "visor3d":
        this.buildRaptorVisor3d(mainColor, emissiveColor);
        break;

      case "spartanHelmet3d":
      case "helmet3d":
        this.buildSpartanHelmet3d(mainColor, emissiveColor);
        break;

      case "cyberShield3d":
      case "shield":
      case "hex_shield":
        this.buildCyberShield3d(mainColor, emissiveColor);
        break;

      case "apexBadge3d":
      case "badge3d":
        this.buildApexBadge3d(mainColor, emissiveColor);
        break;

      case "futCard3d":
      case "cardGold3d":
        this.buildFutCard3d(mainColor, emissiveColor);
        break;

      case "spideyMask3d":
      case "spiderEmblem3d":
        this.buildSpideyMask3d(mainColor, emissiveColor);
        break;

      case "viceBadge3d":
        this.buildViceBadge3d(mainColor, emissiveColor);
        break;

      case "lilithHorns3d":
      case "horns3d":
        this.buildLilithHorns3d(mainColor, emissiveColor);
        break;

      case "omegaRune3d":
        this.buildOmegaRune3d(mainColor, emissiveColor);
        break;

      case "triforce3d":
        this.buildTriforce3d(mainColor, emissiveColor);
        break;

      case "praetorSuit3d":
      case "praetorHelmet3d":
        this.buildPraetorSuit3d(mainColor, emissiveColor);
        break;

      // 3. VISEURS & RÉTICULES
      case "reticleHolo3d":
        this.buildReticleHolo(mainColor, emissiveColor, accentColor, config);
        break;

      case "runeCircle3d":
        this.buildRuneCircle3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "dragonScope3d":
        this.buildDragonScope3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "godEye3d":
        this.buildGodEye3d(mainColor, emissiveColor, accentColor, config);
        break;

      // 4. RÈGLES / LAMES
      case "laserRuler3d":
        this.buildEnergyBlade(mainColor, emissiveColor, accentColor, config);
        break;

      case "dragstripRuler3d":
        this.buildDragstripRuler3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "hiddenBlade3d":
        this.buildHiddenBlade3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "railgunRuler3d":
        this.buildRailgunRuler3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "lightsaberRuler3d":
        this.buildLightsaberRuler3d(mainColor, emissiveColor, accentColor, config);
        break;

      // 5. ÉQUERRES / KATANAS
      case "neonSquare3d":
        this.buildNeonSquare3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "katana3d":
      case "cyber_katana":
        this.buildCyberKatana(mainColor, emissiveColor, accentColor, config);
        break;

      case "excaliburSquare3d":
        this.buildExcaliburSquare3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "redstoneSquare3d":
        this.buildRedstoneSquare3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "voidArcSquare3d":
        this.buildVoidArcSquare3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "iceSquare3d":
        this.buildIceSquare3d(mainColor, emissiveColor, accentColor, config);
        break;

      // 6. RAPPORTEURS / MANOMÈTRES
      case "classicNeonProtractor3d":
        this.buildClassicNeonProtractor3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "chronosDial3d":
        this.buildChronosDial3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "nitroDial3d":
        this.buildNitroDial3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "sawProtractor3d":
        this.buildSawProtractor3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "viceSpeedo3d":
        this.buildViceSpeedo3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "vatsRadar3d":
        this.buildVatsRadar3d(mainColor, emissiveColor, accentColor, config);
        break;

      case "viceMeter3d":
        this.buildRetroDial(mainColor, emissiveColor, accentColor, config);
        break;

      // 7. CANVASES / GRILLES
      case "canvasGrid3d":
        this.buildCanvasGrid(mainColor, emissiveColor, accentColor, config);
        break;

      default:
        this.buildHoloRing(mainColor, emissiveColor);
        break;
    }

    const particleEffect = config.particleEffect || "sparks";
    this.createParticles(mainColor.getHex(), 80, particleEffect);
  }

  // --- CONSTRUCTEURS GÉOMÉTRIQUES 3D DÉDIÉS ---

  buildXpOrb(color, emissive) {
    const geo = new THREE.IcosahedronGeometry(1.5, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 1.4,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    this.materialsToPulse.push(mat);
    const mesh = new THREE.Mesh(geo, mat);

    const innerGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const inner = new THREE.Mesh(innerGeo, innerMat);

    const ringGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;

    this.itemGroup.add(mesh);
    this.itemGroup.add(inner);
    this.itemGroup.add(ring);
  }

  // --- CONSTRUCTEURS GÉOMÉTRIQUES 3D DÉDIÉS (AVATARS) ---

  buildGamerCoin3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Cylinder (médaille mi-métal)
    const coinGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.22, 32);
    coinGeo.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0x0077ff,
      metalness: 0.8,
      roughness: 0.3
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    group.add(coin);

    // 1x Torus (anneau néon cyan)
    const ringGeo = new THREE.TorusGeometry(1.85, 0.07, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 1.5,
      metalness: 0.2,
      roughness: 0.2
    });
    this.materialsToPulse.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // 1x Extrude (croix/boutons manette)
    const crossShape = new THREE.Shape();
    const w = 0.2, h = 0.6;
    crossShape.moveTo(-w, -h); crossShape.lineTo(w, -h); crossShape.lineTo(w, -w);
    crossShape.lineTo(h, -w); crossShape.lineTo(h, w); crossShape.lineTo(w, w);
    crossShape.lineTo(w, h); crossShape.lineTo(-w, h); crossShape.lineTo(-w, w);
    crossShape.lineTo(-h, w); crossShape.lineTo(-h, -w); crossShape.lineTo(-w, -w);
    crossShape.closePath();

    const crossGeo = new THREE.ExtrudeGeometry(crossShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    crossGeo.center();
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.2
    });
    const crossMesh = new THREE.Mesh(crossGeo, crossMat);
    crossMesh.position.z = 0.12;
    group.add(crossMesh);

    this.itemGroup.add(group);
  }

  buildVoxelMaster3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Box interne (Terre)
    const dirtGeo = new THREE.BoxGeometry(2.0, 1.3, 2.0);
    const dirtMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.8,
      metalness: 0.1
    });
    const dirtMesh = new THREE.Mesh(dirtGeo, dirtMat);
    dirtMesh.position.y = -0.35;
    group.add(dirtMesh);

    // 1x Box supérieure (Herbe)
    const grassGeo = new THREE.BoxGeometry(2.05, 0.7, 2.05);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.8,
      metalness: 0.1
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = 0.65;
    group.add(grassMesh);

    // 1x Box fil de fer (cage)
    const wireGeo = new THREE.BoxGeometry(2.25, 2.25, 2.25);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    this.itemGroup.add(group);
  }

  buildSlayerSkull3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Sphere biseautée (crâne low-poly)
    const skullGeo = new THREE.SphereGeometry(1.3, 10, 10);
    const skullMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.7,
      roughness: 0.3
    });
    const skull = new THREE.Mesh(skullGeo, skullMat);
    group.add(skull);

    // 1x Box (mâchoire mécanique)
    const jawGeo = new THREE.BoxGeometry(1.0, 0.65, 0.95);
    const jawMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.85,
      roughness: 0.25
    });
    const jaw = new THREE.Mesh(jawGeo, jawMat);
    jaw.position.set(0, -0.8, 0.3);
    group.add(jaw);

    // 2x Cylinders (vérins hydrauliques)
    const pistonGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0x71717a,
      metalness: 0.95,
      roughness: 0.1
    });
    const pistonL = new THREE.Mesh(pistonGeo, pistonMat);
    pistonL.position.set(-0.55, -0.55, 0.35);
    const pistonR = new THREE.Mesh(pistonGeo, pistonMat);
    pistonR.position.set(0.55, -0.55, 0.35);
    group.add(pistonL);
    group.add(pistonR);

    // 2x Spheres (yeux clignotants)
    const eyeGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 2.0,
      metalness: 0.1,
      roughness: 0.2
    });
    this.materialsToPulse.push(eyeMat);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.4, 0.15, 1.05);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.4, 0.15, 1.05);
    group.add(eyeL);
    group.add(eyeR);

    this.itemGroup.add(group);
  }

  buildMotorfestHelmet3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Sphere profilée (casque aérodynamique)
    const helmetGeo = new THREE.SphereGeometry(1.45, 32, 24);
    helmetGeo.scale(1.0, 0.92, 1.25);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.3
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    group.add(helmet);

    // 1x Cylinder/Visor (visière irisée)
    const visorGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.55, 32, 1, true, -Math.PI / 2.6, (2 * Math.PI) / 2.6);
    const visorMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 1.3,
      metalness: 0.9,
      roughness: 0.1
    });
    this.materialsToPulse.push(visorMat);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.08, 0.22);
    group.add(visor);

    // 2x Torus (entrées d'air nitro)
    const intakeGeo = new THREE.TorusGeometry(0.32, 0.07, 12, 24);
    const intakeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.85,
      roughness: 0.2
    });
    const intakeL = new THREE.Mesh(intakeGeo, intakeMat);
    intakeL.position.set(-0.75, -0.32, 0.95);
    intakeL.rotation.y = -Math.PI / 6;
    const intakeR = new THREE.Mesh(intakeGeo, intakeMat);
    intakeR.position.set(0.75, -0.32, 0.95);
    intakeR.rotation.y = Math.PI / 6;
    group.add(intakeL);
    group.add(intakeR);

    this.itemGroup.add(group);
  }

  buildRaptorVisor3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Extrude (boîtier visière)
    const shape = new THREE.Shape();
    shape.moveTo(-1.3, -0.4); shape.lineTo(1.3, -0.4);
    shape.lineTo(1.1, 0.5); shape.lineTo(-1.1, 0.5);
    shape.closePath();

    const frameGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 });
    frameGeo.center();
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      metalness: 0.6,
      roughness: 0.5
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    group.add(frame);

    // 2x Cylinders (barres de fixation)
    const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.7, 12);
    barGeo.rotateZ(Math.PI / 2);
    const barMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.2
    });
    const barTop = new THREE.Mesh(barGeo, barMat);
    barTop.position.set(0, 0.35, 0.15);
    const barBottom = new THREE.Mesh(barGeo, barMat);
    barBottom.position.set(0, -0.35, 0.15);
    group.add(barTop);
    group.add(barBottom);

    // 3x Cylinders (capteurs IR InGen)
    const sensorGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.35, 16);
    sensorGeo.rotateX(Math.PI / 2);
    const sensorMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 1.8,
      metalness: 0.3,
      roughness: 0.2
    });
    this.materialsToPulse.push(sensorMat);

    const s1 = new THREE.Mesh(sensorGeo, sensorMat);
    s1.position.set(-0.7, 0, 0.25);
    const s2 = new THREE.Mesh(sensorGeo, sensorMat);
    s2.position.set(0, 0.1, 0.28);
    const s3 = new THREE.Mesh(sensorGeo, sensorMat);
    s3.position.set(0.7, 0, 0.25);

    group.add(s1);
    group.add(s2);
    group.add(s3);

    this.itemGroup.add(group);
  }

  buildSpartanHelmet3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Sphere modifiée (dôme SPARTAN)
    const domeGeo = new THREE.SphereGeometry(1.5, 32, 24);
    domeGeo.scale(1.0, 1.05, 1.15);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d,
      metalness: 0.8,
      roughness: 0.25
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    group.add(dome);

    // 1x Extrude (visière hex biseautée Or plasma)
    const hexVisorShape = new THREE.Shape();
    hexVisorShape.moveTo(-1.1, 0.1);
    hexVisorShape.lineTo(-0.7, 0.55);
    hexVisorShape.lineTo(0.7, 0.55);
    hexVisorShape.lineTo(1.1, 0.1);
    hexVisorShape.lineTo(0.8, -0.45);
    hexVisorShape.lineTo(-0.8, -0.45);
    hexVisorShape.closePath();

    const visorGeo = new THREE.ExtrudeGeometry(hexVisorShape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
    visorGeo.center();
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: emissive,
      emissiveIntensity: 1.2,
      metalness: 0.95,
      roughness: 0.1
    });
    this.materialsToPulse.push(visorMat);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.15, 0.95);
    group.add(visor);

    // 2x Cylinders (filtres à air menton)
    const filterGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.45, 16);
    filterGeo.rotateX(Math.PI / 3);
    const filterMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.8,
      roughness: 0.3
    });
    const filterL = new THREE.Mesh(filterGeo, filterMat);
    filterL.position.set(-0.7, -0.65, 0.9);
    filterL.rotation.y = -Math.PI / 6;
    const filterR = new THREE.Mesh(filterGeo, filterMat);
    filterR.position.set(0.7, -0.65, 0.9);
    filterR.rotation.y = Math.PI / 6;
    group.add(filterL);
    group.add(filterR);

    this.itemGroup.add(group);
  }

  buildCyberShield3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Extrude Hexagone (blindage Night City)
    const hexShape = new THREE.Shape();
    const r = 1.6;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      if (i === 0) hexShape.moveTo(x, y); else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    const shieldGeo = new THREE.ExtrudeGeometry(hexShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
    shieldGeo.center();
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.2
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    group.add(shield);

    // 1x Plane (écran HUD)
    const hudGeo = new THREE.PlaneGeometry(2.1, 2.1);
    const hudMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const hud = new THREE.Mesh(hudGeo, hudMat);
    hud.position.z = 0.15;
    group.add(hud);

    // 2x Cylinders (câbles tressés temporaux)
    const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 12);
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      metalness: 0.7,
      roughness: 0.3
    });
    const cableL = new THREE.Mesh(cableGeo, cableMat);
    cableL.position.set(-1.2, 0, 0.05);
    cableL.rotation.z = Math.PI / 12;
    const cableR = new THREE.Mesh(cableGeo, cableMat);
    cableR.position.set(1.2, 0, 0.05);
    cableR.rotation.z = -Math.PI / 12;
    group.add(cableL);
    group.add(cableR);

    this.itemGroup.add(group);
  }

  buildApexBadge3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Extrude Hexagone acéré
    const badgeShape = new THREE.Shape();
    badgeShape.moveTo(0, 1.7);
    badgeShape.lineTo(1.3, 0.8);
    badgeShape.lineTo(1.1, -0.9);
    badgeShape.lineTo(0, -1.6);
    badgeShape.lineTo(-1.1, -0.9);
    badgeShape.lineTo(-1.3, 0.8);
    badgeShape.closePath();

    const badgeGeo = new THREE.ExtrudeGeometry(badgeShape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
    badgeGeo.center();
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.85,
      roughness: 0.2
    });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    group.add(badge);

    // 1x Cone inversé (bouclier pointe)
    const tipGeo = new THREE.ConeGeometry(0.7, 1.3, 3);
    tipGeo.rotateZ(Math.PI);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: emissive,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.15
    });
    this.materialsToPulse.push(tipMat);
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(0, 0.1, 0.18);
    group.add(tip);

    // 2x Extrude (ailes mécaniques)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0); wingShape.lineTo(0.9, 0.6); wingShape.lineTo(0.7, -0.4); wingShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.08, bevelEnabled: false });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.2
    });
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-1.1, 0.2, 0.1);
    wingL.rotation.y = Math.PI;
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(1.1, 0.2, 0.1);
    group.add(wingL);
    group.add(wingR);

    this.itemGroup.add(group);
  }

  buildFutCard3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Extrude Shield (carte 3D FUT)
    const cardShape = new THREE.Shape();
    cardShape.moveTo(-1.2, -1.5);
    cardShape.lineTo(1.2, -1.5);
    cardShape.lineTo(1.4, 1.1);
    cardShape.lineTo(0, 1.7);
    cardShape.lineTo(-1.4, 1.1);
    cardShape.closePath();

    const cardGeo = new THREE.ExtrudeGeometry(cardShape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
    cardGeo.center();
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.95,
      roughness: 0.15
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    group.add(card);

    // 1x Extrude (écusson relief "+99")
    const emblemShape = new THREE.Shape();
    const r = 0.6;
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      if (i === 0) emblemShape.moveTo(x, y); else emblemShape.lineTo(x, y);
    }
    emblemShape.closePath();

    const emblemGeo = new THREE.ExtrudeGeometry(emblemShape, { depth: 0.08, bevelEnabled: false });
    emblemGeo.center();
    const emblemMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      metalness: 0.9,
      roughness: 0.2
    });
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.position.set(0, 0.2, 0.12);
    group.add(emblem);

    // 1x Torus (rebord brillant)
    const ringGeo = new THREE.TorusGeometry(1.65, 0.05, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 1.0,
      metalness: 0.95,
      roughness: 0.1
    });
    this.materialsToPulse.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = 0.08;
    group.add(ring);

    this.itemGroup.add(group);
  }

  buildSpideyMask3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Cylinder bombé (masque)
    const maskGeo = new THREE.CylinderGeometry(1.2, 1.0, 2.2, 32);
    maskGeo.rotateX(Math.PI / 2);
    const maskMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.3,
      roughness: 0.4
    });
    const mask = new THREE.Mesh(maskGeo, maskMat);
    group.add(mask);

    // 4x Torus (toile 3D relief sans scale négatif)
    const webMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const radii = [0.4, 0.7, 1.0, 1.25];
    radii.forEach(r => {
      const webGeo = new THREE.TorusGeometry(r, 0.025, 12, 32);
      const web = new THREE.Mesh(webGeo, webMat);
      web.position.z = 0.65;
      group.add(web);
    });

    // 2x Extrude (yeux - symétrie par rotation Y sans destruction des normales)
    const eyeShape = new THREE.Shape();
    eyeShape.moveTo(0, 0.35);
    eyeShape.lineTo(0.5, 0.1);
    eyeShape.lineTo(0.35, -0.35);
    eyeShape.lineTo(-0.2, -0.1);
    eyeShape.closePath();

    const eyeGeo = new THREE.ExtrudeGeometry(eyeShape, { depth: 0.06, bevelEnabled: false });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: emissive,
      emissiveIntensity: 1.5,
      metalness: 0.2,
      roughness: 0.2
    });
    this.materialsToPulse.push(eyeMat);

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.42, 0.2, 0.95);
    eyeL.rotation.z = Math.PI / 12;

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.42, 0.2, 0.95);
    eyeR.rotation.y = Math.PI;
    eyeR.rotation.z = -Math.PI / 12;

    group.add(eyeL);
    group.add(eyeR);

    this.itemGroup.add(group);
  }

  buildViceBadge3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Cylinder (médaillon)
    const medGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.2, 32);
    medGeo.rotateX(Math.PI / 2);
    const medMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      metalness: 0.7,
      roughness: 0.2
    });
    const med = new THREE.Mesh(medGeo, medMat);
    group.add(med);

    // 1x Circle (soleil néon)
    const sunGeo = new THREE.CircleGeometry(1.15, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.z = 0.11;
    group.add(sun);

    // 2x Extrude (silhouettes palmiers 3D)
    const palmShape = new THREE.Shape();
    palmShape.moveTo(-0.05, -0.6); palmShape.lineTo(0.05, -0.6);
    palmShape.lineTo(0.08, 0.2); palmShape.lineTo(0.3, 0.4);
    palmShape.lineTo(0.05, 0.25); palmShape.lineTo(-0.3, 0.4);
    palmShape.lineTo(-0.05, 0.25); palmShape.lineTo(0, 0.6);
    palmShape.closePath();

    const palmGeo = new THREE.ExtrudeGeometry(palmShape, { depth: 0.05, bevelEnabled: false });
    const palmMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: emissive,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.3
    });
    this.materialsToPulse.push(palmMat);

    const palmL = new THREE.Mesh(palmGeo, palmMat);
    palmL.position.set(-0.4, -0.1, 0.15);
    const palmR = new THREE.Mesh(palmGeo, palmMat);
    palmR.position.set(0.4, -0.1, 0.15);
    palmR.rotation.y = Math.PI;

    group.add(palmL);
    group.add(palmR);

    this.itemGroup.add(group);
  }

  buildLilithHorns3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Extrude (cimier frontal)
    const crownShape = new THREE.Shape();
    crownShape.moveTo(-0.8, -0.2); crownShape.lineTo(0, 0.5); crownShape.lineTo(0.8, -0.2);
    crownShape.lineTo(0.4, -0.5); crownShape.lineTo(-0.4, -0.5); crownShape.closePath();

    const crownGeo = new THREE.ExtrudeGeometry(crownShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
    crownGeo.center();
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.8,
      roughness: 0.2
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    group.add(crown);

    // 4x Cone/Cylinder (cornes torsadées démoniaques)
    const hornMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 1.5,
      metalness: 0.4,
      roughness: 0.3
    });
    this.materialsToPulse.push(hornMat);

    const hornGeo1 = new THREE.ConeGeometry(0.35, 2.2, 16);
    const h1L = new THREE.Mesh(hornGeo1, hornMat);
    h1L.position.set(-0.6, 0.8, 0);
    h1L.rotation.z = Math.PI / 5;
    const h1R = new THREE.Mesh(hornGeo1, hornMat);
    h1R.position.set(0.6, 0.8, 0);
    h1R.rotation.z = -Math.PI / 5;

    const hornGeo2 = new THREE.ConeGeometry(0.28, 1.8, 16);
    const h2L = new THREE.Mesh(hornGeo2, hornMat);
    h2L.position.set(-1.1, 0.4, -0.2);
    h2L.rotation.z = Math.PI / 3;
    const h2R = new THREE.Mesh(hornGeo2, hornMat);
    h2R.position.set(1.1, 0.4, -0.2);
    h2R.rotation.z = -Math.PI / 3;

    group.add(h1L); group.add(h1R);
    group.add(h2L); group.add(h2R);

    this.itemGroup.add(group);
  }

  buildOmegaRune3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Box martelée (bloc acier)
    const blockGeo = new THREE.BoxGeometry(2.3, 2.3, 0.4);
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.4
    });
    const block = new THREE.Mesh(blockGeo, blockMat);
    group.add(block);

    // 1x Extrude (glyphe Oméga Ω en haut-relief avec balafre)
    const omegaShape = new THREE.Shape();
    const r = 0.75;
    omegaShape.absarc(0, 0.2, r, -Math.PI * 0.2, Math.PI * 1.2, false);
    omegaShape.lineTo(0.9, -0.6);
    omegaShape.lineTo(0.4, -0.6);
    omegaShape.lineTo(0.3, -0.3);
    omegaShape.absarc(0, 0.2, r - 0.25, Math.PI * 1.1, -Math.PI * 0.1, true);
    omegaShape.lineTo(-0.3, -0.3);
    omegaShape.lineTo(-0.4, -0.6);
    omegaShape.lineTo(-0.9, -0.6);
    omegaShape.closePath();

    const omegaGeo = new THREE.ExtrudeGeometry(omegaShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
    omegaGeo.center();
    const omegaMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 1.8,
      metalness: 0.3,
      roughness: 0.2
    });
    this.materialsToPulse.push(omegaMat);

    const omegaMesh = new THREE.Mesh(omegaGeo, omegaMat);
    omegaMesh.position.z = 0.22;
    group.add(omegaMesh);

    this.itemGroup.add(group);
  }

  buildTriforce3d(color, emissive) {
    const group = new THREE.Group();

    // 3x Cone (pyramides or régulières)
    const triMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: emissive,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.1
    });
    this.materialsToPulse.push(triMat);

    const pyramidGeo = new THREE.ConeGeometry(0.85, 1.3, 3);
    const topP = new THREE.Mesh(pyramidGeo, triMat);
    topP.position.set(0, 0.75, 0);

    const leftP = new THREE.Mesh(pyramidGeo, triMat);
    leftP.position.set(-0.75, -0.55, 0);

    const rightP = new THREE.Mesh(pyramidGeo, triMat);
    rightP.position.set(0.75, -0.55, 0);

    group.add(topP);
    group.add(leftP);
    group.add(rightP);

    // 1x Cylinder (socle cristal d'émeraude)
    const baseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.35, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      metalness: 0.8,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -1.35;
    group.add(base);

    this.itemGroup.add(group);
  }

  buildPraetorSuit3d(color, emissive) {
    const group = new THREE.Group();

    // 1x Box/Extrude (casque lourd Doom Slayer)
    const helmetGeo = new THREE.BoxGeometry(2.0, 1.85, 1.8);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      metalness: 0.8,
      roughness: 0.5
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    group.add(helmet);

    // 1x Extrude (visière centrale écarlate)
    const visorShape = new THREE.Shape();
    visorShape.moveTo(-0.8, 0.4); visorShape.lineTo(0.8, 0.4);
    visorShape.lineTo(0.6, -0.2); visorShape.lineTo(0.2, -0.6);
    visorShape.lineTo(-0.2, -0.6); visorShape.lineTo(-0.6, -0.2);
    visorShape.closePath();

    const visorGeo = new THREE.ExtrudeGeometry(visorShape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 });
    visorGeo.center();
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      emissive: emissive,
      emissiveIntensity: 2.0,
      metalness: 0.3,
      roughness: 0.2
    });
    this.materialsToPulse.push(visorMat);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.1, 0.92);
    group.add(visor);

    // 2x Cylinders (respirateurs d'Argent)
    const respGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.7, 16);
    respGeo.rotateX(Math.PI / 3);
    const respMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.9,
      roughness: 0.2
    });
    const respL = new THREE.Mesh(respGeo, respMat);
    respL.position.set(-0.85, -0.55, 0.85);
    respL.rotation.y = -Math.PI / 6;
    const respR = new THREE.Mesh(respGeo, respMat);
    respR.position.set(0.85, -0.55, 0.85);
    respR.rotation.y = Math.PI / 6;

    group.add(respL);
    group.add(respR);

    this.itemGroup.add(group);
  }

  buildReticleHolo(colorMain, colorGlow, colorAccent, item = {}) {
    const group = new THREE.Group();
    const skinId = item.id || "";

    const stdMat = new THREE.MeshStandardMaterial({
      color: colorMain,
      emissive: colorGlow,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.85,
      wireframe: item.config3D ? item.config3D.wireframe : false,
      roughness: item.config3D ? item.config3D.roughness : 0.2,
      metalness: item.config3D ? item.config3D.metalness : 0.3
    });
    this.materialsToPulse.push(stdMat);

    const accentMat = new THREE.MeshStandardMaterial({
      color: colorAccent,
      emissive: colorAccent,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.9,
      roughness: 0.1,
      metalness: 0.8
    });
    this.materialsToPulse.push(accentMat);

    if (skinId === "skin_crosshair_red_dot") {
      const tubeGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32, 1, true);
      tubeGeo.rotateX(Math.PI / 2);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.1 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);

      const lensGeo = new THREE.RingGeometry(0.2, 0.75, 32);
      const lensMat = new THREE.MeshStandardMaterial({ color: colorAccent, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const lens = new THREE.Mesh(lensGeo, lensMat);

      const dotGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const dot = new THREE.Mesh(dotGeo, stdMat);

      group.add(tube);
      group.add(lens);
      group.add(dot);
    } else if (skinId === "skin_crosshair_halo_plasma") {
      const ring1Geo = new THREE.TorusGeometry(1.6, 0.06, 16, 64);
      const ring2Geo = new THREE.TorusGeometry(1.0, 0.04, 16, 48);
      const r1 = new THREE.Mesh(ring1Geo, stdMat);
      const r2 = new THREE.Mesh(ring2Geo, accentMat);

      const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const orb = new THREE.Mesh(orbGeo, stdMat);

      group.add(r1);
      group.add(r2);
      group.add(orb);
    } else if (skinId === "skin_crosshair_valorant_phantom") {
      for (let i = 0; i < 4; i++) {
        const barGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);
        const bar = new THREE.Mesh(barGeo, stdMat);
        const angle = (i * Math.PI) / 2;
        bar.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0);
        bar.rotation.z = angle;
        group.add(bar);
      }
      const centerDiamondGeo = new THREE.OctahedronGeometry(0.2, 0);
      const centerDiamond = new THREE.Mesh(centerDiamondGeo, accentMat);
      group.add(centerDiamond);
    } else if (skinId === "skin_crosshair_dino_tracker") {
      const frameBoxGeo = new THREE.RingGeometry(1.2, 1.4, 4);
      const frame = new THREE.Mesh(frameBoxGeo, stdMat);

      const gridGeo = new THREE.RingGeometry(0.4, 1.1, 32);
      const gridMat = new THREE.MeshStandardMaterial({ color: colorMain, wireframe: true, transparent: true, opacity: 0.6 });
      const grid = new THREE.Mesh(gridGeo, gridMat);

      const pointerGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
      const pointer = new THREE.Mesh(pointerGeo, accentMat);
      pointer.rotation.z = Math.PI;

      group.add(frame);
      group.add(grid);
      group.add(pointer);
    } else if (skinId === "skin_crosshair_spider_sense") {
      for (let i = 0; i < 4; i++) {
        const arcGeo = new THREE.TorusGeometry(1.4, 0.05, 8, 24, Math.PI / 3);
        const arc = new THREE.Mesh(arcGeo, stdMat);
        arc.rotation.z = (i * Math.PI) / 2 + Math.PI / 12;
        group.add(arc);
      }
      const centerGeo = new THREE.OctahedronGeometry(0.25, 0);
      const center = new THREE.Mesh(centerGeo, accentMat);
      group.add(center);
    } else if (skinId === "skin_crosshair_matrix_code") {
      const cylGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 16, 8, true);
      const cylMat = new THREE.MeshStandardMaterial({ color: colorMain, emissive: colorGlow, wireframe: true, transparent: true, opacity: 0.8 });
      const cyl = new THREE.Mesh(cylGeo, cylMat);

      const ringGeo = new THREE.TorusGeometry(1.0, 0.04, 16, 32);
      const ring = new THREE.Mesh(ringGeo, stdMat);

      const dotGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const dot = new THREE.Mesh(dotGeo, accentMat);

      group.add(cyl);
      group.add(ring);
      group.add(dot);
    } else {
      // Standard Tactical / Fallback dynamiquement lié
      const ring1 = new THREE.TorusGeometry(1.8, 0.03, 16, 64);
      const ring2 = new THREE.TorusGeometry(1.0, 0.02, 16, 48);
      const m1 = new THREE.Mesh(ring1, stdMat);
      const m2 = new THREE.Mesh(ring2, stdMat);

      const centerGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const centerMat = new THREE.MeshStandardMaterial({
        color: colorMain,
        emissive: colorGlow,
        emissiveIntensity: 2.0,
        transparent: true,
        opacity: 0.95
      });
      this.materialsToPulse.push(centerMat);
      const center = new THREE.Mesh(centerGeo, centerMat);

      group.add(m1);
      group.add(m2);
      group.add(center);
    }

    this.itemGroup.add(group);
  }

  buildRuneCircle3d(colorMain, colorGlow, colorAccent, item = {}) {
    const group = new THREE.Group();

    // Pentagramme extrudé en 3D
    const shape = new THREE.Shape();
    const points = 5;
    const outerR = 1.4;
    const innerR = 0.55;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / points - Math.PI / 2;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const pentaGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    pentaGeo.center();

    const pentaMat = new THREE.MeshStandardMaterial({
      color: colorMain,
      emissive: colorGlow,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.9
    });
    this.materialsToPulse.push(pentaMat);
    const pentagram = new THREE.Mesh(pentaGeo, pentaMat);
    group.add(pentagram);

    // Cercles concentriques avec relief Z
    const ring1Geo = new THREE.TorusGeometry(1.6, 0.04, 16, 64);
    const ring2Geo = new THREE.TorusGeometry(1.85, 0.03, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: colorAccent, emissive: colorMain, emissiveIntensity: 1.2, metalness: 0.8 });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring1.position.z = 0.05;
    ring2.position.z = -0.05;
    group.add(ring1);
    group.add(ring2);

    // Cœur infernal en flammes
    const heartGeo = new THREE.IcosahedronGeometry(0.3, 1);
    const heartMat = new THREE.MeshStandardMaterial({ color: colorMain, emissive: 0xff0033, emissiveIntensity: 2.2, roughness: 0.1 });
    this.materialsToPulse.push(heartMat);
    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.position.z = 0.1;
    group.add(heart);

    this.itemGroup.add(group);
  }

  buildDragonScope3d(colorMain, colorGlow, colorAccent, item = {}) {
    const group = new THREE.Group();

    // Corps cylindrique (longueur réduite à 2.2, semi-transparent)
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.7, 2.2, 32);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorMain,
      emissive: colorGlow,
      emissiveIntensity: 1.0,
      metalness: 0.95,
      roughness: 0.1,
      transparent: true,
      opacity: 0.65
    });
    this.materialsToPulse.push(bodyMat);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Bagues tactiques de réglage
    for (let posZ of [-0.6, 0.6]) {
      const ringGeo = new THREE.TorusGeometry(0.68, 0.05, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: colorAccent, metalness: 0.9, roughness: 0.2 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = posZ;
      group.add(ring);
    }

    // Lentilles frontale et arrière
    const lensGeo = new THREE.CircleGeometry(0.48, 32);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    const frontLens = new THREE.Mesh(lensGeo, lensMat);
    frontLens.position.z = 1.1;
    const rearLens = new THREE.Mesh(lensGeo, lensMat);
    rearLens.position.z = -1.1;
    group.add(frontLens);
    group.add(rearLens);

    // Réticule mil-dot interne
    const crossMat = new THREE.MeshBasicMaterial({ color: colorMain });
    const hLine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.015, 0.015), crossMat);
    const vLine = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.7, 0.015), crossMat);
    group.add(hLine);
    group.add(vLine);

    this.itemGroup.add(group);
  }

  buildGodEye3d(colorMain, colorGlow, colorAccent, item = {}) {
    const group = new THREE.Group();

    // Octaèdre de la pupille céleste
    const pupilGeo = new THREE.OctahedronGeometry(0.8, 1);
    const pupilMat = new THREE.MeshStandardMaterial({
      color: colorMain,
      emissive: colorGlow,
      emissiveIntensity: 2.0,
      metalness: 0.9,
      roughness: 0.05
    });
    this.materialsToPulse.push(pupilMat);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    group.add(pupil);

    // Grand tore de Grâce circulaire
    const torusGeo = new THREE.TorusGeometry(1.8, 0.05, 16, 64);
    const torusMat = new THREE.MeshStandardMaterial({
      color: colorMain,
      emissive: colorGlow,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1
    });
    const outerTorus = new THREE.Mesh(torusGeo, torusMat);
    group.add(outerTorus);

    // Anneau elliptique incliné à 45°
    const orbitRingGeo = new THREE.TorusGeometry(2.1, 0.03, 16, 64);
    const orbitMat = new THREE.MeshStandardMaterial({
      color: colorAccent,
      emissive: colorGlow,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8,
      metalness: 0.8
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 4;
    orbitRing.rotation.y = Math.PI / 6;
    group.add(orbitRing);

    this.itemGroup.add(group);
  }

  // --- UTILITAIRE DE GÉNÉRATION DYNAMIQUE DE TEXTURE DE GRADUATION (CANVAS 2D) ---
  createGraduationTexture(options = {}) {
    const width = options.width || 512;
    const height = options.height || 64;
    const lineColor = options.lineColor || options.colorMain || "#00f0ff";
    const textColor = options.textColor || "#ffffff";
    const bg = options.bg || "rgba(0, 0, 0, 0)";
    const maxCm = options.maxCm || 10;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (bg && bg !== "transparent") {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.strokeStyle = lineColor;
    ctx.fillStyle = textColor;
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const mmCount = maxCm * 10;
    const step = width / mmCount;

    for (let i = 0; i <= mmCount; i++) {
      const x = i * step;
      const isCm = i % 10 === 0;
      const isHalfCm = i % 5 === 0 && !isCm;

      let tickHeight = height * 0.25;
      if (isCm) {
        tickHeight = height * 0.65;
        ctx.lineWidth = 2.5;
      } else if (isHalfCm) {
        tickHeight = height * 0.45;
        ctx.lineWidth = 1.8;
      } else {
        tickHeight = height * 0.25;
        ctx.lineWidth = 1.0;
      }

      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, height - tickHeight);
      ctx.stroke();

      if (isCm && x > 10 && x < width - 10) {
        const cmVal = i / 10;
        ctx.fillText(cmVal.toString(), x, height - tickHeight - 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  // --- CONSTRUCTEURS 3D : RÈGLES TACTIQUES ---

  buildLaserRuler3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#00f0ff");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#00f0ff");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#0088cc");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Corps principal plat extrudé biseauté (0.25 x 3.5 x 0.08)
    const shape = new THREE.Shape();
    const w = 0.25, h = 3.5;
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2, -h / 2);
    shape.lineTo(w / 2, h / 2);
    shape.lineTo(-w / 2, h / 2);
    shape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.center();

    const baseEmissive = 1.2;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.8,
      roughness: config.roughness !== undefined ? config.roughness : 0.2,
      map: gradTexture
    });
    bodyMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(bodyMat);

    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(bodyMesh);

    // 2. Rainure centrale émissive (BoxGeometry)
    const grooveGeo = new THREE.BoxGeometry(0.08, 2.8, 0.04);
    grooveGeo.center();
    const grooveMat = new THREE.MeshStandardMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 1.5,
      metalness: 0.5,
      roughness: 0.1
    });
    grooveMat.userData.baseEmissiveIntensity = 1.5;
    this.materialsToPulse.push(grooveMat);

    const grooveMesh = new THREE.Mesh(grooveGeo, grooveMat);
    grooveMesh.position.z = 0.045;
    group.add(grooveMesh);

    // 3. Poignée inférieure ergonomique (CylinderGeometry)
    const hiltGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.6, 16);
    hiltGeo.center();
    const hiltMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.9,
      roughness: 0.3
    });
    const hiltMesh = new THREE.Mesh(hiltGeo, hiltMat);
    hiltMesh.position.y = -1.45;
    group.add(hiltMesh);

    this.itemGroup.add(group);
  }

  buildEnergyBlade(color, emissive, accent, config) {
    this.buildLaserRuler3d(color, emissive, accent, config);
  }

  buildQuantumRuler3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ff9900");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ff9900");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#00aaff");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Double rail en céramique composite
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.7,
      roughness: 0.15,
      map: gradTexture
    });

    const railGeo1 = new THREE.BoxGeometry(0.1, 3.6, 0.18);
    railGeo1.center();
    const rail1 = new THREE.Mesh(railGeo1, railMat);
    rail1.position.x = -0.18;

    const railGeo2 = new THREE.BoxGeometry(0.1, 3.6, 0.18);
    railGeo2.center();
    const rail2 = new THREE.Mesh(railGeo2, railMat);
    rail2.position.x = 0.18;

    group.add(rail1);
    group.add(rail2);

    // 2. Tube central conducteur de flux
    const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.3, 16);
    tubeGeo.center();

    const baseEmissive = 1.5;
    const tubeMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    tubeMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(tubeMat);

    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tube);

    // 3. Embouts de focalisation quantique
    const capGeoTop = new THREE.ConeGeometry(0.15, 0.35, 16);
    capGeoTop.center();
    const capMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.2
    });
    capMat.userData.baseEmissiveIntensity = 1.2;
    this.materialsToPulse.push(capMat);

    const capTop = new THREE.Mesh(capGeoTop, capMat);
    capTop.position.y = 1.625;

    const capGeoBot = new THREE.ConeGeometry(0.15, 0.35, 16);
    capGeoBot.rotateZ(Math.PI);
    capGeoBot.center();
    const capBot = new THREE.Mesh(capGeoBot, capMat);
    capBot.position.y = -1.625;

    group.add(capTop);
    group.add(capBot);

    this.itemGroup.add(group);
  }

  buildDragstripRuler3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ff9900");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ff9900");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#18181b");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffaa00",
      bg: "rgba(20, 20, 20, 0.8)",
      maxCm: 10
    });

    // 1. Lame profilée en fibre de carbone
    const shape = new THREE.Shape();
    const w = 0.4, h = 3.1;
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2, -h / 2);
    shape.lineTo(w / 2, h / 2);
    shape.lineTo(-w / 2, h / 2);
    shape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.center();

    const baseEmissive = 1.0;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.9,
      roughness: config.roughness !== undefined ? config.roughness : 0.3,
      map: gradTexture
    });
    bodyMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(bodyMat);

    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.15;
    group.add(body);

    // 2. Cadran de compte-tours supérieur ultra-plat
    const dialGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.06, 32);
    dialGeo.rotateX(Math.PI / 2);
    dialGeo.center();

    const dialMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.2
    });
    dialMat.userData.baseEmissiveIntensity = 0.8;
    this.materialsToPulse.push(dialMat);

    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.set(0, 1.4, 0.04);
    group.add(dial);

    // 3. Aiguille en relief
    const needleGeo = new THREE.ConeGeometry(0.04, 0.35, 8);
    needleGeo.center();
    const needleMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: mainColor,
      emissiveIntensity: 2.0,
      metalness: 0.5
    });
    needleMat.userData.baseEmissiveIntensity = 2.0;
    this.materialsToPulse.push(needleMat);

    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(0, 1.4, 0.08);
    needle.rotation.z = -Math.PI / 4;
    group.add(needle);

    this.itemGroup.add(group);
  }

  buildHiddenBlade3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#00f0ff");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#00f0ff");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#94a3b8");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Lame rétractable double tranchant biseautée
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.6);
    shape.lineTo(0.16, 1.3);
    shape.lineTo(0.16, -1.3);
    shape.lineTo(0, -1.6);
    shape.lineTo(-0.16, -1.3);
    shape.lineTo(-0.16, 1.3);
    shape.closePath();

    const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bladeGeo.center();

    const baseEmissive = 1.8;
    const bladeMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.95,
      roughness: config.roughness !== undefined ? config.roughness : 0.05,
      map: gradTexture
    });
    bladeMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(bladeMat);

    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.2;
    group.add(blade);

    // 2. Ancrage poignet / Brassard d'ancrage
    const wristGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.5, 16);
    wristGeo.center();
    const wristMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3
    });
    const wrist = new THREE.Mesh(wristGeo, wristMat);
    wrist.position.y = -1.45;
    group.add(wrist);

    // 3. Insigne / Symbole gravé émissif
    const crestGeo = new THREE.OctahedronGeometry(0.12, 0);
    crestGeo.center();
    const crestMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: 2.2,
      metalness: 0.9
    });
    crestMat.userData.baseEmissiveIntensity = 2.2;
    this.materialsToPulse.push(crestMat);

    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.position.set(0, -1.45, 0.22);
    group.add(crest);

    this.itemGroup.add(group);
  }

  buildRailgunRuler3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ff5500");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ff5500");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#facc15");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Châssis central futuriste Hyperion
    const bodyGeo = new THREE.BoxGeometry(0.32, 2.8, 0.22);
    bodyGeo.center();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: config.metalness !== undefined ? config.metalness : 0.85,
      roughness: config.roughness !== undefined ? config.roughness : 0.25
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // 2. Cœur de plasma incandescente
    const plasmaGeo = new THREE.CylinderGeometry(0.09, 0.09, 3.2, 16);
    plasmaGeo.center();

    const baseEmissive = 2.2;
    const plasmaMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.95
    });
    plasmaMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(plasmaMat);

    const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
    group.add(plasma);

    // 3. Rails conducteurs parallèles gradués
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.9,
      roughness: 0.2,
      map: gradTexture
    });

    for (let side of [-0.2, 0.2]) {
      const railGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.6, 12);
      railGeo.center();
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.x = side;
      group.add(rail);
    }

    this.itemGroup.add(group);
  }

  buildLightsaberRuler3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#38bdf8");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#38bdf8");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Lame plasma méplate biseautée
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.4);
    shape.lineTo(0.12, 1.2);
    shape.lineTo(0.12, -1.4);
    shape.lineTo(-0.12, -1.4);
    shape.lineTo(-0.12, 1.2);
    shape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bladeGeo.center();

    const baseEmissive = 2.5;
    const bladeMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.1,
      roughness: config.roughness !== undefined ? config.roughness : 0.05,
      map: gradTexture,
      transparent: true,
      opacity: 0.92
    });
    bladeMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(bladeMat);

    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.4;
    group.add(blade);

    // Cœur blanc interne de la lame
    const innerGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.7, 12);
    innerGeo.center();
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    innerCore.position.y = 0.4;
    group.add(innerCore);

    // 2. Manche chrome détaillé
    const hiltGroup = new THREE.Group();

    const hiltMainGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 20);
    hiltMainGeo.center();
    const hiltMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.98,
      roughness: 0.02
    });
    const hiltMain = new THREE.Mesh(hiltMainGeo, hiltMat);
    hiltGroup.add(hiltMain);

    // Émetteur chrome
    const emitterGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.2, 20);
    emitterGeo.center();
    const emitter = new THREE.Mesh(emitterGeo, hiltMat);
    emitter.position.y = 0.45;
    hiltGroup.add(emitter);

    // Anneaux de poignée
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(0.16, 0.02, 12, 24);
      ringGeo.center();
      const ring = new THREE.Mesh(ringGeo, hiltMat);
      ring.position.y = -0.15 - i * 0.18;
      hiltGroup.add(ring);
    }

    hiltGroup.position.y = -1.35;
    group.add(hiltGroup);

    this.itemGroup.add(group);
  }

  // --- CONSTRUCTEURS 3D : ÉQUERRES LASER ---

  buildNeonSquare3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#00f0ff");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#00f0ff");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#0055aa");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Armature creuse en L à 90°
    const shape = new THREE.Shape();
    const armL = 2.6, armW = 0.38;
    shape.moveTo(0, 0);
    shape.lineTo(armL, 0);
    shape.lineTo(armL, armW);
    shape.lineTo(armW, armW);
    shape.lineTo(armW, armL);
    shape.lineTo(0, armL);
    shape.closePath();

    const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const squareGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    squareGeo.center();

    const baseEmissive = 1.2;
    const squareMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.8,
      roughness: config.roughness !== undefined ? config.roughness : 0.2,
      map: gradTexture
    });
    squareMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(squareMat);

    const squareMesh = new THREE.Mesh(squareGeo, squareMat);
    group.add(squareMesh);

    // 2. Renfort d'angle diagonal
    const bracketGeo = new THREE.BoxGeometry(0.4, 0.4, 0.14);
    bracketGeo.center();
    const bracketMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1
    });
    bracketMat.userData.baseEmissiveIntensity = 1.5;
    this.materialsToPulse.push(bracketMat);

    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    bracket.position.set(-0.8, -0.8, 0);
    group.add(bracket);

    this.itemGroup.add(group);
  }

  buildExcaliburSquare3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ffe600");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ffe600");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#10b981");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Structure équerre 90° style Épée Sacrée
    const shape = new THREE.Shape();
    const len = 2.6, w = 0.35;
    shape.moveTo(0, 0);
    shape.lineTo(len, 0);
    shape.lineTo(len - 0.2, w);
    shape.lineTo(w, w);
    shape.lineTo(w, len - 0.2);
    shape.lineTo(0, len);
    shape.closePath();

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 };
    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.center();

    const baseEmissive = 1.6;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.9,
      roughness: config.roughness !== undefined ? config.roughness : 0.1,
      map: gradTexture
    });
    bodyMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(bodyMat);

    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // 2. Garde d'angle ornementale
    const guardGeo = new THREE.BoxGeometry(0.5, 0.5, 0.22);
    guardGeo.center();
    const guardMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.1
    });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.set(-0.85, -0.85, 0);
    group.add(guard);

    // 3. Pommeau en gemme Émeraude émissif
    const gemGeo = new THREE.OctahedronGeometry(0.22, 0);
    gemGeo.center();
    const gemMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 2.0,
      metalness: 0.2,
      roughness: 0.1
    });
    gemMat.userData.baseEmissiveIntensity = 2.0;
    this.materialsToPulse.push(gemMat);

    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(-0.85, -0.85, 0.14);
    group.add(gem);

    this.itemGroup.add(group);
  }

  buildRedstoneSquare3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ff2200");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ff2200");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    const cubeGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    cubeGeo.center();

    const baseEmissive = 1.5;
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x450a0a,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      roughness: config.roughness !== undefined ? config.roughness : 0.8,
      metalness: config.metalness !== undefined ? config.metalness : 0.1,
      map: gradTexture
    });
    blockMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(blockMat);

    // 8 Cubes biseautés en L
    const coords = [
      [0,0], [1,0], [2,0], [3,0], [4,0],
      [0,1], [0,2], [0,3]
    ];

    coords.forEach(([cx, cy]) => {
      const cube = new THREE.Mesh(cubeGeo, blockMat);
      cube.position.set(cx * 0.46 - 0.9, cy * 0.46 - 0.7, 0);
      group.add(cube);
    });

    // Conduits d'énergie Redstone traversants
    const pipeMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: mainColor,
      emissiveIntensity: 2.2,
      metalness: 0.3
    });
    pipeMat.userData.baseEmissiveIntensity = 2.2;
    this.materialsToPulse.push(pipeMat);

    const pipeHGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.3, 12);
    pipeHGeo.rotateZ(Math.PI / 2);
    pipeHGeo.center();
    const pipeH = new THREE.Mesh(pipeHGeo, pipeMat);
    pipeH.position.set(0.0, -0.7, 0.22);
    group.add(pipeH);

    const pipeVGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 12);
    pipeVGeo.center();
    const pipeV = new THREE.Mesh(pipeVGeo, pipeMat);
    pipeV.position.set(-0.9, -0.1, 0.22);
    group.add(pipeV);

    this.itemGroup.add(group);
  }

  buildCyberKatana3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ff0055");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ff0055");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#80002a");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Structure 90° double lame Katana
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(2.4, 0);
    shape.lineTo(2.3, 0.22);
    shape.lineTo(0.22, 0.22);
    shape.lineTo(0.22, 2.3);
    shape.lineTo(0, 2.4);
    shape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 };
    const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bladeGeo.center();

    const baseEmissive = 2.0;
    const bladeMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.95,
      roughness: config.roughness !== undefined ? config.roughness : 0.15,
      map: gradTexture
    });
    bladeMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(bladeMat);

    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0.4, 0.4, 0);
    group.add(blade);

    // 2. Garde Tsuba en carbone
    const tsubaGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    tsubaGeo.rotateX(Math.PI / 2);
    tsubaGeo.center();
    const tsubaMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.9,
      roughness: 0.2
    });
    const tsuba = new THREE.Mesh(tsubaGeo, tsubaMat);
    tsuba.position.set(-0.7, -0.7, 0);
    group.add(tsuba);

    // 3. Poignée tressée Tsuka
    const handleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.75, 16);
    handleGeo.rotateZ(Math.PI / 4);
    handleGeo.center();
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.5,
      roughness: 0.6
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(-1.05, -1.05, 0);
    group.add(handle);

    this.itemGroup.add(group);
  }

  buildCyberKatana(color, emissive, accent, config) {
    this.buildCyberKatana3d(color, emissive, accent, config);
  }

  buildVoidArcSquare3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#a855f7");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#a855f7");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#581c87");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Structure angulaire 90° reliée à un arc courbe
    const shape = new THREE.Shape();
    const r = 2.4;
    shape.moveTo(0, 0);
    shape.lineTo(r, 0);
    shape.absarc(0, 0, r, 0, Math.PI / 2, false);
    shape.lineTo(0, r);
    shape.closePath();

    const hole = new THREE.Path();
    const rIn = 1.6;
    hole.moveTo(0.3, 0.3);
    hole.lineTo(rIn, 0.3);
    hole.absarc(0, 0, rIn, 0, Math.PI / 2, false);
    hole.lineTo(0.3, rIn);
    hole.closePath();
    shape.holes.push(hole);

    const extrudeSettings = { depth: 0.18, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 };
    const arcGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    arcGeo.center();

    const baseEmissive = 2.2;
    const arcMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.8,
      roughness: config.roughness !== undefined ? config.roughness : 0.2,
      map: gradTexture,
      wireframe: config.wireframe !== undefined ? config.wireframe : false
    });
    arcMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(arcMat);

    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    group.add(arcMesh);

    // 2. Cristal du Void central en lévitation
    const crystalGeo = new THREE.IcosahedronGeometry(0.32, 0);
    crystalGeo.center();
    const crystalMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: 2.8,
      metalness: 0.9,
      roughness: 0.1
    });
    crystalMat.userData.baseEmissiveIntensity = 2.8;
    this.materialsToPulse.push(crystalMat);

    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 0, 0.1);
    group.add(crystal);

    this.itemGroup.add(group);
  }

  buildIceSquare3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#38bdf8");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#38bdf8");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#e0f2fe");

    const gradTexture = this.createGraduationTexture({
      colorMain: "#" + mainColor.getHexString(),
      textColor: "#ffffff",
      maxCm: 10
    });

    // 1. Structure équerre 90° sculptée dans la glace acérée
    const shape = new THREE.Shape();
    const len = 2.6, w = 0.4;
    shape.moveTo(0, 0);
    shape.lineTo(len, 0);
    shape.lineTo(len - 0.15, w);
    shape.lineTo(w, w);
    shape.lineTo(w, len - 0.15);
    shape.lineTo(0, len);
    shape.closePath();

    const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 };
    const iceGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    iceGeo.center();

    const baseEmissive = 2.5;
    const iceMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: baseEmissive,
      metalness: config.metalness !== undefined ? config.metalness : 0.3,
      roughness: config.roughness !== undefined ? config.roughness : 0.05,
      transparent: true,
      opacity: 0.85,
      map: gradTexture
    });
    iceMat.userData.baseEmissiveIntensity = baseEmissive;
    this.materialsToPulse.push(iceMat);

    const iceMesh = new THREE.Mesh(iceGeo, iceMat);
    group.add(iceMesh);

    // 2. Crâne ornemental au sommet d'angle
    const skullGeo = new THREE.SphereGeometry(0.25, 12, 12);
    skullGeo.center();
    const skullMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: 1.8,
      metalness: 0.8,
      roughness: 0.2
    });
    skullMat.userData.baseEmissiveIntensity = 1.8;
    this.materialsToPulse.push(skullMat);

    const skull = new THREE.Mesh(skullGeo, skullMat);
    skull.position.set(-0.85, -0.85, 0.15);
    group.add(skull);

    // 3. Plaques de runes spectrales gravées
    for (let i = 1; i <= 3; i++) {
      const runeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.04);
      runeGeo.center();
      const runeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: mainColor,
        emissiveIntensity: 2.2
      });
      runeMat.userData.baseEmissiveIntensity = 2.2;
      this.materialsToPulse.push(runeMat);

      const r1 = new THREE.Mesh(runeGeo, runeMat);
      r1.position.set(-0.85 + i * 0.5, -0.85, 0.12);
      group.add(r1);

      const r2 = new THREE.Mesh(runeGeo, runeMat);
      r2.position.set(-0.85, -0.85 + i * 0.5, 0.12);
      group.add(r2);
    }

    this.itemGroup.add(group);
  }

  // --- CONSTRUCTEURS 3D : RAPPORTEURS & CANVASES ENRICHIS ---

  buildClassicNeonProtractor3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ffb700");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ffb700");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#7f5c00");

    // 1. Cadran transparent principal (CylinderGeometry)
    const dialGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.06, 32, 1, false, 0, Math.PI);
    dialGeo.rotateX(Math.PI / 2);
    dialGeo.rotateZ(-Math.PI / 2);
    const dialMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.45,
      roughness: 0.3,
      metalness: 0.7,
      side: THREE.DoubleSide
    });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    group.add(dial);

    // 2. Arc 180° supérieur biseauté (RingGeometry)
    const ringGeo = new THREE.RingGeometry(1.5, 1.75, 36, 1, 0, Math.PI);
    const ringMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.85,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    this.materialsToPulse.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = 0.04;
    group.add(ring);

    // 3. 37 Graduations angulaires réelles de 0° à 180° (incréments de 5°)
    const tickGeoMajor = new THREE.BoxGeometry(0.03, 0.22, 0.03);
    const tickGeoMinor = new THREE.BoxGeometry(0.018, 0.12, 0.018);
    const tickMatMajor = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tickMatMinor = new THREE.MeshStandardMaterial({ color: mainColor, emissive: glowColor, emissiveIntensity: 1.2 });

    const radius = 1.52;
    for (let i = 0; i <= 36; i++) {
      const angle = (i * Math.PI) / 36;
      const isMajor = i % 2 === 0;
      const tick = new THREE.Mesh(
        isMajor ? tickGeoMajor : tickGeoMinor,
        isMajor ? tickMatMajor : tickMatMinor
      );
      tick.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.05);
      tick.rotation.z = angle - Math.PI / 2;
      group.add(tick);
    }

    // 4. Aiguille centrale (ConeGeometry)
    const needleGeo = new THREE.ConeGeometry(0.08, 1.4, 16);
    needleGeo.translate(0, 0.7, 0);
    const needleMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: 2.0,
      metalness: 0.9,
      roughness: 0.1
    });
    this.materialsToPulse.push(needleMat);
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.z = 0.08;
    needle.rotation.z = -Math.PI / 4;
    group.add(needle);

    // Moyeu
    const hubGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.z = 0.08;
    group.add(hub);

    this.itemGroup.add(group);
  }

  buildChronosDial3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ffd700");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ffd700");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#b45309");

    // 1. Lunette bronze (TorusGeometry)
    const bezelGeo = new THREE.TorusGeometry(1.7, 0.12, 16, 48);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.2
    });
    this.materialsToPulse.push(bezelMat);
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    group.add(bezel);

    // Générateur d'engrenage à 12 dents
    const createGear = (radius, toothCount = 12, thickness = 0.08, mat) => {
      const gearGroup = new THREE.Group();
      const bodyGeo = new THREE.CylinderGeometry(radius, radius, thickness, 24);
      bodyGeo.rotateX(Math.PI / 2);
      const body = new THREE.Mesh(bodyGeo, mat);
      gearGroup.add(body);

      const toothGeo = new THREE.BoxGeometry(radius * 0.25, radius * 0.3, thickness);
      for (let i = 0; i < toothCount; i++) {
        const angle = (i * Math.PI * 2) / toothCount;
        const tooth = new THREE.Mesh(toothGeo, mat);
        tooth.position.set(Math.cos(angle) * (radius + 0.08), Math.sin(angle) * (radius + 0.08), 0);
        tooth.rotation.z = angle;
        gearGroup.add(tooth);
      }
      return gearGroup;
    };

    const gearMat1 = new THREE.MeshStandardMaterial({ color: mainColor, metalness: 0.85, roughness: 0.2 });
    const gearMat2 = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.9, roughness: 0.3 });

    // 2. Trois engrenages imbriqués à rotation inverse (isoler dans sous-groupe rotatif)
    const gear1 = createGear(0.65, 12, 0.08, gearMat1);
    gear1.position.set(-0.5, 0.3, -0.05);
    gear1.userData.rotationSpeed = 0.01;

    const gear2 = createGear(0.48, 12, 0.08, gearMat2);
    gear2.position.set(0.55, -0.2, -0.05);
    gear2.userData.rotationSpeed = -0.015;

    const gear3 = createGear(0.35, 12, 0.08, gearMat1);
    gear3.position.set(0.1, 0.7, -0.08);
    gear3.userData.rotationSpeed = 0.02;

    group.add(gear1);
    group.add(gear2);
    group.add(gear3);

    // 3. Aiguilles gothiques
    const handGroup = new THREE.Group();
    const hourHandGeo = new THREE.ConeGeometry(0.09, 1.0, 4);
    hourHandGeo.translate(0, 0.5, 0);
    const hourHandMat = new THREE.MeshStandardMaterial({ color: mainColor, emissive: glowColor, emissiveIntensity: 1.2, metalness: 0.9 });
    this.materialsToPulse.push(hourHandMat);
    const hourHand = new THREE.Mesh(hourHandGeo, hourHandMat);
    hourHand.rotation.z = -Math.PI / 3;
    handGroup.add(hourHand);

    const minHandGeo = new THREE.ConeGeometry(0.07, 1.4, 4);
    minHandGeo.translate(0, 0.7, 0);
    const minHand = new THREE.Mesh(minHandGeo, hourHandMat);
    minHand.rotation.z = Math.PI / 6;
    handGroup.add(minHand);

    const decoGeo = new THREE.OctahedronGeometry(0.18, 0);
    const decoMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95 });
    const deco = new THREE.Mesh(decoGeo, decoMat);
    deco.position.z = 0.12;
    handGroup.add(deco);

    handGroup.position.z = 0.06;
    group.add(handGroup);

    this.itemGroup.add(group);
  }

  buildNitroDial3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#00f0ff");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#00f0ff");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#ef4444");

    // Boîtier tubulaire aluminium
    const casingGeo = new THREE.CylinderGeometry(1.75, 1.8, 0.25, 32);
    casingGeo.rotateX(Math.PI / 2);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.15 });
    group.add(new THREE.Mesh(casingGeo, casingMat));

    const bezelGeo = new THREE.TorusGeometry(1.75, 0.08, 16, 48);
    const bezelMat = new THREE.MeshStandardMaterial({ color: mainColor, emissive: glowColor, emissiveIntensity: 1.0, metalness: 0.9, roughness: 0.1 });
    this.materialsToPulse.push(bezelMat);
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.z = 0.13;
    group.add(bezel);

    const faceGeo = new THREE.CircleGeometry(1.68, 32);
    const faceMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.02;
    group.add(face);

    // Zone d'overrev émissive rouge (150° à 180°)
    const overrevGeo = new THREE.RingGeometry(1.2, 1.6, 32, 1, Math.PI * 0.83, Math.PI * 0.17);
    const overrevMat = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 2.2, side: THREE.DoubleSide });
    this.materialsToPulse.push(overrevMat);
    const overrev = new THREE.Mesh(overrevGeo, overrevMat);
    overrev.position.z = 0.04;
    group.add(overrev);

    // Double aiguille fine
    const needle1Geo = new THREE.ConeGeometry(0.04, 1.35, 8);
    needle1Geo.translate(0, 0.67, 0);
    const needleMat1 = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 2.5 });
    this.materialsToPulse.push(needleMat1);
    const needle1 = new THREE.Mesh(needle1Geo, needleMat1);
    needle1.position.z = 0.08;
    needle1.rotation.z = -Math.PI / 6;

    const needle2Geo = new THREE.ConeGeometry(0.025, 1.1, 8);
    needle2Geo.translate(0, 0.55, 0);
    const needleMat2 = new THREE.MeshStandardMaterial({ color: mainColor, emissive: glowColor, emissiveIntensity: 1.8 });
    this.materialsToPulse.push(needleMat2);
    const needle2 = new THREE.Mesh(needle2Geo, needleMat2);
    needle2.position.z = 0.09;
    needle2.rotation.z = Math.PI / 4;

    group.add(needle1);
    group.add(needle2);

    const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    hubGeo.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.1 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.z = 0.1;
    group.add(hub);

    this.itemGroup.add(group);
  }

  buildSawProtractor3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ff3300");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ff3300");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#1c1917");

    // 1. Demi-disque en acier trempé (CylinderGeometry tronqué à Math.PI)
    const sawBodyGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.1, 32, 1, false, 0, Math.PI);
    sawBodyGeo.rotateX(Math.PI / 2);
    sawBodyGeo.rotateZ(-Math.PI / 2);
    const sawMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: 0.6,
      roughness: 0.5,
      metalness: 0.85,
      side: THREE.DoubleSide
    });
    this.materialsToPulse.push(sawMat);
    const sawBody = new THREE.Mesh(sawBodyGeo, sawMat);
    group.add(sawBody);

    // 2. 18 Dents triangulaires périmétriques (ConeGeometry)
    const toothGeo = new THREE.ConeGeometry(0.12, 0.35, 4);
    const toothMat = new THREE.MeshStandardMaterial({ color: mainColor, emissive: glowColor, emissiveIntensity: 1.5, roughness: 0.3, metalness: 0.9 });
    this.materialsToPulse.push(toothMat);

    const teethCount = 18;
    const radius = 1.4;
    for (let i = 0; i < teethCount; i++) {
      const angle = (i * Math.PI) / (teethCount - 1);
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(Math.cos(angle) * (radius + 0.12), Math.sin(angle) * (radius + 0.12), 0);
      tooth.rotation.z = angle - Math.PI / 2 + 0.2;
      group.add(tooth);
    }

    // 3. Boulon central
    const boltGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 6);
    boltGeo.rotateX(Math.PI / 2);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.95, roughness: 0.1 });
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.z = 0.08;
    group.add(bolt);

    this.itemGroup.add(group);
  }

  buildViceSpeedo3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#ff007f");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#ff007f");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#f97316");

    // Lunette Chrome
    const bezelGeo = new THREE.TorusGeometry(1.75, 0.12, 16, 48);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.05 });
    group.add(new THREE.Mesh(bezelGeo, bezelMat));

    // Cadran Outrun concave sombre
    const faceGeo = new THREE.CylinderGeometry(1.68, 1.6, 0.12, 32);
    faceGeo.rotateX(Math.PI / 2);
    const faceMat = new THREE.MeshStandardMaterial({ color: 0x1f0529, emissive: glowColor, emissiveIntensity: 0.25, roughness: 0.6, metalness: 0.3 });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = -0.02;
    group.add(face);

    // Arc néon fuchsia
    const arcGeo = new THREE.RingGeometry(1.3, 1.6, 32, 1, 0, Math.PI);
    const arcMat = new THREE.MeshStandardMaterial({ color: mainColor, emissive: glowColor, emissiveIntensity: 1.8, side: THREE.DoubleSide });
    this.materialsToPulse.push(arcMat);
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.position.z = 0.05;
    group.add(arc);

    // 3 Silhouettes holographiques de palmiers au moyeu (ExtrudeGeometry)
    const palmShape = new THREE.Shape();
    palmShape.moveTo(-0.04, 0); palmShape.lineTo(0.04, 0); palmShape.lineTo(0.06, 0.5);
    palmShape.lineTo(0.25, 0.7); palmShape.lineTo(0.05, 0.55); palmShape.lineTo(0.2, 0.85);
    palmShape.lineTo(0, 0.6); palmShape.lineTo(-0.2, 0.85); palmShape.lineTo(-0.05, 0.55);
    palmShape.lineTo(-0.25, 0.7); palmShape.lineTo(-0.06, 0.5); palmShape.closePath();

    const palmGeo = new THREE.ExtrudeGeometry(palmShape, { depth: 0.03, bevelEnabled: false });
    palmGeo.center();
    const palmMat = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 2.0, transparent: true, opacity: 0.9 });
    this.materialsToPulse.push(palmMat);

    const offsets = [-0.4, 0, 0.4];
    const scales = [0.65, 0.85, 0.65];
    offsets.forEach((offX, idx) => {
      const palm = new THREE.Mesh(palmGeo, palmMat);
      palm.scale.set(scales[idx], scales[idx], scales[idx]);
      palm.position.set(offX, 0.25, 0.08);
      group.add(palm);
    });

    const needleGeo = new THREE.ConeGeometry(0.05, 1.3, 8);
    needleGeo.translate(0, 0.65, 0);
    const needleMat = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 2.5 });
    this.materialsToPulse.push(needleMat);
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.z = 0.1;
    needle.rotation.z = -Math.PI / 4;
    group.add(needle);

    this.itemGroup.add(group);
  }

  buildVatsRadar3d(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#10b981");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#10b981");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#022c22");

    // 1. Écran bombé CRT (SphereGeometry bombée avec depthTest actif)
    const crtGeo = new THREE.SphereGeometry(2.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3.5);
    crtGeo.rotateX(Math.PI / 2);
    const crtMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: glowColor,
      emissiveIntensity: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      depthTest: true
    });
    this.materialsToPulse.push(crtMat);
    const crtScreen = new THREE.Mesh(crtGeo, crtMat);
    group.add(crtScreen);

    // Grille V.A.T.S.
    for (let r of [0.5, 1.0, 1.5]) {
      const ringGeo = new THREE.TorusGeometry(r, 0.02, 12, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color: mainColor, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = 0.1;
      group.add(ring);
    }

    // 2. Balayage radar rotatif CRT
    const sweepGroup = new THREE.Group();
    const sweepGeo = new THREE.CircleGeometry(1.6, 16, 0, Math.PI / 4);
    const sweepMat = new THREE.MeshBasicMaterial({ color: mainColor, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const sweepSector = new THREE.Mesh(sweepGeo, sweepMat);
    sweepSector.position.z = 0.14;
    sweepGroup.add(sweepSector);

    const rayGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.15), new THREE.Vector3(1.6, 0, 0.15)]);
    const rayMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    sweepGroup.add(new THREE.Line(rayGeo, rayMat));

    sweepGroup.userData.rotationSpeed = 0.02;
    group.add(sweepGroup);

    this.itemGroup.add(group);
  }

  buildCanvasGrid(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#080d19");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#00f0ff");
    const accentColor = (colorAccent instanceof THREE.Color) ? colorAccent : new THREE.Color(colorAccent || "#00f0ff");

    // Plan de fond opaque émissif
    const bgGeo = new THREE.PlaneGeometry(8.0, 6.0);
    const bgMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: glowColor,
      emissiveIntensity: 0.15,
      roughness: config.roughness !== undefined ? config.roughness : 0.8,
      metalness: config.metalness !== undefined ? config.metalness : 0.1,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = -0.05;
    group.add(bgMesh);

    // Grille filaire dynamique liée aux variables du skin
    const gridGeo = new THREE.PlaneGeometry(7.6, 5.6, 20, 16);
    const gridMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.colorGlow || glowColor),
      wireframe: config.wireframe !== false,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    this.materialsToPulse.push(gridMat);
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    group.add(gridMesh);

    // Cadre périphérique
    const frameGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.8, -2.8, 0.02),
      new THREE.Vector3(3.8, -2.8, 0.02),
      new THREE.Vector3(3.8, 2.8, 0.02),
      new THREE.Vector3(-3.8, 2.8, 0.02),
      new THREE.Vector3(-3.8, -2.8, 0.02)
    ]);
    const frameMat = new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.85 });
    group.add(new THREE.Line(frameGeo, frameMat));

    // Repositionnement et Z-Clipping impératifs
    group.position.set(0, -1.2, -2.0);
    group.rotation.x = -Math.PI / 3;

    this.itemGroup.add(group);
  }

  buildRetroDial(colorMain, colorGlow, colorAccent, config = {}) {
    const group = new THREE.Group();
    const mainColor = (colorMain instanceof THREE.Color) ? colorMain : new THREE.Color(colorMain || "#00f0ff");
    const glowColor = (colorGlow instanceof THREE.Color) ? colorGlow : new THREE.Color(colorGlow || "#00f0ff");

    const bezelGeo = new THREE.TorusGeometry(1.8, 0.15, 16, 32);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    group.add(new THREE.Mesh(bezelGeo, bezelMat));

    const faceGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.08, 32);
    faceGeo.rotateX(Math.PI / 2);
    const faceMat = new THREE.MeshStandardMaterial({ color: 0x060911, emissive: glowColor, emissiveIntensity: 0.2 });
    group.add(new THREE.Mesh(faceGeo, faceMat));

    const needleGeo = new THREE.ConeGeometry(0.08, 1.4, 4);
    const needleMat = new THREE.MeshStandardMaterial({ color: mainColor, emissive: mainColor, emissiveIntensity: 2.0 });
    this.materialsToPulse.push(needleMat);
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.z = 0.12;
    needle.rotation.z = -Math.PI / 4;
    group.add(needle);

    this.itemGroup.add(group);
  }

  buildHoloRing(color, emissive) {
    const geo = new THREE.TorusGeometry(1.8, 0.18, 16, 64);
    const mat = new THREE.MeshStandardMaterial({ color: color, emissive: emissive, emissiveIntensity: 1.5, wireframe: true });
    this.materialsToPulse.push(mat);
    this.itemGroup.add(new THREE.Mesh(geo, mat));
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const elapsedTime = this.clock.getElapsedTime();

    // Atténuation de l'oscillation Y pour la catégorie viseurs
    const isCrosshair = this.currentItemData && (this.currentItemData.type === "crosshair" || this.currentItemData.meshType === "reticleHolo3d");
    const oscAmplitude = isCrosshair ? 0.04 : 0.15;

    if (this.itemGroup) {
      this.itemGroup.rotation.y += 0.012;
      this.itemGroup.position.y = Math.sin(elapsedTime * 2.0) * oscAmplitude;
    }

    const pulse = 1.0 + Math.sin(elapsedTime * 4.0) * 0.35;
    this.materialsToPulse.forEach(mat => {
      if (mat && mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 1.2 * pulse;
      }
    });

    if (this.particlesGroup) {
      this.particlesGroup.rotation.y -= 0.003;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Armory3DRenderer = Armory3DRenderer;