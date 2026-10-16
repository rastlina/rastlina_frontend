import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    THREE: any;
    gsap: any;
    ScrollTrigger: any;
  }
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  badge: string;
  url: string;
  desc: string;
}

const RASTLINA_PRODUCTS: ProductItem[] = [
  {
    id: 'philo-red',
    name: 'Philodendron Oxycardium Red',
    category: 'Philodendron • Bestseller',
    price: 329,
    mrp: 599,
    badge: '45% OFF',
    url: 'https://www.rastlina.com/',
    desc: 'Heart-shaped bronze-red leaves in a Rastlina self-watering planter.'
  },
  {
    id: 'calathea-makoyana',
    name: 'Calathea Makoyana (Peacock Plant)',
    category: 'Calathea • Fresh Arrival',
    price: 499,
    mrp: 699,
    badge: '29% OFF',
    url: 'https://www.rastlina.com/',
    desc: 'Intricate feathered leaf venation that folds prayer-like at night.'
  },
  {
    id: 'combo-trio',
    name: 'Sleeping Pothos + Cryptanthus + Silver Sword (Set of 3)',
    category: 'Combos of 3 • Bestseller',
    price: 649,
    mrp: 1199,
    badge: '46% OFF',
    url: 'https://www.rastlina.com/',
    desc: 'Curated trio with self-watering pots and custom aerated potting mix.'
  },
  {
    id: 'black-ficus',
    name: 'Black Ficus Burgundy - Rubber Plant',
    category: 'Exotic Beauties',
    price: 299,
    mrp: 499,
    badge: '40% OFF',
    url: 'https://www.rastlina.com/shop?category=exotic-beauties',
    desc: 'Deep glossy burgundy foliage that thrives in indoor living rooms.'
  }
];

