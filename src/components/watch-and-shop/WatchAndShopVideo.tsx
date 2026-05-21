// src/components/watch-and-shop/WatchAndShopVideo.tsx
// Smart video player optimized for a clean, luxury e-commerce experience.
// Automatically crops out YouTube title headers, timeline scrubbers, and playback controls.

import { useRef, useEffect, useState, memo } from 'react';

// ── Module-level registry so only one native video asset plays at a time ──
const activeVideos = new Set<HTMLVideoElement>();

function pauseOthers(except: HTMLVideoElement) {
  activeVideos.forEach(v => {
    if (v !== except && !v.paused) v.pause();
  });
}

// ── YouTube Embed Formatting Helpers ───────────────────────────────────────────

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|youtube-nocookie\.com/.test(url);
}

/**
 * Extracts the 11-character video ID and appends strict parameter flags
 * to disable native interfaces before rendering the iframe framework.
 */
function toYouTubeEmbed(url: string): string {
  let videoId = '';

  if (url.includes('embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0];
  } else if (url.includes('shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0];
  } else if (url.includes('v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else {
    const match = url.match(/youtu\.be\/([^?&]+)/);
    if (match) videoId = match[1];
  }

  if (!videoId || videoId.length !== 11) return url;

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,     // Mandatory reference token to enable repeating loops
    controls: '0',         // Hides playbars, timeline sliders, and volume handles
    modestbranding: '1',   // Minimizes prominent corporate logo placement passes
    rel: '0',              // Prevents end-of-clip recommendation window popups
    playsinline: '1',      // Disables system video fullscreen takeovers on smartphones
    showinfo: '0',         // Legacy parameter protection fallback against top title bars
    iv_load_policy: '3',   // Blocks interactive subscription popups and annotation overlays
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

interface WatchAndShopVideoProps {
  videoUrl: string;
  thumbnail?: string;
  productName?: string;
  mode?: 'card' | 'detail';
  autoplay?: boolean;
}

export const WatchAndShopVideo = memo(({
  videoUrl,
  thumbnail,
  productName,
  mode = 'card',
  autoplay = true,
}: WatchAndShopVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  // Controls overlay visibility state toggle logic
  const [showControls, setShowControls] = useState(false);

  const isYT = isYouTubeUrl(videoUrl);
  const embedUrl = isYT ? toYouTubeEmbed(videoUrl) : videoUrl;

  // ── Intersection Observer to trigger viewport runtime playback transitions ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Native HTML5 standard streaming lifecycle (.mp4 local asset fallback) ──
  useEffect(() => {
    if (isYT) return;
    const video = videoRef.current;
    if (!video) return;

    if (isIntersecting && autoplay) {
  activeVideos.add(video);
  pauseOthers(video);
  video.play().catch(() => {});
} else {
  video.pause();
  activeVideos.delete(video);
}

    return () => {
      activeVideos.delete(video);
    };
  }, [isIntersecting, isYT]);

  // Dynamic user gesture handlers
  const handleInteraction = () => {
    setShowControls(prev => !prev);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleInteraction}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={[
        'relative w-full overflow-hidden bg-black select-none group cursor-pointer',
        mode === 'detail'
          ? 'rounded-2xl aspect-[9/16] md:aspect-[3/4] lg:aspect-[4/5] max-h-[75vh] w-full max-w-[450px] mx-auto shadow-2xl'
          : 'rounded-2xl aspect-[9/16] w-full',
      ].join(' ')}
    >
      {/* 1. SEAMLESS REEL COVER IMAGE PLACEHOLDER */}
      {thumbnail && !isLoaded && (
        <img
          src={thumbnail}
          alt={productName || 'Premium item visualization'}
          className="absolute inset-0 w-full h-full object-cover z-30 transition-opacity duration-500 ease-out pointer-events-none"
        />
      )}

      {/* 2. THREE-STAGE LUXURY OVERSCAN BRANDING OVERLAY MASK */}
      {isYT ? (
        <div 
          className={[
            "absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-700",
            // The magic crop formulas:
            // 1. We stretch the height to 135% to convert horizontal view lines into clean vertical ratios.
            // 2. We use scale-[1.35] to safely crop top-banner metadata and bottom media controls beyond the visible bounds.
            "aspect-[9/16] h-[135%] scale-[1.35]",
            isLoaded ? "opacity-100" : "opacity-0"
          ].join(' ')}
        >
          <iframe
            src={isIntersecting ? embedUrl : ''}
            title={productName || 'Luxury Brand Feed'}
            allow="autoplay; encrypted-media; picture-in-picture"
            frameBorder="0"
            onLoad={() => setIsLoaded(true)}
            className="w-full h-full object-cover pointer-events-none"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      ) : (
        /* 3. HARDWARE-ACCELERATED STANDALONE MP4 PIPELINE */
        <video
          ref={videoRef}
          src={embedUrl}
          muted
          loop
          autoPlay={autoplay}
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* 4. INVISIBLE GESTURE GLASS PROTECTION SHIELD
          Sits directly on top of the iframe to intercept context switches when controls are hidden.
      */}
      {isYT && isLoaded && !showControls && (
        <div className="absolute inset-0 w-full h-full z-20 bg-transparent" />
      )}

      {/* 5. ERROR DIAGNOSTIC FRAME DISPLAY */}
      {hasError && !isYT && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-40">
          <p className="text-zinc-500 text-[10px] tracking-widest uppercase font-mono">Asset Inaccessible</p>
        </div>
      )}
    </div>
  );
});

WatchAndShopVideo.displayName = 'WatchAndShopVideo';