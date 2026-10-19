import React, { useEffect, useRef, useState, Component } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. RASTLINA CATALOG DATA & ROOM CONFIGURATIONS
// ---------------------------------------------------------------------------
const PRODUCTS = [
  {
    id: 'philo-red',
    name: 'Philodendron Oxycardium Red',
    category: 'Philodendron • Bestseller',
    price: 329,
    mrp: 599,
    badge: '45% OFF',
    desc: 'Heart-shaped bronze-red leaves in a Rastlina self-watering planter.'
  },
  {
    id: 'calathea-makoyana',
    name: 'Calathea Makoyana (Peacock Plant)',
    category: 'Calathea • Fresh Arrival',
    price: 499,
    mrp: 699,
    badge: '29% OFF',
    desc: 'Intricate feathered venation that folds prayer-like at night.'
  },
  {
    id: 'combo-trio',
    name: 'Sleeping Pothos + Cryptanthus + Silver Sword (Set of 3)',
    category: 'Combos of 3 • Bestseller',
    price: 649,
    mrp: 1199,
    badge: '46% OFF',
    desc: 'Curated trio with self-watering pots and custom aerated mix.'
  },
  {
    id: 'black-ficus',
    name: 'Black Ficus Burgundy - Rubber Plant',
    category: 'Exotic Beauties',
    price: 299,
    mrp: 499,
    badge: '40% OFF',
    desc: 'Deep glossy burgundy foliage that thrives in indoor living rooms.'
  }
];

const ROOM_CONFIGS = {
  living_room: {
    title: 'Living Room',
    desc: 'A warm welcome. Hyderabad Balcony Light.',
    lightColor: 0xfacc15,
    lightInt: 2.4,
    bgClass: 'bg-gradient-to-b from-[#1b1c09] via-[#0c2415] to-[#051309]'
  },
  bedroom: {
    title: 'Bedroom',
    desc: 'A quiet retreat. Soft morning ambient glow.',
    lightColor: 0xfbbf24,
    lightInt: 1.6,
    bgClass: 'bg-gradient-to-b from-[#1c1209] via-[#091b10] to-[#040e06]'
  },
  office: {
    title: 'Office',
    desc: 'Room to focus. Executive desk daylight view.',
    lightColor: 0xe0f2fe,
    lightInt: 2.2,
    bgClass: 'bg-gradient-to-b from-[#081b26] via-[#061e14] to-[#051309]'
  }
};

const CHAPTER_TITLES = [
  '01 • HERO: PLANTS REVOLUTIONIZED',
  '02 • CELLULAR & SOIL MICROBIOME',
  '03 • SELF-WATERING ENGINEERING',
  '04 • NURSERY ACCLIMATIZATION MATRIX',
  '05 • TOP 1% GOLDEN STANDARD',
  '06 • A PLACE FOR YOUR PLANT',
  '07 • CYCLE OF NATURE (LOOP)'
];

// Helper: Custom Leaf Geometry generator
function createLeafGeometry(length, width, curveAmount) {
  const geom = new THREE.PlaneGeometry(width, length, 8, 16);
  geom.translate(0, length / 2, 0);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = y / length;
    const profile = Math.sin(Math.pow(t, 0.65) * Math.PI);
    const nx = x * profile;
    const nz = -Math.pow(t, 1.8) * curveAmount + Math.abs(x) * 0.18;
    pos.setXYZ(i, nx, y, nz);
  }
  geom.computeVertexNormals();
  return geom;
}

