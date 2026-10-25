import { memo, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import optimizedCovers from 'virtual:rastlina-watch-covers';

interface WatchAndShopVideoProps {
  videoUrl: string;
  thumbnail?: string;
  productName?: string;
  mode?: 'card' | 'detail';
  autoplay?: boolean;
  onRequestPlay?: () => void;
}
export const WatchAndShopVideo = memo(({
  videoUrl, thumbnail, productName, mode = 'card', autoplay = true, onRequestPlay,
}: WatchAndShopVideoProps) => {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [hasError, setHasError] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const cover = thumbnail && !coverFailed ? optimizedCovers[thumbnail] || thumbnail : thumbnail;
  useEffect(() => setCoverFailed(false), [thumbnail]);

  useEffect(() => {
    if (!container.current) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .35 });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const change = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  useEffect(() => { setPlaying(false); setHasFrame(false); setHasError(false); setUserPaused(false); setShouldLoad(false); }, [videoUrl]);
  useEffect(() => {
    if (visible && autoplay && pageVisible && !userPaused) setShouldLoad(true);
  }, [visible, autoplay, pageVisible, userPaused]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.muted = true;
    if (visible && autoplay && pageVisible && shouldLoad && !userPaused && !hasError) {
      element.play().catch(() => setPlaying(false));
    } else { element.pause(); setPlaying(false); }
    return () => element.pause();
  }, [visible, autoplay, pageVisible, shouldLoad, userPaused, hasError, videoUrl]);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    if (!element.paused) { setUserPaused(true); element.pause(); setPlaying(false); }
    else {
      onRequestPlay?.();
      setUserPaused(false);
      setShouldLoad(true);
      if (hasError) { setHasError(false); element.load(); }
      if (element.src) element.play().catch(() => setPlaying(false));
    }
  };
  return <div ref={container} className={mode === 'detail'
    ? 'watch-product-video relative overflow-hidden bg-[#05160E] rounded-2xl aspect-[9/16] md:aspect-[3/4] lg:aspect-[4/5] max-h-[75vh] max-w-[450px] mx-auto shadow-2xl'
    : 'watch-product-video relative w-full overflow-hidden bg-[#05160E] aspect-[9/16]'}>
    <video key={videoUrl} ref={video} src={shouldLoad ? videoUrl : undefined} poster={visible ? cover : undefined} controls={false}
      muted loop playsInline autoPlay={visible && autoplay && pageVisible && !userPaused} preload="none"
      disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-label={productName || 'Product video'}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      onPlaying={() => { setPlaying(true); setHasFrame(true); setHasError(false); }} onPause={() => setPlaying(false)}
      onCanPlay={() => { if (visible && autoplay && pageVisible && !userPaused) video.current?.play().catch(() => setPlaying(false)); }}
      onError={() => { setHasError(true); setPlaying(false); }} />
    {thumbnail && (!hasFrame || hasError) && <img src={cover} onError={() => setCoverFailed(true)} alt={productName || 'Product video preview'} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}
    <button type="button" className="watch-video-toggle" onClick={toggle}
      aria-label={`${hasError ? 'Retry' : playing ? 'Pause' : 'Play'} ${productName || 'plant'} video`}>
      {playing ? <Pause aria-hidden="true" size={17} /> : <Play aria-hidden="true" size={17} />}
    </button>
    {hasError && <span role="status" className="watch-video-status">Tap play to try again</span>}
  </div>;
});
WatchAndShopVideo.displayName = 'WatchAndShopVideo';
