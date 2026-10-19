// src/components/RastlinaScroll3D.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SPACES = [
  { id: 'cutaway', label: '03. Planter Cutaway', src: '/clip_5_scroll.mp4', lightColor: 0xfacc15, lightInt: 2.2 },
  { id: 'living_room', label: '🛋️ Living Room', src: '/living_room_scroll.mp4', lightColor: 0xfacc15, lightInt: 2.4 },
  { id: 'bedroom', label: '🛏️ Bedroom', src: '/bedroom_scroll.mp4', lightColor: 0xfbbf24, lightInt: 1.5 },
  { id: 'office', label: '💼 Office', src: '/office_scroll.mp4', lightColor: 0xe0f2fe, lightInt: 2.3 }
];

export default function RastlinaScroll3D({ onAddToCart }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [activeSpace, setActiveSpace] = useState('cutaway');
  const [scrollPct, setScrollPct] = useState(0);

  const warmLightRef = useRef(null);
  const keyLightRef = useRef(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

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
    renderer.setClearColor(0x051309, 0.28);

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

    // Ambient spore particles
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

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollPct(Math.round(p * 100));
        if (videoRef.current && videoRef.current.duration) {
          videoRef.current.currentTime = (p * 3.5) % videoRef.current.duration;
        }
        camera.position.y = -p * 76;
      }
    });

    let animationFrameId;
    const render = (time) => {
      particles.rotation.y = time * 0.00004;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render(0);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      trigger.kill();
      renderer.dispose();
    };
  }, []);

  const handleSpaceChange = (spaceId) => {
    setActiveSpace(spaceId);
    const space = SPACES.find(s => s.id === spaceId);
    if (space && videoRef.current) {
      videoRef.current.src = space.src;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
    if (space && warmLightRef.current && keyLightRef.current) {
      warmLightRef.current.color.setHex(space.lightColor);
      keyLightRef.current.intensity = space.lightInt;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-[500vh] bg-[#051309] text-white">
      <video
        ref={videoRef}
        src={SPACES.find(s => s.id === activeSpace)?.src}
        className="fixed inset-0 w-screen h-screen object-cover z-0 opacity-80 pointer-events-none transition-opacity duration-300"
        muted
        playsInline
        preload="auto"
      />
      <canvas ref={canvasRef} className="fixed inset-0 w-screen h-screen z-10 pointer-events-none" />

      {/* Floating Active Space Dock */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-lime-400/30 rounded-full px-4 py-1.5 shadow-xl">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Space:</span>
        {SPACES.map(s => (
          <button
            key={s.id}
            onClick={() => handleSpaceChange(s.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              activeSpace === s.id
                ? 'bg-lime-400 text-emerald-950 shadow-md'
                : 'text-emerald-100/70 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 font-mono text-xs text-lime-300 pointer-events-none">
        {scrollPct.toString().padStart(2, '0')}%
      </div>
    </div>
  );
}