export const RastlinaScroll3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSpace, setActiveSpace] = useState<'living' | 'bedroom' | 'office'>('living');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [id: string]: number }>({ 'philo-red': 1, 'combo-trio': 1 });

  const spaces = {
    living: {
      name: 'Living Room Sanctuary',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sun-light-falling-on-a-plant-in-a-living-room-42880-large.mp4',
      badge: 'Natural Indirect Sunlight',
      desc: 'Ideal for Philodendron, Monsteras, and statement floor foliage.'
    },
    bedroom: {
      name: 'Peaceful Bedroom Zen',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-plant-leaves-under-the-morning-sun-43362-large.mp4',
      badge: 'Filtered Ambient Soft Glow',
      desc: 'Optimized for high-oxygen overnight release (Snake plants & Peace Lilies).'
    },
    office: {
      name: 'Executive Workdesk Focus',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-green-leaves-42999-large.mp4',
      badge: 'Indoor LED / Desktop Light',
      desc: 'Curated compact self-watering planters that boost mood and focus.'
    }
  };

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const addToCart = (id: string, name: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    showToast(`Added ${name} to your Rastlina basket!`);
  };

  useEffect(() => {
    let isMounted = true;
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });
    };

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js').then(() => {
      if (!isMounted || !mountRef.current || !window.THREE) return;

      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 8;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);

      const particleCount = 200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 16;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 8;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(190, 242, 100, 1)');
        grad.addColorStop(0.5, 'rgba(163, 230, 53, 0.5)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      const pTex = new THREE.CanvasTexture(canvas);

      const material = new THREE.PointsMaterial({
        size: 0.35,
        map: pTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      let animId: number;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        points.rotation.y += 0.0012;
        points.rotation.x += 0.0006;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const vid = videoRef.current;
      if (!vid || !vid.duration || isNaN(vid.duration)) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      vid.currentTime = progress * vid.duration;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="relative min-h-[350vh] bg-[#051309] text-white font-sans selection:bg-lime-400 selection:text-black">
      <video
        ref={videoRef}
        key={spaces[activeSpace].videoUrl}
        src={spaces[activeSpace].videoUrl}
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-45 pointer-events-none"
      />

      <div ref={mountRef} className="fixed inset-0 z-10 pointer-events-none" />
      <div className="fixed inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(5,19,9,0.85)_100%)]" />

      <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-lime-400/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="font-bold tracking-wider text-sm uppercase text-white leading-none">RASTLINA 3D</h1>
            <span className="text-[10px] text-lime-300/80 tracking-widest uppercase">Plants. Revolutionized.</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
          {(['living', 'bedroom', 'office'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveSpace(key)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition ${
                activeSpace === key
                  ? 'bg-lime-400 text-emerald-950 shadow-md shadow-lime-400/20'
                  : 'text-emerald-100/70 hover:text-white'
              }`}
            >
              {key === 'living' ? '🛋️ Living' : key === 'bedroom' ? '🛏️ Bedroom' : '💼 Office'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="relative px-4 py-1.5 rounded-full text-xs font-bold bg-lime-400 text-emerald-950 hover:bg-lime-300 transition"
        >
          Basket ({totalCartCount})
        </button>
      </header>

      <main className="relative z-20 pt-36 px-6 max-w-4xl mx-auto space-y-72">
        <section className="text-center">
          <span className="px-3 py-1 rounded-full text-xs uppercase tracking-widest text-lime-300 bg-lime-400/10 border border-lime-400/30">
            Interactive 3D Living Experience
          </span>
          <h2 className="mt-6 text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-white leading-tight">
            PLANTS.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-emerald-400 to-amber-300">
              REVOLUTIONIZED.
            </span>
          </h2>
          <p className="mt-6 text-emerald-100/80 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Scroll vertically to scrub through natural light cycles in your {spaces[activeSpace].name}.
          </p>
          <div className="mt-8 inline-block animate-bounce text-lime-400 text-sm font-semibold">
            ↓ Scroll Down to Explore
          </div>
        </section>

        <section className="p-8 rounded-2xl backdrop-blur-xl bg-black/60 border border-lime-400/30">
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest block mb-2">
            Engineered For Indoor Spaces
          </span>
          <h3 className="text-3xl font-bold text-white mb-4">
            Rastlina Self-Watering Sub-Irrigation
          </h3>
          <p className="text-emerald-100/80 text-sm leading-relaxed mb-4">
            Every set arrives with a hand-acclimatized plant, self-watering sub-irrigation pot, and custom aerated potting mix—delivering up to 14 days of hydration autonomy.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-lime-300 bg-lime-400/10 px-3 py-1.5 rounded-lg border border-lime-400/20">
            <span>✓ {spaces[activeSpace].badge}</span>
            <span>•</span>
            <span>Zero Root Rot</span>
          </div>
        </section>

        <section className="p-8 rounded-2xl backdrop-blur-xl bg-black/60 border border-lime-400/30 text-center">
          <span className="text-xs font-semibold text-lime-300 uppercase tracking-widest block mb-2">
            Top 1% Indoor Cultivars
          </span>
          <h3 className="text-3xl font-bold text-white mb-6">
            Hand-Acclimatized In Hyderabad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {RASTLINA_PRODUCTS.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-lime-300 font-semibold mb-1">
                    <span>{p.category}</span>
                    <span className="bg-lime-400/20 px-2 py-0.5 rounded text-[10px]">{p.badge}</span>
                  </div>
                  <h4 className="font-bold text-base text-white">{p.name}</h4>
                  <p className="text-xs text-emerald-100/70 mt-1">{p.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <span className="text-lg font-bold text-lime-300">₹{p.price}</span>
                  <button
                    onClick={() => addToCart(p.id, p.name)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-lime-400 text-emerald-950 hover:bg-lime-300 transition"
                  >
                    + Add to Basket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-6 left-6 z-30">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-lime-400 text-emerald-950 shadow-xl hover:bg-lime-300 transition flex items-center gap-2"
        >
          <span>🏡 Select Space to Place Plant</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-[#091b10] border border-lime-400/40 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Choose Your Room &amp; Botanicals</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {(['living', 'bedroom', 'office'] as const).map((key) => (
                <div
                  key={key}
                  onClick={() => {
                    setActiveSpace(key);
                    showToast(`Active room switched to ${spaces[key].name}`);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    activeSpace === key
                      ? 'border-lime-400 bg-lime-400/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{spaces[key].name}</div>
                  <div className="text-xs text-lime-300 mt-0.5">{spaces[key].badge}</div>
                  <div className="text-xs text-emerald-100/70 mt-1">{spaces[key].desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between items-center pt-3 border-t border-white/10">
              <span className="text-xs text-emerald-200">
                Basket: <strong>{totalCartCount} items</strong>
              </span>
              <a
                href="https://www.rastlina.com/shop"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-lime-400 text-emerald-950 hover:bg-lime-300 transition"
              >
                Proceed to Rastlina Shop ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {toastText && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-lime-400 text-emerald-950 text-xs font-bold shadow-2xl animate-fade-in">
          {toastText}
        </div>
      )}
    </div>
  );
};

export default RastlinaScroll3D;
