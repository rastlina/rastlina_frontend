// src/components/watch-and-shop/WatchAndShopVideo.tsx
// Muted, looping video with standard playback controls hidden.

import { useRef, useEffect, useState, memo } from 'react';

// ── YouTube Embed Formatting Helpers ───────────────────────────────────────────

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim(), 'https://www.youtube.com');
    const host = parsed.hostname.toLowerCase();
    return host === 'youtu.be' || host === 'youtube.com' ||
      host.endsWith('.youtube.com') || host === 'youtube-nocookie.com' ||
      host.endsWith('.youtube-nocookie.com');
  } catch {
    return false;
  }
}

function toYouTubeEmbed(url: string, autoplay: boolean): string {
  const parsed = new URL(url.trim(), 'https://www.youtube.com');
  const segments = parsed.pathname.split('/').filter(Boolean);
  const host = parsed.hostname.toLowerCase();
  const videoId = host === 'youtu.be'
    ? segments[0]
    : parsed.searchParams.get('v') ||
      (['embed', 'shorts', 'live', 'v'].includes(segments[0]) ? segments[1] : '');

  // Do not embed a regular YouTube page when the video ID cannot be read.
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return '';

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: '0',
    disablekb: '1',
    fs: '0',
    rel: '0',
    playsinline: '1',
    iv_load_policy: '3',
    enablejsapi: '1',
    ...(typeof window !== 'undefined' ? { origin: window.location.origin } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

interface YouTubePlayer {
  mute(): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}
interface YouTubePlayerEvent { target: YouTubePlayer; data: number; }
interface YouTubeAPI {
  Player: new (element: HTMLElement, options: {
    events: {
      onReady(event: YouTubePlayerEvent): void;
      onStateChange(event: YouTubePlayerEvent): void;
      onError(event: YouTubePlayerEvent): void;
    };
  }) => YouTubePlayer;
}
type YouTubeWindow = Window & {
  YT?: YouTubeAPI;
  onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YouTubeAPI> | null = null;

// Share the API script, but create an independent player for every card.
function loadYouTubeAPI(): Promise<YouTubeAPI> {
  const ytWindow = window as YouTubeWindow;
  if (ytWindow.YT?.Player) return Promise.resolve(ytWindow.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
    const previousReady = ytWindow.onYouTubeIframeAPIReady;
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    const cleanup = () => {
      window.clearTimeout(timeout);
      script?.removeEventListener('error', fail);
    };
    const fail = () => {
      cleanup();
      reject(new Error('YouTube player could not load'));
    };
    const timeout = window.setTimeout(fail, 20000);
    ytWindow.onYouTubeIframeAPIReady = () => {
      cleanup();
      if (ytWindow.YT?.Player) resolve(ytWindow.YT);
      else reject(new Error('YouTube player is unavailable'));
      previousReady?.();
    };
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.addEventListener('error', fail, { once: true });
      document.head.appendChild(script);
    } else {
      script.addEventListener('error', fail, { once: true });
    }
  }).catch(error => {
    apiPromise = null;
    throw error;
  });
  return apiPromise;
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
  const youtubeHostRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const youtubeReadyRef = useRef(false);
  const playbackRef = useRef({ visible: false, autoplay });
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

  // Resume/pause without removing the iframe or affecting other cards.
  useEffect(() => {
    playbackRef.current = { visible: isIntersecting, autoplay };
    const player = youtubePlayerRef.current;
    if (!player || !youtubeReadyRef.current) return;
    if (isIntersecting && autoplay) {
      player.mute();
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isIntersecting, autoplay]);

  useEffect(() => {
    const host = youtubeHostRef.current;
    if (!isYT || !shouldLoad || !embedUrl || !host) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;
    setIsLoaded(false);
    setHasError(false);
    youtubeReadyRef.current = false;

    loadYouTubeAPI().then(api => {
      if (cancelled) return;
      // The API owns this child; React owns the surrounding host.
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.title = productName || 'Watch & Shop video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.setAttribute('frameborder', '0');
      iframe.tabIndex = -1;
      iframe.className = 'w-full h-full pointer-events-none';
      host.replaceChildren(iframe);
      player = new api.Player(iframe, {
        events: {
          onReady: event => {
            if (cancelled) return;
            youtubePlayerRef.current = event.target;
            youtubeReadyRef.current = true;
            event.target.mute();
            if (playbackRef.current.visible && playbackRef.current.autoplay) {
              event.target.playVideo();
            }
          },
          onStateChange: event => {
            if (cancelled) return;
            // Keep the thumbnail until actual playback starts.
            if (event.data === 1) setIsLoaded(true);
            // Backup for the normal loop/playlist parameters.
            if (event.data === 0 && playbackRef.current.visible &&
                playbackRef.current.autoplay) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
          onError: () => {
            if (!cancelled) setHasError(true);
          },
        },
      });
      youtubePlayerRef.current = player;
    }).catch(() => {
      if (!cancelled) setHasError(true);
    });

    return () => {
      cancelled = true;
      youtubeReadyRef.current = false;
      youtubePlayerRef.current = null;
      player?.destroy();
      host.replaceChildren();
    };
  }, [isYT, shouldLoad, embedUrl, productName]);

  // Each visible card plays independently; one card must not pause the others.
  useEffect(() => {
    if (isYT) return;
    const video = videoRef.current;
    if (!video) return;
    if (shouldLoad && isIntersecting && autoplay) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    return () => video.pause();
  }, [autoplay, isIntersecting, isYT, shouldLoad, videoUrl]);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [videoUrl]);


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
        <div
          ref={youtubeHostRef}
          className="absolute inset-0 w-full h-full"
        />
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
          preload="none"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* 5. ERROR DIAGNOSTIC FRAME DISPLAY */}
      {(hasError || (isYT && !embedUrl)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-40">
          <p className="text-zinc-500 text-[10px] tracking-widest uppercase font-mono">Asset Inaccessible</p>
        </div>
      )}
    </div>
  );
});

WatchAndShopVideo.displayName = 'WatchAndShopVideo';

