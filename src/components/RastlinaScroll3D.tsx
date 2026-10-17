import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SpaceConfig {
  id: string;
  label: string;
  src: string;
  lightColor: number;
  lightInt: number;
  title: string;
  desc: string;
}

const SPACES: SpaceConfig[] = [
  {
    id: 'cutaway',
    label: '03. Planter Cutaway',
    src: '/videos/clip_5_scroll.mp4',
    lightColor: 0xfacc15,
    lightInt: 2.2,
    title: 'Self-Watering Planter Cutaway',
    desc: 'Capillary sub-irrigation reservoir with 14-day water autonomy.'
  },
  {
    id: 'living_room',
    label: '🛋️ Living Room',
    src: '/videos/living_room_scroll.mp4',
    lightColor: 0xfacc15,
    lightInt: 2.4,
    title: 'Living Room',
    desc: 'A warm welcome. Hyderabad Balcony Light.'
  },
  {
    id: 'bedroom',
    label: '🛏️ Bedroom',
    src: '/videos/bedroom_scroll.mp4',
    lightColor: 0xfbbf24,
    lightInt: 1.6,
    title: 'Bedroom',
    desc: 'A quiet retreat. Soft ambient morning glow.'
  },
  {
    id: 'office',
    label: '💼 Office',
    src: '/videos/office_scroll.mp4',
    lightColor: 0xe0f2fe,
    lightInt: 2.3,
    title: 'Office',
    desc: 'Room to focus. Executive desk daylight view.'
  }
];

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
    desc: 'Feathered venation that folds prayer-like at night.'
  },
  {
    id: 'combo-trio',
    name: 'Sleeping Pothos + Cryptanthus + Silver Sword (Set of 3)',
    category: 'Combos of 3 • Bestseller',
    price: 649,
    mrp: 1199,
    badge: '46% OFF',
    desc: 'Curated indoor trio with self-watering pots and aerated mix.'
  },
  {
    id: 'black-ficus',
    name: 'Black Ficus Burgundy - Rubber Plant',
    category: 'Exotic Beauties',
    price: 299,
    mrp: 499,
    badge: '40% OFF',
    desc: 'Deep glossy burgundy foliage that thrives in living rooms.'
  }
];

