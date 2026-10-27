import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const sparkles = [[12, 17], [35, 10], [69, 26], [94, 45], [84, 83], [43, 91], [11, 57], [58, 80]];
const particles = Array.from({ length: 24 }, (_, index) => {
  const angle = index / 24 * Math.PI * 2;
  return [50 + 44 * Math.cos(angle), 53 + 39 * Math.sin(angle)];
});

export default function DiwaliWelcome() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!ready) return;
    // Remove every layer together exactly three seconds after the artwork loads.
    const timer = window.setTimeout(() => setFinished(true), 3000);
    return () => window.clearTimeout(timer);
  }, [ready]);
  useEffect(() => {
    if (!ready || finished) return;
    let resume = 0;
    const onScroll = () => {
      if (!root.current?.classList.contains('is-scrolling')) {
        root.current?.classList.add('is-scrolling');
        root.current?.querySelector('svg')?.pauseAnimations();
      }
      window.clearTimeout(resume);
      resume = window.setTimeout(() => {
        root.current?.classList.remove('is-scrolling');
        root.current?.querySelector('svg')?.unpauseAnimations();
      }, 140);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(resume);
    };
  }, [ready, finished]);

  if (!mounted || finished) return null;
  return createPortal(
    <div ref={root} className={`rastlina-diwali${ready ? ' is-ready' : ''}`} role="status" aria-label={ready ? 'Happy Diwali from Rastlina' : undefined}>
      <style>{`
        .rastlina-diwali{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;pointer-events:none;background:none;opacity:0}
        .rastlina-diwali.is-ready{opacity:1;animation:rastlina-diwali-fade 3s steps(1,end) both}
        .rastlina-diwali-art{position:relative;width:min(86vw,800px,125vh);line-height:0;contain:layout style;isolation:isolate}
        .rastlina-diwali.is-ready .rastlina-diwali-art{animation:rastlina-diwali-enter .65s cubic-bezier(.22,.72,.28,1) both}
        .rastlina-diwali-art img{display:block;width:100%;height:auto;max-width:none}
        .rastlina-diwali-shine{position:absolute;inset:0;mask-image:var(--rastlina-diwali-mask);-webkit-mask-image:var(--rastlina-diwali-mask);mask-size:contain;-webkit-mask-size:contain;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:center;-webkit-mask-position:center;overflow:hidden}
        .rastlina-diwali-beam{position:absolute;left:-40%;top:0;width:35%;height:100%;background:linear-gradient(90deg,transparent,#ffe49626 32%,#fffdf0cc 50%,#ffe49626 68%,transparent);opacity:0}
        .rastlina-diwali.is-ready .rastlina-diwali-beam{animation:rastlina-diwali-sweep .95s linear .65s both}
        .rastlina-diwali-opening{position:absolute;left:50%;top:50%;width:18%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#fffbea 0%,#ffe29a88 10%,#f8c65b22 35%,transparent 68%);opacity:0;transform:translate(-50%,-50%)}
        .rastlina-diwali.is-ready .rastlina-diwali-opening{animation:rastlina-diwali-opening .65s ease-out both}
        .rastlina-diwali-orbits{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
        .rastlina-diwali-glint{position:absolute;display:block;width:7%;aspect-ratio:1;opacity:0;pointer-events:none}
        .rastlina-diwali.is-ready .rastlina-diwali-glint{animation:rastlina-diwali-glint 1.25s ease-in-out infinite}
        .rastlina-diwali-glint:before,.rastlina-diwali-glint:after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse,#fffef0 0%,#fff2ad 8%,#ffd15e99 25%,transparent 68%)}
        .rastlina-diwali-glint:before{transform:scaleX(.12)}
        .rastlina-diwali-glint:after{transform:scaleY(.12)}
        .rastlina-diwali-dust{position:absolute;width:.35%;aspect-ratio:1;border-radius:50%;background:#fff3bd;box-shadow:0 0 4px 1px #ffbd48;opacity:0}
        .rastlina-diwali.is-ready .rastlina-diwali-dust{animation:rastlina-diwali-drift 1.7s ease-out infinite}
        @keyframes rastlina-diwali-enter{from{clip-path:circle(0% at 50% 50%)}to{clip-path:circle(90% at 50% 50%)}}
        @keyframes rastlina-diwali-sweep{0%{opacity:0;transform:translate3d(0,0,0)}12%,88%{opacity:.85}100%{opacity:0;transform:translate3d(520%,0,0)}}
        @keyframes rastlina-diwali-opening{0%{opacity:0;transform:translate(-50%,-50%) scale(.1)}18%{opacity:.85}65%{opacity:.16}100%{opacity:0;transform:translate(-50%,-50%) scale(5.5)}}
        @keyframes rastlina-diwali-fade{from{opacity:1}to{opacity:0}}
        @keyframes rastlina-diwali-glint{0%,100%{opacity:.05;transform:scale(.35) rotate(-12deg)}45%{opacity:1;transform:scale(1) rotate(0deg)}75%{opacity:.2;transform:scale(.5) rotate(10deg)}}
        @keyframes rastlina-diwali-drift{0%{opacity:0;transform:translate3d(0,4px,0) scale(.5)}30%{opacity:1}100%{opacity:0;transform:translate3d(8px,-14px,0) scale(.2)}}
        .rastlina-diwali.is-scrolling .rastlina-diwali-orbits,.rastlina-diwali.is-scrolling .rastlina-diwali-shine,.rastlina-diwali.is-scrolling .rastlina-diwali-dust{visibility:hidden}
        .rastlina-diwali.is-scrolling .rastlina-diwali-beam,.rastlina-diwali.is-scrolling .rastlina-diwali-dust,.rastlina-diwali.is-scrolling .rastlina-diwali-glint{animation-play-state:paused}
        @media(max-width:600px){.rastlina-diwali-dust{display:none}}
        @media(prefers-reduced-motion:reduce){.rastlina-diwali.is-ready .rastlina-diwali-art,.rastlina-diwali.is-ready .rastlina-diwali-glint,.rastlina-diwali.is-ready .rastlina-diwali-dust,.rastlina-diwali.is-ready .rastlina-diwali-beam,.rastlina-diwali.is-ready .rastlina-diwali-opening{animation:none}.rastlina-diwali-orbits{display:none}}
      `}</style>
      <div className="rastlina-diwali-art">
        <img src="/diwali-welcome.webp" srcSet="/diwali-welcome-640.webp 640w, /diwali-welcome-960.webp 960w, /diwali-welcome.webp 1735w" sizes="(max-width:930px) 86vw, 800px" alt="" width="1735" height="906" loading="eager" decoding="async" onLoad={event => {
          root.current?.style.setProperty('--rastlina-diwali-mask', `url("${event.currentTarget.currentSrc}")`);
          setReady(true);
        }} onError={() => setFinished(true)} />
        <span className="rastlina-diwali-shine" aria-hidden="true"><span className="rastlina-diwali-beam" /></span>
        {ready && <svg className="rastlina-diwali-orbits" viewBox="0 0 1000 522" aria-hidden="true" focusable="false">
          <defs><radialGradient id="rastlina-diwali-halo"><stop offset="0" stopColor="#fffdf3" /><stop offset=".3" stopColor="#ffe6a1" stopOpacity=".8" /><stop offset="1" stopColor="#ffc543" stopOpacity="0" /></radialGradient></defs>
          <g><animateMotion dur="1.55s" repeatCount="indefinite" path="M80 270 C80 70 350 35 500 55 C750 25 950 150 920 270 C910 440 680 480 500 465 C250 490 80 420 80 270Z" /><circle r="23" fill="url(#rastlina-diwali-halo)" /><path d="M0-16 3-3 16 0 3 3 0 16-3 3-16 0-3-3Z" fill="#fff8d4" /></g>
          <g><animateMotion dur="1.85s" repeatCount="indefinite" path="M920 270 C950 140 750 30 500 55 C300 35 80 100 80 270 C80 440 320 485 500 465 C710 490 920 420 920 270Z" /><circle r="19" fill="url(#rastlina-diwali-halo)" /><path d="M0-12 2-2 12 0 2 2 0 12-2 2-12 0-2-2Z" fill="#fffdf0" /></g>
        </svg>}
        {sparkles.map(([left, top], index) => <span key={index} aria-hidden="true" className="rastlina-diwali-glint" style={{ left: `${left - 3.5}%`, top: `${top - 6.7}%`, animationDelay: `${-index * .21}s` }} />)}
        {particles.map(([left, top], index) => <span key={index} aria-hidden="true" className="rastlina-diwali-dust" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${-index * .13}s` }} />)}
        <span className="rastlina-diwali-opening" aria-hidden="true" />
      </div>
    </div>, document.body,
  );
}
