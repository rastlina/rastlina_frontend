import React, { useEffect, useRef, useState } from 'react';

// Live Rastlina product data matching www.rastlina.com
const RASTLINA_PRODUCTS = [
  {
    id: 'philo-red',
    name: 'Philodendron Oxycardium Red',
    category: 'Philodendron • Bestseller',
    price: 329,
    mrp: 599,
    badge: '45% OFF',
    desc: 'Heart-shaped bronze-red new leaves in a Rastlina self-watering planter.'
  },
  {
    id: 'calathea-makoyana',
    name: 'Calathea Makoyana (Peacock Plant)',
    category: 'Calathea • Fresh Arrival',
    price: 499,
    mrp: 699,
    badge: '29% OFF',
    desc: 'Intricate feathered leaf venation that folds prayer-like at night.'
  },
  {
    id: 'combo-trio',
    name: 'Sleeping Pothos + Cryptanthus + Silver Sword (Set of 3)',
    category: 'Combos of 3 • Bestseller',
    price: 649,
    mrp: 1199,
    badge: '46% OFF',
    desc: 'Curated trio with self-watering pots and custom aerated potting mix.'
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

const CHAPTER_NAMES = [
  '01 • PLANTS REVOLUTIONIZED',
  '02 • GENETIC CONSTELLATION',
  '03 • SELF-WATERING GROWTH',
  '04 • NURSERY TEST MATRIX',
  '05 • TOP 1% SELECTION',
  '06 • INFINITE NATURE LOOP'
];

export default function RastlinaScroll3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cartItems, setCartItems] = useState([
    { id: 'philo-red', qty: 1 },
    { id: 'calathea-makoyana', qty: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [lightMode, setLightMode] = useState<'morning' | 'indoor' | 'night'>('morning');
  const [gridFilter, setGridFilter] = useState<'all' | 'air' | 'exotic'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (productId: string) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing) {
        return prev.map(i => i.id === productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: productId, qty: 1 }];
    });
    const p = RASTLINA_PRODUCTS.find(x => x.id === productId);
    showToast(`Added ${p?.name || 'plant'} to your basket!`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(i => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter(i => i.qty > 0);
    });
  };

  const scrollToChapter = (ratio: number) => {
    setIsAutoScrolling(false);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll * ratio, behavior: 'smooth' });
  };

  // Scroll handler & Video Scrubbing
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const currentScroll = window.scrollY;
      const progress = Math.min(1, Math.max(0, currentScroll / maxScroll));
      setScrollProgress(progress);

      const chap = Math.min(5, Math.floor(progress * 6));
      setActiveChapter(chap);

      // Scrub the background video smoothly in sync with scroll
      if (videoRef.current && videoRef.current.duration) {
        videoRef.current.currentTime = progress * videoRef.current.duration;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll loop
  useEffect(() => {
    if (!isAutoScrolling) return;
    let animId: number;
    const step = () => {
      window.scrollBy(0, 3.5);
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isAutoScrolling]);

  // High-performance GPU Canvas 3D Graphics Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let mouseX = 0;
    let mouseY = 0;

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width) * 2 - 1;
      mouseY = (e.clientY / height) * 2 - 1;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    const nodeCount = 38;
    const nodes = Array.from({ length: nodeCount }).map(() => ({
      x: (Math.random() - 0.5) * width * 0.75,
      y: (Math.random() - 0.5) * height * 0.75,
      radius: Math.random() * 2.8 + 1.8,
      phase: Math.random() * Math.PI * 2
    }));

    const sporeCount = 140;
    const spores = Array.from({ length: sporeCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.45 + 0.15,
      opacity: Math.random() * 0.7 + 0.3
    }));

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

      // 1. Draw glowing ambient spores
      for (const s of spores) {
        s.y -= s.speedY;
        if (s.y < 0) s.y = height;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(163, 230, 53, ${s.opacity * 0.6})`;
        ctx.shadowColor = '#a3e635';
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      // 2. 3D Constellation Network (Chapter 02)
      const constellationAlpha = Math.max(0, 1 - Math.abs(progress - 0.25) * 4);
      if (constellationAlpha > 0.05) {
        ctx.save();
        ctx.translate(width / 2 + mouseX * 25, height / 2 + mouseY * 25);
        ctx.shadowColor = '#bef264';
        ctx.shadowBlur = 12;

        ctx.strokeStyle = `rgba(132, 204, 22, ${constellationAlpha * 0.4})`;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }

        for (const n of nodes) {
          const pulse = Math.sin(t * 2 + n.phase) * 1.2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(190, 242, 100, ${constellationAlpha * 0.95})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. Central 3D Golden Core Specimen with peeling husk leaves
      const coreAlpha = Math.max(0, 1 - progress * 3.5);
      if (coreAlpha > 0.05) {
        ctx.save();
        ctx.translate(width / 2 + mouseX * 20, height / 2 + mouseY * 15);
        const rotY = t * 0.4 + mouseX * 0.4;

        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 130);
        grad.addColorStop(0, `rgba(253, 224, 71, ${coreAlpha * 0.9})`);
        grad.addColorStop(0.35, `rgba(234, 179, 8, ${coreAlpha * 0.75})`);
        grad.addColorStop(0.7, `rgba(163, 230, 53, ${coreAlpha * 0.35})`);
        grad.addColorStop(1, 'rgba(5, 19, 9, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 130, 0, Math.PI * 2);
        ctx.fill();

        const huskCount = 12;
        const peel = Math.min(1, progress * 4.5);
        ctx.shadowColor = '#a3e635';
        ctx.shadowBlur = 15;

        for (let i = 0; i < huskCount; i++) {
          const angle = (i / huskCount) * Math.PI * 2 + rotY;
          const leafX = Math.cos(angle) * (45 + peel * 70);
          const leafY = Math.sin(angle) * (20 + peel * 40);
          const leafLen = 95 + (i % 2) * 25;

          ctx.save();
          ctx.translate(leafX, leafY);
          ctx.rotate(angle + Math.PI / 2 + peel * 0.4);

          ctx.beginPath();
          ctx.ellipse(0, -leafLen / 2, 14, leafLen / 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? `rgba(22, 163, 74, ${coreAlpha * 0.85})` : `rgba(101, 163, 13, ${coreAlpha * 0.85})`;
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const cartTotal = cartItems.reduce((acc, i) => {
    const p = RASTLINA_PRODUCTS.find(prod => prod.id === i.id);
    return acc + (p ? p.price * i.qty : 0);
  }, 0);

  return (
    <div className="relative bg-[#051309] text-[#f8fafc] font-sans overflow-x-hidden select-none">
      {/* 1. SCROLL-SCRUBBED BOTANICAL VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        className="fixed inset-0 w-screen h-screen object-cover opacity-60 pointer-events-none z-0 filter brightness-90 contrast-110"
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        muted
        playsInline
        preload="auto"
      />

      {/* 2. 3D HARDWARE-ACCELERATED CANVAS PARTICLES & BOTANICALS */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />

      {/* 3. ATMOSPHERIC VIGNETTE OVERLAY */}
      <div
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 35%, rgba(2, 12, 6, 0.78) 100%)'
        }}
      />

      {/* 4. TOP FIXED NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[rgba(6,24,14,0.72)] backdrop-blur-md border-b border-lime-400/25">
        <button onClick={() => scrollToChapter(0)} className="flex items-center gap-2.5 text-left group focus:outline-none">
          <div className="w-9 h-9 rounded-full bg-lime-400/15 border border-lime-400/50 flex items-center justify-center text-lime-300 font-bold text-lg group-hover:scale-105 transition">
            🌿
          </div>
          <div>
            <span className="font-bold text-lg sm:text-xl tracking-wider text-white block leading-none font-mono">RASTLINA</span>
            <span className="text-[10px] uppercase tracking-widest text-lime-300/80 block">Nature Hub • Hyderabad</span>
          </div>
        </button>

        {/* Chapter Jump Pills */}
        <nav className="hidden lg:flex items-center gap-1 bg-black/40 border border-lime-400/20 rounded-full px-2 py-1">
          {['01. Hero', '02. Genetics', '03. Self-Watering', '04. Nursery Grid', '05. Top 1%', '06. Loop'].map((title, idx) => (
            <button
              key={idx}
              onClick={() => scrollToChapter(idx * 0.2)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                activeChapter === idx
                  ? 'text-lime-200 bg-lime-400/25 border border-lime-400/40 shadow-sm shadow-lime-400/30'
                  : 'text-emerald-100/70 hover:text-white'
              }`}
            >
              {title}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-lime-400/15 hover:bg-lime-400/30 text-lime-200 border border-lime-400/40 transition flex items-center gap-1.5"
          >
            <span>{isAutoScrolling ? '⏸ Pause' : '▶ Auto-Scroll'}</span>
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-1.5 rounded-full text-xs font-semibold bg-lime-400 text-emerald-950 hover:bg-lime-300 transition flex items-center gap-1.5"
          >
            <span>Shop</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-lime-300 text-[11px] font-bold">
              {cartItems.reduce((sum, i) => sum + i.qty, 0)}
            </span>
          </button>
        </div>
      </header>

      {/* 5. VERTICAL SCROLL HUD PROGRESS BAR */}
      <div className="fixed right-4 sm:right-7 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-mono text-xs text-lime-300 tracking-widest">
          {String(Math.round(scrollProgress * 100)).padStart(2, '0')}%
        </span>
        <div className="w-1.5 h-44 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="w-full bg-gradient-to-b from-lime-300 to-emerald-400 rounded-full transition-all duration-75"
            style={{ height: `${Math.max(4, scrollProgress * 100)}%` }}
          />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-emerald-200/70 [writing-mode:vertical-rl] rotate-180 mt-2 font-mono">
          {CHAPTER_NAMES[activeChapter]}
        </span>
      </div>

      {/* 6. MAIN SCROLLABLE CHAPTER CONTENT */}
      <main className="relative z-10">
        {/* CHAPTER 1: HERO */}
        <section className="min-h-[120vh] w-full flex items-center justify-center text-center px-4 pt-32 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs uppercase tracking-widest mb-6">
              <span>Rastlina Interactive 3D Experience</span>
              <span>•</span>
              <span>Scroll to Explore Living Botanicals</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-white to-emerald-300 drop-shadow-[0_0_35px_rgba(163,230,53,0.35)]">
              PLANTS. REVOLUTIONIZED.
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-emerald-100/85 font-light leading-relaxed">
              Rooted in confidence, growing with you. Scroll through the living science behind every handpicked indoor plant, self-watering planter, and custom soil mix crafted in Hyderabad.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => scrollToChapter(0.2)}
                className="px-6 py-3 rounded-full bg-lime-400 text-emerald-950 font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-lime-300 transition shadow-lg shadow-lime-400/20"
              >
                Begin The Scroll Journey ↓
              </button>
              <button
                onClick={() => scrollToChapter(0.8)}
                className="px-6 py-3 rounded-full bg-[rgba(6,24,14,0.62)] backdrop-blur-md border border-lime-400/30 text-lime-200 font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-white/10 transition"
              >
                Explore Bestsellers (₹299+)
              </button>
            </div>
          </div>
        </section>

        {/* CHAPTER 2: CELLULAR FOUNDATION & CONSTELLATION */}
        <section className="min-h-screen w-full flex items-center justify-start px-4 sm:px-12 py-24">
          <div className="max-w-xl bg-[rgba(6,24,14,0.68)] backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-lime-400/25 shadow-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-300 block mb-2 font-mono">
              Chapter 02 • Soil Microbiome & Cellular Genetics
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase mb-4 text-white">
              FIRST, A SOLID FOUNDATION.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-6">
              Just like the glowing cellular constellation network, our cultivation starts at the microscopic level. We map aeration, cocopeat moisture retention, perlite drainage, and organic bio-nutrients across 40+ indoor species—from <strong className="text-lime-300">Calathea Roseopicta</strong> to <strong className="text-lime-300">Philodendron Oxycardium Red</strong>.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-lime-400/20 text-center">
              <div>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-lime-300 block">18+</span>
                <span className="text-[11px] text-emerald-200/75 uppercase">Soil Bio-Nodes</span>
              </div>
              <div>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-300 block">3.2x</span>
                <span className="text-[11px] text-emerald-200/75 uppercase">Oxygenation</span>
              </div>
              <div>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald-300 block">100%</span>
                <span className="text-[11px] text-emerald-200/75 uppercase">Pest-Free Media</span>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 3: SELF-WATERING PLANTER ENGINEERING */}
        <section className="min-h-screen w-full flex items-center justify-end px-4 sm:px-12 py-24">
          <div className="max-w-xl bg-[rgba(6,24,14,0.68)] backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-lime-400/25 shadow-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-lime-300 block mb-2 font-mono">
              Chapter 03 • Self-Watering Planter Engineering
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase mb-4 text-white">
              WE TAKE IT TO YOUR SPACE.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-5">
              Roots extend downward into the <strong className="text-lime-300">Rastlina Sub-Irrigation Reservoir</strong> while foliage unfurls upward into natural ambient room lighting. Test our interactive room-light simulator below:
            </p>

            {/* Room Light Simulator */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-emerald-200/80 mr-1">Simulate Room Light:</span>
              <button
                onClick={() => { setLightMode('morning'); showToast('☀️ Simulated Morning Balcony Sunlight'); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  lightMode === 'morning' ? 'bg-amber-400 text-emerald-950 font-bold' : 'bg-white/10 text-emerald-100'
                }`}
              >
                Morning Sun
              </button>
              <button
                onClick={() => { setLightMode('indoor'); showToast('🛋️ Simulated Living Room Indirect Light'); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  lightMode === 'indoor' ? 'bg-lime-400 text-emerald-950 font-bold' : 'bg-white/10 text-emerald-100'
                }`}
              >
                Living Room
              </button>
              <button
                onClick={() => { setLightMode('night'); showToast('🌙 Simulated Evening Ambient Glow'); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  lightMode === 'night' ? 'bg-sky-400 text-emerald-950 font-bold' : 'bg-white/10 text-emerald-100'
                }`}
              >
                Evening Glow
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-lime-400/25 flex items-center justify-between text-xs">
              <span>💧 Sub-Irrigation Autonomy: <strong>Up to 10–14 Days</strong></span>
              <span className="text-lime-300 font-bold">Zero Root Rot</span>
            </div>
          </div>
        </section>

        {/* CHAPTER 4: ACCLIMATIZATION NURSERY MATRIX */}
        <section className="min-h-screen w-full flex items-center justify-start px-4 sm:px-12 py-24">
          <div className="max-w-xl bg-[rgba(6,24,14,0.68)] backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-lime-400/25 shadow-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-lime-300 block mb-2 font-mono">
              Chapter 04 • Acclimatization Testing Matrix
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase mb-4 text-white">
              TESTING, TESTING AND MORE TESTING.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-5">
              Before any plant is delivered to a home, thousands of nursery specimens undergo multi-week indoor humidity, low-light stress, and leaf-vitality checks at our Hyderabad greenhouse hub.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setGridFilter('all'); showToast('Displaying all 400 test plots'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  gridFilter === 'all' ? 'bg-lime-400 text-emerald-950' : 'bg-white/10 text-emerald-100'
                }`}
              >
                All 400 Test Plots
              </button>
              <button
                onClick={() => { setGridFilter('air'); showToast('Filtered: Air-Purifying Plants'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  gridFilter === 'air' ? 'bg-lime-400 text-emerald-950' : 'bg-white/10 text-emerald-100'
                }`}
              >
                Air-Purifying Pass
              </button>
              <button
                onClick={() => { setGridFilter('exotic'); showToast('Filtered: Exotic Beauties Pass'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  gridFilter === 'exotic' ? 'bg-lime-400 text-emerald-950' : 'bg-white/10 text-emerald-100'
                }`}
              >
                Exotic Beauties Pass
              </button>
            </div>
          </div>
        </section>

        {/* CHAPTER 5: ONLY THE FINEST 1% MAKE IT (LIVE CATALOG) */}
        <section className="min-h-screen w-full flex items-center justify-center px-4 sm:px-8 py-24">
          <div className="max-w-6xl w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 bg-[rgba(6,24,14,0.68)] backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-lime-400/25">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-300 block mb-2 font-mono">
                  Chapter 05 • The Golden Standard
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold uppercase mb-4 text-white">
                  ONLY THE FINEST 1% MAKE IT HOME.
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed mb-5">
                  Every Rastlina set arrives ready to gift with a vibrant, healthy plant, self-watering pot, and custom nutrient-rich soil mix—backed by <strong className="text-lime-300">1,000+ Happy Homes</strong> and a <strong className="text-lime-300">4.8/5 rating</strong> across India.
                </p>
                <div className="text-xs text-emerald-200/80 space-y-2">
                  <div>✓ Handpicked from Kondapur, Hyderabad Greenhouses</div>
                  <div>✓ Protected 7-Day Transit Health Guarantee</div>
                </div>
              </div>

              {/* Live Rastlina Product Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RASTLINA_PRODUCTS.map(product => {
                  const inCart = cartItems.find(i => i.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className="bg-[rgba(6,24,14,0.68)] backdrop-blur-md p-4 rounded-xl border border-lime-400/20 hover:border-lime-400/60 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-lime-300 font-semibold">
                            {product.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 text-[10px] font-bold">
                            {product.badge}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-white leading-snug">{product.name}</h3>
                        <p className="text-xs text-emerald-100/75 mt-1 mb-3">{product.desc}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/10">
                        <div>
                          <span className="font-mono text-xl font-bold text-lime-300">₹{product.price}</span>
                          <span className="text-xs text-emerald-200/50 line-through ml-1 font-mono">₹{product.mrp}</span>
                        </div>
                        <button
                          onClick={() => addToCart(product.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            inCart
                              ? 'bg-emerald-700 text-white'
                              : 'bg-lime-400 text-emerald-950 hover:bg-lime-300'
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

        {/* CHAPTER 6: INFINITE NATURE LOOP FOOTER */}
        <section className="min-h-[90vh] w-full flex items-center justify-center text-center px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/15 border border-lime-400/30 text-lime-300 text-xs uppercase tracking-widest mb-6">
              <span>♻ Cycle of Nature • Infinite Scroll Loop</span>
            </div>

            <nav className="flex flex-col items-center space-y-4 mb-8">
              <button
                onClick={() => showToast('🌿 Code LAUNCH40 applied — Flat 40% Off!')}
                className="text-lg sm:text-2xl font-bold tracking-wider text-emerald-100 hover:text-lime-300 transition uppercase"
              >
                SIGN UP FOR GREEN OFFERS (FLAT 40% LAUNCH)
              </button>
              <button
                onClick={() => showToast('📞 Plant Stylist Desk (Hyderabad): +91 81438 14466')}
                className="text-lg sm:text-2xl font-bold tracking-wider text-emerald-100 hover:text-lime-300 transition uppercase"
              >
                CONTACT A PLANT STYLIST • HYDERABAD
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-lg sm:text-2xl font-bold tracking-wider text-emerald-100 hover:text-lime-300 transition uppercase"
              >
                EXPLORE COMBOS &amp; SELF-WATERING BUNDLES
              </button>
              <a
                href="https://www.rastlina.com"
                className="text-lg sm:text-2xl font-bold tracking-wider text-lime-300 hover:text-lime-200 transition uppercase"
              >
                VISIT RASTLINA STOREFRONT ↗
              </a>
            </nav>

            <button
              onClick={() => scrollToChapter(0)}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-lime-200 text-xs font-semibold transition"
            >
              ↑ Return to Top of Story
            </button>

            <p className="mt-8 text-[11px] text-emerald-200/60 font-mono">
              © 2026 Rastlina Nature Hub Private Limited • Lake View Towers, Kondapur, Hyderabad 500084
            </p>
          </div>
        </section>
      </main>

      {/* 7. SLIDING CART DRAWER */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[rgba(6,24,14,0.92)] backdrop-blur-xl border-l border-lime-400/30 p-6 transform transition-transform duration-300 flex flex-col justify-between ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-lime-400/20">
            <div>
              <h3 className="font-bold text-2xl text-white">Your Rastlina Basket</h3>
              <p className="text-xs text-lime-300">Flat 40–50% Launch Offers Applied</p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {cartItems.map(item => {
              const p = RASTLINA_PRODUCTS.find(prod => prod.id === item.id);
              if (!p) return null;
              return (
                <div key={item.id} className="p-3 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-white">{p.name}</div>
                    <div className="text-[11px] text-lime-300 font-mono">
                      ₹{p.price} × {item.qty} = ₹{p.price * item.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                    >
                      −
                    </button>
                    <span className="text-xs px-1 font-mono">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-lime-400/20 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-100/80">Subtotal (Self-Watering Pot &amp; Soil Mix)</span>
            <span className="font-mono text-xl font-bold text-lime-300">₹{cartTotal}</span>
          </div>
          <a
            href="https://www.rastlina.com/shop?category=exotic-beauties"
            className="block w-full text-center py-3 rounded-xl bg-lime-400 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:bg-lime-300 transition"
          >
            Proceed to Checkout on Rastlina.com ↗
          </a>
        </div>
      </div>

      {/* 8. INTERACTIVE TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-lime-400 text-emerald-950 font-bold text-xs shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