export default function RastlinaScroll3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [activeSpace, setActiveSpace] = useState<string>('cutaway');
  const [scrollPct, setScrollPct] = useState<number>(0);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [cart, setCart] = useState<Array<{ id: string; qty: number }>>([
    { id: 'philo-red', qty: 1 }
  ]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const warmLightRef = useRef<THREE.PointLight | null>(null);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Video autoplay policy workaround
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [activeSpace]);

  // Three.js 3D WebGL background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x051309, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 140);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x051309, 0.35);

    const ambientLight = new THREE.AmbientLight(0x1e3a29, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd9f99d, 2.2);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const warmLight = new THREE.PointLight(0xfacc15, 2.8, 22);
    warmLight.position.set(0, 0.5, 2);
    scene.add(warmLight);
    warmLightRef.current = warmLight;

    // Glowing core plant
    const coreGeom = new THREE.CylinderGeometry(0.55, 0.85, 3.8, 20);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.45,
      roughness: 0.35
    });
    const plantCore = new THREE.Mesh(coreGeom, coreMat);
    scene.add(plantCore);

    // Particle field
    const pCount = 300;
    const pCoords = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pCoords[i * 3] = (Math.random() - 0.5) * 20;
      pCoords[i * 3 + 1] = -Math.random() * 80 + 5;
      pCoords[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(pCoords, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      color: 0xa3e635,
      transparent: true,
      opacity: 0.75
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // Scroll listener
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const rawProgress = window.scrollY / maxScroll;
      const progress = Math.min(1, Math.max(0, rawProgress));
      setScrollPct(Math.round(progress * 100));

      camera.position.y = -progress * 70;
      plantCore.rotation.y = progress * 4;

      // Video scrub synchronization
      if (videoRef.current && videoRef.current.duration) {
        videoRef.current.currentTime = (progress * videoRef.current.duration) % videoRef.current.duration;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    let reqId: number;
    const animate = (time: number) => {
      particles.rotation.y = time * 0.00005;
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };
    animate(0);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  const switchSpace = (spaceId: string) => {
    setActiveSpace(spaceId);
    const space = SPACES.find(s => s.id === spaceId);
    if (!space) return;

    if (videoRef.current) {
      videoRef.current.src = space.src;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }

    if (warmLightRef.current && keyLightRef.current) {
      warmLightRef.current.color.setHex(space.lightColor);
      keyLightRef.current.intensity = space.lightInt;
    }

    showToastMsg(`${space.label} active`);
  };

  const currentSpace = SPACES.find(s => s.id === activeSpace) || SPACES[0];
  const cartTotal = cart.reduce((sum, item) => {
    const prod = PRODUCTS.find(p => p.id === item.id);
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);

  return (
    <div ref={containerRef} className="relative w-full min-h-[550vh] bg-[#051309] text-white font-sans overflow-x-hidden">
      {/* Background Video Layer with Fallback */}
      <video
        ref={videoRef}
        src={currentSpace.src}
        autoPlay
        muted
        playsInline
        loop
        onLoadedData={() => setVideoLoaded(true)}
        onError={() => setVideoLoaded(false)}
        className={`fixed inset-0 w-screen h-screen object-cover z-0 transition-opacity duration-700 pointer-events-none ${
          videoLoaded ? 'opacity-85' : 'opacity-20'
        }`}
      />

      {/* 3D WebGL Canvas Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 w-screen h-screen z-10 pointer-events-none" />

      {/* Atmospheric Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[12]"
        style={{ background: 'radial-gradient(circle at 50% 50%, transparent 35%, rgba(2, 12, 6, 0.75) 100%)' }}
      />

      {/* Top Floating Header & Space Dock */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-lime-400/20">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-lime-400/15 border border-lime-400/50 flex items-center justify-center text-lime-300 font-bold">
            🌿
          </div>
          <span className="font-bold tracking-wider text-white text-base">RASTLINA</span>
        </a>

        {/* Space Switcher Dock */}
        <div className="flex items-center gap-1 bg-black/50 border border-lime-400/30 rounded-full px-2 py-1 text-xs">
          {SPACES.map(s => (
            <button
              key={s.id}
              onClick={() => switchSpace(s.id)}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                activeSpace === s.id ? 'bg-lime-400 text-emerald-950 shadow-md' : 'text-emerald-100/70 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCartOpen(true)}
          className="relative px-3 py-1.5 rounded-full text-xs font-semibold bg-lime-400 text-emerald-950 hover:bg-lime-300 transition"
        >
          Basket ({cart.reduce((a, b) => a + b.qty, 0)})
        </button>
      </header>

      {/* Scroll Progress HUD */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-mono text-xs text-lime-300">{scrollPct.toString().padStart(2, '0')}%</span>
        <div className="w-1 h-36 bg-white/10 rounded-full overflow-hidden">
          <div className="w-full bg-lime-400 rounded-full transition-all" style={{ height: `${Math.max(2, scrollPct)}%` }} />
        </div>
      </div>

      {/* Active Room HUD Bottom Bar */}
      {activeSpace !== 'cutaway' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/40 shadow-2xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-white">{currentSpace.title}</span>
            <span className="text-emerald-200/80">• {currentSpace.desc}</span>
          </div>
          <button
            onClick={() => {
              setCart(prev => [{ id: 'philo-red', qty: 1 }, ...prev]);
              setCartOpen(true);
            }}
            className="px-3 py-1 rounded-full bg-lime-400 text-emerald-950 font-bold hover:bg-lime-300 transition"
          >
            Add Plant for this Room (₹329)
          </button>
        </div>
      )}

      {/* Story Sections */}
      <main className="relative z-20">
        {/* Section 01 */}
        <section className="min-height-[100vh] h-screen flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full bg-lime-400/15 border border-lime-400/30 text-lime-300 text-xs uppercase tracking-widest mb-4">
              Rastlina Living Science
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-white">
              Plants. Revolutionized.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-xl mx-auto">
              Scroll to explore the sub-irrigation planter technology, Hyderabad acclimatization matrix, and rooms designed for your plant.
            </p>
          </div>
        </section>

        {/* Section 02 */}
        <section className="min-height-[100vh] h-screen flex items-center px-8 sm:px-16">
          <div className="max-w-md p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-lime-400/20">
            <span className="text-xs uppercase font-bold text-amber-300 block mb-1">Chapter 02</span>
            <h2 className="text-3xl font-bold uppercase text-white mb-3">Root Microbiome</h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Every specimen is paired with cocopeat aeration and perlite drainage to maximize root oxygenation before delivery.
            </p>
          </div>
        </section>

        {/* Section 03 */}
        <section className="min-height-[100vh] h-screen flex items-center justify-end px-8 sm:px-16">
          <div className="max-w-md p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-lime-400/20">
            <span className="text-xs uppercase font-bold text-lime-300 block mb-1">Chapter 03</span>
            <h2 className="text-3xl font-bold uppercase text-white mb-3">Self-Watering Anatomy</h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed mb-4">
              Watch the bottom reservoir feed roots strictly on demand through capillary wicking — ensuring zero root rot and up to 14 days of watering autonomy.
            </p>
            <button
              onClick={() => switchSpace('cutaway')}
              className="w-full py-2.5 rounded-xl bg-lime-400 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-lime-300 transition"
            >
              Inspect Cutaway Reservoir
            </button>
          </div>
        </section>

        {/* Section 04: Space Selector */}
        <section className="min-height-[100vh] h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl w-full p-8 rounded-3xl bg-black/75 backdrop-blur-xl border border-amber-400/30">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-300">06 • A Place for Your Plant</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-1">Your world. A little greener.</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SPACES.filter(s => s.id !== 'cutaway').map(s => (
                <div
                  key={s.id}
                  onClick={() => switchSpace(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    activeSpace === s.id ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <h3 className="font-bold text-lg text-white">{s.title}</h3>
                  <p className="text-xs text-emerald-200/70 mt-1">{s.desc}</p>
                  <span className="inline-block mt-3 text-xs font-semibold text-lime-300">Switch View →</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-black/90 backdrop-blur-xl border-l border-lime-400/30 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-xl text-white">Your Basket</h3>
              <button onClick={() => setCartOpen(false)} className="text-white hover:text-lime-300">✕</button>
            </div>
            <div className="mt-4 space-y-3">
              {cart.map(item => {
                const prod = PRODUCTS.find(p => p.id === item.id);
                return (
                  <div key={item.id} className="p-3 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{prod?.name}</div>
                      <div className="text-lime-300">₹{prod?.price} × {item.qty}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm mb-3">
              <span>Total</span>
              <span className="font-bold text-lime-300">₹{cartTotal}</span>
            </div>
            <a
              href="https://www.rastlina.com/shop"
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3 rounded-xl bg-lime-400 text-emerald-950 font-bold text-center text-xs uppercase tracking-wider"
            >
              Checkout on Rastlina.com ↗
            </a>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-lime-400 text-emerald-950 font-bold text-xs shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
