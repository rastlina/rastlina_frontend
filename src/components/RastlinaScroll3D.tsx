import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SpaceConfig {
  id: string;
  badge: string;
  name: string;
  tagline: string;
  videoSrc: string;
  lightColor: number;
  lightIntensity: number;
}

const SPACES: SpaceConfig[] = [
  {
    id: 'living_room',
    badge: '01',
    name: 'Living Room',
    tagline: 'A warm welcome.',
    videoSrc: '/living_room_scroll.mp4',
    lightColor: 0xfacc15,
    lightIntensity: 2.4
  },
  {
    id: 'bedroom',
    badge: '02',
    name: 'Bedroom',
    tagline: 'A quiet retreat.',
    videoSrc: '/bedroom_scroll.mp4',
    lightColor: 0xfbbf24,
    lightIntensity: 1.5
  },
  {
    id: 'office',
    badge: '03',
    name: 'Office',
    tagline: 'Room to focus.',
    videoSrc: '/office_scroll.mp4',
    lightColor: 0xe0f2fe,
    lightIntensity: 2.3
  }
];

interface Props {
  onAddToCart?: (productId: string) => void;
}

export default function RastlinaScroll3D({ onAddToCart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeSpace, setActiveSpace] = useState<string>('living_room');
  const [scrollPct, setScrollPct] = useState<number>(0);
  const [showSpaceModal, setShowSpaceModal] = useState<boolean>(false);

  const warmLightRef = useRef<THREE.PointLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x051309, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x051309, 0.25);

    const ambientLight = new THREE.AmbientLight(0x1e3a29, 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xd9f99d, 2.2);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const warmLight = new THREE.PointLight(0xfacc15, 2.6, 18);
    warmLight.position.set(0, 0.5, 2);
    scene.add(warmLight);
    warmLightRef.current = warmLight;

    // Ambient floating botanical spores
    const pCount = 350;
    const pGeom = new THREE.BufferGeometry();
    const pCoords = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pCoords[i * 3] = (Math.random() - 0.5) * 24;
      pCoords[i * 3 + 1] = -Math.random() * 82 + 8;
      pCoords[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pCoords, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.35,
      color: 0xa3e635,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // 2. Mobile-safe Single-Decoder Scrubbing
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollPct(Math.round(p * 100));

        const vid = videoRef.current;
        if (vid && vid.duration && !isNaN(vid.duration)) {
          vid.currentTime = (p * 3.5) % vid.duration;
        }

        camera.position.y = -p * 76;

        if (p > 0.82 && !sessionStorage.getItem('space_modal_shown')) {
          sessionStorage.setItem('space_modal_shown', 'true');
          setShowSpaceModal(true);
        }
      }
    });

    let rafId: number;
    const render = (time: number) => {
      particles.rotation.y = time * 0.00004;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };
    render(0);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      trigger.kill();
      renderer.dispose();
    };
  }, []);

  const handleSpaceChange = (spaceId: string) => {
    setActiveSpace(spaceId);
    const space = SPACES.find((s) => s.id === spaceId);
    if (!space) return;

    if (videoRef.current) {
      videoRef.current.style.opacity = '0';
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = space.videoSrc;
          videoRef.current.load();
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
          videoRef.current.style.opacity = '0.85';
        }
      }, 200);
    }

    if (warmLightRef.current && keyLightRef.current) {
      warmLightRef.current.color.setHex(space.lightColor);
      keyLightRef.current.intensity = space.lightIntensity;
    }
  };

  const currentSpace = SPACES.find((s) => s.id === activeSpace) || SPACES[0];

  return (
    <div ref={containerRef} className="relative w-full min-h-[600vh] bg-[#051309] text-white">
      {/* Reused Single Video Decoder */}
      <video
        ref={videoRef}
        src={currentSpace.videoSrc}
        className="fixed inset-0 w-screen h-screen object-cover z-0 opacity-85 pointer-events-none transition-opacity duration-300"
        muted
        playsInline
        preload="auto"
      />

      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-screen h-screen z-10 pointer-events-none" />

      {/* Top Floating Space Dock */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-lime-400/30 rounded-full px-3.5 py-1.5 shadow-2xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mr-1 hidden sm:inline">
          Active Space:
        </span>
        {SPACES.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSpaceChange(s.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              activeSpace === s.id
                ? 'bg-lime-400 text-emerald-950 shadow-md font-bold'
                : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Floating Trigger Pill */}
      <button
        onClick={() => setShowSpaceModal(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/40 hover:border-amber-400 text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-2xl hover:scale-105 transition"
      >
        <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
        <span>🏡 Select Space to Place Plant</span>
      </button>

      {/* Scroll HUD */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 font-mono text-xs text-lime-300 pointer-events-none">
        {scrollPct.toString().padStart(2, '0')}%
      </div>

      {/* Space Selection Modal */}
      {showSpaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div
            className="relative w-full max-w-4xl rounded-3xl p-6 sm:p-10 border border-amber-400/30 shadow-[0_0_80px_rgba(10,30,16,0.9)] overflow-hidden"
            style={{ background: 'radial-gradient(circle at 50% 0%, #0d2818 0%, #051309 75%)' }}
          >
            <button
              onClick={() => setShowSpaceModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full border border-amber-400/60 text-amber-300 text-xs font-bold flex items-center justify-center font-mono">
                  06
                </span>
                <span className="text-xs uppercase tracking-widest text-amber-300/90 font-semibold">
                  A PLACE FOR YOUR PLANT
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-wide text-white">
                Your world. <br />
                <span className="italic font-serif text-amber-200 font-normal">A little greener.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {SPACES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    handleSpaceChange(s.id);
                    setShowSpaceModal(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition hover:-translate-y-1 ${
                    activeSpace === s.id
                      ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30'
                      : 'border-white/15 bg-black/40 hover:border-amber-400/60'
                  }`}
                >
                  <span className="text-xs font-mono text-amber-300 font-bold block mb-1">
                    {s.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-emerald-200/70 mt-1">{s.tagline}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs text-emerald-200/80">
              <span>Active: {currentSpace.name}</span>
              <button
                onClick={() => {
                  onAddToCart?.('philo-red');
                  setShowSpaceModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-lime-400 text-emerald-950 font-bold uppercase tracking-wider hover:bg-lime-300 transition"
              >
                Add Plant For {currentSpace.name} (₹329)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