// ---------------------------------------------------------------------------
// 2. ERROR BOUNDARY (Zero-Crash Safety Guard for React)
// ---------------------------------------------------------------------------
export class RastlinaErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('RastlinaScroll3D Error Boundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen bg-[#051309] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-lime-400/20 border border-lime-400 flex items-center justify-center text-3xl mb-4">🌿</div>
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-2 font-display text-white">Rastlina Nature Hub</h2>
          <p className="text-emerald-200/80 max-w-md text-sm mb-6">
            WebGL acceleration is temporarily unavailable on your browser. Enjoy our indoor plants, self-watering planters, and catalog directly:
          </p>
          <a
            href="https://www.rastlina.com"
            className="px-6 py-3 rounded-full bg-lime-400 text-emerald-950 font-bold uppercase tracking-wider text-xs hover:bg-lime-300 transition"
          >
            Visit Rastlina Catalog ↗
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// 3. MAIN RASTLINA 3D SCROLL COMPONENT
// ---------------------------------------------------------------------------
function RastlinaScroll3DInner({ onAddToCart }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const canvas2dRef = useRef(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSpace, setActiveSpace] = useState('cutaway');
  const [activeChapter, setActiveChapter] = useState(0);
  const [lightMode, setLightMode] = useState('morning');
  const [matrixFilter, setMatrixFilter] = useState('all');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [webGLError, setWebGLError] = useState(false);
  const [infiniteLoopEnabled, setInfiniteLoopEnabled] = useState(true);

  const [cart, setCart] = useState([
    { id: 'philo-red', qty: 1 },
    { id: 'calathea-makoyana', qty: 1 }
  ]);

  // Lighting refs for dynamic Hyderabad indoor simulation
  const keyLightRef = useRef(null);
  const warmLightRef = useRef(null);
  const autoScrollRafRef = useRef(null);
  const matrixDataRef = useRef([]);
  const matrixMeshRef = useRef(null);
  const matrixDummyRef = useRef(new THREE.Object3D());

  const showToast = (text) => {
    setToastText(text);
    clearTimeout(window.__rastlinaToastTimer);
    window.__rastlinaToastTimer = setTimeout(() => setToastText(''), 3200);
  };

  // -------------------------------------------------------------------------
  // THREE.JS SCENE SETUP & ANIMATION LOOP
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current) return;

    let scene, camera, renderer;
    let heroGroup, constellationGroup, potterGroup, plantStemGroup, rootsGroup, goldenSeedGroup, ambientParticles;
    const leafMeshes = [];
    const growthBones = [];
    let animId;

    try {
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x051309, 0.035);

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 140);
      camera.position.set(0, 0, 14);

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x051309, 0.45);

      // Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0x1e3a29, 1.35);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xd9f99d, 2.3);
      keyLight.position.set(6, 10, 8);
      scene.add(keyLight);
      keyLightRef.current = keyLight;

      const warmLight = new THREE.PointLight(0xfacc15, 2.8, 22);
      warmLight.position.set(0, 0.5, 2);
      scene.add(warmLight);
      warmLightRef.current = warmLight;

      const rimLight = new THREE.DirectionalLight(0x10b981, 1.7);
      rimLight.position.set(-7, -4, -5);
      scene.add(rimLight);

      // Particle Glow Texture Canvas
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 64; glowCanvas.height = 64;
      const gctx = glowCanvas.getContext('2d');
      const grad = gctx.createRadialGradient(32, 32, 2, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(190, 242, 100, 0.85)');
      grad.addColorStop(0.7, 'rgba(16, 185, 129, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      gctx.fillStyle = grad;
      gctx.fillRect(0, 0, 64, 64);
      const particleTex = new THREE.CanvasTexture(glowCanvas);

      // --- GROUP 1: HERO PLANT (Y = 0) ---
      heroGroup = new THREE.Group();
      scene.add(heroGroup);

      const coreGeom = new THREE.CylinderGeometry(0.55, 0.85, 3.8, 24, 16);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xb45309,
        emissiveIntensity: 0.45,
        roughness: 0.3
      });
      const goldenCore = new THREE.Mesh(coreGeom, coreMat);
      goldenCore.position.y = -0.3;
      heroGroup.add(goldenCore);

      const huskCount = 14;
      for (let i = 0; i < huskCount; i++) {
        const layer = i < 6 ? 0 : 1;
        const leafGeom = createLeafGeometry(4.4 + layer * 0.6, 1.35, 1.1 + layer * 0.55);
        const leafMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x15803d : 0x166534,
          emissive: 0x052e16,
          emissiveIntensity: 0.35,
          roughness: 0.42,
          side: THREE.DoubleSide
        });
        const leafMesh = new THREE.Mesh(leafGeom, leafMat);
        const angle = (i / huskCount) * Math.PI * 2 + layer * 0.3;
        const radius = 0.65 + layer * 0.25;
        leafMesh.position.set(Math.cos(angle) * radius, -2.2, Math.sin(angle) * radius);
        leafMesh.rotation.y = -angle + Math.PI / 2;
        leafMesh.rotation.x = 0.18 + layer * 0.16;
        leafMesh.userData = { baseRotX: leafMesh.rotation.x };
        heroGroup.add(leafMesh);
        leafMeshes.push(leafMesh);
      }

      // --- GROUP 2: SOIL MICROBIOME CONSTELLATION (Y = -16) ---
      constellationGroup = new THREE.Group();
      constellationGroup.position.set(2.2, -16, 0);
      scene.add(constellationGroup);

      const nodeCount = 42;
      const nodePositions = [];
      const nodeCoords = new Float32Array(nodeCount * 3);
      for (let i = 0; i < nodeCount; i++) {
        const vx = (Math.random() - 0.5) * 8.5;
        const vy = (Math.random() - 0.5) * 6.5;
        const vz = (Math.random() - 0.5) * 4.5;
        nodePositions.push(new THREE.Vector3(vx, vy, vz));
        nodeCoords[i * 3] = vx;
        nodeCoords[i * 3 + 1] = vy;
        nodeCoords[i * 3 + 2] = vz;
      }
      const nodeGeom = new THREE.BufferGeometry();
      nodeGeom.setAttribute('position', new THREE.BufferAttribute(nodeCoords, 3));
      const nodeMat = new THREE.PointsMaterial({
        size: 0.55,
        map: particleTex,
        color: 0xbef264,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      constellationGroup.add(new THREE.Points(nodeGeom, nodeMat));

      const lineCoords = [];
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (nodePositions[i].distanceTo(nodePositions[j]) < 3.1) {
            lineCoords.push(
              nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
              nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
            );
          }
        }
      }
      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x84cc16, transparent: true, opacity: 0.45 });
      constellationGroup.add(new THREE.LineSegments(lineGeom, lineMat));

      // --- GROUP 3: CUTAWAY SELF-WATERING PLANTER (Y = -34) ---
      potterGroup = new THREE.Group();
      potterGroup.position.set(-2.0, -34, 0);
      scene.add(potterGroup);

      const potGeom = new THREE.CylinderGeometry(1.85, 1.45, 2.8, 32, 1, false, Math.PI * 0.15, Math.PI * 1.7);
      const potMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, side: THREE.DoubleSide });
      const potMesh = new THREE.Mesh(potGeom, potMat);
      potMesh.position.y = -1.6;
      potterGroup.add(potMesh);

      const soilGeom = new THREE.CylinderGeometry(1.78, 1.48, 1.8, 24);
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
      const soilMesh = new THREE.Mesh(soilGeom, soilMat);
      soilMesh.position.y = -1.25;
      potterGroup.add(soilMesh);

      const waterGeom = new THREE.CylinderGeometry(1.48, 1.40, 0.72, 24);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x0891b2,
        emissiveIntensity: 0.65,
        transparent: true,
        opacity: 0.75
      });
      const waterMesh = new THREE.Mesh(waterGeom, waterMat);
      waterMesh.position.y = -2.55;
      potterGroup.add(waterMesh);

      rootsGroup = new THREE.Group();
      rootsGroup.position.set(0, -0.6, 1.38);
      potterGroup.add(rootsGroup);
      for (let r = 0; r < 9; r++) {
        const rCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3((r - 4) * 0.12, 0, 0),
          new THREE.Vector3((r - 4) * 0.22 + Math.sin(r) * 0.15, -0.7, 0.12),
          new THREE.Vector3((r - 4) * 0.28 - Math.cos(r) * 0.12, -1.45, 0.08),
          new THREE.Vector3((r - 4) * 0.32, -2.05, 0)
        ]);
        const rGeom = new THREE.TubeGeometry(rCurve, 16, 0.035, 6, false);
        const rMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xca8a04, emissiveIntensity: 0.28 });
        rootsGroup.add(new THREE.Mesh(rGeom, rMat));
      }

      plantStemGroup = new THREE.Group();
      plantStemGroup.position.set(0, -0.4, 0);
      potterGroup.add(plantStemGroup);

      const stemGeom = new THREE.CylinderGeometry(0.08, 0.15, 5.2, 12);
      stemGeom.translate(0, 2.6, 0);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 });
      plantStemGroup.add(new THREE.Mesh(stemGeom, stemMat));

      for (let l = 0; l < 7; l++) {
        const h = 0.8 + l * 0.68;
        const side = l % 2 === 0 ? 1 : -1;
        const lGeom = createLeafGeometry(2.2 - l * 0.12, 0.65, 0.85);
        const lMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x15803d, emissiveIntensity: 0.25, side: THREE.DoubleSide });
        const lMesh = new THREE.Mesh(lGeom, lMat);
        lMesh.position.set(0, h, 0);
        lMesh.rotation.z = side * (0.55 + l * 0.05);
        lMesh.rotation.y = side * 0.35;
        lMesh.userData = { baseZ: lMesh.rotation.z };
        plantStemGroup.add(lMesh);
        growthBones.push(lMesh);
      }

      // --- GROUP 4: NURSERY ACCLIMATIZATION MATRIX (Y = -52) ---
      const cols = 22, rows = 16;
      const totalCells = cols * rows;
      const cellGeom = new THREE.BoxGeometry(0.46, 0.68, 0.12);
      const cellMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
      const matrixMesh = new THREE.InstancedMesh(cellGeom, cellMat, totalCells);
      matrixMesh.position.set(0, -52, -2);
      scene.add(matrixMesh);
      matrixMeshRef.current = matrixMesh;

      const palette = [
        new THREE.Color(0x65a30d),
        new THREE.Color(0x84cc16),
        new THREE.Color(0x16a34a),
        new THREE.Color(0xeab308),
        new THREE.Color(0x15803d)
      ];
      const mData = [];
      let cIdx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c - cols / 2) * 0.62;
          const y = (r - rows / 2) * 0.82;
          const z = (Math.random() - 0.5) * 0.5;
          matrixDummyRef.current.position.set(x, y, z);
          matrixDummyRef.current.updateMatrix();
          matrixMesh.setMatrixAt(cIdx, matrixDummyRef.current.matrix);
          const col = palette[(r * 3 + c) % palette.length];
          matrixMesh.setColorAt(cIdx, col);
          mData.push({
            x, y, z,
            type: (r + c) % 3 === 0 ? 'exotic' : 'air',
            phase: Math.random() * Math.PI * 2,
            baseColor: col.clone()
          });
          cIdx++;
        }
      }
      matrixMesh.instanceMatrix.needsUpdate = true;
      matrixMesh.instanceColor.needsUpdate = true;
      matrixDataRef.current = mData;

      // --- GROUP 5: GOLDEN SEED / TOP 1% (Y = -68) ---
      goldenSeedGroup = new THREE.Group();
      goldenSeedGroup.position.set(-3.2, -68, 1.5);
      scene.add(goldenSeedGroup);

      const seedGeom = new THREE.SphereGeometry(1.35, 32, 32);
      const seedMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xd97706,
        emissiveIntensity: 0.55,
        roughness: 0.22,
        metalness: 0.35
      });
      goldenSeedGroup.add(new THREE.Mesh(seedGeom, seedMat));

      const haloCount = 120;
      const haloGeom = new THREE.BufferGeometry();
      const haloCoords = new Float32Array(haloCount * 3);
      for (let i = 0; i < haloCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const rad = 1.6 + Math.random() * 2.2;
        haloCoords[i * 3] = Math.cos(theta) * rad;
        haloCoords[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
        haloCoords[i * 3 + 2] = Math.sin(theta) * rad;
      }
      haloGeom.setAttribute('position', new THREE.BufferAttribute(haloCoords, 3));
      const haloMat = new THREE.PointsMaterial({
        size: 0.35,
        map: particleTex,
        color: 0xfef08a,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      goldenSeedGroup.add(new THREE.Points(haloGeom, haloMat));

      // --- AMBIENT SPORES (450 Particles) ---
      const pCount = 450;
      const pGeom = new THREE.BufferGeometry();
      const pCoords = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pCoords[i * 3] = (Math.random() - 0.5) * 24;
        pCoords[i * 3 + 1] = -Math.random() * 88 + 8;
        pCoords[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
      pGeom.setAttribute('position', new THREE.BufferAttribute(pCoords, 3));
      const pMat = new THREE.PointsMaterial({
        size: 0.38,
        map: particleTex,
        color: 0xa3e635,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      ambientParticles = new THREE.Points(pGeom, pMat);
      scene.add(ambientParticles);

      // Animation Loop
      let mouseX = 0, mouseY = 0;
      const onMouseMove = (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('mousemove', onMouseMove);

      const renderLoop = (time) => {
        animId = requestAnimationFrame(renderLoop);
        const t = time * 0.001;
        const sp = window.__rastlinaScrollPct || 0;

        const targetCamY = -sp * 76;
        camera.position.y += (targetCamY - camera.position.y) * 0.08;
        camera.position.x += (mouseX * 1.15 - camera.position.x) * 0.06;
        camera.lookAt(mouseX * 0.35, camera.position.y - 0.2, 0);

        if (heroGroup) {
          const peel = Math.min(1, Math.max(0, sp * 4.5));
          heroGroup.rotation.y = t * 0.22 + sp * 3.5 + mouseX * 0.4;
          leafMeshes.forEach((mesh, i) => {
            mesh.rotation.x = mesh.userData.baseRotX + peel * (0.85 + (i % 3) * 0.2) + Math.sin(t * 1.5 + i) * 0.04;
          });
        }

        if (constellationGroup) {
          constellationGroup.rotation.y = t * 0.18 + sp * 2.2;
        }

        if (potterGroup && plantStemGroup && rootsGroup) {
          const growth = Math.min(1, Math.max(0.12, (sp - 0.26) * 3.6));
          plantStemGroup.scale.set(growth, growth, growth);
          rootsGroup.scale.set(1, growth, 1);
          potterGroup.rotation.y = Math.sin(t * 0.5) * 0.25 + mouseX * 0.4;
          growthBones.forEach((leaf, idx) => {
            leaf.rotation.z = leaf.userData.baseZ + Math.sin(t * 2.2 + idx) * 0.06 + mouseX * 0.25;
          });
        }

        if (matrixMeshRef.current && matrixDataRef.current.length > 0) {
          for (let i = 0; i < matrixDataRef.current.length; i++) {
            const d = matrixDataRef.current[i];
            const waveZ = Math.sin(t * 2.4 + d.x * 0.7 + d.y * 0.5) * 0.42;
            matrixDummyRef.current.position.set(d.x, d.y, d.z + waveZ);
            matrixDummyRef.current.rotation.x = Math.cos(t * 1.5 + d.phase) * 0.18;
            matrixDummyRef.current.rotation.y = Math.sin(t * 1.2 + d.phase) * 0.18;
            matrixDummyRef.current.updateMatrix();
            matrixMeshRef.current.setMatrixAt(i, matrixDummyRef.current.matrix);
          }
          matrixMeshRef.current.instanceMatrix.needsUpdate = true;
        }

        if (goldenSeedGroup) {
          goldenSeedGroup.rotation.y = t * 0.55 + mouseX * 0.5;
          goldenSeedGroup.position.y = -68 + Math.sin(t * 1.8) * 0.25;
        }

        if (ambientParticles) {
          ambientParticles.rotation.y = t * 0.035;
        }

        renderer.render(scene, camera);
      };

      animId = requestAnimationFrame(renderLoop);

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
      };
    } catch (err) {
      console.warn('Three.js WebGL initialization encountered an issue. Activating graceful Canvas 2D fallback:', err);
      setWebGLError(true);
    }
  }, []);

  // -------------------------------------------------------------------------
  // CANVAS 2D FALLBACK (When GPU acceleration / WebGL is disabled)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!webGLError || !canvas2dRef.current) return;
    const cvs = canvas2dRef.current;
    const ctx = cvs.getContext('2d');
    let fallbackAnimId;

    const resize = () => {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (time) => {
      fallbackAnimId = requestAnimationFrame(draw);
      const t = time * 0.001;
      const w = cvs.width, h = cvs.height;
      ctx.clearRect(0, 0, w, h);

      // Radial background
      const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, Math.max(w,h)/1.4);
      grad.addColorStop(0, 'rgba(163, 230, 53, 0.16)');
      grad.addColorStop(0.5, 'rgba(6, 24, 14, 0.7)');
      grad.addColorStop(1, 'rgba(5, 19, 9, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rotating biological bio-node ring
      ctx.save();
      ctx.translate(w/2, h/2);
      const ringNodes = 16;
      for (let i = 0; i < ringNodes; i++) {
        const theta = (i / ringNodes) * Math.PI * 2 + t * 0.25;
        const r = 90 + Math.sin(t * 1.5 + i) * 18;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#bef264' : '#facc15';
        ctx.shadowColor = '#bef264';
        ctx.shadowBlur = 12;
        ctx.fill();

        const nextTheta = ((i + 1) / ringNodes) * Math.PI * 2 + t * 0.25;
        const nextR = 90 + Math.sin(t * 1.5 + i + 1) * 18;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(Math.cos(nextTheta) * nextR, Math.sin(nextTheta) * nextR);
        ctx.strokeStyle = 'rgba(163, 230, 53, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // Ambient drifting particles
      for (let j = 0; j < 35; j++) {
        const sx = (Math.sin(j * 93 + t * 0.3) * 0.5 + 0.5) * w;
        const sy = (Math.cos(j * 37 + t * 0.2) * 0.5 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + (j % 3), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(190, 242, 100, 0.45)';
        ctx.shadowColor = '#a3e635';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    };
    fallbackAnimId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(fallbackAnimId);
      window.removeEventListener('resize', resize);
    };
  }, [webGLError]);

  // -------------------------------------------------------------------------
  // SCROLL PROGRESSION & HUD SYNCHRONIZATION
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const rawScroll = window.scrollY;
      const progress = Math.min(1, Math.max(0, rawScroll / maxScroll));
      window.__rastlinaScrollPct = progress;
      setScrollProgress(progress);

      const chIdx = Math.min(6, Math.floor(progress * 7));
      setActiveChapter(chIdx);

      // Infinite scroll wrapping
      if (infiniteLoopEnabled && rawScroll >= maxScroll - 4) {
        if (!window.__rastlinaLoopCooldown) {
          window.__rastlinaLoopCooldown = true;
          window.scrollTo({ top: 12, behavior: 'auto' });
          showToast('♻ Seamless Infinite Loop: Returned to Chapter 01');
          setTimeout(() => { window.__rastlinaLoopCooldown = false; }, 650);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteLoopEnabled]);

  // -------------------------------------------------------------------------
  // AUTO-SCROLL TOUR CONTROLLER
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isAutoScrolling) {
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
      return;
    }
    const step = () => {
      window.scrollBy(0, 2.8);
      autoScrollRafRef.current = requestAnimationFrame(step);
    };
    autoScrollRafRef.current = requestAnimationFrame(step);
    return () => {
      if (autoScrollRafRef.current) cancelAnimationFrame(autoScrollRafRef.current);
    };
  }, [isAutoScrolling]);

  const toggleAutoScroll = () => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      showToast('Auto-Scroll Paused');
    } else {
      setIsAutoScrolling(true);
      showToast('▶ Auto-Scroll Tour: Relax and enjoy the 3D journey!');
    }
  };

  const jumpToRatio = (ratio) => {
    setIsAutoScrolling(false);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll * ratio, behavior: 'smooth' });
  };

  // -------------------------------------------------------------------------
  // ROOM AMBIANCE & LIGHT SIMULATION
  // -------------------------------------------------------------------------
  const handleSpaceSwitch = (spaceKey) => {
    setActiveSpace(spaceKey);
    if (spaceKey === 'cutaway') {
      if (warmLightRef.current && keyLightRef.current) {
        warmLightRef.current.color.setHex(0xfacc15);
        keyLightRef.current.intensity = 2.2;
      }
      showToast('Planter Cutaway & Sub-Irrigation Anatomy Active');
    } else {
      const cfg = ROOM_CONFIGS[spaceKey];
      if (cfg && warmLightRef.current && keyLightRef.current) {
        warmLightRef.current.color.setHex(cfg.lightColor);
        keyLightRef.current.intensity = cfg.lightInt;
      }
      showToast(`Activated ${cfg ? cfg.title : spaceKey} Ambiance`);
    }
  };

  const handleLightMode = (mode) => {
    setLightMode(mode);
    if (!warmLightRef.current || !keyLightRef.current) return;
    if (mode === 'morning') {
      warmLightRef.current.color.setHex(0xfacc15);
      keyLightRef.current.intensity = 2.4;
      showToast('☀️ Simulated Morning Balcony Sunlight');
    } else if (mode === 'indoor') {
      warmLightRef.current.color.setHex(0xa3e635);
      keyLightRef.current.intensity = 1.6;
      showToast('🛋️ Simulated Indirect Living Room Light');
    } else {
      warmLightRef.current.color.setHex(0x38bdf8);
      keyLightRef.current.intensity = 0.9;
      showToast('🌙 Simulated Evening Ambient Glow');
    }
  };

  const handleMatrixFilter = (filterKey) => {
    setMatrixFilter(filterKey);
    if (!matrixMeshRef.current || !matrixDataRef.current) return;
    const dimColor = new THREE.Color(0x0a2612);
    const highlightColor = new THREE.Color(0xfacc15);
    for (let i = 0; i < matrixDataRef.current.length; i++) {
      const d = matrixDataRef.current[i];
      if (filterKey === 'all') {
        matrixMeshRef.current.setColorAt(i, d.baseColor);
      } else if (d.type === filterKey) {
        matrixMeshRef.current.setColorAt(i, highlightColor);
      } else {
        matrixMeshRef.current.setColorAt(i, dimColor);
      }
    }
    matrixMeshRef.current.instanceColor.needsUpdate = true;
    showToast(`Filtered 3D Nursery Matrix: ${filterKey.toUpperCase()}`);
  };

  // -------------------------------------------------------------------------
  // BASKET / CART ACTIONS
  // -------------------------------------------------------------------------
  const addToCart = (productId) => {
    const prod = PRODUCTS.find(p => p.id === productId);
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: productId, qty: 1 }];
    });
    if (onAddToCart && prod) onAddToCart(prod);
    showToast(`Added ${prod ? prod.name : 'Plant'} with self-watering pot!`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      return prev
        .map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0);
    });
  };

  const cartTotalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(prod => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const activeRoomData = ROOM_CONFIGS[activeSpace];

  return (
    <div ref={containerRef} className="relative w-full bg-[#051309] text-slate-100 font-sans overflow-x-hidden selection:bg-lime-400 selection:text-emerald-950">
      
      {/* Dynamic Scoped Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@500;600;700&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.04em; text-transform: uppercase; }
        .font-serif-luxury { font-family: 'Playfair Display', serif; }
        .glass-panel {
          background: rgba(6, 24, 14, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(163, 230, 53, 0.22);
        }
        .kinetic-headline {
          position: relative;
          display: inline-block;
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(217, 249, 157, 0.72);
        }
        .kinetic-headline .fill-layer {
          position: absolute;
          inset: 0;
          color: #ffffff;
          -webkit-text-stroke: 0px transparent;
          clip-path: polygon(0 0, 92% 0, 80% 100%, 0% 100%);
          text-shadow: 0 0 35px rgba(163, 230, 53, 0.35);
          pointer-events: none;
        }
        .kinetic-headline .spark-layer {
          position: absolute;
          inset: 0;
          color: transparent;
          -webkit-text-stroke: 2px #bef264;
          clip-path: polygon(36% 0, 54% 0, 44% 100%, 28% 100%);
          filter: drop-shadow(0 0 12px #a3e635);
          pointer-events: none;
        }
      `}</style>

      {/* Dynamic Background Room Environment Backdrop */}
      <div
        className={`fixed inset-0 w-screen h-screen z-0 pointer-events-none transition-all duration-700 ${
          activeSpace !== 'cutaway' && activeRoomData ? activeRoomData.bgClass : 'bg-gradient-to-b from-[#051309] via-[#081f11] to-[#041007]'
        }`}
      />

      {/* 3D WebGL Canvas Layer (or 2D Fallback) */}
      {!webGLError ? (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 w-screen h-screen z-[1] pointer-events-none"
          aria-hidden="true"
        />
      ) : (
        <canvas
          ref={canvas2dRef}
          className="fixed inset-0 w-screen h-screen z-[1] pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Atmospheric Radial Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{ background: 'radial-gradient(circle at 50% 50%, transparent 35%, rgba(2, 12, 6, 0.72) 100%)' }}
      />

      {/* ------------------------------------------------------------------- */}
      {/* TOP NAVIGATION HEADER DOCK */}
      {/* ------------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between glass-panel border-t-0 border-x-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => jumpToRatio(0)}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-lime-400/15 border border-lime-400/50 flex items-center justify-center text-lime-300 font-display font-bold text-lg group-hover:scale-105 transition">
              🌿
            </div>
            <div>
              <span className="font-display text-lg sm:text-xl tracking-wider text-white block leading-none">RASTLINA</span>
              <span className="text-[10px] uppercase tracking-widest text-lime-300/80 block">Nature Hub • Hyderabad</span>
            </div>
          </button>
        </div>

        {/* Chapter Quick Jump Pills */}
        <nav className="hidden xl:flex items-center gap-1 bg-black/45 border border-lime-400/20 rounded-full px-2 py-1">
          {[
            { label: '01. Hero', r: 0 },
            { label: '02. Genetics', r: 0.18 },
            { label: '03. Self-Watering', r: 0.36 },
            { label: '04. Matrix', r: 0.54 },
            { label: '05. Top 1%', r: 0.72 },
            { label: '06. Spaces', r: 0.88 }
          ].map((ch, idx) => (
            <button
              key={idx}
              onClick={() => jumpToRatio(ch.r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                activeChapter === idx
                  ? 'bg-lime-400/25 border border-lime-400/40 text-lime-200 font-semibold'
                  : 'text-emerald-100/70 hover:text-white'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </nav>

        {/* Auto-Scroll Tour Button */}
        <button
          onClick={toggleAutoScroll}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/35 text-lime-300 border border-lime-400/40 transition shadow-sm"
          title="Toggle hands-free 3D tour"
        >
          <span>{isAutoScrolling ? '⏸' : '▶'}</span>
          <span>{isAutoScrolling ? 'Pause' : 'Auto-Scroll'}</span>
        </button>

        {/* Active Space Switcher Dock */}
        <div className="flex items-center gap-1.5 bg-black/55 border border-lime-400/30 rounded-full px-2.5 py-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-amber-300 mr-1 hidden sm:inline">Active View:</span>
          <button
            onClick={() => handleSpaceSwitch('cutaway')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
              activeSpace === 'cutaway' ? 'bg-lime-400 text-emerald-950' : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            03. Planter
          </button>
          <button
            onClick={() => handleSpaceSwitch('living_room')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
              activeSpace === 'living_room' ? 'bg-lime-400 text-emerald-950 font-semibold' : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            🛋️ Living
          </button>
          <button
            onClick={() => handleSpaceSwitch('bedroom')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
              activeSpace === 'bedroom' ? 'bg-lime-400 text-emerald-950 font-semibold' : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            🛏️ Bed
          </button>
          <button
            onClick={() => handleSpaceSwitch('office')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
              activeSpace === 'office' ? 'bg-lime-400 text-emerald-950 font-semibold' : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            💼 Office
          </button>
        </div>

        {/* Action Buttons: Modal + Cart */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSpaceModalOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-400/20 hover:bg-amber-400/35 text-amber-200 border border-amber-400/40 transition flex items-center gap-1"
          >
            <span>🏡 Place</span>
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-1.5 rounded-full text-xs font-semibold bg-lime-400 text-emerald-950 hover:bg-lime-300 transition flex items-center gap-1.5 shadow-md"
          >
            <span>Shop</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-lime-300 text-[11px] font-bold">
              {cartTotalQty}
            </span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* VERTICAL SCROLL PROGRESS HUD */}
      {/* ------------------------------------------------------------------- */}
      <div className="fixed right-4 sm:right-7 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-display text-xs text-lime-300/90 tracking-widest">
          {Math.round(scrollProgress * 100).toString().padStart(2, '0')}%
        </span>
        <div className="w-1 h-36 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="w-full bg-gradient-to-b from-lime-300 to-emerald-400 rounded-full transition-all duration-75"
            style={{ height: `${Math.max(3, scrollProgress * 100)}%` }}
          />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-emerald-200/70 [writing-mode:vertical-rl] rotate-180 mt-2">
          {CHAPTER_TITLES[activeChapter] || 'SEED TO SANCTUARY'}
        </span>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* ACTIVE ROOM AMBIANCE BOTTOM BAR */}
      {/* ------------------------------------------------------------------- */}
      {activeSpace !== 'cutaway' && activeRoomData && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex px-5 py-2.5 rounded-full glass-panel border border-amber-400/40 shadow-2xl items-center gap-4 transition-all">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="font-display text-sm text-white uppercase tracking-wider">{activeRoomData.title}</span>
            <span className="text-xs text-amber-300/80">•</span>
            <span className="text-xs text-emerald-100/80">{activeRoomData.desc}</span>
          </div>
          <div className="h-4 w-[1px] bg-white/20" />
          <button
            onClick={() => addToCart('philo-red')}
            className="px-3.5 py-1 rounded-full bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold text-xs uppercase tracking-wider transition"
          >
            Add Plant For This Room (₹329)
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SCROLLABLE STORY CONTENT (7 CHAPTERS) */}
      {/* ------------------------------------------------------------------- */}
      <main className="relative z-10">

        {/* SECTION 1: HERO */}
        <section className="min-height-[125vh] w-full flex items-center justify-center text-center px-4 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs uppercase tracking-widest mb-6">
              <span>Rastlina Interactive 3D Experience</span>
              <span>•</span>
              <span>Rooted in Confidence</span>
            </div>
            <h1 className="kinetic-headline text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] leading-none select-none">
              PLANTS. REVOLUTIONIZED.
              <span className="fill-layer" aria-hidden="true">PLANTS. REVOLUTIONIZED.</span>
              <span className="spark-layer" aria-hidden="true">PLANTS. REVOLUTIONIZED.</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-emerald-100/85 font-light leading-relaxed">
              Scroll through the living science behind every handpicked indoor plant, self-watering planter, and custom soil mix crafted in Hyderabad.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => jumpToRatio(0.18)}
                className="px-6 py-2.5 rounded-full bg-lime-400 text-emerald-950 font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-lime-300 transition shadow-lg shadow-lime-400/20"
              >
                Begin The Scroll Journey ↓
              </button>
              <button
                onClick={() => jumpToRatio(0.88)}
                className="px-6 py-2.5 rounded-full glass-panel text-amber-200 font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-white/10 transition"
              >
                View In Your Room (06. Spaces)
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: CELLULAR SELECTION & SOIL MICROBIOME */}
        <section className="min-h-[140vh] w-full flex items-center justify-start px-4 sm:px-12 py-20">
          <div className="max-w-xl glass-panel p-6 sm:p-8 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-300 block mb-2">
              Chapter 02 • Cellular Selection &amp; Soil Microbiome
            </span>
            <h2 className="kinetic-headline text-3xl sm:text-5xl mb-4">
              FIRST, A SOLID FOUNDATION.
              <span className="fill-layer" aria-hidden="true">FIRST, A SOLID FOUNDATION.</span>
              <span className="spark-layer" aria-hidden="true">FIRST, A SOLID FOUNDATION.</span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-6">
              Our process starts at the microscopic root level. We map aeration, cocopeat moisture retention, perlite drainage, and bio-nutrients across 40+ indoor species—from <strong className="text-lime-300">Calathea Roseopicta</strong> to <strong className="text-lime-300">Philodendron Oxycardium Red</strong>.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-lime-400/20 text-center">
              <div>
                <span className="font-display text-2xl sm:text-3xl text-lime-300 block">18+</span>
                <span className="text-[11px] text-emerald-200/75 uppercase">Soil Bio-Nodes</span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl text-amber-300 block">3.2x</span>
                <span className="text-[11px] text-emerald-200/75 uppercase">Root Oxygenation</span>
              </div>
              <div>
                <span className="font-display text-2xl sm:text-3xl text-emerald-300 block">100%</span>
                <span className="text-[11px] text-emerald-200/75 uppercase">Pest-Free Media</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SELF-WATERING PLANTER ENGINEERING */}
        <section className="min-h-[155vh] w-full flex items-center justify-end px-4 sm:px-12 py-20">
          <div className="max-w-xl glass-panel p-6 sm:p-8 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-lime-300 block mb-2">
              Chapter 03 • Self-Watering Planter Engineering
            </span>
            <h2 className="kinetic-headline text-3xl sm:text-5xl mb-4">
              WE TAKE IT TO YOUR SPACE.
              <span className="fill-layer" aria-hidden="true">WE TAKE IT TO YOUR SPACE.</span>
              <span className="spark-layer" aria-hidden="true">WE TAKE IT TO YOUR SPACE.</span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-5">
              Watch the cutaway background in real time: roots extend downward through the perforated barrier into the <strong className="text-lime-300">Rastlina Sub-Irrigation Reservoir</strong>. Water is absorbed strictly on demand via capillary wicking, protecting your plant from root rot.
            </p>
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-lime-400/25 flex items-center justify-between text-xs mb-4">
              <span>💧 Reservoir Autonomy: <strong>Up to 10–14 Days</strong> without manual watering</span>
              <span className="text-lime-300 font-semibold">Zero Root Rot</span>
            </div>

            {/* Interactive Lighting Simulation */}
            <div className="mb-4 pt-3 border-t border-lime-400/20">
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold block mb-2">
                Simulate Hyderabad Indoor Lighting:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'morning', label: '☀️ Morning Sun' },
                  { id: 'indoor', label: '🛋️ Indirect Light' },
                  { id: 'evening', label: '🌙 Evening Glow' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleLightMode(m.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      lightMode === m.id
                        ? 'bg-amber-400/25 border border-amber-300 text-amber-200 font-semibold'
                        : 'bg-white/5 border border-white/15 text-emerald-100 hover:bg-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSpaceSwitch('cutaway')}
              className="w-full py-2.5 rounded-xl bg-lime-400 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-lime-300 transition shadow-lg shadow-lime-400/20"
            >
              Inspect Cutaway Mechanism (3D Sub-Irrigation)
            </button>
          </div>
        </section>

        {/* SECTION 4: ACCLIMATIZATION MATRIX */}
        <section className="min-h-[140vh] w-full flex items-center justify-start px-4 sm:px-12 py-20">
          <div className="max-w-xl glass-panel p-6 sm:p-8 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-lime-300 block mb-2">
              Chapter 04 • Acclimatization Matrix
            </span>
            <h2 className="kinetic-headline text-3xl sm:text-5xl mb-4">
              TESTING, TESTING AND MORE TESTING.
              <span className="fill-layer" aria-hidden="true">TESTING, TESTING AND MORE TESTING.</span>
              <span className="spark-layer" aria-hidden="true">TESTING, TESTING AND MORE TESTING.</span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-5">
              Before any plant is delivered in Hyderabad or across India, nursery specimens undergo multi-week indoor humidity, low-light stress, and leaf-vitality checks at our hub.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All 400 Test Plots' },
                { id: 'air', label: 'Air-Purifying Pass' },
                { id: 'exotic', label: 'Exotic Beauties Pass' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => handleMatrixFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    matrixFilter === f.id
                      ? 'bg-lime-400 text-emerald-950'
                      : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: TOP 1% SELECTION & CATALOG */}
        <section className="min-h-[145vh] w-full flex items-center justify-center px-4 sm:px-8 py-20">
          <div className="max-w-6xl w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-2xl">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-300 block mb-2">
                  Chapter 05 • The Golden Standard
                </span>
                <h2 className="kinetic-headline text-3xl sm:text-5xl mb-4">
                  ONLY THE FINEST 1% MAKE IT HOME.
                  <span className="fill-layer" aria-hidden="true">ONLY THE FINEST 1% MAKE IT HOME.</span>
                  <span className="spark-layer" aria-hidden="true">ONLY THE FINEST 1% MAKE IT HOME.</span>
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-4">
                  Every Rastlina set arrives ready to gift with a vibrant plant, self-watering pot, and nutrient-rich soil mix—backed by <strong className="text-lime-300">1,000+ Happy Homes</strong> and a <strong className="text-lime-300">4.8/5 rating</strong> across India.
                </p>
                <button
                  onClick={() => jumpToRatio(0.88)}
                  className="w-full py-3 rounded-xl bg-amber-400 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition"
                >
                  Now, Select A Space For Your Plant ↓
                </button>
              </div>

              {/* Product Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRODUCTS.map(p => {
                  const inCart = cart.find(item => item.id === p.id);
                  return (
                    <div key={p.id} className="glass-panel p-4 rounded-xl flex flex-col justify-between hover:border-lime-400/60 transition">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-lime-300 font-semibold">{p.category}</span>
                          <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 text-[10px] font-bold">{p.badge}</span>
                        </div>
                        <h3 className="font-display text-lg text-white leading-snug">{p.name}</h3>
                        <p className="text-xs text-emerald-100/75 mt-1 mb-3 leading-relaxed">{p.desc}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                        <div>
                          <span className="font-display text-xl text-lime-300">₹{p.price}</span>
                          <span className="text-xs text-emerald-200/50 line-through ml-1">₹{p.mrp}</span>
                        </div>
                        <button
                          onClick={() => addToCart(p.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            inCart ? 'bg-emerald-700 text-white' : 'bg-lime-400 text-emerald-950 hover:bg-lime-300'
                          }`}
                        >
                          {inCart ? `In Basket (${inCart.qty}) +` : '+ Add to Basket'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: A PLACE FOR YOUR PLANT (Living Room, Bedroom, Office) */}
        <section className="min-h-[140vh] w-full flex items-center justify-center px-4 sm:px-8 py-20">
          <div className="max-w-6xl w-full mx-auto">
            <div
              className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-400/30 shadow-2xl relative overflow-hidden"
              style={{ background: 'radial-gradient(circle at 50% 0%, #0d2818 0%, #051309 85%)' }}
            >
              <div className="relative z-10 mb-8 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full border border-amber-400/60 text-amber-300 text-[11px] font-bold flex items-center justify-center font-display">06</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-amber-300/90 font-semibold font-display">A PLACE FOR YOUR PLANT</span>
                </div>
                <h2 className="text-4xl sm:text-6xl font-display text-white tracking-wide leading-tight">
                  Your world. <br />
                  <span className="font-serif-luxury italic text-amber-200 font-normal">A little greener.</span>
                </h2>
                <p className="mt-3 text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                  A quiet bedroom. A welcoming living room. A little room to think. Find the place that feels like you.
                </p>
              </div>

              {/* 3 Room Selection Cards */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                  { id: 'living_room', num: '01', title: 'Living Room', desc: 'A warm welcome.' },
                  { id: 'bedroom', num: '02', title: 'Bedroom', desc: 'A quiet retreat.' },
                  { id: 'office', num: '03', title: 'Office', desc: 'Room to focus.' }
                ].map(room => (
                  <div
                    key={room.id}
                    onClick={() => handleSpaceSwitch(room.id)}
                    className={`group relative rounded-2xl overflow-hidden border bg-black/40 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1.5 shadow-xl ${
                      activeSpace === room.id ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/15 hover:border-amber-400'
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden bg-emerald-950/60 flex items-center justify-center">
                      <span className="text-5xl opacity-40 group-hover:scale-110 transition duration-500">
                        {room.id === 'living_room' ? '🛋️' : room.id === 'bedroom' ? '🛏️' : '💼'}
                      </span>
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center font-display">
                        {room.num}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    </div>
                    <div className="p-5 flex items-end justify-between bg-[#081b10]/95 border-t border-white/10">
                      <div>
                        <h3 className="font-display text-2xl text-white group-hover:text-amber-300 transition">{room.title}</h3>
                        <p className="text-xs text-emerald-200/75 mt-0.5">{room.desc}</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-emerald-950 flex items-center justify-center text-sm font-bold transition">
                        ↗
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Switcher */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/15 text-xs">
                <div className="flex items-center gap-2 text-emerald-200/90">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                  <span>Click any room card above to immerse into that space with warm Hyderabad lighting.</span>
                </div>
                <button
                  onClick={() => handleSpaceSwitch('cutaway')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-lime-200 transition"
                >
                  ← Return to Planter Cutaway
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: INFINITE LOOP FOOTER */}
        <section className="min-h-[110vh] w-full flex items-center justify-center text-center px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/15 border border-lime-400/30 text-lime-300 text-xs uppercase tracking-widest mb-6">
              <span>♻ Cycle of Nature • Infinite Scroll Loop</span>
            </div>

            <nav className="flex flex-col items-center space-y-4 mb-8">
              <button
                onClick={() => showToast('🌿 Code LAUNCH40 copied — Flat 40% Off on www.rastlina.com')}
                className="text-lg sm:text-xl font-display uppercase tracking-wider text-lime-200 hover:text-amber-300 transition"
              >
                SIGN UP FOR GREEN OFFERS (FLAT 40% LAUNCH)
              </button>
              <button
                onClick={() => showToast('📞 Rastlina Plant Stylist Desk (Kondapur, Hyderabad): +91 81438 14466')}
                className="text-lg sm:text-xl font-display uppercase tracking-wider text-lime-200 hover:text-amber-300 transition"
              >
                CONTACT A PLANT STYLIST • HYDERABAD
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-lg sm:text-xl font-display uppercase tracking-wider text-lime-200 hover:text-amber-300 transition"
              >
                EXPLORE COMBOS &amp; SELF-WATERING BUNDLES
              </button>
              <a
                href="https://www.rastlina.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg sm:text-xl font-display uppercase tracking-wider text-lime-200 hover:text-amber-300 transition"
              >
                VISIT RASTLINA.COM ↗
              </a>
            </nav>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-200/80 pt-4 border-t border-lime-400/20">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={infiniteLoopEnabled}
                  onChange={(e) => setInfiniteLoopEnabled(e.target.checked)}
                  className="accent-lime-400 w-4 h-4 rounded"
                />
                <span>Seamless Infinite Scroll Loop (Keep scrolling down to wrap to top)</span>
              </label>
              <button
                onClick={() => jumpToRatio(0)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-lime-200 transition"
              >
                ↑ Return to Top
              </button>
            </div>

            <p className="mt-6 text-[11px] text-emerald-200/60">
              © 2026 Rastlina Nature Hub Private Limited • 4th Floor, Lake View Towers, Kondapur, Hyderabad 500084
            </p>
          </div>
        </section>

      </main>

      {/* ------------------------------------------------------------------- */}
      {/* POP-UP MODAL: A PLACE FOR YOUR PLANT */}
      {/* ------------------------------------------------------------------- */}
      {isSpaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-all">
          <div
            className="relative w-full max-w-4xl rounded-3xl p-6 sm:p-10 border border-amber-400/30 shadow-2xl overflow-hidden"
            style={{ background: 'radial-gradient(circle at 50% 0%, #0d2818 0%, #051309 75%)' }}
          >
            <button
              onClick={() => setIsSpaceModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition z-20"
            >
              ✕
            </button>

            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full border border-amber-400/60 text-amber-300 text-[11px] font-bold flex items-center justify-center font-display">06</span>
                <span className="text-xs uppercase tracking-widest text-amber-300/90 font-semibold font-display">A PLACE FOR YOUR PLANT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display text-white tracking-wide">
                Your world. <span className="font-serif-luxury italic text-amber-200 font-normal">A little greener.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { id: 'living_room', title: 'Living Room', icon: '🛋️', desc: 'A warm welcome.' },
                { id: 'bedroom', title: 'Bedroom', icon: '🛏️', desc: 'A quiet retreat.' },
                { id: 'office', title: 'Office', icon: '💼', desc: 'Room to focus.' }
              ].map(room => (
                <div
                  key={room.id}
                  onClick={() => {
                    handleSpaceSwitch(room.id);
                    setIsSpaceModalOpen(false);
                  }}
                  className="rounded-2xl p-5 bg-black/40 border border-white/15 hover:border-amber-400 cursor-pointer transition hover:-translate-y-1"
                >
                  <div className="text-4xl mb-3">{room.icon}</div>
                  <h3 className="font-display text-xl text-white mb-1">{room.title}</h3>
                  <p className="text-xs text-emerald-200/70">{room.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsSpaceModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-lime-400 text-emerald-950 font-bold uppercase tracking-wider text-xs hover:bg-lime-300 transition"
            >
              Close &amp; Explore
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SHOPPING CART DRAWER */}
      {/* ------------------------------------------------------------------- */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel border-l border-lime-400/30 p-6 transform transition-transform duration-300 flex flex-col justify-between ${
          isCartOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-lime-400/20">
            <div>
              <h3 className="font-display text-2xl text-white">Your Rastlina Basket</h3>
              <p className="text-xs text-lime-300">Self-Watering Planter &amp; Custom Mix Included</p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-xs text-emerald-200/70 py-8 text-center">Your basket is empty. Add a plant from Chapter 05!</p>
            ) : (
              cart.map(item => {
                const prod = PRODUCTS.find(p => p.id === item.id);
                if (!prod) return null;
                return (
                  <div key={item.id} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-white">{prod.name}</div>
                      <div className="text-[11px] text-lime-300">₹{prod.price} × {item.qty} = ₹{prod.price * item.qty}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs text-white flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-xs px-1.5 font-semibold text-white">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs text-white flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-lime-400/20 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-100/80">Subtotal (incl. Self-Watering Pot)</span>
            <span className="font-display text-xl text-lime-300">₹{cartTotalPrice}</span>
          </div>
          <a
            href="https://www.rastlina.com/shop"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-xl bg-lime-400 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-lime-300 transition"
          >
            Proceed to Checkout on Rastlina.com ↗
          </a>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TOAST NOTIFICATION */}
      {/* ------------------------------------------------------------------- */}
      {toastText && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-lime-400 text-emerald-950 font-semibold text-xs shadow-2xl transition">
          {toastText}
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. EXPORT WITH ERROR BOUNDARY WRAPPER
// ---------------------------------------------------------------------------
export default function RastlinaScroll3D(props) {
  return (
    <RastlinaErrorBoundary>
      <RastlinaScroll3DInner {...props} />
    </RastlinaErrorBoundary>
  );
}
