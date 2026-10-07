// MP4-only player for Watch & Shop. Each visible card loops independently.
import { memo, useEffect, useRef, useState } from 'react';

interface WatchAndShopVideoProps {
  videoUrl: string;
  thumbnail?: string;
  productName?: string;
  mode?: 'card' | 'detail';
  autoplay?: boolean;
}

export const WatchAndShopVideo = memo(({
  videoUrl, thumbnail, productName, mode = 'card', autoplay = true,
}: WatchAndShopVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setShouldLoad(true);
    }, { threshold: 0.1 });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPlaying(false);
    setHasError(false);
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (visible && shouldLoad && autoplay) {
      video.play().catch(() => {
        // Keep the poster visible when the browser blocks autoplay.
      });
    } else {
      video.pause();
    }
    return () => video.pause();
  }, [visible, shouldLoad, autoplay, videoUrl]);

  return (
    <div
      ref={containerRef}
      className={[
        'relative w-full overflow-hidden bg-[#0F1E17] select-none',
        mode === 'detail'
          ? 'rounded-2xl aspect-[9/16] md:aspect-[3/4] lg:aspect-[4/5] max-h-[75vh] max-w-[450px] mx-auto shadow-2xl'
          : 'rounded-2xl aspect-[9/16]',
      ].join(' ')}
    >
      <video
        key={videoUrl}
        ref={videoRef}
        src={shouldLoad ? videoUrl : undefined}
        poster={thumbnail}
        controls={false}
        muted
        loop
        playsInline
        autoPlay={visible && autoplay}
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-label={productName || 'Product video'}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        onPlaying={() => {
          setPlaying(true);
          setHasError(false);
        }}
        onCanPlay={() => {
          const video = videoRef.current;
          if (video && visible && autoplay) video.play().catch(() => {});
        }}
        onError={() => setHasError(true)}
      />
      {thumbnail && !playing && (
        <img
          src={thumbnail}
          alt={productName || 'Product video preview'}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      {hasError && (
        <div role="status" className="absolute bottom-24 left-3 right-3 rounded bg-black/60 p-2 text-center text-xs text-white pointer-events-none">
          Video temporarily unavailable
        </div>
      )}
    </div>
  );
});

WatchAndShopVideo.displayName = 'WatchAndShopVideo';

