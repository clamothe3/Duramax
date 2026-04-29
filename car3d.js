// car3d.js — Realistic 3D car animation using Three.js GLTF loader
import * as THREE from 'three';
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader }  from 'three/addons/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const container = document.getElementById('car-3d-canvas');
if (container) initCar(container);

function initCar(container) {
  const W = container.clientWidth  || 700;
  const H = container.clientHeight || 500;

  // ── RENDERER ───────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace    = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // ── SCENE / CAMERA ─────────────────────────────────────────────
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  camera.position.set(4.5, 2.1, 7.5);
  camera.lookAt(0, 0.5, 0);

  // ── LIGHTS ─────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(8, 14, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near   =  1;
  keyLight.shadow.camera.far    = 50;
  keyLight.shadow.camera.left   = -8;
  keyLight.shadow.camera.right  =  8;
  keyLight.shadow.camera.top    =  8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);

  // Red rim light — brand accent
  const rimLight = new THREE.PointLight(0xCC0000, 0.8, 16);
  rimLight.position.set(-6, 3, -4);
  scene.add(rimLight);

  // Cool fill from opposite side
  const fillLight = new THREE.PointLight(0x4466aa, 0.3, 22);
  fillLight.position.set(5, 2, 7);
  scene.add(fillLight);

  // ── FLOOR / GRID ───────────────────────────────────────────────
  const shadowFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.28 })
  );
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.y = -0.01;
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);

  const grid = new THREE.GridHelper(20, 20, 0x2a2a2a, 0x1e1e1e);
  scene.add(grid);

  // ── HDR ENVIRONMENT MAP (realistic reflections) ─────────────────
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  new RGBELoader().load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/equirectangular/venice_sunset_1k.hdr',
    (tex) => {
      const envMap = pmrem.fromEquirectangular(tex).texture;
      scene.environment = envMap;
      tex.dispose();
      pmrem.dispose();
    }
  );

  // ── PBR MATERIALS ──────────────────────────────────────────────
  // Deep black clearcoat paint (like a fresh body shop respray)
  const matBody = new THREE.MeshPhysicalMaterial({
    color: 0x090909,
    metalness:          1.0,
    roughness:          0.06,
    clearcoat:          1.0,
    clearcoatRoughness: 0.03,
    reflectivity:       1.0,
  });

  // Polished chrome for rims / trim
  const matChrome = new THREE.MeshStandardMaterial({
    color:     0xcccccc,
    metalness: 1.0,
    roughness: 0.08,
  });

  // Tinted glass
  const matGlass = new THREE.MeshPhysicalMaterial({
    color:        0x1a2030,
    metalness:    0.0,
    roughness:    0.0,
    transmission: 0.85,
    transparent:  true,
    opacity:      0.65,
  });

  // ── LOAD GLTF CAR MODEL ────────────────────────────────────────
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  const loadingEl = container.querySelector('.car3d-loading');
  const badge     = container.querySelector('.car3d-explode-badge');

  let carModel = null;
  const wheels   = [];
  const origPos  = {};   // assembled positions of named parts
  const fromPos  = {};   // positions when reassembly starts

  // Named parts we'll animate during explode
  const PART_NAMES = ['body','glass','trim','wheel_fl','wheel_fr','wheel_rl','wheel_rr'];

  // How far each part flies when exploded
  const OFFSETS = {
    wheel_fl: new THREE.Vector3(-2.6,  0.2,  2.0),
    wheel_fr: new THREE.Vector3( 2.6,  0.2,  2.0),
    wheel_rl: new THREE.Vector3(-2.6,  0.2, -2.0),
    wheel_rr: new THREE.Vector3( 2.6,  0.2, -2.0),
    body:     new THREE.Vector3( 0.0,  1.8,  0.0),
    glass:    new THREE.Vector3( 0.0,  2.5,  0.3),
    trim:     new THREE.Vector3( 0.0, -0.3,  2.8),
  };

  loader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/ferrari.glb',
    (gltf) => {
      if (loadingEl) loadingEl.style.display = 'none';

      carModel = gltf.scene.children[0];

      // Apply custom materials to named meshes
      const applyMat = (name, mat) => {
        const obj = carModel.getObjectByName(name);
        if (obj) obj.material = mat;
      };
      applyMat('body',   matBody);
      applyMat('glass',  matGlass);
      applyMat('trim',   matChrome);
      ['rim_fl','rim_fr','rim_rl','rim_rr'].forEach(n => applyMat(n, matChrome));

      // Hide the baked shadow plane (we have real shadows)
      const shadowMesh = carModel.getObjectByName('shadow');
      if (shadowMesh) shadowMesh.visible = false;

      // Collect wheel groups for rotation
      ['wheel_fl','wheel_fr','wheel_rl','wheel_rr'].forEach(n => {
        const w = carModel.getObjectByName(n);
        if (w) wheels.push(w);
      });

      // Record assembled positions of animatable parts
      PART_NAMES.forEach(n => {
        const obj = carModel.getObjectByName(n);
        if (obj) origPos[n] = obj.position.clone();
      });

      // Enable shadow casting / receiving on all meshes
      carModel.traverse(child => {
        if (child.isMesh) {
          child.castShadow    = true;
          child.receiveShadow = true;
        }
      });

      scene.add(carModel);

      // Fade the car in smoothly
      fadeInCar(carModel);

      if (badge) badge.textContent = 'CLICK TO EXPLODE';
    },
    undefined,
    (err) => {
      console.error('Failed to load car model:', err);
      if (loadingEl) loadingEl.textContent = 'Could not load model';
    }
  );

  function fadeInCar(model) {
    // Clone materials so we don't mutate shared ones
    const fadeable = [];
    model.traverse(child => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      const orig = child.material.opacity ?? 1;
      child.material.transparent = true;
      child.material.opacity = 0;
      fadeable.push({ mat: child.material, target: orig });
    });

    let t = 0;
    const step = () => {
      t += 0.016;
      const alpha = Math.min(t / 1.2, 1);
      fadeable.forEach(({ mat, target }) => {
        mat.opacity = alpha * target;
      });
      if (t < 1.2) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── STATE MACHINE ──────────────────────────────────────────────
  const S = { IDLE: 0, EXPLODING: 1, HOLDING: 2, REASSEMBLING: 3 };
  let state  = S.IDLE;
  let stateT = 0;
  const clock = new THREE.Clock();

  function easeInOut(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  }
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t-1, 3) + c1 * Math.pow(t-1, 2);
  }

  function triggerExplode() {
    if (!carModel) return;
    state = S.EXPLODING;
    stateT = clock.getElapsedTime();
    if (badge) { badge.textContent = 'CLICK TO REASSEMBLE'; badge.classList.add('active'); }
  }

  function triggerReassemble() {
    if (!carModel) return;
    // Snapshot current positions so we can lerp back from wherever parts are
    PART_NAMES.forEach(n => {
      const obj = carModel.getObjectByName(n);
      if (obj) fromPos[n] = obj.position.clone();
    });
    state = S.REASSEMBLING;
    stateT = clock.getElapsedTime();
    if (badge) { badge.textContent = 'CLICK TO EXPLODE'; badge.classList.remove('active'); }
  }

  renderer.domElement.addEventListener('click', () => {
    if      (state === S.IDLE)                        triggerExplode();
    else if (state === S.HOLDING || state === S.EXPLODING) triggerReassemble();
  });

  // ── RENDER LOOP ────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    const now = clock.getElapsedTime();
    const t   = now - stateT;

    if (!carModel) { renderer.render(scene, camera); return; }

    if (state === S.IDLE) {
      // Wheels spin as if the car is rolling
      wheels.forEach(w => { w.rotation.x = now * 1.6; });
      // Gentle oscillation to show off the car
      carModel.rotation.y = Math.sin(now * 0.24) * 0.5;
      // Auto-explode every 9 s
      if (t > 9) triggerExplode();

    } else if (state === S.EXPLODING) {
      const prog = Math.min(t / 1.8, 1);
      const e = easeInOut(prog);
      PART_NAMES.forEach(n => {
        const obj = carModel.getObjectByName(n);
        if (obj && origPos[n] && OFFSETS[n]) {
          obj.position.lerpVectors(origPos[n], origPos[n].clone().add(OFFSETS[n]), e);
        }
      });
      if (prog >= 1) { state = S.HOLDING; stateT = now; }

    } else if (state === S.HOLDING) {
      // Slow float / breath while exploded
      PART_NAMES.forEach((n, i) => {
        const obj = carModel.getObjectByName(n);
        if (obj && origPos[n] && OFFSETS[n]) {
          const base = origPos[n].clone().add(OFFSETS[n]);
          obj.position.x = base.x + Math.sin(now * 0.45 + i * 1.1) * 0.04;
          obj.position.y = base.y + Math.sin(now * 0.55 + i * 0.8) * 0.06;
          obj.position.z = base.z + Math.sin(now * 0.5  + i * 0.9) * 0.04;
        }
      });
      if (t > 3.5) triggerReassemble();

    } else if (state === S.REASSEMBLING) {
      const prog = Math.min(t / 2.4, 1);
      const e = easeOutBack(prog); // slight overshoot = parts snap into place
      PART_NAMES.forEach(n => {
        const obj = carModel.getObjectByName(n);
        if (obj && origPos[n] && fromPos[n]) {
          obj.position.lerpVectors(fromPos[n], origPos[n], e);
        }
      });
      if (prog >= 1) {
        // Snap exact
        PART_NAMES.forEach(n => {
          const obj = carModel.getObjectByName(n);
          if (obj && origPos[n]) obj.position.copy(origPos[n]);
        });
        carModel.rotation.y = 0;
        state = S.IDLE;
        stateT = now;
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  // ── RESPONSIVE ─────────────────────────────────────────────────
  new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }).observe(container);
}
