// src/components/watch-and-shop/WatchAndShopVideo.tsx
// Muted, looping video with standard playback controls hidden.

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
function toYouTubeEmbed(url: string, autoplay: boolean): string {
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
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    loop: '1',
    playlist: videoId,     // Mandatory reference token to enable repeating loops
    controls: '0',         // Hides playbars, timeline sliders, and volume handles
    disablekb: '1',        // Disables YouTube keyboard playback shortcuts
    fs: '0',               // Hides the fullscreen control
    rel: '0',              // Limits related videos to the same channel
    playsinline: '1',      // Disables system video fullscreen takeovers on smartphones
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
  const [shouldLoad, setShouldLoad] = useState(false);
  

  const isYT = isYouTubeUrl(videoUrl);
  const embedUrl = isYT ? toYouTubeEmbed(videoUrl, autoplay) : videoUrl;
  const cover = thumbnail?.startsWith('https://api.rastlina.com/media/watch_shop/')
    ? `/optimized/watch-${thumbnail.split('/').pop()?.split('?')[0].replace(/\.[^.]+$/, '')}.webp`
    : thumbnail;

  // ── Intersection Observer to trigger viewport runtime playback transitions ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) setShouldLoad(true);
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
  }, [autoplay, isIntersecting, isYT]);


  return (
    <div
      ref={containerRef}
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
          src={cover}
          loading="lazy"
          decoding="async"
          width={600}
          height={1067}
          onError={(event) => {
            if (thumbnail && event.currentTarget.getAttribute('src') !== thumbnail) event.currentTarget.src = thumbnail;
          }}
          alt={productName || 'Premium item visualization'}
          className="absolute inset-0 w-full h-full object-cover z-30 transition-opacity duration-500 ease-out pointer-events-none"
        />
      )}

      {/* YouTube uses supported parameters for looping and hidden controls. */}
      {isYT ? (
        isIntersecting && (
          <iframe
            src={embedUrl}
            title={productName || 'Watch & Shop video'}
            allow="autoplay; encrypted-media; picture-in-picture"
            frameBorder="0"
            onLoad={() => setIsLoaded(true)}
            className="absolute inset-0 w-full h-full pointer-events-none"
            tabIndex={-1}
          />
        )
      ) : (
        /* 3. HARDWARE-ACCELERATED STANDALONE MP4 PIPELINE */
        <video
          ref={videoRef}
          src={shouldLoad ? embedUrl : undefined}
          controls={false}
          muted
          loop
          autoPlay={autoplay && isIntersecting}
          playsInline
          webkit-playsinline="true"
          preload="none"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
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
