// src/components/watch-and-shop/WatchAndShopVideo.tsx
// Smart video player used on both the homepage card and the detail page.
//
// Supports:
//   • YouTube URLs  → renders an <iframe> embed
//   • Direct video URLs (.mp4, .webm, etc.) → renders <video> with IntersectionObserver
//
// IntersectionObserver handles:
//   • Autoplay when entering viewport
//   • Pause when leaving viewport
//   • Only ONE video playing at a time (via a module-level Set)
//
// Usage on detail page:  <WatchAndShopVideo videoUrl={...} thumbnail={...} mode="detail" />
// Usage on card:         <WatchAndShopVideo videoUrl={...} thumbnail={...} mode="card" />

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

// ── Module-level registry so only one <video> plays at a time ─────────────────
const activeVideos = new Set<HTMLVideoElement>();

function pauseOthers(except: HTMLVideoElement) {
  activeVideos.forEach(v => {
    if (v !== except && !v.paused) v.pause();
  });
}

// ── YouTube helpers ───────────────────────────────────────────────────────────

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

/** Convert any YouTube URL to the nocookie embed with autoplay + mute */
function toYouTubeEmbed(url: string, autoplay: boolean): string {
  let videoId = '';

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) videoId = shortMatch[1];

  // youtube.com/watch?v=VIDEO_ID
  const longMatch = url.match(/[?&]v=([^?&]+)/);
  if (longMatch) videoId = longMatch[1];

  // youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/embed\/([^?&]+)/);
  if (embedMatch) videoId = embedMatch[1];

  if (!videoId) return url; // fallback — return original

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    loop: '1',
    playlist: videoId,       // required for loop to work
    controls: '1',
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface WatchAndShopVideoProps {
  videoUrl: string;
  thumbnail?: string;
  productName?: string;
  /** "card" = compact homepage card | "detail" = full-width detail page player */
  mode?: 'card' | 'detail';
  /** Whether to start playing immediately (for detail page, card uses IntersectionObserver) */
  autoplay?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const WatchAndShopVideo = memo(({
  videoUrl,
  thumbnail,
  productName,
  mode = 'card',
  autoplay = false,
}: WatchAndShopVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isYT = isYouTubeUrl(videoUrl);

  // ── Native video: IntersectionObserver ──────────────────────────────────────
  useEffect(() => {
    if (isYT) return; // YouTube iframe handles its own autoplay
    const video = videoRef.current;
    if (!video) return;

    activeVideos.add(video);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            pauseOthers(video);
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: mode === 'detail' ? 0.3 : 0.6 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      activeVideos.delete(video);
    };
  }, [isYT, mode]);

  // ── Register + cleanup native video ─────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYT) return;
    return () => { activeVideos.delete(video); };
  }, [isYT]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      pauseOthers(video);
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // ── YouTube iframe ────────────────────────────────────────────────────────
  if (isYT) {
    const embedUrl = toYouTubeEmbed(videoUrl, mode === 'detail' || autoplay);
    return (
      <div
        ref={containerRef}
        className={[
          'relative w-full overflow-hidden bg-black',
          mode === 'detail'
            ? 'rounded-2xl aspect-video lg:aspect-[4/5]'
            : 'rounded-2xl aspect-[9/16]',
        ].join(' ')}
      >
        {/* Thumbnail shown until iframe loads */}
        {thumbnail && !isLoaded && (
          <img
            src={thumbnail}
            alt={productName || 'Video thumbnail'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <iframe
          src={embedUrl}
          title={productName || 'Watch & Shop Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
        />
      </div>
    );
  }

  // ── Native <video> ─────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={[
        'relative group overflow-hidden bg-black',
        mode === 'detail'
          ? 'rounded-2xl aspect-video lg:aspect-[4/5] w-full'
          : 'rounded-2xl aspect-[9/16] w-full cursor-pointer',
      ].join(' ')}
      onClick={mode === 'card' ? togglePlay : undefined}
    >
      {/* Thumbnail fallback */}
      {thumbnail && (
        <img
          src={thumbnail}
          alt={productName || 'Video thumbnail'}
          className={[
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100',
          ].join(' ')}
        />
      )}

      {/* Native video */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        onCanPlay={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <p className="text-white/60 text-sm font-medium">Video unavailable</p>
        </div>
      )}

      {/* Card controls overlay */}
      {mode === 'card' && (
        <>
          {/* Play button — shown when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="h-6 w-6 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}

          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted
              ? <VolumeX className="h-3.5 w-3.5 text-white" />
              : <Volume2 className="h-3.5 w-3.5 text-white" />
            }
          </button>
        </>
      )}

      {/* Detail page controls */}
      {mode === 'detail' && isLoaded && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/70 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <span className="flex gap-0.5"><span className="w-1 h-3.5 bg-white rounded-sm"/><span className="w-1 h-3.5 bg-white rounded-sm"/></span>
              : <Play className="h-4 w-4 text-white fill-white ml-0.5" />
            }
          </button>
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-black/70 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted
              ? <VolumeX className="h-4 w-4 text-white" />
              : <Volume2 className="h-4 w-4 text-white" />
            }
          </button>
        </div>
      )}
    </div>
  );
});

WatchAndShopVideo.displayName = 'WatchAndShopVideo';